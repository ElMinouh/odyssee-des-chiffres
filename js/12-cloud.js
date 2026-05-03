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

// ══════════════ CONFIGURATION ══════════════
const CLOUD_API = 'https://odyssee-sync.air7841.workers.dev';
const CLOUD_SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 min
const CLOUD_REQUEST_TIMEOUT_MS = 8000;        // 8 sec timeout
const CLOUD_VERBOSE = false; // mettre true pour debug

// ══════════════ ÉTAT EN MÉMOIRE ══════════════
let _cloudSyncTimer = null;
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
async function pushProfileToCloud(forceFirst=false){
 if(!P || !P.cloudCode) return false;
 if(!forceFirst && !P.cloudEnabled) return false;
 if(_cloudInflight){ _cloudLog('sync déjà en cours, skip'); return false; }
 _cloudInflight = true;
 try{
  const code = encodeURIComponent(P.cloudCode);
  // On clone P pour ne pas envoyer la propriété _syncedAt côté client
  const payload = { ...P };
  delete payload._syncedAt;
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
 try{
  const resp = await _cloudFetch(`${CLOUD_API}/profile/${encodeURIComponent(code)}`, {
   method: 'GET',
  });
  if(resp.status === 404){
   return { ok:false, error:'not_found' };
  }
  if(!resp.ok){
   return { ok:false, error:`HTTP ${resp.status}` };
  }
  const profile = await resp.json();
  return { ok:true, profile };
 } catch(e){
  return { ok:false, error: e.message || 'network_error' };
 }
}

// Import d'un profil serveur dans le profil actif courant
async function _importProfileFromServer(serverProfile){
 if(!serverProfile || !serverProfile.name) return false;
 // Migration + validation (réutilise les fonctions de 05-profile.js)
 let imported = serverProfile;
 if(typeof migrateProfile==='function') imported = migrateProfile(imported);
 if(typeof validateProfile==='function'){
  imported = validateProfile(imported, serverProfile.name);
 }
 if(!imported) return false;
 // Préserver le code et le statut cloud du profil local
 imported.cloudCode = P.cloudCode;
 imported.cloudEnabled = P.cloudEnabled;
 // Remplace le profil en mémoire et sauvegarde local
 Object.assign(P, imported);
 if(typeof saveProfileNow==='function') saveProfileNow();
 if(typeof updateMenuUI==='function') updateMenuUI();
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
 // Migration + validation
 let prof = cloudProfile;
 if(typeof migrateProfile==='function') prof = migrateProfile(prof);
 if(typeof validateProfile==='function') prof = validateProfile(prof, cloudProfile.name);
 if(!prof) return { ok:false, error:'invalid_profile' };
 // Active le cloud sync sur le profil restauré
 prof.cloudCode = code.toUpperCase();
 prof.cloudEnabled = true;
 // Sauvegarde locale
 try{
  localStorage.setItem('user_' + prof.name, JSON.stringify(prof));
 }catch(e){
  return { ok:false, error:'storage_full' };
 }
 // Ajouter le nom dans la liste des joueurs personnalisés s'il n'est ni prédéfini ni "Autre"
 try{
  const customs = JSON.parse(localStorage.getItem('customPlayerNames') || '[]');
  const isPreset = (typeof KNOWN !== 'undefined' && Array.isArray(KNOWN)) ? KNOWN.includes(prof.name) : false;
  if(!customs.includes(prof.name) && !isPreset && prof.name !== 'Autre'){
   customs.push(prof.name);
   localStorage.setItem('customPlayerNames', JSON.stringify(customs));
  }
 }catch(e){}
 return { ok:true, name: prof.name };
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

// ══════════════ COPIE DU CODE DANS LE PRESSE-PAPIERS ══════════════
async function copyCloudCode(){
 if(!P || !P.cloudCode) return false;
 try{
  if(navigator.clipboard && navigator.clipboard.writeText){
   await navigator.clipboard.writeText(P.cloudCode);
   if(typeof toast==='function') toast('📋 Code copié !',2000);
   return true;
  }
 }catch(e){
  _cloudWarn('copie échec :', e);
 }
 // Fallback : sélection dans un input invisible
 const ta = document.createElement('textarea');
 ta.value = P.cloudCode;
 ta.style.position = 'fixed'; ta.style.opacity = '0';
 document.body.appendChild(ta);
 ta.select();
 try{ document.execCommand('copy'); if(typeof toast==='function') toast('📋 Code copié !',2000); }
 catch(e){ if(typeof toast==='function') toast('⚠️ Impossible de copier',2500); }
 document.body.removeChild(ta);
 return true;
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
 // Bandeau opt-in si pertinent (déclenché légèrement plus tard pour ne pas
 // surcharger le boot)
 setTimeout(() => showCloudOptInBannerIfRelevant(), 1500);
}

// ══════════════ HOOK DE FIN DE PARTIE ══════════════
// À appeler après chaque saveProfileNow() de fin de partie pour pousser au cloud.
function syncCloudOnEndGame(){
 if(P && P.cloudEnabled && !_cloudInflight){
  // Petit délai pour ne pas bloquer l'UI de fin de partie
  setTimeout(() => pushProfileToCloud(), 500);
 }
}

// ══════════════ BANDEAU OPT-IN (Décision 2 = option B) ══════════════
// Affiché si :
//   - le profil actif a au moins 100 XP (= a déjà joué un peu)
//   - le cloud n'est pas activé
//   - le bandeau n'a pas été dismissé récemment (< 7 jours) ou définitivement
const CLOUD_BANNER_DISMISS_KEY = 'cloud_banner_dismiss';
const CLOUD_BANNER_REMIND_DAYS = 7;

function shouldShowCloudOptInBanner(){
 if(!P) return false;
 if(P.cloudEnabled) return false;
 if((P.xp || 0) < 100) return false; // attendre que le joueur ait joué un peu
 try{
  const raw = localStorage.getItem(CLOUD_BANNER_DISMISS_KEY);
  if(raw){
   const data = JSON.parse(raw);
   if(data.permanent) return false;
   if(data.until && Date.now() < data.until) return false;
  }
 }catch(e){}
 return true;
}

function showCloudOptInBannerIfRelevant(){
 const banner = document.getElementById('cloud-optin-banner');
 if(!banner) return;
 if(shouldShowCloudOptInBanner()){
  banner.classList.remove('hidden');
 } else {
  banner.classList.add('hidden');
 }
}

async function cloudOptInActivate(){
 if(typeof enableCloudSync === 'function'){
  const ok = await enableCloudSync();
  if(ok){
   const banner = document.getElementById('cloud-optin-banner');
   if(banner) banner.classList.add('hidden');
  }
 }
}

function cloudOptInDismiss(permanent){
 try{
  if(permanent){
   localStorage.setItem(CLOUD_BANNER_DISMISS_KEY, JSON.stringify({permanent:true}));
  } else {
   const until = Date.now() + CLOUD_BANNER_REMIND_DAYS * 24 * 3600 * 1000;
   localStorage.setItem(CLOUD_BANNER_DISMISS_KEY, JSON.stringify({permanent:false, until}));
  }
 }catch(e){}
 const banner = document.getElementById('cloud-optin-banner');
 if(banner) banner.classList.add('hidden');
}
