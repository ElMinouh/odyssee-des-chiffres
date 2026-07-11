// ═══════════════════════════════════════════════════════
// HISTOIRE — Générateurs de questions (matière 'hist')
// v11.3.1 — Primaire CP → CM2 (v11.2.1) + Maternelle PS/MS/GS (v11.3.0)
//   + fix critique v11.3.1 : bug val/index qui inversait parfois la bonne réponse.
//   100% QCM (choix multiples), inspiré des principes neuro-éducatifs :
//   récit avant date, ancrage concret, repérage spatial-temporel systématique,
//   récupération active, entrelacement des types d'exercice.
//   Phasé sur le moteur adaptatif : _progPhase(level) → 1 début / 2 milieu / 3 fin d'année.
//   Réutilise l'aventure/carte par défaut (pas de monde dédié pour l'instant, cf. ADR-14).
// ═══════════════════════════════════════════════════════

// Regroupe les opKey précis en 4 grandes catégories pour le suivi parent
// (miroir de _frCatOf en français, cf. 16-francais.js).
function _histCatOf(opKey){
 const k = String(opKey||'');
 // v11.3.0 : catégories dédiées à la maternelle (avant les règles primaire, pour ne
 // pas être capturées par le test générique /temps/ ci-dessous).
 if(/^histmat-temps/.test(k)) return 'temps';
 if(/^histmat-repere/.test(k)) return 'repere';
 if(/frise|avantapres|ordre|temps/.test(k)) return 'frise';
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
const _HIST_RECENT_MAX = 25;
function _histUnique(q){
 if(!q) return q;
 if(_histRecent.indexOf(q.display)>=0) return null;
 _histRecent.push(q.display); if(_histRecent.length>_HIST_RECENT_MAX) _histRecent.shift();
 return q;
}
function _histPick(arr){ return arr[ri(0,arr.length-1)]; }

// ── Frise à trous (astuce _matRanger : choisir la BONNE réponse) ──
function _histFriseHtml(arr, holeIdx){
 return '<div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap;">'+
  arr.map((label,i)=>`<span style="background:${i===holeIdx?'#e67e22':'rgba(255,255,255,.12)'};color:${i===holeIdx?'#2c1810':'#fff'};border-radius:6px;padding:4px 8px;font-size:.78em;font-weight:700;">${i===holeIdx?'?':label}</span>`).join('')+
  '</div>';
}
function _histOrdreChoiceHtml(arr){ return arr.map((label,i)=>`${i+1}. ${label}`).join('<br>'); }

// Génère un exercice "quelle rangée est dans le bon ordre" à partir d'une liste
// chronologique de référence (prend n premiers, propose 2 permutations fausses).
function _histOrdreQ(refOrdered, n, opKey, hint){
 const correct = refOrdered.slice(0, n);
 const perms=[]; let g=0;
 while(perms.length<2 && g++<40){
  const p=_histShuffle(correct);
  if(p.join()!==correct.join() && !perms.some(x=>x.join()===p.join())) perms.push(p);
 }
 const options=_histShuffle([correct, ...perms]);
 const optHtml=options.map(o=>_histOrdreChoiceHtml(o));
 const correctHtml=_histOrdreChoiceHtml(correct);
 const distracteurs=optHtml.filter(h=>h!==correctHtml);
 return _histQ('Quelle rangée respecte l\u2019ordre chronologique ?', correctHtml, distracteurs, opKey||'hist-ordre', hint||'Du plus ancien au plus récent.');
}

// Génère une frise à trous à partir d'une liste ordonnée d'époques.
function _histFriseTrouQ(epoques){
 const hole = ri(0, epoques.length-1);
 const html = _histFriseHtml(epoques, hole);
 const distracteurs = _histShuffle(epoques.filter(p=>p!==epoques[hole])).slice(0,2);
 return _histQ('Quelle époque manque sur la frise ?', epoques[hole], distracteurs, 'hist-frise', 'La frise est dans l\u2019ordre du temps.', html);
}

// ═══════════════════════════════════════════════════════
// CP — repérage temporel simple : avant/après, moments, vie d'autrefois
// ═══════════════════════════════════════════════════════
const HIST_CP_PAIRES = [
 {ancien:'Lampe à huile 🏮', moderne:'Ampoule électrique 💡'},
 {ancien:'Cheval et carriole 🐎', moderne:'Voiture 🚗'},
 {ancien:'Plume et encrier 🪶', moderne:'Ordinateur 💻'},
 {ancien:'Château fort 🏰', moderne:'Immeuble 🏢'},
 {ancien:'Bougie 🕯️', moderne:'Lampe de bureau 💡'},
 {ancien:'Diligence 🐎', moderne:'Train 🚄'},
 {ancien:'Voilier ⛵', moderne:'Paquebot 🛳️'},
 {ancien:'Lettre à la poste ✉️', moderne:'Message sur téléphone 📱'},
 {ancien:'Tableau noir et craie 🖤', moderne:'Tablette tactile 📱'},
 {ancien:'Puits d\u2019eau 🪣', moderne:'Robinet 🚰'},
 {ancien:'Feu de bois 🔥', moderne:'Cuisinière ⚡'},
 {ancien:'Lavoir au bord de l\u2019eau 🧺', moderne:'Machine à laver 🌀'},
 {ancien:'Disque vinyle 💿', moderne:'Musique en ligne 🎧'},
 {ancien:'Balai de paille 🧹', moderne:'Aspirateur 🌀'},
 {ancien:'Charrue tirée par un bœuf 🐂', moderne:'Tracteur 🚜'},
 {ancien:'Montgolfière 🎈', moderne:'Avion ✈️'},
 {ancien:'Machine à écrire ⌨️', moderne:'Ordinateur portable 💻'},
 {ancien:'Poste de radio à lampes 📻', moderne:'Enceinte connectée 🔊'},
 {ancien:'Fer à repasser à charbon 🔥', moderne:'Fer à repasser électrique 🔌'},
 {ancien:'Calèche tirée par des chevaux 🐴', moderne:'Bus 🚌'},
 {ancien:'Puits et seau 🪣', moderne:'Château d\u2019eau et robinet 🚰'},
 {ancien:'Abaque à boules 🧮', moderne:'Calculatrice 🔢'}
];
function _histCP_avantApres(){
 const p = _histPick(HIST_CP_PAIRES);
 const askOld = Math.random()<0.5;
 return _histQ(
  askOld ? 'Quel objet est le plus ancien ?' : 'Quel objet est le plus récent ?',
  askOld ? p.ancien : p.moderne,
  [askOld ? p.moderne : p.ancien],
  'hist-avantapres',
  askOld ? `${p.ancien} existait avant ${p.moderne}` : `${p.moderne} existe après ${p.ancien}`
 );
}
// Repérage temporel réellement historique : générations familiales (qui est né
// avant qui) + grandes étapes d'une vie humaine (ce qui vient avant/après).
const HIST_CP_GENER = [
 {plusVieux:'L\u2019arrière-grand-père 👴', plusJeune:'Le petit-enfant 👶'},
 {plusVieux:'La grand-mère 👵', plusJeune:'La maman 👩'},
 {plusVieux:'Le grand-père 👴', plusJeune:'Le papa 👨'},
 {plusVieux:'Les arrière-grands-parents 👴👵', plusJeune:'Les parents 👨\u200d👩'},
 {plusVieux:'La maman 👩', plusJeune:'Le bébé 👶'},
 {plusVieux:'Le grand-père 👴', plusJeune:'Le petit-fils 👦'},
 {plusVieux:'L\u2019arrière-grand-mère 👵', plusJeune:'La petite-fille 👧'},
];
const HIST_CP_ETAPES_VIE = [
 {tot:'Apprendre à marcher 👣', tard:'Aller à l\u2019école 🎒'},
 {tot:'Naître 👶', tard:'Devenir grand-parent 👴'},
 {tot:'Être un enfant 🧒', tard:'Être une personne âgée 👵'},
 {tot:'Apprendre à lire 📖', tard:'Avoir un métier 💼'},
 {tot:'Être un bébé 👶', tard:'Apprendre à marcher 👣'},
 {tot:'Aller à l\u2019école primaire 🎒', tard:'Devenir adulte 🧑'},
 {tot:'Naître 👶', tard:'Devenir un grand frère ou une grande sœur 🧒'},
];
function _histCP_temps(){
 if(Math.random()<0.5){
  const g = _histPick(HIST_CP_GENER);
  return _histQ('Qui est né en premier ?', g.plusVieux, [g.plusJeune], 'hist-temps', `${g.plusVieux} est né avant ${g.plusJeune}.`);
 }
 const e = _histPick(HIST_CP_ETAPES_VIE);
 const askFirst = Math.random()<0.6;
 return _histQ(
  askFirst ? 'Que se passe-t-il en premier dans la vie d\u2019une personne ?' : 'Que se passe-t-il en dernier dans la vie d\u2019une personne ?',
  askFirst ? e.tot : e.tard,
  [askFirst ? e.tard : e.tot],
  'hist-temps',
  `D\u2019abord : ${e.tot}, puis : ${e.tard}.`
 );
}
// La vie d'autrefois : QCM imagé, 1 bon + 2 mauvais
const HIST_CP_VIE = [
 {q:'Avec quoi s\u2019éclairait-on avant l\u2019électricité ?', ok:'Une bougie 🕯️', bad:['Une télévision 📺','Un réfrigérateur 🧊']},
 {q:'Avec quoi écrivait-on avant le stylo ?', ok:'Une plume 🪶', bad:['Un clavier ⌨️','Un feutre 🖍️']},
 {q:'Comment voyageait-on avant la voiture ?', ok:'À cheval 🐎', bad:['En fusée 🚀','En trottinette 🛴']},
 {q:'Comment gardait-on les aliments au frais autrefois ?', ok:'Dans une cave fraîche 🕳️', bad:['Dans un four 🔥','Dans un grille-pain 🍞']},
 {q:'Avec quoi lavait-on le linge autrefois ?', ok:'À la main au lavoir 🧺', bad:['Avec un ordinateur 💻','Avec un téléphone 📱']},
 {q:'Comment écoutait-on de la musique avant internet ?', ok:'Avec un disque 💿', bad:['Avec un micro-ondes 🍲','Avec une lampe 💡']},
 {q:'Comment envoyait-on un message à quelqu\u2019un de loin autrefois ?', ok:'Par une lettre ✉️', bad:['Par un email 📧','Par un SMS 📱']},
 {q:'Avec quoi allait-on chercher de l\u2019eau autrefois ?', ok:'Un seau au puits 🪣', bad:['Un robinet 🚰','Une bouteille en plastique 🍶']},
 {q:'Comment se chauffait-on autrefois dans les maisons ?', ok:'Avec un feu de bois 🔥', bad:['Avec un radiateur électrique ⚡','Avec une climatisation ❄️']},
 {q:'Avec quoi labourait-on les champs autrefois ?', ok:'Une charrue et un bœuf 🐂', bad:['Un tracteur 🚜','Une moissonneuse 🌾']},
 {q:'Comment se déplaçait-on sur de longues distances avant le train ?', ok:'À cheval ou en calèche 🐴', bad:['En avion ✈️','En métro 🚇']},
 {q:'Comment comptait-on avant la calculatrice ?', ok:'Avec un boulier 🧮', bad:['Avec un ordinateur 💻','Avec un GPS 🛰️']}
];
function _histCP_vie(){
 const f = _histPick(HIST_CP_VIE);
 return _histQ(f.q, f.ok, f.bad, 'hist-vie', f.ok);
}
// Reconnaître l'ancien parmi 3 images (1 ancien + 2 modernes)
const HIST_CP_ANCIEN = [
 {ok:'Château fort 🏰', bad:['Immeuble 🏢','Hélicoptère 🚁']},
 {ok:'Chevalier en armure 🛡️', bad:['Astronaute 👨\u200d🚀','Pompier 🚒']},
 {ok:'Diligence 🐎', bad:['Voiture 🚗','Avion ✈️']},
 {ok:'Plume et encrier 🪶', bad:['Ordinateur 💻','Téléphone 📱']},
 {ok:'Lampe à huile 🏮', bad:['Ampoule 💡','Néon 💡']},
 {ok:'Moulin à vent 🌬️', bad:['Éolienne moderne 🌀','Centrale électrique ⚡']},
 {ok:'Bateau à voile ⛵', bad:['Sous-marin 🤿','Ferry 🛳️']},
 {ok:'Roue de charrette 🛞', bad:['Pneu de vélo 🚲','Roue de moto 🏍️']},
 {ok:'Machine à écrire ⌨️', bad:['Ordinateur portable 💻','Tablette tactile 📱']},
 {ok:'Poste de radio à lampes 📻', bad:['Enceinte connectée 🔊','Casque sans fil 🎧']}
];
function _histCP_reconnaitre(){
 const f = _histPick(HIST_CP_ANCIEN);
 return _histQ('Lequel vient du passé ?', f.ok, f.bad, 'hist-avantapres', `${f.ok} vient d\u2019autrefois.`);
}
function genQ_HIST_CP(boss,_d){
 _d=_d||0;
 const phase=(typeof _progPhase==='function')?_progPhase('CP'):1;
 let pool;
 if(phase<=1)       pool=[_histCP_avantApres, _histCP_temps, _histCP_vie];
 else if(phase===2) pool=[_histCP_avantApres, _histCP_temps, _histCP_vie, _histCP_reconnaitre];
 else               pool=[_histCP_avantApres, _histCP_temps, _histCP_vie, _histCP_reconnaitre];
 const q=_histUnique(_histPick(pool)());
 if(!q){ if(_d>16) return _histCP_vie(); return genQ_HIST_CP(boss,_d+1); }
 return q;
}

// ═══════════════════════════════════════════════════════
// CE1 — premiers repères chronologiques + Préhistoire
// ═══════════════════════════════════════════════════════
const HIST_CE1_OBJETS = [
 {obj:'Silex taillé', e:'🔪', epoque:'Préhistoire'},
 {obj:'Grotte habitée', e:'⛰️', epoque:'Préhistoire'},
 {obj:'Peinture rupestre', e:'🎨', epoque:'Préhistoire'},
 {obj:'Feu de bois', e:'🔥', epoque:'Préhistoire'},
 {obj:'Mammouth chassé', e:'🦣', epoque:'Préhistoire'},
 {obj:'Hache en pierre', e:'🪓', epoque:'Préhistoire'},
 {obj:'Collier de coquillages', e:'🐚', epoque:'Préhistoire'},
 {obj:'Smartphone', e:'📱', epoque:"Aujourd'hui"},
 {obj:'Voiture', e:'🚗', epoque:"Aujourd'hui"},
 {obj:'Avion', e:'✈️', epoque:"Aujourd'hui"},
 {obj:'Ordinateur', e:'💻', epoque:"Aujourd'hui"},
 {obj:'Télévision', e:'📺', epoque:"Aujourd'hui"},
 {obj:'Biface (outil taillé)', e:'🪨', epoque:'Préhistoire'},
 {obj:'Abri sous roche', e:'⛰️', epoque:'Préhistoire'},
 {obj:'Vêtement en peau de bête', e:'🦌', epoque:'Préhistoire'},
 {obj:'Sagaie (arme de chasse)', e:'🏹', epoque:'Préhistoire'},
 {obj:'Statuette en argile', e:'🗿', epoque:'Préhistoire'},
 {obj:'Console de jeux vidéo', e:'🎮', epoque:"Aujourd'hui"},
 {obj:'Fusée spatiale', e:'🚀', epoque:"Aujourd'hui"},
 {obj:'Vélo électrique', e:'🚲', epoque:"Aujourd'hui"},
 {obj:'Casque de réalité virtuelle', e:'🥽', epoque:"Aujourd'hui"},
 {obj:'Robot ménager', e:'🤖', epoque:"Aujourd'hui"}
];
function _histCE1_objetEpoque(){
 const o = _histPick(HIST_CE1_OBJETS);
 const autres = ['Préhistoire',"Aujourd'hui"].filter(e=>e!==o.epoque);
 return _histQ(`${o.e} ${o.obj} : à quelle époque appartient cet objet ?`, o.epoque, autres, 'hist-vie', `${o.obj} → ${o.epoque}`);
}
const HIST_CE1_FRISE = ['Préhistoire','Antiquité','Moyen Âge',"Aujourd'hui"];
function _histCE1_friseTrois(){ return _histFriseTrouQ(HIST_CE1_FRISE); }
const HIST_CE1_VRAIFAUX = [
 {aff:'Les hommes de la Préhistoire vivaient dans des grottes.', ok:'Vrai'},
 {aff:'Les hommes de la Préhistoire avaient l\u2019électricité.', ok:'Faux'},
 {aff:'Le feu a été maîtrisé par les hommes préhistoriques.', ok:'Vrai'},
 {aff:'Les hommes de la Préhistoire roulaient en voiture.', ok:'Faux'},
 {aff:'Les hommes préhistoriques chassaient pour se nourrir.', ok:'Vrai'},
 {aff:'Les hommes préhistoriques savaient tailler la pierre.', ok:'Vrai'},
 {aff:'Les hommes de la Préhistoire regardaient la télévision.', ok:'Faux'},
 {aff:'On a retrouvé des peintures dans des grottes préhistoriques.', ok:'Vrai'},
 {aff:'Les hommes préhistoriques utilisaient des téléphones.', ok:'Faux'},
 {aff:'Les hommes de la Préhistoire fabriquaient des outils en pierre.', ok:'Vrai'},
 {aff:'La Préhistoire, c\u2019est la période avant l\u2019invention de l\u2019écriture.', ok:'Vrai'},
 {aff:'Les hommes préhistoriques avaient déjà des écoles comme les nôtres.', ok:'Faux'},
 {aff:'Les hommes préhistoriques se déplaçaient à pied sur de longues distances.', ok:'Vrai'},
 {aff:'Les premiers hommes préhistoriques savaient déjà construire des fusées.', ok:'Faux'},
 {aff:'Les hommes préhistoriques fabriquaient des bijoux avec des coquillages.', ok:'Vrai'},
 {aff:'La Préhistoire est la période la plus récente de l\u2019Histoire.', ok:'Faux'},
 {aff:'Les hommes préhistoriques chassaient parfois de très grands animaux comme le mammouth.', ok:'Vrai'},
 {aff:'Les grottes préhistoriques servaient de garage à voitures.', ok:'Faux'},
 {aff:'On appelle Préhistoire la période avant l\u2019invention de l\u2019écriture.', ok:'Vrai'},
 {aff:'Les hommes de la Préhistoire cuisinaient avec un four à micro-ondes.', ok:'Faux'},
 {aff:'Les premiers outils préhistoriques étaient taillés dans la pierre.', ok:'Vrai'},
 {aff:'Les hommes de la Préhistoire vivaient déjà dans des gratte-ciel.', ok:'Faux'}
];
function _histCE1_vraifaux(){
 const f = _histPick(HIST_CE1_VRAIFAUX);
 const autre = f.ok==='Vrai' ? 'Faux' : 'Vrai';
 return _histQ(`${f.aff} Vrai ou faux ?`, f.ok, [autre], 'hist-vie', f.aff);
}
const HIST_CE1_VIE = [
 {q:'Où vivaient souvent les hommes de la Préhistoire ?', ok:'Dans des grottes', bad:['Dans des immeubles','Dans des châteaux']},
 {q:'Comment les hommes préhistoriques se procuraient-ils de la nourriture ?', ok:'En chassant et en cueillant', bad:['Au supermarché','En livraison à domicile']},
 {q:'Quelle grande découverte a beaucoup aidé les hommes de la Préhistoire ?', ok:'La maîtrise du feu', bad:['L\u2019électricité','L\u2019imprimante']},
 {q:'Avec quelle matière fabriquaient-ils leurs premiers outils ?', ok:'La pierre', bad:['Le plastique','L\u2019acier inoxydable']},
 {q:'Que dessinaient les hommes préhistoriques sur les murs des grottes ?', ok:'Des animaux', bad:['Des voitures','Des fusées']},
 {q:'Comment appelle-t-on l\u2019endroit où les hommes préhistoriques peignaient des animaux ?', ok:'Sur les parois des grottes', bad:['Sur des feuilles de papier','Sur des écrans']},
 {q:'Avec quoi les hommes préhistoriques taillaient-ils leurs outils ?', ok:'Avec de la pierre (le silex)', bad:['Avec du plastique','Avec de l\u2019acier inoxydable']},
 {q:'Comment les hommes préhistoriques se protégeaient-ils du froid ?', ok:'Avec des peaux de bêtes', bad:['Avec des doudounes','Avec des radiateurs']},
 {q:'Que chassaient parfois les hommes de la Préhistoire pour se nourrir ?', ok:'Le mammouth', bad:['Le dinosaure','Le kangourou']},
 {q:'Comment appelle-t-on un outil préhistorique taillé des deux côtés ?', ok:'Un biface', bad:['Un smartphone','Un boomerang']},
 {q:'Où dormaient souvent les hommes de la Préhistoire ?', ok:'Dans des grottes ou des abris', bad:['Dans des hôtels','Dans des avions']},
 {q:'Avec quoi les hommes préhistoriques fabriquaient-ils des colliers ?', ok:'Avec des coquillages', bad:['Avec des billets de banque','Avec du plastique']},
 {q:'Qu\u2019est-ce qui a beaucoup changé la vie des hommes préhistoriques ?', ok:'La maîtrise du feu', bad:['L\u2019invention du train','L\u2019invention d\u2019internet']}
];
function _histCE1_vie(){
 const f=_histPick(HIST_CE1_VIE);
 return _histQ(f.q, f.ok, f.bad, 'hist-vie', f.ok);
}
function genQ_HIST_CE1(boss,_d){
 _d=_d||0;
 const phase=(typeof _progPhase==='function')?_progPhase('CE1'):1;
 let pool;
 if(phase<=1)       pool=[_histCE1_objetEpoque, _histCE1_vraifaux, _histCE1_vie];
 else if(phase===2) pool=[_histCE1_objetEpoque, _histCE1_vraifaux, _histCE1_vie, _histCE1_friseTrois];
 else               pool=[_histCE1_objetEpoque, _histCE1_vraifaux, _histCE1_vie, _histCE1_friseTrois];
 const q=_histUnique(_histPick(pool)());
 if(!q){ if(_d>16) return _histCE1_objetEpoque(); return genQ_HIST_CE1(boss,_d+1); }
 return q;
}

// ═══════════════════════════════════════════════════════
// CE2 — Préhistoire approfondie + Antiquité
// ═══════════════════════════════════════════════════════
const HIST_CE2_OBJETS = HIST_CE1_OBJETS.concat([
 {obj:'Toge romaine', e:'🏛️', epoque:'Antiquité'},
 {obj:'Pyramide d\u2019Égypte', e:'🔺', epoque:'Antiquité'},
 {obj:'Hiéroglyphes', e:'📜', epoque:'Antiquité'},
 {obj:'Bouclier de gladiateur', e:'🛡️', epoque:'Antiquité'},
 {obj:'Colonne de temple grec', e:'🏛️', epoque:'Antiquité'},
 {obj:'Amphore', e:'🏺', epoque:'Antiquité'},
 {obj:'Char romain', e:'🐎', epoque:'Antiquité'},
 {obj:'Casque de légionnaire', e:'⚔️', epoque:'Antiquité'},
]);
function _histCE2_objetEpoque(){
 const o = _histPick(HIST_CE2_OBJETS);
 const autres = _histShuffle(['Préhistoire','Antiquité',"Aujourd'hui"].filter(e=>e!==o.epoque)).slice(0,2);
 return _histQ(`${o.e} ${o.obj} : à quelle époque appartient cet objet ?`, o.epoque, autres, 'hist-vie', `${o.obj} → ${o.epoque}`);
}
const HIST_CE2_ORDRE = ['Préhistoire','Antiquité','Moyen Âge',"Aujourd'hui"];
function _histCE2_ordre(){ return _histOrdreQ(HIST_CE2_ORDRE, 3, 'hist-frise'); }
const HIST_CE2_VIE = [
 {q:'Que faisaient les hommes de la Préhistoire pour se nourrir ?', ok:'Ils chassaient et cueillaient', bad:['Ils allaient au supermarché','Ils commandaient sur internet']},
 {q:'Dans quel bâtiment vivaient de nombreux Romains riches ?', ok:'Une villa', bad:['Un igloo','Un gratte-ciel']},
 {q:'Que construisaient les Égyptiens de l\u2019Antiquité pour leurs pharaons ?', ok:'Des pyramides', bad:['Des tours Eiffel','Des ponts suspendus']},
 {q:'Comment appelle-t-on l\u2019écriture des Égyptiens de l\u2019Antiquité ?', ok:'Les hiéroglyphes', bad:['L\u2019alphabet grec','Le braille']},
 {q:'Comment appelait-on les peuples qui vivaient en Gaule avant les Romains ?', ok:'Les Gaulois', bad:['Les Vikings','Les chevaliers']},
 {q:'Qui commandait dans la Rome antique et portait une couronne de lauriers ?', ok:'L\u2019empereur', bad:['Le pharaon','Le roi de France']},
 {q:'Comment appelle-t-on les combattants des arènes romaines ?', ok:'Les gladiateurs', bad:['Les mousquetaires','Les cosmonautes']},
 {q:'Quel grand fleuve était très important pour l\u2019Égypte antique ?', ok:'Le Nil', bad:['La Seine','L\u2019Amazone']},
 {q:'Grâce à quelle invention l\u2019Histoire commence-t-elle (fin de la Préhistoire) ?', ok:'L\u2019écriture', bad:['La télévision','La roue à eau']},
 {q:'Comment se déplaçaient les soldats romains sur de longues distances ?', ok:'À pied, sur de grandes routes', bad:['En train à vapeur','En montgolfière']},
];
function _histCE2_viequotidienne(){
 const f = _histPick(HIST_CE2_VIE);
 return _histQ(f.q, f.ok, f.bad, 'hist-vie', f.ok);
}
const HIST_CE2_VRAIFAUX = HIST_CE1_VRAIFAUX.concat([
 {aff:'Les Égyptiens de l\u2019Antiquité construisaient des pyramides.', ok:'Vrai'},
 {aff:'Les Romains de l\u2019Antiquité utilisaient des ordinateurs.', ok:'Faux'},
 {aff:'L\u2019Histoire commence avec l\u2019invention de l\u2019écriture.', ok:'Vrai'},
 {aff:'Les Gaulois vivaient en Gaule, l\u2019ancien nom de la France.', ok:'Vrai'},
 {aff:'Les pharaons régnaient sur l\u2019Égypte moderne d\u2019aujourd\u2019hui.', ok:'Faux'},
]);
function _histCE2_vraifaux(){
 const f=_histPick(HIST_CE2_VRAIFAUX);
 const autre = f.ok==='Vrai' ? 'Faux' : 'Vrai';
 return _histQ(`${f.aff} Vrai ou faux ?`, f.ok, [autre], 'hist-vie', f.aff);
}
function genQ_HIST_CE2(boss,_d){
 _d=_d||0;
 const phase=(typeof _progPhase==='function')?_progPhase('CE2'):1;
 let pool;
 if(phase<=1)       pool=[_histCE2_objetEpoque, _histCE2_vraifaux, _histCE2_viequotidienne];
 else if(phase===2) pool=[_histCE2_objetEpoque, _histCE2_vraifaux, _histCE2_viequotidienne, _histCE2_ordre];
 else               pool=[_histCE2_objetEpoque, _histCE2_vraifaux, _histCE2_viequotidienne, _histCE2_ordre];
 const q=_histUnique(_histPick(pool)());
 if(!q){ if(_d>16) return _histCE2_objetEpoque(); return genQ_HIST_CE2(boss,_d+1); }
 return q;
}

// ═══════════════════════════════════════════════════════
// CM1 — Moyen Âge : construction du royaume de France
// ═══════════════════════════════════════════════════════
const HIST_CM1_PERSO = [
 {nom:'Clovis', indices:['Je suis devenu roi des Francs très jeune.','Je me suis converti au christianisme.','Mon baptême a eu lieu à Reims.']},
 {nom:'Charlemagne', indices:['J\u2019ai été sacré empereur en l\u2019an 800.','J\u2019ai encouragé l\u2019école dans mon empire.','On m\u2019appelle le père de l\u2019Europe.']},
 {nom:'Hugues Capet', indices:['Je suis devenu roi en 987.','J\u2019ai fondé une nouvelle dynastie de rois.','Mes descendants ont régné longtemps sur la France.']},
 {nom:'Jeanne d\u2019Arc', indices:['Je suis une jeune paysanne de Lorraine.','J\u2019ai mené une armée pour libérer Orléans.','Je suis morte brûlée à Rouen.']},
 {nom:'Saint Louis', indices:['Je suis un roi de France très religieux.','On raconte que je rendais la justice sous un chêne.','J\u2019ai participé aux croisades.']},
 {nom:'Guillaume le Conquérant', indices:['Je suis un duc de Normandie.','En 1066, j\u2019ai conquis l\u2019Angleterre.','J\u2019ai gagné la bataille de Hastings.']},
 {nom:'Aliénor d\u2019Aquitaine', indices:['J\u2019ai été reine de France, puis reine d\u2019Angleterre.','J\u2019étais l\u2019une des femmes les plus puissantes de mon époque.','J\u2019ai accompagné mes fils dans leurs batailles.']},
 {nom:'Philippe Auguste', indices:['Je suis un roi de France du Moyen Âge.','J\u2019ai agrandi le royaume de France.','J\u2019ai gagné la bataille de Bouvines en 1214.']},
 {nom:'Bertrand du Guesclin', indices:['Je suis un grand chef de guerre français.','J\u2019ai combattu pendant la guerre de Cent Ans.','On m\u2019a nommé connétable de France.']},
 {nom:'Godefroy de Bouillon', indices:['Je suis un chevalier et seigneur du Moyen Âge.','J\u2019ai participé à la première croisade.','J\u2019ai pris part à la prise de Jérusalem en 1099.']},
 {nom:'Blanche de Castille', indices:['J\u2019ai été reine de France au Moyen Âge.','J\u2019ai gouverné le royaume pendant la jeunesse de mon fils.','Mon fils est devenu Saint Louis.']},
 {nom:'Philippe le Bel', indices:['Je suis un roi de France du Moyen Âge.','J\u2019ai renforcé le pouvoir royal face aux seigneurs.','J\u2019ai fait arrêter les chevaliers du Temple.']}
];
function _histCM1_personnage(){
 const p = _histPick(HIST_CM1_PERSO);
 const phase=(typeof _progPhase==='function')?_progPhase('CM1'):1;
 const nInd = phase<=1 ? 3 : phase===2 ? 2 : 1;
 const indices = p.indices.slice(0,nInd).join(' ');
 const autres = _histShuffle(HIST_CM1_PERSO.filter(x=>x.nom!==p.nom).map(x=>x.nom)).slice(0,2);
 return _histQ(`${indices} Qui suis-je ?`, p.nom, autres, 'hist-perso', `${p.nom} : ${p.indices.join(' ')}`);
}
const HIST_CM1_EVT = ['Sacre de Clovis (496)','Sacre de Charlemagne (800)','Hugues Capet, roi de France (987)','Bataille de Hastings (1066)','Jeanne d\u2019Arc à Orléans (1429)'];
function _histCM1_frise(){ return _histOrdreQ(HIST_CM1_EVT, 3, 'hist-frise'); }
const HIST_CM1_VOCAB = [
 {q:'Comment appelle-t-on un château fortifié du Moyen Âge ?', ok:'Un château fort', bad:['Une pyramide','Un temple grec']},
 {q:'Comment appelle-t-on un guerrier à cheval du Moyen Âge ?', ok:'Un chevalier', bad:['Un gladiateur','Un légionnaire']},
 {q:'Comment appelle-t-on la cérémonie où un roi devient officiellement roi ?', ok:'Le sacre', bad:['Le tournoi','Le banquet']},
 {q:'Quelle grande épidémie a touché l\u2019Europe au Moyen Âge ?', ok:'La peste noire', bad:['La grippe espagnole','Le choléra']},
 {q:'Comment appelle-t-on les paysans qui travaillaient la terre du seigneur ?', ok:'Les serfs', bad:['Les pharaons','Les mousquetaires']},
 {q:'Où le seigneur habitait-il au Moyen Âge ?', ok:'Dans un château', bad:['Dans une villa romaine','Dans un gratte-ciel']},
 {q:'Comment appelle-t-on les grandes églises construites au Moyen Âge ?', ok:'Des cathédrales', bad:['Des pyramides','Des amphithéâtres']},
 {q:'Comment appelle-t-on les combats amicaux entre chevaliers ?', ok:'Des tournois', bad:['Des jeux du cirque','Des matchs de foot']},
 {q:'Qui recopiait les livres à la main dans les monastères ?', ok:'Les moines', bad:['Les pharaons','Les cosmonautes']},
 {q:'Comment appelle-t-on la haute tour d\u2019un château fort ?', ok:'Le donjon', bad:['La pyramide','Le gratte-ciel']},
 {q:'Qu\u2019est-ce qu\u2019un croisade au Moyen Âge ?', ok:'Une expédition religieuse lointaine', bad:['Un tournoi de chevaliers','Une fête de village']},
 {q:'Comment se protégeait un chevalier au combat ?', ok:'Avec une armure et un bouclier', bad:['Avec un gilet pare-balles','Avec un casque de moto']},
 {q:'Comment appelle-t-on la société où les seigneurs se partagent le pouvoir avec le roi ?', ok:'La féodalité', bad:['La République','L\u2019Empire romain']},
 {q:'Comment appelle-t-on la fenêtre colorée qu\u2019on voit dans les cathédrales ?', ok:'Un vitrail', bad:['Une fresque égyptienne','Une mosaïque romaine']},
 {q:'Comment appelle-t-on l\u2019arme principale d\u2019un chevalier au combat ?', ok:'L\u2019épée', bad:['Le fusil','L\u2019arc à poulies']},
 {q:'Comment appelle-t-on le repas de fête organisé par un seigneur dans son château ?', ok:'Un banquet', bad:['Un sacre','Un tournoi']},
 {q:'Comment appelle-t-on la guerre qui a opposé la France et l\u2019Angleterre pendant plus de 100 ans ?', ok:'La guerre de Cent Ans', bad:['Les croisades','La Révolution']},
 {q:'Comment appelle-t-on la lettre décorée à la main dans les livres du Moyen Âge ?', ok:'Une enluminure', bad:['Une photographie','Un hiéroglyphe']},
 {q:'Qui recopiait les livres à la main avant l\u2019invention de l\u2019imprimerie ?', ok:'Les moines dans les monastères', bad:['Les chevaliers','Les paysans']},
 {q:'Comment s\u2019appelle le fossé rempli d\u2019eau autour d\u2019un château fort ?', ok:'Les douves', bad:['Le donjon','Le tournoi']},
 {q:'Comment appelle-t-on le pont qui se relève pour protéger un château fort ?', ok:'Le pont-levis', bad:['Le viaduc','L\u2019aqueduc']},
 {q:'Comment appelle-t-on le marché où les paysans vendaient leurs produits ?', ok:'La foire ou le marché du village', bad:['Le supermarché en ligne','Le centre commercial']}
];
function _histCM1_vocab(){
 const f=_histPick(HIST_CM1_VOCAB);
 return _histQ(f.q, f.ok, f.bad, 'hist-vie', f.ok);
}
const HIST_CM1_VRAIFAUX = [
 {aff:'Au Moyen Âge, les seigneurs vivaient dans des châteaux forts.', ok:'Vrai'},
 {aff:'Les chevaliers du Moyen Âge combattaient avec des fusils.', ok:'Faux'},
 {aff:'Clovis fut l\u2019un des premiers rois des Francs.', ok:'Vrai'},
 {aff:'Charlemagne a été sacré empereur en l\u2019an 800.', ok:'Vrai'},
 {aff:'Au Moyen Âge, tout le monde savait lire et écrire.', ok:'Faux'},
 {aff:'Les cathédrales sont de grandes églises du Moyen Âge.', ok:'Vrai'},
 {aff:'Jeanne d\u2019Arc a aidé à libérer la ville d\u2019Orléans.', ok:'Vrai'},
 {aff:'La peste noire était une maladie qui a beaucoup touché le Moyen Âge.', ok:'Vrai'},
 {aff:'Le système féodal organisait la société autour des liens entre seigneurs et vassaux.', ok:'Vrai'},
 {aff:'Les chevaliers combattaient toujours à pied, jamais à cheval.', ok:'Faux'},
 {aff:'Les cathédrales du Moyen Âge étaient construites en pierre.', ok:'Vrai'},
 {aff:'La guerre de Cent Ans a opposé la France et l\u2019Angleterre.', ok:'Vrai'},
 {aff:'Bertrand du Guesclin était un roi d\u2019Égypte.', ok:'Faux'},
 {aff:'Aliénor d\u2019Aquitaine a été reine de France puis reine d\u2019Angleterre.', ok:'Vrai'},
 {aff:'Au Moyen Âge, on utilisait déjà l\u2019électricité pour s\u2019éclairer.', ok:'Faux'},
 {aff:'Le pont-levis permettait de protéger l\u2019entrée d\u2019un château fort.', ok:'Vrai'},
 {aff:'Les moines copiaient les livres à la main dans les monastères.', ok:'Vrai'},
 {aff:'Philippe Auguste a agrandi le royaume de France.', ok:'Vrai'}
];
function _histCM1_vraifaux(){
 const f=_histPick(HIST_CM1_VRAIFAUX);
 const autre = f.ok==='Vrai' ? 'Faux' : 'Vrai';
 return _histQ(`${f.aff} Vrai ou faux ?`, f.ok, [autre], 'hist-vie', f.aff);
}
function genQ_HIST_CM1(boss,_d){
 _d=_d||0;
 const phase=(typeof _progPhase==='function')?_progPhase('CM1'):1;
 let pool;
 if(phase<=1)       pool=[_histCM1_personnage, _histCM1_vocab, _histCM1_vraifaux];
 else if(phase===2) pool=[_histCM1_personnage, _histCM1_vocab, _histCM1_vraifaux, _histCM1_frise];
 else               pool=[_histCM1_personnage, _histCM1_vocab, _histCM1_vraifaux, _histCM1_frise];
 const q=_histUnique(_histPick(pool)());
 if(!q){ if(_d>16) return _histCM1_personnage(); return genQ_HIST_CM1(boss,_d+1); }
 return q;
}

// ═══════════════════════════════════════════════════════
// CM2 — Temps modernes → Révolution → Empire → République → XXe-XXIe
// ═══════════════════════════════════════════════════════
const HIST_CM2_EVT = ['Découverte de l\u2019Amérique (1492)','Prise de la Bastille (1789)','Sacre de Napoléon (1804)','Fin de la Première Guerre mondiale (1918)','Fin de la Seconde Guerre mondiale (1945)','Premier pas sur la Lune (1969)'];
function _histCM2_evenements(){ return _histOrdreQ(HIST_CM2_EVT, 3, 'hist-frise'); }
const HIST_CM2_CAUSES = [
 {q:'Pourquoi la Révolution française a-t-elle éclaté en 1789 ?', ok:'Le peuple réclamait plus d\u2019égalité et supportait mal les impôts', bad:['Le roi voulait plus de vacances','Il n\u2019y avait plus d\u2019eau en France']},
 {q:'Pourquoi Napoléon a-t-il été sacré empereur en 1804 ?', ok:'Il a pris le pouvoir après la Révolution et s\u2019est fait couronner', bad:['Le peuple l\u2019a élu par un vote de tous les Français','Les rois d\u2019Europe le lui ont demandé']},
 {q:'Pourquoi l\u2019Union européenne a-t-elle été créée après 1945 ?', ok:'Pour rapprocher les pays européens et éviter une nouvelle guerre', bad:['Pour organiser les jeux Olympiques','Pour créer une seule langue en Europe']},
 {q:'Pourquoi la prise de la Bastille est-elle un événement important ?', ok:'C\u2019est un symbole du début de la Révolution française', bad:['C\u2019est la fin de la Seconde Guerre mondiale','C\u2019est le début du Moyen Âge']},
 {q:'Que réclamaient les Français pendant la Révolution ?', ok:'Liberté, égalité et fraternité', bad:['Un nouveau roi tout-puissant','Le retour au Moyen Âge']},
 {q:'Pourquoi Christophe Colomb est-il célèbre ?', ok:'Il a atteint l\u2019Amérique en 1492', bad:['Il a inventé l\u2019avion','Il a construit la tour Eiffel']},
 {q:'Qu\u2019est-ce qui a changé pour les rois après la Révolution française ?', ok:'Le roi n\u2019avait plus tous les pouvoirs', bad:['Le roi est devenu immortel','Il y a eu beaucoup plus de rois']},
 {q:'Pourquoi le 11 novembre est-il un jour important en France ?', ok:'Il marque la fin de la Première Guerre mondiale', bad:['C\u2019est la fête de la musique','C\u2019est le début de la Révolution']},
 {q:'Pourquoi Marie Curie est-elle célèbre ?', ok:'Elle a fait d\u2019importantes découvertes sur la radioactivité', bad:['Elle a construit la tour Eiffel','Elle a inventé l\u2019avion']},
 {q:'Pourquoi la loi de Jules Ferry sur l\u2019école est-elle importante ?', ok:'Elle a rendu l\u2019école gratuite et obligatoire pour tous', bad:['Elle a créé l\u2019Union européenne','Elle a aboli la royauté']},
 {q:'Pourquoi la Résistance s\u2019est-elle organisée pendant la Seconde Guerre mondiale ?', ok:'Pour lutter contre l\u2019occupation ennemie', bad:['Pour organiser des jeux Olympiques','Pour construire des pyramides']},
 {q:'Pourquoi la tour Eiffel a-t-elle été construite en 1889 ?', ok:'Pour une grande exposition universelle à Paris', bad:['Pour se protéger d\u2019une guerre','Pour observer les étoiles uniquement']},
 {q:'Pourquoi le droit de vote des femmes en 1944 est-il un événement important ?', ok:'Il a permis à toutes les femmes de voter comme les hommes', bad:['Il a supprimé les élections','Il a créé une nouvelle monnaie']},
 {q:'Pourquoi Victor Hugo est-il un écrivain important pour la France ?', ok:'Il a écrit des romans célèbres et défendu la justice sociale', bad:['Il a inventé l\u2019imprimerie','Il a été roi de France']},
 {q:'Pourquoi le 8 mai est-il un jour férié en France ?', ok:'Il marque la fin de la Seconde Guerre mondiale en Europe', bad:['C\u2019est la fête du travail','C\u2019est le début de la Révolution']},
 {q:'Pourquoi Clemenceau est-il surnommé le Père la Victoire ?', ok:'Il a dirigé la France jusqu\u2019à la victoire de 1918', bad:['Il a gagné une course automobile','Il a inventé un vaccin']},
 {q:'Pourquoi la Terreur (1793-1794) a-t-elle marqué la Révolution française ?', ok:'Ce fut une période de violence et d\u2019exécutions politiques', bad:['Ce fut une grande fête nationale','Ce fut une période de paix totale']},
 {q:'Pourquoi Jean Moulin est-il un symbole de la Résistance ?', ok:'Il a réussi à unifier les différents groupes résistants', bad:['Il a été président de la République','Il a écrit la Marseillaise']},
 {q:'Pourquoi Simone Veil est-elle une figure importante du XXe siècle ?', ok:'Elle a marqué l\u2019histoire par son engagement politique et européen', bad:['Elle a inventé l\u2019électricité','Elle a construit le château de Versailles']}
];
function _histCM2_causes(){
 const f=_histPick(HIST_CM2_CAUSES);
 return _histQ(f.q, f.ok, f.bad, 'hist-cause', f.ok);
}
const HIST_CM2_PERSO = [
 {nom:'Napoléon Bonaparte', indices:['Je suis devenu empereur des Français en 1804.','J\u2019ai mené de nombreuses guerres en Europe.','J\u2019ai fini ma vie en exil sur l\u2019île de Sainte-Hélène.']},
 {nom:'Louis XIV', indices:['On m\u2019appelle le Roi-Soleil.','J\u2019ai fait construire le château de Versailles.','J\u2019ai régné très longtemps sur la France.']},
 {nom:'Charles de Gaulle', indices:['J\u2019ai appelé les Français à résister pendant la guerre.','Mon appel a eu lieu le 18 juin 1940.','Je suis devenu président de la République.']},
 {nom:'Christophe Colomb', indices:['Je suis un navigateur du XVe siècle.','J\u2019ai traversé l\u2019océan Atlantique avec trois navires.','En 1492, j\u2019ai atteint l\u2019Amérique.']},
 {nom:'Louis Pasteur', indices:['Je suis un grand savant français.','J\u2019ai découvert le vaccin contre la rage.','J\u2019ai montré l\u2019importance de l\u2019hygiène.']},
 {nom:'Jules Ferry', indices:['Je suis un homme politique du XIXe siècle.','Grâce à moi, l\u2019école est devenue gratuite et obligatoire.','J\u2019ai rendu l\u2019école laïque.']},
 {nom:'Marie Curie', indices:['Je suis une grande scientifique d\u2019origine polonaise et française.','J\u2019ai étudié la radioactivité.','J\u2019ai reçu deux prix Nobel, en physique et en chimie.']},
 {nom:'Victor Hugo', indices:['Je suis un célèbre écrivain français du XIXe siècle.','J\u2019ai écrit le roman Les Misérables.','J\u2019ai aussi été un homme politique engagé.']},
 {nom:'Simone Veil', indices:['Je suis une femme politique française du XXe siècle.','Enfant, j\u2019ai vécu la Seconde Guerre mondiale.','J\u2019ai été la première présidente du Parlement européen.']},
 {nom:'Robespierre', indices:['Je suis une figure importante de la Révolution française.','J\u2019ai participé à une période très violente appelée la Terreur.','Je suis mort guillotiné en 1794.']},
 {nom:'Georges Clemenceau', indices:['On m\u2019appelle le Père la Victoire.','J\u2019ai dirigé la France à la fin de la Première Guerre mondiale.','J\u2019ai vécu la victoire de 1918.']},
 {nom:'Jean Moulin', indices:['Je suis un résistant français pendant la Seconde Guerre mondiale.','J\u2019ai réussi à unir différents mouvements de résistance.','Je suis mort après avoir été arrêté par l\u2019ennemi.']}
];
function _histCM2_personnage(){
 const p=_histPick(HIST_CM2_PERSO);
 const phase=(typeof _progPhase==='function')?_progPhase('CM2'):1;
 const nInd = phase<=1 ? 3 : phase===2 ? 2 : 1;
 const indices=p.indices.slice(0,nInd).join(' ');
 const autres=_histShuffle(HIST_CM2_PERSO.filter(x=>x.nom!==p.nom).map(x=>x.nom)).slice(0,2);
 return _histQ(`${indices} Qui suis-je ?`, p.nom, autres, 'hist-perso', `${p.nom} : ${p.indices.join(' ')}`);
}
const HIST_CM2_VOCAB = [
 {q:'Comment appelle-t-on le régime politique où le peuple choisit ses dirigeants ?', ok:'La République', bad:['La royauté','L\u2019empire']},
 {q:'Quelle est la devise de la République française ?', ok:'Liberté, Égalité, Fraternité', bad:['Un pour tous, tous pour un','Travail, famille, patrie']},
 {q:'Comment appelle-t-on la période qui suit le Moyen Âge, avec la Renaissance ?', ok:'Les Temps modernes', bad:['La Préhistoire','L\u2019Antiquité']},
 {q:'Comment appelle-t-on les deux grandes guerres du XXe siècle ?', ok:'Les guerres mondiales', bad:['Les croisades','Les guerres de Gaule']},
 {q:'Quel château magnifique Louis XIV a-t-il fait construire ?', ok:'Le château de Versailles', bad:['Le château fort de Clovis','La tour Eiffel']},
 {q:'Comment appelle-t-on la grande invention de l\u2019imprimerie à la Renaissance ?', ok:'L\u2019imprimerie de Gutenberg', bad:['La machine à vapeur','L\u2019ordinateur']},
 {q:'Qui dirige la France aujourd\u2019hui, élu par les citoyens ?', ok:'Le président de la République', bad:['Le roi','L\u2019empereur']},
 {q:'Comment appelle-t-on les tranchées où se sont battus les soldats de la Première Guerre mondiale ?', ok:'Les tranchées', bad:['Les douves','Les catacombes']},
 {q:'Comment appelle-t-on les soldats français de la Première Guerre mondiale ?', ok:'Les poilus', bad:['Les gladiateurs','Les chevaliers']},
 {q:'Quel jour célèbre-t-on la fin de la Première Guerre mondiale ?', ok:'Le 11 novembre', bad:['Le 14 juillet','Le 8 mai']},
 {q:'Quel jour célèbre-t-on la fin de la Seconde Guerre mondiale en Europe ?', ok:'Le 8 mai', bad:['Le 11 novembre','Le 1er janvier']},
 {q:'Que célèbre la fête nationale française du 14 juillet ?', ok:'Le souvenir de la Révolution française', bad:['La fête du travail','Noël']},
 {q:'Comment appelle-t-on l\u2019hymne national de la France ?', ok:'La Marseillaise', bad:['L\u2019Ode à la joie','Le God Save the King']},
 {q:'Comment appelle-t-on le symbole de la République française représenté en femme ?', ok:'Marianne', bad:['Jeanne d\u2019Arc','Athéna']},
 {q:'Comment appelle-t-on l\u2019organisation qui réunit de nombreux pays d\u2019Europe aujourd\u2019hui ?', ok:'L\u2019Union européenne', bad:['Les Nations unies','L\u2019Empire romain']},
 {q:'Comment appelle-t-on le vote qui permet aux citoyens de choisir leurs représentants ?', ok:'Une élection', bad:['Un sacre','Un tournoi']},
 {q:'Comment appelle-t-on le grand monument parisien construit pour l\u2019exposition universelle de 1889 ?', ok:'La tour Eiffel', bad:['L\u2019Arc de Triomphe','Le Panthéon']},
 {q:'Comment appelle-t-on la période de grands progrès techniques du XIXe siècle ?', ok:'La révolution industrielle', bad:['La Renaissance','La Préhistoire']},
 {q:'Quelle machine a transformé les transports au XIXe siècle en roulant sur des rails ?', ok:'Le train à vapeur', bad:['La voiture électrique','L\u2019avion à réaction']},
 {q:'Comment appelle-t-on le droit qui permet à chaque citoyen adulte de voter ?', ok:'Le suffrage universel', bad:['Le droit divin','La féodalité']}
];
function _histCM2_vocab(){
 const f=_histPick(HIST_CM2_VOCAB);
 return _histQ(f.q, f.ok, f.bad, 'hist-vie', f.ok);
}
function genQ_HIST_CM2(boss,_d){
 _d=_d||0;
 const phase=(typeof _progPhase==='function')?_progPhase('CM2'):1;
 let pool;
 if(phase<=1)       pool=[_histCM2_personnage, _histCM2_causes, _histCM2_vocab];
 else if(phase===2) pool=[_histCM2_personnage, _histCM2_causes, _histCM2_vocab, _histCM2_evenements];
 else               pool=[_histCM2_personnage, _histCM2_causes, _histCM2_vocab, _histCM2_evenements];
 const q=_histUnique(_histPick(pool)());
 if(!q){ if(_d>16) return _histCM2_personnage(); return genQ_HIST_CM2(boss,_d+1); }
 return q;
}

// Table des générateurs histoire — primaire uniquement pour l'instant (CP→CM2).
// Les autres niveaux (maternelle, collège) retombent sur les maths tant qu'ils
// ne sont pas écrits (cf. _subjGen() dans 07-game.js : fn=_GS[GM.level]||_GS.CP||GEN.CP).
// ═══════════════════════════════════════════════════════
// MATERNELLE (PS / MS / GS) — v11.3.0
//   Pas d'« histoire » formelle à cet âge (programme cycle 1 « Explorer le monde »),
//   mais les fondations neuro-éducatives du temps qui passe : rituels, cycles,
//   générations, avant/après, repérage visuel. 100% imagé (aucune lecture requise
//   en PS/MS ; de courtes légendes apparaissent en GS, pont vers le CP).
//   2 catégories de suivi dédiées (cf. _histCatOf) : 'temps' et 'repere'.
//   Réutilise le rendu visuel générique de la maternelle (_matRenderQ, 13-maternelle.js) :
//   il suffit de fournir consigne/visuelHtml/choices/res + maternelle:true.
// ═══════════════════════════════════════════════════════
function _histMatQ(level, consigne, visuelHtml, choices, res, opKey, row){
 const q = { maternelle:true, level, type:'mat', subj:'hist', img:'', consigne, visuelHtml:visuelHtml||'', choices, res, opKey:opKey||'histmat-temps' };
 if(row) q.row=true;
 return q;
}
function _histMatIcon(emoji){ return `<div class="mat-collection"><span class="mat-obj">${emoji}</span></div>`; }
function _histMatIconCap(emoji, cap){ return `<div class="mat-collection"><span class="mat-obj">${emoji}</span><div style="font-size:.4em;color:var(--text-secondary,#7f8c8d);width:100%;text-align:center;margin-top:2px;">${cap}</div></div>`; }
function _histMatRowHtml(arr){ return `<div class="mat-collection mat-rowtas">${arr.map(e=>`<span class="mat-obj" style="font-size:1.3em;">${e}</span>`).join('')}</div>`; }
// v11.3.1 — FIX bug critique : val doit être attribué APRÈS le mélange (comme dans
// _histQ), jamais avant. L'ancien code fixait val:1/val:2 puis mélangeait le tableau
// et cherchait ensuite l'INDEX du bon val pour en faire un "res" — un val figé et une
// recherche d'index sont deux choses différentes, donc res pointait au hasard sur la
// mauvaise case après mélange (~1 fois sur 2). Ce helper unique élimine tout risque de
// récidive : val est réattribué à la position finale, res=val de l'objet correct.
function _histMatBinaryChoices(correctHtml, wrongHtml){
 const items = _histShuffle([{html:correctHtml, ok:true},{html:wrongHtml, ok:false}]);
 let res=1;
 const choices = items.map((it,i)=>{ const val=i+1; if(it.ok) res=val; return {val, html:it.html}; });
 return {choices, res};
}
// Anti-répétition dédiée (clé = consigne + résumé du visuel + réponse)
let _histMatRecent = [];
const _HISTMAT_RECENT_MAX = 20;
function _histMatUnique(q){
 if(!q) return q;
 const key = q.consigne+'|'+(q.visuelHtml||'').slice(0,50)+'|'+q.res;
 if(_histMatRecent.indexOf(key)>=0) return null;
 _histMatRecent.push(key); if(_histMatRecent.length>_HISTMAT_RECENT_MAX) _histMatRecent.shift();
 return q;
}

// ── PS (3-4 ans) ──────────────────────────────────────────
// Avant/après (objets d'hier → d'aujourd'hui, icône seule, aucune lecture)
const HIST_MAT_PS_AVANTAPRES = [
 {av:'🏮', ap:'💡'}, {av:'✉️', ap:'📱'}, {av:'🕯️', ap:'💡'}, {av:'📻', ap:'🎧'},
 {av:'🐎', ap:'🚗'}, {av:'⛵', ap:'🛳️'}, {av:'🪶', ap:'💻'}, {av:'🧺', ap:'🌀'},
 {av:'🔥', ap:'⚡'}, {av:'🧮', ap:'🔢'}, {av:'⌨️', ap:'💻'}, {av:'🏰', ap:'🏢'},
 {av:'🪣', ap:'🚰'}, {av:'💿', ap:'🎧'}, {av:'🧹', ap:'🌀'}, {av:'🐴', ap:'🚌'},
 {av:'🎈', ap:'✈️'}, {av:'🐂', ap:'🚜'}
];
const HIST_MAT_PS_DISTRACT = ['🍎','🐘','⚽','🎈','🦋','🐘','🌂','🎲'];
function _histMatPS_avantApres(){
 const p=_histPick(HIST_MAT_PS_AVANTAPRES);
 let bad=_histPick(HIST_MAT_PS_DISTRACT); let g=0; while(bad===p.ap && g++<8) bad=_histPick(HIST_MAT_PS_DISTRACT);
 const {choices,res}=_histMatBinaryChoices(_histMatIcon(p.ap), _histMatIcon(bad));
 return _histMatQ('PS', 'Touche ce qui vient après.', _histMatIcon(p.av), choices, res, 'histmat-temps-avantapres');
}
// Jour / nuit (rituels de la journée)
const HIST_MAT_PS_JOURNUIT = [
 {ic:'☀️', jour:true}, {ic:'🌙', jour:false}, {ic:'🏫', jour:true}, {ic:'🛏️', jour:false},
 {ic:'🥞', jour:true}, {ic:'⭐', jour:false}, {ic:'🎠', jour:true}, {ic:'🦉', jour:false},
 {ic:'🚲', jour:true}, {ic:'🌛', jour:false}, {ic:'🍎', jour:true}, {ic:'🧸', jour:false},
 {ic:'🐓', jour:true}, {ic:'🦇', jour:false}, {ic:'🏖️', jour:true}, {ic:'💤', jour:false},
 {ic:'🌤️', jour:true}, {ic:'🌌', jour:false}
];
function _histMatPS_jourNuit(){
 const f=_histPick(HIST_MAT_PS_JOURNUIT);
 const {choices,res}=_histMatBinaryChoices(
  f.jour ? _histMatIcon('☀️') : _histMatIcon('🌙'),
  f.jour ? _histMatIcon('🌙') : _histMatIcon('☀️')
 );
 return _histMatQ('PS', 'C\u2019est le jour ou la nuit ?', _histMatIcon(f.ic), choices, res, 'histmat-temps-journuit');
}
// Générations simplifiées : « touche le plus grand »
const HIST_MAT_PS_GENER = [
 {p:'👶', g:'🧒'}, {p:'🧒', g:'🧑'}, {p:'🧑', g:'👴'}, {p:'🐣', g:'🐔'},
 {p:'👧', g:'👩'}, {p:'👦', g:'👨'}, {p:'🧑', g:'👵'}, {p:'👶', g:'🧑'},
 {p:'🧒', g:'👨'}, {p:'👧', g:'👵'}, {p:'👦', g:'👴'}, {p:'👶', g:'👩'},
 {p:'🧒', g:'👴'}, {p:'👶', g:'👨'}, {p:'👧', g:'🧑'}, {p:'👦', g:'🧑'},
 {p:'🧒', g:'👵'}, {p:'👶', g:'👵'}
];
function _histMatPS_gener(){
 const f=_histPick(HIST_MAT_PS_GENER);
 const {choices,res}=_histMatBinaryChoices(_histMatIcon(f.g), _histMatIcon(f.p));
 return _histMatQ('PS', 'Touche le plus grand.', '', choices, res, 'histmat-temps-gener');
}
function genQ_HIST_PS(boss,_d){
 _d=_d||0;
 const phase=(typeof _progPhase==='function')?_progPhase('PS'):1;
 let pool;
 if(phase<=1) pool=[_histMatPS_jourNuit, _histMatPS_gener];
 else pool=[_histMatPS_jourNuit, _histMatPS_gener, _histMatPS_avantApres];
 const q=_histMatUnique(_histPick(pool)());
 if(!q){ if(_d>16) return _histMatPS_jourNuit(); return genQ_HIST_PS(boss,_d+1); }
 return q;
}

// ── MS (4-5 ans) ──────────────────────────────────────────
// Séquences en 3 étapes : touche la rangée dans le bon ordre
const HIST_MAT_MS_SEQ3 = [
 ['🌅','☀️','🌙'], ['🥚','🐣','🐔'], ['🐛','🦋','🌸'], ['👶','🧒','🧑'],
 ['🌱','🌿','🌳'], ['🌾','🍞','🥖'], ['❄️','💧','🌱'], ['🌧️','☁️','🌈'],
 ['🕯️','🏮','💡'], ['✉️','📠','📱'], ['🐎','🚂','🚗'], ['🏺','🏛️','🏢'],
 ['🪨','🔨','🏠'], ['🧵','👕','👗'], ['🌰','🌱','🌳'], ['🥛','🧀','🍽️'],
 ['🧊','💧','☁️'], ['🌙','🌗','☀️'], ['🍂','❄️','🌸'], ['🎂','🕯️','🎉']
];
function _histMatMS_seq3(){
 const seq=_histPick(HIST_MAT_MS_SEQ3);
 let wrong=_histShuffle(seq); let g=0; while(wrong.join()===seq.join() && g++<10) wrong=_histShuffle(seq);
 const {choices,res}=_histMatBinaryChoices(_histMatRowHtml(seq), _histMatRowHtml(wrong));
 return _histMatQ('MS', 'Quelle rangée est dans le bon ordre ?', '', choices, res, 'histmat-repere-seq3', true);
}
// Générations familiales (icônes, sans texte)
const HIST_MAT_MS_GENER = [
 {vieux:'👴', jeune:'👶'}, {vieux:'👵', jeune:'👧'}, {vieux:'👴', jeune:'👦'}, {vieux:'👵', jeune:'🧒'},
 {vieux:'👨', jeune:'👶'}, {vieux:'👩', jeune:'👶'}, {vieux:'👴', jeune:'👨'}, {vieux:'👵', jeune:'👩'},
 {vieux:'👴', jeune:'🧒'}, {vieux:'👵', jeune:'👶'}, {vieux:'👨', jeune:'🧒'}, {vieux:'👩', jeune:'👧'},
 {vieux:'👴', jeune:'👧'}, {vieux:'👵', jeune:'👦'}, {vieux:'👨', jeune:'👦'}, {vieux:'👩', jeune:'🧒'}
];
function _histMatMS_gener(){
 const f=_histPick(HIST_MAT_MS_GENER);
 const {choices,res}=_histMatBinaryChoices(_histMatIcon(f.vieux), _histMatIcon(f.jeune));
 return _histMatQ('MS', 'Qui est né avant, qui est le plus âgé ?', '', choices, res, 'histmat-temps-gener');
}
// Objets anciens / modernes (icônes seules)
const HIST_MAT_MS_ANCIEN = [
 {old:'☎️', new:'📱'}, {old:'📻', new:'🎧'}, {old:'🕯️', new:'💡'}, {old:'✉️', new:'📧'},
 {old:'⌨️', new:'💻'}, {old:'🐎', new:'🚗'}, {old:'⛵', new:'🛳️'}, {old:'🧮', new:'🔢'},
 {old:'🏮', new:'💡'}, {old:'🪣', new:'🚰'}, {old:'🧺', new:'🌀'}, {old:'💿', new:'🎧'},
 {old:'🐴', new:'🚌'}, {old:'🐂', new:'🚜'}, {old:'🎈', new:'✈️'}, {old:'🪶', new:'💻'}
];
function _histMatMS_ancien(){
 const f=_histPick(HIST_MAT_MS_ANCIEN);
 const {choices,res}=_histMatBinaryChoices(_histMatIcon(f.old), _histMatIcon(f.new));
 return _histMatQ('MS', 'Touche l\u2019objet le plus ancien.', '', choices, res, 'histmat-repere-ancien');
}
function genQ_HIST_MS(boss,_d){
 _d=_d||0;
 const phase=(typeof _progPhase==='function')?_progPhase('MS'):1;
 let pool;
 if(phase<=1) pool=[_histMatMS_gener, _histMatMS_ancien];
 else pool=[_histMatMS_gener, _histMatMS_ancien, _histMatMS_seq3];
 const q=_histMatUnique(_histPick(pool)());
 if(!q){ if(_d>16) return _histMatMS_ancien(); return genQ_HIST_MS(boss,_d+1); }
 return q;
}

// ── GS (5-6 ans) — pont vers le CP, courtes légendes autorisées ─────
// Frise à 4 étapes
const HIST_MAT_GS_FRISE4 = [
 ['👶','🧒','🧑','👴'], ['🥚','🐣','🐤','🐔'], ['🌰','🌱','🌿','🌳'],
 ['🕯️','🏮','📻','💡'], ['✉️','📠','☎️','📱'], ['🐎','🐴','🚂','🚗'],
 ['🏚️','🏠','🏢','🏙️'], ['🪨','🔨','🧱','🏠'], ['🌅','☀️','🌇','🌙'], ['❄️','🌱','🌸','☀️'],
 ['🧵','🪡','👕','🏭'], ['📜','🖋️','⌨️','💻'], ['🛶','⛵','🚢','🛳️']
];
function _histMatGS_frise4(){
 let seq=_histPick(HIST_MAT_GS_FRISE4);
 if(new Set(seq).size<4) seq=['👶','🧒','🧑','👴'];
 let wrong=_histShuffle(seq); let g=0; while(wrong.join()===seq.join() && g++<10) wrong=_histShuffle(seq);
 const {choices,res}=_histMatBinaryChoices(_histMatRowHtml(seq), _histMatRowHtml(wrong));
 return _histMatQ('GS', 'Quelle rangée respecte l\u2019ordre du temps ?', '', choices, res, 'histmat-repere-frise4', true);
}
// Avant/après : le texte de la question ET la réponse varient toujours ensemble
// (cf. bug corrigé au CP en E.8 — vigilance systématique sur ce pattern).
const HIST_MAT_GS_AVANTAPRES = [
 {av:'🏮', avCap:'lampe à huile', ap:'💡', apCap:'ampoule'},
 {av:'✉️', avCap:'lettre', ap:'📱', apCap:'téléphone'},
 {av:'📻', avCap:'poste à lampes', ap:'🎧', apCap:'écouteurs'},
 {av:'🐎', avCap:'cheval', ap:'🚗', apCap:'voiture'},
 {av:'⛵', avCap:'voilier', ap:'🛳️', apCap:'paquebot'},
 {av:'🪶', avCap:'plume', ap:'💻', apCap:'ordinateur'},
 {av:'🧺', avCap:'lavoir', ap:'🌀', apCap:'machine à laver'},
 {av:'🕯️', avCap:'bougie', ap:'💡', apCap:'ampoule électrique'},
 {av:'🐴', avCap:'calèche', ap:'🚌', apCap:'bus'},
 {av:'🐂', avCap:'charrue', ap:'🚜', apCap:'tracteur'},
 {av:'🎈', avCap:'montgolfière', ap:'✈️', apCap:'avion'},
 {av:'💿', avCap:'disque', ap:'🎧', apCap:'musique en ligne'},
 {av:'🧮', avCap:'boulier', ap:'🔢', apCap:'calculatrice'},
 {av:'⌨️', avCap:'machine à écrire', ap:'💻', apCap:'ordinateur portable'},
 {av:'🪣', avCap:'puits', ap:'🚰', apCap:'robinet'},
 {av:'🏰', avCap:'château fort', ap:'🏢', apCap:'immeuble'},
 {av:'🧹', avCap:'balai', ap:'🌀', apCap:'aspirateur'},
 {av:'🐘', avCap:'transport à dos d\u2019animal', ap:'🚚', apCap:'camion'}
];
function _histMatGS_avantApres(){
 const p=_histPick(HIST_MAT_GS_AVANTAPRES);
 const askAvant=Math.random()<0.5;
 const {choices,res}=_histMatBinaryChoices(
  askAvant ? _histMatIconCap(p.av,p.avCap) : _histMatIconCap(p.ap,p.apCap),
  askAvant ? _histMatIconCap(p.ap,p.apCap) : _histMatIconCap(p.av,p.avCap)
 );
 return _histMatQ('GS', askAvant?'Touche ce qui vient d\u2019avant.':'Touche ce qui vient d\u2019après.', '', choices, res, 'histmat-temps-avantapres');
}
// Ancien / moderne avec légende
const HIST_MAT_GS_ANCIEN = [
 {old:'🕯️', oldCap:'lampe à huile', new:'💡', newCap:'ampoule'},
 {old:'⌨️', oldCap:'machine à écrire', new:'💻', newCap:'ordinateur'},
 {old:'🐴', oldCap:'calèche', new:'🚗', newCap:'voiture'},
 {old:'📻', oldCap:'radio à lampes', new:'🎧', newCap:'écouteurs sans fil'},
 {old:'✉️', oldCap:'lettre', new:'📧', newCap:'email'},
 {old:'🧺', oldCap:'lavoir', new:'🌀', newCap:'machine à laver'},
 {old:'🐂', oldCap:'charrue et bœuf', new:'🚜', newCap:'tracteur'},
 {old:'🛶', oldCap:'pirogue', new:'🛳️', newCap:'paquebot'},
 {old:'🪣', oldCap:'seau au puits', new:'🚰', newCap:'robinet'},
 {old:'💿', oldCap:'disque vinyle', new:'🎧', newCap:'musique en ligne'},
 {old:'🏮', oldCap:'lanterne', new:'💡', newCap:'ampoule électrique'},
 {old:'🧮', oldCap:'boulier', new:'🔢', newCap:'calculatrice'},
 {old:'🐎', oldCap:'diligence', new:'🚄', newCap:'train'},
 {old:'🎈', oldCap:'montgolfière', new:'✈️', newCap:'avion'},
 {old:'🏰', oldCap:'château fort', new:'🏢', newCap:'immeuble'},
 {old:'🧹', oldCap:'balai', new:'🌀', newCap:'aspirateur'}
];
function _histMatGS_ancien(){
 const f=_histPick(HIST_MAT_GS_ANCIEN);
 const {choices,res}=_histMatBinaryChoices(_histMatIconCap(f.old,f.oldCap), _histMatIconCap(f.new,f.newCap));
 return _histMatQ('GS', 'Touche l\u2019objet le plus ancien.', '', choices, res, 'histmat-repere-ancien');
}
// Vrai / faux illustré, formulation très simple
const HIST_MAT_GS_VRAIFAUX = [
 {aff:'Avant, il n\u2019y avait pas d\u2019électricité.', vrai:true, ic:'🕯️'},
 {aff:'Les dinosaures vivent avec nous aujourd\u2019hui.', vrai:false, ic:'🦕'},
 {aff:'Avant, on écrivait avec une plume.', vrai:true, ic:'🪶'},
 {aff:'Autrefois, tout le monde avait un téléphone portable.', vrai:false, ic:'📱'},
 {aff:'Il y a longtemps, on voyageait à cheval.', vrai:true, ic:'🐎'},
 {aff:'Les chevaliers portaient des baskets.', vrai:false, ic:'👟'},
 {aff:'Avant, on lavait le linge à la main.', vrai:true, ic:'🧺'},
 {aff:'Nos arrière-grands-parents avaient internet.', vrai:false, ic:'💻'},
 {aff:'Autrefois, on s\u2019éclairait à la bougie.', vrai:true, ic:'🕯️'},
 {aff:'Les hommes préhistoriques conduisaient des voitures.', vrai:false, ic:'🚗'},
 {aff:'Il y a longtemps, les lettres arrivaient à cheval.', vrai:true, ic:'✉️'},
 {aff:'Grand-père a toujours eu un smartphone.', vrai:false, ic:'📱'},
 {aff:'Autrefois, on comptait avec un boulier.', vrai:true, ic:'🧮'},
 {aff:'Les rois habitaient dans des immeubles modernes.', vrai:false, ic:'🏰'},
 {aff:'Avant le train, on voyageait en calèche.', vrai:true, ic:'🐴'}
];
function _histMatGS_vraifaux(){
 const f=_histPick(HIST_MAT_GS_VRAIFAUX);
 const {choices,res}=_histMatBinaryChoices(
  f.vrai ? _histMatIcon('👍') : _histMatIcon('👎'),
  f.vrai ? _histMatIcon('👎') : _histMatIcon('👍')
 );
 return _histMatQ('GS', f.aff, _histMatIcon(f.ic), choices, res, 'histmat-repere-vraifaux');
}
function genQ_HIST_GS(boss,_d){
 _d=_d||0;
 const phase=(typeof _progPhase==='function')?_progPhase('GS'):1;
 let pool;
 if(phase<=1) pool=[_histMatGS_avantApres, _histMatGS_ancien];
 else if(phase===2) pool=[_histMatGS_avantApres, _histMatGS_ancien, _histMatGS_vraifaux];
 else pool=[_histMatGS_avantApres, _histMatGS_ancien, _histMatGS_vraifaux, _histMatGS_frise4];
 const q=_histMatUnique(_histPick(pool)());
 if(!q){ if(_d>16) return _histMatGS_ancien(); return genQ_HIST_GS(boss,_d+1); }
 return q;
}

const GEN_HIST = { PS: genQ_HIST_PS, MS: genQ_HIST_MS, GS: genQ_HIST_GS, CP: genQ_HIST_CP, CE1: genQ_HIST_CE1, CE2: genQ_HIST_CE2, CM1: genQ_HIST_CM1, CM2: genQ_HIST_CM2 };
