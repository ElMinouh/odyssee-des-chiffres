// ═══════════════════════════════════════════════════════
// FRANÇAIS — Générateurs de questions (matière 'fr')
// v10.6.0 — Premier incrément : CP (familles A décodage, C vocabulaire,
//   D genre/écriture, G compréhension orale). 100% QCM imagé (emoji) au CP,
//   answerable sans savoir lire ; la consigne est lue à voix haute (speak()).
//   Phasé sur le moteur adaptatif : _progPhase(level) → 1 début / 2 milieu / 3 fin d'année.
//   Reading-based (genre écrit, mot bien écrit, lecture éclair) réservé à la phase 3.
// ═══════════════════════════════════════════════════════

// Banque de mots « iconisables » : v=id, w=mot, e=emoji, g=genre, cat=catégorie,
// syl=nb de syllabes orales, snd=sons-voyelles présents (sous-ensemble ciblé).
const FR_WORDS = [
 {v:1, w:'chat',     e:'🐱', g:'m', cat:'animal',   syl:1, snd:['a']},
 {v:2, w:'chien',    e:'🐶', g:'m', cat:'animal',   syl:1, snd:[]},
 {v:3, w:'lapin',    e:'🐰', g:'m', cat:'animal',   syl:2, snd:['a']},
 {v:4, w:'souris',   e:'🐭', g:'f', cat:'animal',   syl:2, snd:['ou','i']},
 {v:5, w:'vache',    e:'🐮', g:'f', cat:'animal',   syl:1, snd:['a']},
 {v:6, w:'poule',    e:'🐔', g:'f', cat:'animal',   syl:1, snd:['ou']},
 {v:7, w:'lion',     e:'🦁', g:'m', cat:'animal',   syl:1, snd:['i','on']},
 {v:8, w:'lune',     e:'🌙', g:'f', cat:'chose',    syl:1, snd:['u']},
 {v:9, w:'soleil',   e:'☀️', g:'m', cat:'chose',    syl:2, snd:['o']},
 {v:10,w:'pomme',    e:'🍎', g:'f', cat:'chose',    syl:1, snd:['o']},
 {v:11,w:'banane',   e:'🍌', g:'f', cat:'chose',    syl:2, snd:['a']},
 {v:12,w:'carotte',  e:'🥕', g:'f', cat:'chose',    syl:2, snd:['a','o']},
 {v:13,w:'gâteau',   e:'🍰', g:'m', cat:'chose',    syl:2, snd:['a','o']},
 {v:14,w:'vélo',     e:'🚲', g:'m', cat:'chose',    syl:2, snd:['o']},
 {v:15,w:'bateau',   e:'⛵', g:'m', cat:'chose',    syl:2, snd:['a','o']},
 {v:16,w:'maison',   e:'🏠', g:'f', cat:'chose',    syl:2, snd:['on']},
 {v:17,w:'ballon',   e:'⚽', g:'m', cat:'chose',    syl:2, snd:['a','on']},
 {v:18,w:'mouton',   e:'🐑', g:'m', cat:'animal',   syl:2, snd:['ou','on']},
 {v:19,w:'cochon',   e:'🐷', g:'m', cat:'animal',   syl:2, snd:['o','on']},
 {v:20,w:'fleur',    e:'🌸', g:'f', cat:'chose',    syl:1, snd:[]},
 {v:21,w:'tortue',   e:'🐢', g:'f', cat:'animal',   syl:2, snd:['o','u']},
 {v:22,w:'citron',   e:'🍋', g:'m', cat:'chose',    syl:2, snd:['i','on']},
 {v:23,w:'avion',    e:'✈️', g:'m', cat:'chose',    syl:2, snd:['a','on']},
 {v:24,w:'camion',   e:'🚚', g:'m', cat:'chose',    syl:2, snd:['a','on']},
 {v:25,w:'sapin',    e:'🌲', g:'m', cat:'chose',    syl:2, snd:['a']},
 {v:26,w:'hibou',    e:'🦉', g:'m', cat:'animal',   syl:2, snd:['i','ou']},
 {v:27,w:'clé',      e:'🔑', g:'f', cat:'chose',    syl:1, snd:[]},
 {v:28,w:'robe',     e:'👗', g:'f', cat:'chose',    syl:1, snd:['o']},
 {v:29,w:'livre',    e:'📖', g:'m', cat:'chose',    syl:1, snd:['i']},
 {v:30,w:'chapeau',  e:'🎩', g:'m', cat:'chose',    syl:2, snd:['a','o']},
 {v:31,w:'dragon',   e:'🐉', g:'m', cat:'animal',   syl:2, snd:['a','on']},
 {v:32,w:'crocodile',e:'🐊', g:'m', cat:'animal',   syl:3, snd:['o','i']},
 {v:33,w:'éléphant', e:'🐘', g:'m', cat:'animal',   syl:3, snd:['a']},
 {v:34,w:'papillon', e:'🦋', g:'m', cat:'animal',   syl:3, snd:['a','i','on']},
 {v:35,w:'parapluie',e:'☂️', g:'m', cat:'chose',    syl:3, snd:['a','i']},
 {v:40,w:'fille',    e:'👧', g:'f', cat:'personne', syl:1, snd:[]},
 {v:41,w:'garçon',   e:'👦', g:'m', cat:'personne', syl:2, snd:['a','on']},
 {v:42,w:'bébé',     e:'👶', g:'m', cat:'personne', syl:2, snd:[]},
 {v:45,w:'roi',      e:'🤴', g:'m', cat:'personne', syl:1, snd:[]},
 {v:46,w:'reine',    e:'👸', g:'f', cat:'personne', syl:1, snd:[]}
];
const _FRW = id => FR_WORDS.find(x=>x.v===id);

// Contraires (emoji des deux côtés)
const FR_OPP = [
 {a:{w:'grand',e:'🐘'},   b:{w:'petit',e:'🐭'}},
 {a:{w:'jour',e:'☀️'},    b:{w:'nuit',e:'🌙'}},
 {a:{w:'chaud',e:'🔥'},   b:{w:'froid',e:'❄️'}},
 {a:{w:'content',e:'😀'}, b:{w:'triste',e:'😢'}},
 {a:{w:'rapide',e:'🐆'},  b:{w:'lent',e:'🐌'}},
 {a:{w:'grand',e:'🌳'},   b:{w:'petit',e:'🌱'}},
 {a:{w:'plein',e:'🪣'},   b:{w:'vide',e:'🕳️'}},
 {a:{w:'propre',e:'✨'},  b:{w:'sale',e:'🟤'}}
];

// Compréhension orale : phrase lue à voix haute, réponses en emoji.
const FR_SENT = [
 {s:'Le chat boit du lait.',          q:'Qui boit du lait ?',          ok:{w:'chat',e:'🐱'},  bad:[{w:'chien',e:'🐶'},{w:'oiseau',e:'🐦'}]},
 {s:'La fille mange une pomme.',      q:'Que mange la fille ?',        ok:{w:'pomme',e:'🍎'}, bad:[{w:'banane',e:'🍌'},{w:'gâteau',e:'🍰'}]},
 {s:'Le chien joue avec le ballon.',  q:'Avec quoi joue le chien ?',   ok:{w:'ballon',e:'⚽'},bad:[{w:'voiture',e:'🚗'},{w:'livre',e:'📖'}]},
 {s:'Léo dort dans son lit.',         q:'Que fait Léo ?',              ok:{w:'il dort',e:'😴'},bad:[{w:'il court',e:'🏃'},{w:'il mange',e:'🍽️'}]},
 {s:'La souris a peur du chat.',      q:'De qui la souris a-t-elle peur ?', ok:{w:'chat',e:'🐱'}, bad:[{w:'poule',e:'🐔'},{w:'lapin',e:'🐰'}]},
 {s:'Papa lave la voiture.',          q:'Que lave papa ?',             ok:{w:'voiture',e:'🚗'},bad:[{w:'vélo',e:'🚲'},{w:'bateau',e:'⛵'}]},
 {s:'Le soleil brille dans le ciel.', q:'Qu\u2019est-ce qui brille ?',  ok:{w:'soleil',e:'☀️'},bad:[{w:'lune',e:'🌙'},{w:'fleur',e:'🌸'}]}
];

const _SOUND_LABEL = {a:'[a]',i:'[i]',o:'[o]',u:'[u]',ou:'[ou]',on:'[on]'};

// ── utilitaires ──
function _frRnd(a){ return a[Math.floor(Math.random()*a.length)]; }
function _frShuffle(a){ const r=a.slice(); for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];} return r; }
function _frSample(arr,n,excludeIds){
 const pool=arr.filter(x=>!excludeIds||!excludeIds.includes(x.v));
 return _frShuffle(pool).slice(0,n);
}
// Construit l'objet QCM : choix [{val,label,html}], res=val du bon choix.
function _frStrip(h){ return String(h).replace(/<br\s*\/?>/gi,' ').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim(); }
function _frQ(display, correctHtml, distractorHtmls, opKey, hint){
 const items=_frShuffle([{html:correctHtml,ok:true}].concat(distractorHtmls.map(h=>({html:h,ok:false}))));
 let res=1;
 const choices=items.map((it,i)=>{ const val=i+1; if(it.ok)res=val; return {val, label:String(val), html:it.html}; });
 return {display, img:'', choices, visualChoices:true, res, opKey:opKey||'fr', type:'normal', subj:'fr', hint:hint||('Réponse : '+_frStrip(correctHtml))};
}
const _frHtmlWord = o => `<span style="font-size:1.7em">${o.e}</span><br>${o.w}`;     // emoji + mot
const _frHtmlEmoji = o => `<span style="font-size:2em">${o.e}</span>`;                  // emoji seul

// Anti-répétition immédiate (dernier display)
let _frLastDisp = '';
function _frUnique(q){ if(!q) return q; if(q.display===_frLastDisp) return null; _frLastDisp=q.display; return q; }

// ── Familles d'exercices CP ──
// A1 : Où entends-tu le son [X] ? (réponses = images)
function _frA_sound(){
 const sounds=['a','i','o','u','ou','on'];
 const snd=_frRnd(sounds);
 const withS=FR_WORDS.filter(w=>w.snd.indexOf(snd)>=0);
 const without=FR_WORDS.filter(w=>w.snd.indexOf(snd)<0);
 if(withS.length<1 || without.length<2) return null;
 const ok=_frRnd(withS);
 const bad=_frShuffle(without).slice(0,2);
 return _frQ(`Où entends-tu le son ${_SOUND_LABEL[snd]} ?`, _frHtmlWord(ok), bad.map(_frHtmlWord), 'fr-son');
}
// A2 : Combien de syllabes ? (réponses = nombres)
function _frA_syll(){
 const w=_frRnd(FR_WORDS.filter(x=>x.syl>=1&&x.syl<=3));
 const set=new Set([w.syl]); while(set.size<3){ const n=1+Math.floor(Math.random()*3); set.add(n); }
 const nums=_frShuffle(Array.from(set));
 const items=nums.map((n,i)=>({val:i+1,label:String(i+1),html:`<span style="font-size:1.6em">${n}</span>`,n}));
 let res=1; items.forEach(it=>{ if(it.n===w.syl)res=it.val; });
 return {display:`Combien de syllabes ? ${w.e} ${w.w}`, img:'', choices:items.map(({val,label,html})=>({val,label,html})), visualChoices:true, res, opKey:'fr-syll', type:'normal', subj:'fr', hint:`${w.w} = ${w.syl} syllabe${w.syl>1?'s':''}`};
}
// C1 : contraires (réponses = images + mot)
function _frC_opp(){
 const p=_frRnd(FR_OPP);
 const side=Math.random()<0.5;
 const cue=side?p.a:p.b, ok=side?p.b:p.a;
 const bad=_frSample(FR_WORDS,2).map(_frHtmlWord);
 return _frQ(`Le contraire de ${cue.e} « ${cue.w} » ?`, _frHtmlWord(ok), bad, 'fr-opp');
}
// C2 : l'intrus d'une catégorie (réponses = images)
function _frC_intrus(){
 const cats=['animal','chose'];
 const cat=_frRnd(cats);
 const inCat=FR_WORDS.filter(w=>w.cat===cat);
 const outCat=FR_WORDS.filter(w=>w.cat!==cat && w.cat!=='personne');
 if(inCat.length<2||outCat.length<1) return null;
 const two=_frShuffle(inCat).slice(0,2);
 const intrus=_frRnd(outCat);
 const label = cat==='animal'?'un animal':'une chose';
 return _frQ(`Trouve l\u2019intrus : lequel n\u2019est pas ${label} ?`, _frHtmlWord(intrus), two.map(_frHtmlWord), 'fr-intrus');
}
// C3 : lequel est un … ? (catégorie, réponses = images)
function _frC_cat(){
 const cat=_frRnd(['animal','chose']);
 const inCat=FR_WORDS.filter(w=>w.cat===cat);
 const outCat=FR_WORDS.filter(w=>w.cat!==cat);
 const ok=_frRnd(inCat);
 const bad=_frShuffle(outCat).slice(0,2);
 const label = cat==='animal'?'un animal':'une chose (un objet)';
 return _frQ(`Lequel est ${label} ?`, _frHtmlWord(ok), bad.map(_frHtmlWord), 'fr-cat');
}
// G : compréhension orale (phrase lue, réponses = images)
function _frG_listen(){
 const it=_frRnd(FR_SENT);
 return _frQ(`🔊 « ${it.s} » ${it.q}`, _frHtmlWord(it.ok), it.bad.map(_frHtmlWord), 'fr-ecoute');
}
// D1 : un ou une ? (phase 3 — lecture du choix « un »/« une »)
function _frD_genre(){
 const w=_frRnd(FR_WORDS.filter(x=>x.cat!=='personne'));
 const okHtml = (w.g==='m'?'un':'une');
 const badHtml = (w.g==='m'?'une':'un');
 return _frQ(`${w.e} ${w.w} : on dit… ?`, okHtml, [badHtml], 'fr-genre');
}
// D2 : quel mot est bien écrit ? (phase 3 — lecture)
const _FR_MISSPELL = {
 chat:['chal','chab'], lune:['lun','luno'], pomme:['pome','ponme'], vélo:['vélau','vélaux'],
 robe:['rob','robbe'], chien:['chein','chian'], souris:['sourie','souriz'], poule:['poul','poulle'],
 fleur:['fleure','flleur'], livre:['livr','livrre'], sapin:['sapain','sappin'], ballon:['balon','ballont']
};
function _frD_spell(){
 const keys=Object.keys(_FR_MISSPELL);
 const k=_frRnd(keys);
 const w=FR_WORDS.find(x=>x.w===k);
 const wrong=_FR_MISSPELL[k];
 return _frQ(`${w.e} Quel mot est bien écrit ?`, `<b>${k}</b>`, wrong.map(x=>x), 'fr-orth');
}
// B : reconnaissance image → mot (phase 3 — lecture). Grande image dans #problem-image.
function _frB_flash(){
 const w=_frRnd(FR_WORDS.filter(x=>x.syl<=2));
 const near=_frSample(FR_WORDS,2,[w.v]);
 const q=_frQ('Quel mot correspond à l\u2019image ?', `<b>${w.w}</b>`, near.map(x=>`${x.w}`), 'fr-flash', `C\u2019est « ${w.w} »`);
 q.visualHtml=`<span style="font-size:3.6em;line-height:1">${w.e}</span>`;
 return q;
}

// ── Sélecteur CP : pioche un type selon la phase d'année ──
function genFR_CP(boss, _d){
 _d=_d||0;
 const phase = (typeof _progPhase==='function') ? _progPhase('CP') : 1;
 let pool;
 if(phase<=1)       pool=[_frA_sound,_frC_intrus,_frC_cat,_frG_listen];
 else if(phase===2) pool=[_frA_sound,_frA_syll,_frC_intrus,_frC_cat,_frC_opp,_frG_listen];
 else               pool=[_frA_sound,_frA_syll,_frC_opp,_frC_cat,_frG_listen,_frD_genre,_frB_flash];
 const q=_frUnique(_frRnd(pool)());
 if(!q){ if(_d>14) return _frA_sound()||_frC_cat(); return genFR_CP(boss,_d+1); }
 return q;
}

// ═══════════════════════════════════════════════════════
// CE1 — lecteur débutant : QCM majoritaire + premières saisies.
// ═══════════════════════════════════════════════════════
function _frText(display, answer, opKey, hint){
 return {display, img:'', textInput:true, answer, res:0, opKey:opKey||'fr', type:'normal', subj:'fr', hint:hint||('Réponse : '+answer)};
}
const FR_SYN = [
 {w:'joli',ok:'beau',bad:['laid','petit']},
 {w:'content',ok:'heureux',bad:['triste','fâché']},
 {w:'rapide',ok:'vite',bad:['lent','mou']},
 {w:'grand',ok:'immense',bad:['minuscule','petit']},
 {w:'gentil',ok:'aimable',bad:['méchant','dur']},
 {w:'drôle',ok:'amusant',bad:['ennuyeux','sérieux']},
 {w:'manger',ok:'dévorer',bad:['boire','dormir']},
 {w:'parler',ok:'discuter',bad:['écouter','crier']}
];
const FR_OPP_TXT = [
 {w:'jour',ok:'nuit'},{w:'grand',ok:'petit'},{w:'chaud',ok:'froid'},{w:'content',ok:'triste'},
 {w:'propre',ok:'sale'},{w:'plein',ok:'vide'},{w:'ouvert',ok:'fermé'},{w:'devant',ok:'derrière'},
 {w:'rapide',ok:'lent'},{w:'monter',ok:'descendre'},{w:'jeune',ok:'vieux'},{w:'lourd',ok:'léger'}
];
const FR_GRAPH = [
 {word:'bateau',son:'o',ok:'eau',bad:['o','au']},
 {word:'jaune',son:'o',ok:'au',bad:['o','eau']},
 {word:'vélo',son:'o',ok:'o',bad:['au','eau']},
 {word:'lapin',son:'in',ok:'in',bad:['ain','ein']},
 {word:'pain',son:'in',ok:'ain',bad:['in','ein']},
 {word:'frein',son:'in',ok:'ein',bad:['in','ain']},
 {word:'classe',son:'s',ok:'ss',bad:['s','c']},
 {word:'citron',son:'s',ok:'c',bad:['s','ss']},
 {word:'sac',son:'s',ok:'s',bad:['ss','c']},
 {word:'photo',son:'f',ok:'ph',bad:['f','v']}
];
const FR_ACC_NOUN=[
 {n:'chat',e:'🐱',g:'m'},{n:'fleur',e:'🌸',g:'f'},{n:'pomme',e:'🍎',g:'f'},
 {n:'lapin',e:'🐰',g:'m'},{n:'ballon',e:'⚽',g:'m'},{n:'voiture',e:'🚗',g:'f'}
];
const FR_ACC_ADJ=[
 {ms:'noir',fs:'noire',mp:'noirs',fp:'noires'},
 {ms:'petit',fs:'petite',mp:'petits',fp:'petites'},
 {ms:'vert',fs:'verte',mp:'verts',fp:'vertes'},
 {ms:'grand',fs:'grande',mp:'grands',fp:'grandes'},
 {ms:'joli',fs:'jolie',mp:'jolis',fp:'jolies'}
];
const FR_CONJ = [
 {inf:'être', p:'je', ok:'suis', bad:['es','est']},
 {inf:'être', p:'tu', ok:'es', bad:['est','suis']},
 {inf:'être', p:'il', ok:'est', bad:['es','et']},
 {inf:'avoir', p:'tu', ok:'as', bad:['a','ai']},
 {inf:'avoir', p:'nous', ok:'avons', bad:['avez','ont']},
 {inf:'aller', p:'je', ok:'vais', bad:['vas','va']},
 {inf:'chanter', p:'tu', ok:'chantes', bad:['chante','chantent']},
 {inf:'jouer', p:'ils', ok:'jouent', bad:['joue','joues']}
];
const FR_VERBS_ER=['chanter','jouer','danser','sauter','parler','regarder','dessiner'];
const FR_PRON=[['je','e'],['tu','es'],['il','e'],['nous','ons'],['vous','ez'],['ils','ent']];
const FR_TEMPS=[
 {ph:'je mangeais', ok:'passé'},{ph:'je mangerai', ok:'futur'},{ph:'je mange', ok:'présent'},
 {ph:'tu jouais', ok:'passé'},{ph:'nous irons', ok:'futur'},{ph:'il dort', ok:'présent'}
];
const FR_NAT=[
 {ph:'la pomme rouge', mot:'rouge', ok:'adjectif', bad:['nom','verbe']},
 {ph:'le chat dort', mot:'dort', ok:'verbe', bad:['nom','adjectif']},
 {ph:'le petit chien', mot:'chien', ok:'nom', bad:['verbe','adjectif']},
 {ph:'un grand arbre', mot:'grand', ok:'adjectif', bad:['nom','déterminant']},
 {ph:'elle chante', mot:'chante', ok:'verbe', bad:['nom','adjectif']}
];
const FR_PHRASETYPE=[
 {ph:'Tu viens ?', ok:'interrogative', bad:['déclarative','exclamative']},
 {ph:'Quelle belle journée !', ok:'exclamative', bad:['interrogative','déclarative']},
 {ph:'Le chat dort.', ok:'déclarative', bad:['interrogative','exclamative']},
 {ph:'Range ta chambre.', ok:'impérative', bad:['interrogative','exclamative']}
];
const FR_DICTEE=['le chat','un vélo','la lune','une pomme','papa','la maison','un ballon','le soleil','une fleur','un ami','la table','le livre'];
const FR_COMP=[
 {t:'Tom a froid. Il met son pull.', q:'Pourquoi met-il son pull ?', ok:'il a froid', bad:['il a faim','il joue']},
 {t:'Lila arrose les fleurs.', q:'Que fait Lila ?', ok:'elle arrose', bad:['elle dort','elle mange']},
 {t:'Le ciel est gris et sombre.', q:'Quel temps va-t-il faire ?', ok:'de la pluie', bad:['du soleil','de la neige']}
];

// Prononciation correcte du phonème pour la synthèse vocale (sinon « [in] » est lu « ine »).
const FR_SOUND_SAY = { o:'o', in:'un', s:'ssse', f:'fffe' };
// Mot à trou : on masque le graphème cible (la réponse n'est donc plus écrite à l'écran),
// la voix prononce le mot entier, l'enfant choisit l'écriture du son manquant.
function _frCE1_graph(set){
 const g=_frRnd(set||FR_GRAPH);
 const blanked=g.word.replace(g.ok,'…');
 const q=_frQ(`Complète le mot que tu entends : « ${blanked} »`, g.ok, g.bad, 'fr-graph', `${g.word} → « ${g.ok} »`);
 q.speakText=g.word;
 return q;
}
function _frCE1_syn(){ const s=_frRnd(FR_SYN); return _frQ(`Synonyme de « ${s.w} » ?`, s.ok, s.bad, 'fr-syn', `${s.w} ≈ ${s.ok}`); }
function _frCE1_oppSaisie(){ const p=_frRnd(FR_OPP_TXT); const side=Math.random()<0.5; const cue=side?p.w:p.ok, ans=side?p.ok:p.w; return _frText(`Écris le contraire de « ${cue} ».`, ans, 'fr-oppw', `Le contraire de « ${cue} » : ${ans}`); }
function _frCE1_nature(){ const n=_frRnd(FR_NAT); return _frQ(`Nature de « ${n.mot} » dans « ${n.ph} » ?`, n.ok, n.bad, 'fr-nature', `« ${n.mot} » → ${n.ok}`); }
function _frCE1_conj(){ const c=_frRnd(FR_CONJ); return _frQ(`Conjugue : ${c.p} ___ (${c.inf})`, c.ok, c.bad, 'fr-conj', `${c.p} ${c.ok}`); }
function _frCE1_conjSaisie(){ const inf=_frRnd(FR_VERBS_ER); const pr=_frRnd(FR_PRON); const ans=inf.slice(0,-2)+pr[1]; return _frText(`Conjugue « ${inf} » au présent : ${pr[0]} ___`, ans, 'fr-conjw', `${pr[0]} ${ans}`); }
function _frCE1_temps(){ const t=_frRnd(FR_TEMPS); const bad=['passé','présent','futur'].filter(x=>x!==t.ok); return _frQ(`Quel temps ? « ${t.ph} »`, t.ok, bad, 'fr-temps', `« ${t.ph} » → ${t.ok}`); }
function _frCE1_ptype(){ const t=_frRnd(FR_PHRASETYPE); return _frQ(`Quel type de phrase ? « ${t.ph} »`, t.ok, t.bad, 'fr-ptype', `« ${t.ph} » → ${t.ok}`); }
function _frCE1_comp(){ const c=_frRnd(FR_COMP); return _frQ(`« ${c.t} » ${c.q}`, c.ok, c.bad, 'fr-comp', c.ok); }
function _frCE1_accord(){
 const n=_frRnd(FR_ACC_NOUN), a=_frRnd(FR_ACC_ADJ);
 const plural=Math.random()<0.5;
 const ok=a[(n.g==='m'?'m':'f')+(plural?'p':'s')];
 const forms=[a.ms,a.fs,a.mp,a.fp].filter((x,i,arr)=>arr.indexOf(x)===i);
 const bad=_frShuffle(forms.filter(f=>f!==ok)).slice(0,2);
 const art=plural?'les':(n.g==='m'?'le':'la');
 const nounDisp=n.n+(plural?'s':'');
 const verb=plural?'sont':'est';
 return _frQ(`Accorde : « ${art} ${nounDisp} ${verb} ___ » (${a.ms})`, ok, bad, 'fr-accord', `${art} ${nounDisp} ${verb} ${ok}`);
}
function _frCE1_dictee(){ const grp=_frRnd(FR_DICTEE); const q=_frText('🔊 Écris ce que tu entends.', grp, 'fr-dictee', `On écrit : « ${grp} »`); q.speakText=grp; return q; }

function genFR_CE1(boss,_d){
 _d=_d||0;
 const phase=(typeof _progPhase==='function')?_progPhase('CE1'):1;
 const GS=FR_GRAPH.filter(g=>g.son==='o'||g.son==='in');
 let pool;
 if(phase<=1)       pool=[()=>_frCE1_graph(GS),_frCE1_syn,_frCE1_nature,_frCE1_conj,_frCE1_dictee];
 else if(phase===2) pool=[()=>_frCE1_graph(GS),_frCE1_syn,_frCE1_nature,_frCE1_conj,_frCE1_accord,_frCE1_oppSaisie,_frCE1_conjSaisie,_frCE1_ptype,_frCE1_temps,_frCE1_dictee];
 else               pool=[_frCE1_graph,_frCE1_syn,_frCE1_nature,_frCE1_conj,_frCE1_accord,_frCE1_conjSaisie,_frCE1_ptype,_frCE1_temps,_frCE1_dictee,_frCE1_comp];
 const q=_frUnique(_frRnd(pool)());
 if(!q){ if(_d>14) return _frCE1_syn(); return genFR_CE1(boss,_d+1); }
 return q;
}

// ═══════════════════════════════════════════════════════
// CE2 — homophones, imparfait/futur/passé composé, vocabulaire enrichi,
//   dictées de phrases. Davantage de saisie.
// ═══════════════════════════════════════════════════════
const FR_HOMO = [
 {ph:'Il ___ un beau chien.', ok:'a', bad:['à'], rule:'a = verbe avoir (« avait »)'},
 {ph:'Nous allons ___ la mer.', ok:'à', bad:['a'], rule:'à = petit mot invariable'},
 {ph:'Le ciel ___ bleu.', ok:'est', bad:['et'], rule:'est = verbe être (« était »)'},
 {ph:'Léa ___ Tom jouent.', ok:'et', bad:['est'], rule:'et = « et puis »'},
 {ph:'Ils ___ deux vélos.', ok:'ont', bad:['on'], rule:'ont = verbe avoir (« avaient »)'},
 {ph:'___ mange à midi.', ok:'on', bad:['ont'], rule:'on = il / elle'},
 {ph:'Les gâteaux ___ chauds.', ok:'sont', bad:['son'], rule:'sont = « étaient »'},
 {ph:'Marie a perdu ___ stylo.', ok:'son', bad:['sont'], rule:'son = « mon / ton »'},
 {ph:'Tu veux du lait ___ du jus ?', ok:'ou', bad:['où'], rule:'ou = « ou bien »'},
 {ph:'___ est ta maison ?', ok:'où', bad:['ou'], rule:'où = un lieu'}
];
const FR_CONJ2 = [
 {p:'je', inf:'chanter', t:'imparfait', ok:'chantais', bad:['chante','chanterai']},
 {p:'il', inf:'être', t:'imparfait', ok:'était', bad:['est','sera']},
 {p:'nous', inf:'avoir', t:'imparfait', ok:'avions', bad:['avons','aurons']},
 {p:'tu', inf:'jouer', t:'futur', ok:'joueras', bad:['joues','jouais']},
 {p:'je', inf:'aller', t:'futur', ok:'irai', bad:['vais','allais']},
 {p:'ils', inf:'finir', t:'futur', ok:'finiront', bad:['finissent','finiraient']}
];
const FR_PC = [
 {ph:'Hier, j\u2019___ mangé une pomme.', ok:'ai', bad:['est','a'], rule:'avoir : j\u2019ai mangé'},
 {ph:'Tu ___ fini ton travail.', ok:'as', bad:['a','es'], rule:'avoir : tu as fini'},
 {ph:'Nous ___ joué au foot.', ok:'avons', bad:['sommes','ont'], rule:'avoir : nous avons joué'},
 {ph:'Il ___ tombé dans l\u2019eau.', ok:'est', bad:['a','as'], rule:'être : il est tombé'}
];
const FR_TEMPS2 = [
 {ph:'je chantais', ok:'imparfait', bad:['présent','futur']},
 {ph:'je chanterai', ok:'futur', bad:['imparfait','présent']},
 {ph:'je chante', ok:'présent', bad:['imparfait','futur']},
 {ph:'j\u2019ai chanté', ok:'passé composé', bad:['présent','futur']}
];
const FR_PREF = [
 {w:'heureux', ok:'malheureux', bad:['superheureux','reheureux'], hint:'préfixe mal-'},
 {w:'possible', ok:'impossible', bad:['despossible','nonpossible'], hint:'préfixe im-'},
 {w:'content', ok:'mécontent', bad:['recontent','incontent'], hint:'préfixe mé-'},
 {w:'connu', ok:'inconnu', bad:['déconnu','préconnu'], hint:'préfixe in-'}
];
const FR_FAM = [
 {rad:'dent', ok:'dentiste', bad:['pompier','jardin']},
 {rad:'terre', ok:'terrain', bad:['bateau','soleil']},
 {rad:'fleur', ok:'fleuriste', bad:['boulanger','docteur']},
 {rad:'lait', ok:'laitier', bad:['fermier','berger']}
];
const FR_MBP = [
 {w:'co_bien', ok:'m', bad:['n'], full:'combien'},
 {w:'ta_bour', ok:'m', bad:['n'], full:'tambour'},
 {w:'e_porter', ok:'m', bad:['n'], full:'emporter'},
 {w:'to_ber', ok:'m', bad:['n'], full:'tomber'},
 {w:'mo_ter', ok:'n', bad:['m'], full:'monter'}
];
const FR_DICTEE2 = ['le petit chat dort','papa lit un livre','les oiseaux chantent','je mange une pomme rouge','nous jouons dans la cour','la fille ferme la porte'];
const FR_COMP2 = [
 {t:'Lucas a oublié son parapluie. Quand il sort, il est tout mouillé.', q:'Pourquoi Lucas est-il mouillé ?', ok:'il pleut', bad:['il a chaud','il a soif']},
 {t:'Emma range ses affaires et éteint la lumière.', q:'Que va faire Emma ?', ok:'dormir', bad:['jouer','manger']},
 {t:'Le marchand pèse les pommes et annonce le prix.', q:'Où se passe la scène ?', ok:'au marché', bad:['à l\u2019école','à la piscine']}
];

function _frCE2_homo(){ const h=_frRnd(FR_HOMO); return _frQ(h.ph, h.ok, h.bad, 'fr-homo', h.rule); }
function _frCE2_conj2(){ const c=_frRnd(FR_CONJ2); const tp=c.t==='imparfait'?"à l'imparfait":"au futur"; return _frQ(`Conjugue « ${c.inf} » ${tp} : ${c.p} ___`, c.ok, c.bad, 'fr-conj2', `${c.p} ${c.ok} (${c.t})`); }
function _frCE2_pc(){ const c=_frRnd(FR_PC); return _frQ(c.ph, c.ok, c.bad, 'fr-pc', c.rule); }
function _frCE2_temps(){ const t=_frRnd(FR_TEMPS2); return _frQ(`Quel temps ? « ${t.ph} »`, t.ok, t.bad, 'fr-temps2', `« ${t.ph} » → ${t.ok}`); }
function _frCE2_pref(){ const p=_frRnd(FR_PREF); return _frQ(`Le contraire de « ${p.w} » (avec un préfixe) ?`, p.ok, p.bad, 'fr-pref', p.hint); }
function _frCE2_fam(){ const f=_frRnd(FR_FAM); return _frQ(`Quel mot est de la famille de « ${f.rad} » ?`, f.ok, f.bad, 'fr-fam', `${f.ok} vient de « ${f.rad} »`); }
function _frCE2_mbp(){ const m=_frRnd(FR_MBP); return _frQ(`Complète : « ${m.w.replace('_','…')} » → m ou n ?`, m.ok, m.bad, 'fr-mbp', `On écrit « ${m.full} » (devant m, b, p → on met m).`); }
function _frCE2_dictee(){ const grp=_frRnd(FR_DICTEE2); const q=_frText('🔊 Écris la phrase que tu entends.', grp, 'fr-dictee2', `On écrit : « ${grp} »`); q.speakText=grp; return q; }
function _frCE2_comp(){ const c=_frRnd(FR_COMP2); return _frQ(`« ${c.t} » ${c.q}`, c.ok, c.bad, 'fr-comp2', c.ok); }

function genFR_CE2(boss,_d){
 _d=_d||0;
 const phase=(typeof _progPhase==='function')?_progPhase('CE2'):1;
 let pool;
 if(phase<=1)       pool=[_frCE2_homo,_frCE2_conj2,_frCE1_nature,_frCE1_syn,_frCE1_graph,_frCE2_temps,_frCE2_dictee];
 else if(phase===2) pool=[_frCE2_homo,_frCE2_conj2,_frCE1_accord,_frCE1_conjSaisie,_frCE1_oppSaisie,_frCE2_pref,_frCE2_mbp,_frCE2_temps,_frCE1_ptype,_frCE2_dictee];
 else               pool=[_frCE2_homo,_frCE2_pc,_frCE2_conj2,_frCE2_temps,_frCE2_fam,_frCE1_conjSaisie,_frCE2_mbp,_frCE2_comp,_frCE1_oppSaisie,_frCE2_dictee];
 const q=_frUnique(_frRnd(pool)());
 if(!q){ if(_d>14) return _frCE2_homo(); return genFR_CE2(boss,_d+1); }
 return q;
}

// ═══════════════════════════════════════════════════════
// CM1 / CM2 — cycle 3 : homophones étendus, participe passé, pluriels
//   particuliers, verbes irréguliers, COD, sens propre/figuré.
// ═══════════════════════════════════════════════════════
const FR_HOMO3 = [
 {ph:'J\u2019aime ___ chaussures-ci.', ok:'ces', bad:['ses'], rule:'ces = celles-ci (on montre)'},
 {ph:'Il met ___ gants à lui.', ok:'ses', bad:['ces'], rule:'ses = les siens (à lui)'},
 {ph:'___ une belle journée.', ok:"c'est", bad:["s'est"], rule:"c'est = cela est"},
 {ph:'Il ___ lavé les mains.', ok:"s'est", bad:["c'est"], rule:"s'est = verbe pronominal"},
 {ph:'Pose le livre ___ .', ok:'là', bad:['la'], rule:'là = un lieu (ici)'},
 {ph:'Je prends ___ pomme.', ok:'la', bad:['là'], rule:'la = déterminant'},
 {ph:'Les enfants rangent ___ chambre.', ok:'leur', bad:['leurs'], rule:'leur + nom singulier'},
 {ph:'Ils ont perdu ___ clés.', ok:'leurs', bad:['leur'], rule:'leurs + nom pluriel'},
 {ph:'Il mange ___ de pain.', ok:'peu', bad:['peut'], rule:'peu = pas beaucoup'},
 {ph:'Elle ___ courir vite.', ok:'peut', bad:['peu'], rule:'peut = verbe pouvoir'}
];
const FR_PP = [
 {ph:'Elle est ___ (partir).', ok:'partie', bad:['parti','partis'], rule:'avec être → accord avec le sujet (elle → e)'},
 {ph:'Ils sont ___ (tomber).', ok:'tombés', bad:['tombé','tombée'], rule:'ils → és'},
 {ph:'Les filles sont ___ (arriver).', ok:'arrivées', bad:['arrivé','arrivés'], rule:'elles → ées'},
 {ph:'Il est ___ (rester).', ok:'resté', bad:['restée','restés'], rule:'il → é'}
];
const FR_PLUR = [
 {w:'un cheval', ok:'des chevaux', bad:['des chevals','des chevaus'], rule:'-al → -aux'},
 {w:'un bijou', ok:'des bijoux', bad:['des bijous','des bijoues'], rule:'bijou prend un -x'},
 {w:'un gâteau', ok:'des gâteaux', bad:['des gâteaus','des gâteauxs'], rule:'-eau → -eaux'},
 {w:'un jeu', ok:'des jeux', bad:['des jeus','des jeuxs'], rule:'-eu → -eux'},
 {w:'un journal', ok:'des journaux', bad:['des journals','des journeaux'], rule:'-al → -aux'}
];
const FR_SENS = [
 {ph:'Il dévore son livre.', ok:'figuré', bad:['propre'], rule:'il lit avec passion (pas avec la bouche)'},
 {ph:'Le lion dévore sa proie.', ok:'propre', bad:['figuré'], rule:'il mange vraiment'},
 {ph:'Tu as un cœur d\u2019or.', ok:'figuré', bad:['propre'], rule:'tu es généreux (pas en métal)'},
 {ph:'La branche de l\u2019arbre casse.', ok:'propre', bad:['figuré'], rule:'une vraie branche'}
];
const FR_CONJ3 = [
 {p:'je', inf:'faire', t:'présent', ok:'fais', bad:['fait','faisons']},
 {p:'vous', inf:'faire', t:'présent', ok:'faites', bad:['faisez','faitez']},
 {p:'il', inf:'dire', t:'présent', ok:'dit', bad:['dis','disent']},
 {p:'nous', inf:'venir', t:'présent', ok:'venons', bad:['venez','viennons']},
 {p:'je', inf:'prendre', t:'présent', ok:'prends', bad:['prend','prener']},
 {p:'ils', inf:'voir', t:'présent', ok:'voient', bad:['voyent','voivent']},
 {p:'je', inf:'pouvoir', t:'présent', ok:'peux', bad:['peut','pouve']}
];
const FR_COD = [
 {ph:'Le chat mange la souris.', ok:'la souris', bad:['le chat','mange']},
 {ph:'Léa lit un livre.', ok:'un livre', bad:['Léa','lit']},
 {ph:'Papa conduit la voiture.', ok:'la voiture', bad:['Papa','conduit']}
];
const FR_DICTEE3 = ['les enfants jouent dans le grand jardin','ma sœur lit une belle histoire','nous mangeons des fruits au goûter','le maître écrit la leçon au tableau'];

function _frCM_homo3(){ const h=_frRnd(FR_HOMO3); return _frQ(h.ph, h.ok, h.bad, 'fr-homo3', h.rule); }
function _frCM_pp(){ const p=_frRnd(FR_PP); return _frQ(p.ph, p.ok, p.bad, 'fr-pp', p.rule); }
function _frCM_plur(){ const p=_frRnd(FR_PLUR); return _frQ(`Quel est le pluriel de « ${p.w} » ?`, p.ok, p.bad, 'fr-plur', p.rule); }
function _frCM_sens(){ const s=_frRnd(FR_SENS); return _frQ(`« ${s.ph} » Ce sens est… ?`, s.ok, s.bad, 'fr-sens', s.rule); }
function _frCM_conj3(){ const c=_frRnd(FR_CONJ3); return _frQ(`Conjugue « ${c.inf} » au présent : ${c.p} ___`, c.ok, c.bad, 'fr-conj3', `${c.p} ${c.ok}`); }
function _frCM_cod(){ const c=_frRnd(FR_COD); return _frQ(`« ${c.ph} » Quel est le complément d\u2019objet (COD) ?`, c.ok, c.bad, 'fr-cod', `COD = « ${c.ok} »`); }
function _frCM_dictee(){ const grp=_frRnd(FR_DICTEE3); const q=_frText('🔊 Écris la phrase que tu entends.', grp, 'fr-dictee3', `On écrit : « ${grp} »`); q.speakText=grp; return q; }

function genFR_CM1(boss,_d){
 _d=_d||0;
 const lvl=(typeof GM!=='undefined'&&GM.level)||'CM1';
 const phase=(typeof _progPhase==='function')?_progPhase(lvl):1;
 let pool;
 if(phase<=1)       pool=[_frCM_homo3,_frCE2_homo,_frCM_conj3,_frCE2_conj2,_frCM_cod,_frCE1_syn,_frCM_dictee];
 else if(phase===2) pool=[_frCM_homo3,_frCM_pp,_frCM_conj3,_frCE2_conj2,_frCE2_pc,_frCM_plur,_frCM_sens,_frCE1_conjSaisie,_frCM_cod,_frCM_dictee];
 else               pool=[_frCM_homo3,_frCM_pp,_frCM_plur,_frCM_sens,_frCE2_temps,_frCM_conj3,_frCE1_conjSaisie,_frCE2_comp,_frCM_cod,_frCM_dictee];
 const q=_frUnique(_frRnd(pool)());
 if(!q){ if(_d>14) return _frCM_homo3(); return genFR_CM1(boss,_d+1); }
 return q;
}

// ═══════════════════════════════════════════════════════
// 6e — fin de cycle 3 : natures & fonctions, temps de l'indicatif,
//   phrase simple/complexe, figures, étymologie, homophones, compréhension.
//   Davantage de saisie qu'au primaire.
// ═══════════════════════════════════════════════════════
const FR6_NAT = [
 {w:'chat', nat:'nom', bad:['verbe','adjectif']},
 {w:'maison', nat:'nom', bad:['adjectif','adverbe']},
 {w:'manger', nat:'verbe', bad:['nom','adverbe']},
 {w:'courir', nat:'verbe', bad:['nom','adjectif']},
 {w:'rouge', nat:'adjectif', bad:['nom','adverbe']},
 {w:'grand', nat:'adjectif', bad:['nom','verbe']},
 {w:'il', nat:'pronom', bad:['déterminant','nom']},
 {w:'elle', nat:'pronom', bad:['déterminant','adjectif']},
 {w:'vite', nat:'adverbe', bad:['adjectif','verbe']},
 {w:'souvent', nat:'adverbe', bad:['adjectif','préposition']},
 {w:'dans', nat:'préposition', bad:['conjonction','adverbe']},
 {w:'sur', nat:'préposition', bad:['adverbe','pronom']},
 {w:'et', nat:'conjonction', bad:['préposition','adverbe']},
 {w:'mais', nat:'conjonction', bad:['préposition','pronom']},
 {w:'trois', nat:'déterminant', bad:['nom','adjectif']},
 {w:'cette', nat:'déterminant', bad:['pronom','adjectif']}
];
const FR6_FONC = [
 {ph:'Le chien dort.', grp:'Le chien', f:'sujet', bad:['COD','complément circonstanciel']},
 {ph:'Léa mange une pomme.', grp:'une pomme', f:'COD', bad:['sujet','complément circonstanciel']},
 {ph:'Il part demain.', grp:'demain', f:'complément circonstanciel', bad:['sujet','COD']},
 {ph:'Les oiseaux chantent.', grp:'Les oiseaux', f:'sujet', bad:['COD','complément circonstanciel']},
 {ph:'Tom lit un livre.', grp:'un livre', f:'COD', bad:['sujet','complément circonstanciel']},
 {ph:'Nous jouons dans la cour.', grp:'dans la cour', f:'complément circonstanciel', bad:['sujet','COD']}
];
const FR6_TEMPS = [
 {ph:'je mange', ok:'présent', bad:['imparfait','futur']},
 {ph:'je mangeais', ok:'imparfait', bad:['présent','futur']},
 {ph:'je mangerai', ok:'futur', bad:['imparfait','présent']},
 {ph:'tu finissais', ok:'imparfait', bad:['présent','futur']},
 {ph:'nous irons', ok:'futur', bad:['imparfait','présent']},
 {ph:'elle chante', ok:'présent', bad:['imparfait','futur']}
];
const FR6_PHRASE = [
 {ph:'Le chat dort.', ok:'simple', bad:['complexe'], rule:'1 seul verbe conjugué'},
 {ph:'Il prend un crayon et trace un trait.', ok:'complexe', bad:['simple'], rule:'plusieurs verbes conjugués'},
 {ph:'Marie lit un livre.', ok:'simple', bad:['complexe'], rule:'1 verbe conjugué'},
 {ph:'Quand il pleut, je reste à la maison.', ok:'complexe', bad:['simple'], rule:'2 verbes conjugués'},
 {ph:'Les enfants courent dans le parc.', ok:'simple', bad:['complexe'], rule:'1 verbe conjugué'}
];
const FR6_FIG = [
 {ph:'Il est fort comme un lion.', ok:'comparaison', bad:['métaphore','personnification'], rule:'« comme » → comparaison'},
 {ph:'Cet homme est un lion.', ok:'métaphore', bad:['comparaison','personnification'], rule:'image sans « comme »'},
 {ph:'Le vent murmure dans les arbres.', ok:'personnification', bad:['comparaison','métaphore'], rule:'le vent agit comme une personne'},
 {ph:'Ses yeux brillent comme des étoiles.', ok:'comparaison', bad:['métaphore','personnification'], rule:'« comme » → comparaison'},
 {ph:'La lune sourit dans le ciel.', ok:'personnification', bad:['comparaison','métaphore'], rule:'la lune agit comme une personne'}
];
const FR6_ETYM = [
 {pre:'télé-', ok:'à distance', bad:['sous','autour'], ex:'télévision, téléphone'},
 {pre:'aqua-', ok:'l\u2019eau', bad:['l\u2019air','le feu'], ex:'aquarium, aquatique'},
 {pre:'bio-', ok:'la vie', bad:['la terre','le temps'], ex:'biologie'},
 {pre:'géo-', ok:'la Terre', bad:['l\u2019eau','le ciel'], ex:'géographie'},
 {pre:'multi-', ok:'plusieurs', bad:['un seul','la moitié'], ex:'multicolore'}
];
function _fr6_nat(){ const n=_frRnd(FR6_NAT); return _frQ(`Quelle est la nature du mot « ${n.w} » ?`, n.nat, n.bad, 'fr6-nat', `« ${n.w} » → ${n.nat}`); }
function _fr6_fonc(){ const x=_frRnd(FR6_FONC); return _frQ(`« ${x.ph} » Quelle est la fonction de « ${x.grp} » ?`, x.f, x.bad, 'fr6-fonc', `« ${x.grp} » → ${x.f}`); }
function _fr6_temps(){ const t=_frRnd(FR6_TEMPS); return _frQ(`Quel temps ? « ${t.ph} »`, t.ok, t.bad, 'fr6-temps', `« ${t.ph} » → ${t.ok}`); }
function _fr6_phrase(){ const p=_frRnd(FR6_PHRASE); return _frQ(`« ${p.ph} » Cette phrase est… ?`, p.ok, p.bad, 'fr6-phrase', p.rule); }
function _fr6_fig(){ const f=_frRnd(FR6_FIG); return _frQ(`Quelle figure de style ? « ${f.ph} »`, f.ok, f.bad, 'fr6-fig', f.rule); }
function _fr6_etym(){ const e=_frRnd(FR6_ETYM); return _frQ(`Que veut dire la racine « ${e.pre} » ? (ex. ${e.ex})`, e.ok, e.bad, 'fr6-etym', `${e.pre} = ${e.ok}`); }

function genFR_6E(boss,_d){
 _d=_d||0;
 const phase=(typeof _progPhase==='function')?_progPhase('6E'):1;
 let pool;
 if(phase<=1)       pool=[_fr6_nat,_fr6_fonc,_fr6_temps,_frCE2_homo,_fr6_phrase,_frCE1_syn,_fr6_etym];
 else if(phase===2) pool=[_fr6_nat,_fr6_fonc,_frCM_cod,_frCE1_conjSaisie,_frCE2_conj2,_frCE2_pref,_frCM_sens,_frCE1_oppSaisie,_fr6_phrase,_fr6_temps];
 else               pool=[_fr6_nat,_fr6_fonc,_frCM_cod,_fr6_fig,_frCM_homo3,_fr6_etym,_frCE2_comp,_frCE1_conjSaisie,_frCM_sens,_fr6_phrase];
 const q=_frUnique(_frRnd(pool)());
 if(!q){ if(_d>14) return _fr6_nat(); return genFR_6E(boss,_d+1); }
 return q;
}

// ═══════════════════════════════════════════════════════
// 5e — entrée en cycle 4 : COI/attribut, subordonnée relative, passé simple/
//   conditionnel/impératif/subjonctif, valeurs des temps, accord PP avec être,
//   figures enrichies, niveaux de langue, homophones avancés.
// ═══════════════════════════════════════════════════════
const FR5_FONC = [
 {ph:'Je parle à Marie.', grp:'à Marie', f:'COI', bad:['COD','attribut du sujet']},
 {ph:'Il pense à ses vacances.', grp:'à ses vacances', f:'COI', bad:['COD','sujet']},
 {ph:'Le ciel est bleu.', grp:'bleu', f:'attribut du sujet', bad:['COD','COI']},
 {ph:'Elle mange une pomme.', grp:'une pomme', f:'COD', bad:['COI','attribut du sujet']},
 {ph:'Cette fille semble heureuse.', grp:'heureuse', f:'attribut du sujet', bad:['COD','COI']},
 {ph:'Je me souviens de toi.', grp:'de toi', f:'COI', bad:['COD','attribut du sujet']}
];
const FR5_REL = [
 {ph:'Le livre que je lis est passionnant.', ok:'que', bad:['qui','dont']},
 {ph:'La fille qui chante est ma sœur.', ok:'qui', bad:['que','où']},
 {ph:'La ville où je vis est belle.', ok:'où', bad:['qui','dont']},
 {ph:'L\u2019ami dont je parle arrive.', ok:'dont', bad:['que','où']}
];
const FR5_MODE = [
 {ph:'il chanta', ok:'passé simple', bad:['imparfait','présent']},
 {ph:'je chanterais', ok:'conditionnel présent', bad:['futur','imparfait']},
 {ph:'que je chante', ok:'subjonctif présent', bad:['présent','impératif']},
 {ph:'chante !', ok:'impératif', bad:['présent','subjonctif']},
 {ph:'il finit (hier)', ok:'passé simple', bad:['présent','futur']},
 {ph:'nous irions', ok:'conditionnel présent', bad:['futur','imparfait']}
];
const FR5_VAL = [
 {ph:'La Terre tourne autour du Soleil.', ok:'vérité générale', bad:['action passée','futur proche'], rule:'présent de vérité générale'},
 {ph:'Tous les matins, il courait.', ok:'habitude', bad:['action unique','ordre'], rule:'imparfait d\u2019habitude'},
 {ph:'Soudain, il bondit.', ok:'action brève', bad:['description','habitude'], rule:'passé simple : action soudaine'}
];
const FR5_FIG = [
 {ph:'Je te l\u2019ai dit mille fois !', ok:'hyperbole', bad:['comparaison','énumération'], rule:'exagération'},
 {ph:'Il achète des pommes, des poires, des cerises, des fraises.', ok:'énumération', bad:['métaphore','hyperbole'], rule:'liste d\u2019éléments'},
 {ph:'Cet homme est un lion.', ok:'métaphore', bad:['comparaison','énumération'], rule:'image sans « comme »'},
 {ph:'Le vent murmure.', ok:'personnification', bad:['hyperbole','comparaison'], rule:'un objet agit comme une personne'},
 {ph:'Fort comme un bœuf.', ok:'comparaison', bad:['métaphore','hyperbole'], rule:'« comme »'}
];
const FR5_REG = [
 {w:'bagnole', ok:'familier', bad:['courant','soutenu']},
 {w:'voiture', ok:'courant', bad:['familier','soutenu']},
 {w:'automobile', ok:'soutenu', bad:['familier','courant']},
 {w:'bouquin', ok:'familier', bad:['courant','soutenu']},
 {w:'demeure', ok:'soutenu', bad:['familier','courant']}
];
const FR5_HOMO = [
 {ph:'___ heure est-il ?', ok:'Quelle', bad:["Qu'elle"], rule:'Quelle = déterminant interrogatif (+ nom)'},
 {ph:'Je crois ___ viendra.', ok:"qu'elle", bad:['quelle'], rule:"qu'elle = que + elle"},
 {ph:'Il ___ lave les mains.', ok:'se', bad:['ce'], rule:'se = pronom (verbe pronominal)'},
 {ph:'___ livre est à moi.', ok:'Ce', bad:['Se'], rule:'ce = déterminant démonstratif (+ nom)'}
];
function _fr5_fonc(){ const x=_frRnd(FR5_FONC); return _frQ(`« ${x.ph} » Quelle est la fonction de « ${x.grp} » ?`, x.f, x.bad, 'fr5-fonc', `« ${x.grp} » → ${x.f}`); }
function _fr5_rel(){ const r=_frRnd(FR5_REL); return _frQ(`« ${r.ph} » Quel est le pronom relatif ?`, r.ok, r.bad, 'fr5-rel', `pronom relatif : ${r.ok}`); }
function _fr5_mode(){ const m=_frRnd(FR5_MODE); return _frQ(`Quel temps ou mode ? « ${m.ph} »`, m.ok, m.bad, 'fr5-mode', `« ${m.ph} » → ${m.ok}`); }
function _fr5_val(){ const v=_frRnd(FR5_VAL); return _frQ(`« ${v.ph} » Le verbe exprime… ?`, v.ok, v.bad, 'fr5-val', v.rule); }
function _fr5_fig(){ const f=_frRnd(FR5_FIG); return _frQ(`Quelle figure de style ? « ${f.ph} »`, f.ok, f.bad, 'fr5-fig', f.rule); }
function _fr5_reg(){ const r=_frRnd(FR5_REG); return _frQ(`Quel niveau de langue : « ${r.w} » ?`, r.ok, r.bad, 'fr5-reg', `« ${r.w} » → ${r.ok}`); }
function _fr5_homo(){ const h=_frRnd(FR5_HOMO); return _frQ(h.ph, h.ok, h.bad, 'fr5-homo', h.rule); }

function genFR_5E(boss,_d){
 _d=_d||0;
 const phase=(typeof _progPhase==='function')?_progPhase('5E'):1;
 let pool;
 if(phase<=1)       pool=[_fr5_fonc,_fr5_rel,_fr5_mode,_fr5_homo,_fr6_phrase,_frCE1_syn,_fr5_reg];
 else if(phase===2) pool=[_fr5_fonc,_fr5_rel,_fr5_val,_frCE1_conjSaisie,_frCE2_conj2,_frCM_pp,_fr5_reg,_fr5_fig,_fr5_mode,_frCE1_oppSaisie];
 else               pool=[_fr5_fonc,_fr5_rel,_fr5_mode,_fr5_fig,_fr5_val,_fr6_etym,_frCE2_comp,_frCE1_conjSaisie,_frCM_homo3,_fr5_homo];
 const q=_frUnique(_frRnd(pool)());
 if(!q){ if(_d>14) return _fr5_fonc(); return genFR_5E(boss,_d+1); }
 return q;
}

// ═══════════════════════════════════════════════════════
// 4e — voix passive & complément d'agent, attribut du COD, types de
//   subordonnées, accord PP avec avoir (COD antéposé), connecteurs logiques,
//   figures avancées. Exemples originaux (aucune citation d'œuvre).
// ═══════════════════════════════════════════════════════
const FR4_VOIX = [
 {ph:'La souris est mangée par le chat.', ok:'passive', bad:['active'], rule:'le sujet subit l\u2019action'},
 {ph:'Le chat mange la souris.', ok:'active', bad:['passive'], rule:'le sujet fait l\u2019action'},
 {ph:'Le voleur a été arrêté par la police.', ok:'passive', bad:['active'], rule:'« être » + participe + par'},
 {ph:'Marie écrit une lettre.', ok:'active', bad:['passive'], rule:'le sujet fait l\u2019action'}
];
const FR4_AGENT = [
 {ph:'La pomme est mangée par Marie.', grp:'par Marie', ok:"complément d'agent", bad:['sujet','COD']},
 {ph:'Le ballon a été lancé par Tom.', grp:'par Tom', ok:"complément d'agent", bad:['COI','sujet']},
 {ph:'La maison fut construite par les ouvriers.', grp:'par les ouvriers', ok:"complément d'agent", bad:['sujet','COD']}
];
const FR4_ATCOD = [
 {ph:'Je trouve cette histoire passionnante.', grp:'passionnante', ok:'attribut du COD', bad:['épithète','attribut du sujet'], rule:'caractérise le COD « cette histoire »'},
 {ph:'On l\u2019a élu président.', grp:'président', ok:'attribut du COD', bad:['COD','sujet'], rule:'caractérise le COD'},
 {ph:'Je le crois sincère.', grp:'sincère', ok:'attribut du COD', bad:['attribut du sujet','épithète'], rule:'caractérise le COD « le »'}
];
const FR4_SUB = [
 {ph:'Le livre que je lis est bien.', ok:'relative', bad:['conjonctive','circonstancielle'], rule:'pronom relatif « que »'},
 {ph:'Je pense que tu as raison.', ok:'conjonctive', bad:['relative','circonstancielle'], rule:'« que » conjonction, COD du verbe'},
 {ph:'Je viendrai quand tu voudras.', ok:'circonstancielle', bad:['relative','conjonctive'], rule:'exprime le temps'},
 {ph:'La fille qui chante est là.', ok:'relative', bad:['conjonctive','circonstancielle'], rule:'pronom relatif « qui »'},
 {ph:'Il reste parce qu\u2019il fait froid.', ok:'circonstancielle', bad:['relative','conjonctive'], rule:'exprime la cause'}
];
const FR4_PP = [
 {ph:'Les fleurs que j\u2019ai ___ (cueillir).', ok:'cueillies', bad:['cueilli','cueillis'], rule:'avoir + COD avant (les fleurs, f.pl.) → ies'},
 {ph:'La lettre qu\u2019il a ___ (écrire).', ok:'écrite', bad:['écrit','écrits'], rule:'COD « la lettre » avant → e'},
 {ph:'J\u2019ai ___ une pomme (manger).', ok:'mangé', bad:['mangée','mangés'], rule:'COD après → pas d\u2019accord'},
 {ph:'Les gâteaux que tu as ___ (faire).', ok:'faits', bad:['fait','faites'], rule:'COD « les gâteaux » avant (m.pl.) → s'}
];
const FR4_CONN = [
 {ph:'Il pleut, ___ je prends un parapluie.', ok:'donc', bad:['cependant','car'], rule:'conséquence'},
 {ph:'Il est petit, ___ très fort.', ok:'mais', bad:['donc','car'], rule:'opposition'},
 {ph:'Je reste, ___ il fait froid.', ok:'car', bad:['donc','mais'], rule:'cause'},
 {ph:'D\u2019abord on lit, ___ on répond.', ok:'ensuite', bad:['car','mais'], rule:'succession'}
];
const FR4_FIG = [
 {ph:'un silence assourdissant', ok:'oxymore', bad:['antithèse','litote'], rule:'deux mots de sens opposés côte à côte'},
 {ph:'Certains rient, d\u2019autres pleurent.', ok:'antithèse', bad:['oxymore','gradation'], rule:'deux idées opposées'},
 {ph:'Il marche, il court, il vole.', ok:'gradation', bad:['énumération','litote'], rule:'progression d\u2019intensité'},
 {ph:'Ce n\u2019est pas mauvais.', ok:'litote', bad:['hyperbole','oxymore'], rule:'dire peu pour suggérer beaucoup'}
];
function _fr4_voix(){ const v=_frRnd(FR4_VOIX); return _frQ(`« ${v.ph} » Cette phrase est à la voix… ?`, v.ok, v.bad, 'fr4-voix', v.rule); }
function _fr4_agent(){ const a=_frRnd(FR4_AGENT); return _frQ(`« ${a.ph} » Quelle est la fonction de « ${a.grp} » ?`, a.ok, a.bad, 'fr4-agent', `« ${a.grp} » → complément d\u2019agent`); }
function _fr4_atcod(){ const a=_frRnd(FR4_ATCOD); return _frQ(`« ${a.ph} » Quelle est la fonction de « ${a.grp} » ?`, a.ok, a.bad, 'fr4-atcod', a.rule); }
function _fr4_sub(){ const s=_frRnd(FR4_SUB); return _frQ(`« ${s.ph} » La proposition subordonnée est… ?`, s.ok, s.bad, 'fr4-sub', s.rule); }
function _fr4_pp(){ const p=_frRnd(FR4_PP); return _frQ(p.ph, p.ok, p.bad, 'fr4-pp', p.rule); }
function _fr4_conn(){ const c=_frRnd(FR4_CONN); return _frQ(`Complète : « ${c.ph} »`, c.ok, c.bad, 'fr4-conn', `${c.ok} → ${c.rule}`); }
function _fr4_fig(){ const f=_frRnd(FR4_FIG); return _frQ(`Quelle figure de style ? « ${f.ph} »`, f.ok, f.bad, 'fr4-fig', f.rule); }

function genFR_4E(boss,_d){
 _d=_d||0;
 const phase=(typeof _progPhase==='function')?_progPhase('4E'):1;
 let pool;
 if(phase<=1)       pool=[_fr4_voix,_fr4_agent,_fr4_sub,_fr4_conn,_fr5_fonc,_fr5_mode,_fr5_rel];
 else if(phase===2) pool=[_fr4_voix,_fr4_atcod,_fr4_pp,_frCE2_pc,_fr4_fig,_fr4_sub,_frCE1_conjSaisie,_fr5_reg,_fr4_conn,_fr4_agent];
 else               pool=[_fr4_voix,_fr4_atcod,_fr4_pp,_fr4_sub,_fr4_fig,_fr4_conn,_fr6_etym,_frCE2_comp,_fr5_mode,_frCM_homo3];
 const q=_frUnique(_frRnd(pool)());
 if(!q){ if(_d>14) return _fr4_voix(); return genFR_4E(boss,_d+1); }
 return q;
}

// ═══════════════════════════════════════════════════════
// 3e — fonctions des subordonnées, liens entre propositions, tous temps/modes,
//   homophones pièges. Phase finale : interleaving « brevet » (toutes notions).
// ═══════════════════════════════════════════════════════
const FR3_SUBF = [
 {ph:'Je sais que tu viendras.', ok:'COD', bad:['sujet','CC'], rule:'conjonctive « que » → COD de « sais »'},
 {ph:'Le livre que tu lis est à moi.', ok:'complément de l\u2019antécédent', bad:['COD','CC'], rule:'relative → complète « le livre »'},
 {ph:'Je viendrai quand il arrivera.', ok:'complément circonstanciel', bad:['COD','sujet'], rule:'circonstancielle de temps'},
 {ph:'Je me demande s\u2019il viendra.', ok:'COD', bad:['CC','sujet'], rule:'interrogative indirecte → COD'}
];
const FR3_LIEN = [
 {ph:'Il pleut, je rentre.', ok:'juxtaposition', bad:['coordination','subordination'], rule:'reliées par une virgule'},
 {ph:'Il pleut et je rentre.', ok:'coordination', bad:['juxtaposition','subordination'], rule:'reliées par « et »'},
 {ph:'Je rentre parce qu\u2019il pleut.', ok:'subordination', bad:['juxtaposition','coordination'], rule:'une proposition dépend de l\u2019autre'},
 {ph:'Il lit, elle écrit, ils travaillent.', ok:'juxtaposition', bad:['coordination','subordination'], rule:'séparées par des virgules'}
];
const FR3_TEMPS = [
 {ph:'j\u2019avais mangé', ok:'plus-que-parfait', bad:['passé composé','imparfait']},
 {ph:'j\u2019ai mangé', ok:'passé composé', bad:['plus-que-parfait','présent']},
 {ph:'que je finisse', ok:'subjonctif présent', bad:['présent','conditionnel']},
 {ph:'je finirais', ok:'conditionnel présent', bad:['futur','imparfait']},
 {ph:'il eut fini', ok:'passé antérieur', bad:['plus-que-parfait','passé simple']}
];
const FR3_HOMO = [
 {ph:'Il est ___ à partir.', ok:'prêt', bad:['près'], rule:'prêt = préparé'},
 {ph:'Assieds-toi ___ de moi.', ok:'près', bad:['prêt'], rule:'près = à proximité'},
 {ph:'Arrive ___ que tard.', ok:'plutôt', bad:['plus tôt'], rule:'plutôt = de préférence'},
 {ph:'Lève-toi ___ demain matin.', ok:'plus tôt', bad:['plutôt'], rule:'plus tôt = moins tard'},
 {ph:'___ ne m\u2019intéresse pas.', ok:'Ça', bad:['Sa'], rule:'ça = cela'},
 {ph:'Il prend ___ veste.', ok:'sa', bad:['ça'], rule:'sa = possessif (+ nom)'},
 {ph:'___ il pleuve, je sors.', ok:"Quoiqu'", bad:['Quoi qu\u2019'], rule:'quoique = bien que'}
];
function _fr3_subf(){ const s=_frRnd(FR3_SUBF); return _frQ(`« ${s.ph} » Quelle est la fonction de la subordonnée ?`, s.ok, s.bad, 'fr3-subf', s.rule); }
function _fr3_lien(){ const l=_frRnd(FR3_LIEN); return _frQ(`« ${l.ph} » Comment les propositions sont-elles reliées ?`, l.ok, l.bad, 'fr3-lien', l.rule); }
function _fr3_temps(){ const t=_frRnd(FR3_TEMPS); return _frQ(`Quel temps ? « ${t.ph} »`, t.ok, t.bad, 'fr3-temps', `« ${t.ph} » → ${t.ok}`); }
function _fr3_homo(){ const h=_frRnd(FR3_HOMO); return _frQ(h.ph, h.ok, h.bad, 'fr3-homo', h.rule); }

function genFR_3E(boss,_d){
 _d=_d||0;
 const phase=(typeof _progPhase==='function')?_progPhase('3E'):1;
 let pool;
 if(phase<=1)       pool=[_fr3_subf,_fr3_lien,_fr3_temps,_fr3_homo,_fr4_voix,_fr5_fonc,_fr4_sub];
 else if(phase===2) pool=[_fr3_subf,_fr3_lien,_fr3_temps,_fr4_atcod,_fr4_pp,_fr4_fig,_fr4_conn,_frCE1_conjSaisie,_fr4_agent,_fr3_homo];
 else /* Défi Brevet : interleaving large */ pool=[_fr3_subf,_fr3_lien,_fr3_temps,_fr3_homo,_fr4_voix,_fr4_atcod,_fr4_pp,_fr4_fig,_frCE2_comp,_fr6_etym];
 const q=_frUnique(_frRnd(pool)());
 if(!q){ if(_d>14) return _fr3_subf(); return genFR_3E(boss,_d+1); }
 return q;
}

// ═══════════════════════════════════════════════════════
// MATERNELLE (PS/MS/GS) — « Mobiliser le langage ». 100 % VISUEL + AUDIO :
//   aucun mot à lire, choix en emoji seul, la voix dit tout (speakText), sons étirés.
//   Progression neuro-éducative : mot → syllabe → phonème.
// ═══════════════════════════════════════════════════════
const FR_CRIS = [
 {cri:'Miaou', w:'chat', e:'🐱'},
 {cri:'Ouaf ouaf', w:'chien', e:'🐶'},
 {cri:'Meuh', w:'vache', e:'🐮'},
 {cri:'Cot cot', w:'poule', e:'🐔'},
 {cri:'Groin groin', w:'cochon', e:'🐷'},
 {cri:'Bêê', w:'mouton', e:'🐑'},
 {cri:'Coin coin', w:'canard', e:'🦆'}
];
const FR_RIMES = [
 {e:'🐱',w:'chat',   ok:{e:'🐀',w:'rat'},     bad:[{e:'🌙',w:'lune'},{e:'🌸',w:'fleur'}]},
 {e:'🐰',w:'lapin',  ok:{e:'🌲',w:'sapin'},   bad:[{e:'🍎',w:'pomme'},{e:'🐮',w:'vache'}]},
 {e:'⚽',w:'ballon', ok:{e:'🐑',w:'mouton'},  bad:[{e:'🍌',w:'banane'},{e:'🔑',w:'clé'}]},
 {e:'🎩',w:'chapeau',ok:{e:'🍰',w:'gâteau'},  bad:[{e:'🦁',w:'lion'},{e:'👗',w:'robe'}]},
 {e:'🛏️',w:'lit',    ok:{e:'🐭',w:'souris'},  bad:[{e:'☀️',w:'soleil'},{e:'🐶',w:'chien'}]},
 {e:'🚲',w:'vélo',   ok:{e:'⛵',w:'bateau'},  bad:[{e:'👧',w:'fille'},{e:'🌙',w:'lune'}]}
];
const FR_ATTAQUE = [
 {son:'chhh', cue:{e:'🐱',w:'chat'},    ok:{e:'🎩',w:'chapeau'}, bad:[{e:'🍎',w:'pomme'},{e:'🌙',w:'lune'}]},
 {son:'lll',  cue:{e:'🦁',w:'lion'},    ok:{e:'🌙',w:'lune'},    bad:[{e:'🐮',w:'vache'},{e:'🍰',w:'gâteau'}]},
 {son:'mmm',  cue:{e:'🏠',w:'maison'},  ok:{e:'🐑',w:'mouton'},  bad:[{e:'🍌',w:'banane'},{e:'🔑',w:'clé'}]},
 {son:'sss',  cue:{e:'🐭',w:'souris'},  ok:{e:'☀️',w:'soleil'},  bad:[{e:'🐶',w:'chien'},{e:'🍎',w:'pomme'}]},
 {son:'bbb',  cue:{e:'🍌',w:'banane'},  ok:{e:'⚽',w:'ballon'},  bad:[{e:'🐱',w:'chat'},{e:'🌲',w:'sapin'}]},
 {son:'rrr',  cue:{e:'🤴',w:'roi'},     ok:{e:'👗',w:'robe'},    bad:[{e:'🦁',w:'lion'},{e:'🌙',w:'lune'}]}
];
const FR_LOC = [
 {w:'chapeau', syl:'cha',  pos:'début', e:'🎩'},
 {w:'bateau',  syl:'teau', pos:'fin',   e:'⛵'},
 {w:'lapin',   syl:'la',   pos:'début', e:'🐰'},
 {w:'mouton',  syl:'ton',  pos:'fin',   e:'🐑'},
 {w:'cochon',  syl:'co',   pos:'début', e:'🐷'},
 {w:'ballon',  syl:'lon',  pos:'fin',   e:'⚽'}
];
const FR_LETTRE = [
 {L:'A', son:'aaa', ok:{e:'✈️',w:'avion'},  bad:[{e:'🐱',w:'chat'},{e:'🌙',w:'lune'}]},
 {L:'M', son:'mmm', ok:{e:'🏠',w:'maison'}, bad:[{e:'🍎',w:'pomme'},{e:'🦁',w:'lion'}]},
 {L:'S', son:'sss', ok:{e:'☀️',w:'soleil'}, bad:[{e:'🐶',w:'chien'},{e:'🐰',w:'lapin'}]},
 {L:'L', son:'lll', ok:{e:'🦁',w:'lion'},   bad:[{e:'🐮',w:'vache'},{e:'🍰',w:'gâteau'}]},
 {L:'P', son:'ppp', ok:{e:'🍎',w:'pomme'},  bad:[{e:'☀️',w:'soleil'},{e:'🐭',w:'souris'}]},
 {L:'B', son:'bbb', ok:{e:'🍌',w:'banane'}, bad:[{e:'🐱',w:'chat'},{e:'🌲',w:'sapin'}]},
 {L:'R', son:'rrr', ok:{e:'👗',w:'robe'},   bad:[{e:'🐰',w:'lapin'},{e:'🌙',w:'lune'}]}
];
const _MSND_SAY = {a:'aaa',i:'iii',o:'ooo',u:'uuu',ou:'ou',on:'on'};
function _artLe(o){ return /^[aeiouéèê]/i.test(o.w) ? 'l\u2019' : (o.g==='m'?'le ':'la '); }

// M1 — lexique imagé : « Où est le chat ? » → taper l'emoji.
function _frM_lex(){
 const w=_frRnd(FR_WORDS); const bad=_frSample(FR_WORDS,2,[w.v]);
 const q=_frQ(`Où est ${_artLe(w)}${w.w} ?`, _frHtmlEmoji(w), bad.map(_frHtmlEmoji), 'frm-lex', w.w);
 q.speakText=`Où est ${_artLe(w)}${w.w} ?`; return q;
}
// M2 — cris d'animaux (loto sonore).
function _frM_cris(){
 const c=_frRnd(FR_CRIS); const bad=_frShuffle(FR_CRIS.filter(x=>x.w!==c.w)).slice(0,2);
 const q=_frQ(`${c.cri} ! Quel animal fait ce cri ?`, _frHtmlEmoji(c), bad.map(_frHtmlEmoji), 'frm-cris', c.w);
 q.speakText=`${c.cri} ! Quel animal fait ce cri ?`; return q;
}
// M3 — compréhension orale (phrase lue, choix emoji).
function _frM_listen(){
 const it=_frRnd(FR_SENT);
 const q=_frQ(`🔊 « ${it.s} » ${it.q}`, _frHtmlEmoji(it.ok), it.bad.map(_frHtmlEmoji), 'frm-ecoute', it.ok.w);
 q.speakText=`${it.s} ${it.q}`; return q;
}
// M4 — intrus catégoriel (choix emoji).
function _frM_intrus(){
 const cat=_frRnd(['animal','chose']);
 const inCat=FR_WORDS.filter(w=>w.cat===cat);
 const outCat=FR_WORDS.filter(w=>w.cat!==cat && w.cat!=='personne');
 if(inCat.length<2||outCat.length<1) return null;
 const two=_frShuffle(inCat).slice(0,2); const intrus=_frRnd(outCat);
 const label=cat==='animal'?'un animal':'une chose';
 const q=_frQ(`Lequel n\u2019est pas ${label} ?`, _frHtmlEmoji(intrus), two.map(_frHtmlEmoji), 'frm-intrus', intrus.w);
 q.speakText=`Lequel n\u2019est pas ${label} ?`; return q;
}
// M5 — compter les syllabes (réponses = claps 👏, pas de chiffre à lire).
function _frM_syll(maxSyl){
 const mx=maxSyl||3; const w=_frRnd(FR_WORDS.filter(x=>x.syl>=1&&x.syl<=mx));
 const set=new Set([w.syl]); while(set.size<3){ set.add(1+Math.floor(Math.random()*3)); }
 const nums=_frShuffle(Array.from(set));
 const items=nums.map((n,i)=>({val:i+1,label:String(i+1),html:`<span style="font-size:1.7em">${'👏'.repeat(n)}</span>`,n}));
 let res=1; items.forEach(it=>{ if(it.n===w.syl)res=it.val; });
 return {display:`Combien de syllabes ? ${w.e} ${w.w}`, img:'', choices:items.map(({val,label,html})=>({val,label,html})), visualChoices:true, res, opKey:'frm-syll', type:'normal', subj:'fr', speakText:`Combien de syllabes dans le mot ${w.w} ?`, hint:`${w.w} = ${w.syl} syllabe${w.syl>1?'s':''}`};
}
// M6 — rimes.
function _frM_rime(){
 const r=_frRnd(FR_RIMES);
 const q=_frQ(`Lequel rime avec ${r.w} ?`, _frHtmlEmoji(r.ok), r.bad.map(_frHtmlEmoji), 'frm-rime', `${r.w} rime avec ${r.ok.w}`);
 q.speakText=`Écoute : ${r.w}. Lequel rime avec ${r.w} ?`; return q;
}
// M7 — attaque (même son au début), son étiré.
function _frM_attaque(){
 const a=_frRnd(FR_ATTAQUE);
 const q=_frQ(`Lequel commence comme ${a.cue.w} ?`, _frHtmlEmoji(a.ok), a.bad.map(_frHtmlEmoji), 'frm-attaque', `${a.cue.w} et ${a.ok.w} commencent par « ${a.son} »`);
 q.speakText=`${a.cue.w} commence par ${a.son}. Lequel commence aussi par ${a.son} ?`; return q;
}
// M8 — présence d'un phonème (GS), son étiré.
function _frM_son(){
 const sounds=['a','i','o','u','ou','on']; const snd=_frRnd(sounds);
 const withS=FR_WORDS.filter(w=>w.snd.indexOf(snd)>=0);
 const without=FR_WORDS.filter(w=>w.snd.indexOf(snd)<0);
 if(withS.length<1||without.length<2) return null;
 const ok=_frRnd(withS); const bad=_frShuffle(without).slice(0,2);
 const q=_frQ(`Où entends-tu le son ${_SOUND_LABEL[snd]} ?`, _frHtmlEmoji(ok), bad.map(_frHtmlEmoji), 'frm-son', ok.w);
 q.speakText=`Où entends-tu le son ${_MSND_SAY[snd]||snd} ?`; return q;
}
// M9 — localiser la syllabe (GS) : au début ou à la fin (flèches).
function _frM_loc(){
 const l=_frRnd(FR_LOC);
 const deb='<span style="font-size:1.5em">⬅️</span><br>au début';
 const fin='<span style="font-size:1.5em">➡️</span><br>à la fin';
 const okHtml=l.pos==='début'?deb:fin, badHtml=l.pos==='début'?fin:deb;
 const q=_frQ(`${l.e} Dans « ${l.w} », où entends-tu « ${l.syl} » ?`, okHtml, [badHtml], 'frm-loc', `« ${l.syl} » est ${l.pos==='début'?'au début':'à la fin'}`);
 q.speakText=`Dans le mot ${l.w}, où entends-tu ${l.syl} ? Au début, ou à la fin ?`; return q;
}
// M10 — principe alphabétique (GS) : grande lettre + son → image.
function _frM_lettre(){
 const x=_frRnd(FR_LETTRE);
 const q=_frQ(`Cette lettre fait « ${x.son} ». Quelle image commence par ce son ?`, _frHtmlEmoji(x.ok), x.bad.map(_frHtmlEmoji), 'frm-lettre', `${x.L} → ${x.ok.w}`);
 q.visualHtml=`<span style="font-size:3.4em;font-weight:900">${x.L}</span>`;
 q.speakText=`Cette lettre fait ${x.son}. Quelle image commence par le son ${x.son} ?`; return q;
}

function _frMatPick(pool, self, boss, _d, fallback){
 const q=_frUnique(_frRnd(pool)());
 if(!q){ if(_d>16) return fallback(); return self(boss,_d+1); }
 return q;
}
function genFR_PS(boss,_d){
 _d=_d||0; const phase=(typeof _progPhase==='function')?_progPhase('PS'):1;
 let pool;
 if(phase<=1)       pool=[_frM_lex,_frM_cris,_frM_listen];
 else if(phase===2) pool=[_frM_lex,_frM_cris,_frM_listen,()=>_frM_syll(2)];
 else               pool=[_frM_lex,_frM_cris,_frM_listen,()=>_frM_syll(2),_frM_intrus];
 return _frMatPick(pool, genFR_PS, boss, _d, _frM_lex);
}
function genFR_MS(boss,_d){
 _d=_d||0; const phase=(typeof _progPhase==='function')?_progPhase('MS'):1;
 let pool;
 if(phase<=1)       pool=[_frM_lex,_frM_intrus,()=>_frM_syll(3),_frM_listen];
 else if(phase===2) pool=[_frM_lex,_frM_intrus,()=>_frM_syll(3),_frM_rime,_frM_attaque,_frM_cris];
 else               pool=[_frM_lex,()=>_frM_syll(3),_frM_rime,_frM_attaque,_frM_intrus,_frM_listen];
 return _frMatPick(pool, genFR_MS, boss, _d, _frM_lex);
}
function genFR_GS(boss,_d){
 _d=_d||0; const phase=(typeof _progPhase==='function')?_progPhase('GS'):1;
 let pool;
 if(phase<=1)       pool=[_frM_rime,_frM_attaque,()=>_frM_syll(3),_frM_intrus,_frM_lex];
 else if(phase===2) pool=[_frM_attaque,_frM_son,_frM_rime,()=>_frM_syll(3),_frM_loc,_frM_lettre];
 else               pool=[_frM_son,_frM_loc,_frM_lettre,_frM_attaque,_frM_rime,()=>_frM_syll(3)];
 return _frMatPick(pool, genFR_GS, boss, _d, _frM_rime);
}

// Table des générateurs français — COMPLET : maternelle PS/MS/GS + primaire CP→CM2 + collège 6e→3e.
const GEN_FR = { PS: genFR_PS, MS: genFR_MS, GS: genFR_GS, CP: genFR_CP, CE1: genFR_CE1, CE2: genFR_CE2, CM1: genFR_CM1, CM2: genFR_CM1, '6E': genFR_6E, '5E': genFR_5E, '4E': genFR_4E, '3E': genFR_3E };
