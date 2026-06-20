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

function _frCE1_graph(set){ const g=_frRnd(set||FR_GRAPH); return _frQ(`Dans « ${g.word} », le son [${g.son}] s\u2019écrit comment ?`, g.ok, g.bad, 'fr-graph', `${g.word} → « ${g.ok} »`); }
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

// Table des générateurs français par niveau (CE2+ : à venir → repli CE1)
const GEN_FR = { CP: genFR_CP, CE1: genFR_CE1, CE2: genFR_CE1 };
