// 12-cloud.js — L'Odyssée des Chiffres
// ═══════════════════════════════════════════════════════
// CHANTIER : Synchronisation cloud (Cloudflare Worker + KV)
// ═══════════════════════════════════════════════════════
// Permet de retrouver son profil depuis n'importe quel appareil grâce à un
// code joueur unique (ex: SOREN-7B4K9X).
//
// Architecture :
//   - Code joueur stocké dans P.cloudCode (généré 1x par profil, immuable)
//   - Statut activé dans P.cloudEnabled (bool, par défaut false = opt-in)
//   - Sync auto toutes les 5 min + à chaque saveProfileNow() si activée
//   - Stratégie de conflit : le profil avec le plus d'XP gagne (côté serveur)
//
'use strict';

// ═══════════════════════════════════════════════════════
// DIAGNOSTIC À L'ÉCRAN (v8.6.6)
// Capture les étapes clés de la sync dans sessionStorage pour
// pouvoir les afficher dans une boîte copiable sur le téléphone
// (pas besoin de console PC / câble USB).
// ═══════════════════════════════════════════════════════
function _diagLog(msg){
 try{
  const ts = new Date().toLocaleTimeString('fr-FR');
  const line = `[${ts}] ${msg}`;
  console.log(line);
  let buf = [];
  try{ buf = JSON.parse(sessionStorage.getItem('_syncDiag') || '[]'); }catch(e){}
  buf.push(line);
  // Garder les 60 dernières lignes max
  if(buf.length > 60) buf = buf.slice(-60);
  sessionStorage.setItem('_syncDiag', JSON.stringify(buf));
 }catch(e){}
}
function getSyncDiag(){
 try{ return (JSON.parse(sessionStorage.getItem('_syncDiag')||'[]')).join('\n'); }
 catch(e){ return '(aucun diagnostic)'; }
}
function clearSyncDiag(){
 try{ sessionStorage.removeItem('_syncDiag'); }catch(e){}
}

// ══════════════ CONFIGURATION ══════════════
const CLOUD_API = 'https://odyssee-sync.air7841.workers.dev';
const CLOUD_SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 min
const CLOUD_REQUEST_TIMEOUT_MS = 8000;        // 8 sec timeout
const CLOUD_VERBOSE = false; // mettre true pour debug
// Audit performances #3 : fenêtre de regroupement (debounce) des pushs
// déclenchés par syncCloudOnEndGame() — voir plus bas. Plusieurs parties
// terminées coup sur coup (ex. 5 parties en 10 minutes) ne déclenchent alors
// qu'un seul envoi cloud au lieu d'un par partie, réduisant la fréquence
// réelle d'écriture KV (quota gratuit : 1000 écritures/jour, partagées sur
// tout le compte Cloudflare).
const CLOUD_ENDGAME_DEBOUNCE_MS = 5000;

// ══════════════ ÉTAT EN MÉMOIRE ══════════════
let _cloudSyncTimer = null;
let _cloudEndgameDebounceTimer = null;
let _cloudInflight = false;     // évite les syncs simultanées
let _cloudLastSync = 0;          // timestamp du dernier sync réussi
let _cloudLastError = null;      // dernière erreur (pour UI)

// ══════════════ HELPERS ══════════════
function _cloudLog(...args){ if(CLOUD_VERBOSE) console.log('[cloud]', ...args); }
function _cloudWarn(...args){ console.warn('[cloud]', ...args); }

// Génère un code joueur de la forme NOM-XXXXXX (6 caractères alphanumériques aléatoires)
function generateCloudCode(name){
 const safe = (name || 'PLAYER').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) || 'PLAYER';
 const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans 0/O/I/1 pour lisibilité
 let suffix = '';
 // Utilise crypto.getRandomValues si dispo (sinon fallback Math.random)
 if (typeof crypto !== 'undefined' && crypto.getRandomValues){
  const arr = new Uint8Array(6);
  crypto.getRandomValues(arr);
  for(const b of arr) suffix += chars[b % chars.length];
 } else {
  for(let i=0;i<6;i++) suffix += chars[Math.floor(Math.random() * chars.length)];
 }
 return `${safe}-${suffix}`;
}

// Validation côté client (cohérent avec le worker)
function isValidCloudCode(code){
 return typeof code === 'string'
  && code.length >= 4 && code.length <= 40
  && /^[A-Z0-9-]+$/i.test(code);
}

// fetch avec timeout (évite que la sync bloque longtemps en cas de réseau lent)
async function _cloudFetch(url, opts={}){
 const ctrl = new AbortController();
 const tid = setTimeout(() => ctrl.abort(), CLOUD_REQUEST_TIMEOUT_MS);
 try{
  return await fetch(url, { ...opts, signal: ctrl.signal });
 } finally {
  clearTimeout(tid);
 }
}

// ══════════════ INITIALISATION DU CODE ══════════════
// Appelée à la création de profil ou à la 1ère ouverture après MAJ.
// Ne fait que générer le code (silencieusement). N'envoie RIEN au cloud.
function ensureCloudCode(profile){
 if(!profile) return null;
 if(!profile.cloudCode){
  profile.cloudCode = generateCloudCode(profile.name);
  if(typeof profile.cloudEnabled === 'undefined') profile.cloudEnabled = false;
  _cloudLog('code généré pour', profile.name, '→', profile.cloudCode);
 }
 return profile.cloudCode;
}

// ══════════════ ACTIVATION / DÉSACTIVATION ══════════════
async function enableCloudSync(){
 if(!P){ if(typeof toast==='function') toast('⚠️ Aucun profil actif',2500); return false; }
 ensureCloudCode(P);
 P.cloudEnabled = true;
 if(typeof saveProfileNow==='function') saveProfileNow();
 // Premier upload immédiat
 const ok = await pushProfileToCloud(true);
 if(ok){
  if(typeof toast==='function') toast('☁️ Sauvegarde cloud activée !',2500);
  scheduleCloudSync();
 }
 return ok;
}

function disableCloudSync(){
 if(!P) return;
 P.cloudEnabled = false;
 if(typeof saveProfileNow==='function') saveProfileNow();
 cancelCloudSync();
 if(typeof toast==='function') toast('☁️ Sauvegarde cloud désactivée',2500);
}

// ══════════════ UPLOAD DU PROFIL VERS LE CLOUD ══════════════
// v12.7.22 (bug signalé par Cyril : suppression de figurine non propagée à
// un autre appareil) : pushProfileToCloud() est câblée exclusivement sur P
// (le profil ACTIF). Une action de la Vue Parent (ex. parentRemoveFigurines,
// 10-figurines.js) peut cibler un enfant qui n'est PAS le profil actif sur
// l'appareil utilisé par le parent — dans ce cas, pushProfileToCloud() ne
// peut rien faire, et le changement restait bloqué en local jusqu'à ce que
// ce profil redevienne actif sur CET appareil (ce qui peut ne jamais
// arriver si le parent gère depuis un appareil que l'enfant n'utilise pas).
// Cette fonction reproduit le même principe pull+fusion+push que
// pushProfileToCloud(), mais pour un profil quelconque passé en paramètre,
// sans jamais toucher à P ni aux fonctions d'UI (renderMap, updateMenuUI…)
// qui n'ont pas de sens pour un profil qui n'est pas affiché à l'écran.
async function _pushOtherProfileToCloud(profileData){
 if(!profileData || !profileData.name || !profileData.cloudCode || !profileData.cloudEnabled) return false;
 try{
  let merged = profileData;
  try{
   const pulled = await pullProfileFromCloud(profileData.cloudCode);
   if(pulled.ok && pulled.profile){
    let imported = pulled.profile;
    if(typeof migrateProfile==='function') imported = migrateProfile(imported);
    if(typeof validateProfile==='function') imported = validateProfile(imported, profileData.name, {allowStarsMigration:false});
    merged = _mergeCloudProfiles(profileData, imported);
    merged.cloudCode = profileData.cloudCode;
    merged.cloudEnabled = profileData.cloudEnabled;
    localStorage.setItem('user_'+profileData.name, JSON.stringify(merged));
   }
  }catch(e){ _cloudLog('_pushOtherProfileToCloud: pull échoué (best-effort), poursuite avec push direct :', e); }

  const code = encodeURIComponent(merged.cloudCode);
  const payload = { ...merged };
  delete payload._syncedAt;
  const resp = await _cloudFetch(`${CLOUD_API}/profile/${code}`, {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify(payload),
  });
  if(!resp.ok) return false;
  const result = await resp.json();
  if(result.status === 'conflict_kept_server' && result.profile){
   // Le serveur a une version plus avancée que celle qu'on vient de fusionner
   // et pousser : on la garde en local plutôt que d'insister.
   let imported = result.profile;
   if(typeof migrateProfile==='function') imported = migrateProfile(imported);
   if(typeof validateProfile==='function') imported = validateProfile(imported, profileData.name, {allowStarsMigration:false});
   localStorage.setItem('user_'+profileData.name, JSON.stringify(imported));
  }
  return true;
 }catch(e){ _cloudLog('_pushOtherProfileToCloud: échec :', e); return false; }
}

async function pushProfileToCloud(forceFirst=false){
 if(!P || !P.cloudCode) return false;
 if(!forceFirst && !P.cloudEnabled) return false;
 if(_cloudInflight){ _cloudLog('sync déjà en cours, skip'); return false; }
 _cloudInflight = true;
 try{
  // v12.4.56 (ADR-99) : pull + fusion AVANT le push, plutôt qu'un push
  // aveugle. Sans ça, la synchronisation de routine (scheduleCloudSync,
  // toutes les CLOUD_SYNC_INTERVAL_MS) ne consultait JAMAIS le cloud —
  // seulement y déposer sa propre copie locale à chaque fois. Deux
  // appareils du même profil pouvaient donc diverger durablement (pas
  // seulement pour un reset — le cas général de deux appareils qui
  // progressent chacun de leur côté sans jamais se réconcilier tant
  // qu'aucun conflit serveur n'est détecté). Réutilise
  // _importProfileFromServer(), déjà éprouvée par le chemin de conflit
  // ci-dessous, pour fusionner (via _mergeCloudProfiles, ADR-98) et
  // appliquer le résultat à P avant de préparer le payload à pousser.
  // Best-effort : si le pull échoue (hors ligne, aucun profil serveur
  // encore au tout premier push...), on retombe silencieusement sur le
  // push direct de P — ne doit jamais bloquer la sauvegarde locale->cloud.
  try{
   const pulled = await pullProfileFromCloud(P.cloudCode);
   if(pulled.ok && pulled.profile){
    await _importProfileFromServer(pulled.profile);
   }
  }catch(e){ _cloudLog('pull avant push échoué (best-effort), poursuite avec push direct :', e); }

  const code = encodeURIComponent(P.cloudCode);
  // On clone P (déjà fusionné ci-dessus le cas échéant) pour ne pas envoyer
  // la propriété _syncedAt côté client
  const payload = { ...P };
  delete payload._syncedAt;
  if(typeof chatExportFor==='function'){ const _c = chatExportFor(P.name); if(_c) payload._chat = _c; }
  const resp = await _cloudFetch(`${CLOUD_API}/profile/${code}`, {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify(payload),
  });
  if(!resp.ok){
   _cloudLastError = `HTTP ${resp.status}`;
   _cloudWarn('upload échec :', resp.status);
   return false;
  }
  const result = await resp.json();
  if(result.status === 'conflict_kept_server' && result.profile){
   // Le serveur a une version plus avancée : on l'importe
   _cloudLog('conflit détecté, import du profil serveur');
   await _importProfileFromServer(result.profile);
   if(typeof toast==='function') toast('☁️ Profil cloud plus avancé, restauré',3000);
  }
  _cloudLastSync = Date.now();
  _cloudLastError = null;
  _cloudLog('sync OK à', new Date(_cloudLastSync).toISOString());
  if(typeof refreshCloudIndicator==='function') refreshCloudIndicator();
  return true;
 } catch(e){
  _cloudLastError = e.message || 'erreur réseau';
  _cloudWarn('upload erreur :', e);
  return false;
 } finally {
  _cloudInflight = false;
 }
}

// ══════════════ DOWNLOAD DU PROFIL DEPUIS LE CLOUD ══════════════
// Utilisé pour la restauration "j'ai déjà un code"
async function pullProfileFromCloud(code){
 if(!isValidCloudCode(code)){
  return { ok:false, error:'invalid_code' };
 }
 const url = `${CLOUD_API}/profile/${encodeURIComponent(code)}`;
 try{
  if(typeof _diagLog==='function') _diagLog('PULL: GET '+url);
  const resp = await _cloudFetch(url, { method: 'GET' });
  if(typeof _diagLog==='function') _diagLog('PULL: réponse HTTP '+resp.status);
  if(resp.status === 404){
   return { ok:false, error:'not_found' };
  }
  if(!resp.ok){
   return { ok:false, error:`HTTP ${resp.status}` };
  }
  const profile = await resp.json();
  if(typeof _diagLog==='function') _diagLog('PULL: JSON reçu, name='+(profile&&profile.name)+' xp='+(profile&&profile.xp));
  return { ok:true, profile };
 } catch(e){
  if(typeof _diagLog==='function') _diagLog('PULL: EXCEPTION '+(e.name||'')+' '+(e.message||'network_error'));
  return { ok:false, error: e.message || 'network_error' };
 }
}

// Audit fonctionnel (#2) : fusion non destructive entre le profil local et le
// profil serveur, au lieu d'un écrasement complet. Sans historique de sync commun,
// on ne peut pas faire un vrai merge 3-way ; on prend donc le MAX pour les compteurs
// (jamais de somme, pour éviter de gonfler artificiellement des stats) et l'UNION
// pour les collections (figurines, badges, boss battus…). Le reste (prefs, thème…)
// vient du profil "gagnant" (imported), comme avant.
function _mergeCloudProfiles(local, imported){
 if(!local) return imported;
 const out = Object.assign({}, imported);
 const uniq = (a,b)=>[...new Set([...(a||[]),...(b||[])])];
 const maxN = (a,b)=>Math.max(a||0, b||0);

 // v12.4.55 (ADR-97, Option B — correctif du reset Odyssée non propagé) :
 // resetAdventure() marque désormais data.adventureResetAt = Date.now().
 // SANS ce marqueur, la fusion par défaut (union des zones vaincues, max des
 // étapes, et — pour tous les autres champs d'Odyssée — la simple valeur du
 // côté "imported") réinjecte silencieusement l'ancienne progression d'un
 // appareil qui n'a pas encore vu le reset (c'était le bug signalé par
 // Cyril). AVEC le marqueur : le côté au reset le PLUS RÉCENT devient
 // autoritaire pour l'ensemble des champs de progression d'Odyssée — plus
 // d'union, une préférence explicite. Rétrocompatible par construction : un
 // profil jamais reseté (adventureResetAt absent des deux côtés, donc 0=0,
 // resetWinner=null) suit exactement l'ancien comportement, inchangé au
 // caractère près pour tout profil existant.
 const localResetAt = local.adventureResetAt || 0;
 const importedResetAt = imported.adventureResetAt || 0;
 const resetWinner = localResetAt > importedResetAt ? 'local' : (importedResetAt > localResetAt ? 'imported' : null);
 out.adventureResetAt = maxN(localResetAt, importedResetAt);
 // Champs de progression d'Odyssée qui prennent déjà la valeur "imported"
 // par défaut (via Object.assign ci-dessus) — seul le cas resetWinner==='local'
 // nécessite une correction explicite (sinon la valeur locale, plus récente,
 // serait perdue au profit de l'ancienne valeur importée).
 const ODYSSEY_PROGRESS_FIELDS = [
  'mapAvatarZone', 'mapAvatarZoneByAdv', 'storySeen', 'storyPageIdx',
  'majorChoiceByAdv', 'twistLinesUsedByAdv', '_epilogueBonusCredited',
  'journalEntriesByAdv', 'lastTwistLineByAdv',
  'talismanRevealShown', 'rainbowRevealShown', 'bookRevealShown',
  'badgeRevealShown', 'armorRevealShown', 'libraryRevealShown', 'histLibraryRevealShown',
  // v12.5.0 (session 21, ADR-112) : fragments de lore hors-combat trouvés,
  // par Odyssée — ajouté ici dès sa création (règle ADR-111 pt.3), jamais
  // laissé fusionner par défaut.
  'loreFoundIdsByAdv',
  // v12.7.0 (ADR-113) : trait de héros, désormais propre à chaque Odyssée —
  // même vigilance, ajouté dès sa création.
  'heroTraitApprocheByAdv', 'heroTraitMoteurByAdv', 'heroTraitStyleByAdv',
  // v12.7.9 : suivi des notifications "nouveau contenu" déjà vues — même
  // vigilance, ajouté dès sa création (règle ADR-111 pt.3).
  'contentUpdatesSeen',
  // v12.7.15 (correctif dette technique, signalé par Cyril) : suivi des
  // îlots déjà récompensés par le bonus "Conquérant" — même vigilance,
  // ajouté dès sa création. Concerné par un reset d'Odyssée (resetAdventure(),
  // 10-figurines.js) au même titre que _epilogueBonusCredited ci-dessus.
  'islandVictoryCreditedByAdv',
  // v12.7.29 : dernier jour de visite par Odyssée (fenêtre de récap) — même
  // vigilance, ajouté dès sa création (règle ADR-111 pt.3).
  'lastAdvVisitDayByAdv',
 ];
 if(resetWinner === 'local'){
  ODYSSEY_PROGRESS_FIELDS.forEach(f => { out[f] = local[f]; });
 } else if(!resetWinner){
  // v12.4.67 (correctif race cloud, signalé par Cyril) : fusion fine plutôt
  // que "imported gagne" par défaut (comportement précédent de out, hérité
  // du Object.assign initial). Sans ça, TOUTE synchronisation de routine —
  // déclenchée après CHAQUE partie via syncCloudOnEndGame(), donc toutes les
  // 15-40s en jeu actif — pouvait silencieusement effacer un contenu
  // narratif tout juste vu localement (storySeen), simplement parce que le
  // serveur n'avait pas encore reçu la dernière progression au moment du
  // pull. Pire : si la carte est affichée, _importProfileFromServer()
  // redessine immédiatement avec la position ainsi "périmée" — d'où
  // l'avatar systématiquement reprojeté en arrière et le prologue/les
  // chapitres qui semblaient réapparaître "à chaque nouveau lieu".
  out.storySeen = uniq(local.storySeen, imported.storySeen);
  // v12.7.9 : même logique que storySeen — une notification vue sur un
  // appareil doit rester vue partout, jamais réapparaître après une fusion.
  out.contentUpdatesSeen = uniq(local.contentUpdatesSeen, imported.contentUpdatesSeen);
  out._epilogueBonusCredited = uniq(local._epilogueBonusCredited, imported._epilogueBonusCredited);
  ['talismanRevealShown','rainbowRevealShown','bookRevealShown','badgeRevealShown','armorRevealShown','libraryRevealShown','histLibraryRevealShown']
   .forEach(f => { out[f] = !!(local[f] || imported[f]); });
  ['majorChoiceByAdv','twistLinesUsedByAdv','lastTwistLineByAdv','journalEntriesByAdv',
   'heroTraitApprocheByAdv','heroTraitMoteurByAdv','heroTraitStyleByAdv','lastAdvVisitDayByAdv']
   .forEach(f => { out[f] = Object.assign({}, imported[f]||{}, local[f]||{}); });
  // v12.5.0 (ADR-112) : loreFoundIdsByAdv est une liste cumulative "trouvé"
  // (comme storySeen), mais scindée par advKey — chaque clé doit donc être
  // UNIONNÉE, pas juste préférée d'un côté (Object.assign superficiel
  // écraserait entièrement la liste d'un côté au lieu de fusionner les ids).
  out.loreFoundIdsByAdv = (function(){
   const res = {};
   const keys = new Set([...Object.keys(local.loreFoundIdsByAdv||{}), ...Object.keys(imported.loreFoundIdsByAdv||{})]);
   keys.forEach(k=>{
    res[k] = uniq((local.loreFoundIdsByAdv||{})[k], (imported.loreFoundIdsByAdv||{})[k]);
   });
   return res;
  })();
  // v12.7.15 : même traitement que loreFoundIdsByAdv juste au-dessus — un
  // îlot déjà célébré sur UN appareil doit le rester partout, jamais permettre
  // un second crédit du bonus après fusion.
  out.islandVictoryCreditedByAdv = (function(){
   const res = {};
   const keys = new Set([...Object.keys(local.islandVictoryCreditedByAdv||{}), ...Object.keys(imported.islandVictoryCreditedByAdv||{})]);
   keys.forEach(k=>{
    res[k] = uniq((local.islandVictoryCreditedByAdv||{})[k], (imported.islandVictoryCreditedByAdv||{})[k]);
   });
   return res;
  })();
  // Position de l'avatar / page d'histoire en cours : l'appareil actif
  // (local, celui qui joue MAINTENANT) est le plus légitime pour dire où on
  // en est, plutôt qu'un serveur qui n'a pas forcément encore reçu le tout
  // dernier déplacement.
  out.mapAvatarZone = local.mapAvatarZone || imported.mapAvatarZone;
  out.mapAvatarZoneByAdv = Object.assign({}, imported.mapAvatarZoneByAdv||{}, local.mapAvatarZoneByAdv||{});
  out.storyPageIdx = local.storyPageIdx;
 }
 // resetWinner === 'imported' : rien à faire, out (copie d'imported) est déjà correct par défaut.

 // v12.7.14 (signalé par Cyril, captures à l'appui) : marqueurs "vu au moins
 // une fois" (visites guidées 19-onboarding.js) et stade du héros — jamais
 // réinitialisés par resetAdventure(), donc traités ICI, hors du bloc
 // resetWinner ci-dessus (qui ne s'applique qu'aux champs de progression
 // d'Odyssée). Sans ce traitement, ils prenaient silencieusement la valeur
 // "imported" à CHAQUE synchronisation de routine (même classe de bug que
 // storySeen/contentUpdatesSeen documentée plus haut) : si le serveur
 // n'avait pas encore reçu le marqueur tout juste posé localement, il
 // revenait en arrière au pull suivant — la visite guidée de la carte et
 // l'animation d'évolution de héros ("ÉVOLUTION ! APPRENTI"...) semblaient
 // alors réapparaître indéfiniment, à chaque retour dans l'Odyssée.
 out.onbAccountSeen = !!(local.onbAccountSeen || imported.onbAccountSeen);
 out.onbMapSeen = !!(local.onbMapSeen || imported.onbMapSeen);
 // v12.7.30 (dette technique corrigée) : le rang n'est plus une table
 // dupliquée ici mais dérivé de HERO_STAGES (02-data.js, chargé avant ce
 // fichier) — un stade ajouté/retiré/réordonné dans HERO_STAGES ne peut
 // plus jamais désynchroniser la logique de cliquet ci-dessous, contrairement
 // à l'ancienne table _HERO_STAGE_RANK maintenue séparément à la main.
 const _stageRankOf = id => {
  const i = (typeof HERO_STAGES!=='undefined' && Array.isArray(HERO_STAGES)) ? HERO_STAGES.findIndex(s=>s.id===id) : -1;
  return i>=0 ? i : 0;
 };
 const _localStageRank = _stageRankOf(local.heroStageId);
 const _importedStageRank = _stageRankOf(imported.heroStageId);
 out.heroStageId = _localStageRank >= _importedStageRank ? (local.heroStageId || 'oeuf') : imported.heroStageId;
 // v12.7.15 (signalé par Cyril) : union — un palier déjà récompensé sur UN
 // appareil doit le rester partout, jamais permettre un second crédit du
 // bonus d'évolution après fusion.
 out.heroStageRewardsCredited = uniq(local.heroStageRewardsCredited, imported.heroStageRewardsCredited);

 // v12.7.19 (ajustement demandé par Cyril) : mécanisme à horodatage plutôt
 // qu'une liste plate figée — un rachat légitime posté APRÈS un retrait
 // doit l'emporter, pour que la figurine puisse être rachetée/regagnée
 // normalement ensuite. Seul un retrait plus RÉCENT que la dernière
 // (ré)acquisition exclut la figurine du résultat de la fusion.
 const _mergeMaxTs = (a,b)=>{
  const out = {};
  const keys = new Set([...Object.keys(a||{}), ...Object.keys(b||{})]);
  keys.forEach(k=>{ out[k] = Math.max((a||{})[k]||0, (b||{})[k]||0); });
  return out;
 };
 out.blockedFigurinesAt = _mergeMaxTs(local.blockedFigurinesAt, imported.blockedFigurinesAt);
 out.figAcquiredAt = _mergeMaxTs(local.figAcquiredAt, imported.figAcquiredAt);
 out.ownedFigurines = uniq(local.ownedFigurines, imported.ownedFigurines)
  .filter(id => {
   const blockedAt = out.blockedFigurinesAt[id];
   if(!blockedAt) return true;
   const acquiredAt = out.figAcquiredAt[id] || 0;
   return acquiredAt > blockedAt;
  });
 out.ownedSkins         = uniq(local.ownedSkins, imported.ownedSkins);
 out.ownedMusics        = uniq(local.ownedMusics, imported.ownedMusics);
 out.ownedSounds        = uniq(local.ownedSounds, imported.ownedSounds);
 out.badgesEarned       = uniq(local.badgesEarned, imported.badgesEarned);
 out.milestonesClaimed  = uniq(local.milestonesClaimed, imported.milestonesClaimed);
 // mapBossBeaten : union par défaut (comportement historique, inchangé si
 // aucun reset n'est en jeu) — SAUF si un reset marque un côté comme
 // autoritaire, auquel cas on prend directement sa valeur (jamais unionnée
 // avec l'autre, sinon l'ancienne progression reviendrait).
 out.mapBossBeaten = resetWinner
  ? (resetWinner === 'local' ? (local.mapBossBeaten||[]) : (imported.mapBossBeaten||[]))
  : uniq(local.mapBossBeaten, imported.mapBossBeaten);

 out.xp                = maxN(local.xp, imported.xp);
 // v12.7.21 (BUG CRITIQUE signalé par Cyril, captures à l'appui) : P.stars
 // était fusionné directement par un maximum ("out.stars = maxN(local.stars,
 // imported.stars)"). C'est correct pour un compteur qui ne fait qu'AUGMENTER
 // (xp, _bestCombo…), mais stars est une monnaie qui peut légitimement
 // DIMINUER (achat de figurine). Résultat : après un achat, fermer puis
 // rouvrir le jeu déclenchait une synchronisation qui ramenait le solde à
 // son maximum historique — remboursant l'achat, tout en gardant la
 // figurine. Recommençable à l'infini.
 // Corrigé en dérivant stars de deux compteurs qui ne font QUE augmenter,
 // eux fusionnables sans risque par un maximum : tout ce qui a jamais été
 // gagné (_totalStarsEarned, déjà alimenté à chaque source de gain — voir
 // les commentaires "v12.7.21" à chaque site de crédit) moins tout ce qui a
 // jamais été dépensé (_totalStarsSpent, alimenté par le point de dépense
 // unique spend(), 07-game.js).
 out._totalStarsEarned = maxN(local._totalStarsEarned, imported._totalStarsEarned);
 out._totalStarsSpent  = maxN(local._totalStarsSpent, imported._totalStarsSpent);
 out.stars             = Math.max(0, out._totalStarsEarned - out._totalStarsSpent);
 out._bestCombo        = maxN(local._bestCombo, imported._bestCombo);
 out.sessionMinutes    = maxN(local.sessionMinutes, imported.sessionMinutes);

 // levelWins / levelWinsBySubj : max par niveau (et par matière) — volontairement
 // JAMAIS affecté par un reset d'Odyssée (resetAdventure() les remet à 0
 // explicitement dans data, donc si le reset gagne, le "max" avec l'autre
 // côté à 0 donne déjà mécaniquement la bonne valeur — aucun cas particulier
 // nécessaire ici).
 out.levelWins = {};
 new Set([...Object.keys(local.levelWins||{}),...Object.keys(imported.levelWins||{})])
  .forEach(k=>{ out.levelWins[k]=maxN((local.levelWins||{})[k], (imported.levelWins||{})[k]); });
 out.levelWinsBySubj = {};
 new Set([...Object.keys(local.levelWinsBySubj||{}),...Object.keys(imported.levelWinsBySubj||{})])
  .forEach(s=>{
   out.levelWinsBySubj[s] = {};
   const ls=(local.levelWinsBySubj||{})[s]||{}, is=(imported.levelWinsBySubj||{})[s]||{};
   new Set([...Object.keys(ls),...Object.keys(is)]).forEach(k=>{ out.levelWinsBySubj[s][k]=maxN(ls[k], is[k]); });
  });

 // zoneProgress : max stepsCompleted par zone (comportement historique) —
 // sauf si un reset désigne un côté autoritaire, auquel cas on prend sa
 // valeur directement (jamais re-maximisée avec l'autre côté, plus ancien).
 if(resetWinner){
  out.zoneProgress = (resetWinner === 'local' ? local.zoneProgress : imported.zoneProgress) || {};
 } else {
  out.zoneProgress = {};
  new Set([...Object.keys(local.zoneProgress||{}),...Object.keys(imported.zoneProgress||{})])
   .forEach(z=>{
    const lz=(local.zoneProgress||{})[z]||{stepsCompleted:0,completed:false};
    const iz=(imported.zoneProgress||{})[z]||{stepsCompleted:0,completed:false};
    out.zoneProgress[z]={ stepsCompleted:maxN(lz.stepsCompleted, iz.stepsCompleted), completed: !!(lz.completed||iz.completed) };
   });
 }

 // opStats / opStatsFr / opStatsHist : max ok/fail par catégorie
 const mergeStatBlock=(la,ia)=>{
  const r={}; new Set([...Object.keys(la||{}),...Object.keys(ia||{})]).forEach(k=>{
   r[k]={ ok:maxN((la||{})[k]?.ok,(ia||{})[k]?.ok), fail:maxN((la||{})[k]?.fail,(ia||{})[k]?.fail) };
  });
  return r;
 };
 out.opStats     = mergeStatBlock(local.opStats, imported.opStats);
 out.opStatsFr   = mergeStatBlock(local.opStatsFr, imported.opStatsFr);
 out.opStatsHist = mergeStatBlock(local.opStatsHist, imported.opStatsHist);

 // history / historyDetailed : union dédupliquée (date+score+mode), triée, tronquée
 const mergeHist=(la,ia,max)=>{
  const seen=new Set(), r=[];
  [...(la||[]),...(ia||[])]
   .sort((a,b)=>(a.timestamp||0)-(b.timestamp||0))
   .forEach(e=>{ const k=(e.timestamp||0)+'|'+(e.score||0)+'|'+(e.mode||''); if(!seen.has(k)){seen.add(k);r.push(e);} });
  return r.slice(-max);
 };
 out.history         = mergeHist(local.history, imported.history, 50);
 out.historyDetailed = mergeHist(local.historyDetailed, imported.historyDetailed, 60);

 return out;
}

// Import d'un profil serveur dans le profil actif courant
async function _importProfileFromServer(serverProfile){
 if(!serverProfile || !serverProfile.name) return false;
 if(serverProfile._chat && typeof chatMergeFromCloud==='function') chatMergeFromCloud(serverProfile.name, serverProfile._chat);
 // Migration + validation (réutilise les fonctions de 05-profile.js)
 // v12.7.23 (bug critique corrigé) : {allowStarsMigration:false} — ce profil
 // "imported" vient du serveur, pas de l'appareil qui joue réellement ; s'il
 // n'a jamais été migré, on ne doit PAS inventer ici un nouveau plancher
 // _totalStarsEarned à partir de son solde brut (potentiellement périmé).
 // Voir validateProfile() (05-profile.js) pour le détail du bug.
 let imported = serverProfile;
 if(typeof migrateProfile==='function') imported = migrateProfile(imported);
 if(typeof validateProfile==='function'){
  imported = validateProfile(imported, serverProfile.name, {allowStarsMigration:false});
 }
 if(!imported) return false;
 // #2 : fusion non destructive au lieu d'un écrasement complet
 const merged = _mergeCloudProfiles(P, imported);
 // Préserver le code et le statut cloud du profil local
 merged.cloudCode = P.cloudCode;
 merged.cloudEnabled = P.cloudEnabled;
 // Remplace le profil en mémoire et sauvegarde local
 Object.assign(P, merged);
 if(P._chat) delete P._chat;
 if(typeof saveProfileNow==='function') saveProfileNow();
 try{ if(typeof updateMenuUI==='function') updateMenuUI(); }catch(e){}
 // v12.4.57 (confort, suite ADR-99) : si la carte Aventure est déjà affichée
 // au moment où une synchro en arrière-plan corrige les données (ex. reset
 // fait sur un autre appareil), la redessiner tout de suite plutôt que
 // d'attendre une prochaine navigation — sinon l'écran déjà à l'écran reste
 // périmé visuellement malgré une donnée déjà correcte en mémoire. Try/catch
 // séparé de updateMenuUI() ci-dessus : préoccupations indépendantes, un
 // échec de l'une ne doit jamais empêcher l'autre.
 try{
  if(typeof renderMap==='function' && document.getElementById('v-map') && !document.getElementById('v-map').classList.contains('hidden')){
   renderMap();
  }
 }catch(e){}
 return true;
}

// ══════════════ RESTAURATION COMPLÈTE PAR CODE ══════════════
// Permet à un nouvel appareil de récupérer un profil existant depuis son code.
// Crée un nouveau profil local sous le nom indiqué dans le profil cloud.
async function restoreProfileByCode(code){
 const result = await pullProfileFromCloud(code);
 if(!result.ok){
  return { ok:false, error: result.error };
 }
 const cloudProfile = result.profile;
 if(!cloudProfile.name){
  return { ok:false, error:'invalid_profile' };
 }
 if(cloudProfile._chat && typeof chatMergeFromCloud==='function') chatMergeFromCloud(cloudProfile.name, cloudProfile._chat);
 // Migration + validation
 let prof = cloudProfile;
 if(typeof migrateProfile==='function') prof = migrateProfile(prof);
 if(typeof validateProfile==='function') prof = validateProfile(prof, cloudProfile.name);
 if(!prof) return { ok:false, error:'invalid_profile' };
 // Active le cloud sync sur le profil restauré
 prof.cloudCode = code.toUpperCase();
 prof.cloudEnabled = true;
 if(prof._chat) delete prof._chat;
 // Sauvegarde locale
 try{
  localStorage.setItem('user_' + prof.name, JSON.stringify(prof));
 }catch(e){
  return { ok:false, error:'storage_full' };
 }
 // Ajouter le nom dans la liste des joueurs personnalisés s'il n'est ni prédéfini ni "Autre"
 try{
  if(prof.name && prof.name !== 'Autre' && typeof addToRoster === 'function'){
   addToRoster(prof.name); // profil synchronisé/restauré → visible dans le sélecteur
  }
 }catch(e){}
 return { ok:true, name: prof.name };
}

// ══════════════ RÉCUPÉRATION FORCÉE PAR CODE (v8.6.1) ══════════════
// Version SIMPLE et FIABLE de la restauration. Contrairement à
// restoreProfileByCode (qui peut entrer en conflit avec un profil local
// existant et la sync auto), cette fonction :
//   1. Télécharge le profil cloud par code (sans aucune condition)
//   2. ÉCRASE TOUT en local pour ce nom (supprime l'ancien d'abord)
//   3. Désactive la sync auto le temps de l'opération (anti re-push)
//   4. Force un rechargement complet de la page → état propre garanti
// C'est la solution recommandée à l'utilisateur pour fiabiliser le transfert.
async function forceRestoreFromCloud(code){
 _diagLog('FORCE-RESTORE début, code = '+code);
 if(!isValidCloudCode(code)){
  _diagLog('FORCE-RESTORE: code invalide (format)');
  return { ok:false, error:'invalid_code' };
 }
 // 1. Stopper toute sync auto pour éviter qu'un ancien profil local
 //    ne réécrase le cloud pendant l'opération.
 cancelCloudSync();
 _cloudInflight = true; // bloque tout push concurrent
 // v8.6.7 : VERROUILLER toute sauvegarde locale. Sans ça, un saveProfile()
 // différé (debounce 800ms) contenant l'ANCIEN profil en mémoire écrase
 // le profil cloud qu'on s'apprête à écrire, juste avant le reload.
 // C'était LA cause du bug (diagnostic : profil bien écrit puis ré-écrasé 7s après).
 if(typeof lockProfileSaves === 'function'){
  lockProfileSaves();
  _diagLog('FORCE-RESTORE: sauvegardes locales VERROUILLÉES (anti-écrasement)');
 } else {
  _diagLog('FORCE-RESTORE: ⚠️ lockProfileSaves indisponible (ancien 05-profile.js ?)');
 }

 // 2. Télécharger le profil cloud
 _diagLog('FORCE-RESTORE: téléchargement depuis '+CLOUD_API+'/profile/'+code);
 const result = await pullProfileFromCloud(code);
 _diagLog('FORCE-RESTORE: pull result = '+(result.ok ? 'OK' : 'ÉCHEC ('+result.error+')'));
 if(!result.ok){
  _cloudInflight = false;
  return { ok:false, error: result.error };
 }
 const cloudProfile = result.profile;
 if(!cloudProfile || !cloudProfile.name){
  _diagLog('FORCE-RESTORE: profil cloud INVALIDE (pas de .name) = '+JSON.stringify(cloudProfile).slice(0,120));
  _cloudInflight = false;
  return { ok:false, error:'invalid_profile' };
 }
 _diagLog('FORCE-RESTORE: profil reçu name='+cloudProfile.name+' xp='+cloudProfile.xp+' cloudCode='+cloudProfile.cloudCode);

 if(cloudProfile._chat && typeof chatMergeFromCloud==='function') chatMergeFromCloud(cloudProfile.name, cloudProfile._chat);
 // 3. Migration + validation
 let prof = cloudProfile;
 if(typeof migrateProfile==='function') prof = migrateProfile(prof);
 if(typeof validateProfile==='function') prof = validateProfile(prof, cloudProfile.name);
 if(!prof){
  _diagLog('FORCE-RESTORE: validation a retourné NULL → échec');
  _cloudInflight = false;
  return { ok:false, error:'invalid_profile' };
 }
 _diagLog('FORCE-RESTORE: après validation name='+prof.name+' xp='+prof.xp);

 // 4. Forcer le code + activer cloud
 prof.cloudCode = code.toUpperCase();
 prof.cloudEnabled = true;

 // 5. ÉCRASER en local SANS CONDITION : on supprime d'abord
 //    l'ancien profil de ce nom (qui pourrait avoir un autre code).
 try{
  if(prof._chat) delete prof._chat;
  localStorage.removeItem('user_' + prof.name);
  localStorage.setItem('user_' + prof.name, JSON.stringify(prof));
 }catch(e){
  _diagLog('FORCE-RESTORE: ERREUR écriture localStorage: '+e.message);
  _cloudInflight = false;
  return { ok:false, error:'storage_full' };
 }

 // 6. Définir ce profil comme profil actif (lastPlayer)
 try{
  localStorage.setItem('lastPlayer', prof.name);
 }catch(e){}

 // 7. Ajouter le nom à la liste des joueurs si custom
 try{
  if(prof.name && prof.name !== 'Autre' && typeof addToRoster === 'function'){
   addToRoster(prof.name); // profil synchronisé/restauré → visible dans le sélecteur
  }
 }catch(e){}

 // 8. Succès → on signale qu'un reload est nécessaire pour un état 100% propre
 _diagLog('FORCE-RESTORE: ✅ écrit dans user_'+prof.name+', lastPlayer='+prof.name);
 // Vérification : relire ce qu'on vient d'écrire
 try{
  const check = JSON.parse(localStorage.getItem('user_'+prof.name)||'null');
  _diagLog('FORCE-RESTORE: vérif relecture name='+(check?check.name:'NULL')+' xp='+(check?check.xp:'?')+' cloudCode='+(check?check.cloudCode:'?')+' cloudEnabled='+(check?check.cloudEnabled:'?'));
 }catch(e){ _diagLog('FORCE-RESTORE: vérif relecture ÉCHEC '+e.message); }
 return { ok:true, name: prof.name, reload:true };
}

// ══════════════ TIMER DE SYNC AUTO TOUTES LES 5 MIN ══════════════
function scheduleCloudSync(){
 cancelCloudSync();
 if(!P || !P.cloudEnabled) return;
 _cloudSyncTimer = setInterval(() => {
  if(P && P.cloudEnabled){
   pushProfileToCloud();
  }
 }, CLOUD_SYNC_INTERVAL_MS);
 _cloudLog('sync timer planifié toutes les', CLOUD_SYNC_INTERVAL_MS/1000, 'sec');
}

function cancelCloudSync(){
 if(_cloudSyncTimer){
  clearInterval(_cloudSyncTimer);
  _cloudSyncTimer = null;
 }
 clearTimeout(_cloudEndgameDebounceTimer);
}

// ══════════════ STATUT POUR L'UI ══════════════
function getCloudStatus(){
 if(!P) return { active:false, code:null, enabled:false, lastSync:0 };
 return {
  active: !!P.cloudEnabled,
  code: P.cloudCode || null,
  enabled: !!P.cloudEnabled,
  lastSync: _cloudLastSync,
  lastError: _cloudLastError,
  inflight: _cloudInflight,
 };
}

// ══════════════ INIT AU CHARGEMENT ══════════════
// Appelée par 11-init.js après que le profil soit chargé.
function initCloudSync(){
 if(!P) return;
 // Génère le code silencieusement s'il n'existe pas (Décision 1 : option C)
 ensureCloudCode(P);
 if(typeof saveProfileNow==='function') saveProfileNow();
 // Si déjà activé, on relance le timer
 if(P.cloudEnabled){
  scheduleCloudSync();
  // Sync initial 3 sec après chargement (laisse le temps à l'UI de se monter)
  setTimeout(() => pushProfileToCloud(), 3000);
 }
 // Indicateur de statut (déclenché légèrement plus tard pour ne pas
 // surcharger le boot)
 setTimeout(() => refreshCloudIndicator(), 1500);
}

// ══════════════ HOOK DE FIN DE PARTIE ══════════════
// À appeler après chaque saveProfileNow() de fin de partie pour pousser au cloud.
function syncCloudOnEndGame(){
 if(P && P.cloudEnabled && !_cloudInflight){
  // Audit performances #3 : debounce plutôt qu'un simple délai fixe — si
  // plusieurs fins de partie arrivent en moins de CLOUD_ENDGAME_DEBOUNCE_MS,
  // seule la dernière déclenche réellement un envoi (les précédentes sont
  // annulées et remplacées), au lieu d'empiler une écriture KV par partie.
  clearTimeout(_cloudEndgameDebounceTimer);
  _cloudEndgameDebounceTimer = setTimeout(() => pushProfileToCloud(), CLOUD_ENDGAME_DEBOUNCE_MS);
 }
}

// ══════════════ INDICATEUR PERMANENT DE STATUT (v11.6.3) ══════════════
// Remplace l'ancien bandeau conditionnel (masqué tant que le profil n'avait
// pas 100 XP) par un indicateur toujours visible sous la carte joueur :
//   - état "off" : cloud pas encore activé → bouton d'activation direct.
//   - état "on"  : cloud activé → simple statut + heure de dernière synchro.
// Le conteneur externe garde l'id historique 'cloud-optin-banner' (cible du
// pas-à-pas onboarding, système 3, étape 4/28 — ne pas renommer sans mettre
// à jour 19-onboarding.js en conséquence).
function refreshCloudIndicator(){
 const off = document.getElementById('cloud-status-off');
 const on = document.getElementById('cloud-status-on');
 if(!off || !on) return;
 if(!P || !P.cloudEnabled){
  off.classList.remove('hidden');
  on.classList.add('hidden');
  return;
 }
 off.classList.add('hidden');
 on.classList.remove('hidden');
 const lastEl = document.getElementById('cloud-last-sync');
 if(lastEl){
  lastEl.textContent = _cloudLastSync
   ? 'Dernière synchro : ' + new Date(_cloudLastSync).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})
   : 'Synchronisation en attente…';
 }
}

async function cloudOptInActivate(){
 if(typeof enableCloudSync === 'function'){
  await enableCloudSync();
  refreshCloudIndicator();
 }
}

// ══════════════ SAUVEGARDE À LA FERMETURE ══════════════
// Déclenchement de saveProfileNow() + push cloud (best-effort) quand l'utilisateur :
// - ferme l'onglet/la fenêtre (pagehide)
// - bascule l'app en arrière-plan (visibilitychange → hidden) → critique sur mobile
// - quitte la page (beforeunload, fallback desktop)
//
// Note : pushProfileToCloud() est asynchrone et peut être interrompu par le navigateur
// à la fermeture. On utilise navigator.sendBeacon en complément pour fiabiliser.
function _cloudSyncBeacon(){
 if(!P || !P.cloudCode || !P.cloudEnabled) return false;
 try{
  const code = encodeURIComponent(P.cloudCode);
  const payload = { ...P };
  delete payload._syncedAt;
  if(typeof chatExportFor==='function'){ const _c = chatExportFor(P.name); if(_c) payload._chat = _c; }
  // sendBeacon = requête garantie d'aboutir même après la fermeture de la page.
  // Pas de réponse récupérable mais c'est ce qu'on veut ici.
  if(navigator.sendBeacon){
   const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
   return navigator.sendBeacon(`${CLOUD_API}/profile/${code}`, blob);
  }
 } catch(e){ _cloudWarn('beacon erreur :', e); }
 return false;
}

function _onPageHide(){
 // Sauvegarde locale immédiate
 if(typeof saveProfileNow === 'function') saveProfileNow();
 // Push cloud via sendBeacon (sûr en fermeture)
 _cloudSyncBeacon();
}

function _onVisibilityChange(){
 // Quand l'app passe en arrière-plan (sur mobile, c'est crucial : l'OS peut
 // suspendre la PWA à tout moment et perdre la mémoire).
 if(document.visibilityState === 'hidden'){
  _onPageHide();
 }
}

// Audit performances #8 : suspendre le timer de synchro auto pendant une
// coupure réseau détectée (au lieu de continuer à tenter — et échouer, avec
// le timeout de 8s à chaque fois — toutes les 5 min), et reprendre
// immédiatement au retour du réseau plutôt que d'attendre le prochain tick.
function _onOffline(){ cancelCloudSync(); }
function _onOnline(){
 if(P && P.cloudEnabled){
  scheduleCloudSync();
  pushProfileToCloud(); // tentative immédiate, sans attendre le prochain tick de 5 min
 }
}

// Enregistrer les hooks dès que le module est chargé
if(typeof window !== 'undefined'){
 window.addEventListener('pagehide', _onPageHide);
 window.addEventListener('visibilitychange', _onVisibilityChange);
 // beforeunload : fallback desktop (mobile l'ignore souvent)
 window.addEventListener('beforeunload', () => {
  if(typeof saveProfileNow === 'function') saveProfileNow();
  _cloudSyncBeacon();
 });
 window.addEventListener('offline', _onOffline);
 window.addEventListener('online', _onOnline);
}
