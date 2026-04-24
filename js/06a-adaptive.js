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