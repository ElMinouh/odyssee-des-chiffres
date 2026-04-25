// 06-adaptive.js — L'Odyssée des Chiffres
'use strict';
// ═══════════════════════════════════════════════════════
// DIFFICULTÉ ADAPTATIVE + RÉVISION ESPACÉE (chantier 1.1 + 1.2)
// ═══════════════════════════════════════════════════════
// Ces fonctions lisent l'historique du joueur (P.opStats, P.errorLog)
// et influencent subtilement la génération et le choix des questions.

// Seuils de déclenchement de l'adaptation.
const ADAPT_MIN_ATTEMPTS = 8;   // en dessous, pas assez de données pour adapter
const ADAPT_MASTERY      = 0.80;// ≥80% = maîtrise → questions un peu plus dures
const ADAPT_STRUGGLE     = 0.50;// ≤50% = difficulté → questions un peu plus faciles

// Probabilité de base d'injecter une erreur passée dans le flux normal
const SPACED_BASE_PROBA  = 0.22;// ~1 question sur 5 est une révision
const SPACED_MAX_LOG     = 30;  // taille max du log d'erreurs

/**
 * Renvoie un signal d'ajustement pour un opérateur donné :
 *  +1 → joueur maîtrise, on peut corser légèrement
 *  -1 → joueur galère, on allège
 *   0 → zone normale, pas d'ajustement
 */
function getDifficultySignal(opKey){
 if(!P?.opStats||!opKey)return 0;
 const s=P.opStats[opKey]; if(!s)return 0;
 const total=(s.ok||0)+(s.fail||0);
 if(total<ADAPT_MIN_ATTEMPTS)return 0;
 const ratio=s.ok/total;
 if(ratio>=ADAPT_MASTERY)return +1;
 if(ratio<=ADAPT_STRUGGLE)return -1;
 return 0;
}

/**
 * Ajuste les bornes d'un intervalle [min,max] selon le signal :
 *  +1 : étire vers le haut de ~20%
 *  -1 : resserre vers le bas de ~20%
 */
function adaptRange(min, max, opKey){
 const sig=getDifficultySignal(opKey);
 if(sig===0)return [min,max];
 const span=max-min;
 if(sig>0){
  // +20% vers le haut, en préservant une marge minimale
  return [min, Math.min(max+Math.max(1,Math.round(span*0.25)), max*2)];
 }
 // -20% : resserre vers le bas, mais min reste min
 return [min, Math.max(min+1, max-Math.max(1,Math.round(span*0.20)))];
}

// ═══ Révision espacée ═══════════════════════════════════

/**
 * Enregistre une erreur dans le log avec timestamp.
 * Format : {q:'3+4=7', t: Date.now(), tries: 1}
 */
function logError(qDisplay, res){
 if(!P)return;
 P.errorLog = Array.isArray(P.errorLog) ? P.errorLog : [];
 const key = String(qDisplay).replace(/\s+/g,'')+'='+res;
 // Si l'erreur existe déjà, on met à jour le timestamp et tries
 const existing = P.errorLog.find(e=>e.q===key);
 if(existing){
  existing.t = Date.now();
  existing.tries = (existing.tries||0) + 1;
 } else {
  P.errorLog.push({q:key, t:Date.now(), tries:1});
 }
 // Cap : on garde les 30 plus récentes
 if(P.errorLog.length > SPACED_MAX_LOG){
  P.errorLog.sort((a,b)=>b.t-a.t);
  P.errorLog = P.errorLog.slice(0, SPACED_MAX_LOG);
 }
}

/**
 * Marque une erreur comme "bien réussie" : on l'enlève du log
 * (l'enfant a consolidé).
 */
function clearErrorFromLog(qDisplay, res){
 if(!P?.errorLog)return;
 const key = String(qDisplay).replace(/\s+/g,'')+'='+res;
 const item = P.errorLog.find(e=>e.q===key);
 if(!item)return;
 item.tries = (item.tries||1) - 1;
 // 2 bonnes réponses d'affilée = on considère l'erreur consolidée, on l'enlève
 if(item.tries<=0){
  P.errorLog = P.errorLog.filter(e=>e.q!==key);
 }
}

/**
 * Donne la probabilité de reposer une erreur donnée maintenant.
 * Plus l'erreur est récente, plus elle remonte souvent (courbe de l'oubli).
 */
function _spacedProba(errItem){
 const ageMs = Date.now() - errItem.t;
 const ageMin = ageMs / 60000;
 // 0-1min : 0.5, 5min : 0.25, 30min : 0.10, 24h : 0.05
 if(ageMin < 1)   return 0.50;
 if(ageMin < 5)   return 0.30;
 if(ageMin < 30)  return 0.18;
 if(ageMin < 180) return 0.10;
 return 0.05;
}

/**
 * Essaie de retourner une erreur à reposer maintenant.
 * Renvoie {display, res, isRevision:true} ou null.
 * Ne renvoie jamais 2 fois de suite la même question (via _lastRevisedKey).
 */
let _lastRevisedKey = null;
function getRevisionErrorToAsk(){
 if(!P?.errorLog?.length)return null;
 // Trigger global : on ne déclenche la tentative que dans 22% des cas
 if(Math.random() > SPACED_BASE_PROBA)return null;
 // Pour chaque erreur, calcul de la proba pondérée par sa "fraîcheur"
 const candidates = P.errorLog.filter(e=>e.q!==_lastRevisedKey);
 if(!candidates.length)return null;
 // Pondération : plus la proba individuelle est forte, plus on la prend
 const weighted = candidates.map(e=>({e, w:_spacedProba(e)}));
 const totalW = weighted.reduce((s,x)=>s+x.w, 0);
 let r = Math.random() * totalW;
 for(const {e, w} of weighted){
  r -= w;
  if(r <= 0){
   const m = e.q.match(/^(.+?)([+\-x×\/÷])(.+?)=(\d+)$/);
   if(!m)continue;
   _lastRevisedKey = e.q;
   return {
    a: isNaN(+m[1])?null:+m[1],
    b: isNaN(+m[3])?null:+m[3],
    op: m[2],
    res: +m[4],
    display: `${m[1]} ${m[2]} ${m[3]}`,
    type: 'normal',
    opKey: m[2]==='×'||m[2]==='x'?'x':m[2]==='÷'||m[2]==='/'?'/':m[2],
    img: '',
    isRevision: true
   };
  }
 }
 return null;
}
// ═══════════════════════════════════════════════════════
// PALIERS (chantier 2.1)
// ═══════════════════════════════════════════════════════
/**
 * Parcourt tous les paliers et attribue les récompenses pour ceux qui
 * viennent d'être franchis (pas encore dans milestonesClaimed).
 * Affiche une toast festive pour chaque palier franchi.
 */
function checkMilestones(){
 if(!P||typeof MILESTONES==='undefined')return;
 P.milestonesClaimed = Array.isArray(P.milestonesClaimed) ? P.milestonesClaimed : [];
 const justUnlocked = [];
 for(const m of MILESTONES){
  const current = m.count(P);
  for(let i=0;i<m.tiers.length;i++){
   const tier = m.tiers[i];
   const key = `${m.id}_${i}`;
   if(current >= tier.goal && !P.milestonesClaimed.includes(key)){
    // Palier franchi pour la première fois !
    P.milestonesClaimed.push(key);
    if(tier.xp)   P.xp=(P.xp||0)+tier.xp;
    if(tier.stars)P.stars=(P.stars||0)+tier.stars;
    if(tier.badge&&!(P.badgesEarned||[]).includes(tier.badge)){
     P.badgesEarned=(P.badgesEarned||[]).concat(tier.badge);
    }
    justUnlocked.push({m, tier, isFinal: i===m.tiers.length-1});
   }
  }
 }
 // Affichage différé pour ne pas tout superposer à la fin de partie
 justUnlocked.forEach(({m, tier, isFinal}, idx) => {
  setTimeout(()=>{
   const pref = isFinal ? '💎 PALIER ULTIME !' : '🏆 Palier !';
   const reward = [
    tier.xp?`+${tier.xp}XP`:null,
    tier.stars?`+${tier.stars}⭐`:null,
    tier.badge?'🎖️':null,
   ].filter(Boolean).join(' ');
   if(typeof toast==='function') toast(`${pref} ${m.icon} ${m.label} : ${tier.goal} · ${reward}`, 3500);
   // petit bip + vibration festifs
   if(typeof beep==='function') beep(880,'sine',.3);
   if(typeof vibrate==='function' && typeof VIBE!=='undefined') vibrate(VIBE.levelup);
  }, 2500 + idx*1500);
 });
 if(justUnlocked.length && typeof saveProfile==='function') saveProfile();
}
// ═══════════════════════════════════════════════════════
// QUÊTES INTELLIGENTES (chantier A3)
// ═══════════════════════════════════════════════════════
// Pioche dans P.opStats pour identifier les forces/faiblesses du joueur
// et génère des quêtes ciblées.

const _OP_NAMES = {'+':'additions','-':'soustractions','x':'multiplications','/':'divisions'};
const _OP_KEYS_TO_QFILTER = {'+':'plus','-':'moins','x':'fois','/':'div'};

/**
 * Identifie les forces et faiblesses dans les opérations.
 * Renvoie {weakest:'+', strongest:'x', confidence:0.x}
 * Confidence : 0 = pas assez de données, 1 = données très fiables
 */
function analyzeOpProfile(){
 if(!P?.opStats)return {weakest:null, strongest:null, confidence:0};
 const ops = ['+','-','x','/'];
 const ratios = {};
 let totalAttempts = 0;
 ops.forEach(op=>{
  const s = P.opStats[op];
  if(!s) return;
  const t = (s.ok||0)+(s.fail||0);
  if(t < 5) return; // pas assez de données pour cette op
  ratios[op] = {ratio: s.ok/t, total: t};
  totalAttempts += t;
 });
 const opsWithData = Object.keys(ratios);
 if(opsWithData.length < 2) return {weakest:null, strongest:null, confidence:0};
 // Tri par ratio
 opsWithData.sort((a,b)=>ratios[a].ratio - ratios[b].ratio);
 const confidence = Math.min(1, totalAttempts / 50);
 return {
  weakest: opsWithData[0],
  strongest: opsWithData[opsWithData.length-1],
  weakRatio: ratios[opsWithData[0]].ratio,
  strongRatio: ratios[opsWithData[opsWithData.length-1]].ratio,
  confidence,
 };
}

/**
 * Génère 3 quêtes personnalisées pour le joueur.
 * Si pas assez de données : fallback sur les quêtes génériques (shuffle de QUESTS).
 */
function genSmartQuests(){
 const profile = analyzeOpProfile();
 // Si on n'a pas assez de données, fallback classique
 if(profile.confidence < 0.2){
  return shuffle(QUESTS).slice(0,3).map(q=>({...q, progress:0, done:false}));
 }
 const result = [];
 // Quête de renforcement sur l'op la plus faible
 if(profile.weakest){
  const opLabel = _OP_NAMES[profile.weakest] || 'questions';
  const goal = profile.weakRatio < 0.4 ? 3 : 5;
  result.push({
   id:`q_smart_weak_${profile.weakest}`,
   label:`🎯 Réussis ${goal} ${opLabel}`,
   goal, key:`op_${profile.weakest}`,
   reward: 20,
   smart: 'weak',
  });
 }
 // Quête de défi sur l'op la plus forte
 if(profile.strongest && profile.strongRatio >= 0.7){
  const opLabel = _OP_NAMES[profile.strongest] || 'questions';
  const goal = profile.strongRatio >= 0.9 ? 8 : 6;
  result.push({
   id:`q_smart_strong_${profile.strongest}`,
   label:`🌟 Fais un combo de ${goal} en ${opLabel}`,
   goal, key:`combo_${profile.strongest}`,
   reward: 30,
   smart: 'strong',
  });
 }
 // Compléter avec une quête random parmi les classiques
 const usedIds = new Set(result.map(r=>r.id));
 const remaining = QUESTS.filter(q=>!usedIds.has(q.id));
 if(remaining.length){
  const random = remaining[ri(0, remaining.length-1)];
  result.push({...random, smart:'classic'});
 }
 // Si on n'a pas réussi à faire 3 quêtes, on complète au hasard
 while(result.length < 3 && remaining.length){
  const r = remaining[ri(0, remaining.length-1)];
  if(!result.find(q=>q.id===r.id)) result.push({...r, smart:'classic'});
  if(result.length >= 3) break;
 }
 return result.slice(0,3).map(q=>({...q, progress:0, done:false}));
}
// ═══════════════════════════════════════════════════════
// DÉTECTION DES PLATEAUX (chantier C4)
// ═══════════════════════════════════════════════════════
// Analyse l'historique récent pour détecter stagnation, régression,
// pause longue ou mode unique, et propose un encouragement ciblé.

const _PLATEAU_TYPES = {
 plateau: {
  emoji: '💪',
  title: 'Tu es constant !',
  message: "Tu joues bien, tes scores sont stables. Pour <strong>vraiment</strong> progresser, essaie un mode plus difficile !",
  cta: 'Essayer le mode Survie',
  ctaAction: ()=>{ if($('gameModeSelect')) $('gameModeSelect').value='survie'; savePrefs(); },
 },
 regression: {
  emoji: '🌱',
  title: 'Pas de panique !',
  message: "Tout le monde a des jours moins bons. Refais quelques <strong>tables de multiplication</strong> tranquille pour te détendre.",
  cta: 'Voir les tables',
  ctaAction: ()=>{ if(typeof openMultTable==='function') openMultTable(); },
 },
 longPause: {
  emoji: '😄',
  title: 'De retour !',
  message: "Ça fait un moment ! Reprends doucement avec une partie en <strong>mode normal</strong>. Tes figurines t'attendent !",
  cta: 'Lancer une partie',
  ctaAction: ()=>{ if(typeof startGame==='function') startGame(); },
 },
 modeStuck: {
  emoji: '🎲',
  title: 'Et si on changeait ?',
  message: "Tu maîtrises ce mode ! Essaie le <strong>mode Combat</strong> ou <strong>Chrono</strong> pour un nouveau défi.",
  cta: 'Essayer le mode Combat',
  ctaAction: ()=>{ if($('gameModeSelect')) $('gameModeSelect').value='combat'; savePrefs(); },
 },
 frustration: {
  emoji: '🌟',
  title: "T'es plus fort que tu crois !",
  message: "Quelques défaites, c'est rien. Va voir tes erreurs dans <strong>Révision</strong>, tu vas vite rebondir !",
  cta: 'Mode Révision',
  ctaAction: ()=>{ if($('gameModeSelect')) $('gameModeSelect').value='revision'; savePrefs(); },
 },
};

/**
 * Analyse l'historique pour détecter un type de plateau.
 * Retourne {type, ...} ou null si rien à signaler.
 */
function detectPlateau(){
 if(!P)return null;
 const h = (P.historyDetailed||[]);
 const now = Date.now();
 // Détection 1 : pause longue (>7 jours) - prioritaire
 if(h.length > 0){
  const last = h[h.length-1];
  if(last.timestamp){
   const days = (now - last.timestamp) / (1000*60*60*24);
   if(days >= 7) return {type:'longPause', days: Math.round(days)};
  }
 }
 // Pour les autres détections, il faut au moins 3-5 parties récentes
 if(h.length < 3) return null;
 const recent = h.slice(-5);
 // Détection 2 : frustration (3+ défaites consécutives en mode normal)
 const last3 = h.slice(-3);
 const allLost = last3.every(g=>g.won===false && g.mode==='normal');
 if(last3.length===3 && allLost) return {type:'frustration', losses:3};
 // Détection 3 : régression (3 dernières parties en baisse continue)
 if(recent.length >= 3){
  const scores = recent.slice(-3).map(g=>g.score||0);
  if(scores[0] > scores[1] && scores[1] > scores[2]) return {type:'regression', scores};
 }
 // Détection 4 : mode unique (10+ parties dans le même mode)
 const modes = h.slice(-10).map(g=>g.mode);
 if(modes.length >= 10){
  const uniqueModes = new Set(modes);
  if(uniqueModes.size === 1) return {type:'modeStuck', mode: modes[0], count: modes.length};
 }
 // Détection 5 : plateau (5 parties stables, écart < 20%)
 if(recent.length >= 5){
  const scores = recent.map(g=>g.score||0);
  const avg = scores.reduce((s,n)=>s+n,0) / scores.length;
  if(avg > 0){
   const maxDev = Math.max(...scores.map(s=>Math.abs(s-avg)/avg));
   if(maxDev < 0.20) return {type:'plateau', avg: Math.round(avg)};
  }
 }
 return null;
}

/**
 * Affiche une modale douce avec l'encouragement détecté.
 * Une seule fois par session (variable globale _plateauShown).
 */
let _plateauShown = false;
function showPlateauHint(){
 if(_plateauShown) return false;
 const detected = detectPlateau();
 if(!detected) return false;
 const config = _PLATEAU_TYPES[detected.type];
 if(!config) return false;
 _plateauShown = true;
 // Construction de la modale
 const overlay = document.createElement('div');
 overlay.id = 'plateau-hint-overlay';
 overlay.innerHTML = `
  <div class="plateau-hint-box">
   <div class="plateau-hint-emoji">${config.emoji}</div>
   <h3 class="plateau-hint-title">${config.title}</h3>
   <p class="plateau-hint-msg">${config.message}</p>
   <div class="plateau-hint-btns">
    <button class="plateau-hint-cta">${config.cta}</button>
    <button class="plateau-hint-skip">Plus tard</button>
   </div>
  </div>
 `;
 document.body.appendChild(overlay);
 const close = () => {
  overlay.classList.add('plateau-fadeout');
  setTimeout(()=>overlay.remove(), 300);
 };
 overlay.querySelector('.plateau-hint-cta').onclick = () => {
  close();
  setTimeout(()=>{ try{config.ctaAction();}catch(e){console.warn('plateau cta',e);} }, 350);
 };
 overlay.querySelector('.plateau-hint-skip').onclick = close;
 // Petit son discret
 if(typeof beep === 'function') beep(440,'sine',.3,.08);
 return true;
}