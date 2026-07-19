// 07-story.js — L'Odyssée du Savoir
'use strict';

// Histoire / livres / narration : récits par matière (_PRIM/MAT/COL_STORY + FR),
// livres collège, narration vocale, journal de quête, cartes boss.
// (Extrait de 07-game.js.)

let STORY_VILLAIN = 'Comte Zéro de Cafouillac';
let STORY_KINGDOM = 'Calcultopia';
// Nombre de Cristaux régionaux = nombre de régions de jeu (hors Sanctuaire final).
function _storyCrystalCount(){
 try{ return _ARCH_REGIONS.filter(r => r.id !== _lastRegionId()).length; }catch(e){ return 5; }
}
// Interpolation des textes : {hero}, {villain}, {kingdom}, {crystals}
function _storyText(s){
 const hero = (typeof P!=='undefined' && P && P.name) ? P.name : 'jeune Calculateur';
 return String(s)
  .replace(/\{hero\}/g, hero)
  .replace(/\{villain\}/g, STORY_VILLAIN)
  .replace(/\{kingdom\}/g, STORY_KINGDOM)
  .replace(/\{crystals\}/g, _storyCrystalCount());
}
const _PRIM_STORY = {
 intro: {
  id:'intro',
  title:'Prologue — L\'Ombre sur Calcultopia',
  pages:[
   { emoji:'🏰', text:"Il était une fois un royaume lumineux nommé <b>Calcultopia</b>, où les nombres dansaient dans l'air comme des lucioles dorées. Tout y était harmonie : les rivières comptaient leurs vagues, les arbres alignaient leurs feuilles, et chaque matin le soleil se levait pile à l'heure." },
   { emoji:'💎', text:"Cette harmonie venait des <b>Cristaux de Calcultopia</b>, des joyaux magiques cachés à travers le monde. Tant qu'ils brillaient, l'ordre régnait, les récoltes étaient justes et personne ne se trompait jamais dans ses calculs." },
   { emoji:'🌑', text:"Mais une nuit sans étoiles, surgi du Grand Vide, apparut le terrible <b>{villain}</b> ! D'un rire glacial qui gela les fontaines, il hurla : « Plus de nombres ! Plus d'ordre ! Que TOUT devienne FLOU ! »" },
   { emoji:'💥', text:"D'un claquement de doigts, il fit voler les Cristaux en éclats de lumière. Un à un, ils s'éteignirent... et un épais <b>brouillard</b> recouvrit chaque région du royaume, emmêlant les nombres et brouillant tous les calculs." },
   { emoji:'👹', text:"Le {villain} confia alors chaque Cristal brisé à un <b>gardien corrompu</b>, une bête transformée par sa magie noire, pour qu'aucun héros ne puisse jamais les reprendre. Puis il se retira dans son Sanctuaire, tout au bout du monde." },
   { emoji:'🦸', text:"Mais une vieille légende murmurait qu'un jour se lèverait un <b>jeune Calculateur</b> au cœur vaillant et à l'esprit vif... {hero}, ce héros annoncé, c'est <b>TOI</b> !" },
   { emoji:'🗺️', text:"Ton odyssée commence. Traverse les {crystals} régions, affronte les gardiens, reprends les Cristaux un par un, puis marche jusqu'au Sanctuaire affronter le {villain} lui-même. <b>Calcultopia compte sur toi !</b>" },
  ],
 },
 // Chapitres d'ENTRÉE de région (indexés par regionId — extensible)
 chapters: {
  cp: {
   id:'chap_cp',
   title:'Chapitre I — La Région des Débuts',
   crystal:'Cristal de l\'Unité',
   pages:[
    { emoji:'🌾', text:"Te voici dans la <b>Région des Débuts</b>, de douces plaines vallonnées où ton aventure prend racine. Ici, le brouillard est encore léger — mais les animaux errent, perdus, incapables de compter leurs propres pas." },
    { emoji:'🧙', text:"Un vieux sage à la barbe d'argent s'approche : « Enfin, te voilà, brave {hero} ! Le tout premier joyau, le <b>Cristal de l'Unité</b>, est gardé par le <b>Loup des Plaines</b>, devenu féroce depuis que le {villain} l'a corrompu. »" },
    { emoji:'💎', text:"« Relève les défis de chaque lieu pour gagner en courage, puis affronte le Loup au bout du chemin. Libère le Cristal de l'Unité... et la toute première lueur d'espoir renaîtra sur Calcultopia ! » En avant, héros !" },
   ],
  },
  ce1: {
   id:'chap_ce1',
   title:'Chapitre II — Bois et Plages',
   crystal:'Cristal de l\'Élan',
   pages:[
    { emoji:'🌲', text:"Le Cristal de l'Unité brille de nouveau ! Mais à peine as-tu quitté les plaines que tu pénètres dans les <b>Bois et Plages</b>, où les arbres murmurent et les vagues ont oublié comment compter leurs rouleaux." },
    { emoji:'🧙', text:"Maître Comptin, le vieux sage, t'a suivi : « Tu progresses vite, {hero} ! Mais sois prudent... » Soudain, une petite lumière dorée volette autour de toi en pétillant !" },
    { emoji:'✨', text:"« Bonjour ! Je suis <b>Lumo</b>, une étincelle née d'un Cristal ! » couine la luciole. « Là où je vole, le brouillard recule. Je viens avec toi ! » Tu as trouvé un compagnon fidèle." },
    { emoji:'🦌', text:"Maître Comptin reprend : « Le <b>Cristal de l'Élan</b> est gardé par le Cerf Spectral, au cœur de la forêt. Mais prends garde : le {villain} sait désormais qu'un héros se dresse contre lui... »" },
    { emoji:'⚔️', text:"Au loin, un rire glacial résonne entre les arbres. Le {villain} t'observe ! Qu'importe — tu serres les poings, Lumo brille plus fort, et tu t'enfonces dans les bois. Rien ne t'arrêtera." },
   ],
  },
  ce2: {
   id:'chap_ce2',
   title:'Chapitre III — Les Terres d\'Aventure',
   crystal:'Cristal du Voyage',
   pages:[
    { emoji:'🏜️', text:"Deux Cristaux retrouvés ! Te voilà dans les <b>Terres d'Aventure</b> : déserts brûlants et temples oubliés où le sable efface les chiffres aussi vite qu'on les trace." },
    { emoji:'🥷', text:"Mais une ombre te barre la route ! C'est le <b>Sergent Virgule</b>, lieutenant du {villain}. « Halte, petit héros ! Le maître m'envoie te ralentir ! » ricane-t-il en brouillant les dunes." },
    { emoji:'💪', text:"Lumo se cache, effrayée. Mais toi, {hero}, tu redresses la tête : « Je n'ai pas peur de toi ! » Ton courage fait reculer le Sergent, qui s'enfuit en jurant que le maître se vengera." },
    { emoji:'🏺', text:"Maître Comptin te rejoint, essoufflé : « Bravo ! Quel cran ! Le <b>Cristal du Voyage</b> repose dans le Temple Antique, gardé par le Sphinx des Sables. Réponds à ses énigmes et il sera tien. »" },
    { emoji:'🌟', text:"Lumo réapparaît, un peu honteuse : « Tu es si brave... je serai courageuse moi aussi ! » Ensemble, vous avancez vers le temple, le cœur vaillant. Trois Cristaux bientôt !" },
   ],
  },
  cm1: {
   id:'chap_cm1',
   title:'Chapitre IV — Les Royaumes Périlleux',
   crystal:'Cristal de la Bravoure',
   pages:[
    { emoji:'🏰', text:"Les <b>Royaumes Périlleux</b> t'accueillent dans le froid : forteresses de pierre, remparts de givre, et un brouillard si épais qu'on n'y voit plus ses propres mains." },
    { emoji:'😰', text:"Soudain, un cri ! Le {villain} a capturé <b>Maître Comptin</b> et l'enferme dans une tour de glace ! « Si tu veux ton vieil ami, héros, viens donc le chercher... si tu l'oses ! » tonne sa voix." },
    { emoji:'🔥', text:"Ton sang ne fait qu'un tour. Lumo tremble : « C'est un piège ! » — « Peut-être, » réponds-tu, « mais on n'abandonne jamais un ami. » C'est ton plus grand acte de bravoure." },
    { emoji:'🐉', text:"Pour atteindre la tour, tu devras vaincre le Dragon des Remparts, gardien du <b>Cristal de la Bravoure</b>. Chaque calcul juste fissure la glace qui retient Maître Comptin." },
    { emoji:'💎', text:"« Tiens bon, {hero} ! » lance Lumo, brillant de mille feux. « Quatre Cristaux, et déjà tu fais reculer les ténèbres ! » Tu inspires un grand coup... et tu t'élances." },
   ],
  },
  cm2: {
   id:'chap_cm2',
   title:'Chapitre V — Au-delà des Étoiles',
   crystal:'Cristal de l\'Infini',
   pages:[
    { emoji:'🌌', text:"Maître Comptin libéré, vous voilà projetés <b>Au-delà des Étoiles</b>, dans le grand vide cosmique où flottent les derniers nombres du royaume, scintillant comme des constellations." },
    { emoji:'🧙', text:"Maître Comptin devient grave : « {hero}, il est temps que tu saches la vérité. Le {villain}... fut jadis le plus grand mathématicien de Calcultopia. »" },
    { emoji:'💔', text:"« Mais un jour, une seule erreur de calcul lui coûta tout. De honte et de colère, il jura d'effacer TOUS les nombres, pour que plus personne ne puisse jamais se tromper... ni réussir. »" },
    { emoji:'🌠', text:"Tu comprends alors : le {villain} n'est pas qu'un monstre, mais un cœur brisé. Le <b>Cristal de l'Infini</b>, gardé par le Colosse Stellaire, pourrait bien être la clé pour le raisonner." },
    { emoji:'✨', text:"« Cinq Cristaux, {hero} ! » s'écrie Lumo. « Il ne reste plus que le Sanctuaire ! » Le destin de Calcultopia tient désormais entre tes mains. Sois fort. Sois juste." },
   ],
  },
  final: {
   id:'chap_final',
   title:'Chapitre VI — Le Sanctuaire',
   crystal:'',
   pages:[
    { emoji:'🕉️', text:"Les cinq Cristaux flottent autour de toi, irradiant une lumière pure. Devant s'élève le <b>Sanctuaire Final</b>, dernier repaire du {villain}, là où tout a commencé... et où tout va se jouer." },
    { emoji:'👹', text:"« Te voilà donc, » murmure le {villain}, plus las que furieux. « Tu as repris mes Cristaux... mais comprends-tu seulement pourquoi je les ai brisés ? » Sa voix tremble." },
    { emoji:'❤️', text:"Maître Comptin pose une main sur ton épaule : « Montre-lui, {hero}. Montre-lui qu'une erreur n'est pas une fin — mais le début d'un nouvel apprentissage. C'est ça, la vraie magie des nombres. »" },
    { emoji:'⚔️', text:"Le {villain} lève les bras dans un dernier sursaut de colère : « Assez de belles paroles ! Prouve-moi ta valeur, héros ! » Le combat ultime commence. Pour Calcultopia. Pour Maître Comptin. Pour Lumo. <b>Pour toi.</b>" },
   ],
  },
 },
 // Scènes de VICTOIRE : jouées quand un Cristal est récupéré (région conquise)
 victories: {
  cp: { id:'win_cp', title:'Cristal de l\'Unité libéré !', crystal:'Cristal de l\'Unité', pages:[
   { emoji:'💎', text:"Le Loup des Plaines pousse un dernier grognement... puis la magie noire se dissipe ! Ses yeux redeviennent doux comme avant. De son pelage jaillit le <b>Cristal de l'Unité</b>, d'un <b>rouge</b> rubis éclatant, scintillant de mille feux !" },
   { emoji:'🌅', text:"La toute première lueur revient sur Calcultopia ! Le brouillard recule. Lumo danse de joie : « Bravo {hero} ! » Et Maître Comptin sourit : « Je savais que tu en étais capable. La quête ne fait que commencer. »" },
  ]},
  ce1: { id:'win_ce1', title:'Cristal de l\'Élan libéré !', crystal:'Cristal de l\'Élan', pages:[
   { emoji:'💎', text:"Le Cerf Spectral incline sa noble ramure et s'évapore en une pluie d'étincelles dorées. Le <b>Cristal de l'Élan</b>, d'un <b>orange</b> flamboyant, est à toi ! Les bois retrouvent leurs couleurs et les vagues se remettent à compter leurs rouleaux." },
   { emoji:'✨', text:"« Un Cristal de plus, {hero} ! » s'émerveille Lumo. Au loin, le {villain} grince des dents : « Comment ose-t-il me défier ainsi... » Ta légende grandit dans tout le royaume." },
  ]},
  ce2: { id:'win_ce2', title:'Cristal du Voyage libéré !', crystal:'Cristal du Voyage', pages:[
   { emoji:'💎', text:"Le Sphinx des Sables s'incline avec respect : « Tes réponses sont justes, jeune sage. Le Cristal t'appartient. » Le <b>Cristal du Voyage</b>, d'un <b>vert</b> émeraude profond, s'élève des sables anciens dans un tourbillon de lumière." },
   { emoji:'🏜️', text:"Vaincu et humilié, le Sergent Virgule déguerpit pour de bon ! Maître Comptin pose la main sur ton épaule : « Te voilà à mi-chemin. Le plus dur reste à venir... mais regarde comme tu as grandi. »" },
  ]},
  cm1: { id:'win_cm1', title:'Cristal de la Bravoure libéré !', crystal:'Cristal de la Bravoure', pages:[
   { emoji:'💎', text:"Dans un fracas titanesque, le Dragon des Remparts s'effondre, enfin libéré de la corruption ! La tour de glace se fissure et explose — <b>Maître Comptin est libre</b> ! Le <b>Cristal de la Bravoure</b>, d'un <b>bleu</b> saphir intense, brille entre tes mains." },
   { emoji:'🤝', text:"« Tu es venu... pour moi, » murmure le vieux sage, les yeux humides. « Toujours, » réponds-tu simplement. Lumo essuie une larme de lumière. Un Cristal de plus, et surtout : un ami sauvé." },
  ]},
  cm2: { id:'win_cm2', title:'Cristal de l\'Infini libéré !', crystal:'Cristal de l\'Infini', pages:[
   { emoji:'💎', text:"Le Colosse Stellaire s'agenouille, et toutes les étoiles applaudissent en scintillant ! Le <b>Cristal de l'Infini</b>, d'un <b>violet</b> améthyste, rejoint les autres et, ensemble, ils tournoient autour de toi en une couronne de lumière pure." },
   { emoji:'🌌', text:"« Tu as réuni tous les Cristaux, {hero} ! » s'écrie Lumo, éblouie. Il ne reste plus qu'une chose à faire : marcher vers le Sanctuaire, et affronter le {villain} en personne. Le moment de vérité est venu." },
  ]},
 },
 // ÉPILOGUE : joué après la victoire au Sanctuaire Final
 epilogue: {
  id:'epilogue',
  title:'Épilogue — La Lumière Retrouvée',
  pages:[
   { emoji:'⚔️', text:"Au terme d'un ultime affrontement, le {villain} tombe à genoux, à bout de forces. Mais au lieu de le frapper, {hero}, tu fais une chose que personne n'attendait : tu tends la main, et tu déposes doucement les Cristaux devant lui." },
   { emoji:'❤️', text:"« Une erreur ne fait pas de toi un monstre, » dis-tu d'une voix calme. « Elle fait de toi quelqu'un qui peut apprendre, et recommencer. » Le {villain} contemple les Cristaux... et pour la première fois depuis mille ans, une larme roule sur sa joue." },
   { emoji:'✨', text:"« J'avais... oublié cela, » souffle-t-il. « Merci, {hero}. » Alors son cœur s'illumine : il était le dernier Cristal manquant ! Tous les Cristaux fusionnent en une lumière éclatante qui balaie le tout dernier brouillard de Calcultopia." },
   { emoji:'🌈', text:"Les nombres dansent à nouveau dans l'air, les rivières comptent leurs vagues, et le soleil se lève pile à l'heure. Le royaume est sauvé ! Sur la grande place s'élève bientôt une statue à ton effigie : {hero}, Héros de Calcultopia." },
   { emoji:'🎉', text:"Maître Comptin, la fidèle Lumo, et même l'ancien Comte — devenu un humble professeur de mathématiques — t'acclament sous les étoiles. Ton odyssée restera gravée à jamais dans le ciel de Calcultopia. <b>FÉLICITATIONS, champion !</b>" },
  ],
 },
};

// v10.1.0 — _STORY est un pointeur permutable vers l'histoire de l'aventure active.
let _STORY = _PRIM_STORY;

// ─── Histoire MATERNELLE : « Le Pays des Couleurs » (v10.2.0, finale) ───
const _MAT_VILLAIN = 'Nuage Grognon';
const _MAT_KINGDOM = 'le Pays des Couleurs';
const _MAT_STORY = {
 intro: { id:'mat_intro', title:'Le Pays des Couleurs', pages:[
  { emoji:'🌈', text:"Il était une fois un pays magnifique : <b>{kingdom}</b>. Les coquelicots étaient rouges, les oranges bien orange, et le ciel tout bleu." },
  { emoji:'☁️', text:"Mais un matin, un gros nuage tout gris est arrivé : le <b>{villain}</b>. Il était si triste qu'il a aspiré toutes les couleurs ! Tout est devenu gris…" },
  { emoji:'🧒', text:"Les animaux ont besoin de toi, {hero} ! Sur chaque île, joue avec eux pour retrouver une couleur. En route, petit héros !" },
 ]},
 chapters: {
  cp:    { id:'mat_c_cp',  title:'La Plaine des Coquelicots', crystal:'le Rouge', pages:[
   { emoji:'🌱', text:"Te voilà dans la <b>Plaine des Coquelicots</b>. Les fleurs sont toutes grises et ça rend le petit lapin très triste." },
   { emoji:'🐰', text:"« {hero}, aide-nous ! » dit le lapin. « Si tu joues avec nous, le <b>rouge</b> reviendra ! »" },
  ]},
  ce1:   { id:'mat_c_ce1', title:'Le Verger des Oranges', crystal:'l\'Orange', pages:[
   { emoji:'🍊', text:"Dans le <b>Verger des Oranges</b>, les fruits sont gris comme des cailloux. L'ourson n'a plus envie de goûter !" },
   { emoji:'🐻', text:"« Mmm… aide-nous à retrouver la couleur <b>orange</b>, {hero}, et le verger sentira bon à nouveau ! »" },
  ]},
  ce2:   { id:'mat_c_ce2', title:'Les Bois Dorés', crystal:'le Jaune', pages:[
   { emoji:'🍂', text:"Chut… voici les <b>Bois Dorés</b>. D'habitude, les feuilles brillent comme des petits soleils. Mais tout est gris." },
   { emoji:'🦉', text:"« Hou hou ! » fait le hibou. « Le <b>jaune</b> se cache par ici. Joue avec nous pour le retrouver, {hero} ! »" },
  ]},
  cm1:   { id:'mat_c_cm1', title:'Le Lagon aux Tortues', crystal:'le Vert', pages:[
   { emoji:'🐢', text:"Plouf ! Bienvenue au <b>Lagon aux Tortues</b>. Les palmiers et les tortues ont perdu leur joli <b>vert</b>." },
   { emoji:'🌊', text:"« Viens jouer dans l'eau, {hero} ! » disent les poissons. « Ensemble, on va rendre le lagon tout vert ! »" },
  ]},
  cm2:   { id:'mat_c_cm2', title:'La Colline des Bleuets', crystal:'le Bleu', pages:[
   { emoji:'🪁', text:"Sur la <b>Colline des Bleuets</b>, le vent fait danser les cerfs-volants. Mais le ciel et les fleurs ont perdu leur <b>bleu</b>." },
   { emoji:'🐦', text:"« Encore un effort, {hero} ! » chante l'oiseau. « Quand le bleu reviendra, le ciel sera magnifique ! »" },
  ]},
  final: { id:'mat_c_final', title:'Le Château du Soir', crystal:'l\'Indigo', pages:[
   { emoji:'🏰', text:"Tout là-haut, voici le <b>Château du Soir</b>. C'est ici que dort le {villain}, dans le ciel couleur de nuit." },
   { emoji:'🌙', text:"Il garde la couleur <b>indigo</b>, celle du soir qui tombe. N'aie pas peur, {hero} : il a surtout besoin d'un ami." },
  ]},
 },
 victories: {
  cp:  { id:'mat_w_cp',  title:'Le Rouge est revenu !',  crystal:'le Rouge',  pages:[
   { emoji:'❤️', text:"Hourra ! Les coquelicots redeviennent <b>rouges</b>, un par un, comme des petites flammes ! Le lapin saute de joie." },
   { emoji:'🌈', text:"Regarde ton carnet, {hero} : la première couleur de l'arc-en-ciel brille déjà !" },
  ]},
  ce1: { id:'mat_w_ce1', title:'L\'Orange est revenue !',  crystal:'l\'Orange',  pages:[
   { emoji:'🧡', text:"Les oranges redeviennent <b>orange</b> et toutes brillantes ! L'ourson croque dedans : « Merci {hero} ! »" },
   { emoji:'🌈', text:"Deux couleurs dans ton arc-en-ciel ! Tu es un vrai petit magicien des couleurs." },
  ]},
  ce2: { id:'mat_w_ce2', title:'Le Jaune est revenu !',     crystal:'le Jaune',  pages:[
   { emoji:'💛', text:"Les feuilles des bois redeviennent <b>jaunes</b> et dorées. Tout scintille ! Le hibou fait « hou hou » de bonheur." },
   { emoji:'🌈', text:"Trois couleurs déjà ! L'arc-en-ciel de ton carnet devient de plus en plus joli." },
  ]},
  cm1: { id:'mat_w_cm1', title:'Le Vert est revenu !',  crystal:'le Vert',  pages:[
   { emoji:'💚', text:"Le <b>vert</b> coule sur les palmiers et les carapaces des tortues ! Le lagon est redevenu tout beau." },
   { emoji:'🌈', text:"Quatre couleurs, {hero} ! Plus que deux îles et le {villain} verra quelque chose de magnifique…" },
  ]},
  cm2: { id:'mat_w_cm2', title:'Le Bleu est revenu !', crystal:'le Bleu', pages:[
   { emoji:'💙', text:"Le ciel redevient <b>bleu</b>, et les bleuets aussi ! Les cerfs-volants dansent de joie dans le vent." },
   { emoji:'🌈', text:"Cinq couleurs ! Il ne manque plus que celle du soir. Direction le château, petit héros !" },
  ]},
 },
 epilogue: { id:'mat_epilogue', title:'L\'Arc-en-ciel complet', pages:[
  { emoji:'🌌', text:"Bravo {hero} ! L'<b>indigo</b> du soir est revenu. Et là… le {villain} ouvre grand les yeux : tout le pays brille de mille couleurs !" },
  { emoji:'☁️', text:"« Comme c'est beau… » murmure le nuage. Et pour la première fois, il <b>sourit</b> ! Il n'est plus gris du tout." },
  { emoji:'💜', text:"Alors, pour te dire merci, il souffle une couleur rien que pour toi : le <b>violet</b> ! La septième couleur, celle qui manquait." },
  { emoji:'🌈', text:"Regarde ton carnet : l'arc-en-ciel est <b>complet</b> ! {kingdom} est sauvé, et c'est grâce à toi. <b>BRAVO, petit héros des couleurs !</b>" },
 ]},
};

// ═══════════════════════════════════════════════════════
// L'ODYSSÉE DES MOTS — Maternelle (français) : « Le Grand Livre du Conteur »
// Aventure française pour GM.subject==='fr' en maternelle. Zones isolées
// (ids 'matfr_…') → progression séparée des maths. Histoire A (cadre) +
// Histoire B (le conte du Livre, débloqué à la fin).
// ═══════════════════════════════════════════════════════
const _MAT_VILLAIN_FR = 'le Silence';
const _MAT_KINGDOM_FR = 'le Pays des Mots';
// Zones : on réutilise la géométrie maternelle douce, avec des ids distincts
// pour isoler totalement la conquête (P.mapBossBeaten) de celle des maths, et des
// labels thématisés monde par monde (« Le Grand Livre du Conteur »).
const _MATFR_ZONE_LABELS = {
 // La Forêt des Animaux Muets (cris d'animaux)
 'matfr_cp_1':'La Clairière Silencieuse','matfr_cp_2':'Le Terrier du Lapin','matfr_cp_3':'La Mare aux Canards','matfr_cp_4':'Le Sentier des Bêtes','matfr_cp_5':'Le Grand Chêne Creux',
 // Le Pré des Premiers Mots (vocabulaire, intrus)
 'matfr_ce1_1':'Le Pré aux Mille Choses','matfr_ce1_2':'Le Panier Renversé','matfr_ce1_3':'Le Jardin des Noms','matfr_ce1_4':"L'Allée des Images",'matfr_ce1_5':'Le Sentier des Trouvailles',
 // Les Collines qui Chantent (syllabes)
 'matfr_ce2_1':"La Colline de l'Écho",'matfr_ce2_2':'Le Sentier qui Résonne','matfr_ce2_3':'Les Trois Sommets','matfr_ce2_4':'La Vallée des Tambours','matfr_ce2_5':'Le Pic des Refrains',
 // Le Lac aux Échos (rimes)
 'matfr_cm1_1':'La Rive aux Rimes','matfr_cm1_2':"L'Îlot des Reflets",'matfr_cm1_3':'Le Ponton Chantant','matfr_cm1_4':'La Crique des Échos','matfr_cm1_5':"Le Miroir d'Eau",
 // La Grotte des Premiers Sons (son d'attaque)
 'matfr_cm2_1':"L'Entrée Murmurante",'matfr_cm2_2':'La Galerie des Sons','matfr_cm2_3':'La Source Chuchotante','matfr_cm2_4':'Le Couloir Bleu','matfr_cm2_5':'La Chambre des Murmures',
 // Le Château des Lettres (lettres)
 'matfr_final_1':'Le Pont des Lettres','matfr_final_2':"La Tour de l'Alphabet",'matfr_final_3':'La Salle du Grand A','matfr_final_4':"L'Escalier des Mots",'matfr_final_5':'Le Donjon du Conteur',
};
const MAT_ZONES_FR = (typeof MAT_ZONES!=='undefined' ? MAT_ZONES : []).map(z => {
 const id = String(z.id).replace('mat_','matfr_');
 return Object.assign({}, z, { id, label: _MATFR_ZONE_LABELS[id] || z.label });
});
const _MAT_REGIONS_FR = [
 { id:'cp',    label:'La Forêt des Animaux Muets', levels:['PS'], shape:'colline' },
 { id:'ce1',   label:'Le Pré des Premiers Mots',   levels:['PS'], shape:'feuille' },
 { id:'ce2',   label:'Les Collines qui Chantent',  levels:['MS'], shape:'dune' },
 { id:'cm1',   label:'Le Lac aux Échos',           levels:['MS'], shape:'citadelle' },
 { id:'cm2',   label:'La Grotte des Premiers Sons',levels:['GS'], shape:'nebuleuse' },
 { id:'final', label:'Le Château des Lettres',     levels:['GS'], shape:'mandala' },
];
const _MAT_STORY_FR = {
 intro: { id:'matfr_intro', title:'Le Grand Livre du Conteur', pages:[
  { emoji:'📖', text:"Il était une fois un vieux Conteur, et un Livre pas comme les autres. Quand il l'ouvrait, les mots s'envolaient de ses pages comme des papillons : on entendait chanter les oiseaux, rire les enfants, souffler le vent." },
  { emoji:'🌑', text:"Mais une nuit, <b>{villain}</b> entra par la fenêtre. Il referma le Livre d'un coup sec — clap ! — et tous les mots s'échappèrent, effrayés, aux quatre coins du monde." },
  { emoji:'🪶', text:"Depuis, les pages sont toutes blanches. Alors une petite plume glisse du Livre et se pose sur ta main. « Petit ami {hero}, veux-tu m'aider à retrouver les mots, page après page ? Notre histoire commence ici. »" },
 ]},
 chapters: {
  cp:    { id:'matfr_c_cp',  title:'La Forêt des Animaux Muets', crystal:'la première page', pages:[
   { emoji:'🌲', text:"La première page t'emmène dans une <b>forêt</b> toute verte. D'habitude, ça chante et ça gazouille du matin au soir… mais aujourd'hui, plus un seul bruit." },
   { emoji:'🐾', text:"Les animaux ont perdu leur voix ! « Tends bien l'oreille, {hero}, chuchote Plume. Reconnais chaque cri, et la forêt rechantera. »" },
  ]},
  ce1:   { id:'matfr_c_ce1', title:'Le Pré des Premiers Mots', crystal:'la deuxième page', pages:[
   { emoji:'🌼', text:"Au bout de la forêt s'ouvre un grand <b>pré</b> doré. Mais ici, plus personne ne sait comment s'appellent les choses : tout s'est mélangé !" },
   { emoji:'🧺', text:"« Nomme chaque chose, {hero}, dit Plume, et chasse le petit <b>intrus</b> qui s'est glissé là où il ne fallait pas ! »" },
  ]},
  ce2:   { id:'matfr_c_ce2', title:'Les Collines qui Chantent', crystal:'la troisième page', pages:[
   { emoji:'⛰️', text:"Voici de grandes <b>collines</b> magiques. Quand on dit un mot tout fort, l'écho le renvoie en petits morceaux : pa-pi-llon !" },
   { emoji:'👏', text:"« Ces morceaux, ce sont les <b>syllabes</b>, explique Plume. Tape dans tes mains pour les compter, et les collines chanteront avec toi ! »" },
  ]},
  cm1:   { id:'matfr_c_cm1', title:'Le Lac aux Échos', crystal:'la quatrième page', pages:[
   { emoji:'💧', text:"Après les collines, un <b>lac</b> tranquille comme un miroir. Quand un mot tombe dans l'eau, un autre lui répond en finissant pareil : chat… rat !" },
   { emoji:'🌊', text:"« Trouve les mots qui sonnent pareil à la fin — ce sont des <b>rimes</b> — et tu rendras au lac toutes ses chansons, {hero} ! »" },
  ]},
  cm2:   { id:'matfr_c_cm2', title:'La Grotte des Premiers Sons', crystal:'la cinquième page', pages:[
   { emoji:'🕳️', text:"Voici une <b>grotte</b> fraîche et bleutée, où les sons aiment se cacher. Chaque mot commence par un petit son, comme une porte qui s'ouvre : sssserpent…" },
   { emoji:'✨', text:"« Devine par quel <b>son</b> commence chaque mot, souffle Plume, et une lumière s'allumera dans la grotte. »" },
  ]},
  final: { id:'matfr_c_final', title:'Le Château des Lettres', crystal:'la dernière page', pages:[
   { emoji:'🏰', text:"Au sortir de la grotte se dresse le <b>Château des Lettres</b>. Le A pointu comme un toit, le O rond comme une bulle… chaque lettre chante son petit son." },
   { emoji:'🔤', text:"« Tu es presque au bout du voyage, {hero}, murmure Plume, très fière. Reconnais les <b>lettres</b> et leur chanson, et le château ouvrira sa dernière porte. »" },
  ]},
 },
 victories: {
  cp:  { id:'matfr_w_cp',  title:'Une page retrouvée !', crystal:'la première page', pages:[
   { emoji:'🐱', text:"Hourra ! Un cri par-ci, un chant par-là… la forêt se réveille ! Les animaux ont retrouvé leur voix." },
   { emoji:'📖', text:"La première page du Livre se remplit de mots tout neufs. <b>Page après page</b>, le Livre revit !" },
  ]},
  ce1: { id:'matfr_w_ce1', title:'Une page retrouvée !', crystal:'la deuxième page', pages:[
   { emoji:'🍎', text:"Chaque chose a retrouvé son nom, et l'intrus est reparti ! Le pré brille de mille couleurs." },
   { emoji:'📖', text:"La deuxième page se couvre de jolis dessins. Encore une page sauvée, {hero} !" },
  ]},
  ce2: { id:'matfr_w_ce2', title:'Une page retrouvée !', crystal:'la troisième page', pages:[
   { emoji:'🎵', text:"Les collines résonnent de bonheur et te renvoient leur plus belle musique !" },
   { emoji:'📖', text:"La troisième page se met à fredonner toute seule. Bravo, {hero} !" },
  ]},
  cm1: { id:'matfr_w_cm1', title:'Une page retrouvée !', crystal:'la quatrième page', pages:[
   { emoji:'🌟', text:"À chaque rime trouvée, une vaguelette part danser sur l'eau. Le lac te dit merci !" },
   { emoji:'📖', text:"La quatrième page brille comme le soleil sur l'eau. Déjà quatre pages !" },
  ]},
  cm2: { id:'matfr_w_cm2', title:'Une page retrouvée !', crystal:'la cinquième page', pages:[
   { emoji:'💡', text:"Une à une, les petites lumières s'allument : la grotte scintille comme un ciel d'étoiles !" },
   { emoji:'📖', text:"La cinquième page s'éclaire d'une douce clarté. Plus qu'une, {hero} !" },
  ]},
 },
 epilogue: { id:'matfr_epilogue', title:'La Dernière Page', pages:[
  { emoji:'🦋', text:"Il ne reste qu'une page blanche : la <b>dernière</b>. Tous les mots que tu as délivrés tournoient autour de toi comme des papillons, prêts à rentrer à la maison." },
  { emoji:'📖', text:"« Rassemble-les tous, {hero} ! » souffle Plume. Tu ouvres grand les bras… et un à un, les mots se posent sur la dernière page. Le Livre se referme, tout chaud, rempli à nouveau." },
  { emoji:'🌟', text:"Vaincu, <b>{villain}</b> s'enfuit par la fenêtre, et la première étoile se met à briller." },
  { emoji:'🪶', text:"Le vieux Conteur ouvre les yeux. Il ouvre le Livre… et les mots s'envolent à nouveau, par milliers ! « Tu as sauvé toutes les histoires du monde, {hero}. Merci. »" },
  { emoji:'📖', text:"« Maintenant que le Livre est complet, il peut enfin raconter sa <b>propre</b> histoire. Assieds-toi près du feu… et écoute. »" },
 ]},
 // Histoire B — débloquée à la fin : le conte du Livre (origines du Conteur).
 bookTale: { id:'matfr_booktale', title:'Le conte du Livre', pages:[
  { emoji:'👴', text:"Il y a très longtemps, bien avant d'être vieux, le Conteur était un tout petit garçon." },
  { emoji:'🏚️', text:"Il vivait dans un village au bout du monde, où l'on ne parlait presque plus. Les gens avaient oublié les mots, un par un, comme on perd des billes au fond d'une poche." },
  { emoji:'👂', text:"Mais le petit garçon avait un secret : il <b>écoutait</b>. La pluie sur les toits, le feu qui craque, l'oiseau du matin. Pour lui, le monde était plein de petites musiques." },
  { emoji:'🪶', text:"Un jour d'automne, il trouva au pied d'un arbre une plume blanche qui brillait à peine. Et la plume se mit à parler, tout bas : « Tu entends les sons du monde ? Ce sont des mots qui attendent qu'on les garde. »" },
  { emoji:'📖', text:"Elle fit apparaître dans ses bras un grand livre aux pages blanches. « Va par le monde, écoute, et garde chaque mot ici. Un Livre plein de mots, c'est un Livre plein de vie. »" },
  { emoji:'🌍', text:"Alors le garçon partit. Il traversa forêts, prés, collines et lacs. Partout il s'arrêtait pour écouter, et partout il ramassait des mots comme on ramasse des fleurs." },
  { emoji:'✨', text:"Un mot, puis un autre, puis un autre encore. Le Livre devint lourd et chaud entre ses mains. L'enfant, lui, devint vieux, avec une longue barbe blanche." },
  { emoji:'🏡', text:"Il revint enfin dans son village silencieux. Et là, pour la première fois, il ouvrit son Livre devant tout le monde." },
  { emoji:'🦋', text:"Les mots s'envolèrent par centaines ! Quelqu'un dit « bonjour ». Puis « merci ». Puis un enfant éclata de rire. Le village tout entier se réveilla, et plus jamais il ne se tut." },
  { emoji:'🌑', text:"C'est ainsi qu'il devint le Conteur. Mais quelque part, dans le froid, le <b>Silence</b> avait entendu ce premier « bonjour »… et il guettait la nuit où il pourrait refermer le Livre. Cette nuit-là, justement, fut celle où commença <b>ton</b> aventure." },
  { emoji:'💛', text:"Car tant qu'un enfant voudra bien tendre l'oreille et retrouver les mots, page après page, le Livre ne se taira jamais. « Garde-le bien, {hero}. Maintenant, c'est un peu le tien aussi. »" },
 ]},
};

// ═══════════════════════════════════════════════════════
// L'ODYSSÉE DES MOTS — Primaire (français) : « Le carnet de Verbe »
// Aventure française pour GM.subject==='fr' en primaire. Zones isolées
// (ids 'primfr_…'). Histoire A (carnet du héros) + Histoire B (origines de Babel).
// ═══════════════════════════════════════════════════════
const _PRIM_VILLAIN_FR = 'le Docteur Babel';
const _PRIM_KINGDOM_FR = 'Verbopolis';
const _PRIMFR_ZONE_LABELS = {
 // CP — district des Sons
 plaine:'Les Faubourgs de Verbopolis', village:'La Place des Lettres', prairie:"L'Allée des Voyelles", bonbons:'Le Marché aux Syllabes',
 // CE1 — quartier de la Lecture
 foret:'La Rue des Libraires', champignons:'Le Passage des Conteurs', trolls:"L'Impasse des Syllabes", plage:'Les Quais de la Lecture',
 // CE2 — halles du Vocabulaire
 desert:'Les Halles aux Mots', plaines_venteuses:'Le Jardin des Synonymes', temple:'La Grande Bibliothèque', profondeurs:'Les Souterrains du Sens',
 // CM1 — tour du Temps
 glace:'Le Quartier des Horloges', marais:'La Gare des Temps', forteresse:'La Tour des Verbes', sakura:'Le Beffroi des Conjugaisons', nocturne:"L'Observatoire du Temps",
 // CM2 — citadelle de la Phrase
 volcan:"L'Imprimerie du Scribe Noir", espace:'Les Toits de la Syntaxe', cimes:'Le Grand Pont des Mots', mecanique:"L'Atelier des Phrases", ile:'La Citadelle de la Phrase',
 // Final — île de la Rature
 sanctuaire:"L'Antre du Docteur Babel",
};
const PRIM_ZONES_FR = (typeof PRIM_ZONES!=='undefined' ? PRIM_ZONES : []).map(z => Object.assign({}, z, { id:'primfr_'+z.id, label: _PRIMFR_ZONE_LABELS[z.id] || z.label }));
const _PRIM_REGIONS_FR = [
 { id:'cp',    label:'Le district des Sons',       levels:['CP'],    shape:'colline' },
 { id:'ce1',   label:'Le quartier de la Lecture',  levels:['CE1'],   shape:'feuille' },
 { id:'ce2',   label:'Les halles du Vocabulaire',  levels:['CE2'],   shape:'dune' },
 { id:'cm1',   label:'La tour du Temps',           levels:['CM1'],   shape:'citadelle' },
 { id:'cm2',   label:'La citadelle de la Phrase',  levels:['CM2'],   shape:'nebuleuse' },
 { id:'final', label:"L'île de la Rature",         levels:['FINAL'], shape:'mandala' },
];
const _PRIM_STORY_FR = {
 intro: { id:'primfr_intro', title:'Le journal intime', pages:[
  { emoji:'🦸', text:"Cher carnet. Avant aujourd'hui, j'étais l'écolier le plus ordinaire de <b>Verbopolis</b> — la dernière ville où les gens se comprennent encore. Dehors, la <b>Guilde de la Rature</b> a brisé la langue commune des hommes, et plus personne ne se comprend." },
  { emoji:'🛡️', text:"Notre ville tient debout : elle est gardée par les <b>Gardiens de l'Alphabet</b>, qui repoussent chaque attaque de la Guilde et de son chef, {villain}. Moi, {hero}, je n'avais jamais eu peur… jusqu'à ce soir." },
  { emoji:'🌑', text:"Une ombre grise m'a barré la route : <b>Mutisme</b>. Tous les sons se sont éteints. Sans réfléchir, j'ai voulu hurler « STOP » — et le mot est devenu un vrai <b>mur de pierre</b> ! Mes mots prennent vie ?!" },
  { emoji:'⚡', text:"Mutisme allait bondir quand une cape rouge a fendu la nuit : <b>L'Orateur</b>, le héros le plus célèbre de la ville ! Il a chassé le monstre : « Beau réflexe, gamin. Tes mots prennent vie. Viens — et ça commence par l'orthographe ! »" },
  { emoji:'🏛️', text:"C'est ainsi que je suis entré à l'<b>Académie des super-héros</b>. Sur le perron, <b>Dame Calligraphe</b>, la directrice, m'a dit : « Ici, un mot mal dit est un mot perdu. » Demain commence ma formation de héros — et puisque mes mots prennent vie, on m'a déjà trouvé un nom de code : désormais, je serai <b>Verbe</b>." },
 ]},
 chapters: {
  cp:    { id:'primfr_c_cp',  title:'Le district des Sons', crystal:'le pouvoir de la Voix', pages:[
   { emoji:'🔤', text:"Cher carnet. Pour impressionner les recrues, j'ai voulu un <b>bouclier</b> — j'ai dit « bouclié », et un truc tout mou m'est tombé sur le pied ! « Ton pouvoir n'accepte pas les fautes », a ri L'Orateur." },
   { emoji:'🗣️', text:"Le district est tombé sous la coupe de <b>Mutisme</b>, un sbire de la <b>Guilde de la Rature</b> qui a volé les voix. Pour le vaincre, je dois rendre à chaque lettre son chant : le <i>sss</i>, le <i>rrr</i>, le <i>ch</i>… Chaque <b>son</b> juste est une arme !" },
  ]},
  ce1:   { id:'primfr_c_ce1', title:'Le quartier de la Lecture', crystal:"le pouvoir d'enchaîner les mots", pages:[
   { emoji:'📖', text:"Nouveau vilain de la <b>Guilde de la Rature</b> : <b>Cacophon</b>, un tambour couvert de mille bouches qui brouille les syllabes. J'ai voulu une « échelle » ; j'ai bafouillé « léchelle » — et une langue géante a léché le mur !" },
   { emoji:'🎵', text:"« La lecture, c'est de la musique : chaque <b>syllabe</b> sur le bon temps ! » Alors j'apprends à enchaîner, calmement : <i>é–chel–le</i>. Plus je lis juste, plus mes mots sortent vite et nets." },
  ]},
  ce2:   { id:'primfr_c_ce2', title:'Les halles du Vocabulaire', crystal:'le pouvoir du mot juste', pages:[
   { emoji:'🧠', text:"Le pire ennemi de la Guilde, jusqu'ici : <b>Amnésios</b>, élégant et glacé, qui efface le <b>sens</b> des mots. Un boulanger m'a tendu un parapluie en croyant me donner du pain !" },
   { emoji:'🎯', text:"Mon pouvoir déraille : je dis « lampe » en pensant « lance ». « Connais le <b>sens</b> exact, ou ton pouvoir te trahira ! » Alors je réapprends les mots, leurs familles, leurs nuances." },
  ]},
  cm1:   { id:'primfr_c_cm1', title:'La tour du Temps', crystal:'le pouvoir sur le temps', pages:[
   { emoji:'⏳', text:"La Guilde envoie un nouveau monstre : <b>Le Conjurateur</b>, un sablier vivant dont le sable coule à l'envers. Il fige les verbes hors du temps : tout le quartier est coincé dans un présent sans fin." },
   { emoji:'🏃', text:"J'ai crié « je bondirai ! » pour sauter un gouffre — et mon saut est arrivé <b>trop tard</b> ! « Le bon pouvoir au bon <b>temps</b> : présent pour maintenant, futur pour après ! »" },
  ]},
  cm2:   { id:'primfr_c_cm2', title:'La citadelle de la Phrase', crystal:'le pouvoir des phrases', pages:[
   { emoji:'🧩', text:"Dernier district, et le boss le plus retors de la <b>Guilde de la Rature</b> : <b>Syntax</b>, un marionnettiste qui mêle l'ordre des mots, secondé du <b>Scribe Noir</b> qui réécrit les livres en cachette." },
   { emoji:'🥽', text:"Mes pièges, ce sont les <b>homophones</b> : j'ai voulu un « ver », j'ai fait apparaître un <b>verre</b>, puis un <b>vers</b>, puis un mur <b>vert</b> ! « Le son ne suffit plus : il faut le sens ET l'orthographe. »" },
  ]},
 },
 victories: {
  cp:  { id:'primfr_w_cp',  title:'Un pouvoir gagné !', crystal:'la Voix', pages:[
   { emoji:'🗯️', text:"Hourra ! J'ai prononcé, fort et clair, tous les sons volés — et <b>Mutisme</b> s'est dissous comme une fumée grise. Les voix sont revenues dans tout le quartier !" },
   { emoji:'🎖️', text:"Pouvoir gagné : <b>la Voix</b> — je fais surgir des mots simples, à condition de les dire parfaitement. Me voilà <b>Apprenti</b> ! (J'ai crié « victoir » : une banderole molle m'est retombée sur la tête.)" },
  ]},
  ce1: { id:'primfr_w_ce1', title:'Un pouvoir gagné !', crystal:'la Lecture', pages:[
   { emoji:'🔊', text:"À chaque mot remis dans le bon ordre, une bouche de <b>Cacophon</b> se taisait. À la fin, la dernière a chuchoté « bravo » avant de disparaître !" },
   { emoji:'🎖️', text:"Pouvoir gagné : je peux <b>enchaîner plusieurs mots</b> sans me tromper — des phrases courtes qui prennent vie d'un coup. Grade d'<b>Écuyer</b> !" },
  ]},
  ce2: { id:'primfr_w_ce2', title:'Un pouvoir gagné !', crystal:'le Vocabulaire', pages:[
   { emoji:'💡', text:"J'ai rendu aux gens le sens de leurs mots, jusqu'à ce qu'<b>Amnésios</b> n'ait plus rien à effacer. « Tu te souviens de trop de choses… », a-t-il murmuré en s'évanouissant." },
   { emoji:'🎖️', text:"Pouvoir gagné : <b>le mot juste</b> — je fais surgir l'objet précis dont j'ai besoin. Grade de <b>Cadet</b> !" },
  ]},
  cm1: { id:'primfr_w_cm1', title:'Un pouvoir gagné !', crystal:'le Temps', pages:[
   { emoji:'🕰️', text:"J'ai conjugué plus vite que lui : à chaque verbe juste, je remettais une horloge à l'heure. Quand la dernière a sonné, <b>Le Conjurateur</b> s'est éteint comme une bougie." },
   { emoji:'🎖️', text:"Pouvoir gagné : j'agis sur le <b>temps court</b> — figer une seconde, relancer un geste. Grade de <b>Lieutenant</b> ! Dame Calligraphe a écrit « Progrès remarquables ». Une médaille, venant d'elle." },
  ]},
  cm2: { id:'primfr_w_cm2', title:'Un pouvoir gagné !', crystal:'la Phrase', pages:[
   { emoji:'🏗️', text:"J'ai appris à bâtir des <b>phrases entières</b> — sujet, verbe, accords, le bon homophone — et mon pouvoir a changé d'échelle ! <b>Syntax</b> s'est emmêlé tout seul, et j'ai rattrapé le <b>Scribe Noir</b> d'une phrase bien tournée." },
   { emoji:'🎖️', text:"Grade de <b>Champion</b> ! Ce soir, L'Orateur est venu, sérieux : « Tu es prêt, {hero}. Les <b>Gardiens de l'Alphabet</b> t'attendent. Demain, on part pour l'île de la Rature. »" },
  ]},
 },
 epilogue: { id:'primfr_epilogue', title:"L'île de la Rature", pages:[
  { emoji:'⛵', text:"Cher carnet, je l'écris vite, on accoste. L'<b>île de la Rature</b> est noire, hérissée de tours. Autour de moi, les <b>Gardiens de l'Alphabet</b> au complet — et moi, {hero}, alias Verbe, debout parmi eux !" },
  { emoji:'⚔️', text:"Pour atteindre {villain}, on repousse un à un tous ses sbires : Mutisme, Cacophon, Amnésios, le Conjurateur, Syntax. Chaque mot juste est un coup porté à l'ombre." },
  { emoji:'🌑', text:"Tout en haut de la dernière tour, il y avait <b>lui</b>. Plus petit que je l'imaginais. Plus triste, aussi. Dans ses yeux, pas de haine : de la <b>solitude</b>." },
  { emoji:'💬', text:"Il a lancé son plus terrible sort : un grand charabia où plus personne ne se comprenait. Alors j'ai prononcé, justes et vrais, les mots les plus simples — <i>bonjour, merci, ami, ensemble</i> — et chacun déchirait son charabia." },
  { emoji:'🛡️', text:"La <b>Guilde de la Rature</b> est tombée. Partout, les peuples ont recommencé à se parler. Et moi… je suis devenu <b>Gardien de l'Alphabet</b>, le plus jeune de tous. Reste une question : pourquoi {villain} a-t-il voulu briser les mots ? À l'Académie, un vieux dossier raconte tout. J'ai le droit de l'ouvrir…" },
 ]},
 // Histoire B — débloquée à la fin : les origines du Docteur Babel.
 bookTale: { id:'primfr_booktale', title:'Les origines du Docteur Babel', pages:[
  { emoji:'👶', text:"Bien avant d'être le Docteur Babel, il fut un petit garçon. On l'appelait <b>Aldric</b>, l'enfant le plus intelligent que Verbopolis eût jamais porté. Trop, peut-être." },
  { emoji:'🧠', text:"À deux ans, il parlait comme un livre ; à cinq, il trouvait les mots des grands trop pauvres pour dire ce qu'il avait dans la tête. Il habitait un palais et devait le décrire avec trois cailloux." },
  { emoji:'✨', text:"Alors il inventa <b>sa propre langue</b> : <i>le Verbe pur</i>, d'une précision vertigineuse, où chaque chagrin, chaque lumière avait son mot. La plus belle langue du monde. Hélas, personne ne pouvait lui répondre." },
  { emoji:'🎂', text:"Le jour de ses sept ans, il récita pour ses camarades le plus beau poème du Verbe pur — sur l'amitié. Silence. Puis : « On n'a rien compris ! » Et tous éclatèrent de rire. « Parle normalement ! »" },
  { emoji:'💧', text:"Mais « normalement », pour lui, c'était parler petit. Il voulait être compris <b>entièrement</b> — et il ne le fut jamais. Pas même par sa mère, qui pleurait le soir en l'entendant murmurer des mots qu'elle ne reconnaissait pas." },
  { emoji:'🗼', text:"La solitude monta comme une eau froide. Il devint un savant immense et seul, enfermé dans une tour pleine de livres qu'il était le seul à lire. Son palais de mots était devenu sa prison." },
  { emoji:'⛈️', text:"Un soir d'orage, une pensée terrible lui vint : « Si personne ne veut me comprendre, alors plus personne ne comprendra personne. » Cette nuit-là, Aldric mourut, et le <b>Docteur Babel</b> naquit." },
  { emoji:'⚙️', text:"Il bâtit une machine capable de <b>briser la langue commune</b> des hommes. Pour l'aider, il alla chercher ceux que les mots avaient blessés." },
  { emoji:'🤍', text:"Un <b>muet</b> qu'on n'avait jamais écouté devint <b>Mutisme</b>. Un enfant <b>bègue</b> qu'on avait moqué devint <b>Cacophon</b>. Une savante qu'on n'avait jamais crue devint <b>Amnésios</b>." },
  { emoji:'🔮', text:"Un voyant qu'on prenait pour un fou devint le <b>Sous-Entendu</b>. À tous, Babel fit la même promesse douce et empoisonnée : « Plus jamais vous ne souffrirez de n'être pas compris. » Ainsi naquit la <b>Guilde de la Rature</b>." },
  { emoji:'🌍', text:"La machine s'éveilla. D'un bout à l'autre de la Terre, les mots se vidèrent. Les peuples se turent, se déchirèrent, se murèrent dans leur charabia. Le monde devint cette mosaïque d'îles solitaires." },
  { emoji:'🕯️', text:"Mais Babel avait commis la plus belle des erreurs : il restait une ville qui croyait que comprendre l'autre est ce qu'il y a de plus précieux — <b>Verbopolis</b>. Là naquit un garçon qui ferait jaillir des mots : <b>toi</b>." },
  { emoji:'🤝', text:"Car voici son secret jamais compris : un mot juste n'est pas un mot <b>parfait</b>, c'est un mot <b>partagé</b>. La langue commune n'était pas une prison : c'était un <b>pont</b>. Et Babel avait passé sa vie à brûler les ponts." },
  { emoji:'🙏', text:"Le jour où tu l'as vaincu, ce n'est pas ta force qui l'a désarmé : c'est qu'un enfant avait pris la peine de le comprendre. Avant de disparaître, il prononça le mot qu'il refusait de dire depuis l'enfance : « <b>Pardon.</b> »" },
  { emoji:'💛', text:"Au même instant, très loin, un enfant que personne n'avait su comprendre leva la tête : on venait de dire son prénom. — {hero} referma le dossier et écrivit : « Demain, j'irai m'asseoir près de celui qui reste seul dans la cour. Les mots, ça ne sert à rien si on les garde pour soi. »" },
 ]},
};


// ═══════════════════════════════════════════════════════════════════════
// L'ODYSSÉE DU TEMPS — Primaire (histoire) : « Les Trois Héritages »
// Aventure histoire pour GM.subject==='hist' en primaire. Zones isolées
// (ids 'primhist_…') → progression séparée des maths/français. Récompense
// par région : un Rouage (au lieu d'un Cristal), + un Livre d'époque lisible
// (cf. section « Livres lisibles — Chroniques du Temps » plus bas).
// Antagoniste : L'Horloger, ancien rival inventeur du grand-père Isidore,
// en quête de sa fiancée Aline, restée piégée par une expérience ratée.
// ═══════════════════════════════════════════════════════════════════════
const _PRIM_VILLAIN_HIST = 'L\u2019Horloger';
const _PRIM_KINGDOM_HIST = 'l\u2019atelier d\u2019Isidore';
const _PRIMHIST_ZONE_LABELS = {
 // CP — La Préhistoire
 plaine:'La Clairière du Foyer', village:'Le Campement des Chasseurs', prairie:'La Plaine aux Mammouths', bonbons:'La Grotte aux Peintures',
 // CE1 — L'Égypte antique
 foret:'Les Rives du Nil', champignons:'Le Chantier de Gizeh', trolls:'La Vallée des Tombeaux', plage:'Le Port de Thèbes',
 // CE2 — Rome antique
 desert:'La Voie Appienne', plaines_venteuses:'Le Forum Romain', temple:'Le Circus Maximus', profondeurs:'Les Thermes de Caracalla',
 // CM1 — Le Moyen Âge
 glace:'Les Remparts d\u2019Hiver', marais:'Le Marécage du Fief', forteresse:'Le Château Assiégé', sakura:'La Foire Médiévale', nocturne:'La Veillée des Gardes',
 // CM2 — Les Temps modernes
 volcan:'Les Forges de la Révolution', espace:'Le Ciel de 1889', cimes:'Les Ateliers du Progrès', mecanique:'La Gare à Vapeur', ile:'Le Salon des Inventeurs',
 // Final — L'Atelier d'Autrefois
 sanctuaire:'L\u2019Atelier d\u2019Autrefois',
};
// Résolution explicite de la région par zone (évite tout repli ambigu sur `level`
// pour la zone finale — cf. ADR de prudence : chaque zone porte son `region`).
const _PRIMHIST_LEVEL_TO_REGION = {CP:'cp',CE1:'ce1',CE2:'ce2',CM1:'cm1',CM2:'cm2'};
const PRIM_ZONES_HIST = (typeof PRIM_ZONES!=='undefined' ? PRIM_ZONES : []).map(z => Object.assign({}, z, {
 id:'primhist_'+z.id,
 label: _PRIMHIST_ZONE_LABELS[z.id] || z.label,
 region: z.id==='sanctuaire' ? 'final' : (_PRIMHIST_LEVEL_TO_REGION[z.level] || null),
 bossName: z.id==='sanctuaire' ? 'L\u2019Écho de l\u2019Instant' : z.bossName,
 boss: z.id==='sanctuaire' ? '⏳' : z.boss,
}));
const _PRIM_REGIONS_HIST = [
 { id:'cp',    label:'La Préhistoire',         levels:['CP'],    shape:'colline' },
 { id:'ce1',   label:'L\u2019Égypte antique',   levels:['CE1'],   shape:'feuille' },
 { id:'ce2',   label:'Rome antique',           levels:['CE2'],   shape:'dune' },
 { id:'cm1',   label:'Le Moyen Âge',           levels:['CM1'],   shape:'citadelle' },
 { id:'cm2',   label:'Les Temps modernes',     levels:['CM2'],   shape:'nebuleuse' },
 { id:'final', label:'L\u2019Atelier d\u2019Autrefois', levels:['FINAL'], shape:'mandala' },
];
const _PRIM_STORY_HIST = {
 intro: { id:'primhist_intro', title:'Prologue — L\u2019héritage', pages:[
  { emoji:'📜', text:"Grand-père Isidore s\u2019en est allé un soir d\u2019automne, dans le silence de son vieil atelier encombré d\u2019engrenages, de plans jaunis et d\u2019inventions inachevées. Le notaire, un homme sec à lunettes rondes, avait convoqué les trois frères pour la lecture de son testament." },
  { emoji:'🕰️', text:"« À Noé, l\u2019aîné, je lègue ma montre à gousset », lut le notaire, en tendant un boîtier d\u2019argent terni. « À Gaspard, mon cadet d\u2019esprit vif, je lègue ma boussole. » Gaspard reçut l\u2019objet, perplexe : son aiguille ne pointait vers aucun nord connu." },
  { emoji:'🪡', text:"« Et à {hero}, le benjamin... » Le notaire hésita, fouilla dans une petite boîte, et en sortit une simple aiguille de métal noirci, sans manche ni écrin. « ... une aiguille. C\u2019est tout ce qui est inscrit. » Les deux aînés échangèrent un regard amusé. {hero} serra les dents." },
  { emoji:'🌙', text:"Ce soir-là, chacun dans sa chambre inspecta son présent. Noé remonta sa montre, qui égrena une heure parfaitement juste. Gaspard fit tourner sa boussole dans tous les sens, sans succès. {hero}, désabusé, posa la petite aiguille sur la table de nuit, éteignit la lumière, et s\u2019endormit en pensant que grand-père, pour une fois, s\u2019était trompé de cadeau." },
  { emoji:'🌘', text:"Au cœur de la nuit, un bruit sourd tira {hero} du sommeil. Une ombre, penchée sur la table de nuit, se redressa d\u2019un coup et bondit par la fenêtre entrouverte, aussi silencieuse qu\u2019un chat. En allumant la lampe, {hero} découvrit la vérité : l\u2019aiguille avait disparu." },
  { emoji:'🏃', text:"{hero} réveilla Noé et Gaspard en pleine nuit. D\u2019abord sceptiques, les deux frères durent se rendre à l\u2019évidence : la petite aiguille de rien du tout venait bel et bien d\u2019être volée. Pourquoi s\u2019en prendre à l\u2019objet le moins précieux des trois ?" },
  { emoji:'📖', text:"Les jours suivants furent ceux d\u2019une enquête acharnée dans l\u2019atelier poussiéreux. Sous une latte de plancher descellée, les frères trouvèrent un carnet à la reliure craquelée, couvert de l\u2019écriture serrée de leur grand-père : des plans de mécanisme, des calculs d\u2019angles, et un mot revenant sans cesse — « voyage ». Un nom, aussi, biffé avec rage sur presque chaque page : {villain}." },
  { emoji:'🔧', text:"En creusant plus loin dans les tiroirs secrets de l\u2019établi, Noé et Gaspard comprirent : la montre et la boussole s\u2019emboîtaient l\u2019une dans l\u2019autre comme les pièces d\u2019un puzzle, formant un mécanisme complet — auquel il ne manquait plus qu\u2019une aiguille centrale pour fonctionner. La leur, précisément, venait d\u2019être volée." },
  { emoji:'⚙️', text:"Faute de mieux, les trois frères façonnèrent une aiguille de fortune dans un vieux clou d\u2019horlogerie trouvé au fond d\u2019un pot. Ils l\u2019insérèrent au cœur du mécanisme assemblé, remontèrent la clé... et le boîtier se mit à vibrer, à chauffer, à luire d\u2019une lumière dorée." },
  { emoji:'✨', text:"« Attendez, on devrait peut-être réflé... » commença Noé. Trop tard. Dans un éclair silencieux, l\u2019atelier se déroba sous leurs pieds, et les trois frères furent aspirés vers une époque que nul calendrier ne pouvait nommer." },
 ]},
 chapters: {
  cp: { id:'primhist_c_cp', title:'Chapitre I — La Préhistoire', crystal:'Rouage du Feu Sacré', pages:[
   { emoji:'🔥', text:"Les trois frères atterrirent dans une clairière balayée par le vent, entourée de collines rocheuses. L\u2019air sentait la fumée et l\u2019herbe sauvage. Non loin, un groupe de silhouettes vêtues de peaux se figea de stupeur en les voyant apparaître dans un souffle de lumière." },
   { emoji:'🪨', text:"« L\u2019aiguille de fortune est instable », souffla Gaspard en examinant le mécanisme fumant. « On ne choisit pas où elle nous envoie — seulement quand elle nous y envoie. » Noé referma sa montre d\u2019un geste sec : le cadran indiquait une date impossible, bien antérieure à toute écriture connue." },
   { emoji:'💨', text:"Un vieil homme du clan, le visage buriné, s\u2019avança sans crainte apparente et désigna le foyer central du campement : le souffle de leur arrivée venait de disperser les braises, et le feu — précieusement entretenu depuis des lunes — menaçait de s\u2019éteindre pour de bon." },
   { emoji:'🦣', text:"{hero} comprit d\u2019instinct la gravité de la situation : sans feu, plus de chaleur, plus de lumière pour repousser les bêtes, plus de viande cuite pour l\u2019hiver qui approchait. Toute une histoire, peut-être, tenait à ce tas de braises fragiles." },
   { emoji:'👣', text:"En observant les empreintes autour du campement, Noé remarqua une trace de pas inhabituelle, bien plus nette que les autres — une empreinte de botte, pas de peau nouée. « Quelqu\u2019un d\u2019autre est déjà passé par ici », murmura-t-il. « Récemment. »" },
  ]},
  ce1: { id:'primhist_c_ce1', title:'Chapitre II — L\u2019Égypte antique', crystal:'Rouage des Bâtisseurs', pages:[
   { emoji:'🏜️', text:"Le mécanisme cracha les trois frères sur un sol de sable brûlant, au pied d\u2019un chantier titanesque : des milliers d\u2019ouvriers hâlaient d\u2019immenses blocs de pierre le long de rampes de terre battue, sous un soleil de plomb. La grande pyramide de Gizeh s\u2019élevait, encore inachevée, vers le ciel." },
   { emoji:'🪨', text:"Un bloc de calcaire massif, mal arrimé à ses cordages, s\u2019était renversé en travers de la rampe principale au moment même de leur arrivée, bloquant tout le convoi et provoquant une clameur d\u2019inquiétude parmi les ouvriers et les contremaîtres." },
   { emoji:'📜', text:"Un jeune scribe, tablette de cire à la main, s\u2019approcha des frères avec curiosité — leurs vêtements, si étranges, ne ressemblaient à rien de ce qu\u2019il connaissait. Il leur expliqua, dans un mélange de gestes et de mots, que ce bloc devait impérativement être posé avant le coucher du soleil, sous peine de retarder tout le chantier de plusieurs jours." },
   { emoji:'⏳', text:"Noé consulta sa montre : l\u2019aiguille de fortune, à peine stabilisée par le premier rouage, vibrait légèrement — un signe, pensa-t-il, qu\u2019ils approchaient d\u2019un moment où l\u2019Histoire pouvait basculer d\u2019un côté comme de l\u2019autre selon leurs actes." },
   { emoji:'👞', text:"Près d\u2019un entrepôt de cordages, Gaspard repéra une empreinte de semelle identique à celle de la Préhistoire, à demi effacée dans le sable. « Il est passé ici aussi », dit-il. « Et récemment, en plus. »" },
  ]},
  ce2: { id:'primhist_c_ce2', title:'Chapitre III — Rome antique', crystal:'Rouage du Cirque', pages:[
   { emoji:'🏛️', text:"Un vacarme assourdissant accueillit les trois frères : ils venaient d\u2019atterrir dans les gradins du Circus Maximus, en pleine course de chars, sous les acclamations d\u2019une foule immense agitant des étoffes colorées." },
   { emoji:'🐎', text:"En contrebas, sur la piste, un char venait de perdre une roue dans un virage serré, projetant son cocher au sol sous les cris horrifiés du public. L\u2019attelage, paniqué, menaçait de s\u2019emballer et de blesser les autres concurrents lancés à pleine vitesse." },
   { emoji:'⚔️', text:"Un vétéran des courses, assis non loin des frères dans les gradins, leur expliqua que ce cocher, jeune et prometteur, jouait ce jour-là sa toute dernière chance de gagner sa liberté d\u2019esclave — une victoire suffirait à convaincre son maître de l\u2019affranchir." },
   { emoji:'🛠️', text:"Gaspard, en observant l\u2019attelage endommagé, comprit qu\u2019il fallait faire vite : la course reprendrait dès que la piste serait dégagée, avec ou sans char réparé. {hero} sentit peser sur ses épaules le poids d\u2019une destinée qui n\u2019était pas la sienne, mais qu\u2019il ne pouvait ignorer." },
   { emoji:'👣', text:"Sous les gradins, près des écuries, Noé repéra une trace de semelle fraîche menant droit vers les coulisses du Circus — la même empreinte, encore et toujours, comme un fil rouge tissé à travers les siècles." },
  ]},
  cm1: { id:'primhist_c_cm1', title:'Chapitre IV — Le Moyen Âge', crystal:'Rouage du Siège', pages:[
   { emoji:'🏰', text:"Le mécanisme projeta les trois frères en pleine nuit, contre les remparts d\u2019une ville assiégée, dans le fracas lointain des bombardes et les cris des sentinelles. Des feux de camp anglais scintillaient tout autour des murailles d\u2019Orléans." },
   { emoji:'🌾', text:"Ils se glissèrent à l\u2019intérieur des fortifications à la faveur de l\u2019obscurité, et découvrirent une ville à bout de forces : les réserves de vivres s\u2019amenuisaient dangereusement, et le moral des défenseurs vacillait après des semaines de siège." },
   { emoji:'⚜️', text:"Une jeune femme en armure légère, entourée de soldats qui la regardaient avec un mélange de ferveur et d\u2019espoir, traversa la place en direction des remparts. « Jeanne », murmura un garde à proximité, presque en prière. Les frères comprirent qu\u2019ils venaient de croiser Jeanne d\u2019Arc elle-même." },
   { emoji:'🌾', text:"Un capitaine épuisé expliqua aux frères qu\u2019un convoi de vivres, caché dans un chemin détourné à l\u2019extérieur des murs, n\u2019était encore jamais parvenu à franchir les lignes ennemies — et sans lui, la ville ne tiendrait plus très longtemps." },
   { emoji:'👞', text:"Sur le chemin de ronde, Noé remarqua une empreinte de botte identique aux précédentes, imprimée dans la boue fraîche près d\u2019une poterne dérobée. « Toujours la même trace », dit-il. « Il ne cherche pas à se cacher de nous. Il cherche autre chose. »" },
  ]},
  cm2: { id:'primhist_c_cm2', title:'Chapitre V — Les Temps modernes', crystal:'Rouage du Progrès', pages:[
   { emoji:'🗼', text:"Les trois frères atterrirent au beau milieu d\u2019une foule en habits du dimanche, sous une tour de fer immense qui s\u2019élançait vers le ciel parisien. Des banderoles annonçaient la grande inauguration officielle de la tour Eiffel, ce jour même." },
   { emoji:'⚙️', text:"Un incident venait de survenir dans les entrailles du monument : l\u2019un des ascenseurs hydrauliques, tout juste installé, refusait obstinément de fonctionner, menaçant de gâcher la cérémonie prévue devant les officiels et les journalistes du monde entier." },
   { emoji:'🎩', text:"Un ingénieur en redingote, dépassé par les événements et cerné de curieux, expliqua aux frères — qu\u2019il prit d\u2019abord pour de jeunes apprentis mécaniciens égarés — que sans cet ascenseur, l\u2019inauguration se déroulerait dans la confusion la plus totale devant la presse internationale." },
   { emoji:'🔩', text:"Gaspard, en observant le mécanisme hydraulique, sentit son cœur s\u2019accélérer : les pièces, les tuyaux, les soupapes — tout cela ressemblait, en plus grand, au mécanisme de leur propre montre-boussole. Comme si l\u2019esprit de leur grand-père avait, d\u2019une certaine façon, traversé les siècles jusqu\u2019ici." },
   { emoji:'👞', text:"Dans l\u2019agitation de la foule, {hero} aperçut, l\u2019espace d\u2019un instant, une silhouette au manteau sombre s\u2019éclipser derrière un pilier de fer — la même démarche pressée, la même trace de botte qu\u2019ils suivaient depuis la Préhistoire. Cette fois, ils étaient tout près." },
  ]},
  final: { id:'primhist_c_final', title:'Chapitre VI — L\u2019Atelier d\u2019Autrefois', crystal:'', pages:[
   { emoji:'🌫️', text:"Cinq Rouages en poche, les trois frères remontent une dernière fois le mécanisme de fortune. Mais cette fois, l\u2019aiguille ne vibre pas comme les autres fois : elle vise un point précis, presque paisible, comme si elle savait exactement où elle devait les mener." },
   { emoji:'🔧', text:"« Elle n\u2019a jamais été aussi stable », murmure Gaspard en observant le mécanisme luire d\u2019une lumière régulière. « On dirait qu\u2019elle... nous ramène quelque part de précis, pas juste n\u2019importe quand. »" },
   { emoji:'🚪', text:"Dans un dernier éclair, plus doux que les précédents, les trois frères se retrouvent devant la porte close d\u2019un atelier qu\u2019ils ne connaissent que trop bien — en plus jeune, en plus poussiéreux encore. Quelque chose, ici, attend d\u2019être résolu depuis bien longtemps." },
  ]},
 },
 victories: {
  cp: { id:'primhist_w_cp', title:'Le Feu Sacré', crystal:'Rouage du Feu Sacré', pages:[
   { emoji:'🔥', text:"Avec l\u2019aide du clan, les trois frères rassemblèrent bois sec, écorce et silex, et parvinrent à raviver la flamme juste avant qu\u2019elle ne s\u2019éteigne. Le vieil homme leva les bras au ciel en un cri de joie que tout le campement reprit en chœur." },
   { emoji:'🐾', text:"En signe de gratitude, le vieil homme tendit à {hero} un petit rouage d\u2019ivoire sculpté à même une défense de mammouth, encore chaud d\u2019avoir été façonné à la lueur du feu sauvé. « Le Rouage du Feu Sacré », murmura Gaspard en l\u2019examinant, émerveillé. « Le premier. »" },
   { emoji:'🗿', text:"Avant qu\u2019ils ne reprennent leur route à travers le temps, le vieil homme désigna, du doigt, la direction d\u2019où venait le vent ce matin-là — et mima, avec de grands gestes, une silhouette pressée, un bâton à la main, disparue depuis peu vers l\u2019horizon. {villain} était bel et bien passé par là." },
  ]},
  ce1: { id:'primhist_w_ce1', title:'Les Bâtisseurs', crystal:'Rouage des Bâtisseurs', pages:[
   { emoji:'🧵', text:"En coordonnant les efforts des ouvriers, en calant de nouveaux rondins sous le bloc et en réorganisant les équipes de tir sur les cordes, les trois frères parvinrent à redresser puis à hisser la pierre jusqu\u2019à sa place, juste avant que le soleil ne touche l\u2019horizon." },
   { emoji:'🏺', text:"Le contremaître en chef, impressionné, offrit aux frères un petit rouage doré, gravé de hiéroglyphes représentant un soleil et une pierre. « Le Rouage des Bâtisseurs », lut Gaspard à voix haute, en tentant de déchiffrer les symboles avec l\u2019aide du jeune scribe." },
   { emoji:'🔍', text:"Le jeune scribe, en les raccompagnant vers l\u2019endroit isolé où ils avaient atterri, mentionna qu\u2019un étranger était passé le mois précédent, posant d\u2019étranges questions sur « une femme perdue entre deux mondes ». Les frères se regardèrent, sentant qu\u2019ils touchaient à quelque chose d\u2019important." },
  ]},
  ce2: { id:'primhist_w_ce2', title:'Le Cirque', crystal:'Rouage du Cirque', pages:[
   { emoji:'🔧', text:"À l\u2019aide d\u2019outils empruntés aux artisans des écuries, les trois frères parvinrent à réparer la roue et à calmer les chevaux à temps pour que le jeune cocher reprenne sa place sur la ligne de départ, sous un tonnerre d\u2019applaudissements." },
   { emoji:'🏆', text:"Le cocher, une fois la course achevée et sa liberté gagnée, vint remercier les frères en personne et leur offrit un petit rouage de bronze, frappé du symbole d\u2019un char ailé. « Le Rouage du Cirque », souffla {hero}, sentant l\u2019objet vibrer doucement entre ses doigts." },
   { emoji:'🕵️', text:"Le vétéran des courses, en guise d\u2019adieu, glissa aux frères qu\u2019un homme au manteau sombre avait, quelques semaines plus tôt, interrogé les prêtresses du temple voisin sur « le moyen de réparer une erreur du passé ». {villain}, décidément, les précédait toujours d\u2019un pas." },
  ]},
  cm1: { id:'primhist_w_cm1', title:'Le Siège', crystal:'Rouage du Siège', pages:[
   { emoji:'🌾', text:"En empruntant discrètement le chemin détourné à la nuit tombée, les trois frères guidèrent le convoi de vivres jusqu\u2019à une poterne dérobée, évitant de justesse les patrouilles ennemies, et permirent enfin à la ville d\u2019être ravitaillée." },
   { emoji:'🔔', text:"Au petit matin, les cloches d\u2019Orléans sonnèrent à toute volée pour saluer l\u2019arrivée des vivres. Un vieux chevalier, reconnaissant, remit aux frères un rouage d\u2019argent finement ouvragé. « Le Rouage du Siège », lut Gaspard, ému malgré lui par la ferveur de la ville libérée." },
   { emoji:'🕯️', text:"Avant de reprendre leur route à travers le temps, le vieux chevalier confia aux frères qu\u2019un étranger encapuchonné avait, quelques jours plus tôt, demandé audience à Jeanne elle-même pour l\u2019interroger sur « les miracles capables de ramener les disparus ». {villain} cherchait toujours la même chose, quelle que soit l\u2019époque." },
  ]},
  cm2: { id:'primhist_w_cm2', title:'Le Progrès', crystal:'Rouage du Progrès', pages:[
   { emoji:'🔧', text:"En s\u2019inspirant du mécanisme familier de leur propre héritage, les trois frères aidèrent l\u2019ingénieur à identifier la soupape défectueuse et à la remplacer juste à temps, permettant à l\u2019ascenseur de fonctionner parfaitement pour la cérémonie officielle." },
   { emoji:'🎉', text:"Sous les applaudissements de la foule et les flashs des tout premiers appareils photo, l\u2019ingénieur, reconnaissant, tendit aux frères un rouage de cuivre étincelant. « Le Rouage du Progrès », souffla Noé, en le voyant s\u2019assembler presque naturellement avec les quatre autres au creux de sa montre." },
   { emoji:'✨', text:"Le mécanisme tout entier se mit soudain à vibrer d\u2019une lumière stable, presque apaisée — les cinq rouages réunis semblaient enfin donner un sens à l\u2019aiguille de fortune. Et au loin, entre les pieds de la tour de fer, la silhouette de {villain} s\u2019immobilisa un instant, avant de disparaître dans un éclair familier." },
  ]},
 },
 epilogue: { id:'primhist_epilogue', title:'Épilogue — L\u2019Atelier d\u2019Autrefois', pages:[
  { emoji:'🔥', text:"Une explosion étouffée fit sursauter les trois frères : dans un coin de l\u2019atelier, un dispositif complexe crachait des étincelles bleutées autour d\u2019une jeune femme figée en plein mouvement, comme suspendue entre deux battements de cœur, un sourire inachevé sur les lèvres." },
  { emoji:'🕰️', text:"« Aline... », murmura une voix brisée derrière eux. {villain} se tenait là, bien plus jeune que le portrait que les frères s\u2019en étaient fait, le visage ravagé par des années de recherche acharnée. « Voilà des décennies que je cherche comment la libérer. »" },
  { emoji:'💔', text:"{villain} leur raconta tout : lui et le jeune Isidore avaient été les meilleurs amis, deux inventeurs rivaux et complices, travaillant ensemble sur une expérience de voyage dans le temps. Un mauvais réglage, une étincelle de trop, et Aline — venue leur porter le repas ce soir-là — s\u2019était retrouvée figée entre deux instants, ni tout à fait présente, ni tout à fait absente du monde." },
  { emoji:'😢', text:"« Isidore a eu peur », poursuivit {villain}, la voix tremblante. « Il a démonté la machine, dispersé les pièces à travers le temps par sécurité — la montre, la boussole, l\u2019aiguille — pour qu\u2019on ne puisse jamais recommencer une telle erreur. Moi, je n\u2019ai jamais cessé de la chercher, à travers chaque époque, avec les moyens du bord. »" },
  { emoji:'⚙️', text:"Les trois frères comprirent alors : ce n\u2019était pas la peur qui avait guidé {villain} tout au long de leur odyssée, mais un chagrin immense, tenace, jamais résigné. Ensemble, ils insérèrent les cinq rouages retrouvés dans le mécanisme complet, stabilisant enfin l\u2019aiguille de fortune pour la toute première fois." },
  { emoji:'✨', text:"Un rayon de lumière dorée enveloppa Aline. Son sourire inachevé se compléta enfin ; son regard s\u2019anima ; elle respira, comme si le temps reprenait son cours à l\u2019endroit exact où il s\u2019était arrêté. « J\u2019ai... j\u2019ai eu si froid », souffla-t-elle, avant de tomber dans les bras de {villain}, en larmes." },
  { emoji:'🤝', text:"Le jeune Isidore, alerté par le vacarme, apparut à son tour sur le seuil de l\u2019atelier — et resta interdit devant ces trois jeunes gens aux visages étrangement familiers. Un silence ému s\u2019installa, chargé de tout ce qui ne pouvait pas encore se dire." },
  { emoji:'🏡', text:"De retour dans leur propre époque, les trois frères posèrent la montre, la boussole et l\u2019aiguille — enfin réunies pour de bon — sur l\u2019établi de l\u2019atelier familial. « Un troisième héritage », dit Noé en souriant à {hero}. « Le plus précieux des trois, finalement. »" },
  { emoji:'📖', text:"Dans le tiroir secret de l\u2019établi, ils trouvèrent une dernière page du carnet de grand-père Isidore, écrite bien après les autres, d\u2019une main plus âgée et apaisée : « À qui trouvera ceci : le temps ne pardonne pas les erreurs, mais il permet parfois, à ceux qui ont le cœur assez grand, de les réparer. Merci d\u2019avoir fini ce que je n\u2019ai jamais osé terminer. »" },
 ]},
};
// ─── Histoire COLLÈGE : « Le Forgeron des Étoiles » (v10.2.0, mini-roman) ───
const _COL_VILLAIN = 'Léthéas, le Titan de l\'Oubli';
const _COL_KINGDOM = 'Sidéris';
const _COL_STORY = {
 intro: { id:'col_intro', title:'Le Forgeron des Étoiles', pages:[
  { emoji:'🌌', text:"Au commencement, il n'y avait que la nuit. Puis vinrent les forgerons d'étoiles, qui martelaient la lumière comme d'autres martèlent le fer. De leurs forges naquit <b>{kingdom}</b>, un royaume suspendu entre les constellations, où chaque vérité mathématique faisait briller une étoile." },
  { emoji:'⚒️', text:"Le plus grand d'entre eux s'appelle <b>Maître Alaric Forgétoile</b>. C'est lui qui forgea jadis l'<b>Armure Solaire</b> : six pièces d'or stellaire, trempées dans le cœur d'un soleil, capables de résister à l'oubli lui-même." },
  { emoji:'🌑', text:"Car l'oubli a un nom : <b>Léthéas</b>. Le Titan. Là où passe son ombre, les nombres se taisent, les théorèmes s'effacent, les étoiles s'éteignent une à une. Nul ne sait d'où il vient. Alaric, lui, détourne les yeux quand on pose la question." },
  { emoji:'💥', text:"Une nuit, Léthéas frappa la forge céleste. L'Armure Solaire vola en éclats, et ses six pièces tombèrent du ciel, dispersées sur les îles de {kingdom}. Depuis, l'ombre gagne. Île après île. Étoile après étoile." },
  { emoji:'🎓', text:"C'est alors qu'Alaric t'a trouvé, {hero}. « L'or stellaire ne répond ni à la force, ni à la magie », dit-il en posant son marteau. « Il répond à l'esprit. Résous, comprends, progresse — et chaque pièce reconnaîtra son porteur. » Ton odyssée commence." },
 ]},
 chapters: {
  cp:    { id:'col_c_cp',  title:'Le Port des Décimales', crystal:'la Jambière Gauche', pages:[
   { emoji:'⚓', text:"Le <b>Port des Décimales</b> fut le premier touché. Le brouillard de Léthéas y a tout déréglé : les virgules dérivent comme des bateaux sans amarres, les balances mentent, les marchands ne savent plus compter leur monnaie." },
   { emoji:'🗺️', text:"« La <b>Jambière Gauche</b> est tombée quelque part dans ces docks », t'écrit Alaric. « C'est la pièce de l'<b>Aplomb</b> : celui qui la porte ne vacille jamais. Commence par remettre de l'ordre dans les nombres — l'or t'observera. »" },
  ]},
  ce1:   { id:'col_c_ce1', title:'Les Cavernes Fractionnaires', crystal:'la Jambière Droite', pages:[
   { emoji:'🍰', text:"Sous la forêt, les <b>Cavernes Fractionnaires</b> résonnent d'un silence étrange. Ici, jadis, on apprenait l'art du partage : tout se divisait en parts justes. Léthéas a brisé cette harmonie — les parts ne s'assemblent plus." },
   { emoji:'⚒️', text:"« La <b>Jambière Droite</b> gît au plus profond des galeries », dit Alaric. « C'est la pièce de l'<b>Élan</b> : la vitesse de celui qui enchaîne sans trébucher. Méfie-toi des dénominateurs, petit forgeron. Ils ne pardonnent rien. »" },
  ]},
  ce2:   { id:'col_c_ce2', title:'Le Plateau des Relatifs', crystal:'le Brassard Gauche', pages:[
   { emoji:'🌡️', text:"Le froid mord, sur le <b>Plateau des Relatifs</b>. Au-dessus de zéro, en dessous de zéro… la frontière s'est effacée avec le reste. Les nombres positifs et négatifs errent, mélangés, sans plus savoir de quel côté de l'axe ils vivent." },
   { emoji:'🛡️', text:"« Le <b>Brassard Gauche</b> est pris dans les glaces », annonce Alaric. « C'est la pièce de l'<b>Égide</b>, le bouclier de l'esprit. Pour la libérer, redonne à chaque nombre sa place exacte. Le signe d'abord. Toujours le signe d'abord. »" },
  ]},
  cm1:   { id:'col_c_cm1', title:'La Citadelle Algébrique', crystal:'le Brassard Droit', pages:[
   { emoji:'🏰', text:"La <b>Citadelle Algébrique</b> se dresse, intacte en apparence. Mais à l'intérieur, ses gardiens de pierre sont devenus fous : ils ont oublié ce que valent leurs propres lettres. x, y… des inconnues, partout, qui hurlent qu'on les résolve." },
   { emoji:'✊', text:"« Le <b>Brassard Droit</b> est enfermé dans la salle du trésor », murmure Alaric. « C'est la pièce de la <b>Frappe</b> : la puissance pure du raisonnement. Les gardiens ne s'inclinent que devant celui qui réduit, développe et résout sans trembler. »" },
  ]},
  cm2:   { id:'col_c_cm2', title:'Les Gorges de Pythagore', crystal:'la Cuirasse', pages:[
   { emoji:'📐', text:"Dans les <b>Gorges de Pythagore</b>, la lave a tout déformé. Les distances mentent, les angles trichent, les ponts s'effondrent sous ceux qui les mesurent mal. Une seule loi tient encore debout : celle du triangle rectangle." },
   { emoji:'☀️', text:"« La <b>Cuirasse</b> est au cœur du volcan », dit Alaric, et sa voix tremble un peu. « C'est la pièce maîtresse : le <b>Cœur d'Or</b>, la vitalité même de l'Armure. Hypoténuse, carrés, racines… prouve chaque pas, ou les gorges te dévoreront. »" },
  ]},
  final: { id:'col_c_final', title:'L\'Observatoire des Fonctions', crystal:'le Heaume', pages:[
   { emoji:'🔭', text:"Au sommet du monde, l'<b>Observatoire des Fonctions</b> scrute un ciel presque éteint. Ici, chaque courbe racontait l'avenir d'une étoile. Léthéas a déchiré les graphiques — les images ont perdu leurs antécédents, les droites leur pente." },
   { emoji:'👁️', text:"« Le <b>Heaume</b> t'attend là-haut », dit Alaric. « C'est la pièce de la <b>Clairvoyance</b> : porter ce casque, c'est lire les attaques avant qu'elles ne frappent. Lis les courbes, {hero}. Elles disent toujours la vérité à qui sait les interroger. »" },
   { emoji:'🌑', text:"Au loin, par-delà l'Observatoire, une île noire fume à l'horizon. L'<b>Antre du Titan</b>. Alaric la fixe longuement, sans un mot. Tu comprends que la fin approche." },
  ]},
  titan: { id:'col_c_titan', title:'L\'Antre du Titan', crystal:'', pages:[
   { emoji:'⚒️', text:"L'Armure Solaire est complète. Alors, dans la forge d'Alaric, un phénomène que nul n'avait revu depuis cent ans : les six pièces se mettent à chanter. Et de leur lumière unie naît une lame. La <b>Lame d'Aurore</b>." },
   { emoji:'⚔️', text:"« Elle ne coupe pas la chair », dit Alaric en te la tendant. « Elle tranche l'oubli. » Puis il pose la main sur ton épaule, et pour la première fois, son regard fuit : « {hero}… quand tu verras le Titan, regarde son visage. Promets-le-moi. »" },
   { emoji:'🌋', text:"L'<b>Antre du Titan</b> t'attend : un seuil de cendres, une galerie d'étoiles mortes, et tout au fond, un trône. Ta puissance est à son paroxysme. La dernière marche commence." },
  ]},
 },
 victories: {
  cp:  { id:'col_w_cp',  title:'La Jambière Gauche reforgée', crystal:'la Jambière Gauche', pages:[
   { emoji:'🦵', text:"Au dernier calcul juste, l'or s'embrase. La <b>Jambière Gauche</b> s'élève des docks, se reforge sous tes yeux et vient s'ajuster à ta jambe comme si elle t'avait toujours attendu. Le pouvoir d'<b>Aplomb</b> coule en toi : tes pas ne vacilleront plus." },
   { emoji:'⚓', text:"Au port, les virgules regagnent leur place et les balances disent à nouveau la vérité. « Une », compte Alaric dans la forge lointaine, et son marteau frappe l'enclume comme une cloche de fête." },
  ]},
  ce1: { id:'col_w_ce1', title:'La Jambière Droite reforgée', crystal:'la Jambière Droite', pages:[
   { emoji:'🦿', text:"La <b>Jambière Droite</b> jaillit des profondeurs dans une pluie d'étincelles. À l'instant où elle se verrouille, l'<b>Élan</b> t'envahit : tu sens que tu pourrais enchaîner mille calculs sans reprendre ton souffle." },
   { emoji:'🍰', text:"Dans les cavernes, les parts se rassemblent enfin : les fractions s'additionnent, se simplifient, s'accordent. L'art du partage est sauvé. « Deux », sourit Alaric. « Tu marches déjà comme un forgeron d'étoiles. »" },
  ]},
  ce2: { id:'col_w_ce2', title:'Le Brassard Gauche reforgé', crystal:'le Brassard Gauche', pages:[
   { emoji:'🛡️', text:"La glace cède. Le <b>Brassard Gauche</b> se libère et s'enroule autour de ton avant-bras, encore tiède de forge. L'<b>Égide</b> t'enveloppe : une assurance tranquille, le bouclier de ceux qui connaissent la règle des signes." },
   { emoji:'🌡️', text:"Sur le plateau, l'axe des nombres se redresse : les positifs à droite, les négatifs à gauche, le zéro en sentinelle. « Trois », dit Alaric. « La moitié du chemin. L'ombre de Léthéas recule — il l'a senti, crois-moi. »" },
  ]},
  cm1: { id:'col_w_cm1', title:'Le Brassard Droit reforgé', crystal:'le Brassard Droit', pages:[
   { emoji:'✊', text:"Les gardiens de pierre s'inclinent. Le <b>Brassard Droit</b> est à toi, et avec lui la <b>Frappe</b> : la puissance de celui qui résout. Tu serres le poing — l'or répond par un éclat bref, comme un salut." },
   { emoji:'🏰', text:"Dans la Citadelle, les inconnues retrouvent leurs valeurs et les équations s'équilibrent dans un grand soupir de soulagement. « Quatre », compte Alaric. « Les bras et les jambes. Reste le cœur… et la tête. »" },
  ]},
  cm2: { id:'col_w_cm2', title:'La Cuirasse reforgée', crystal:'la Cuirasse', pages:[
   { emoji:'☀️', text:"Le volcan rugit une dernière fois, puis s'apaise. La <b>Cuirasse</b> émerge de la lave, intacte, son soleil d'or rayonnant sur le plastron. Quand elle épouse ta poitrine, le <b>Cœur d'Or</b> bat avec le tien : une vitalité immense, ancienne, chaude." },
   { emoji:'📐', text:"Les gorges retrouvent leurs justes mesures : les distances disent vrai, les angles aussi. « Cinq », souffle Alaric — puis, plus bas, comme pour lui-même : « Il portait la même, autrefois… » Tu n'oses pas demander qui." },
  ]},
  final: { id:'col_w_final', title:'Le Heaume reforgé', crystal:'le Heaume', pages:[
   { emoji:'👁️', text:"Sous la coupole de l'Observatoire, le <b>Heaume</b> descend sur ta tête comme une couronne. La <b>Clairvoyance</b> s'ouvre en toi : les courbes te parlent, les attaques se lisent, l'avenir des étoiles redevient déchiffrable." },
   { emoji:'⚔️', text:"Six pièces. L'<b>Armure Solaire</b> est complète — et au loin, dans la forge, quelque chose s'éveille. Alaric lève son marteau : « Viens, {hero}. Il est temps de forger la <b>Lame d'Aurore</b>. Et il est temps… que je te dise la vérité. »" },
  ]},
 },
 epilogue: { id:'col_epilogue', title:'Le Frère de Forge', pages:[
  { emoji:'🌑', text:"La Lame d'Aurore traverse l'ombre — et le Titan tombe à genoux. Tu t'avances pour le coup final… puis tu te souviens de la promesse. Tu regardes son visage. Et sous la cendre, tu vois : des yeux d'or. Les mêmes que ceux d'Alaric." },
  { emoji:'⚒️', text:"« Son nom était <b>Théos</b> », dit une voix derrière toi. Alaric est là, son marteau à la main, les larmes aux yeux. « Mon frère de forge. Le plus doué de nous deux. Il a voulu forger une étoile à lui seul… et l'étoile l'a dévoré. L'oubli a pris le reste. »" },
  { emoji:'💛', text:"Alors tu comprends pourquoi la Lame ne coupe pas la chair. Tu la poses sur l'épaule du Titan — et elle tranche l'oubli. La cendre s'effrite. Les souvenirs reviennent un à un : la forge, les rires, les théorèmes appris ensemble. « Alaric… ? » murmure Théos." },
  { emoji:'🌟', text:"Cette nuit-là, au-dessus de {kingdom}, les étoiles se rallument toutes en même temps — on dit que deux forgerons réconciliés frappaient l'enclume ensemble. Quant à toi, {hero}, ton nom est gravé dans l'or stellaire, sur la garde de la Lame d'Aurore : <b>premier Chevalier de l'Armure Solaire</b>. Félicitations." },
 ]},
};

// ═══════════════════════════════════════════════════════════════════════
// ─── Odyssée des MOTS — COLLÈGE : « La Bibliothèque infinie » (v10.13.0) ──
// Dystopie : le Chancelier Suprême Ulrich Morne a réduit la langue de
// Monotonia à quelques mots dociles. {hero}, alias « le Porteur de Mots »,
// découvre une bibliothèque infinie ; chaque îlot est un livre-monde dont la
// conquête rend un pouvoir — puis un livre lisible rejoint sa bibliothèque.
// Voix : épopée lyrique (général) · sobriété glaçante (Monotonia) · romanesque
// (plongées) · ironie légère (Morne). Routage 'colfr' (cf. startAdventure).
// ═══════════════════════════════════════════════════════════════════════
const _COL_VILLAIN_FR = 'le Chancelier Suprême Ulrich Morne';
const _COL_KINGDOM_FR = 'Monotonia';
const _COLFR_ZONE_LABELS = {
 // 6e — Livre I : Le Français des Origines
 col_cp_1:'Le Fleuve des Langues', col_cp_2:'Les Ruines Latines', col_cp_3:'Le Bois Gaulois', col_cp_4:'Le Cloître des Moines', col_cp_5:'La Source du Verbe',
 // 5e — Livre II : Le Trésor des Mots
 col_ce1_1:'La Caverne aux Mille Reflets', col_ce1_2:'Le Verger des Familles', col_ce1_3:'Le Marché des Synonymes', col_ce1_4:'La Galerie des Registres', col_ce1_5:'Le Prisme du Sens',
 // 4e — Livre III : L'Art de Convaincre
 col_ce2_1:"L'Agora", col_ce2_2:'La Tribune des Orateurs', col_ce2_3:"L'Amphithéâtre", col_ce2_4:'Le Forum du Débat', col_ce2_5:'La Flamme de Cicéron',
 // 4e/3e — Livre IV : Les Mécaniques du Verbe
 col_cm1_1:"La Cité-Horlogerie", col_cm1_2:'Les Grands Engrenages', col_cm1_3:'La Salle des Temps', col_cm1_4:'Le Pont des Subordonnées', col_cm1_5:'Le Cœur de la Machine',
 // 3e — Livre V : Le Miroir des Genres
 col_cm2_1:'Le Théâtre-Monde', col_cm2_2:'La Galerie des Masques', col_cm2_3:'La Scène aux Mille Voix', col_cm2_4:'Le Cabinet des Miroirs', col_cm2_5:"L'Étoile des Genres",
 // 3e — Livre VI : Le Réveil (le soulèvement)
 col_final_1:'Les Faubourgs Gris', col_final_2:'La Place du Silence', col_final_3:'Les Toits de Monotonia', col_final_4:'La Grande Tribune', col_final_5:"L'Aube du Verbe",
 // Antre du Chancelier
 col_titan_1:'Le Palais de Cendre', col_titan_2:'La Galerie des Mots Morts', col_titan_3:'Le Trône du Chancelier',
};
const COL_ZONES_FR = (typeof COL_ZONES!=='undefined' ? COL_ZONES : []).map(z => Object.assign({}, z, { id:'colfr_'+z.id, label: _COLFR_ZONE_LABELS[z.id] || z.label }));
const _COL_REGIONS_FR = [
 { id:'cp',    label:'Livre I — Le Français des Origines', levels:['6E'],     shape:'colline' },
 { id:'ce1',   label:'Livre II — Le Trésor des Mots',      levels:['5E'],     shape:'feuille' },
 { id:'ce2',   label:"Livre III — L'Art de Convaincre",    levels:['4E'],     shape:'dune' },
 { id:'cm1',   label:'Livre IV — Les Mécaniques du Verbe', levels:['4E'],     shape:'citadelle' },
 { id:'cm2',   label:'Livre V — Le Miroir des Genres',     levels:['3E'],     shape:'nebuleuse' },
 { id:'final', label:'Livre VI — Le Réveil',               levels:['3E'],     shape:'mandala' },
 { id:'titan', label:'L\'Antre du Chancelier',             levels:['3E'],     shape:'citadelle' },
];
const _COL_STORY_FR = {
 intro: { id:'colfr_intro', title:'La Bibliothèque infinie', pages:[
  { emoji:'🏙️', text:"Il fut un temps, dit-on, où les hommes de ce pays possédaient autant de mots qu'il y a d'étoiles. Puis vint <b>{villain}</b>, et il fit de la langue un désert. Aujourd'hui, à <b>Monotonia</b>, on n'enseigne plus qu'une poignée de mots dociles." },
  { emoji:'🌫️', text:"La ville est grise — d'un gris décrété, administratif, définitif. Les gens se croisent sans se parler : il ne reste plus grand-chose à dire. Car {villain} l'a compris — sans mot, pas d'idée ; sans nuance, pas de désaccord ; sans passé, pas d'« avant »." },
  { emoji:'😐', text:"« À quoi bon mille mots, répète le Chancelier dans son infinie sollicitude, quand un seul suffit à obéir ? » On l'applaudit beaucoup — du reste, <i>applaudir</i> et <i>approuver</i> se disent désormais d'un même mot, ce qui simplifie la vie publique." },
  { emoji:'🧱', text:"Toi, {hero}, tu t'ennuies au collège, où l'on récite les rares mots permis. Un matin, au fond du préau désert, ton coude heurte une dalle disjointe. Un déclic sec. Et le mur, lentement, s'ouvre." },
  { emoji:'📚', text:"Derrière : un escalier, puis une salle sans fin — des rayonnages qui montent jusqu'à des cieux de parchemin. Une <b>bibliothèque infinie</b>, oubliée de tous. « Bienvenue », murmure un vieil homme surgi de l'ombre. « Je suis le <b>Bibliothécaire</b>. Je t'attendais. »" },
  { emoji:'🗝️', text:"« Chaque livre est un monde, dit-il. Plonge dedans, traverse ses épreuves, et tu en rapporteras un <b>pouvoir</b> — un morceau de la langue volée. Quand tu les auras tous, tu pourras réveiller Monotonia. On t'appellera le <b>Porteur de Mots</b>. Commence par le premier tome : <i>Le Français des Origines</i>. »" },
 ]},
 chapters: {
  cp:    { id:'colfr_c_cp',  title:'Livre I — Le Français des Origines', crystal:"le pouvoir d'Étymologie", pages:[
   { emoji:'🌊', text:"À peine as-tu posé la main sur la page que le sol se dérobe : te voici au bord d'un <b>fleuve des langues</b>, sous un ciel de parchemin. De l'autre rive montent des voix anciennes — du latin, du grec, des mots qui résonnent en toi comme un souvenir." },
   { emoji:'🗝️', text:"« Ce livre garde l'<b>origine des mots</b>, souffle le Bibliothécaire. Son gardien est <b>l'Oubli</b>, une brume qui efface les racines. Rends à chaque mot sa source, et tu gagneras l'<b>Étymologie</b> : le pouvoir de lire, sous chaque mot, les siècles qui l'ont façonné. »" },
  ]},
  ce1:   { id:'colfr_c_ce1', title:'Livre II — Le Trésor des Mots', crystal:'le pouvoir de Nuance', pages:[
   { emoji:'💎', text:"Le deuxième tome t'engloutit dans une <b>caverne aux mille reflets</b>, où chaque mot scintille d'une lueur différente. Ici dorment les familles, les synonymes, les registres — toute la richesse que Monotonia a perdue." },
   { emoji:'🌑', text:"Son gardien est <b>la Platitude</b>, une créature qui aplatit tout en un seul mot terne. « Apprends à distinguer la lueur exacte d'un mot, dit le Bibliothécaire, et tu gagneras la <b>Nuance</b> : le pouvoir de préciser, et donc de contredire. »" },
  ]},
  ce2:   { id:'colfr_c_ce2', title:"Livre III — L'Art de Convaincre", crystal:"le pouvoir d'Éloquence", pages:[
   { emoji:'🏛️', text:"Le troisième livre t'ouvre une <b>agora antique</b> baignée de soleil, où des foules écoutent, debout, des orateurs enflammés. C'est ici qu'on apprend à transformer un récit en argument, et un argument en flamme." },
   { emoji:'🎭', text:"Son gardien est <b>le Sophiste</b>, un beau parleur qui plie la vérité à son gré. « Distingue convaincre de manipuler, prévient le Bibliothécaire, et tu gagneras l'<b>Éloquence</b> : le pouvoir d'émouvoir et de rallier une foule. »" },
  ]},
  cm1:   { id:'colfr_c_cm1', title:'Livre IV — Les Mécaniques du Verbe', crystal:'le pouvoir de Précision', pages:[
   { emoji:'⚙️', text:"Le quatrième tome te précipite dans une <b>cité-horlogerie</b> aux engrenages géants, où chaque rouage est une fonction de la phrase : sujet, verbe, complément, subordonnée. Tout s'emboîte, ou tout se grippe." },
   { emoji:'🔧', text:"Son gardien est <b>le Solécisme</b>, un monstre fait de phrases brisées et de temps mal accordés. « Règle chaque rouage, dit le Bibliothécaire, et tu gagneras la <b>Précision</b> : le pouvoir d'énoncer sans la moindre faille. »" },
  ]},
  cm2:   { id:'colfr_c_cm2', title:'Livre V — Le Miroir des Genres', crystal:"le pouvoir d'Imaginaire", pages:[
   { emoji:'🪞', text:"Le cinquième livre t'entraîne dans un <b>théâtre-monde</b>, une galerie de miroirs où vivent tous les genres : le conte et le merveilleux, la poésie, la tragédie, le roman, la littérature qui s'engage." },
   { emoji:'👻', text:"Son gardien est <b>le Spectre des Lieux communs</b>, qui n'a plus que des phrases mortes et rebattues à la bouche. « Ranime l'invention, dit le Bibliothécaire, et tu gagneras l'<b>Imaginaire</b> : le pouvoir de faire rêver, d'émouvoir, de créer. »" },
  ]},
  final: { id:'colfr_c_final', title:'Livre VI — Le Réveil', crystal:'le pouvoir du Verbe libre', pages:[
   { emoji:'✊', text:"Tu as tous les pouvoirs. Le dernier livre, lui, ne t'emporte nulle part : il te ramène <b>chez toi</b>, dans les faubourgs gris de Monotonia. Car le moment est venu de rendre au peuple les mots qu'on lui a volés." },
   { emoji:'🤫', text:"« Tu n'es pas seul, dit le Bibliothécaire. Dans l'ombre survivent les <b>Murmureurs</b>, ceux qui se transmettent en secret les mots interdits. Rassemble-les. Monte à la <b>Grande Tribune</b>. Et prononce les mots qui réveillent. » Au loin veillent les <b>Censeurs</b> du Chancelier." },
  ]},
  titan: { id:'colfr_c_titan', title:"L'Antre du Chancelier", crystal:'', pages:[
   { emoji:'🏯', text:"La foule réveillée gronde derrière toi. Il ne reste qu'un seuil à franchir : le <b>Palais de Cendre</b>, où trône {villain}, seul gardien des derniers grands mots du pays." },
   { emoji:'🌑', text:"Tu remontes la <b>galerie des mots morts</b> — tous les mots qu'il a fait taire, alignés comme des stèles. Au bout, un trône, et un homme petit, gris, qui t'attend en souriant à peine. La dernière joute commence : non pas d'épée, mais de <b>verbe</b>." },
  ]},
 },
 victories: {
  cp:  { id:'colfr_w_cp',  title:'Pouvoir gagné : l\'Étymologie', crystal:"l'Étymologie", pages:[
   { emoji:'🗝️', text:"À mesure que tu rends aux mots leurs racines — latines, grecques, gauloises, franques —, l'<b>Oubli</b> se dissipe comme une brume au soleil. Une clé d'or t'apparaît : tu tiens l'<b>Étymologie</b>." },
   { emoji:'📕', text:"Le tome se referme et rejoint ta <b>bibliothèque</b> : désormais, tu peux relire <i>Le Français des Origines</i> page à page. « Premier pouvoir reconquis, sourit le Bibliothécaire. Monotonia vient de respirer un peu mieux, sans le savoir. »" },
  ]},
  ce1: { id:'colfr_w_ce1', title:'Pouvoir gagné : la Nuance', crystal:'la Nuance', pages:[
   { emoji:'💎', text:"Tu rends à chaque mot sa lueur exacte, jusqu'à ce que <b>la Platitude</b> n'ait plus rien à aplatir. Un prisme de lumière naît dans ta main : la <b>Nuance</b> est à toi." },
   { emoji:'📗', text:"<i>Le Trésor des Mots</i> rejoint ta bibliothèque. « Avec la nuance revient le <b>doute</b>, murmure le Bibliothécaire — et avec le doute, le droit de n'être pas d'accord. C'est exactement ce que le Chancelier craint le plus. »" },
  ]},
  ce2: { id:'colfr_w_ce2', title:"Pouvoir gagné : l'Éloquence", crystal:"l'Éloquence", pages:[
   { emoji:'🔥', text:"Tu démêles le vrai du beau parler, et <b>le Sophiste</b> s'effondre sous ses propres pièges. Une flamme calme se pose sur tes lèvres : tu possèdes l'<b>Éloquence</b>." },
   { emoji:'📙', text:"<i>L'Art de Convaincre</i> rejoint ta bibliothèque. « Te voilà capable de rallier une foule, dit le Bibliothécaire, gravement. Garde ce pouvoir pur : l'éloquence sert la vérité, jamais le mensonge. »" },
  ]},
  cm1: { id:'colfr_w_cm1', title:'Pouvoir gagné : la Précision', crystal:'la Précision', pages:[
   { emoji:'⚙️', text:"Tu remets chaque rouage à sa place — accords, temps, subordonnées — et <b>le Solécisme</b> se disloque dans un grincement. Une plume d'acier se forme : la <b>Précision</b> est tienne." },
   { emoji:'📘', text:"<i>Les Mécaniques du Verbe</i> rejoint ta bibliothèque. « Une phrase juste est une arme que nul ne peut retourner contre toi, dit le Bibliothécaire. Le Chancelier déteste les phrases qu'il ne peut pas tordre. »" },
  ]},
  cm2: { id:'colfr_w_cm2', title:"Pouvoir gagné : l'Imaginaire", crystal:"l'Imaginaire", pages:[
   { emoji:'⭐', text:"Tu chasses les phrases mortes et ranimes l'invention, jusqu'à ce que <b>le Spectre des Lieux communs</b> se dissolve dans un dernier cliché. Une étoile se lève en toi : l'<b>Imaginaire</b>." },
   { emoji:'📓', text:"<i>Le Miroir des Genres</i> rejoint ta bibliothèque. « Cinq pouvoirs, dit le Bibliothécaire, et sa voix tremble. Il ne te manque plus que le dernier — celui que l'on ne reçoit pas d'un livre, mais que l'on prend soi-même. Rentre à Monotonia, {hero}. Il est temps. »" },
  ]},
  final: { id:'colfr_w_final', title:'Pouvoir gagné : le Verbe libre', crystal:'le Verbe libre', pages:[
   { emoji:'🌅', text:"Du haut de la <b>Grande Tribune</b>, tu parles. Les mots reconquis — <i>liberté, injustice, ensemble, demain</i> — tombent sur la foule grise comme une pluie sur une terre sèche. Et la foule, pour la première fois, <b>comprend</b>." },
   { emoji:'✊', text:"Un murmure, puis une clameur : Monotonia se réveille. Tu sens naître en toi le dernier pouvoir, le plus grand — le <b>Verbe libre</b>, celui qui soulève les peuples. Les Murmureurs sortent de l'ombre. La révolution est en marche." },
  ]},
 },
 epilogue: { id:'colfr_epilogue', title:'Le Réveil de Sémantia', pages:[
  { emoji:'🌑', text:"Au sommet du Palais de Cendre, {villain} t'attend. Il lance son dernier sort : un grand charabia où plus personne ne se comprend. Mais tu prononces, justes et vrais, les mots qu'il croyait morts — et chacun déchire son brouillard." },
  { emoji:'💬', text:"« Pourquoi ? lui demandes-tu. Pourquoi avoir volé les mots ? » Il te regarde, et pour la première fois, son sourire d'ironie se fissure : « Parce qu'un peuple qui sait nommer sa peine… finit toujours par exiger qu'on y mette fin. »" },
  { emoji:'⚖️', text:"Alors la foule, en bas, scande des mots qu'elle vient de réapprendre. Le Chancelier comprend qu'aucun mur ne tient contre une langue rendue au peuple. Son trône de cendre s'effondre. {villain} tombe — vaincu non par la force, mais par le <b>sens</b>." },
  { emoji:'🌅', text:"À l'aube, on demande à {hero}, le <b>Porteur de Mots</b>, de gouverner. Tu acceptes — à une condition : que jamais plus on ne touche aux mots du peuple. On rouvre les écoles, les bibliothèques, les théâtres." },
  { emoji:'📖', text:"Et d'une seule voix, sous les acclamations, le pays se choisit un nom nouveau, à la mesure de sa parole retrouvée : <b>Sémantia</b>, le pays du sens. Le vieux Bibliothécaire essuie une larme : « Il restait une ville où l'on croyait que comprendre est ce qu'il y a de plus précieux. C'était toi. »" },
 ]},
 // Livre VI lisible — le récit romancé du Réveil, débloqué après l'épilogue.
 bookTale: { id:'colfr_booktale', title:'Le Livre du Réveil', pages:[
  { emoji:'🕯️', text:"Longtemps après, on écrivit ce livre pour que nul n'oubliât comment Sémantia retrouva la parole. Il commence par une nuit grise, la dernière de Monotonia, et par un enfant qui ne savait pas encore qu'il était un héros." },
  { emoji:'📚', text:"Le Porteur de Mots avait conquis les cinq livres-mondes : l'Étymologie, la Nuance, l'Éloquence, la Précision, l'Imaginaire. Cinq pouvoirs, cinq fragments de la langue volée. Mais le sixième ne dormait dans aucun livre : il dormait dans le <b>peuple</b>." },
  { emoji:'🤫', text:"Une nuit, par les caves et les toits, il rassembla les <b>Murmureurs</b> — couturières, vieux maîtres, enfants têtus — tous ceux qui avaient gardé en secret quelques mots interdits, comme on garde des braises sous la cendre." },
  { emoji:'📜', text:"À l'aube, il monta à la <b>Grande Tribune</b>, là où le Chancelier ne laissait dire qu'un mot par jour. Et il prononça le <b>grand discours</b> : non un discours de haine, mais de mots simples, rendus un à un à ceux qui les avaient perdus." },
  { emoji:'🗣️', text:"« On vous a dit que vous étiez <i>contents</i>. Mais pour dire la <i>joie</i>, la <i>colère</i>, l'<i>espoir</i>, il vous manquait les mots — et sans les mots, vous ne pouviez même pas savoir ce qui vous manquait. On ne vous a pas seulement réduits au silence : on vous a réduits à l'<b>aveuglement</b>. »" },
  { emoji:'🌊', text:"Un frisson parcourut la foule grise. Des hommes pleuraient sans savoir nommer pourquoi — puis le mot leur revenait : <i>injustice</i>. Et avec le mot, la colère ; et avec la colère, le courage." },
  { emoji:'🔥', text:"Les <b>Censeurs</b> chargèrent pour faire taire la Tribune. Mais comment fait-on taire dix mille bouches qui viennent de retrouver la parole ? Chaque mot rendu était un pavé ; chaque phrase, une barricade." },
  { emoji:'⚔️', text:"Ce ne fut pas une bataille d'épées. Ce fut une bataille de <b>voix</b>. Là où passait le Porteur de Mots, les murs d'affiches à un seul mot tombaient, et les gens recommençaient à se parler, à se nommer, à se reconnaître." },
  { emoji:'🏯', text:"Au cœur du Palais de Cendre, le Chancelier comprit qu'il avait perdu. Il avait cru qu'en ôtant les mots, il ôtait les idées. Il découvrait, trop tard, qu'une idée rendue à un seul homme contamine aussitôt tous les autres." },
  { emoji:'🌅', text:"Quand le tyran tomba, on ne le mit pas à mort : on lui rendit, lui aussi, les mots qu'il avait perdus en chemin — et l'on dit qu'il prononça enfin, en pleurant, ceux qu'il refusait depuis l'enfance : « <b>J'avais peur.</b> »" },
  { emoji:'🕊️', text:"Le pays se choisit un nom : <b>Sémantia</b>. On grava au fronton de la bibliothèque enfin rouverte une phrase que les écoliers récitent encore : « <i>Un peuple qui possède ses mots possède son destin.</i> »" },
  { emoji:'💛', text:"Et toi qui lis ces lignes : souviens-toi que ce livre, comme les cinq autres, faillit disparaître à jamais. Les mots ne sont pas un décor. Ce sont des outils, des armes, des ponts. Garde-les vivants, et nul Chancelier ne te réduira jamais au silence." },
 ]},
};

// ── Livres lisibles de la Bibliothèque infinie ──────────────────────────
// Seul le Livre I a son contenu rédigé/vérifié (v10.13.0). Les tomes II→V
// seront rédigés et vérifiés un par un (ready:false → « bientôt »). Le Livre
// VI lisible = le récit romancé _COL_STORY_FR.bookTale (débloqué à l'épilogue).
const _COL_BOOKS_FR = [
 { roman:'I',   short:'Origines',   region:'cp',    accent:'#9E4326', accent2:'#C2603A', dark:'#5a2718', title:'Le Français des Origines', power:"l'Étymologie",  ready:true, pages: _colBook1Pages() },
 { roman:'II',  short:'Trésor',     region:'ce1',   accent:'#1D6E56', accent2:'#1D9E75', dark:'#134a3a', title:'Le Trésor des Mots',       power:'la Nuance',      ready:true, pages: _colBook2Pages() },
 { roman:'III', short:'Convaincre', region:'ce2',   accent:'#854F0B', accent2:'#BA7517', dark:'#5a350a', title:"L'Art de Convaincre",      power:"l'Éloquence",   ready:true, pages: _colBook3Pages() },
 { roman:'IV',  short:'Mécaniques', region:'cm1',   accent:'#0C447C', accent2:'#185FA5', dark:'#082f56', title:'Les Mécaniques du Verbe',  power:'la Précision',  ready:true, pages: _colBook4Pages() },
 { roman:'V',   short:'Genres',     region:'cm2',   accent:'#3C3489', accent2:'#534AB7', dark:'#2a2456', title:'Le Miroir des Genres',     power:"l'Imaginaire",  ready:true, pages: _colBook5Pages() },
 { roman:'VI',  short:'Réveil',     region:'final', accent:'#7A2A1E', accent2:'#A33D2D', dark:'#511a12', title:'Le Livre du Réveil',       power:'le Verbe libre', ready:true, bookTale:true },
 { roman:'',    short:'Bonus',      region:'titan', accent:'#34333c', accent2:'#4a4856', dark:'#232228', gold:'#cdcdd6', title:"L'Antre du Chancelier", power:'', ready:true, bonus:true, pages: _colBook7Pages() },
];
function _colBook1Pages(){
 const I_KEY = '<svg viewBox="0 0 120 90" width="100%"><circle cx="60" cy="34" r="9" fill="none" stroke="#C79A3A" stroke-width="3"/><circle cx="60" cy="34" r="3" fill="#C79A3A"/><line x1="60" y1="43" x2="60" y2="62" stroke="#C79A3A" stroke-width="3.5" stroke-linecap="round"/><path d="M60 62 C52 68 49 72 44 78" fill="none" stroke="#C79A3A" stroke-width="2.4" stroke-linecap="round"/><path d="M60 62 C68 68 71 72 76 78" fill="none" stroke="#C79A3A" stroke-width="2.4" stroke-linecap="round"/><path d="M60 62 C56 70 54 74 51 80" fill="none" stroke="#C79A3A" stroke-width="2" stroke-linecap="round"/><path d="M60 62 C64 70 66 74 69 80" fill="none" stroke="#C79A3A" stroke-width="2" stroke-linecap="round"/></svg>';
 const XVXX = '<svg viewBox="0 0 130 70" width="100%"><rect x="20" y="14" width="90" height="44" rx="3" fill="#E7D7AE" stroke="#B79A63" stroke-width="1.5"/><text x="65" y="44" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#7A2A1E">XV-XX</text></svg>';
 const PARCH = '<svg viewBox="0 0 160 96" width="100%"><rect x="22" y="10" width="116" height="76" rx="3" fill="#EFE2BE" stroke="#B79A63" stroke-width="1.5"/><g stroke="#B79A63" stroke-width="0.8"><line x1="34" y1="26" x2="126" y2="26"/><line x1="34" y1="36" x2="118" y2="36"/><line x1="34" y1="46" x2="126" y2="46"/><line x1="34" y1="56" x2="110" y2="56"/></g><circle cx="50" cy="74" r="9" fill="#A33D2D" stroke="#7A2A1E" stroke-width="1.5"/><circle cx="110" cy="74" r="9" fill="#7A6BB0" stroke="#534AB7" stroke-width="1.5"/></svg>';
 const CIRC = '<svg viewBox="0 0 150 70" width="100%"><text x="75" y="46" text-anchor="middle" font-family="Georgia,serif" font-size="30" fill="#3A2A18">for<tspan fill="#9E4326">ê</tspan>t</text><text x="92" y="22" text-anchor="middle" font-family="Georgia,serif" font-size="16" fill="#B79A63" font-style="italic">s</text></svg>';
 return [
  { chap:'Frontispice', illus:I_KEY, cap:'La clé-racine — le pouvoir d\'Étymologie.', html:"<p><i>Tout mot que tu prononces a vécu mille ans avant toi.</i></p><p>Ce livre raconte d'où vient le français, comme un voyage. Tu remonteras le cours du temps jusqu'aux sources de ta langue, et tu apprendras à lire, derrière chaque mot, les siècles qui l'ont façonné.</p>" },
  { chap:'I — Les racines latines', html:"<p>Avant le français, il y eut le <b>gaulois</b>, langue d'un peuple celte qui ne savait pas écrire son histoire. Une centaine de mots seulement nous en restent, presque tous nés de la terre et des bois : <i>chêne, bouleau, alouette, mouton, ruche, charrue, chemin, lieue</i>. Quand tu marches dans la campagne, tu parles encore la langue des druides.</p>" },
  { chap:'I — Les racines latines', illus:XVXX, cap:'Les Quinze-Vingts : 15 × 20 = 300.', html:"<p>Les Gaulois comptaient <b>par vingt</b> — on pense que c'est d'eux que vient notre <i>quatre-vingts</i>, « quatre fois vingt ». À Paris, l'hôpital des <b>Quinze-Vingts</b> garde la trace de cet usage : fondé pour trois cents aveugles, soit <i>quinze fois vingt</i>.</p>" },
  { chap:'I — Les racines latines', html:"<p>Puis vinrent les légions de Rome, et avec elles le <b>latin</b> — non le latin des poètes, mais celui, vivant et déformé, des soldats et des marchands. C'est de cette langue parlée qu'est né le français : une <b>langue romane</b>, « issue de Rome », sœur de l'espagnol et de l'italien.</p><p>Les mots s'usaient à l'oreille comme des galets : <i>caballus</i> devint <i>cheval</i>, <i>schola</i> devint <i>école</i>.</p>" },
  { chap:'I — Les racines latines', html:"<p><b>L'anecdote du sel.</b> Le mot <b>salaire</b> vient du latin <i>salarium</i>, qui contient <i>sal</i> : le sel. On raconte depuis l'Antiquité que les soldats romains étaient payés en sel. La vérité est plus prudente : les historiens doutent aujourd'hui de cette jolie légende. Retiens la leçon — une étymologie séduisante n'est pas toujours vraie.</p>" },
  { chap:'II — L\'héritage grec', html:"<p>Si le latin est la mère du français, le <b>grec</b> en est le parrain savant. Il nous a donné les mots du savoir — <i>philosophie</i> (« amour de la sagesse »), <i>démocratie</i> (« pouvoir du peuple »), <i>théâtre</i> — et des <b>briques</b> qu'on assemble : <i>télé-</i> (loin), <i>-phone</i> (la voix), <i>-graphe</i> (écrire), <i>bio-</i> (la vie).</p>" },
  { chap:'II — L\'héritage grec', html:"<p>Deux mots pour sourire. <b>Musée</b> vient des <b>Muses</b>, les neuf déesses des arts : un musée est un « temple des Muses ». Et <b>barbare</b> désignait, pour les Grecs, ceux qui ne parlaient pas leur langue : à leurs oreilles, ils semblaient dire « bar-bar-bar » ! Un mot peut naître d'une moquerie.</p>" },
  { chap:'III — Le Moyen Âge', html:"<p>Au Moyen Âge, les <b>Francs</b>, guerriers germaniques, donnèrent leur nom à la <b>France</b>. Ils ne remplacèrent pas le latin : ils le colorèrent. On leur doit les mots de la guerre (<i>guerre, heaume, maréchal</i>), des couleurs (<i>bleu, blanc, gris, blond</i>) et le mot <i>jardin</i>. On dit que le français est <b>la plus germanique des langues romanes</b>.</p>" },
  { chap:'III — Le Moyen Âge', illus:PARCH, cap:'Les Serments de Strasbourg, scellés des deux frères.', html:"<p><b>Le plus vieux français du monde.</b> En <b>842</b>, deux petits-fils de Charlemagne se jurèrent alliance à Strasbourg, chacun dans la langue de l'autre. Ces <b>Serments de Strasbourg</b>, recopiés par l'historien Nithard, sont le plus ancien texte conservé dans la langue qui allait devenir le français.</p>" },
  { chap:'IV — Le français moderne', html:"<p><b>Le jour où le français devint roi.</b> En <b>1539</b>, <b>François Ier</b> signa l'ordonnance de <b>Villers-Cotterêts</b> : désormais, la justice et l'administration se feraient en français, et non plus en latin. La même loi créa les registres de baptême, ancêtres de l'état civil. C'est le plus ancien texte de loi français encore en partie en vigueur.</p>" },
  { chap:'IV — Le français moderne', html:"<p>En <b>1549</b>, le poète <b>Joachim du Bellay</b> et ses amis de la <b>Pléiade</b> proclamèrent, dans un texte au titre flamboyant, que le français pouvait être aussi beau que le latin. En <b>1635</b>, Richelieu fonda l'<b>Académie française</b>. Au siècle des Lumières, le français rayonnait sur toute l'Europe cultivée.</p>" },
  { chap:'V — La langue vivante', illus:CIRC, cap:'L\'accent circonflexe : la pierre tombale d\'un « s ».', html:"<p>Une langue est un être vivant. <b>Le chapeau qui cache un fantôme :</b> l'accent circonflexe est, le plus souvent, la trace d'un <b>s disparu</b>. On écrivait jadis <i>forest, hospital, feste, isle, chasteau</i> — devenus <i>forêt, hôpital, fête, île, château</i>.</p>" },
  { chap:'V — La langue vivante', html:"<p><b>Le truc du détective :</b> pour débusquer ce <i>s</i> enfui, cherche un mot de la même famille — il l'a souvent gardé : <i>forêt → forestier</i>, <i>hôpital → hospitalier</i>, <i>fête → festin</i>. Et si tu connais l'anglais, observe : <i>forest, hospital, feast</i> ont gardé le <i>s</i> d'avant.</p>" },
  { chap:'V — Clôture', illus:I_KEY, cap:'Premier pouvoir reconquis.', html:"<p>Te voici au bout du premier livre. Ta langue est l'héritage de Gaulois et de Romains, de Grecs savants et de Francs guerriers, de rois et de poètes — un trésor que mille générations t'ont transmis. {villain} voudrait te faire croire que les mots ne servent qu'à obéir. Mais tu sais, désormais, qu'ils portent toute l'histoire des hommes.</p>" },
 ];
}

function _colBook2Pages(){
 const PRISME='<svg viewBox="0 0 150 80" width="100%"><polygon points="60,16 88,64 32,64" fill="none" stroke="#1D9E75" stroke-width="2"/><line x1="10" y1="40" x2="48" y2="40" stroke="#cfcabf" stroke-width="2"/><line x1="72" y1="46" x2="120" y2="26" stroke="#e74c3c" stroke-width="2"/><line x1="74" y1="50" x2="122" y2="44" stroke="#f1c40f" stroke-width="2"/><line x1="74" y1="54" x2="120" y2="62" stroke="#1D9E75" stroke-width="2"/><line x1="73" y1="58" x2="118" y2="74" stroke="#3498db" stroke-width="2"/></svg>';
 const TREE='<svg viewBox="0 0 170 92" width="100%"><rect x="60" y="62" width="50" height="20" rx="3" fill="#1D6E56"/><text x="85" y="76" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#fff" font-weight="700">TERRE</text><g stroke="#1D9E75" stroke-width="1.5" fill="none"><path d="M70 62 C50 48 40 42 30 32"/><path d="M85 62 V30"/><path d="M100 62 C120 48 130 42 140 32"/></g><g font-family="Georgia,serif" font-size="9" fill="#185c46" text-anchor="middle"><text x="28" y="28">terrien</text><text x="85" y="24">atterrir</text><text x="142" y="28">souterrain</text></g></svg>';
 const STAIRS='<svg viewBox="0 0 170 86" width="100%"><rect x="14" y="58" width="46" height="20" fill="#cfe8dd"/><rect x="62" y="42" width="46" height="36" fill="#8fd3bd"/><rect x="110" y="26" width="46" height="52" fill="#1D9E75"/><g font-family="Georgia,serif" font-size="9" text-anchor="middle"><text x="37" y="71" fill="#185c46">bagnole</text><text x="85" y="64" fill="#0d3a2c">voiture</text><text x="133" y="50" fill="#fff">automobile</text></g></svg>';
 const ANTO='<svg viewBox="0 0 160 80" width="100%"><rect x="26" y="30" width="30" height="36" rx="2" fill="#1D6E56"/><rect x="22" y="24" width="38" height="8" rx="2" fill="#155a44"/><text x="41" y="77" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#185c46">poubelle</text><rect x="96" y="34" width="40" height="10" rx="3" fill="#e7b96b"/><rect x="96" y="44" width="40" height="6" fill="#6fae5a"/><rect x="96" y="50" width="40" height="10" rx="3" fill="#e7b96b"/><text x="116" y="77" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#185c46">sandwich</text></svg>';
 return [
  { chap:'Frontispice', illus:PRISME, cap:'Le prisme — le pouvoir de Nuance.', html:"<p><i>Un seul mot peut renfermer mille reflets ; encore faut-il savoir le faire tourner dans la lumière.</i></p><p>Là où Monotonia n'a gardé qu'un mot par idée, ce livre en révèle des familles entières, des nuances infinies, des registres et des images. Apprends à choisir le mot exact, et tu tiendras la <b>Nuance</b> : le pouvoir de dire précisément — donc de penser librement.</p>" },
  { chap:'I — Les familles de mots', illus:TREE, cap:'Du radical « terre » naît toute une famille.', html:"<p>Les mots vivent en <b>familles</b>. Autour d'un même cœur — le <b>radical</b> — se rassemblent des frères et des cousins, façonnés par des <b>préfixes</b> (devant) et des <b>suffixes</b> (derrière). Du radical <i>terre</i> naissent <i>terrien, terrestre, atterrir, déterrer, souterrain, territoire</i>.</p>" },
  { chap:'I — Les familles de mots', html:"<p>Connaître la famille d'un mot, c'est en deviner le sens — et souvent l'orthographe. Tu hésites sur le <i>d</i> muet de <i>marchand</i> ? Le cousin <i>marchandise</i> le révèle. Tu doutes du <i>t</i> de <i>petit</i> ? <i>Petitesse</i> te répond. Un mot bien entouré ne se trompe jamais longtemps.</p>" },
  { chap:'II — Synonymes & nuances', html:"<p>On dit que les <b>synonymes</b> ont le même sens. C'est presque vrai — et c'est là tout l'art. Car il n'existe presque jamais de synonymes <b>parfaits</b> : chaque mot porte sa nuance, sa température, son ombre.</p><p>Entre <i>content</i>, <i>heureux</i>, <i>ravi</i> et <i>comblé</i>, il y a toute une montée de la joie. Entre <i>la peur</i>, <i>la crainte</i> et <i>la terreur</i>, toute une gradation. Choisir, c'est nuancer ; nuancer, c'est penser juste.</p>" },
  { chap:'II — Synonymes & nuances', html:"<p><b>Le saviez-vous ?</b> <i>Vélo</i> et <i>bicyclette</i> désignent le même objet, mais non tout à fait la même chose : l'un est vif et familier, l'autre plus ancien et soigné. Voilà pourquoi {villain} rêve d'une langue d'un seul mot par idée : qui n'a qu'un mot pour la joie ne distingue plus le plaisir du bonheur — et finit par ne plus très bien savoir ce qu'il ressent.</p>" },
  { chap:'III — Les registres de langue', illus:STAIRS, cap:'Trois marches pour un même objet.', html:"<p>Un même sens se dit de plusieurs façons, selon à qui l'on parle : ce sont les <b>registres</b>. Pour une voiture, le <b>familier</b> dit <i>bagnole</i>, le <b>courant</b> dit <i>voiture</i>, le <b>soutenu</b> dit <i>automobile</i>. Pour la mort : <i>clamser</i>, <i>mourir</i>, <i>décéder</i>, <i>trépasser</i>.</p>" },
  { chap:'III — Les registres de langue', html:"<p>Savoir changer de registre — comme on change de vêtement selon l'occasion — c'est être à l'aise partout : dans la cour de récréation comme devant un jury d'examen. Le registre n'est pas une prison : c'est une garde-robe.</p>" },
  { chap:'IV — Sens propre & sens figuré', html:"<p>Chaque mot a d'abord un <b>sens propre</b>, concret : le <i>pied</i>, c'est le bas de la jambe. Puis la langue, poète sans le savoir, lui invente un <b>sens figuré</b> : le <i>pied</i> de la montagne, le <i>pied</i> de la lampe, le <i>pied</i> d'un vers.</p><p>Notre parole est pleine de ces images endormies : on <i>dévore</i> un livre, on <i>brûle</i> d'impatience, on porte un <i>poids</i> sur le cœur. Comprendre le figuré, c'est entendre la poésie cachée dans les mots de tous les jours.</p>" },
  { chap:'V — Les figures de style', html:"<p>Quand on cultive ces images à dessein, on crée des <b>figures de style</b>. La <b>comparaison</b> rapproche à l'aide d'un outil (<i>fort comme un lion</i>) ; la <b>métaphore</b> ose sans outil (<i>cet homme est un lion</i>) ; la <b>personnification</b> prête la vie aux choses (<i>le vent murmure</i>) ; l'<b>hyperbole</b> exagère (<i>mourir de rire</i>) ; la <b>litote</b> en dit moins pour suggérer plus (<i>« Va, je ne te hais point »</i> pour dire « je t'aime »).</p>" },
  { chap:'V — Les figures de style', html:"<p><b>Une figure née d'un malentendu.</b> Le maréchal <b>Jacques de La Palice</b>, mort à Pavie en 1525, fut chanté par ses soldats : « S'il n'était mort, il ferait encore envie. » Or, à l'époque, le <i>s</i> long ressemblait à un <i>f</i> : on finit par lire « il <i>serait</i> encore en vie » ! De cette bévue naquit la <b>lapalissade</b> — ces vérités si évidentes qu'elles font sourire : « Un quart d'heure avant sa mort, il était encore en vie. »</p>" },
  { chap:'V — Les figures de style', illus:ANTO, cap:'Deux noms propres devenus communs.', html:"<p><b>Quand un nom propre devient commun :</b> c'est l'<b>antonomase</b>. Un préfet de Paris, <b>Eugène Poubelle</b>, imposa en 1884 des boîtes à ordures : on les baptisa de son nom. Un lord anglais, le <b>comte de Sandwich</b>, aimait manger sa viande entre deux tranches de pain sans quitter sa table de jeu : le <i>sandwich</i> était né. Même la <b>silhouette</b> doit son nom à un homme, le ministre Étienne de Silhouette.</p>" },
  { chap:'V — Clôture', illus:PRISME, cap:'Deuxième pouvoir reconquis.', html:"<p>Te voici au bout du deuxième tome. Tu sais désormais qu'un mot n'est jamais seul : il a une famille, des cousins plus précis, un registre, un double sens, et mille façons de briller. {villain} voudrait n'en garder qu'un par idée. Mais celui qui possède la <b>Nuance</b> possède le doute, la précision, et le droit de n'être pas tout à fait d'accord.</p>" },
 ];
}

function _colBook3Pages(){
 const FLAME='<svg viewBox="0 0 140 88" width="100%"><rect x="50" y="44" width="40" height="36" rx="3" fill="#854F0B"/><rect x="44" y="40" width="52" height="8" rx="2" fill="#6b3f08"/><path d="M70 38 C62 28 80 22 70 8 C84 16 82 30 70 38 Z" fill="#e08a1e" stroke="#BA7517" stroke-width="1.2"/><path d="M70 36 C66 30 75 26 70 18 C77 23 76 31 70 36 Z" fill="#f6cd6a"/></svg>';
 const TRI='<svg viewBox="0 0 160 92" width="100%"><polygon points="80,18 26,78 134,78" fill="none" stroke="#BA7517" stroke-width="2"/><text x="80" y="14" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#6b3f08">ethos</text><text x="22" y="88" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#6b3f08">logos</text><text x="138" y="88" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#6b3f08">pathos</text><text x="80" y="58" text-anchor="middle" font-family="Georgia,serif" font-size="8" fill="#9a6a1a">persuasion</text></svg>';
 const SEA='<svg viewBox="0 0 160 82" width="100%"><rect x="0" y="50" width="160" height="32" fill="#cfe0e8"/><path d="M0 56 q20 -4 40 0 t40 0 t40 0 t40 0" fill="none" stroke="#8fb0c0" stroke-width="1.4"/><path d="M0 66 q20 -4 40 0 t40 0 t40 0 t40 0" fill="none" stroke="#8fb0c0" stroke-width="1.2"/><circle cx="58" cy="34" r="6" fill="#e0b88a"/><rect x="53" y="40" width="10" height="20" rx="3" fill="#854F0B"/><path d="M63 30 l8 -3 M63 33 l8 0 M63 36 l8 3" stroke="#9a6a1a" stroke-width="1" stroke-linecap="round"/><circle cx="68" cy="34" r="1.1" fill="#6b3f08"/></svg>';
 const BAL='<svg viewBox="0 0 150 86" width="100%"><line x1="75" y1="14" x2="75" y2="66" stroke="#854F0B" stroke-width="3"/><line x1="33" y1="26" x2="117" y2="26" stroke="#854F0B" stroke-width="3"/><rect x="60" y="66" width="30" height="8" rx="2" fill="#6b3f08"/><circle cx="33" cy="42" r="12" fill="none" stroke="#1D9E75" stroke-width="2"/><text x="33" y="47" text-anchor="middle" font-size="14" fill="#1D9E75">✓</text><circle cx="117" cy="42" r="12" fill="none" stroke="#c0392b" stroke-width="2"/><text x="117" y="47" text-anchor="middle" font-size="14" fill="#c0392b">✗</text></svg>';
 return [
  { chap:'Frontispice', illus:FLAME, cap:'La tribune et la flamme — le pouvoir d\'Éloquence.', html:"<p><i>Une idée juste mal défendue est une idée vaincue ; le vrai a besoin d'une voix.</i></p><p>Ce livre enseigne l'art le plus redoutable : convaincre. Non par la force, mais par la parole ordonnée. Apprends-en les règles, et tu tiendras l'<b>Éloquence</b> : le pouvoir d'émouvoir une foule et de la rallier à la vérité.</p>" },
  { chap:'I — Du récit à l\'argument', html:"<p>Raconter et convaincre sont deux arts voisins. Le récit montre ; l'<b>argument</b> démontre. Convaincre, c'est défendre une <b>thèse</b> — une idée que l'on tient pour vraie — à l'aide d'<b>arguments</b> (les raisons) et d'<b>exemples</b> (les preuves).</p><p>Un bon raisonnement avance comme un escalier : chaque marche, posée d'aplomb, porte la suivante jusqu'à la conclusion.</p>" },
  { chap:'II — Les trois leviers', illus:TRI, cap:'Aristote : convaincre repose sur trois appuis.', html:"<p>Le philosophe <b>Aristote</b>, il y a vingt-quatre siècles, observa qu'on persuade par trois leviers. L'<b>ethos</b> : la confiance qu'inspire celui qui parle. Le <b>pathos</b> : l'émotion qu'il éveille. Le <b>logos</b> : la force logique de ses raisons.</p><p>Un discours qui n'a que le pathos flatte ; qui n'a que le logos ennuie. Le grand orateur, lui, tient les trois en équilibre.</p>" },
  { chap:'III — La rhétorique antique', illus:SEA, cap:'Démosthène s\'exerçant face à la mer.', html:"<p>Dans la Grèce antique, sur l'<b>agora</b>, savoir parler décidait du sort des cités. Le plus célèbre des orateurs, <b>Démosthène</b> (384-322 av. J.-C.), était, dit-on, gêné par un défaut d'élocution.</p><p>Selon Plutarque, il s'entraîna en parlant la bouche pleine de <b>galets</b>, et en couvrant de sa voix le fracas des vagues. L'anecdote est aujourd'hui discutée par les historiens — mais elle dit une vérité : l'éloquence se conquiert par le travail.</p>" },
  { chap:'III — La rhétorique antique', html:"<p>À Rome, ce fut <b>Cicéron</b>. Son attaque contre le conspirateur Catilina s'ouvre par une phrase restée célèbre : « Jusques à quand, Catilina, abuseras-tu de notre patience ? » En une question, il dresse le Sénat entier contre l'accusé. Voilà la rhétorique : la bonne phrase, au bon moment, frappe plus fort qu'une armée.</p>" },
  { chap:'IV — Le débat & la réfutation', html:"<p>Convaincre, ce n'est pas parler seul : c'est aussi <b>répondre</b>. Dans un débat, on écoute d'abord l'adversaire — vraiment —, puis on <b>concède</b> ce qui est juste (« vous avez raison sur ce point »), avant de <b>réfuter</b> ce qui ne l'est pas.</p><p>Celui qui caricature l'autre pour le vaincre n'a rien prouvé ; celui qui réfute l'adversaire dans sa version la plus forte a vraiment gagné.</p>" },
  { chap:'V — Convaincre ou manipuler', illus:BAL, cap:'La même arme, deux usages.', html:"<p>Voici le cœur de ce livre. Les mêmes procédés peuvent servir le vrai… ou le mentir. <b>Convaincre</b>, c'est aider l'autre à voir ce qui est vrai. <b>Manipuler</b>, c'est lui faire croire ce qui l'arrange, vous.</p>" },
  { chap:'V — Convaincre ou manipuler', html:"<p>Apprends à repérer les pièges du manipulateur : la <b>flatterie</b> qui endort, la <b>peur</b> qui paralyse, la <b>généralisation</b> hâtive (« tous les… »), l'<b>homme de paille</b> (déformer l'idée adverse pour l'abattre plus aisément). Les reconnaître, c'est déjà s'en défendre.</p><p>C'est exactement ce que {villain} redoute : un peuple capable de distinguer un argument d'un mensonge bien tourné.</p>" },
  { chap:'V — Clôture', illus:FLAME, cap:'Troisième pouvoir reconquis.', html:"<p>Te voici au bout du troisième tome. Tu sais défendre une thèse, équilibrer l'ethos, le pathos et le logos, débattre loyalement, et démasquer la manipulation. L'<b>Éloquence</b> est tienne. Mais souviens-toi du serment des vrais orateurs : cette flamme éclaire, elle ne brûle pas. Mets-la au service de la vérité — jamais du tyran.</p>" },
 ];
}

function _colBook4Pages(){
 const GEAR='<svg viewBox="0 0 130 92" width="100%"><g transform="translate(52,50)"><circle r="20" fill="none" stroke="#185FA5" stroke-width="3"/><circle r="7" fill="#0C447C"/><g stroke="#185FA5" stroke-width="3" stroke-linecap="round"><line x1="20" y1="0" x2="27" y2="0"/><line x1="14.1" y1="14.1" x2="19.1" y2="19.1"/><line x1="0" y1="20" x2="0" y2="27"/><line x1="-14.1" y1="14.1" x2="-19.1" y2="19.1"/><line x1="-20" y1="0" x2="-27" y2="0"/><line x1="-14.1" y1="-14.1" x2="-19.1" y2="-19.1"/><line x1="0" y1="-20" x2="0" y2="-27"/><line x1="14.1" y1="-14.1" x2="19.1" y2="-19.1"/></g></g><path d="M70 36 L98 12" stroke="#0C447C" stroke-width="3" stroke-linecap="round"/><path d="M94 10 l9 -4 -2 9 Z" fill="#185FA5"/></svg>';
 const MACH='<svg viewBox="0 0 175 82" width="100%"><g font-family="Georgia,serif" font-weight="700" fill="#fff" text-anchor="middle"><circle cx="34" cy="46" r="18" fill="#0C447C"/><text x="34" y="50" font-size="10">sujet</text><circle cx="86" cy="40" r="21" fill="#185FA5"/><text x="86" y="44" font-size="11">verbe</text><circle cx="142" cy="48" r="16" fill="#0C447C"/><text x="142" y="52" font-size="8">compl.</text></g></svg>';
 const MODES='<svg viewBox="0 0 180 86" width="100%"><circle cx="16" cy="44" r="5" fill="#0C447C"/><g stroke="#185FA5" stroke-width="1.4" fill="none"><path d="M21 44 H44"/><path d="M44 44 V14 H58"/><path d="M44 44 V44 H58"/><path d="M44 44 V74 H58"/></g><g font-family="Georgia,serif" font-size="9" fill="#0c3a66"><text x="61" y="17">indicatif (le réel)</text><text x="61" y="47">subjonctif (le souhaité)</text><text x="61" y="77">conditionnel (le possible)</text></g></svg>';
 const DOLLS='<svg viewBox="0 0 175 80" width="100%"><rect x="12" y="22" width="150" height="40" rx="4" fill="none" stroke="#0C447C" stroke-width="2"/><rect x="42" y="30" width="104" height="24" rx="3" fill="none" stroke="#185FA5" stroke-width="1.6"/><rect x="66" y="36" width="62" height="12" rx="2" fill="none" stroke="#5a93c4" stroke-width="1.3"/><g font-family="Georgia,serif" font-size="8" fill="#0c3a66"><text x="16" y="19">principale</text><text x="48" y="28" font-size="7">subordonnée</text></g></svg>';
 const SCROLL='<svg viewBox="0 0 150 84" width="100%"><rect x="28" y="18" width="92" height="52" rx="3" fill="#EFE2BE" stroke="#B79A63"/><g stroke="#9a7b45" stroke-width="0.8"><line x1="38" y1="30" x2="110" y2="30"/><line x1="38" y1="40" x2="104" y2="40"/><line x1="38" y1="50" x2="110" y2="50"/><line x1="38" y1="58" x2="94" y2="58"/></g><path d="M112 20 L132 2" stroke="#0C447C" stroke-width="3" stroke-linecap="round"/><path d="M128 0 l7 -2 -1 7 Z" fill="#185FA5"/></svg>';
 return [
  { chap:'Frontispice', illus:GEAR, cap:'Le rouage et la plume — le pouvoir de Précision.', html:"<p><i>Une pensée vague produit une phrase boiteuse ; une pensée claire, une phrase d'aplomb.</i></p><p>Ce livre est une horlogerie : il montre comment les mots s'emboîtent pour former des phrases qui ne trahissent jamais l'idée. Maîtrise ses rouages, et tu tiendras la <b>Précision</b> : le pouvoir d'énoncer sans la moindre faille.</p>" },
  { chap:'I — La phrase et ses fonctions', illus:MACH, cap:'Chaque mot, un rouage à sa place.', html:"<p>Une phrase est une petite machine. En son centre, le <b>verbe</b> — le moteur, qui dit l'action ou l'état. Devant lui, le <b>sujet</b>, qui fait l'action. Autour, les <b>compléments</b>, qui précisent : quoi ? où ? quand ? comment ?</p>" },
  { chap:'I — La phrase et ses fonctions', html:"<p>Chaque mot occupe une <b>fonction</b>, comme un rouage occupe sa place : déplace-le, et toute la machine se grippe. « Le chat mange la souris » ne dit pas du tout la même chose que « La souris mange le chat » — pourtant, ce sont les mêmes mots. L'ordre est déjà du sens.</p>" },
  { chap:'II — Les modes et les temps', illus:MODES, cap:'Un même verbe, plusieurs façons de le dire.', html:"<p>Le verbe se dit de plusieurs façons : ce sont les <b>modes</b>. L'<b>indicatif</b> énonce le réel (<i>il vient</i>) ; le <b>subjonctif</b>, le souhaité ou l'incertain (<i>qu'il vienne</i>) ; le <b>conditionnel</b>, le possible (<i>il viendrait</i>) ; l'<b>impératif</b>, l'ordre (<i>viens !</i>).</p>" },
  { chap:'II — Les modes et les temps', html:"<p>Et chaque mode déploie ses <b>temps</b>, pour situer l'action dans le cours du temps : hier, maintenant, demain. Choisir le bon mode et le bon temps, c'est dire exactement ce que l'on pense — ni plus, ni moins. Un seul temps qui glisse, et tout le sens dérape.</p>" },
  { chap:'III — La concordance des temps', html:"<p>Les temps d'une phrase doivent s'<b>accorder entre eux</b>, comme des engrenages qui tournent ensemble. On ne dit pas « Si j'<i>aurais</i> su », mais « Si j'<i>avais</i> su, je ne serais pas venu » : à <i>si</i> + imparfait répond le conditionnel.</p><p>Cette <b>concordance</b> est la clé d'un récit limpide : le lecteur sait toujours où il se trouve dans le temps.</p>" },
  { chap:'IV — La subordination', illus:DOLLS, cap:'Les idées s\'emboîtent comme des poupées russes.', html:"<p>Les idées s'<b>emboîtent</b> les unes dans les autres. Une proposition <b>principale</b> peut contenir une <b>subordonnée</b> qui la complète : « Je sais [que tu viendras]. » La <b>relative</b> précise un nom (« le livre <i>que je lis</i> ») ; la <b>conjonctive</b> complète le verbe (« je crois <i>qu'il pleut</i> »).</p>" },
  { chap:'V — La cohérence du texte', html:"<p>Un texte tient debout grâce à ses <b>connecteurs logiques</b> : <i>d'abord, ensuite, car, pourtant, donc</i>. Ce sont les chevilles qui assemblent les idées en un raisonnement solide. Sans eux, des phrases justes restent un tas de briques ; avec eux, elles deviennent un mur.</p>" },
  { chap:'V — La cohérence du texte', illus:SCROLL, cap:'Clément Marot et sa règle de 1538.', html:"<p><b>Le saviez-vous ?</b> La fameuse règle de l'accord du participe passé — « les pommes que j'ai <i>mangées</i> » — fut fixée en <b>1538</b> par le poète <b>Clément Marot</b>, qui l'emprunta à l'italien. Il l'enferma même dans un petit poème pour qu'on la retienne : « <i>Le terme qui va devant / Volontiers régit le suivant.</i> » Une règle vieille de près de cinq siècles, qui fait encore trébucher les meilleurs !</p>" },
  { chap:'V — Clôture', illus:GEAR, cap:'Quatrième pouvoir reconquis.', html:"<p>Te voici au bout du quatrième tome. Tu sais bâtir une phrase d'aplomb, choisir le mode et le temps justes, accorder les temps, emboîter les subordonnées et lier les idées. La <b>Précision</b> est tienne. Souviens-toi : une phrase juste est une arme que nul ne peut retourner contre toi — et c'est précisément ce que {villain} ne sait pas tordre.</p>" },
 ];
}

function _colBook5Pages(){
 const MASK='<svg viewBox="0 0 150 88" width="100%"><path d="M30 24 q22 -6 22 18 q0 24 -22 30 q-22 -6 -22 -30 q0 -24 22 -18 Z" fill="#534AB7"/><circle cx="23" cy="40" r="2" fill="#fff"/><circle cx="37" cy="40" r="2" fill="#fff"/><path d="M22 54 q8 8 16 0" fill="none" stroke="#fff" stroke-width="2"/><path d="M100 24 q22 -6 22 18 q0 24 -22 30 q-22 -6 -22 -30 q0 -24 22 -18 Z" fill="#3C3489"/><circle cx="93" cy="40" r="2" fill="#fff"/><circle cx="107" cy="40" r="2" fill="#fff"/><path d="M92 58 q8 -8 16 0" fill="none" stroke="#fff" stroke-width="2"/><path d="M75 6 l2.4 7 7 0 -5.7 4.4 2.2 7 -5.9 -4.4 -5.9 4.4 2.2 -7 -5.7 -4.4 7 0 Z" fill="#e0c84a"/></svg>';
 const ALEX='<svg viewBox="0 0 175 64" width="100%"><g fill="#534AB7"><circle cx="14" cy="34" r="4"/><circle cx="26" cy="34" r="4"/><circle cx="38" cy="34" r="4"/><circle cx="50" cy="34" r="4"/><circle cx="62" cy="34" r="4"/><circle cx="74" cy="34" r="4"/><circle cx="100" cy="34" r="4"/><circle cx="112" cy="34" r="4"/><circle cx="124" cy="34" r="4"/><circle cx="136" cy="34" r="4"/><circle cx="148" cy="34" r="4"/><circle cx="160" cy="34" r="4"/></g><line x1="87" y1="22" x2="87" y2="46" stroke="#534AB7" stroke-width="1.4" stroke-dasharray="3 3"/><text x="87" y="16" text-anchor="middle" font-family="Georgia,serif" font-size="8" fill="#3C3489">césure</text><text x="44" y="58" text-anchor="middle" font-family="Georgia,serif" font-size="8" fill="#3C3489">6 syllabes</text><text x="130" y="58" text-anchor="middle" font-family="Georgia,serif" font-size="8" fill="#3C3489">6 syllabes</text></svg>';
 const THEA='<svg viewBox="0 0 160 84" width="100%"><rect x="14" y="16" width="132" height="58" rx="3" fill="#2a2456"/><path d="M14 16 q22 30 0 58 Z" fill="#7a2a3a"/><path d="M146 16 q-22 30 0 58 Z" fill="#7a2a3a"/><path d="M70 34 q10 -4 20 0 q0 20 -10 26 q-10 -6 -10 -26 Z" fill="#e0d6f5"/><circle cx="76" cy="46" r="1.7" fill="#2a2456"/><circle cx="84" cy="46" r="1.7" fill="#2a2456"/><path d="M75 56 q5 4 10 0" fill="none" stroke="#2a2456" stroke-width="1.4"/></svg>';
 const PLUME='<svg viewBox="0 0 160 84" width="100%"><rect x="28" y="22" width="86" height="50" rx="2" fill="#EFE2BE" stroke="#B79A63"/><text x="71" y="42" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="700" font-style="italic" fill="#3C3489">J\'accuse</text><g stroke="#9a7b45" stroke-width="0.8"><line x1="38" y1="50" x2="104" y2="50"/><line x1="38" y1="58" x2="98" y2="58"/><line x1="38" y1="66" x2="104" y2="66"/></g><path d="M118 20 L140 4" stroke="#3C3489" stroke-width="3" stroke-linecap="round"/><path d="M136 2 l7 -2 -1 8 Z" fill="#534AB7"/></svg>';
 return [
  { chap:'Frontispice', illus:MASK, cap:'Le masque et l\'étoile — le pouvoir d\'Imaginaire.', html:"<p><i>Quand les mots ne se contentent plus de dire le monde, mais en inventent d'autres, naît la littérature.</i></p><p>Ce dernier livre-monde est une galerie de miroirs où vivent tous les genres : le conte, la poésie, le théâtre, le roman, l'écrit qui s'engage. Traverse-les, et tu tiendras l'<b>Imaginaire</b> : le pouvoir de faire rêver, d'émouvoir et de créer.</p>" },
  { chap:'I — Le conte & le merveilleux', html:"<p>Le <b>conte</b> est sans doute le plus ancien des récits : on se le transmettait, le soir, de bouche à oreille. Il obéit à des lois secrètes — un héros, une épreuve, des aides et des obstacles, une fin qui répare le tort.</p><p>En <b>1697</b>, <b>Charles Perrault</b> mit par écrit ces histoires dans ses <i>Contes de ma mère l'Oye</i> : la Belle au bois dormant, le Petit Chaperon rouge, Cendrillon. Le conte accueille le <b>merveilleux</b> — fées, ogres, citrouilles changées en carrosses — sans jamais s'en étonner.</p>" },
  { chap:'II — La poésie & le lyrisme', illus:ALEX, cap:'L\'alexandrin : douze syllabes, une césure au milieu.', html:"<p>La <b>poésie</b> fait chanter la langue. Elle compte les syllabes, marie les sons par la <b>rime</b> et donne au vers un rythme. Le plus noble des vers français est l'<b>alexandrin</b> : douze syllabes, partagées en leur milieu par une pause appelée la <b>césure</b>.</p>" },
  { chap:'II — La poésie & le lyrisme', html:"<p>Quand le poète dit « je » et chante ses émotions — l'amour, le chagrin, l'émerveillement —, on parle de <b>lyrisme</b>, du nom de la <i>lyre</i>, l'instrument des poètes de la Grèce antique. La poésie n'explique pas le monde : elle le fait ressentir. Là où le tyran voudrait une langue plate, le poète prouve qu'un mot peut faire pleurer ou sourire.</p>" },
  { chap:'III — Le théâtre', illus:THEA, cap:'La scène, les rideaux, le masque.', html:"<p>Le <b>théâtre</b> ne se lit pas seulement : il se <b>joue</b>. Des comédiens incarnent les personnages, en chair et en voix, devant un public. On distingue la <b>comédie</b>, qui fait rire pour corriger les travers des hommes, et la <b>tragédie</b>, qui inspire la terreur et la pitié devant un destin trop grand.</p>" },
  { chap:'III — Le théâtre', html:"<p><b>Une fin digne d'une pièce.</b> Le 17 février 1673, <b>Molière</b> jouait Argan, le faux malade du <i>Malade imaginaire</i>. Pris d'un malaise pendant la représentation, il acheva pourtant la pièce — puis mourut chez lui quelques heures plus tard. La légende dit qu'il s'éteignit « sur scène » : la vérité est à peine moins théâtrale, car le plus grand de nos auteurs comiques rendit l'âme en jouant un homme qui se croyait mourant.</p>" },
  { chap:'IV — Le roman & le réalisme', html:"<p>Le <b>roman</b> est le genre de la liberté : en prose, sans contrainte de vers ni de scène, il peut tout raconter. Au XIXe siècle, des écrivains voulurent y peindre la société entière, sans rien embellir : c'est le <b>réalisme</b>.</p><p><b>Balzac</b> rêva d'une <i>Comédie humaine</i> où reparaîtraient les mêmes personnages, de livre en livre ; <b>Zola</b> descendit au fond des mines pour écrire <i>Germinal</i>. Le romancier devient l'œil de son époque.</p>" },
  { chap:'V — La littérature engagée', illus:PLUME, cap:'Quand la plume devient une arme.', html:"<p>Parfois, l'écrivain prend les armes — mais ses armes sont des mots. C'est la <b>littérature engagée</b> : mettre son talent au service d'une cause, et dresser sa plume contre l'injustice. <b>Voltaire</b> défendit les victimes de l'erreur judiciaire ; <b>Victor Hugo</b> plaida pour les misérables et contre la peine de mort.</p>" },
  { chap:'V — La littérature engagée', html:"<p><b>« J'accuse… ! »</b> Le 13 janvier 1898, dans le journal <i>L'Aurore</i>, <b>Émile Zola</b> publia une lettre ouverte pour défendre <b>Alfred Dreyfus</b>, un officier injustement condamné. Le titre fit le tour du pays ; un seul article obligea toute une nation à regarder la vérité en face. Voilà ce que peut un écrivain : par la seule force des mots, ébranler les puissants.</p>" },
  { chap:'V — Clôture', illus:MASK, cap:'Cinquième pouvoir reconquis.', html:"<p>Te voici au bout du cinquième et dernier livre-monde. Tu connais le conte et son merveilleux, la poésie et son chant, le théâtre et ses masques, le roman et son regard, et l'écrit qui combat. L'<b>Imaginaire</b> est tien. Cinq pouvoirs reconquis ! Il ne te reste qu'à rentrer à Monotonia — car ces mots, désormais, tu vas devoir les rendre à tout un peuple. Le <b>Réveil</b> approche.</p>" },
 ];
}

// ── Symbole de pouvoir (unité, réutilisé tranche + couverture) ──────────
function _colSymbol(i,cx,cy,s,col){
 const g='<g transform="translate('+cx+' '+cy+') scale('+s+')" fill="none" stroke="'+col+'" stroke-linecap="round">';
 if(i===0) return g+'<circle cx="0" cy="-8" r="4.5" stroke-width="1.3"/><circle cx="0" cy="-8" r="1.5" fill="'+col+'"/><line x1="0" y1="-3.5" x2="0" y2="9" stroke-width="1.7"/><line x1="0" y1="3" x2="4.2" y2="3" stroke-width="1.4"/><line x1="0" y1="6" x2="4.2" y2="6" stroke-width="1.4"/><path d="M0 9 C-4 12 -5 13 -7 15" stroke-width="1.1"/><path d="M0 9 C4 12 5 13 7 15" stroke-width="1.1"/></g>';
 if(i===1) return g+'<polygon points="0,-9 9,8 -9,8" stroke-width="1.4"/><line x1="-13" y1="-1" x2="-3" y2="-1" stroke-width="1.1"/><line x1="3" y1="-3" x2="13" y2="-7" stroke-width="1.1"/><line x1="3" y1="1" x2="13" y2="3" stroke-width="1.1"/><line x1="3" y1="5" x2="12" y2="11" stroke-width="1.1"/></g>';
 if(i===2) return g+'<path d="M0 10 C-7 3 6 -3 0 -12 C9 -3 7 4 0 10 Z" stroke-width="1.5"/></g>';
 if(i===3) return g+'<circle cx="0" cy="0" r="8" stroke-width="1.5"/><circle cx="0" cy="0" r="2.6" fill="'+col+'"/><line x1="0" y1="-11" x2="0" y2="-8" stroke-width="1.5"/><line x1="0" y1="8" x2="0" y2="11" stroke-width="1.5"/><line x1="-11" y1="0" x2="-8" y2="0" stroke-width="1.5"/><line x1="8" y1="0" x2="11" y2="0" stroke-width="1.5"/><line x1="-7.8" y1="-7.8" x2="-5.7" y2="-5.7" stroke-width="1.5"/><line x1="7.8" y1="7.8" x2="5.7" y2="5.7" stroke-width="1.5"/><line x1="-7.8" y1="7.8" x2="-5.7" y2="5.7" stroke-width="1.5"/><line x1="7.8" y1="-7.8" x2="5.7" y2="-5.7" stroke-width="1.5"/></g>';
 if(i===4) return g+'<path d="M0 -11 l3 7.5 8 0 -6.5 5 2.5 7.7 -7 -4.8 -7 4.8 2.5 -7.7 -6.5 -5 8 0 Z" stroke-width="1.3"/></g>';
 if(i===5) return g+'<path d="M-9 6 a9 9 0 0 1 18 0" stroke-width="1.6"/><line x1="-13" y1="6" x2="13" y2="6" stroke-width="1.3"/><line x1="0" y1="-9" x2="0" y2="-5" stroke-width="1.2"/><line x1="-8" y1="-5" x2="-5.5" y2="-2.5" stroke-width="1.2"/><line x1="8" y1="-5" x2="5.5" y2="-2.5" stroke-width="1.2"/></g>';
 return g+'<path d="M-6 8 L-6 -8 L6 -8 L6 8" stroke-width="1.4"/><circle cx="-6" cy="-9.5" r="1.6" fill="'+col+'"/><circle cx="6" cy="-9.5" r="1.6" fill="'+col+'"/><path d="M0 -5 l2.6 2.6 -2.6 2.6 -2.6 -2.6 Z" fill="'+col+'"/><line x1="-8.5" y1="2" x2="8.5" y2="2" stroke-width="1.4"/><line x1="-8.5" y1="2" x2="-8.5" y2="8" stroke-width="1.4"/><line x1="8.5" y1="2" x2="8.5" y2="8" stroke-width="1.4"/><line x1="-9.5" y1="8" x2="9.5" y2="8" stroke-width="1.3"/><line x1="-11.5" y1="11" x2="11.5" y2="11" stroke-width="1.3"/></g>';
}
function _colLock(cx,y,c){ return '<rect x="'+(cx-4).toFixed(1)+'" y="'+(y).toFixed(1)+'" width="8" height="6.5" rx="1.4" fill="none" stroke="'+c+'" stroke-width="1.1"/><path d="M'+(cx-2.4).toFixed(1)+' '+(y).toFixed(1)+' v-1.8 a2.4 2.4 0 0 1 4.8 0 v1.8" fill="none" stroke="'+c+'" stroke-width="1.1"/>'; }
function _wrapTitle(t,max){ max=max||14; const w=String(t).split(' '); const lines=[]; let cur=''; for(let k=0;k<w.length;k++){ const x=w[k]; if((cur+' '+x).trim().length>max && cur){ lines.push(cur); cur=x; } else { cur=(cur?cur+' ':'')+x; } } if(cur) lines.push(cur); return lines.slice(0,3); }

// ── Grande couverture (1re page) et dos de couverture (dernière page) ────
function _colCoverSvg(book,idx){
 const acc=book.accent||'#9E4326', dk=book.dark||'#5a2718', gold=book.gold||'#E0B24F', gly=book.gold?'#e7e7ef':'#F4DCA0';
 const lines=_wrapTitle(book.title,14);
 const ty=(lines.length>=3?96:104);
 let title=''; for(let k=0;k<lines.length;k++){ title+='<text x="180" y="'+(ty+k*23)+'" text-anchor="middle" font-family="Georgia,serif" font-size="17" letter-spacing="0.6" font-weight="700" fill="'+gold+'">'+lines[k]+'</text>'; }
 const ruleY=ty+lines.length*23-8;
 const bottom=book.bonus?'Bonus':('Tome '+(book.roman||''));
 return '<svg viewBox="0 0 360 470" width="100%" style="max-width:300px;display:block;margin:0 auto" role="img" aria-label="Couverture : '+book.title+'">'
  +'<ellipse cx="186" cy="424" rx="132" ry="16" fill="#000000" opacity="0.16"/>'
  +'<polygon points="285,56 297,68 297,410 285,398" fill="#EFE3C4"/>'
  +'<polygon points="75,398 87,410 297,410 285,398" fill="#D6C49A"/>'
  +'<rect x="75" y="56" width="210" height="342" rx="6" fill="'+acc+'"/>'
  +'<rect x="75" y="56" width="13" height="342" rx="5" fill="#000000" opacity="0.20"/>'
  +'<rect x="77" y="58" width="206" height="5" fill="#FFFFFF" opacity="0.13"/>'
  +'<rect x="91" y="70" width="178" height="314" rx="4" fill="none" stroke="'+gold+'" stroke-width="2.6"/>'
  +'<rect x="97" y="76" width="166" height="302" rx="3" fill="none" stroke="'+gold+'" stroke-width="1"/>'
  +'<g fill="'+gold+'"><path d="M91 70 h16 v3 h-13 v13 h-3 z"/><path d="M269 70 h-16 v3 h13 v13 h3 z"/><path d="M91 384 h16 v-3 h-13 v-13 h-3 z"/><path d="M269 384 h-16 v-3 h13 v-13 h3 z"/></g>'
  +title
  +'<line x1="135" y1="'+ruleY+'" x2="225" y2="'+ruleY+'" stroke="'+gold+'" stroke-width="1"/>'
  +'<circle cx="180" cy="244" r="56" fill="none" stroke="'+gold+'" stroke-width="6"/>'
  +'<circle cx="180" cy="244" r="48" fill="'+dk+'"/>'
  +_colSymbol(idx,180,244,3.7,gly)
  +'<text x="180" y="360" text-anchor="middle" font-family="Georgia,serif" font-size="14" letter-spacing="3.5" font-weight="700" fill="'+gold+'">'+bottom+'</text>'
  +'</svg>';
}
function _colBackCoverSvg(book,idx){
 const acc=book.accent||'#9E4326', dk=book.dark||'#5a2718', gold=book.gold||'#E0B24F', gly=book.gold?'#e7e7ef':'#F4DCA0';
 const quote=book.bonus?'« Les mots reviennent toujours. »':(book.power?('Pouvoir : '+book.power):'La Bibliothèque infinie');
 return '<svg viewBox="0 0 360 470" width="100%" style="max-width:300px;display:block;margin:0 auto" role="img" aria-label="Dos de couverture : '+book.title+'">'
  +'<ellipse cx="186" cy="424" rx="132" ry="16" fill="#000000" opacity="0.16"/>'
  +'<rect x="75" y="56" width="210" height="342" rx="6" fill="'+acc+'"/>'
  +'<rect x="75" y="56" width="13" height="342" rx="5" fill="#000000" opacity="0.20"/>'
  +'<rect x="91" y="70" width="178" height="314" rx="4" fill="none" stroke="'+gold+'" stroke-width="2"/>'
  +'<circle cx="180" cy="150" r="34" fill="'+dk+'"/><circle cx="180" cy="150" r="34" fill="none" stroke="'+gold+'" stroke-width="3"/>'
  +_colSymbol(idx,180,150,2.1,gly)
  +'<text x="180" y="252" text-anchor="middle" font-family="Georgia,serif" font-size="12" font-style="italic" fill="'+gold+'">'+quote+'</text>'
  +'<text x="180" y="356" text-anchor="middle" font-family="Georgia,serif" font-size="11" letter-spacing="2" fill="'+gold+'">La Bibliothèque infinie</text>'
  +'</svg>';
}

// ── Lecteur de livre : couverture → double page enluminée → dos ─────────
function _resolveBookPages(book){
 let ps=book.pages;
 if(!ps && book.bookTale && typeof _COL_STORY_FR!=='undefined' && _COL_STORY_FR.bookTale) ps=_COL_STORY_FR.bookTale.pages;
 ps=ps||[];
 return ps.map(function(p){ return { chap:p.chap||'', html:p.html||p.text||'', illus:p.illus||'', cap:p.cap||'' }; });
}
function _openColBook(idx){
 try{
  const book=(typeof _COL_BOOKS_FR!=='undefined'?_COL_BOOKS_FR:[])[idx];
  if(!book) return;
  const pages=_resolveBookPages(book);
  if(!pages.length) return;
  if(typeof closeAdventureLog==='function') closeAdventureLog();
  setTimeout(function(){ _renderColBook(book,idx,pages); },300);
 }catch(e){}
}
function _renderColBook(book,idx,pages){
 const acc=book.accent||'#9E4326', gold=book.gold||'#C79A3A';
 const S=Math.ceil(pages.length/2), total=S+2;
 let step=0;
 const ov=document.createElement('div'); ov.className='story-overlay';
 function close(){ ov.classList.add('story-out'); setTimeout(function(){try{ov.remove();}catch(e){}},300); }
 function _heroName(){ try{ return (typeof P!=='undefined'&&P&&P.name)?String(P.name):'le Porteur de Mots'; }catch(e){ return 'le Porteur de Mots'; } }
 function _fill(s){ try{ s=String(s||''); const h=_heroName().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); return s.replace(/\{hero\}/g,'<b>'+h+'</b>').replace(/\{villain\}/g,(typeof _COL_VILLAIN_FR!=='undefined'?_COL_VILLAIN_FR:'le Chancelier')); }catch(e){ return s; } }
 function half(p,isLeft){
  if(!p) return '<div style="border:2px solid '+gold+';border-radius:3px;padding:2px;height:100%;"><div style="border:1px solid '+gold+';border-radius:2px;min-height:240px;"></div></div>';
  let body=_fill(p.html||'');
  if(isLeft && /^<p>/.test(body)) body=body.replace(/^<p>\s*(.)/,'<p><span style="float:left;font-family:Georgia,serif;font-size:44px;line-height:.74;font-weight:700;color:'+acc+';padding:2px 8px 0 0;">$1</span>');
  const illus=p.illus?'<div style="background:#e7d7ae;border:1px solid #c9b486;border-radius:4px;padding:7px;margin-bottom:8px;">'+p.illus+(p.cap?'<div style="font-family:Georgia,serif;font-style:italic;font-size:11px;color:#6b5638;text-align:center;margin-top:3px;">'+p.cap+'</div>':'')+'</div>':'';
  return '<div style="border:2px solid '+gold+';border-radius:3px;padding:2px;height:100%;"><div style="border:1px solid '+gold+';border-radius:2px;padding:13px;min-height:240px;">'+illus+'<div style="font-family:Georgia,serif;font-size:13px;line-height:1.65;color:#3A2A18;text-align:justify;">'+body+'</div></div></div>';
 }
 function render(){
  let inner='';
  if(step===0){ inner='<div style="text-align:center;">'+_colCoverSvg(book,idx)+'<div style="font-family:Georgia,serif;font-size:12px;color:#8a6a45;margin-top:8px;">Touche « Feuilleter » pour ouvrir le livre.</div></div>'; }
  else if(step===total-1){ inner='<div style="text-align:center;">'+_colBackCoverSvg(book,idx)+'<div style="font-family:Georgia,serif;font-size:12px;color:#8a6a45;margin-top:8px;">Fin.</div></div>'; }
  else {
   const li=(step-1)*2, L=pages[li], R=pages[li+1];
   const chap=(L&&L.chap)||(R&&R.chap)||'';
   inner='<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;border-bottom:1px solid #d8c79c;padding-bottom:6px;margin-bottom:10px;">'
    +'<span style="font-family:Georgia,serif;font-weight:700;color:'+acc+';font-size:1.0em;">'+book.title+'</span>'
    +'<span style="font-family:Georgia,serif;font-size:.76em;color:#8a6a45;">'+chap+'</span></div>'
    +'<div style="position:relative;display:grid;grid-template-columns:1fr 1fr;gap:0;background:#EBDFBF;border-radius:5px;overflow:hidden;">'
    +'<div style="background:linear-gradient(90deg,#F3E8CD,#ECE0C2 86%,#DCCBA0);padding:13px 13px 13px 15px;">'+half(L,true)+'</div>'
    +'<div style="background:linear-gradient(90deg,#DCCBA0,#ECE0C2 14%,#F3E8CD);padding:13px 15px 13px 13px;">'+half(R,false)+'</div>'
    +'<div style="position:absolute;top:0;bottom:0;left:50%;width:18px;transform:translateX(-50%);background:linear-gradient(90deg,rgba(0,0,0,0),rgba(90,60,30,.20) 50%,rgba(0,0,0,0));pointer-events:none;"></div>'
    +'</div>';
  }
  const prevLbl=step===total-1?'‹ Pages':'‹ Précédent';
  const nextLbl=step===0?'Feuilleter ›':(step===total-1?'Fermer le livre':'Suivant ›');
  let counter; if(step===0) counter='Couverture'; else if(step===total-1) counter='Dos de couverture'; else { const a=(step-1)*2+1, b=Math.min(a+1,pages.length); counter=(a===b?('page '+a):('pages '+a+'–'+b))+' / '+pages.length; }
  ov.innerHTML='<div class="story-parchment" style="max-width:'+((step===0||step===total-1)?'360':'600')+'px;border-top:6px solid '+acc+';">'
   +inner
   +'<div class="story-nav">'
   +(step>0?'<button class="story-btn cb-prev">'+prevLbl+'</button>':'<span class="story-spacer"></span>')
   +'<div class="story-dots" style="flex-wrap:wrap;max-width:58%;">'+Array.apply(null,{length:total}).map(function(_,i){return '<span class="story-dot'+(i===step?' on':'')+'"></span>';}).join('')+'</div>'
   +'<button class="story-btn cb-next">'+nextLbl+'</button>'
   +'</div>'
   +'<div style="text-align:center;font-family:Georgia,serif;font-size:.76em;color:#8a6a45;margin-top:4px;">'+counter+'</div>'
   +'</div>';
  const nx=ov.querySelector('.cb-next'); if(nx) nx.onclick=function(){ if(step<total-1){step++;render();} else close(); };
  const pv=ov.querySelector('.cb-prev'); if(pv) pv.onclick=function(){ if(step>0){step--;render();} };
  if(typeof beep==='function'){ try{ beep(520,'sine',.09,.04); }catch(e){} }
 }
 render(); document.body.appendChild(ov);
}

// ── Carnet collège FR : La Bibliothèque infinie (7 tranches 3D) ─────────
function _advLibraryHtml(){
 const seen=(typeof P!=='undefined'&&P&&P.storySeen)||[];
 const books=(typeof _COL_BOOKS_FR!=='undefined')?_COL_BOOKS_FR:[];
 const reg=['cp','ce1','ce2','cm1','cm2'];
 const unlocked=function(i){ if(i<5) return _regionConquered(reg[i]); if(i===5) return seen.indexOf('colfr_booktale')>=0; return seen.indexOf('colfr_c_titan')>=0; };
 const N=books.length||7;
 const nUn=books.reduce(function(a,b,i){return a+(unlocked(i)?1:0);},0);
 const bw=22, gap=2.2, totalW=N*bw+(N-1)*gap, x0=(200-totalW)/2;
 let spines='';
 for(let i=0;i<N;i++){
  const b=books[i]||{}; const on=unlocked(i); const x=x0+i*(bw+gap), cx=x+bw/2;
  const col=on?(b.accent||'#9E4326'):'#615d57';
  const dk=on?(b.dark||'#3a1c10'):'#46433e';
  const gold=on?(b.gold||'#E0B24F'):'#8a857d';
  const gly=on?(b.gold?'#dcdce4':'#f0d68a'):'#8a857d';
  const click=on?(' onclick="_openColBook('+i+')" style="cursor:pointer" role="button" tabindex="0" title="Lire : '+(b.title||'')+'"'):'';
  spines+='<g'+click+'>'
   +'<polygon points="'+x.toFixed(1)+',24 '+(x+3).toFixed(1)+',21 '+(x+bw+3).toFixed(1)+',21 '+(x+bw).toFixed(1)+',24" fill="'+dk+'"/>'
   +'<polygon points="'+(x+bw).toFixed(1)+',24 '+(x+bw+3).toFixed(1)+',21 '+(x+bw+3).toFixed(1)+',127 '+(x+bw).toFixed(1)+',130" fill="'+dk+'"/>'
   +'<rect x="'+x.toFixed(1)+'" y="24" width="'+bw+'" height="106" rx="2" fill="'+col+'"/>'
   +'<rect x="'+(x+1.5).toFixed(1)+'" y="26" width="2" height="102" fill="#ffffff" opacity="0.10"/>'
   +'<rect x="'+(x+2).toFixed(1)+'" y="33" width="'+(bw-4)+'" height="2" fill="'+gold+'"/><rect x="'+(x+2).toFixed(1)+'" y="119" width="'+(bw-4)+'" height="2" fill="'+gold+'"/>'
   +'<text x="'+cx.toFixed(1)+'" y="52" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="7" fill="'+gly+'" transform="rotate(-90 '+cx.toFixed(1)+' 52)">'+(b.short||b.roman||(i+1))+'</text>'
   +(on?_colSymbol(i,cx,80,0.5,gly):_colLock(cx,77,'#cfcabf'))
   +'<circle cx="'+cx.toFixed(1)+'" cy="108" r="8" fill="'+dk+'"/><circle cx="'+cx.toFixed(1)+'" cy="108" r="8" fill="none" stroke="'+gold+'" stroke-width="1.4"/>'
   +'<text x="'+cx.toFixed(1)+'" y="108" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="'+(b.roman?8:9)+'" font-weight="700" fill="'+gly+'">'+(b.roman||'✦')+'</text>'
   +'</g>';
 }
 const shelf='<rect x="6" y="130" width="188" height="9" rx="2" fill="#5a4126"/><rect x="6" y="130" width="188" height="3" fill="#7a5a34"/><rect x="6" y="20" width="188" height="4" rx="2" fill="#3c2c18"/>';
 const msg=nUn>0?'Touche un tome débloqué pour le feuilleter.':"Conquiers les îlots : chaque tome rejoindra ta bibliothèque.";
 return ''
  +'<div class="advlog-section-title">📚 La Bibliothèque infinie</div>'
  +'<div class="advcol-box advcol-mat">'
  +' <svg viewBox="0 0 200 150" class="advcol-svg" aria-label="Bibliothèque : '+nUn+' livres sur '+N+'">'
  +'  '+shelf+spines
  +' </svg>'
  +' <div class="advcol-caption">'+msg+' <b>'+nUn+' / '+N+'</b></div>'
  +'</div>';
}

// ── Livre VII (Bonus) : « L'Antre du Chancelier » ──────────────────────
function _colBook7Pages(){
 const THRONE='<svg viewBox="0 0 150 96" width="100%"><g fill="none" stroke="#4a4856" stroke-width="2" stroke-linecap="round"><path d="M58 70 L58 30 L92 30 L92 70"/><path d="M52 70 L98 70"/><path d="M52 70 L52 82 M98 70 L98 82"/><path d="M44 82 L106 82 M36 90 L114 90"/></g><circle cx="58" cy="27" r="3.5" fill="#6a6878"/><circle cx="92" cy="27" r="3.5" fill="#6a6878"/><path d="M75 42 l5 5 -5 5 -5 -5 Z" fill="#7a6bb0"/></svg>';
 const STELES='<svg viewBox="0 0 160 80" width="100%"><g fill="#d8cdb6" stroke="#9a8f78" stroke-width="1"><path d="M14 74 V40 a8 8 0 0 1 16 0 V74 Z"/><path d="M42 74 V44 a8 8 0 0 1 16 0 V74 Z"/><path d="M70 74 V38 a8 8 0 0 1 16 0 V74 Z"/><path d="M98 74 V46 a8 8 0 0 1 16 0 V74 Z"/><path d="M126 74 V42 a8 8 0 0 1 16 0 V74 Z"/></g><g stroke="#9a8f78" stroke-width="1"><line x1="18" y1="52" x2="26" y2="60"/><line x1="26" y1="52" x2="18" y2="60"/><line x1="74" y1="50" x2="82" y2="58"/><line x1="82" y1="50" x2="74" y2="58"/><line x1="130" y1="54" x2="138" y2="62"/><line x1="138" y1="54" x2="130" y2="62"/></g></svg>';
 return [
  { chap:'L\'Antre du Chancelier', illus:THRONE, cap:'Le trône de cendre, au cœur du Palais.', html:"<p>Ce tome ne figurait sur aucune carte. Il raconte ce qui advint derrière les portes closes du <b>Palais de Cendre</b>, le jour où {hero} y pénétra seul pour affronter {villain}.</p>" },
  { chap:'Le Palais de Cendre', html:"<p>Le palais ne brûlait pas. Il ne brillait pas. Il était gris — d'un gris qui avait oublié jusqu'au souvenir des couleurs. Nulle garde aux portes : à quoi bon défendre un lieu que plus aucun mot ne savait nommer ?</p>" },
  { chap:'La galerie des mots morts', illus:STELES, cap:'Les mots que le Chancelier fit taire.', html:"<p>Une longue galerie menait au trône. De part et d'autre, dressées comme des stèles, veillaient les mots que le Chancelier avait fait taire : <i>liberté</i>, <i>peut-être</i>, <i>autrefois</i>, <i>ensemble</i>, <i>demain</i>. Chacun gravé, puis soigneusement raturé.</p>" },
  { chap:'Le trône', html:"<p>Au bout l'attendait un homme petit, gris, presque ordinaire — rien d'un monstre. « Te voilà, dit {villain} avec un demi-sourire. Le fameux Porteur de Mots. Je l'avoue : je t'imaginais plus grand. »</p>" },
  { chap:'La joute de verbe', html:"<p>Il leva la main et lança son dernier sort : un grand charabia où les sons s'entrechoquaient sans plus rien vouloir dire, un brouillard où nul ne pouvait se comprendre. Mais {hero} répondit par des mots justes, et chacun perça le brouillard comme une lame perce la brume.</p>" },
  { chap:'Pourquoi ?', html:"<p>« Pourquoi ? demanda {hero}. Pourquoi avoir volé les mots d'un peuple entier ? » Le sourire du vieil homme se fissura. « Parce qu'un peuple qui sait nommer sa peine finit toujours par exiger qu'on y mette fin. Sans les mots, ils étaient… tranquilles. »</p>" },
  { chap:'L\'aveu', html:"<p>« Tranquilles, repris-tu, ou seulement muets ? » Le Chancelier baissa les yeux. Et pour la première fois depuis des années, il prononça, d'une voix qui tremblait, les deux mots qu'il s'était toujours interdits : « <b>J'avais peur.</b> »</p>" },
  { chap:'La chute', html:"<p>Au-dehors, la foule scandait des mots qu'elle venait de réapprendre. Aucun mur, aucun trône ne tient contre une langue rendue au peuple. Le siège de cendre s'effondra, et {villain} avec lui — vaincu non par la force, mais par le <b>sens</b>.</p>" },
  { chap:'Épilogue', illus:THRONE, cap:'On posa, sur le trône, un livre ouvert.', html:"<p>On ne détruisit pas le Palais : on en fit la plus grande bibliothèque de <b>Sémantia</b>. Et sur le trône de cendre, désormais, on posa simplement un livre ouvert. Ainsi s'achève l'histoire de l'Antre — et commence celle d'un peuple qui n'aura plus jamais peur de ses propres mots.</p>" },
 ];
}


// ═══════════════════════════════════════════════════════════════════════
// ─── Livres lisibles — Les Chroniques du Temps (histoire primaire) ───────
// Chaque îlot conquis débloque un livre d'époque complet (texte vérifié,
// illustrations, anecdotes). Un 6e livre bonus (Les Grandes Inventions de
// l'Humanité) se débloque après l'épilogue. Réutilise le lecteur générique
// (_colCoverSvg/_colBackCoverSvg/_colSymbol/_colLock/_wrapTitle), déjà
// indépendant de toute matière.
// ═══════════════════════════════════════════════════════════════════════
function _histBook1Pages(){
 const FLAME='<svg viewBox="0 0 120 96" width="100%"><path d="M60 8 C40 34 30 46 30 62 a30 30 0 0 0 60 0 C90 46 80 34 60 8 Z" fill="#e0762a" stroke="#8a3a10" stroke-width="2"/><path d="M60 30 C50 46 44 54 44 64 a16 16 0 0 0 32 0 C76 54 70 46 60 30 Z" fill="#f4c14a"/></svg>';
 const SILEX='<svg viewBox="0 0 130 80" width="100%"><polygon points="20,60 45,18 78,26 100,58 62,72" fill="#8a8378" stroke="#4a453e" stroke-width="2"/><line x1="45" y1="18" x2="62" y2="72" stroke="#4a453e" stroke-width="1.2"/><line x1="78" y1="26" x2="62" y2="72" stroke="#4a453e" stroke-width="1.2"/></svg>';
 const CAVE='<svg viewBox="0 0 150 80" width="100%"><rect width="150" height="80" fill="#3a2c1e"/><g fill="none" stroke="#c9a86a" stroke-width="2.4" stroke-linecap="round"><path d="M20 55 q18 -30 40 -6 q10 -18 30 -4 q14 -14 30 4"/></g><circle cx="60" cy="20" r="3" fill="#c9a86a"/><circle cx="95" cy="16" r="3" fill="#c9a86a"/></svg>';
 return [
  { chap:'Frontispice', illus:FLAME, cap:'Le feu, première grande conquête de l\u2019humanité.', html:"<p><i>Avant l\u2019écriture, avant les villes, avant même le langage tel que nous le connaissons : la Préhistoire.</i></p><p>Toi qui viens de traverser cette époque avec {hero}, voici ce que les archéologues savent, vérifié et raconté, sur la vie de nos tout premiers ancêtres.</p>" },
  { chap:'I — La maîtrise du feu', illus:SILEX, cap:'Un silex taillé, premier outil de l\u2019humanité.', html:"<p>Bien avant l\u2019invention de l\u2019écriture, nos ancêtres ont appris à dompter le feu — sans doute d\u2019abord récupéré après un incendie naturel (foudre, éruption volcanique), puis produit volontairement grâce au frottement de deux morceaux de bois ou à la percussion de silex contre de la pyrite. Les traces les plus anciennes d\u2019un usage maîtrisé du feu remontent à environ 400 000 ans, en Europe et au Proche-Orient.</p><p>Le feu a tout changé : il éloignait les grands prédateurs, réchauffait les nuits glaciales, et surtout permettait de cuire la viande — un aliment alors bien plus facile à digérer et à mâcher, qui a probablement contribué à l\u2019évolution du cerveau humain.</p>" },
  { chap:'II — Les outils de pierre', html:"<p>Les premiers outils connus, vieux de plus de 3 millions d\u2019années, étaient de simples galets cassés pour obtenir un tranchant. Peu à peu, les techniques se sont affinées : le biface, taillé sur ses deux faces, est devenu un véritable couteau suisse préhistorique, utilisé pour dépecer le gibier, travailler le bois ou racler les peaux.</p><p><b>Anecdote.</b> Certains silex taillés retrouvés par les archéologues proviennent de gisements situés à plus de 200 kilomètres du lieu où ils ont été découverts. Cela prouve que nos ancêtres échangeaient déjà des matériaux entre groupes, sur de très longues distances — une forme de commerce préhistorique !</p>" },
  { chap:'III — La chasse et la cueillette', html:"<p>Les hommes et femmes de la Préhistoire ne cultivaient pas encore la terre : ils se nourrissaient de ce que la nature offrait. La chasse au gros gibier — mammouths, rennes, bisons — se faisait en groupe, avec des sagaies et des pièges, souvent en poussant les animaux vers un ravin ou une zone marécageuse. La cueillette de baies, racines et plantes complétait le régime alimentaire, et demandait une connaissance très fine du territoire.</p>" },
  { chap:'IV — L\u2019art des grottes', illus:CAVE, cap:'Chevaux peints à la lueur d\u2019une lampe à graisse.', html:"<p>Il y a environ 36 000 ans, des artistes sont entrés dans des grottes profondes — comme celle de Chauvet en France — pour peindre des chevaux, des lions ou des rhinocéros laineux sur les parois, à la lueur de simples lampes à graisse. Personne ne sait avec certitude pourquoi ces peintures ont été réalisées : rituel, transmission du savoir sur les animaux, ou simplement l\u2019envie de créer.</p><p><b>Anecdote.</b> Les peintres préhistoriques utilisaient parfois le relief naturel de la roche pour donner du volume à leurs animaux — un bombement de pierre devenait l\u2019épaule d\u2019un bison. Une technique artistique déjà pleine d\u2019ingéniosité !</p>" },
  { chap:'V — L\u2019habitat', html:"<p>Contrairement à une idée reçue, tous les hommes préhistoriques ne vivaient pas dans des grottes : beaucoup construisaient des abris en bois, en peaux ou en os de mammouth, notamment dans les régions sans relief rocheux. Les grottes et abris sous roche, eux, étaient surtout utilisés comme refuges temporaires ou lieux rituels.</p>" },
  { chap:'VI — Les débuts de la parure', html:"<p>Colliers de coquillages, dents percées, perles d\u2019ivoire : dès cette époque très ancienne, les humains cherchaient déjà à se parer. Ces objets, retrouvés parfois à des centaines de kilomètres de la mer, montrent l\u2019existence d\u2019échanges entre groupes — et peut-être déjà, une forme de mode !</p>" },
  { chap:'Clôture', illus:FLAME, cap:'Rouage du Feu Sacré : premier trésor de l\u2019odyssée.', html:"<p>Voilà pour la Préhistoire : l\u2019aube de l\u2019humanité, patiente et ingénieuse, qui a posé — silex après silex, feu après feu — les toutes premières pierres de tout ce qui allait suivre.</p>" },
 ];
}
function _histBook2Pages(){
 const PYRAMID='<svg viewBox="0 0 130 90" width="100%"><polygon points="65,10 118,78 12,78" fill="#d9b45a" stroke="#8a6a1e" stroke-width="2"/><line x1="65" y1="10" x2="65" y2="78" stroke="#8a6a1e" stroke-width="1.2"/><line x1="40" y1="78" x2="65" y2="34" stroke="#8a6a1e" stroke-width="1"/></svg>';
 const ANKH='<svg viewBox="0 0 90 120" width="100%"><ellipse cx="45" cy="26" rx="18" ry="24" fill="none" stroke="#1d6e56" stroke-width="6"/><line x1="45" y1="50" x2="45" y2="108" stroke="#1d6e56" stroke-width="7"/><line x1="18" y1="70" x2="72" y2="70" stroke="#1d6e56" stroke-width="7"/></svg>';
 return [
  { chap:'Frontispice', illus:PYRAMID, cap:'La grande pyramide de Gizeh, tombeau de Khéops.', html:"<p><i>Le pays du Nil, où les pierres défient encore les millénaires.</i></p><p>Toi qui viens de traverser l\u2019Égypte antique avec {hero}, voici ce que les historiens savent, vérifié et raconté, sur cette grande civilisation.</p>" },
  { chap:'I — Le don du Nil', html:"<p>L\u2019Égypte antique doit tout à son fleuve. Chaque année, la crue du Nil déposait sur ses rives un limon fertile qui permettait aux paysans de cultiver blé et orge en abondance. Les Égyptiens avaient même développé un calendrier basé sur ce cycle : la saison de la crue, celle des semailles, puis celle des récoltes.</p>" },
  { chap:'II — Les pyramides, tombeaux des pharaons', html:"<p>Les pyramides n\u2019étaient pas de simples monuments : c\u2019étaient des tombeaux destinés à protéger le corps du pharaon et à l\u2019aider dans son voyage vers l\u2019au-delà. La grande pyramide de Khéops, à Gizeh, culmine à environ 146 mètres à l\u2019origine et a nécessité l\u2019assemblage de plus de 2 millions de blocs de pierre.</p><p><b>Anecdote.</b> Les ouvriers qui ont construit les pyramides n\u2019étaient pas des esclaves, contrairement à une idée très répandue — les archéologues ont retrouvé leurs villages, avec des preuves qu\u2019ils étaient nourris, soignés, et même enterrés avec honneur à proximité du chantier.</p>" },
  { chap:'III — L\u2019écriture des hiéroglyphes', illus:ANKH, cap:'L\u2019ânkh, symbole égyptien de la vie.', html:"<p>Les Égyptiens ont inventé un système d\u2019écriture fait de petits dessins, les hiéroglyphes, utilisés pour les textes religieux et royaux, tandis qu\u2019une écriture plus rapide et simplifiée (le hiératique) servait à la vie quotidienne. Pendant des siècles, plus personne ne savait lire les hiéroglyphes — jusqu\u2019à ce qu\u2019un savant français, Jean-François Champollion, parvienne à les déchiffrer en 1822, grâce à la pierre de Rosette.</p>" },
  { chap:'IV — La momification', html:"<p>Les Égyptiens croyaient que l\u2019âme avait besoin d\u2019un corps intact pour survivre dans l\u2019au-delà. Le processus de momification pouvait durer 70 jours : les organes étaient retirés (sauf le cœur, jugé essentiel), le corps était séché avec du natron, un sel naturel, puis enveloppé de bandelettes de lin.</p><p><b>Anecdote.</b> Les Égyptiens momifiaient aussi leurs animaux ! Des millions de chats momifiés ont été retrouvés, offerts en offrande à la déesse Bastet, protectrice des foyers.</p>" },
  { chap:'V — Pharaons et dieux', html:"<p>Le pharaon était considéré comme un dieu vivant sur Terre, intermédiaire entre les hommes et les nombreuses divinités égyptiennes : Rê le dieu-soleil, Osiris le dieu des morts, Isis la déesse protectrice. Parmi les pharaons les plus célèbres figurent Khéops, bâtisseur de la grande pyramide, et Ramsès II, qui régna près de 66 ans.</p>" },
  { chap:'VI — La vie sur le Nil', html:"<p>Le fleuve servait aussi de route principale : les Égyptiens y naviguaient en barques de roseaux ou de bois pour transporter marchandises, blocs de pierre et voyageurs. La pêche complétait l\u2019alimentation, avec le poisson du Nil comme ressource essentielle.</p>" },
  { chap:'Clôture', illus:PYRAMID, cap:'Rouage des Bâtisseurs : deuxième trésor de l\u2019odyssée.', html:"<p>Voilà pour l\u2019Égypte antique : un peuple bâtisseur, tourné vers l\u2019éternité, dont les monuments dialoguent encore avec le ciel, quatre mille ans plus tard.</p>" },
 ];
}
function _histBook3Pages(){
 const COLUMN='<svg viewBox="0 0 120 100" width="100%"><rect x="20" y="12" width="80" height="8" fill="#c9a86a"/><rect x="30" y="20" width="10" height="60" fill="#e7d7ae"/><rect x="55" y="20" width="10" height="60" fill="#e7d7ae"/><rect x="80" y="20" width="10" height="60" fill="#e7d7ae"/><rect x="18" y="80" width="84" height="8" fill="#c9a86a"/></svg>';
 const CHARIOT='<svg viewBox="0 0 140 80" width="100%"><circle cx="42" cy="58" r="16" fill="none" stroke="#7a4a1e" stroke-width="4"/><circle cx="42" cy="58" r="3" fill="#7a4a1e"/><path d="M42 42 L90 30 L110 46" fill="none" stroke="#7a4a1e" stroke-width="4" stroke-linecap="round"/><path d="M90 30 L96 12" stroke="#7a4a1e" stroke-width="4" stroke-linecap="round"/></svg>';
 return [
  { chap:'Frontispice', illus:COLUMN, cap:'Colonnes d\u2019un temple romain.', html:"<p><i>De la ville sur le Tibre à l\u2019empire le plus vaste du monde antique.</i></p><p>Toi qui viens de traverser Rome antique avec {hero}, voici ce que les historiens savent, vérifié et raconté, sur cette civilisation.</p>" },
  { chap:'I — De la ville à l\u2019empire', html:"<p>Selon la légende, Rome aurait été fondée en 753 avant J.-C. par Romulus. En réalité, la ville s\u2019est développée progressivement sur les bords du Tibre, avant de devenir, siècle après siècle, la capitale d\u2019un immense empire s\u2019étendant de la Grande-Bretagne à l\u2019Égypte.</p>" },
  { chap:'II — Les légionnaires', html:"<p>L\u2019armée romaine, très organisée, était composée de légions de plusieurs milliers de soldats, équipés de bouclier rectangulaire (le scutum), de glaive court et de cuirasse segmentée. Les légionnaires construisaient chaque soir un camp fortifié, même en plein territoire ennemi — une discipline qui a fait la force de Rome.</p>" },
  { chap:'III — Le Colisée et les jeux', illus:CHARIOT, cap:'Un char de course au Circus Maximus.', html:"<p>Inauguré en l\u2019an 80, le Colisée pouvait accueillir environ 50 000 spectateurs venus assister à des combats de gladiateurs, des chasses d\u2019animaux exotiques, voire des reconstitutions de batailles navales grâce à un système d\u2019inondation du sol de l\u2019arène.</p><p><b>Anecdote.</b> Le Circus Maximus, dédié aux courses de chars, pouvait accueillir jusqu\u2019à 150 000 spectateurs — bien plus que le Colisée ! Les meilleurs cochers, comme le célèbre Dioclès, devenaient de véritables stars, adulées par toute la ville.</p>" },
  { chap:'IV — Les routes et les aqueducs', html:"<p>Les Romains sont restés célèbres pour leurs prouesses d\u2019ingénierie : plus de 80 000 kilomètres de routes pavées reliaient l\u2019ensemble de l\u2019empire, tandis que des aqueducs, parfois longs de plusieurs dizaines de kilomètres, acheminaient l\u2019eau potable jusqu\u2019aux villes et alimentaient thermes et fontaines.</p>" },
  { chap:'V — La vie quotidienne', html:"<p>Les Romains riches vivaient dans des villas décorées de mosaïques et de fresques, avec l\u2019eau courante et parfois même un chauffage par le sol (l\u2019hypocauste). Le peuple, lui, logeait souvent dans des immeubles de plusieurs étages appelés insulae, parfois peu solides et sujets aux incendies.</p>" },
  { chap:'VI — Jules César et Auguste', html:"<p>Jules César, brillant général, a conquis la Gaule mais n\u2019a jamais été empereur : il fut assassiné en 44 avant J.-C. par des sénateurs craignant qu\u2019il ne prenne trop de pouvoir. C\u2019est son neveu adoptif, Auguste, qui devint en 27 avant J.-C. le tout premier empereur romain, inaugurant plusieurs siècles de « Pax Romana », une longue période de paix relative.</p>" },
  { chap:'Clôture', illus:COLUMN, cap:'Rouage du Cirque : troisième trésor de l\u2019odyssée.', html:"<p>Voilà pour Rome antique : de la loi aux routes en passant par les arènes, un empire qui a bâti en pierre ce qu\u2019il pensait éternel — et qui, sur bien des points, avait raison.</p>" },
 ];
}
function _histBook4Pages(){
 const CASTLE='<svg viewBox="0 0 140 90" width="100%"><rect x="20" y="34" width="100" height="50" fill="#7a6a52"/><rect x="20" y="20" width="16" height="18" fill="#7a6a52"/><rect x="62" y="14" width="16" height="24" fill="#7a6a52"/><rect x="104" y="20" width="16" height="18" fill="#7a6a52"/><rect x="52" y="56" width="36" height="28" fill="#3a2c1e"/><path d="M52 56 L70 40 L88 56 Z" fill="#4a3a26"/></svg>';
 const SWORD='<svg viewBox="0 0 60 130" width="100%"><rect x="26" y="10" width="8" height="72" fill="#c9c9d0"/><rect x="14" y="82" width="32" height="8" fill="#8a6a1e"/><rect x="26" y="90" width="8" height="30" fill="#5a3a1e"/><circle cx="30" cy="124" r="7" fill="#8a6a1e"/></svg>';
 return [
  { chap:'Frontispice', illus:CASTLE, cap:'Un château fort et ses défenses.', html:"<p><i>Chevaliers, cathédrales et châteaux forts : mille ans d\u2019histoire européenne.</i></p><p>Toi qui viens de traverser le Moyen Âge avec {hero}, voici ce que les historiens savent, vérifié et raconté, sur cette longue période.</p>" },
  { chap:'I — Le château fort', html:"<p>Construits sur des points stratégiques (colline, boucle de rivière), les châteaux forts protégeaient seigneurs et paysans en cas d\u2019attaque : douves, pont-levis, herse, chemin de ronde et donjon formaient un système défensif redoutable pour l\u2019époque. En temps de paix, le château était surtout le centre administratif et économique de tout un territoire.</p>" },
  { chap:'II — Devenir chevalier', illus:SWORD, cap:'L\u2019épée, remise le jour de l\u2019adoubement.', html:"<p>Un jeune noble devenait chevalier après un long apprentissage : page dès 7 ans, puis écuyer au service d\u2019un chevalier confirmé, avant d\u2019être enfin adoubé vers 18-21 ans, lors d\u2019une cérémonie où on lui remettait ses armes. Le chevalier devait suivre un code d\u2019honneur : protéger les faibles, être loyal envers son seigneur, faire preuve de courage.</p><p><b>Anecdote.</b> Les tournois, combats amicaux entre chevaliers, attiraient des foules immenses — un peu comme les matchs de sport aujourd\u2019hui. Certains chevaliers en tiraient une véritable célébrité, et parfois une fortune grâce aux prix remportés !</p>" },
  { chap:'III — La vie des paysans', html:"<p>La grande majorité de la population du Moyen Âge vivait à la campagne. Les paysans, souvent appelés serfs, travaillaient les terres du seigneur en échange de sa protection, et devaient lui verser une partie de leurs récoltes. Les famines et les épidémies, comme la terrible peste noire du milieu du XIVe siècle, pouvaient décimer des villages entiers.</p>" },
  { chap:'IV — Les cathédrales', html:"<p>Les cathédrales gothiques, avec leurs voûtes vertigineuses et leurs vitraux colorés, pouvaient nécessiter plusieurs générations de travaux pour être achevées. Notre-Dame de Paris, commencée en 1163, n\u2019a été terminée qu\u2019au XIVe siècle ! Les moines copistes, dans les monastères, recopiaient patiemment les livres à la main, préservant ainsi de nombreux textes anciens.</p>" },
  { chap:'V — Jeanne d\u2019Arc et la guerre de Cent Ans', html:"<p>La guerre de Cent Ans (1337-1453, soit en réalité 116 ans) opposa la France et l\u2019Angleterre pour le contrôle du royaume de France. En 1429, une jeune paysanne de 17 ans, Jeanne d\u2019Arc, convainquit le futur roi Charles VII de lui confier une armée : elle parvint à lever le siège d\u2019Orléans, un tournant décisif de la guerre, avant d\u2019être capturée puis exécutée en 1431.</p><p><b>Anecdote.</b> Jeanne d\u2019Arc ne combattait pas directement au premier rang comme une simple soldate — son rôle était surtout de porter l\u2019étendard et de redonner courage aux troupes, ce qui n\u2019enlève rien à son courage exceptionnel face au danger.</p>" },
  { chap:'VI — Une société d\u2019ordres', html:"<p>La société médiévale était traditionnellement divisée en trois ordres : ceux qui prient (le clergé), ceux qui combattent (la noblesse) et ceux qui travaillent (le peuple, très majoritaire). Cette organisation, bien que présentée comme immuable, connaissait en réalité de nombreuses nuances selon les régions et les époques.</p>" },
  { chap:'Clôture', illus:CASTLE, cap:'Rouage du Siège : quatrième trésor de l\u2019odyssée.', html:"<p>Voilà pour le Moyen Âge : mille ans souvent réduits à quelques clichés, mais en réalité riches de foi, de savoir et de courage — celui d\u2019Orléans comme celui de tant d\u2019anonymes.</p>" },
 ];
}
function _histBook5Pages(){
 const EIFFEL='<svg viewBox="0 0 90 130" width="100%"><path d="M45 8 L20 120 L38 120 L45 60 L52 120 L70 120 Z" fill="none" stroke="#6a5a3a" stroke-width="3" stroke-linejoin="round"/><line x1="26" y1="90" x2="64" y2="90" stroke="#6a5a3a" stroke-width="2"/><line x1="30" y1="60" x2="60" y2="60" stroke="#6a5a3a" stroke-width="2"/></svg>';
 const GEAR='<svg viewBox="0 0 100 100" width="100%"><circle cx="50" cy="50" r="26" fill="none" stroke="#8a6a1e" stroke-width="8"/><circle cx="50" cy="50" r="10" fill="#8a6a1e"/><g stroke="#8a6a1e" stroke-width="8"><line x1="50" y1="8" x2="50" y2="20"/><line x1="50" y1="80" x2="50" y2="92"/><line x1="8" y1="50" x2="20" y2="50"/><line x1="80" y1="50" x2="92" y2="50"/></g></svg>';
 return [
  { chap:'Frontispice', illus:EIFFEL, cap:'La tour Eiffel, symbole du progrès de 1889.', html:"<p><i>Révolution, machines à vapeur et grandes inventions : le siècle qui a précipité le monde vers aujourd\u2019hui.</i></p><p>Toi qui viens de traverser les Temps modernes avec {hero}, voici ce que les historiens savent, vérifié et raconté, sur cette période.</p>" },
  { chap:'I — L\u2019Exposition universelle de 1889', html:"<p>Organisée à Paris pour célébrer le centenaire de la Révolution française, l\u2019Exposition universelle de 1889 a accueilli plus de 32 millions de visiteurs. Son symbole, la tour Eiffel, culminait alors à 312 mètres — la structure la plus haute du monde à l\u2019époque, un exploit d\u2019ingénierie signé Gustave Eiffel.</p><p><b>Anecdote.</b> La tour Eiffel a été très critiquée avant sa construction ! Un groupe d\u2019artistes et d\u2019écrivains célèbres avait même signé une pétition la qualifiant de « monstrueuse » et « inutile ». Elle ne devait rester debout que 20 ans — mais son utilité pour les transmissions radio lui a finalement sauvé la vie.</p>" },
  { chap:'II — La révolution industrielle', illus:GEAR, cap:'Le rouage, symbole de l\u2019ère industrielle.', html:"<p>Au XIXe siècle, l\u2019invention de la machine à vapeur a transformé l\u2019industrie et les transports : les usines se sont multipliées, les trains à vapeur ont permis de relier des villes entières en quelques heures là où il fallait auparavant plusieurs jours. Ce bouleversement a aussi entraîné l\u2019exode de nombreuses familles des campagnes vers les villes, à la recherche de travail.</p>" },
  { chap:'III — Liberté, égalité, fraternité', html:"<p>La Révolution française de 1789 a profondément transformé la société : la prise de la Bastille, le 14 juillet, en est devenue le symbole. Le peuple réclamait la fin des privilèges de la noblesse et davantage d\u2019égalité. C\u2019est de cette période que datent la devise républicaine et l\u2019hymne national, la Marseillaise.</p>" },
  { chap:'IV — Napoléon et l\u2019Empire', html:"<p>Napoléon Bonaparte, brillant général de la Révolution, s\u2019est fait sacrer empereur des Français en 1804 — un sacre, et non une élection au sens moderne du terme. Son règne a profondément modernisé la France (Code civil, nouvelles administrations) tout en la plongeant dans de nombreuses guerres à travers l\u2019Europe.</p>" },
  { chap:'V — Les grandes inventions du siècle', html:"<p>Le XIXe siècle a vu se multiplier les innovations : le chemin de fer, le télégraphe électrique, puis l\u2019ampoule électrique et le téléphone à la toute fin du siècle. La photographie, inventée dans les années 1830, a permis pour la première fois de fixer durablement une image du réel.</p>" },
  { chap:'VI — Vers la démocratie', html:"<p>Le suffrage universel masculin, permettant à tous les hommes adultes de voter, s\u2019est progressivement installé en France au cours du XIXe siècle. Il faudra cependant attendre 1944 pour que les femmes obtiennent enfin, elles aussi, le droit de vote.</p>" },
  { chap:'Clôture', illus:EIFFEL, cap:'Rouage du Progrès : cinquième et dernier trésor de l\u2019odyssée.', html:"<p>Voilà pour les Temps modernes : un siècle de bouleversements où la vapeur, l\u2019électricité et la démocratie ont commencé à dessiner le monde que tu connais aujourd\u2019hui.</p>" },
 ];
}
function _histBook6Pages(){
 const BULB='<svg viewBox="0 0 90 120" width="100%"><circle cx="45" cy="46" r="34" fill="#f4e0a0" stroke="#c9a020" stroke-width="3"/><rect x="34" y="76" width="22" height="14" fill="#9a9a9a"/><rect x="36" y="92" width="18" height="8" fill="#7a7a7a"/><line x1="45" y1="24" x2="45" y2="68" stroke="#c9a020" stroke-width="2"/></svg>';
 const WHEEL='<svg viewBox="0 0 100 100" width="100%"><circle cx="50" cy="50" r="36" fill="none" stroke="#7a4a1e" stroke-width="6"/><circle cx="50" cy="50" r="6" fill="#7a4a1e"/><g stroke="#7a4a1e" stroke-width="4"><line x1="50" y1="18" x2="50" y2="82"/><line x1="18" y1="50" x2="82" y2="50"/><line x1="27" y1="27" x2="73" y2="73"/><line x1="73" y1="27" x2="27" y2="73"/></g></svg>';
 return [
  { chap:'Frontispice', illus:BULB, cap:'Livre bonus — débloqué à la fin de l\u2019odyssée.', html:"<p><i>Ce livre ne raconte pas une seule époque : il traverse toute l\u2019Histoire de l\u2019humanité, invention après invention.</i></p><p>Bravo {hero} ! Ta montre-boussole a retrouvé son aiguille. En guise de dernier trésor, voici les plus grandes inventions qui ont jalonné l\u2019histoire humaine, vérifiées et racontées.</p>" },
  { chap:'I — Le feu et la roue', illus:WHEEL, cap:'La roue, inventée pour la poterie avant le transport.', html:"<p>Il y a plus de 400 000 ans, nos ancêtres apprennent à contrôler le feu. Il y a environ 5 500 ans en Mésopotamie, une autre invention change tout : la roue — d\u2019abord utilisée pour la poterie, sous forme de tour de potier, avant d\u2019être fixée à des essieux pour créer les premiers chariots.</p><p><b>Anecdote.</b> Certaines civilisations d\u2019Amérique précolombienne connaissaient le principe de la roue — on en a retrouvé sur de petits jouets — mais ne l\u2019ont jamais utilisée pour le transport, faute d\u2019animaux de trait adaptés.</p>" },
  { chap:'II — L\u2019écriture et la boussole', html:"<p>Vers 3300 avant J.-C., les Sumériens de Mésopotamie inventent l\u2019écriture cunéiforme, d\u2019abord pour tenir des comptes de récoltes. L\u2019écriture marque, pour les historiens, la fin de la Préhistoire. Bien plus tard, il y a environ 2 000 ans, la Chine invente la boussole, utilisant à l\u2019origine une pierre magnétique naturelle flottant sur l\u2019eau pour indiquer le sud.</p>" },
  { chap:'III — L\u2019imprimerie', html:"<p>Vers 1450, l\u2019Allemand Johannes Gutenberg met au point une presse à caractères mobiles en métal, permettant d\u2019imprimer des livres bien plus rapidement qu\u2019à la main.</p><p><b>Anecdote.</b> La fameuse Bible de Gutenberg ne comptait qu\u2019environ 180 exemplaires — il en subsiste aujourd\u2019hui une cinquantaine à travers le monde, considérés comme des trésors inestimables.</p>" },
  { chap:'IV — La machine à vapeur et l\u2019électricité', html:"<p>Perfectionnée par l\u2019ingénieur écossais James Watt à la fin du XVIIIe siècle, la machine à vapeur devient le moteur de la révolution industrielle. Un siècle plus tard, en 1879, l\u2019Américain Thomas Edison met au point une ampoule à incandescence capable de briller plusieurs heures durant.</p><p><b>Anecdote.</b> Edison et son équipe auraient testé plus de 6 000 matériaux différents avant de trouver le filament de carbone capable de tenir suffisamment longtemps dans une ampoule !</p>" },
  { chap:'V — Le téléphone et l\u2019avion', html:"<p>En 1876, l\u2019inventeur écossais Alexander Graham Bell dépose le brevet du téléphone. Le 17 décembre 1903, les frères américains Wilbur et Orville Wright parviennent à faire décoller le Flyer, pour un vol de seulement 12 secondes et 36 mètres — la toute première fois qu\u2019une machine motorisée transporte un homme dans les airs de façon contrôlée.</p>" },
  { chap:'VI — L\u2019ordinateur et Internet', html:"<p>Les tout premiers ordinateurs, dans les années 1940, occupaient des salles entières. L\u2019invention du transistor en 1947, puis du microprocesseur en 1971, a permis de réduire un ordinateur à la taille d\u2019une puce électronique. Ce n\u2019est qu\u2019avec l\u2019invention du World Wide Web par Tim Berners-Lee, en 1989, qu\u2019Internet devient accessible à tous.</p><p><b>Anecdote.</b> Le mot anglais « bug », utilisé pour désigner une erreur informatique, viendrait d\u2019un authentique insecte retrouvé coincé dans les circuits d\u2019un des tout premiers ordinateurs américains en 1947 !</p>" },
  { chap:'Clôture', illus:BULB, cap:'Fin des Chroniques du Temps.', html:"<p>Du silex à l\u2019ordinateur, chaque invention est un rouage de plus dans le grand mécanisme de l\u2019Histoire — exactement comme {hero}, Noé et Gaspard ont assemblé, rouage après rouage, l\u2019aiguille de fortune de grand-père Isidore.</p>" },
 ];
}
const _HIST_BOOKS = [
 { roman:'I',   short:'Préhist.',  region:'cp',  accent:'#6B4A2A', accent2:'#8A6438', dark:'#402A18', title:'La Préhistoire',           power:'Rouage du Feu Sacré',    ready:true, pages: _histBook1Pages() },
 { roman:'II',  short:'Égypte',    region:'ce1', accent:'#9E7A1E', accent2:'#C79A3A', dark:'#5a4712', title:'L\u2019Égypte antique',    power:'Rouage des Bâtisseurs',  ready:true, pages: _histBook2Pages() },
 { roman:'III', short:'Rome',      region:'ce2', accent:'#8B2E1E', accent2:'#B0432D', dark:'#521a10', title:'Rome antique',             power:'Rouage du Cirque',       ready:true, pages: _histBook3Pages() },
 { roman:'IV',  short:'Moy. Âge',  region:'cm1', accent:'#3C4A5C', accent2:'#526A82', dark:'#232c38', title:'Le Moyen Âge',             power:'Rouage du Siège',        ready:true, pages: _histBook4Pages() },
 { roman:'V',   short:'Modernes',  region:'cm2', accent:'#2E5C4A', accent2:'#3E7C62', dark:'#1a3529', title:'Les Temps modernes',       power:'Rouage du Progrès',      ready:true, pages: _histBook5Pages() },
 { roman:'',    short:'Bonus',     region:'final', accent:'#7A5C1E', accent2:'#A47F2E', dark:'#4a3812', gold:'#f4e0a0', title:'Les Grandes Inventions de l\u2019Humanité', power:'', ready:true, bonus:true, pages: _histBook6Pages() },
];
function _resolveHistBookPages(book){
 return (book && book.pages || []).map(function(p){ return { chap:p.chap||'', html:p.html||p.text||'', illus:p.illus||'', cap:p.cap||'' }; });
}
function _openHistBook(idx){
 try{
  const book=(typeof _HIST_BOOKS!=='undefined'?_HIST_BOOKS:[])[idx];
  if(!book) return;
  const pages=_resolveHistBookPages(book);
  if(!pages.length) return;
  if(typeof closeAdventureLog==='function') closeAdventureLog();
  setTimeout(function(){ _renderHistBook(book,idx,pages); },300);
 }catch(e){}
}
function _renderHistBook(book,idx,pages){
 const acc=book.accent||'#6B4A2A', gold=book.gold||'#C79A3A';
 const S=Math.ceil(pages.length/2), total=S+2;
 let step=0;
 const ov=document.createElement('div'); ov.className='story-overlay';
 function close(){ ov.classList.add('story-out'); setTimeout(function(){try{ov.remove();}catch(e){}},300); }
 function _heroName(){ try{ return (typeof P!=='undefined'&&P&&P.name)?String(P.name):'le Voyageur du Temps'; }catch(e){ return 'le Voyageur du Temps'; } }
 function _fill(s){ try{ s=String(s||''); const h=_heroName().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); return s.replace(/\{hero\}/g,'<b>'+h+'</b>').replace(/\{villain\}/g,(typeof _PRIM_VILLAIN_HIST!=='undefined'?_PRIM_VILLAIN_HIST:'L\u2019Horloger')); }catch(e){ return s; } }
 function half(p,isLeft){
  if(!p) return '<div style="border:2px solid '+gold+';border-radius:3px;padding:2px;height:100%;"><div style="border:1px solid '+gold+';border-radius:2px;min-height:240px;"></div></div>';
  let body=_fill(p.html||'');
  if(isLeft && /^<p>/.test(body)) body=body.replace(/^<p>\s*(.)/,'<p><span style="float:left;font-family:Georgia,serif;font-size:44px;line-height:.74;font-weight:700;color:'+acc+';padding:2px 8px 0 0;">$1</span>');
  const illus=p.illus?'<div style="background:#e7d7ae;border:1px solid #c9b486;border-radius:4px;padding:7px;margin-bottom:8px;">'+p.illus+(p.cap?'<div style="font-family:Georgia,serif;font-style:italic;font-size:11px;color:#6b5638;text-align:center;margin-top:3px;">'+p.cap+'</div>':'')+'</div>':'';
  return '<div style="border:2px solid '+gold+';border-radius:3px;padding:2px;height:100%;"><div style="border:1px solid '+gold+';border-radius:2px;padding:13px;min-height:240px;">'+illus+'<div style="font-family:Georgia,serif;font-size:13px;line-height:1.65;color:#3A2A18;text-align:justify;">'+body+'</div></div></div>';
 }
 function render(){
  let inner='';
  if(step===0){ inner='<div style="text-align:center;">'+_colCoverSvg(book,idx)+'<div style="font-family:Georgia,serif;font-size:12px;color:#8a6a45;margin-top:8px;">Touche « Feuilleter » pour ouvrir le livre.</div></div>'; }
  else if(step===total-1){ inner='<div style="text-align:center;">'+_colBackCoverSvg(book,idx)+'<div style="font-family:Georgia,serif;font-size:12px;color:#8a6a45;margin-top:8px;">Fin.</div></div>'; }
  else {
   const li=(step-1)*2, L=pages[li], R=pages[li+1];
   const chap=(L&&L.chap)||(R&&R.chap)||'';
   inner='<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;border-bottom:1px solid #d8c79c;padding-bottom:6px;margin-bottom:10px;">'
    +'<span style="font-family:Georgia,serif;font-weight:700;color:'+acc+';font-size:1.0em;">'+book.title+'</span>'
    +'<span style="font-family:Georgia,serif;font-size:.76em;color:#8a6a45;">'+chap+'</span></div>'
    +'<div style="position:relative;display:grid;grid-template-columns:1fr 1fr;gap:0;background:#EBDFBF;border-radius:5px;overflow:hidden;">'
    +'<div style="background:linear-gradient(90deg,#F3E8CD,#ECE0C2 86%,#DCCBA0);padding:13px 13px 13px 15px;">'+half(L,true)+'</div>'
    +'<div style="background:linear-gradient(90deg,#DCCBA0,#ECE0C2 14%,#F3E8CD);padding:13px 15px 13px 13px;">'+half(R,false)+'</div>'
    +'<div style="position:absolute;top:0;bottom:0;left:50%;width:18px;transform:translateX(-50%);background:linear-gradient(90deg,rgba(0,0,0,0),rgba(90,60,30,.20) 50%,rgba(0,0,0,0));pointer-events:none;"></div>'
    +'</div>';
  }
  const prevLbl=step===total-1?'‹ Pages':'‹ Précédent';
  const nextLbl=step===0?'Feuilleter ›':(step===total-1?'Fermer le livre':'Suivant ›');
  let counter; if(step===0) counter='Couverture'; else if(step===total-1) counter='Dos de couverture'; else { const a=(step-1)*2+1, b=Math.min(a+1,pages.length); counter=(a===b?('page '+a):('pages '+a+'–'+b))+' / '+pages.length; }
  ov.innerHTML='<div class="story-parchment" style="max-width:'+((step===0||step===total-1)?'360':'600')+'px;border-top:6px solid '+acc+';">'
   +inner
   +'<div class="story-nav">'
   +(step>0?'<button class="story-btn cb-prev">'+prevLbl+'</button>':'<span class="story-spacer"></span>')
   +'<div class="story-dots" style="flex-wrap:wrap;max-width:58%;">'+Array.apply(null,{length:total}).map(function(_,i){return '<span class="story-dot'+(i===step?' on':'')+'"></span>';}).join('')+'</div>'
   +'<button class="story-btn cb-next">'+nextLbl+'</button>'
   +'</div>'
   +'<div style="text-align:center;font-family:Georgia,serif;font-size:.76em;color:#8a6a45;margin-top:4px;">'+counter+'</div>'
   +'</div>';
  const nx=ov.querySelector('.cb-next'); if(nx) nx.onclick=function(){ if(step<total-1){step++;render();} else close(); };
  const pv=ov.querySelector('.cb-prev'); if(pv) pv.onclick=function(){ if(step>0){step--;render();} };
  if(typeof beep==='function'){ try{ beep(520,'sine',.09,.04); }catch(e){} }
 }
 render(); document.body.appendChild(ov);
}
// ── Carnet histoire primaire : Les Chroniques du Temps (6 tranches 3D) ───
function _advHistLibraryHtml(){
 const seen=(typeof P!=='undefined'&&P&&P.storySeen)||[];
 const books=(typeof _HIST_BOOKS!=='undefined')?_HIST_BOOKS:[];
 const reg=['cp','ce1','ce2','cm1','cm2'];
 const unlocked=function(i){ if(i<5) return _regionConquered(reg[i]); return seen.indexOf('primhist_epilogue')>=0; };
 const N=books.length||6;
 const nUn=books.reduce(function(a,b,i){return a+(unlocked(i)?1:0);},0);
 const bw=26, gap=3, totalW=N*bw+(N-1)*gap, x0=(200-totalW)/2;
 let spines='';
 for(let i=0;i<N;i++){
  const b=books[i]||{}; const on=unlocked(i); const x=x0+i*(bw+gap), cx=x+bw/2;
  const col=on?(b.accent||'#6B4A2A'):'#615d57';
  const dk=on?(b.dark||'#402A18'):'#46433e';
  const gold=on?(b.gold||'#E0B24F'):'#8a857d';
  const gly=on?(b.gold?'#dcdce4':'#f0d68a'):'#8a857d';
  const click=on?(' onclick="_openHistBook('+i+')" style="cursor:pointer" role="button" tabindex="0" title="Lire : '+(b.title||'')+'"'):'';
  spines+='<g'+click+'>'
   +'<polygon points="'+x.toFixed(1)+',24 '+(x+3).toFixed(1)+',21 '+(x+bw+3).toFixed(1)+',21 '+(x+bw).toFixed(1)+',24" fill="'+dk+'"/>'
   +'<polygon points="'+(x+bw).toFixed(1)+',24 '+(x+bw+3).toFixed(1)+',21 '+(x+bw+3).toFixed(1)+',127 '+(x+bw).toFixed(1)+',130" fill="'+dk+'"/>'
   +'<rect x="'+x.toFixed(1)+'" y="24" width="'+bw+'" height="106" rx="2" fill="'+col+'"/>'
   +'<rect x="'+(x+1.5).toFixed(1)+'" y="26" width="2" height="102" fill="#ffffff" opacity="0.10"/>'
   +'<rect x="'+(x+2).toFixed(1)+'" y="33" width="'+(bw-4)+'" height="2" fill="'+gold+'"/><rect x="'+(x+2).toFixed(1)+'" y="119" width="'+(bw-4)+'" height="2" fill="'+gold+'"/>'
   +'<text x="'+cx.toFixed(1)+'" y="52" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="7" fill="'+gly+'" transform="rotate(-90 '+cx.toFixed(1)+' 52)">'+(b.short||b.roman||(i+1))+'</text>'
   +(on?_colSymbol(i,cx,80,0.55,gly):_colLock(cx,77,'#cfcabf'))
   +'<circle cx="'+cx.toFixed(1)+'" cy="108" r="8" fill="'+dk+'"/><circle cx="'+cx.toFixed(1)+'" cy="108" r="8" fill="none" stroke="'+gold+'" stroke-width="1.4"/>'
   +'<text x="'+cx.toFixed(1)+'" y="108" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="'+(b.roman?8:9)+'" font-weight="700" fill="'+gly+'">'+(b.roman||'✦')+'</text>'
   +'</g>';
 }
 const shelf='<rect x="6" y="130" width="188" height="9" rx="2" fill="#5a4126"/><rect x="6" y="130" width="188" height="3" fill="#7a5a34"/><rect x="6" y="20" width="188" height="4" rx="2" fill="#3c2c18"/>';
 const msg=nUn>0?'Touche un tome débloqué pour le feuilleter.':"Conquiers les époques : chaque tome rejoindra ta bibliothèque.";
 return ''
  +'<div class="advlog-section-title">📚 Les Chroniques du Temps</div>'
  +'<div class="advcol-box advcol-mat">'
  +' <svg viewBox="0 0 200 150" class="advcol-svg" aria-label="Chroniques du Temps : '+nUn+' livres sur '+N+'">'
  +'  '+shelf+spines
  +' </svg>'
  +' <div class="advcol-caption">'+msg+' <b>'+nUn+' / '+N+'</b></div>'
  +'</div>';
}
// Affiche une scène narrative (parchemin paginé). onDone() appelé à la fermeture.
// ── Narration chaleureuse du livre (mode Odyssée) ──────────────────────
// Voix de conteur : lente, posée, en privilégiant une voix française
// naturelle/expressive (féminine de préférence).
let _storyUtter = null;
function _pickNarratorVoice(){
 try{
  // Respecte le choix explicite de l'utilisateur (sélecteur de voix)
  if(typeof _frVoice!=='undefined' && _frVoice) return _frVoice;
  const vs = (window.speechSynthesis.getVoices && window.speechSynthesis.getVoices()) || [];
  const fr = vs.filter(v => /fr(-|_)?/i.test(v.lang||''));
  if(!fr.length) return null;
  const prefs = [
   /google.*fran/i,                                   // "Google français" (très naturelle)
   /amélie|amelie|audrey|aurélie|aurelie|virginie|charlotte|léa|lea|marie/i, // conteuses
   /natural|enhanced|premium|neural|siri|eloquence/i, // voix améliorées
   /thomas|nicolas|paul|daniel/i,
  ];
  for(const p of prefs){ const f = fr.find(v => p.test(v.name||'')); if(f) return f; }
  return fr[0];
 }catch(e){ return null; }
}
function _narrateStop(){ try{ window.speechSynthesis.cancel(); }catch(e){} if(typeof _musicDuck==='function') _musicDuck(false); _storyUtter = null; }
function _narratePause(){ try{ if(window.speechSynthesis.speaking && !window.speechSynthesis.paused){ window.speechSynthesis.pause(); if(typeof _musicDuck==='function') _musicDuck(false); } }catch(e){} }
function _narrateStory(rawHtml){
 if(!window.speechSynthesis) return;
 try{
  // Si une lecture est en pause, on reprend simplement.
  if(window.speechSynthesis.paused){ window.speechSynthesis.resume(); return; }
  window.speechSynthesis.cancel();
  // Extraire le texte brut (sans balises) de la page
  const tmp = document.createElement('div'); tmp.innerHTML = _storyText(rawHtml);
  let plain = (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
  if(!plain) return;
  const hum = (typeof _humanizeForSpeech === 'function') ? _humanizeForSpeech(plain) : plain;
  const u = new SpeechSynthesisUtterance(hum);
  u.lang = 'fr-FR';
  u.rate = 0.84;   // posé, comme un conteur
  u.pitch = 1.05;  // chaleureux
  u.volume = 1;
  const v = _pickNarratorVoice(); if(v) u.voice = v;
  if(typeof _musicDuck==='function') _musicDuck(true);
  const _un=function(){ if(typeof _musicDuck==='function') _musicDuck(false); };
  u.onend=_un; u.onerror=_un;
  _storyUtter = u;
  window.speechSynthesis.speak(u);
 }catch(e){ if(typeof _musicDuck==='function') _musicDuck(false); }
}

function _showStoryModal(chapter, onDone){
 if(!chapter || !Array.isArray(chapter.pages) || !chapter.pages.length){ if(onDone) onDone(); return; }
 let page = 0;
 const overlay = document.createElement('div');
 overlay.className = 'story-overlay';
 // v10.3.2 — Lecture enchaînée du chapitre : lit page après page en faisant
 // défiler l'affichage, sans s'arrêter à chaque page (3 niveaux concernés).
 let _readActive = false, _readUtter = null;
 function _bSyncPlay(){ const pl = overlay.querySelector('.snarr-play'); if(pl) pl.classList.toggle('reading', !!_readActive); }
 function _bSpeak(idx){
  if(!window.speechSynthesis){ _readActive=false; return; }
  if(idx >= chapter.pages.length){ _readActive=false; _bSyncPlay(); if(typeof _musicDuck==='function') _musicDuck(false); return; }
  page = idx; render();                                   // défilement visuel synchronisé
  const tmp = document.createElement('div'); tmp.innerHTML = _storyText(chapter.pages[idx].text || '');
  const plain = (tmp.textContent || tmp.innerText || '').replace(/\s+/g,' ').trim();
  if(!plain){ _bSpeak(idx+1); return; }
  const hum = (typeof _humanizeForSpeech==='function') ? _humanizeForSpeech(plain) : plain;
  const u = new SpeechSynthesisUtterance(hum);
  u.lang='fr-FR'; u.rate=0.84; u.pitch=1.05; u.volume=1;
  try{ const v=_pickNarratorVoice(); if(v) u.voice=v; }catch(e){}
  u.onend = ()=>{ if(_readActive && _readUtter===u) _bSpeak(idx+1); else if(typeof _musicDuck==='function') _musicDuck(false); };   // enchaîne la page suivante
  _readUtter = u; _storyUtter = u;
  try{ window.speechSynthesis.speak(u); }catch(e){ _readActive=false; if(typeof _musicDuck==='function') _musicDuck(false); }
 }
 function _bPlay(){
  if(!window.speechSynthesis) return;
  try{ if(window.speechSynthesis.paused){ window.speechSynthesis.resume(); _bSyncPlay(); if(typeof _musicDuck==='function') _musicDuck(true); return; } }catch(e){}
  try{ window.speechSynthesis.cancel(); }catch(e){}
  if(typeof _musicDuck==='function') _musicDuck(true);
  _readActive = true; _bSpeak(page); _bSyncPlay();         // démarre à la page courante puis enchaîne
 }
 function _bPause(){ try{ if(window.speechSynthesis.speaking && !window.speechSynthesis.paused){ window.speechSynthesis.pause(); _bSyncPlay(); if(typeof _musicDuck==='function') _musicDuck(false); } }catch(e){} }
 function _bStop(){ _readActive=false; _readUtter=null; try{ window.speechSynthesis.cancel(); }catch(e){} if(typeof _musicDuck==='function') _musicDuck(false); _bSyncPlay(); }
 function close(){
  _bStop();
  overlay.classList.add('story-out');
  setTimeout(()=>{ try{ overlay.remove(); }catch(e){} if(onDone) onDone(); }, 300);
 }
 function render(){
  const p = chapter.pages[page];
  const last = page >= chapter.pages.length - 1;
  overlay.innerHTML = `
   <div class="story-parchment">
    <div class="story-title">${chapter.title||''}</div>
    <div class="story-emoji">${p.emoji||'📖'}</div>
    <div class="story-text">${_storyText(p.text)}</div>
    <div class="story-narrate">
     <button class="story-audio-btn snarr-play" title="Écouter l'histoire" aria-label="Lecture">▶</button>
     <button class="story-audio-btn snarr-pause" title="Mettre en pause" aria-label="Pause">⏸</button>
     <button class="story-audio-btn snarr-stop" title="Arrêter la lecture" aria-label="Stop">⏹</button>
    </div>
    <div class="story-nav">
     ${page>0?`<button class="story-btn story-prev">‹</button>`:`<span class="story-spacer"></span>`}
     <div class="story-dots">${chapter.pages.map((_,i)=>`<span class="story-dot${i===page?' on':''}"></span>`).join('')}</div>
     <button class="story-btn story-next">${last?'Commencer ! ⚔️':'Suivant ›'}</button>
    </div>
    ${!last?`<button class="story-skip">Passer l'histoire</button>`:''}
   </div>`;
  const nx = overlay.querySelector('.story-next');
  if(nx) nx.onclick = ()=>{ _bStop(); if(!last){ page++; render(); } else close(); };
  const pv = overlay.querySelector('.story-prev');
  if(pv) pv.onclick = ()=>{ _bStop(); if(page>0){ page--; render(); } };
  const sk = overlay.querySelector('.story-skip');
  if(sk) sk.onclick = close;
  const _pl = overlay.querySelector('.snarr-play');  if(_pl){ _pl.onclick = _bPlay; if(_readActive) _pl.classList.add('reading'); }
  const _pa = overlay.querySelector('.snarr-pause'); if(_pa) _pa.onclick = _bPause;
  const _st = overlay.querySelector('.snarr-stop');  if(_st) _st.onclick = _bStop;
  if(!_readActive && typeof beep==='function'){ try{ beep(520,'sine',.12,.05); }catch(e){} }
 }
 render();
 document.body.appendChild(overlay);
}
function _markStorySeen(id){
 if(typeof P==='undefined' || !P) return;
 P.storySeen = P.storySeen || [];
 if(!P.storySeen.includes(id)){
  P.storySeen.push(id);
  if(typeof saveProfile==='function') saveProfile();
 }
}
// Une région est « conquise » quand toutes ses zones sont battues (cohérent avec
// la détection de conquête d'îlot du moteur). Extensible via _ARCH_REGIONS/MAP_ZONES.
// v10.2.0 — Helpers génériques zone↔région (compatibles 3 aventures).
// Les zones des nouvelles aventures portent z.region ; le primaire se résout
// par niveau (+ cas sanctuaire). Toute logique de région DOIT passer par ici.
function _regionOfZone(zone){
 if(!zone) return null;
 if(zone.region) return _ARCH_REGIONS.find(r => r.id === zone.region) || null;
 if(zone.id === 'sanctuaire') return _ARCH_REGIONS.find(r => r.id === 'final') || null;
 return _ARCH_REGIONS.find(r => r.levels.includes(zone.level) && r.id !== 'final') || null;
}
function _zonesOfRegion(regionId){
 const reg = _ARCH_REGIONS.find(r => r.id === regionId);
 if(!reg) return [];
 return MAP_ZONES.filter(z => {
  if(z.region) return z.region === reg.id;
  if(reg.id === 'final') return z.id === 'sanctuaire';
  return reg.levels.includes(z.level) && z.id !== 'sanctuaire';
 });
}
// Dernière région de l'aventure active (porte l'épilogue)
function _lastRegionId(){
 try{ return _ARCH_REGIONS[_ARCH_REGIONS.length-1].id; }catch(e){ return 'final'; }
}

function _regionConquered(regionId){
 try{
  const zones = _zonesOfRegion(regionId);
  if(!zones.length) return false;
  const beaten = (typeof P!=='undefined' && P && P.mapBossBeaten) ? P.mapBossBeaten : [];
  return zones.every(z => beaten.includes(z.id));
 }catch(e){ return false; }
}
// v10.13.6 — Accessibilité d'une zone, avec garde anti-soft-lock : si la zone
// précédente est battue ET qu'on franchit une frontière de région entièrement
// conquise, la 1re zone de la région suivante est TOUJOURS jouable, sans exiger
// le palier d'étoiles (sinon un joueur peu scoreur reste bloqué entre deux îles).
function _zoneReachable(p, beaten, starsTotal){
 // Progression LINÉAIRE : plus de verrou par étoiles. Un lieu est accessible dès que
 // le lieu précédent est réussi ; le 1er lieu d'un nouvel îlot dès que l'îlot précédent
 // est entièrement conquis. Les étoiles ne servent plus qu'à la collection / la boutique.
 try{
  const idx = p.zoneIdx;
  if(idx === 0) return true;
  const prevZone = MAP_ZONES[idx-1];
  if(!prevZone || !beaten.includes(prevZone.id)) return false;
  if(prevZone.region && p.zone.region && prevZone.region !== p.zone.region){
   return _regionConquered(prevZone.region);
  }
  return true;
 }catch(e){ return false; }
}
// Déclencheur principal : prologue, puis victoire de Cristal, puis épilogue, puis chapitre d'entrée.
function _maybeShowStory(){
 if(typeof P==='undefined' || !P) return;
 P.storySeen = P.storySeen || [];
 // 1) Prologue, une seule fois, au tout début
 const _introId = (_STORY.intro && _STORY.intro.id) || 'intro';
 if(!P.storySeen.includes(_introId)){
  _markStorySeen(_introId);
  _showStoryModal(_STORY.intro, null);
  return;
 }
 // 2) Scène de victoire : une région vient d'être conquise et son Cristal n'a pas été célébré
 try{
  for(const r of _ARCH_REGIONS){
   if(r.id === _lastRegionId()) continue;         // la dernière région → épilogue, géré plus bas
   const win = _STORY.victories && _STORY.victories[r.id];
   if(win && !P.storySeen.includes(win.id) && _regionConquered(r.id)){
    _markStorySeen(win.id);
    _showStoryModal(win, null);
    return;
   }
  }
 }catch(e){}
 // 3) Épilogue : le Sanctuaire Final est conquis
 try{
  if(_STORY.epilogue && !P.storySeen.includes(_STORY.epilogue.id) && _regionConquered(_lastRegionId())){
   _markStorySeen(_STORY.epilogue.id);
   // Si l'aventure a une « histoire du Livre » (Histoire B), elle s'enchaîne juste
   // après l'épilogue, en récompense.
   const _after = (_STORY.bookTale) ? (function(){ try{ _markStorySeen(_STORY.bookTale.id); _showStoryModal(_STORY.bookTale, null); }catch(e){} }) : null;
   _showStoryModal(_STORY.epilogue, _after);
   return;
  }
 }catch(e){}
 // 4) Chapitre d'entrée de la région où se trouve l'avatar (si pas encore vu)
 try{
  const avZone = MAP_ZONES.find(z => z.id === _getAvatarZone());
  if(!avZone) return;
  const reg = (typeof _regionOfZone==='function') ? _regionOfZone(avZone) : _ARCH_REGIONS.find(r => r.levels.includes(avZone.level));
  if(!reg) return;
  const chap = _STORY.chapters[reg.id];
  if(chap && !P.storySeen.includes(chap.id)){
   _markStorySeen(chap.id);
   _showStoryModal(chap, null);
  }
 }catch(e){}
}

// ═══════════════════════════════════════════════════════
// v8.7.69 (O5) : JOURNAL DE QUÊTE — relire les chapitres de l'histoire.
// Panneau fixe à droite de la carte (symétrique à la mini-map) + section dans
// le carnet d'aventure. Chaque chapitre est relisable s'il est débloqué (région
// atteinte), verrouillé (🔒) sinon. Extensible : suit _ARCH_REGIONS / _STORY.
// ═══════════════════════════════════════════════════════
let _questUnlockedCache = {};
// Liste ordonnée des entrées du journal : prologue, puis pour chaque région son
// chapitre d'arrivée ET sa victoire de Cristal, enfin l'épilogue. Extensible.
// v10.2.3 — Vocabulaire du livre de quête PAR AVENTURE (les libellés "Cristal",
// "Région" venaient du primaire et s'affichaient aussi en maternelle/collège).
function _questVocab(){
 const adv = (typeof GM!=='undefined' && GM && GM.adventure) || 'prim';
 if(adv==='mat') return { icon:'🌈', lockCollect:'🌈 Couleur à retrouver', collected:'Couleur retrouvée', region:'Île à atteindre', end:'Arc-en-ciel à compléter' };
 if(adv==='matfr') return { icon:'📖', lockCollect:'📖 Page à retrouver', collected:'Page retrouvée', region:'Monde à atteindre', end:'Livre à compléter' };
 if(adv==='primfr') return { icon:'🎖️', lockCollect:'🎖️ District à libérer', collected:'District libéré', region:'District à atteindre', end:'Insigne à compléter' };
 if(adv==='colfr') return { icon:'📚', lockCollect:'📚 Tome à conquérir', collected:'Tome conquis', region:'Livre à atteindre', end:'Bibliothèque à compléter' };
 if(adv==='col') return { icon:'🛡️', lockCollect:'🛡️ Pièce à forger',     collected:'Pièce forgée',    region:'Îlot à atteindre',  end:'Forge finale à débloquer' };
 if(adv==='primhist') return { icon:'⚙️', lockCollect:'⚙️ Rouage à retrouver', collected:'Rouage retrouvé', region:'Époque à atteindre', end:'Mécanisme à assembler' };
 return { icon:'💎', lockCollect:'💎 Cristal à libérer', collected:'Cristal libéré', region:'Région à atteindre', end:'Fin à débloquer' };
}
function _questEntries(){
 const vocab = _questVocab();
 const _introId=(_STORY.intro&&_STORY.intro.id)||'intro';
 const entries = [{ id:_introId, kind:'intro', label:'📜', regionId:null, color:'#c9a86a' }];
 const roman = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
 let i = 0;
 _ARCH_REGIONS.forEach(r => {
  const chap = _STORY.chapters[r.id];
  if(!chap) return;
  const meta = _BIOME_BANNER_META[r.id] || {};
  const col = meta.accent || '#888';
  entries.push({ id:chap.id, kind:'chapter', label:(roman[i]||String(i+1)), regionId:r.id, color:col });
  const win = _STORY.victories && _STORY.victories[r.id];
  if(win) entries.push({ id:win.id, kind:'victory', label:vocab.icon, regionId:r.id, color:col });
  i++;
 });
 if(_STORY.epilogue) entries.push({ id:_STORY.epilogue.id, kind:'epilogue', label:'🏆', regionId:'final', color:'#ffd700' });
 return entries;
}
function _chapterUnlocked(entry, foggedMap){
 const seen = (typeof P!=='undefined' && P && Array.isArray(P.storySeen)) ? P.storySeen : [];
 if(seen.includes(entry.id)) return true;                       // déjà vu → relisable
 if(entry.kind === 'intro')   return !!(foggedMap && _ARCH_REGIONS[0] && !foggedMap[_ARCH_REGIONS[0].id]) || _ARCH_REGIONS.some(function(r){return _regionConquered(r.id);});
 if(entry.kind === 'chapter') return !!(entry.regionId && foggedMap && !foggedMap[entry.regionId]); // région atteinte
 if(entry.kind === 'victory') return _regionConquered(entry.regionId);   // Cristal mérité = région conquise
 if(entry.kind === 'epilogue')return _regionConquered('final');
 return false;
}
function _refreshQuestJournal(foggedMap){
 const q = document.getElementById('quest-body');
 if(!q) return;
 _questUnlockedCache = {};
 const _qv = _questVocab();
 const rows = _questEntries().map(e => {
  const unlocked = _chapterUnlocked(e, foggedMap);
  _questUnlockedCache[e.id] = unlocked;
  const chap = _findChapter(e.id);
  let label;
  if(unlocked && chap) label = chap.title;
  else if(e.kind === 'victory') label = _qv.lockCollect;
  else if(e.kind === 'chapter') label = _qv.region;
  else if(e.kind === 'epilogue') label = _qv.end;
  else label = 'Verrouillé';
  return `<div class="drawer-row${unlocked?'':' locked'}" style="--row-c:${e.color};" `
       + (unlocked?`onclick="_replayChapter('${e.id}')"`:'') + ` role="button" `
       + `title="${unlocked?'Relire ce chapitre':'Chapitre verrouillé'}">`
       + `<div class="drawer-row-badge">${unlocked?e.label:'🔒'}</div>`
       + `<div class="drawer-row-label">${label}</div>`
       + `</div>`;
 }).join('');
 q.innerHTML = rows;
}
// v9.0.1 : ouvre/ferme un panneau déroulant VERTICAL (mini-carte / livre d'aventure)
function _toggleDrawer(name){
 const el = document.getElementById('drawer-'+name);
 const btn = document.getElementById('btn-'+name);
 if(!el) return;
 const open = el.classList.toggle('open');
 if(btn) btn.classList.toggle('drawer-open', open);
 // v10.2.1 : à l'ouverture, reconstruire le contenu depuis l'aventure courante
 if(open){
  try{
   if(name==='minimap' && typeof _refreshMiniMap==='function') _refreshMiniMap(_lastActiveRegionId, _lastFog, null, (typeof P!=='undefined'&&P&&P.avatar)||'🧙');
   if(name==='quest' && typeof _refreshQuestJournal==='function') _refreshQuestJournal(_lastFog);
  }catch(e){}
 }
 if(typeof beep==='function'){ try{ beep(open?520:320,'sine',.08,.04); }catch(e){} }
}
// Retrouve un chapitre par son id (intro, chap_xxx, win_xxx, epilogue)
function _findChapter(id){
 if(_STORY.intro && _STORY.intro.id === id) return _STORY.intro;
 if(id === 'intro') return _STORY.intro;
 if(_STORY.epilogue && _STORY.epilogue.id === id) return _STORY.epilogue;
 for(const k in _STORY.chapters){ if(_STORY.chapters[k].id === id) return _STORY.chapters[k]; }
 if(_STORY.victories){ for(const k in _STORY.victories){ if(_STORY.victories[k].id === id) return _STORY.victories[k]; } }
 return null;
}
function _replayChapter(id){
 if(!_questUnlockedCache[id]){
  if(typeof beep==='function'){ try{ beep(180,'square',.12,.06); }catch(e){} }
  return; // verrouillé
 }
 const chap = _findChapter(id);
 if(chap) _showStoryModal(chap, null);
}

// v8.7.69 (O5) : HTML de la section « Journal de quête » dans le carnet d'aventure
function _questJournalCarnetHtml(){
 const entries = _questEntries();
 const _qv = _questVocab();
 const seen = (typeof P!=='undefined' && P && Array.isArray(P.storySeen)) ? P.storySeen : [];
 const items = entries.map(e => {
  const cached = _questUnlockedCache[e.id];
  const unlocked = (cached !== undefined) ? cached : seen.includes(e.id);
  const chap = _findChapter(e.id);
  const title = chap ? chap.title : '';
  let sub = '';
  if(e.kind === 'intro') sub = "Le commencement de l'odyssée";
  else if(e.kind === 'chapter'){ const reg = _ARCH_REGIONS.find(r => r.id === e.regionId); sub = 'Arrivée' + (reg ? (' — ' + reg.label) : ''); }
  else if(e.kind === 'victory') sub = (chap && chap.crystal) ? (_qv.icon + ' ' + chap.crystal) : _qv.collected;
  else if(e.kind === 'epilogue') sub = "Le dénouement de l'aventure";
  let lockedLabel = 'Chapitre verrouillé';
  if(e.kind === 'victory') lockedLabel = _qv.lockCollect;
  else if(e.kind === 'chapter') lockedLabel = _qv.region;
  else if(e.kind === 'epilogue') lockedLabel = _qv.end;
  return `<div class="advlog-quest-item${unlocked?'':' locked'}" `
       + (unlocked?`onclick="closeAdventureLog();setTimeout(()=>_replayChapter('${e.id}'),320);"`:'')
       + `>`
       + `<div class="advlog-quest-badge" style="background:${unlocked?e.color:'#777'};">${unlocked?e.label:'🔒'}</div>`
       + `<div><div class="advlog-quest-label">${unlocked?title:lockedLabel}</div>`
       + `${(unlocked&&sub)?`<div class="advlog-quest-sub">${sub}</div>`:''}</div>`
       + `</div>`;
 }).join('');
 return `<div class="advlog-quest">`
      + `<button class="advlog-accordion-btn" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open');">📜 Journal de quête <span class="drawer-caret">▾</span></button>`
      + `<div class="advlog-accordion"><div class="advlog-quest-list">${items}</div></div>`
      + `</div>`;
}

// ═══════════════════════════════════════════════════════
// v9.0.5 (anti-jank) : GELER l'arrière-plan animé quand une modale est ouverte.
// La carte porte ~89 animations en boucle (PNJ, météo, décors, parallaxe...).
// Tant qu'une modale (zone, livre, carnet, boutique...) est affichée par-dessus,
// on masque + fige toute la vue carte : le GPU n'a plus rien à recomposer
// derrière l'overlay → fin de la recomposition par tuiles (clignotement).
(function(){
 const OVERLAYS = '.archipel-zoom-overlay,.story-overlay,.advlog-overlay,.archipel-shop-overlay,#hero-evolution-overlay,.figurine-overlay,.bosscard-overlay';
 function sync(){
  try{
   const hasOverlay = !!document.querySelector(OVERLAYS);
   document.body.classList.toggle('has-overlay', hasOverlay);
  }catch(e){}
 }
 if(typeof MutationObserver !== 'undefined' && document.body){
  const mo = new MutationObserver(sync);
  mo.observe(document.body, { childList:true });
  sync();
 }
})();

// ═══════════════════════════════════════════════════════
// v9.0.6 (O5) : CARTES DE BOSS — recto (portrait) / verso (biographie).
// Cliquer un boss vaincu dans le carnet ouvre sa carte, qui se retourne au clic.
// Biographies cohérentes avec l'univers (gardiens corrompus par le Comte Zéro).
// Extensible : ajouter une zone → ajouter une entrée ici (sinon bio générique).
// ═══════════════════════════════════════════════════════
const _BOSS_BIOS = {
 plaine:"Jadis gardien bienveillant des troupeaux, le Loup des Plaines hurlait pour rassembler les moutons égarés. Le Comte Zéro a empoisonné son cœur, et il s'est mis à brouiller les comptes des bergers. Vaincu, il a retrouvé toute sa noblesse d'antan.",
 village:"Le fier coq qui réveillait le Village Joyeux à l'heure pile, chaque matin. Corrompu, il chantait à n'importe quelle heure et semait la pagaille dans les horaires. Sa défaite a rendu au village ses matins réglés comme une horloge.",
 prairie:"Souveraine de la Prairie Fleurie, elle organisait ses ruches à l'abeille près. La magie du Comte Zéro l'a rendue furieuse, et ses abeilles comptaient tout de travers. Libérée, elle butine de nouveau en parfaite harmonie.",
 bonbons:"Une simple douceur transformée en monstre sucré par le Comte Zéro. Il volait les friandises des enfants pour brouiller leurs additions gourmandes. Vaincu, il est redevenu un délicieux donut tout à fait inoffensif.",
 foret:"Protecteur millénaire de la Forêt Enchantée, ce dragon veillait sur chaque arbre. Corrompu, son souffle brûlait les chiffres gravés dans l'écorce des troncs. Apaisé, il veille à nouveau sur la grande canopée.",
 champignons:"Lent mais très sage, il comptait patiemment les spores de la Vallée des Champignons. La corruption l'a rendu visqueux et grognon, embrouillant tous les sentiers. Vaincu, il reprend enfin sa route tranquille.",
 trolls:"Le plus costaud des trolls, gardien des vieux ponts de la forêt. Le Comte Zéro lui a soufflé de réclamer des péages impossibles à calculer. Battu, il laisse de nouveau passer les voyageurs en souriant.",
 plage:"Roi des sables de la Plage Ensoleillée, il rangeait les coquillages par dizaines bien alignées. Corrompu, il pinçait quiconque osait compter juste. Vaincu, il retourne paisiblement à ses châteaux de sable.",
 desert:"Sentinelle brûlante du Désert de Feu, son dard traçait des chiffres dans le sable chaud. La magie noire l'a rendu venimeux et confus. Apaisé, il garde de nouveau les précieuses oasis.",
 plaines_venteuses:"Sa course faisait gronder les Plaines Venteuses comme un véritable orage. Corrompu, il piétinait les nombres au grand galop. Vaincu, son tonnerre n'effraie plus que les nuages.",
 temple:"Statue éveillée du Temple Antique, gardienne d'énigmes oubliées depuis des siècles. Le Comte Zéro a effacé les réponses gravées dans sa mémoire de pierre. Vaincu, il révèle de nouveau ses secrets aux esprits dignes.",
 profondeurs:"Colosse des Profondeurs Océanes, ses tentacules comptaient les courants marins. Corrompu, il créait des tourbillons de chiffres affolés. Apaisé, il sombre paisiblement au fond des abysses.",
 glace:"Gardien gelé des Pics de Glace, il sculptait des flocons d'une symétrie parfaite. La corruption a figé son cœur et brouillé tous ses cristaux. Vaincu, sa banquise scintille de nouveau.",
 marais:"Chacune de ses têtes comptait une partie du Marais Lugubre. Le Comte Zéro les a fait se contredire sans cesse les unes les autres. Vaincue, l'Hydre raisonne enfin d'une seule et même voix.",
 forteresse:"Défenseur d'acier de la Forteresse Médiévale, nul ne franchissait ses remparts sans résoudre ses défis. Corrompu, il emprisonnait les voyageurs dans des calculs sans fin. Battu, il rouvre grand ses portes.",
 sakura:"Ombre véloce du Mont Sakura, il comptait ses shurikens plus vite que l'éclair. La corruption a troublé sa concentration légendaire. Vaincu, il s'incline avec un profond respect.",
 nocturne:"Maître du Royaume Nocturne, il comptait les étoiles pour endormir le monde entier. Corrompu, il volait le sommeil en mélangeant les nombres. Vaincu, la nuit retrouve toute sa douceur.",
 volcan:"Né du cœur brûlant du Volcan Maudit, il forgeait les nombres dans la lave en fusion. La magie du Comte Zéro a attisé sa colère ardente. Apaisé, sa flamme réchauffe sans plus jamais détruire.",
 espace:"Voyageur de la Galaxie Infinie, il calculait à la vitesse de la lumière. Corrompu, il dispersait les chiffres aux quatre coins du cosmos. Vaincu, il repart explorer les étoiles en paix.",
 cimes:"Aigle colossal régnant sur les Cimes Vertigineuses, son regard portait jusqu'à l'infini. La corruption a obscurci sa vue autrefois si perçante. Libéré, il plane de nouveau au-dessus des nuages.",
 mecanique:"Chef-d'œuvre de la Cité Mécanique, ses milliers de rouages calculaient sans la moindre erreur. Le Comte Zéro a déréglé ses engrenages délicats. Réparé, il bourdonne de nouveau avec une précision parfaite.",
 ile:"Spectre d'un vieux pirate hantant l'Île Mystérieuse, il comptait un trésor introuvable. Corrompu, il enterrait les nombres comme autant de butins. Vaincu, il trouve enfin le repos qu'il cherchait.",
 sanctuaire:"Ultime gardien du Sanctuaire, gigantesque colosse né de la magie du Comte Zéro lui-même. Il veille sur le cœur du royaume et sur le dernier secret de Calcultopia. Le vaincre ouvre la voie vers la vérité finale.",
};
function _bossBio(zoneId){
 return _BOSS_BIOS[zoneId] || "Un gardien corrompu par le Comte Zéro de Cafouillac, qui veillait jadis sur sa contrée. Vaincu par ton courage, il a retrouvé la paix et rendu sa lumière à Calcultopia.";
}
const _BOSS_CARD_ACCENT = {
 CP:'#6ab04c', CE1:'#2f8f5b', CE2:'#d68a3a', CM1:'#7d8fa6', CM2:'#7a4fc0', FINAL:'#caa92a',
};
function _openBossCard(zoneId){
 const z = (typeof MAP_ZONES!=='undefined') ? MAP_ZONES.find(x => x.id === zoneId) : null;
 if(!z) return;
 const accent = _BOSS_CARD_ACCENT[z.level] || '#b8893f';
 const emoji = z.boss || '🏆';
 const name = z.bossName || 'Gardien';
 const zone = z.label || '';
 const lvl = z.level || '';
 const bio = _bossBio(zoneId);
 const overlay = document.createElement('div');
 overlay.className = 'bosscard-overlay';
 overlay.innerHTML = `
  <button class="bosscard-close" aria-label="Fermer">✕</button>
  <div class="bosscard" role="button" tabindex="0" title="Touche la carte pour la retourner">
   <div class="bosscard-inner" style="--bc-accent:${accent};">
    <div class="bosscard-face bosscard-front">
     <div class="bosscard-badge">BOSS VAINCU 🏆</div>
     <div class="bosscard-portrait">${emoji}</div>
     <div class="bosscard-name">${name}</div>
     <div class="bosscard-zone">${zone}${lvl?` · ${lvl}`:''}</div>
     <div class="bosscard-flip-hint">↺ Touche pour lire son histoire</div>
    </div>
    <div class="bosscard-face bosscard-back">
     <div class="bosscard-back-head"><span class="bosscard-back-emoji">${emoji}</span><span class="bosscard-back-name">${name}</span></div>
     <div class="bosscard-bio">${bio}</div>
     <div class="bosscard-flip-hint">↺ Touche pour revenir</div>
    </div>
   </div>
  </div>`;
 const card = overlay.querySelector('.bosscard');
 card.addEventListener('click', () => card.classList.toggle('flipped'));
 overlay.querySelector('.bosscard-close').addEventListener('click', (e) => { e.stopPropagation(); _closeBossCard(overlay); });
 overlay.addEventListener('click', (e) => { if(e.target === overlay) _closeBossCard(overlay); });
 document.body.appendChild(overlay);
 requestAnimationFrame(() => overlay.classList.add('show'));
 if(typeof beep==='function'){ try{ beep(440,'sine',.1,.05); }catch(e){} }
}
function _closeBossCard(overlay){
 overlay.classList.remove('show');
 setTimeout(() => { try{ overlay.remove(); }catch(e){} }, 280);
}
