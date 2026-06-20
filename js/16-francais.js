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
function _frQ(display, correctHtml, distractorHtmls, opKey){
 const items=_frShuffle([{html:correctHtml,ok:true}].concat(distractorHtmls.map(h=>({html:h,ok:false}))));
 let res=1;
 const choices=items.map((it,i)=>{ const val=i+1; if(it.ok)res=val; return {val, label:String(val), html:it.html}; });
 return {display, img:'', choices, visualChoices:true, res, opKey:opKey||'fr', type:'normal', subj:'fr'};
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
 return {display:`Combien de syllabes ? ${w.e} ${w.w}`, img:'', choices:items.map(({val,label,html})=>({val,label,html})), visualChoices:true, res, opKey:'fr-syll', type:'normal', subj:'fr'};
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
// B : lecture éclair (phase 3 — lecture)
function _frB_flash(){
 const w=_frRnd(FR_WORDS.filter(x=>x.syl<=2));
 const near=_frSample(FR_WORDS,2,[w.v]);
 return _frQ(`⚡ Quel mot as-tu vu ? ${w.e}`, `<b>${w.w}</b>`, near.map(x=>`${x.w}`), 'fr-flash');
}

// ── Sélecteur CP : pioche un type selon la phase d'année ──
function genFR_CP(boss, _d){
 _d=_d||0;
 const phase = (typeof _progPhase==='function') ? _progPhase('CP') : 1;
 let pool;
 if(phase<=1)       pool=[_frA_sound,_frC_intrus,_frC_cat,_frG_listen];
 else if(phase===2) pool=[_frA_sound,_frA_syll,_frC_intrus,_frC_cat,_frC_opp,_frG_listen];
 else               pool=[_frA_sound,_frA_syll,_frC_opp,_frC_cat,_frG_listen,_frD_genre,_frD_spell,_frB_flash];
 const q=_frUnique(_frRnd(pool)());
 if(!q){ if(_d>14) return _frA_sound()||_frC_cat(); return genFR_CP(boss,_d+1); }
 return q;
}

// Table des générateurs français par niveau (CE1+ : à venir → repli CP pour l'instant)
const GEN_FR = { CP: genFR_CP, CE1: genFR_CP };
