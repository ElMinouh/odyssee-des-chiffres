// ═══════════════════════════════════════════════════════
// HISTOIRE — Générateurs de questions (matière 'hist')
// v11.2.0 — Premier incrément : primaire CP → CM2.
//   100% QCM (choix multiples), inspiré des principes neuro-éducatifs :
//   récit avant date, ancrage concret, repérage spatial-temporel systématique,
//   récupération active, entrelacement des types d'exercice.
//   Phasé sur le moteur adaptatif : _progPhase(level) → 1 début / 2 milieu / 3 fin d'année,
//   comme les autres matières (plus de variété en cours d'année).
//   Réutilise l'aventure/carte par défaut (pas de monde dédié pour l'instant, cf. ADR-14).
// ═══════════════════════════════════════════════════════

// Regroupe les opKey précis en 4 grandes catégories pour le suivi parent
// (miroir de _frCatOf en français, cf. 16-francais.js).
function _histCatOf(opKey){
 const k = String(opKey||'');
 if(/frise|avantapres|ordre/.test(k)) return 'frise';
 if(/perso/.test(k)) return 'personnages';
 if(/cause|evt/.test(k)) return 'evenements';
 return 'civilisation'; // objet-époque, vrai/faux, vocabulaire...
}

// ── Helper QCM générique (miroir de _frQ) ──
function _histShuffle(a){ return (typeof shuffle==='function') ? shuffle(a.slice()) : a.slice(); }
function _histQ(display, ok, distractors, opKey, hint, visualHtml){
 const items = _histShuffle([{label:ok, isOk:true}].concat(distractors.map(d=>({label:d, isOk:false}))));
 let res=1;
 const choices = items.map((it,i)=>{ const val=i+1; if(it.isOk) res=val; return {val, label:it.label, html:it.label}; });
 const q = {display, img:'', choices, visualChoices:false, res, opKey:opKey||'hist', type:'normal', subj:'hist', hint:hint||('Réponse : '+ok)};
 if(visualHtml) q.visualHtml=visualHtml;
 return q;
}
// Anti-répétition (miroir de _frRecent)
let _histRecent = [];
const _HIST_RECENT_MAX = 20;
function _histUnique(q){
 if(!q) return q;
 if(_histRecent.indexOf(q.display)>=0) return null;
 _histRecent.push(q.display); if(_histRecent.length>_HIST_RECENT_MAX) _histRecent.shift();
 return q;
}
function _histPick(arr){ return arr[ri(0,arr.length-1)]; }

// ── Ordonner chronologiquement (astuce _matRanger : choisir la BONNE rangée
// parmi plusieurs, plutôt qu'un glisser-déposer) ──
function _histFriseHtml(arr, holeIdx){
 return '<div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap;">'+
  arr.map((label,i)=>`<span style="background:${i===holeIdx?'#e67e22':'rgba(255,255,255,.12)'};color:${i===holeIdx?'#2c1810':'#fff'};border-radius:6px;padding:4px 8px;font-size:.78em;font-weight:700;">${i===holeIdx?'?':label}</span>`).join('')+
  '</div>';
}
function _histOrdreChoiceHtml(arr){
 return arr.map((label,i)=>`${i+1}. ${label}`).join('<br>');
}

// ═══════════════════════════════════════════════════════
// CP — pas d'histoire formelle : repérage temporel simple (avant/après)
// ═══════════════════════════════════════════════════════
const HIST_CP_PAIRES = [
 {ancien:'Lampe à huile 🏮', moderne:'Ampoule électrique 💡'},
 {ancien:'Cheval et carriole 🐎', moderne:'Voiture 🚗'},
 {ancien:'Plume et encre 🪶', moderne:'Ordinateur 💻'},
 {ancien:'Château fort 🏰', moderne:'Immeuble 🏢'},
 {ancien:'Bougie 🕯️', moderne:'Lampe de bureau 💡'},
 {ancien:'Diligence 🐎', moderne:'Train 🚄'},
];
function _histCP_avantApres(){
 const p = _histPick(HIST_CP_PAIRES);
 const askOld = Math.random()<0.5;
 const q = _histQ(
  askOld ? 'Quel objet est le plus ancien ?' : 'Quel objet est le plus récent ?',
  askOld ? p.ancien : p.moderne,
  [askOld ? p.moderne : p.ancien],
  'hist-avantapres',
  askOld ? `${p.ancien} existait avant ${p.moderne}` : `${p.moderne} existe après ${p.ancien}`
 );
 return q;
}
function genQ_HIST_CP(boss,_d){
 _d=_d||0;
 const q=_histUnique(_histCP_avantApres());
 if(!q){ if(_d>10) return _histCP_avantApres(); return genQ_HIST_CP(boss,_d+1); }
 return q;
}

// ═══════════════════════════════════════════════════════
// CE1 — premiers repères chronologiques + Préhistoire
// ═══════════════════════════════════════════════════════
const HIST_CE1_OBJETS = [
 {obj:'Silex taillé', e:'🔪', epoque:'Préhistoire'},
 {obj:'Grotte', e:'⛰️', epoque:'Préhistoire'},
 {obj:'Peinture rupestre', e:'🎨', epoque:'Préhistoire'},
 {obj:'Feu de bois', e:'🔥', epoque:'Préhistoire'},
 {obj:'Smartphone', e:'📱', epoque:"Aujourd'hui"},
 {obj:'Voiture', e:'🚗', epoque:"Aujourd'hui"},
 {obj:'Avion', e:'✈️', epoque:"Aujourd'hui"},
];
function _histCE1_objetEpoque(){
 const o = _histPick(HIST_CE1_OBJETS);
 const autres = ['Préhistoire',"Aujourd'hui"].filter(e=>e!==o.epoque);
 return _histQ(`${o.e} ${o.obj} : à quelle époque appartient cet objet ?`, o.epoque, autres, 'hist-vie', `${o.obj} → ${o.epoque}`);
}
const HIST_CE1_FRISE = ['Préhistoire','Antiquité','Moyen Âge',"Aujourd'hui"];
function _histCE1_friseTrois(){
 const hole = ri(0,HIST_CE1_FRISE.length-1);
 const html = _histFriseHtml(HIST_CE1_FRISE, hole);
 const distracteurs = HIST_CE1_FRISE.filter(p=>p!==HIST_CE1_FRISE[hole]).slice(0,2);
 return _histQ('Quelle époque manque sur la frise ?', HIST_CE1_FRISE[hole], distracteurs, 'hist-frise', `La frise va de la Préhistoire à aujourd'hui, dans l'ordre.`, html);
}
const HIST_CE1_VRAIFAUX = [
 {aff:'Les hommes de la Préhistoire vivaient dans des grottes.', ok:'Vrai'},
 {aff:'Les hommes de la Préhistoire avaient l\u2019électricité.', ok:'Faux'},
 {aff:'Le feu a été maîtrisé par les hommes préhistoriques.', ok:'Vrai'},
 {aff:'Les hommes de la Préhistoire roulaient en voiture.', ok:'Faux'},
 {aff:'Les hommes préhistoriques chassaient pour se nourrir.', ok:'Vrai'},
];
function _histCE1_vraifaux(){
 const f = _histPick(HIST_CE1_VRAIFAUX);
 const autre = f.ok==='Vrai' ? 'Faux' : 'Vrai';
 return _histQ(`${f.aff} Vrai ou faux ?`, f.ok, [autre], 'hist-vie', f.aff);
}
function genQ_HIST_CE1(boss,_d){
 _d=_d||0;
 const phase=(typeof _progPhase==='function')?_progPhase('CE1'):1;
 let pool;
 if(phase<=1)       pool=[_histCE1_objetEpoque, _histCE1_vraifaux];
 else if(phase===2) pool=[_histCE1_objetEpoque, _histCE1_vraifaux, _histCE1_friseTrois];
 else               pool=[_histCE1_objetEpoque, _histCE1_vraifaux, _histCE1_friseTrois];
 const q=_histUnique(_histPick(pool)());
 if(!q){ if(_d>14) return _histCE1_objetEpoque(); return genQ_HIST_CE1(boss,_d+1); }
 return q;
}

// ═══════════════════════════════════════════════════════
// CE2 — Préhistoire approfondie + Antiquité
// ═══════════════════════════════════════════════════════
const HIST_CE2_OBJETS = HIST_CE1_OBJETS.concat([
 {obj:'Toge romaine', e:'🏛️', epoque:'Antiquité'},
 {obj:'Pyramide', e:'🔺', epoque:'Antiquité'},
 {obj:'Hiéroglyphes', e:'📜', epoque:'Antiquité'},
 {obj:'Bouclier de gladiateur', e:'🛡️', epoque:'Antiquité'},
]);
function _histCE2_objetEpoque(){
 const o = _histPick(HIST_CE2_OBJETS);
 const autres = _histShuffle(['Préhistoire','Antiquité',"Aujourd'hui"].filter(e=>e!==o.epoque)).slice(0,2);
 return _histQ(`${o.e} ${o.obj} : à quelle époque appartient cet objet ?`, o.epoque, autres, 'hist-vie', `${o.obj} → ${o.epoque}`);
}
const HIST_CE2_ORDRE = ['Préhistoire','Antiquité','Moyen Âge',"Aujourd'hui"];
function _histCE2_ordre(){
 const n = 3;
 const correct = HIST_CE2_ORDRE.slice(0,n);
 const perms=[]; let g=0;
 while(perms.length<2 && g++<30){
  const p=_histShuffle(correct);
  if(p.join()!==correct.join() && !perms.some(x=>x.join()===p.join())) perms.push(p);
 }
 const options = _histShuffle([correct, ...perms]);
 const optHtml = options.map(o=>_histOrdreChoiceHtml(o));
 const correctHtml = _histOrdreChoiceHtml(correct);
 const distracteurs = optHtml.filter(h=>h!==correctHtml);
 return _histQ('Quelle rangée est dans le bon ordre chronologique ?', correctHtml, distracteurs, 'hist-frise', 'De la plus ancienne à la plus récente.');
}
const HIST_CE2_VIE = [
 {q:'Que faisaient les hommes de la Préhistoire pour se nourrir ?', ok:'Ils chassaient et cueillaient', bad:['Ils allaient au supermarché','Ils commandaient sur internet']},
 {q:'Dans quel bâtiment vivaient de nombreux Romains riches ?', ok:'Une villa', bad:['Un igloo','Un gratte-ciel']},
 {q:'Que construisaient les Égyptiens de l\u2019Antiquité pour leurs pharaons ?', ok:'Des pyramides', bad:['Des tours Eiffel','Des ponts suspendus']},
 {q:'Comment appelle-t-on l\u2019écriture des Égyptiens de l\u2019Antiquité ?', ok:'Les hiéroglyphes', bad:['L\u2019alphabet grec','Le braille']},
];
function _histCE2_viequotidienne(){
 const f = _histPick(HIST_CE2_VIE);
 return _histQ(f.q, f.ok, f.bad, 'hist-vie', f.ok);
}
function genQ_HIST_CE2(boss,_d){
 _d=_d||0;
 const phase=(typeof _progPhase==='function')?_progPhase('CE2'):1;
 let pool;
 if(phase<=1)       pool=[_histCE2_objetEpoque, _histCE1_vraifaux];
 else if(phase===2) pool=[_histCE2_objetEpoque, _histCE1_vraifaux, _histCE2_viequotidienne];
 else               pool=[_histCE2_objetEpoque, _histCE1_vraifaux, _histCE2_viequotidienne, _histCE2_ordre];
 const q=_histUnique(_histPick(pool)());
 if(!q){ if(_d>14) return _histCE2_objetEpoque(); return genQ_HIST_CE2(boss,_d+1); }
 return q;
}

// ═══════════════════════════════════════════════════════
// CM1 — Moyen Âge : construction du royaume de France
// ═══════════════════════════════════════════════════════
const HIST_CM1_PERSO = [
 {nom:'Clovis', indices:['Je suis devenu roi des Francs très jeune.','Je me suis converti au christianisme.','Mon baptême a eu lieu à Reims.']},
 {nom:'Charlemagne', indices:['J\u2019ai été sacré empereur en l\u2019an 800.','J\u2019ai encouragé l\u2019école dans mon empire.','On m\u2019appelle le père de l\u2019Europe.']},
 {nom:'Hugues Capet', indices:['Je suis devenu roi en 987.','J\u2019ai fondé une nouvelle dynastie de rois.','Mes descendants ont régné sur la France pendant des siècles.']},
 {nom:'Jeanne d\u2019Arc', indices:['Je suis une jeune paysanne de Lorraine.','J\u2019ai mené une armée pour libérer Orléans.','Je suis morte brûlée à Rouen.']},
];
function _histCM1_personnage(){
 const p = _histPick(HIST_CM1_PERSO);
 const phase=(typeof _progPhase==='function')?_progPhase('CM1'):1;
 const nInd = phase<=1 ? 3 : phase===2 ? 2 : 1;
 const indices = p.indices.slice(0,nInd).join(' ');
 const autres = _histShuffle(HIST_CM1_PERSO.filter(x=>x.nom!==p.nom).map(x=>x.nom)).slice(0,2);
 return _histQ(`${indices} Qui suis-je ?`, p.nom, autres, 'hist-perso', `${p.nom} : ${p.indices.join(' ')}`);
}
const HIST_CM1_EVT = ['Sacre de Clovis (496)','Sacre de Charlemagne (800)','Hugues Capet, roi de France (987)','Jeanne d\u2019Arc à Orléans (1429)'];
function _histCM1_frise(){
 const n=3;
 const correct = HIST_CM1_EVT.slice(0,n);
 const perms=[]; let g=0;
 while(perms.length<2 && g++<30){
  const p=_histShuffle(correct);
  if(p.join()!==correct.join() && !perms.some(x=>x.join()===p.join())) perms.push(p);
 }
 const options=_histShuffle([correct, ...perms]);
 const optHtml=options.map(o=>_histOrdreChoiceHtml(o));
 const correctHtml=_histOrdreChoiceHtml(correct);
 const distracteurs=optHtml.filter(h=>h!==correctHtml);
 return _histQ('Quelle rangée respecte l\u2019ordre chronologique ?', correctHtml, distracteurs, 'hist-frise', 'Du plus ancien au plus récent.');
}
const HIST_CM1_VOCAB = [
 {q:'Comment appelle-t-on un château fortifié du Moyen Âge ?', ok:'Un château fort', bad:['Une pyramide','Un temple grec']},
 {q:'Comment appelle-t-on un guerrier à cheval du Moyen Âge ?', ok:'Un chevalier', bad:['Un gladiateur','Un légionnaire']},
 {q:'Comment appelle-t-on la cérémonie où un roi devient officiellement roi ?', ok:'Le sacre', bad:['Le tournoi','Le banquet']},
 {q:'Quelle grande épidémie a touché l\u2019Europe au Moyen Âge ?', ok:'La peste noire', bad:['La grippe espagnole','Le choléra']},
];
function _histCM1_vocab(){
 const f=_histPick(HIST_CM1_VOCAB);
 return _histQ(f.q, f.ok, f.bad, 'hist-vie', f.ok);
}
function genQ_HIST_CM1(boss,_d){
 _d=_d||0;
 const phase=(typeof _progPhase==='function')?_progPhase('CM1'):1;
 let pool;
 if(phase<=1)       pool=[_histCM1_personnage, _histCM1_vocab];
 else if(phase===2) pool=[_histCM1_personnage, _histCM1_vocab, _histCM1_frise];
 else               pool=[_histCM1_personnage, _histCM1_vocab, _histCM1_frise];
 const q=_histUnique(_histPick(pool)());
 if(!q){ if(_d>14) return _histCM1_personnage(); return genQ_HIST_CM1(boss,_d+1); }
 return q;
}

// ═══════════════════════════════════════════════════════
// CM2 — Temps modernes → Révolution → Empire → République → XXe-XXIe
// ═══════════════════════════════════════════════════════
const HIST_CM2_EVT = ['Prise de la Bastille (1789)','Sacre de Napoléon (1804)','Fin de la Première Guerre mondiale (1918)','Fin de la Seconde Guerre mondiale (1945)'];
function _histCM2_evenements(){
 const n=3;
 const correct = HIST_CM2_EVT.slice(0,n);
 const perms=[]; let g=0;
 while(perms.length<2 && g++<30){
  const p=_histShuffle(correct);
  if(p.join()!==correct.join() && !perms.some(x=>x.join()===p.join())) perms.push(p);
 }
 const options=_histShuffle([correct, ...perms]);
 const optHtml=options.map(o=>_histOrdreChoiceHtml(o));
 const correctHtml=_histOrdreChoiceHtml(correct);
 const distracteurs=optHtml.filter(h=>h!==correctHtml);
 return _histQ('Quelle rangée respecte l\u2019ordre chronologique ?', correctHtml, distracteurs, 'hist-frise', 'Du plus ancien au plus récent.');
}
const HIST_CM2_CAUSES = [
 {q:'Pourquoi la Révolution française a-t-elle éclaté en 1789 ?', ok:'Le peuple réclamait plus d\u2019égalité et supportait mal les impôts', bad:['Le roi voulait plus de vacances','Il n\u2019y avait plus de pain nulle part en Europe']},
 {q:'Pourquoi Napoléon a-t-il été sacré empereur en 1804 ?', ok:'Il a pris le pouvoir après la Révolution et s\u2019est fait couronner', bad:['Le peuple l\u2019a élu par un vote de tous les Français','Les rois d\u2019Europe le lui ont demandé']},
 {q:'Pourquoi l\u2019Union européenne a-t-elle été créée après 1945 ?', ok:'Pour rapprocher les pays européens et éviter une nouvelle guerre', bad:['Pour organiser des jeux Olympiques communs','Pour créer une seule langue en Europe']},
];
function _histCM2_causes(){
 const f=_histPick(HIST_CM2_CAUSES);
 return _histQ(f.q, f.ok, f.bad, 'hist-cause', f.ok);
}
const HIST_CM2_PERSO = [
 {nom:'Napoléon Bonaparte', indices:['Je suis devenu empereur des Français en 1804.','J\u2019ai mené de nombreuses guerres en Europe.','J\u2019ai fini ma vie en exil sur l\u2019île de Sainte-Hélène.']},
 {nom:'Louis XIV', indices:['On m\u2019appelle le Roi-Soleil.','J\u2019ai fait construire le château de Versailles.','J\u2019ai régné très longtemps sur la France.']},
 {nom:'Charles de Gaulle', indices:['J\u2019ai appelé les Français à résister pendant la guerre.','Mon appel a eu lieu le 18 juin 1940.','Je suis devenu président de la République.']},
];
function _histCM2_personnage(){
 const p=_histPick(HIST_CM2_PERSO);
 const phase=(typeof _progPhase==='function')?_progPhase('CM2'):1;
 const nInd = phase<=1 ? 3 : phase===2 ? 2 : 1;
 const indices=p.indices.slice(0,nInd).join(' ');
 const autres=_histShuffle(HIST_CM2_PERSO.filter(x=>x.nom!==p.nom).map(x=>x.nom)).slice(0,2);
 return _histQ(`${indices} Qui suis-je ?`, p.nom, autres, 'hist-perso', `${p.nom} : ${p.indices.join(' ')}`);
}
function genQ_HIST_CM2(boss,_d){
 _d=_d||0;
 const phase=(typeof _progPhase==='function')?_progPhase('CM2'):1;
 let pool;
 if(phase<=1)       pool=[_histCM2_personnage, _histCM2_causes];
 else if(phase===2) pool=[_histCM2_personnage, _histCM2_causes, _histCM2_evenements];
 else               pool=[_histCM2_personnage, _histCM2_causes, _histCM2_evenements];
 const q=_histUnique(_histPick(pool)());
 if(!q){ if(_d>14) return _histCM2_personnage(); return genQ_HIST_CM2(boss,_d+1); }
 return q;
}

// Table des générateurs histoire — primaire uniquement pour l'instant (CP→CM2).
// Les autres niveaux (maternelle, collège) retombent sur les maths tant qu'ils
// ne sont pas écrits (cf. _subjGen() dans 07-game.js : fn=_GS[GM.level]||_GS.CP||GEN.CP).
const GEN_HIST = { CP: genQ_HIST_CP, CE1: genQ_HIST_CE1, CE2: genQ_HIST_CE2, CM1: genQ_HIST_CM1, CM2: genQ_HIST_CM2 };
