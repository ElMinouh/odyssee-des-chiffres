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
// Chantier Lot 2 (audit pédagogique 12e conversation) : système à cases (Leitner simplifié).
// Chaque case = un palier de maîtrise, avec un délai cible avant reprogrammation qui
// s'allonge à mesure que l'enfant consolide. Case 0 = jamais consolidée, case 3 = dernière
// vérification avant retrait définitif (pt 16 : rappel différé volontaire).
const LEITNER_BOX_TARGET_MIN = [0, 3*60, 24*60, 7*24*60]; // 0 / 3h / 1j / 7j
const LEITNER_MAX_BOX = LEITNER_BOX_TARGET_MIN.length - 1;
// Sous ce seuil (ms), une erreur est considérée comme une probable inattention
// (réponse donnée trop vite pour avoir été réfléchie) plutôt qu'une incompréhension
// réelle de la notion — elle est retestée presque tout de suite, hors case Leitner.
const INATTENTION_MS_THRESHOLD = 2000;

// ═══════════════════════════════════════════════════════
// INTERLEAVING VOLONTAIRE (Lot 3, audit pédagogique 12e conversation)
// ═══════════════════════════════════════════════════════
// Quand 2 catégories proches sont SIMULTANÉMENT en difficulté (même seuils que
// l'adaptativité : ADAPT_MIN_ATTEMPTS tentatives, ratio ≤ ADAPT_STRUGGLE), on force
// une alternance entre les deux plutôt que de laisser le tirage aléatoire du pool
// les répéter ou les espacer au hasard (Rohrer & Taylor — alterner deux notions
// proches aide à mieux les distinguer). Générique et multi-matières : s'appuie sur
// les stats déjà suivies pour chaque matière (P.opStats / P.opStatsFr / P.opStatsHist),
// sans paire de catégories "confusables" fabriquée à l'avance — ce sont toujours les
// 2 catégories réellement les plus faibles du moment qui sont choisies.
// Toute matière future en bénéficie automatiquement dès lors qu'elle suit le schéma
// « générateur de niveau → question avec opKey » déjà utilisé par maths/français/histoire
// (branchement unique dans generateQ(), 07-game.js — rien à ajouter par matière).
function _catStatsFor(subj){
 if(subj==='fr')   return (typeof P!=='undefined' && P.opStatsFr)   || {};
 if(subj==='hist') return (typeof P!=='undefined' && P.opStatsHist) || {};
 return (typeof P!=='undefined' && P.opStats) || {}; // math (et défaut)
}
function getWeakInterleavePair(subj){
 const stats=_catStatsFor(subj);
 const weak=[];
 for(const k in stats){
  const s=stats[k]; const n=(s.ok||0)+(s.fail||0);
  if(n<ADAPT_MIN_ATTEMPTS) continue;
  const ratio=s.ok/n;
  if(ratio<=ADAPT_STRUGGLE) weak.push({k, ratio});
 }
 if(weak.length<2) return null;
 weak.sort((a,b)=>a.ratio-b.ratio); // les 2 plus faibles d'abord
 return [weak[0].k, weak[1].k];
}
function _interleaveCatOf(subj, q){
 if(!q || !q.opKey) return null;
 if(subj==='fr'   && typeof _frCatOf==='function')   return _frCatOf(q.opKey);
 if(subj==='hist' && typeof _histCatOf==='function') return _histCatOf(q.opKey);
 return q.opKey; // math : la catégorie EST l'opérateur, pas de regroupement nécessaire
}
let _interleaveLast = {};
function _nextInterleaveTarget(subj, pair){
 const last=_interleaveLast[subj];
 const target = (last===pair[0]) ? pair[1] : pair[0];
 _interleaveLast[subj]=target;
 return target;
}
// Nombre d'essais avant d'accepter le tirage tel quel : en maths, la catégorie est
// connue immédiatement (peu de branches), l'alternance est donc quasi garantie avec
// un budget confortable. En français/histoire, la catégorie n'est connue qu'après
// génération complète (pool de fonctions) — alternance favorisée, pas garantie à 100%.
const INTERLEAVE_MAX_TRIES = {math:20, fr:4, hist:4};
/**
 * Enrobe un appel de générateur de question pour favoriser/garantir l'alternance
 * entre les 2 catégories les plus faibles du moment, si elles sont au moins 2 en
 * vraie difficulté simultanée. Ne change rien si tout va bien (0 ou 1 catégorie faible).
 */
function applyInterleaveGuard(subj, genFn){
 let q=genFn();
 if(!q) return q;
 const pair=getWeakInterleavePair(subj);
 if(!pair) return q;
 const target=_nextInterleaveTarget(subj, pair);
 const maxTries=INTERLEAVE_MAX_TRIES[subj]||4;
 let tries=0;
 while(_interleaveCatOf(subj,q)!==target && tries<maxTries){
  q=genFn(); tries++;
 }
 return q;
}

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
 * Format : {q:'3+4=7', t: Date.now(), tries: 1, box:0, subj, inattention}
 * `elapsedMs` (optionnel) : temps entre l'affichage de la question et la réponse.
 * Sous INATTENTION_MS_THRESHOLD, l'erreur est marquée `inattention:true` — elle sera
 * retestée presque immédiatement (pas via les cases Leitner, qui supposent une
 * vraie incompréhension à retravailler dans la durée). Fonctionne identiquement
 * pour toutes les matières (maths, français, histoire, et toute matière future),
 * le champ `subj` étant déjà lu depuis GM.subject sans logique spécifique à une matière.
 */
function logError(qDisplay, res, q, elapsedMs){
 if(!P)return;
 P.errorLog = Array.isArray(P.errorLog) ? P.errorLog : [];
 const key = String(qDisplay).replace(/\s+/g,'')+'='+res;
 // On n'enregistre que des erreurs REJOUABLES : soit un QCM (instantané rejouable),
 // soit un calcul purement numérique. Les questions-texte (ex. « Combien de dizaines… »)
 // sont exclues : leur tiret « a-t-il » était pris pour un « moins » et reconstruisait
 // une question incompréhensible rejouée en boucle.
 const _replayable = (q && Array.isArray(q.choices) && q.choices.length) || /^[\d().,+\-x×\/÷\s]+=\d+$/.test(key);
 if(!_replayable) return;
 const _inattention = (typeof elapsedMs==='number') && elapsedMs>=0 && elapsedMs<INATTENTION_MS_THRESHOLD;
 // Si l'erreur existe déjà, on met à jour le timestamp et tries
 const existing = P.errorLog.find(e=>e.q===key);
 const _subj = (typeof GM!=='undefined' && GM.subject) || 'math';
 if(existing){
  existing.t = Date.now();
  existing.tries = (existing.tries||0) + 1;
  existing.subj = _subj;
  existing.box = 0; // nouvel échec → repart de la case 0 (règle Leitner standard)
  existing.inattention = _inattention;
  existing.pendingFinalCheck = false;
  existing.failStreak = (existing.failStreak||0) + 1; // Lot 4 : échecs consécutifs sur CETTE question précise
 } else {
  const item = {q:key, t:Date.now(), tries:1, subj:_subj, box:0, inattention:_inattention, failStreak:1};
  // v9.4.16 : les questions QCM (exercices enrichis primaire/collège) sont
  // stockées avec un instantané rejouable — sinon elles encombraient le log
  // sans jamais être reposées. Cap de taille pour préserver localStorage.
  if(q && Array.isArray(q.choices) && q.choices.length){
   try{
    const snap = {display:q.display, choices:q.choices, res:q.res, opKey:q.opKey||'', type:'normal', img:''};
    if(q.visualHtml) snap.visualHtml = q.visualHtml;
    if(q.visualChoices) snap.visualChoices = true;
    if(JSON.stringify(snap).length <= 6000) item.payload = snap;
   }catch(e){}
  }
  P.errorLog.push(item);
 }
 // Cap : en cas de dépassement, on retire en priorité les entrées les plus avancées
 // (cases hautes = déjà bien maîtrisées, moins urgentes à garder) puis, à égalité
 // de case, les plus anciennes — pour ne pas perdre le suivi des lacunes actives.
 if(P.errorLog.length > SPACED_MAX_LOG){
  P.errorLog.sort((a,b)=> (a.box||0)!==(b.box||0) ? (b.box||0)-(a.box||0) : b.t-a.t);
  P.errorLog = P.errorLog.slice(P.errorLog.length-SPACED_MAX_LOG);
 }
}

/**
 * Marque une erreur comme "bien réussie" : fait progresser sa case Leitner.
 * - Sous la case max : consolidation partielle (2 bonnes réponses d'affilée requises
 *   à chaque case), puis passage à la case suivante avec un délai cible plus long
 *   avant reprogrammation (moins souvent reposée, car mieux maîtrisée).
 * - À la case max : une dernière vérification différée (pt 16 — rappel différé
 *   volontaire) est programmée avant retrait définitif, pour confirmer que la
 *   rétention tient dans la durée et pas seulement à chaud.
 * Fonctionne identiquement pour toutes les matières (le format de l'item ne dépend
 * d'aucune logique spécifique à une matière donnée).
 */
function clearErrorFromLog(qDisplay, res){
 if(!P?.errorLog)return;
 const key = String(qDisplay).replace(/\s+/g,'')+'='+res;
 const item = P.errorLog.find(e=>e.q===key);
 if(!item)return;
 item.tries = (item.tries||1) - 1;
 if(item.tries>0){
  // Encore une bonne réponse nécessaire à cette case : on ne fait qu'avancer
  // l'horloge, la case ne change pas.
  item.t = Date.now();
  return;
 }
 if(item.pendingFinalCheck){
  // La vérification différée finale (pt 16) est réussie → notion consolidée,
  // on retire vraiment l'erreur du suivi.
  P.errorLog = P.errorLog.filter(e=>e.q!==key);
  return;
 }
 const box = item.box||0;
 if(box>=LEITNER_MAX_BOX){
  // Case max atteinte : programme la vérification finale différée plutôt que
  // de retirer immédiatement (évite de déclarer une notion acquise après une
  // seule série de bonnes réponses rapprochées).
  item.pendingFinalCheck = true;
  item.tries = 1;
  item.t = Date.now();
 } else {
  item.box = box+1;
  item.tries = 2;
  item.t = Date.now();
 }
 item.inattention = false;
 item.failStreak = 0; // Lot 4 : une réussite casse la série d'échecs consécutifs
}
/**
 * Lot 4 (audit pédagogique) : nombre d'échecs consécutifs sur CETTE question
 * précise (mêmes nombres, même énoncé) — sert à déclencher une aide visuelle
 * après 2 échecs plutôt qu'une simple répétition de la correction textuelle.
 * Fonctionne pour toute matière (le format de l'item ne dépend d'aucune
 * logique spécifique à une matière donnée).
 */
function getFailStreak(qDisplay, res){
 if(!P?.errorLog) return 0;
 const key = String(qDisplay).replace(/\s+/g,'')+'='+res;
 const item = P.errorLog.find(e=>e.q===key);
 return item ? (item.failStreak||0) : 0;
}

/**
 * Donne la probabilité de reposer une erreur donnée maintenant.
 * - Erreur "inattention" (réponse trop rapide, cf. INATTENTION_MS_THRESHOLD) :
 *   courbe rapprochée classique, indépendante de la case Leitner — l'enfant
 *   savait probablement, on revérifie vite plutôt que d'attendre des jours.
 * - Case 0 (jamais consolidée) : même courbe rapprochée (comportement historique).
 * - Cases 1+ : pas due avant ~70% du délai cible de la case (LEITNER_BOX_TARGET_MIN),
 *   puis probabilité croissante avec le retard — c'est l'espacement croissant réel.
 */
function _spacedProba(errItem){
 const ageMs = Date.now() - errItem.t;
 const ageMin = ageMs / 60000;
 const targetMin = errItem.inattention ? 0 : LEITNER_BOX_TARGET_MIN[errItem.box||0];
 if(targetMin<=0){
  if(ageMin < 1)   return 0.50;
  if(ageMin < 5)   return 0.30;
  if(ageMin < 30)  return 0.18;
  if(ageMin < 180) return 0.10;
  return 0.05;
 }
 if(ageMin < targetMin*0.7) return 0; // pas encore due à cette case
 const overdueMin = ageMin - targetMin;
 return Math.min(0.5, 0.05 + Math.max(0,overdueMin)/500);
}

/**
 * Essaie de retourner une erreur à reposer maintenant.
 * Renvoie {display, res, isRevision:true} ou null.
 * Ne renvoie jamais 2 fois de suite la même question (via _lastRevisedKey).
 * `opts.force` (pt 6 — rappel inter-session) : ignore le seuil de déclenchement
 * SPACED_BASE_PROBA et le "pas encore due" des cases hautes — utilisé uniquement
 * au retour d'une absence d'au moins 1 jour, pour prioriser 2-3 révisions avant
 * tout contenu neuf (cf. hook dans startGame(), toutes matières confondues).
 */
let _lastRevisedKey = null;
function getRevisionErrorToAsk(opts){
 const force = !!(opts && opts.force);
 if(!P?.errorLog?.length)return null;
 // Trigger global : on ne déclenche la tentative que dans 22% des cas (sauf forçage)
 if(!force && Math.random() > SPACED_BASE_PROBA)return null;
 // Pour chaque erreur, calcul de la proba pondérée par sa "fraîcheur"
 // Scope par matière : on ne repose que des erreurs de la matière en cours
 const _subj = (typeof GM!=='undefined' && GM.subject) || 'math';
 const candidates = P.errorLog.filter(e=>e.q!==_lastRevisedKey && (e.subj||'math')===_subj);
 if(!candidates.length)return null;
 // Pondération : plus la proba individuelle est forte, plus on la prend.
 // En mode forcé (rappel inter-session), on ignore le "pas encore due" et on
 // pioche équitablement parmi toutes les erreurs en attente.
 const weighted = force ? candidates.map(e=>({e, w:1})) : candidates.map(e=>({e, w:_spacedProba(e)}));
 const totalW = weighted.reduce((s,x)=>s+x.w, 0);
 if(totalW<=0) return null;
 let r = Math.random() * totalW;
 for(const {e, w} of weighted){
  r -= w;
  if(r <= 0){
   // v9.4.16 : question QCM enregistrée avec son instantané → rejouée telle quelle
   if(e.payload && Array.isArray(e.payload.choices)){
    _lastRevisedKey = e.q;
    const out = Object.assign({}, e.payload);
    out.isRevision = true;
    return out;
   }
   const m = e.q.match(/^(\d+)\s*([+\-x×\/÷])\s*(\d+)\s*=\s*(\d+)$/);
   if(!m)continue;
   _lastRevisedKey = e.q;
   return {
    a: +m[1],
    b: +m[3],
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
// v11.8.0 (Lot 2, audit pédagogique) — Rappel inter-session (pt 6).
// Appelée une fois par startGame() : si l'enfant revient après ≥1 jour d'absence
// et qu'il a des erreurs en attente dans la matière du jour, programme un nombre
// de révisions à forcer en priorité dans les premières questions de la session
// (via GS.forceRevisionCount, consommé par generateQ()). Toutes matières.
const INTERSESSION_MIN_DAYS = 1;
const INTERSESSION_MAX_REVISIONS = 3;
function checkInterSessionRevision(){
 if(!P) return 0;
 const now = Date.now();
 const last = P.lastPlayTs;
 P.lastPlayTs = now;
 if(!last) return 0; // première partie jamais jouée : rien à rappeler
 const daysSince = (now-last)/86400000;
 if(daysSince < INTERSESSION_MIN_DAYS) return 0;
 const _subj = (typeof GM!=='undefined' && GM.subject) || 'math';
 const n = (P.errorLog||[]).filter(e=>(e.subj||'math')===_subj).length;
 if(!n) return 0;
 return Math.min(INTERSESSION_MAX_REVISIONS, n);
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
   // Lot 3 (audit engagement, 13e conversation, pt.16) : clé basée sur le SEUIL,
   // pas sur l'index — cf. migration V8 (05-profile.js) pour la raison.
   const key = `${m.id}_${tier.goal}`;
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

// ═══════════════════════════════════════════════════════
// OBJECTIF DE SESSION VISIBLE (Lot 5, audit pédagogique 12e conversation)
// ═══════════════════════════════════════════════════════
// Même principe qu'analyzeOpProfile() mais générique pour les matières à
// catégories (français, histoire, et toute matière future du même type),
// pour donner à l'enfant un objectif clair et STABLE sur la journée plutôt
// que de choisir en silence. Recalculé une fois par jour seulement (cf.
// _computeSessionObjective) pour ne pas changer de message à chaque partie.
function analyzeCatProfile(subj){
 const stats = subj==='fr' ? P?.opStatsFr : subj==='hist' ? P?.opStatsHist : null;
 if(!stats) return {weakest:null, strongest:null, confidence:0};
 const ratios = {};
 let totalAttempts = 0;
 for(const cat in stats){
  const s = stats[cat]; const t=(s.ok||0)+(s.fail||0);
  if(t<5) continue;
  ratios[cat] = {ratio:s.ok/t, total:t};
  totalAttempts += t;
 }
 const cats = Object.keys(ratios);
 if(cats.length<2) return {weakest:null, strongest:null, confidence:0};
 cats.sort((a,b)=>ratios[a].ratio-ratios[b].ratio);
 return {
  weakest:cats[0], strongest:cats[cats.length-1],
  weakRatio:ratios[cats[0]].ratio, strongRatio:ratios[cats[cats.length-1]].ratio,
  confidence:Math.min(1, totalAttempts/50)
 };
}
/**
 * Libellé enfant d'une catégorie faible, pour une matière donnée.
 * CONVENTION pour une future matière à catégories : ajouter un cas ici,
 * réutilisant son propre XXX_CAT_FILTERS comme le fait déjà _hwOpLabel().
 */
function _catLabel(subj, cat){
 if(subj==='fr'){ const c=(typeof FR_CAT_FILTERS!=='undefined'?FR_CAT_FILTERS:[]).find(x=>x.key===cat); return c?c.label.toLowerCase():'questions'; }
 if(subj==='hist'){ const c=(typeof HIST_CAT_FILTERS!=='undefined'?HIST_CAT_FILTERS:[]).find(x=>x.key===cat); return c?c.label.toLowerCase():'questions'; }
 return 'questions';
}
const _OBJECTIVE_DEFAULTS = [
 'Progresse à ton rythme, une question à la fois 🚀',
 'Chaque partie te fait progresser un peu plus 🌟',
 'Prends ton temps, la régularité paie 💪',
];
/**
 * Calcule (ou réutilise si déjà fait aujourd'hui) le texte d'objectif du jour
 * pour la matière en cours. Toutes matières confondues via analyzeOpProfile
 * (maths) / analyzeCatProfile (fr/hist/futures matières à catégories).
 * Lot 7 (audit pédagogique, pt.11) : quand une force ET une faiblesse nettes sont
 * identifiables, la formulation devient positive et double ("tu progresses bien
 * en X — continuons Y") plutôt qu'un simple rappel de la faiblesse seule — fusionné
 * ici avec le toast du Lot 5 plutôt que d'ajouter un second message à chaque partie.
 */
function getSessionObjectiveText(subj){
 if(!P) return null;
 const today = new Date().toISOString().slice(0,10);
 if(P.sessionObjective && P.sessionObjective.date===today && P.sessionObjective.subj===subj){
  return P.sessionObjective.text;
 }
 const isCatSubj = (subj==='fr' || subj==='hist');
 const profile = isCatSubj ? analyzeCatProfile(subj) : analyzeOpProfile();
 const labelOf = k => isCatSubj ? _catLabel(subj,k) : (_OP_NAMES[k]||'ces questions');
 let text;
 if(profile.weakest && profile.confidence>=0.2){
  // Double formulation possible seulement si force ET faiblesse sont bien distinctes
  // (au moins 2 catégories/opérateurs avec des données, et un net écart de réussite).
  const hasDistinctStrength = profile.strongest && profile.strongest!==profile.weakest && (profile.strongRatio-profile.weakRatio)>=0.25;
  text = hasDistinctStrength
   ? `🎯 Tu progresses bien en ${labelOf(profile.strongest)} — continuons ${labelOf(profile.weakest)} 💪`
   : `🎯 Aujourd'hui : entraîne-toi sur ${labelOf(profile.weakest)} 💪`;
 } else {
  text = _OBJECTIVE_DEFAULTS[ri(0,_OBJECTIVE_DEFAULTS.length-1)];
 }
 P.sessionObjective = {date:today, subj, text};
 return text;
}

// Lot 3 (audit engagement, 13e conversation, pt.7) : quand une force ET une
// faiblesse nettement distinctes existent, on propose 2 objectifs plutôt
// qu'un seul imposé — l'enfant choisit (autonomie, SDT). S'il n'y a pas de
// vrai choix pertinent (pas de force distincte identifiable), retourne null :
// getSessionObjectiveText() garde alors son comportement à message unique.
function getSessionObjectiveCandidates(subj){
 if(!P) return null;
 const isCatSubj = (subj==='fr' || subj==='hist');
 const profile = isCatSubj ? analyzeCatProfile(subj) : analyzeOpProfile();
 if(!profile.weakest || profile.confidence<0.2) return null;
 const hasDistinctStrength = profile.strongest && profile.strongest!==profile.weakest && (profile.strongRatio-profile.weakRatio)>=0.25;
 if(!hasDistinctStrength) return null;
 const labelOf = k => isCatSubj ? _catLabel(subj,k) : (_OP_NAMES[k]||'ces questions');
 return [
  {id:'reinforce', text:`🎯 Aujourd'hui : entraîne-toi sur ${labelOf(profile.weakest)} 💪`},
  {id:'challenge', text:`🌟 Aujourd'hui : lance-toi un défi sur ${labelOf(profile.strongest)} !`},
 ];
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
function showPlateauHint(){ return false; /* v9.0.10: suggestions de changement de mode desactivees (juge inutile) */
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
  if(overlay._releaseTrap){overlay._releaseTrap();delete overlay._releaseTrap;}
  overlay.classList.add('plateau-fadeout');
  setTimeout(()=>overlay.remove(), 300);
 };
 overlay.querySelector('.plateau-hint-cta').onclick = () => {
  close();
  setTimeout(()=>{ try{config.ctaAction();}catch(e){console.warn('plateau cta',e);} }, 350);
 };
 overlay.querySelector('.plateau-hint-skip').onclick = close;
 if(typeof trapFocus==='function') overlay._releaseTrap=trapFocus(overlay);
 // Petit son discret
 if(typeof beep === 'function') beep(440,'sine',.3,.08);
 return true;
}
// ═══════════════════════════════════════════════════════
// Chantier B2 : Détection du franchissement de stade
// ═══════════════════════════════════════════════════════

/**
 * Vérifie si le joueur vient de franchir un nouveau stade et déclenche
 * la cinématique. Appelé après chaque fin de partie gagnée.
 */
function checkHeroStageProgress(){
 if(typeof getHeroStage !== 'function' || !P) return;
 const current = getHeroStage();
 const lastStageId = P.heroStageId || 'oeuf';
 if(current.id !== lastStageId){
  // Stade franchi !
  P.heroStageId = current.id;
  // v12.7.14 (signalé par Cyril, captures à l'appui) : saveProfile() (débounce
  // 800ms) ne suffisait pas ici. checkHeroStageProgress() est déjà appelée
  // 1500ms après la fin de partie (07-game.js) — l'écriture réelle
  // n'intervenait donc que ~2,3s plus tard. Si le joueur enchaînait vite sur
  // le lieu suivant, _startCombat() (07-map.js) rappelle loadProfile() avant
  // cette écriture et effaçait le changement encore en mémoire seulement :
  // au prochain lieu, P.heroStageId redevenait l'ancien stade, et
  // l'animation d'évolution semblait réapparaître à chaque lieu.
  // saveProfileNow() écrit immédiatement, avant qu'un tel rechargement
  // puisse survenir.
  if(typeof saveProfileNow==='function') saveProfileNow();
  else if(typeof saveProfile==='function') saveProfile();
  // Cinématique d'évolution
  if(typeof showHeroEvolution==='function') showHeroEvolution(current);
 }
}

/**
 * Affiche une cinématique festive lors du franchissement d'un stade.
 */
function showHeroEvolution(stage){
 const overlay = document.createElement('div');
 overlay.id = 'hero-evolution-overlay';
 const oldAvatar = P.avatar || '🧒';
 const newAvatar = stage.unlockedAvatars[0] || '🌟';
 overlay.innerHTML = `
  <div class="he-content">
   <div class="he-title">🎉 ÉVOLUTION !</div>
   <div class="he-stage" style="color:${stage.color};">${stage.icon} ${stage.label}</div>
   <div class="he-avatars">
    <div class="he-old">${oldAvatar}</div>
    <div class="he-arrow">→</div>
    <div class="he-new">${newAvatar}</div>
   </div>
   <div class="he-desc">${stage.desc}</div>
   <button class="he-cta">Continuer</button>
  </div>
 `;
 document.body.appendChild(overlay);
 // Bonus de récompense
 const reward = stage.id === 'apprenti' ? 30
              : stage.id === 'aventurier' ? 80
              : stage.id === 'maitre' ? 200
              : stage.id === 'legende' ? 500 : 0;
 // v12.7.15 (signalé par Cyril) : ce bonus n'avait lui non plus aucune
 // protection contre la répétition — tout appel de showHeroEvolution() pour
 // un même palier recréditait le bonus. Le correctif v12.7.14 (persistance
 // de heroStageId) a déjà fermé le principal canal de répétition observé,
 // mais ce garde-fou reste nécessaire en profondeur : P.heroStageRewardsCredited
 // suit les paliers déjà récompensés, pour de bon, quelle que soit la cause
 // d'un futur appel en double.
 if(typeof P !== 'undefined' && P){
  P.heroStageRewardsCredited = Array.isArray(P.heroStageRewardsCredited) ? P.heroStageRewardsCredited : [];
 }
 const _alreadyRewarded = !!(typeof P !== 'undefined' && P && P.heroStageRewardsCredited.includes(stage.id));
 if(reward && !_alreadyRewarded){
  P.heroStageRewardsCredited.push(stage.id);
  P.stars = (P.stars||0) + reward;
  if(typeof saveProfileNow==='function') saveProfileNow();
  else if(typeof saveProfile==='function') saveProfile();
 }
 // Sons festifs
 if(typeof beep==='function'){
  [392, 494, 587, 740, 880, 988, 1175].forEach((f,i)=>setTimeout(()=>beep(f,'sine',.4,.16),i*120));
 }
 if(typeof vibrate==='function' && typeof VIBE!=='undefined') vibrate(VIBE.levelup);
 if(typeof startConfetti==='function') startConfetti();
 // Fermeture
 const close = () => {
  if(overlay._releaseTrap){overlay._releaseTrap();delete overlay._releaseTrap;}
  overlay.classList.add('he-fadeout');
  setTimeout(()=>overlay.remove(), 400);
  if(reward && !_alreadyRewarded && typeof toast==='function'){
   setTimeout(()=>toast(`✨ +${reward} ⭐ bonus d'évolution !`, 3000), 500);
  }
 };
 overlay.querySelector('.he-cta').onclick = close;
 if(typeof trapFocus==='function') overlay._releaseTrap=trapFocus(overlay);
}
// ═══════════════════════════════════════════════════════
// PROGRESSION INTRA-ANNÉE PAR CLASSE (chantier P9)
// La difficulté démarre en « début d'année » puis monte avec les réussites
// vers « milieu » puis « fin d'année » : déblocage progressif des types de
// questions + plages de nombres qui s'élargissent. Régression douce sur erreur.
// En Odyssée, la phase vient de la position dans l'îlot (pas de la jauge).
// ═══════════════════════════════════════════════════════
const _YEAR_LEVELS = ['PS','MS','GS','CP','CE1','CE2','CM1','CM2','6E','5E','4E','3E'];
const PROG_UP   = 0.010;   // gain par bonne réponse (montée lente : ~100 réussites nettes = début→fin, soit ~33 par phase → tout le programme de la phase est vu et répété)
const PROG_DOWN = 0.014;   // perte par erreur : la montée n'est nette qu'au-dessus de ~58% de réussite → il faut réussir régulièrement pour progresser

// Clé de progression scopée par matière. Maths conserve la clé « niveau » nue
// (rétro-compatibilité totale des sauvegardes), les autres matières utilisent
// « matière|niveau » → jauge d'année indépendante par matière.
function _progKey(level){
 try{ return (typeof GM!=='undefined' && GM.subject && GM.subject!=='math') ? (GM.subject+'|'+level) : level; }
 catch(e){ return level; }
}
function _progGet(level){
 if(typeof P==='undefined') return 0;
 if(!P.yearProgress || typeof P.yearProgress!=='object') P.yearProgress={};
 const v=P.yearProgress[_progKey(level)];
 return (typeof v==='number' && isFinite(v)) ? v : 0;
}
function _progSet(level,v){
 if(typeof P==='undefined') return;
 if(!P.yearProgress || typeof P.yearProgress!=='object') P.yearProgress={};
 P.yearProgress[_progKey(level)]=Math.max(0, Math.min(1, v));
}
function _progUpdate(level, correct){
 if(!_YEAR_LEVELS.includes(level)) return;
 _progSet(level, _progGet(level) + (correct ? PROG_UP : -PROG_DOWN));
}
function _phaseFromVal(v){ return v < 0.34 ? 1 : (v < 0.67 ? 2 : 3); }

// Progression 0..1 dans l'Odyssée : (index de l'îlot dans la classe + avancée dans l'îlot) / nb d'îlots
function _mapProgress(){
 try{
  if(typeof GM==='undefined' || !GM.mapZone || typeof MAP_ZONES==='undefined') return null;
  const zone=GM.mapZone, lvl=zone.level;
  const same=MAP_ZONES.filter(z=>z.level===lvl);
  const zi=same.findIndex(z=>z.id===zone.id);
  if(zi<0) return null;
  const sN=(zone.steps&&zone.steps.length)?zone.steps.length:1;
  const si=(GM.mapStep && typeof GM.mapStep.idx==='number')?GM.mapStep.idx:0;
  const stepFrac=sN>1 ? Math.min(1, si/(sN-1)) : 0;
  return Math.max(0, Math.min(1, (zi + stepFrac) / same.length));
 }catch(e){ return null; }
}
function _mapPhase(){ const m=_mapProgress(); return m==null ? null : _phaseFromVal(m); }

// Facteur 0..1 et phase 1/2/3 effectifs pour le niveau courant
function _progFactor(level){
 if(typeof GM!=='undefined' && GM.mapZone){ const m=_mapProgress(); if(m!=null) return m; }
 if(!_YEAR_LEVELS.includes(level)) return 1;   // collège, etc. : pas de jauge → plage complète
 return _progGet(level);
}
function _progPhase(level){
 if(typeof GM!=='undefined' && GM.mapZone){ const p=_mapPhase(); if(p) return p; }
 if(!_YEAR_LEVELS.includes(level)) return 3;    // niveaux hors jauge : tous les types
 return _phaseFromVal(_progGet(level));
}
// Resserre une plage de nombres selon la phase (début = petits nombres, fin = plage complète)
function _progScaleRange(min,max){
 try{
  if(typeof GM==='undefined' || !GM.level) return [min,max];
  const f=_progFactor(GM.level);
  if(f>=0.999 || max<=min) return [min,max];
  const M=Math.round(min + (max-min)*(0.4 + 0.6*f));
  return [min, Math.max(min, M)];
 }catch(e){ return [min,max]; }
}

// P9 : rubrique « Progression d'année » pour le bilan parent
function _progBilanHtml(d){
 try{
  const yp=(d&&d.yearProgress)||{};
  const order=['PS','MS','GS','CP','CE1','CE2','CM1','CM2','6E','5E','4E','3E'];
  const rows=order.filter(l=>typeof yp[l]==='number' && yp[l]>0.001);
  if(!rows.length) return '';
  const lab=v=> v<0.34?"Début d'année":(v<0.67?"Milieu d'année":"Fin d'année");
  const col=v=> v<0.34?'#1d9e75':(v<0.67?'#ba7517':'#d85a30');
  let html='<div style="margin-top:10px;padding:8px;background:rgba(255,255,255,.06);border-radius:8px;"><div style="font-weight:800;margin-bottom:6px;">📈 Progression d\'année</div>';
  for(const l of rows){
   const v=Math.max(0,Math.min(1,yp[l]));
   html+=`<div style="margin:5px 0;"><div style="display:flex;justify-content:space-between;font-size:.8em;"><span>${l}</span><span style="color:${col(v)}">${lab(v)}</span></div><div style="height:7px;background:rgba(255,255,255,.12);border-radius:4px;overflow:hidden;margin-top:2px;"><div style="height:100%;width:${Math.round(v*100)}%;background:${col(v)};"></div></div></div>`;
  }
  html+='<div style="font-size:.72em;opacity:.7;margin-top:4px;">La barre monte avec les réussites, redescend un peu en cas d\'erreurs.</div></div>';
  return html;
 }catch(e){ return ''; }
}

// ═══════════════════════════════════════════════════════
// P9.1 : stats par classe + vue parent + AUTO-CONTRÔLE de la progression
// RÈGLE À RESPECTER À CHAQUE AJOUT D'EXERCICE OU DE MODULE :
//  1) ajouter le générateur dans son pool (_PRIM_POOL / _MAT_POOL / _COL_POOL…)
//  2) lui attribuer une PHASE .ph (1=début, 2=milieu, 3=fin) dans le bloc de phases du module
//  3) ouvrir la console : _progSelfCheck() ne doit signaler AUCUN générateur sans phase
//  4) vérifier le gating (variété en phase 1 < phase 3) avant livraison
// ═══════════════════════════════════════════════════════
function _classStatUpdate(subj, level, opKey, correct){
 if(typeof P==='undefined' || !level || !opKey) return;
 subj = subj || 'math';
 // Lot 7 (audit pédagogique, pt.28) : cloisonnement par matière — avant cette version,
 // toutes les matières partageaient la même clé de niveau (P.classStats[level][opKey]),
 // ce qui mélangeait par exemple des catégories de français avec des opérateurs de
 // maths dans le calcul du "point faible". Nouveau format : P.classStats[subj][level][opKey].
 if(!P.classStats || typeof P.classStats!=='object') P.classStats={};
 if(!P.classStats[subj]) P.classStats[subj]={};
 if(!P.classStats[subj][level]) P.classStats[subj][level]={};
 if(!P.classStats[subj][level][opKey]) P.classStats[subj][level][opKey]={ok:0,fail:0};
 if(correct) P.classStats[subj][level][opKey].ok++; else P.classStats[subj][level][opKey].fail++;
}
const _PROG_OPLABEL = {
 '+':'Additions','-':'Soustractions','x':'Multiplications','/':'Divisions',
 'frac':'Fractions','dec':'Nombres décimaux','mes':'Grandeurs & mesures','geo':'Géométrie','num':'Numération',
 'rel':'Nombres relatifs','alg':'Calcul littéral','pow':'Puissances','prop':'Proportionnalité',
 'pyth':'Th. de Pythagore','thal':'Th. de Thalès','trig':'Trigonométrie','fct':'Fonctions',
 'stat':'Statistiques','prob':'Probabilités','equ':'Équations','vol':'Volumes & aires'
};
/**
 * Point faible n°1 pour une matière et un niveau donnés.
 * Compatibilité ascendante : les profils créés avant le Lot 7 avaient leurs stats
 * maths stockées "à plat" (P.classStats[level][opKey], sans dimension matière) —
 * on les relit dans ce format si aucune donnée n'existe encore au nouveau format.
 */
function _progWeakType(subj, level){
 subj = subj || 'math';
 let cs = (typeof P!=='undefined' && P.classStats && P.classStats[subj] && P.classStats[subj][level]) || null;
 if(!cs && subj==='math' && typeof P!=='undefined' && P.classStats && P.classStats[level] && typeof P.classStats[level]==='object'){
  const legacy = P.classStats[level];
  const looksLegacy = Object.keys(legacy).some(k=>_PROG_OPLABEL[k]!==undefined);
  if(looksLegacy) cs = legacy;
 }
 if(!cs) return null;
 let worst=null;
 for(const k in cs){ const s=cs[k]; const n=(s.ok||0)+(s.fail||0); if(n<4) continue; const rate=(s.fail||0)/n;
  if(!worst || rate>worst.rate || (rate===worst.rate && (s.fail||0)>worst.fail)) worst={key:k, rate, fail:s.fail||0, n}; }
 return worst;
}
let _progSelClass = null;
function _progSelectClass(l){ _progSelClass=l; if(typeof renderReport==='function') renderReport(); }
let _progSelSubject = null;
function _progSelectSubject(s){ _progSelSubject=s; _progSelClass=null; if(typeof renderReport==='function') renderReport(); }
const _PROG_SUBJ_LABEL = {math:'🔢 Maths', fr:'📖 Français', hist:'🏛️ Histoire', geo:'🌍 Géo', en:'🇬🇧 Anglais', svt:'🧬 SVT', pc:'⚗️ Phys-Chimie'};
function _progPanelHtml(d){
 try{
  const yp=(d&&d.yearProgress)||{};
  const order=['PS','MS','GS','CP','CE1','CE2','CM1','CM2','6E','5E','4E','3E'];
  const SUBJ=['math','fr','hist','geo','en','svt','pc'];
  const keyOf=(s,l)=> s==='math' ? l : (s+'|'+l);
  // Matières ayant au moins une progression enregistrée
  const subj=SUBJ.filter(s=>order.some(l=>typeof yp[keyOf(s,l)]==='number' && yp[keyOf(s,l)]>0.001));
  if(!subj.length) return '';
  let curSubj=(_progSelSubject && subj.includes(_progSelSubject)) ? _progSelSubject : subj[0];
  const played=order.filter(l=>typeof yp[keyOf(curSubj,l)]==='number' && yp[keyOf(curSubj,l)]>0.001);
  if(!played.length) return '';
  const sel=(_progSelClass && played.includes(_progSelClass)) ? _progSelClass : played[played.length-1];
  const v=Math.max(0,Math.min(1,yp[keyOf(curSubj,sel)]||0));
  const lab=v<0.34?"Début d'année":(v<0.67?"Milieu d'année":"Fin d'année");
  const col=v<0.34?'#1d9e75':(v<0.67?'#ba7517':'#d85a30');
  // Sélecteur de matière (seulement si plusieurs matières jouées)
  const subjBtns = subj.length>1 ? `<div style="margin-bottom:8px;">`+subj.map(s=>`<button onclick="_progSelectSubject('${s}')" style="border:none;border-radius:8px;padding:5px 10px;margin:2px;font-weight:800;cursor:pointer;background:${s===curSubj?'#c0392b':'rgba(255,255,255,.14)'};color:#fff;">${_PROG_SUBJ_LABEL[s]||s}</button>`).join('')+`</div>` : '';
  const btns=played.map(l=>`<button onclick="_progSelectClass('${l}')" style="border:none;border-radius:8px;padding:5px 11px;margin:2px;font-weight:800;cursor:pointer;background:${l===sel?'#534ab7':'rgba(255,255,255,.14)'};color:#fff;">${l}</button>`).join('');
  const gauge=`<div style="position:relative;height:24px;border-radius:12px;overflow:hidden;display:flex;margin:8px 0 2px;">
     <div style="flex:1;background:#1d9e75;"></div><div style="flex:1;background:#ba7517;"></div><div style="flex:1;background:#d85a30;"></div>
     <div style="position:absolute;top:50%;transform:translate(-50%,-50%);left:${(v*100).toFixed(1)}%;width:4px;height:32px;background:#fff;border-radius:2px;box-shadow:0 0 4px rgba(0,0,0,.6);"></div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:.65em;opacity:.85;"><span>Début</span><span>Milieu</span><span>Fin</span></div>
    <div style="text-align:center;font-weight:800;color:${col};margin-top:5px;">${sel} — ${lab} · ${Math.round(v*100)}%</div>`;
  // Point faible : suivi par notion, disponible pour toute matière jouée (Lot 7, pt.28)
  let weakBox='';
  {
   const w=_progWeakType(curSubj, sel);
   const _label = curSubj==='math' ? (_PROG_OPLABEL[(w&&w.key)]||(w&&w.key)) : _catLabel(curSubj, (w&&w.key));
   weakBox = w
    ? `<div style="margin-top:10px;padding:10px;border:2px solid #e74c3c;border-radius:10px;background:rgba(231,76,60,.13);">
         <div style="font-weight:800;color:#ff6b6b;">⚠️ Point faible n°1 en ${sel}</div>
         <div style="margin-top:3px;">${_label} — ${Math.round(w.rate*100)}% d'erreurs (${w.fail} sur ${w.n})</div>
       </div>`
    : `<div style="margin-top:10px;padding:10px;border:2px dashed rgba(255,255,255,.25);border-radius:10px;font-size:.9em;opacity:.8;">Pas encore assez de réponses en ${sel} pour repérer un point faible.</div>`;
  }
  return `<div style="margin-top:10px;padding:10px;background:rgba(255,255,255,.06);border-radius:10px;">
     <div style="font-weight:800;margin-bottom:6px;">📈 Progression d'année <span style="font-weight:400;opacity:.7;font-size:.8em;">(matière puis classe)</span></div>
     ${subjBtns}
     <div style="margin-bottom:2px;">${btns}</div>
     ${gauge}
     ${weakBox}
    </div>`;
 }catch(e){ return ''; }
}
// Auto-contrôle : signale tout générateur de pool sans phase (.ph)
function _progSelfCheck(opts){
 const verbose=!opts||opts.verbose!==false;
 const rep={missing:[], total:0, tagged:0};
 const scan=(pool,label)=>{ if(!pool) return; const seen=new Set();
  for(const lvl in pool){ for(const f of pool[lvl]){ if(seen.has(f))continue; seen.add(f); rep.total++;
   if(f && f.ph) rep.tagged++; else rep.missing.push(label+':'+((f&&f.name)||'?')); } } };
 try{ scan(typeof _PRIM_POOL!=='undefined'?_PRIM_POOL:null,'primaire'); }catch(e){}
 try{ scan(typeof _MAT_POOL!=='undefined'?_MAT_POOL:null,'maternelle'); }catch(e){}
 try{ scan(typeof _COL_POOL!=='undefined'?_COL_POOL:null,'college'); }catch(e){}
 if(verbose && typeof console!=='undefined'){
  if(rep.missing.length) console.warn('⚠️ [Progression] générateurs SANS phase .ph :', rep.missing);
  else console.log('✅ [Progression] '+rep.tagged+' générateurs, tous avec une phase.');
 }
 return rep;
}
if(typeof window!=='undefined'){ try{ setTimeout(function(){ try{ _progSelfCheck(); }catch(e){} }, 4000); }catch(e){} }

// ═══════════════════════════════════════════════════════
// AIDE VISUELLE APRÈS ERREURS RÉPÉTÉES (Lot 4, audit pédagogique 12e conversation)
// ═══════════════════════════════════════════════════════
// Après 2 échecs consécutifs sur EXACTEMENT la même question (cf. getFailStreak),
// une aide visuelle simple (SVG inline) remplace la répétition de la même correction
// textuelle. Couvre les cas les plus fréquents en maths (droite numérique, groupement,
// fraction) et un cas ciblé en français (contraste homophones) — l'histoire est déjà
// couverte nativement par les visuels de frise affichés dès la question elle-même
// (cf. _histFriseTrouQ), donc rien à ajouter pour cette matière ici. Toute matière
// future peut brancher son propre générateur en étendant getVisualAid() ci-dessous.
function _svgNumberLine(a, b, isAdd){
 if(typeof a!=='number' || typeof b!=='number' || b<=0 || b>20) return null;
 const end = isAdd ? a+b : a-b;
 const lo = Math.min(a,end), hi = Math.max(a,end);
 const span = Math.max(1, hi-lo);
 const W=300, H=64, padL=18, padR=18, y=40;
 const x = v => padL + (v-lo)/span*(W-padL-padR);
 let ticks='';
 for(let v=lo; v<=hi; v++){
  const tall = (v===a || v===end);
  ticks += `<line x1="${x(v)}" y1="${y-(tall?9:5)}" x2="${x(v)}" y2="${y+(tall?9:5)}" stroke="#fff" stroke-opacity="${tall?0.9:0.4}" stroke-width="${tall?2:1}"/>`;
  if(tall) ticks += `<text x="${x(v)}" y="${y+24}" font-size="12" fill="${v===end?'#2ecc71':'#f1c40f'}" text-anchor="middle" font-weight="700">${v}</text>`;
 }
 const arcY = y-22;
 const col = isAdd ? '#2ecc71' : '#e74c3c';
 return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:280px;height:auto;">
  <line x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}" stroke="#fff" stroke-opacity="0.5" stroke-width="1.5"/>
  ${ticks}
  <path d="M ${x(a)} ${y} Q ${(x(a)+x(end))/2} ${arcY} ${x(end)} ${y}" fill="none" stroke="${col}" stroke-width="2.5" marker-end="url(#arrowhead)"/>
  <defs><marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="${col}"/></marker></defs>
 </svg>`;
}
function _svgGroupingDots(groups, perGroup){
 if(typeof groups!=='number' || typeof perGroup!=='number') return null;
 if(groups<1 || perGroup<1 || groups*perGroup>48 || groups>12 || perGroup>12) return null;
 const cell=22, gapG=10, r=6;
 const W = groups*(perGroup*cell+gapG)+gapG;
 const H = cell+16;
 let html='';
 for(let g=0; g<groups; g++){
  const gx = gapG + g*(perGroup*cell+gapG);
  html += `<rect x="${gx-4}" y="4" width="${perGroup*cell+4}" height="${cell+6}" rx="6" fill="#fff" fill-opacity="0.08"/>`;
  for(let i=0; i<perGroup; i++){
   html += `<circle cx="${gx+i*cell+cell/2}" cy="${H/2}" r="${r}" fill="#f1c40f"/>`;
  }
 }
 return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:280px;height:auto;">${html}</svg>`;
}
function _svgFractionBar(n, d){
 if(typeof n!=='number' || typeof d!=='number' || d<2 || d>12 || n<0 || n>d) return null;
 const W=280, H=40, part=W/d;
 let html='';
 for(let i=0;i<d;i++){
  html += `<rect x="${i*part}" y="0" width="${part-2}" height="${H}" rx="3" fill="${i<n?'#2ecc71':'#ffffff22'}" stroke="#fff" stroke-opacity="0.4"/>`;
 }
 return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:280px;height:auto;">${html}</svg>`;
}
function _svgContrastCard(correct, wrong, rule){
 const esc = s => String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 return `<div style="display:flex;gap:8px;align-items:center;justify-content:center;margin-top:4px;flex-wrap:wrap;">
  <span style="background:#2ecc7133;border:2px solid #2ecc71;border-radius:8px;padding:4px 10px;font-weight:800;color:#2ecc71;">✓ ${esc(correct)}</span>
  <span style="opacity:.6;">≠</span>
  <span style="background:#e74c3c22;border:2px solid #e74c3c66;border-radius:8px;padding:4px 10px;font-weight:800;color:#e74c3c;text-decoration:line-through;">${esc(wrong)}</span>
 </div>`;
}
function _mathVisualAid(q){
 if(!q) return null;
 if(q.type==='fraction'){
  const m=String(q.display||'').match(/^(\d+)\/(\d+)\s*de\s*\d+$/);
  if(m) return _svgFractionBar(+m[1], +m[2]);
  return null;
 }
 const op=q.opKey;
 if(op==='+' && typeof q.a==='number' && typeof q.b==='number') return _svgNumberLine(q.a, q.b, true);
 if(op==='-' && typeof q.a==='number' && typeof q.b==='number') return _svgNumberLine(q.a, q.b, false);
 if(op==='x' && typeof q.a==='number' && typeof q.b==='number') return _svgGroupingDots(q.a, q.b);
 if(op==='/'){
  const m=String(q.display||'').match(/^(\d+)\s*[÷\/]\s*(\d+)$/);
  if(m){ const total=+m[1], divisor=+m[2]; if(divisor>0 && total%divisor===0) return _svgGroupingDots(divisor, total/divisor); }
  return null;
 }
 return null;
}
function _frVisualAid(q){
 if(!q || !['fr-homo','fr-homo3','fr5-homo'].includes(q.opKey)) return null;
 if(!Array.isArray(q.choices) || q.choices.length<2) return null;
 const okC = q.choices.find(c=>c.val===q.res);
 const badC = q.choices.find(c=>c.val!==q.res);
 if(!okC || !badC) return null;
 return _svgContrastCard(okC.label!==undefined?okC.html||okC.label:okC.html, badC.html||badC.label, q.hint);
}
/**
 * Point d'entrée générique — toute matière future peut ajouter sa propre branche
 * ici (ou fournir son propre générateur si le pattern diffère significativement).
 */
// ═══════════════════════════════════════════════════════
// DOUBLE CODAGE VISUEL — GÉOMÉTRIE (Lot 8, audit pédagogique 12e conversation, pt.17)
// ═══════════════════════════════════════════════════════
// Contrairement aux aides du Lot 4 (affichées seulement après 2 échecs), ces visuels
// accompagnent la question DÈS SA PREMIÈRE PRÉSENTATION (double codage verbal+visuel,
// Mayer) — posés dans q.visualHtml comme le fait déjà GEO_Q pour son texte (02-data.js).
function _svgSquare(side){
 const W=140,H=140,pad=20,s=W-2*pad;
 return `<svg viewBox="0 0 ${W} ${H+22}" style="width:100%;max-width:160px;height:auto;">
  <rect x="${pad}" y="${pad}" width="${s}" height="${s}" fill="none" stroke="#f1c40f" stroke-width="2.5"/>
  <text x="${W/2}" y="${H+16}" font-size="14" fill="#fff" text-anchor="middle" font-weight="700">côté = ${side}</text>
 </svg>`;
}
function _svgRectangle(l,w){
 const W=180,H=110,pad=16;
 const rw=W-2*pad, ratio=Math.max(0.35,Math.min(1,w/l)); const rh=Math.max(28,(H-2*pad)*ratio);
 const y0=(H-rh)/2;
 return `<svg viewBox="0 0 ${W} ${H+22}" style="width:100%;max-width:200px;height:auto;">
  <rect x="${pad}" y="${y0}" width="${rw}" height="${rh}" fill="none" stroke="#f1c40f" stroke-width="2.5"/>
  <text x="${W/2}" y="${y0-6}" font-size="13" fill="#fff" text-anchor="middle" font-weight="700">${l}</text>
  <text x="${pad-8}" y="${y0+rh/2}" font-size="13" fill="#fff" text-anchor="end" font-weight="700" dominant-baseline="middle">${w}</text>
 </svg>`;
}
function _svgTriangleAngles(a,b){
 const W=180,H=140;
 const p1=[20,120], p2=[160,120], p3=[70,20];
 return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:200px;height:auto;">
  <polygon points="${p1.join(',')} ${p2.join(',')} ${p3.join(',')}" fill="none" stroke="#f1c40f" stroke-width="2.5"/>
  <text x="${p1[0]+18}" y="${p1[1]-6}" font-size="13" fill="#2ecc71" font-weight="800">${a}°</text>
  <text x="${p2[0]-24}" y="${p2[1]-6}" font-size="13" fill="#2ecc71" font-weight="800">${b}°</text>
  <text x="${p3[0]-2}" y="${p3[1]+22}" font-size="15" fill="#e74c3c" font-weight="800">?</text>
 </svg>`;
}
function getVisualAid(subj, q){
 try{
  if(subj==='fr') return _frVisualAid(q);
  if(subj==='hist') return null; // déjà couvert nativement (visuel dès la question, cf. commentaire d'en-tête)
  return _mathVisualAid(q); // maths et défaut
 }catch(e){ return null; }
}

// ═══════════════════════════════════════════════════════
// CONTEXTUALISATION NARRATIVE DES CALCULS (Lot 9, audit pédagogique 12e conversation, pt.15)
// ═══════════════════════════════════════════════════════
// Habille certaines questions d'addition/soustraction/multiplication (mode normal
// uniquement — pas nombres manquants, fractions, géométrie, ni collège abstrait) dans
// une courte mise en situation à la 2e personne ("tu"), pour rapprocher calcul et
// aventure sans dupliquer ni fouiller le contenu narratif existant (07-story.js).
// Le calcul interne (a, b, opérateur, résultat, opKey) reste strictement identique —
// zéro impact sur l'adaptativité (Lots précédents), l'interleaving (Lot 3) ou les
// visuels (Lots 4/8), qui s'appuient tous sur q.a/q.b/q.opKey, jamais sur q.display.
// Limite connue et acceptée : le replay automatique de la révision espacée (Lot 2)
// reconstruit une question depuis un motif "12 - 5" reconnaissable dans q.display —
// une question narrativisée ne matche pas ce motif et ne sera donc pas rejouée via ce
// mécanisme précis (elle reste suivie/comptée normalement, juste pas replayable ainsi).
const _NARRATIVE_ADD = [
 (a,b)=>`Tu trouves ${a} cristaux, puis ${b} de plus. Combien en as-tu en tout ?`,
 (a,b)=>`Tu ramasses ${a} pièces d'or le matin et ${b} le soir. Combien de pièces au total ?`,
 (a,b)=>`Tu as ${a} parchemins, un allié t'en donne ${b} de plus. Combien en as-tu maintenant ?`,
];
const _NARRATIVE_SUB = [
 (a,b)=>`Tu as ${a} potions, tu en utilises ${b}. Combien t'en reste-t-il ?`,
 (a,b)=>`Tu possèdes ${a} cristaux et en donnes ${b} à un allié. Combien t'en reste-t-il ?`,
 (a,b)=>`Le coffre contenait ${a} pièces, tu en dépenses ${b}. Combien en reste-t-il ?`,
];
const _NARRATIVE_MULT = [
 (a,b)=>`Tu trouves ${b} coffres contenant chacun ${a} pièces. Combien de pièces au total ?`,
 (a,b)=>`${a} équipes de ${b} aventuriers partent en expédition. Combien d'aventuriers en tout ?`,
];
const NARRATIVE_WRAP_PROBA = 0.20;
/**
 * Habille éventuellement une question maths normale dans une mise en situation.
 * Ne modifie rien si le type/opérateur ne s'y prête pas, ou par tirage (80% du temps
 * inchangé) — pour ne pas alourdir CHAQUE question et garder aussi du calcul "brut"
 * (utile pour la fluence/récupération pure, cf. section Mémorisation de l'audit).
 */
function narrativeWrapMath(q){
 if(!q || q.type!=='normal' || typeof q.a!=='number' || typeof q.b!=='number') return q;
 const templates = q.opKey==='+' ? _NARRATIVE_ADD : q.opKey==='-' ? _NARRATIVE_SUB : q.opKey==='x' ? _NARRATIVE_MULT : null;
 if(!templates || Math.random()>=NARRATIVE_WRAP_PROBA) return q;
 const tpl = templates[ri(0,templates.length-1)];
 return Object.assign({}, q, {display:tpl(q.a,q.b), _rawDisplay:q.display});
}
