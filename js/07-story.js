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
   { emoji:'🏰', text:"Il était une fois un royaume lumineux nommé <b>Calcultopia</b>, où les nombres dansaient dans l'air comme des lucioles dorées. Tout y était harmonie : les rivières comptaient leurs vagues sans jamais s'emmêler, les arbres alignaient leurs feuilles en rangées parfaites, et chaque matin le soleil se levait pile à l'heure, salué par le chant précis des oiseaux." },
   { emoji:'💎', text:"Cette harmonie venait des <b>Cristaux de Calcultopia</b>, cinq joyaux magiques cachés à travers le monde depuis la nuit des temps. Tant qu'ils brillaient, l'ordre régnait : les récoltes étaient toujours justes, les marchands ne se trompaient jamais dans leurs comptes, et même les plus petits calculs trouvaient leur réponse sans effort." },
   { emoji:'📚', text:"Dans la grande tour de Calcultopia vivait un vieux sage nommé <b>Maître Comptin</b>, gardien des Cristaux depuis des décennies. Chaque soir, il racontait aux enfants du royaume comment les Cristaux avaient été forgés, il y a fort longtemps, par les tout premiers nombres eux-mêmes, à une époque si ancienne que même les plus vieux arbres du royaume n'en gardaient qu'un vague souvenir." },
   { emoji:'🎪', text:"Les habitants de Calcultopia menaient une vie douce et réglée : le boulanger comptait précisément ses miches chaque matin, les enfants apprenaient à jongler avec les nombres comme d'autres jonglent avec des balles, et le marché du village s'animait chaque semaine dans une joyeuse effervescence bien ordonnée." },
   { emoji:'🌑', text:"Mais une nuit sans étoiles, surgi du Grand Vide, apparut le terrible <b>{villain}</b> ! D'un rire glacial qui gela les fontaines jusqu'au cœur de l'hiver, il hurla à travers tout le royaume : « Plus de nombres ! Plus d'ordre ! Que TOUT devienne FLOU ! »" },
   { emoji:'🌪️', text:"Un vent noir se leva alors, chargé de chuchotements confus, et balaya les places et les jardins. Les girouettes se mirent à tourner follement, indiquant toutes les directions à la fois, comme si le monde entier avait soudain perdu le nord." },
   { emoji:'💥', text:"D'un claquement de doigts, il fit voler les Cristaux en éclats de lumière. Un à un, ils s'éteignirent... et un épais <b>brouillard</b> recouvrit chaque région du royaume, emmêlant les nombres, brouillant tous les calculs, et faisant perdre aux habitants jusqu'au compte de leurs propres doigts." },
   { emoji:'👹', text:"Le {villain} confia alors chaque Cristal brisé à un <b>gardien corrompu</b>, une bête paisible transformée par sa magie noire en protecteur féroce, pour qu'aucun héros ne puisse jamais les reprendre. Puis, satisfait de son œuvre, il se retira dans son Sanctuaire, tout au bout du monde, pour y attendre la fin de toute chose." },
   { emoji:'😰', text:"Maître Comptin, désespéré de voir son royaume sombrer dans la confusion, grimpa au sommet de sa tour et scruta l'horizon. « Il doit exister un moyen, » murmura-t-il. « Une vieille légende parle d'un héros... mais viendra-t-il à temps ? »" },
   { emoji:'🕯️', text:"Toute la nuit, il fouilla ses vieux grimoires poussiéreux à la lueur d'une bougie tremblante, cherchant fébrilement la moindre trace de cette légende à moitié oubliée, tandis que dehors, le brouillard continuait de s'épaissir sur Calcultopia endormie." },
   { emoji:'📜', text:"Cette vieille légende, gravée sur un parchemin plus ancien que le royaume lui-même, murmurait qu'un jour se lèverait un <b>jeune Calculateur</b> au cœur vaillant et à l'esprit vif, capable de réunir ce que le chaos avait séparé. {hero}, ce héros annoncé, c'est <b>TOI</b> !" },
   { emoji:'🌅', text:"Au matin, Maître Comptin t'aperçut au pied de sa tour, et son vieux cœur se mit à battre plus fort. « Enfin... » souffla-t-il. « Le royaume a tant besoin de toi, jeune {hero}. Le chemin sera long, mais tu ne seras jamais seul. »" },
   { emoji:'🗺️', text:"Ton odyssée commence. Traverse les {crystals} régions, affronte les gardiens, reprends les Cristaux un par un, puis marche jusqu'au Sanctuaire affronter le {villain} lui-même. Maître Comptin te tendra une carte, mais c'est ton courage qui tracera le vrai chemin. <b>Calcultopia compte sur toi !</b>" },
  ],
 },
 chapters: {
  cp: {
   id:'chap_cp',
   title:'Chapitre I — La Région des Débuts',
   crystal:'Cristal de l\'Unité',
   pages:[
    { emoji:'🌾', text:"Te voici dans la <b>Région des Débuts</b>, de douces plaines vallonnées où ton aventure prend racine. Ici, le brouillard est encore léger — mais les animaux errent, perdus, incapables de compter leurs propres pas, et les moulins tournent au hasard, sans jamais mesurer le vent." },
    { emoji:'🧙', text:"Un vieux sage à la barbe d'argent s'approche : « Enfin, te voilà, brave {hero} ! Je suis Maître Comptin, gardien de ce royaume depuis bien avant ta naissance. Le tout premier joyau, le <b>Cristal de l'Unité</b>, est gardé par le <b>Loup des Plaines</b>, devenu féroce depuis que le {villain} l'a corrompu. »" },
    { emoji:'🐑', text:"En chemin, tu croises un berger désemparé, assis au milieu de son troupeau éparpillé. « Je ne sais plus combien de moutons j'ai ! » se lamente-t-il. « Un, deux... j'oublie toujours où j'en étais ! » Maître Comptin t'encourage d'un signe de tête : chaque petit geste d'ordre affaiblit un peu plus le brouillard." },
    { emoji:'🌻', text:"Plus loin, des tournesols poussent en tous sens, désorganisés, comme s'ils avaient oublié comment s'aligner vers le soleil. Le vent lui-même semble hésiter, soufflant tantôt d'un côté, tantôt de l'autre, sans jamais choisir une direction franche." },
    { emoji:'🐔', text:"Une basse-cour affolée court dans tous les sens : les poules ne savent plus combien d'œufs elles ont pondu, et le vieux coq, perché de travers sur sa clôture, ne parvient plus à compter les levers du jour. Tu l'aides à retrouver un semblant d'ordre, geste après geste." },
    { emoji:'🏘️', text:"Au détour d'un sentier, un petit village semble figé dans la confusion : les maisons ne sont plus numérotées, et le facteur, une lettre à la main, tourne en rond sans savoir où frapper. Maître Comptin t'observe faire, un sourire fier aux lèvres." },
    { emoji:'🐝', text:"Une ruche entière bourdonne d'inquiétude : les abeilles ne parviennent plus à répartir équitablement leurs tâches, certaines butinant deux fois plus que d'autres. Ton passage rétablit peu à peu un semblant d'équilibre dans leur petit royaume ailé." },
    { emoji:'🐄', text:"Dans un pré voisin, un fermier compte et recompte ses vaches sans jamais retrouver le même nombre deux fois de suite, s'arrachant les cheveux de désespoir. Ton aide patiente lui redonne enfin le sourire, chiffre après chiffre." },
    { emoji:'💎', text:"« Relève les défis de chaque lieu pour gagner en courage, puis affronte le Loup au bout du chemin, » reprend Maître Comptin. « Libère le Cristal de l'Unité... et la toute première lueur d'espoir renaîtra sur Calcultopia ! » En avant, héros !" },
    { emoji:'🐺', text:"Au bout du chemin, le Loup des Plaines t'attend, les yeux rougeoyants de magie noire, grondant sourdement. Mais tu n'as pas peur : tu sens au fond de toi que ta mission est plus forte que sa colère. Le moment est venu de faire tes preuves." },
    { emoji:'💨', text:"Le Loup bondit soudain, toutes griffes dehors ! Tu plonges de côté juste à temps, roules dans l'herbe et te relèves d'un bond, le cœur battant. Il tourne autour de toi en grognant, cherchant une ouverture — mais toi aussi, tu cherches la tienne." },
   ],
  },
  ce1: {
   id:'chap_ce1',
   title:'Chapitre II — Bois et Plages',
   crystal:'Cristal de l\'Élan',
   pages:[
    { emoji:'🌲', text:"Le Cristal de l'Unité brille de nouveau ! Mais à peine as-tu quitté les plaines que tu pénètres dans les <b>Bois et Plages</b>, où les arbres murmurent sans plus savoir compter leurs anneaux, et où les vagues ont oublié comment mesurer leurs rouleaux avant de s'échouer sur le sable." },
    { emoji:'🧙', text:"Maître Comptin, le vieux sage, t'a suivi de loin, un peu essoufflé : « Tu progresses vite, {hero} ! Mais sois prudent : le {villain} a des espions partout, et cette forêt cache plus d'un secret... » Soudain, une petite lumière dorée volette autour de toi en pétillant !" },
    { emoji:'✨', text:"« Bonjour ! Je suis <b>Lumo</b>, une étincelle née d'un Cristal brisé ! » couine la luciole d'une voix flûtée. « Là où je vole, le brouillard recule un peu. Je viens avec toi, {hero}, si tu veux bien de moi ! » Tu souris : tu as trouvé un compagnon fidèle." },
    { emoji:'🐚', text:"Sur la plage, des coquillages sont éparpillés en désordre, autrefois rangés par tailles décroissantes par les crabes du rivage. « On n'arrive plus à retrouver notre chemin dans nos propres rangées ! » se plaint un vieux crabe en agitant ses pinces avec dépit." },
    { emoji:'🦌', text:"Maître Comptin reprend son souffle et poursuit : « Le <b>Cristal de l'Élan</b> est gardé par le Cerf Spectral, au cœur de la forêt. Mais prends garde : le {villain} sait désormais qu'un héros se dresse contre lui... et il n'aime pas être défié. »" },
    { emoji:'🍃', text:"Lumo se pose un instant sur ton épaule, songeuse : « J'ai un vague souvenir... avant d'être une étincelle, j'étais peut-être un fragment de ce Cristal-là. C'est peut-être pour ça que je me sens si bien ici, dans cette forêt. » Elle secoue la tête, incertaine." },
    { emoji:'🦔', text:"Une famille de hérissons s'est perdue en tentant de compter les épines de son terrier, chacun donnant un nombre différent. Lumo pouffe de rire : « Même moi je m'y perdrais ! » Ensemble, vous les aidez patiemment à retrouver le bon compte." },
    { emoji:'🐿️', text:"Un écureuil affolé a caché des noisettes dans une dizaine de cachettes différentes, mais ne se souvient plus d'aucune d'entre elles. Lumo l'aide à retracer son chemin, une empreinte après l'autre, jusqu'à ce que chaque cachette soit retrouvée." },
    { emoji:'🌊', text:"Sur la plage, les marées elles-mêmes semblent déréglées : une vague monte deux fois de suite sans jamais redescendre, comme si la mer avait, elle aussi, oublié comment alterner. Lumo s'amuse à voler juste au-dessus de l'écume, ravie de ce nouveau terrain de jeu." },
    { emoji:'🦉', text:"Une chouette, perchée de guingois sur une branche tordue, hulule tristement : « Je ne sais plus combien de nuits il reste avant la pleine lune ! » Lumo compatit, ayant elle-même bien du mal à s'y retrouver dans le temps qui passe." },
    { emoji:'⚔️', text:"Au loin, un rire glacial résonne entre les arbres. Le {villain} t'observe ! Qu'importe — tu serres les poings, Lumo brille plus fort à tes côtés, et tu t'enfonces résolument dans les bois. Rien ne t'arrêtera, pas même une ombre lointaine." },
    { emoji:'🦌', text:"Le Cerf Spectral surgit entre les arbres et charge, ses bois immenses fendant l'air ! Tu te baisses juste à temps, sens le vent de son passage sur ta nuque, puis fais volte-face pour lui faire face bien en garde. « Attention derrière ! » crie Lumo — un peu tard, mais avec beaucoup d'enthousiasme." },
   ],
  },
  ce2: {
   id:'chap_ce2',
   title:'Chapitre III — Les Terres d\'Aventure',
   crystal:'Cristal du Voyage',
   pages:[
    { emoji:'🏜️', text:"Deux Cristaux retrouvés ! Te voilà dans les <b>Terres d'Aventure</b> : déserts brûlants et temples oubliés où le sable efface les chiffres aussi vite qu'on les trace, et où les caravanes tournent en rond, incapables de retrouver leur route." },
    { emoji:'🥷', text:"Mais une ombre te barre soudain la route ! C'est le <b>Sergent Virgule</b>, lieutenant du {villain}, tout de noir vêtu. « Halte, petit héros ! Le maître m'envoie te ralentir, et je compte bien y réussir ! » ricane-t-il en brouillant les dunes d'un geste sec." },
    { emoji:'💪', text:"Lumo se cache derrière ton épaule, effrayée par cette silhouette menaçante. Mais toi, {hero}, tu redresses la tête sans ciller : « Je n'ai pas peur de toi ! » Ton courage tranquille fait reculer le Sergent, qui s'enfuit en jurant que le maître se vengera bientôt." },
    { emoji:'🐫', text:"Un marchand de tapis, assis devant sa tente à moitié ensablée, secoue la tête avec lassitude : « Depuis que le brouillard est arrivé, je ne sais plus compter mes pièces d'or ! Un client honnête pourrait me voler sans même le vouloir... » Tu promets de l'aider à y voir plus clair." },
    { emoji:'🏺', text:"Maître Comptin te rejoint enfin, essoufflé par la traversée du désert : « Bravo, {hero} ! Quel cran face au Sergent Virgule ! Le <b>Cristal du Voyage</b> repose dans le Temple Antique, gardé par le Sphinx des Sables. Réponds à ses énigmes, et il sera tien. »" },
    { emoji:'🗿', text:"Devant le temple, d'immenses statues de pierre, à moitié ensevelies, semblent compter silencieusement les grains de sable qui s'échappent d'un sablier géant, fissuré par le temps et par la magie noire du {villain}." },
    { emoji:'🐪', text:"Une caravane de dromadaires tourne en rond depuis des heures autour d'une même dune, incapable de retrouver l'oasis qu'elle cherchait. Leur guide, désespéré, s'assoit dans le sable : « Sans mes repères, je ne sais même plus dans quel sens marcher ! »" },
    { emoji:'🏛️', text:"À l'intérieur du temple, des couloirs identiques se répètent à l'infini, chacun orné des mêmes symboles gravés dans la pierre ancienne. Lumo vole en éclaireuse, un peu nerveuse : « J'espère qu'on ne va pas tourner en rond, {hero}... »" },
    { emoji:'🦂', text:"Un petit scorpion des sables, perdu entre deux dunes identiques, gratte frénétiquement le sol de ses pinces : « Ma maison était juste ici, j'en suis sûr... ou peut-être là-bas ? » Avec un peu d'aide, il retrouve enfin son terrier familier." },
    { emoji:'🦎', text:"Un lézard doré, réfugié à l'ombre d'une colonne brisée, te souffle un conseil précieux : « Les couloirs de ce temple se répètent toujours par groupes de trois, jeune héros. Compte bien tes pas, et jamais tu ne t'égareras. »" },
    { emoji:'🌟', text:"Lumo réapparaît, un peu honteuse de s'être cachée : « Tu es si brave, {hero}... je serai courageuse moi aussi, la prochaine fois ! » Ensemble, vous avancez vers le temple, le cœur vaillant. Trois Cristaux bientôt réunis !" },
    { emoji:'⏳', text:"Le Sphinx des Sables pose sa dernière énigme, la plus redoutable de toutes. Le sable du sablier géant s'écoule déjà, de plus en plus vite. Lumo retient son souffle. Une seconde d'hésitation... et la bonne réponse jaillit enfin de tes lèvres, juste à temps !" },
   ],
  },
  cm1: {
   id:'chap_cm1',
   title:'Chapitre IV — Les Royaumes Périlleux',
   crystal:'Cristal de la Bravoure',
   pages:[
    { emoji:'🏰', text:"Les <b>Royaumes Périlleux</b> t'accueillent dans le froid : forteresses de pierre grise, remparts couverts de givre, et un brouillard si épais qu'on n'y voit plus ses propres mains tendues devant soi." },
    { emoji:'😰', text:"Soudain, un cri déchire le silence glacé ! Le {villain} a capturé <b>Maître Comptin</b> et l'enferme dans une tour de glace, tout au sommet d'une forteresse imprenable. « Si tu veux ton vieil ami, héros, viens donc le chercher... si tu l'oses ! » tonne sa voix, amplifiée par le vent." },
    { emoji:'🔥', text:"Ton sang ne fait qu'un tour. Lumo tremble à tes côtés : « C'est sûrement un piège, {hero} ! » — « Peut-être, » réponds-tu d'une voix ferme, « mais on n'abandonne jamais un ami. » C'est ton plus grand acte de bravoure depuis le début de ton odyssée." },
    { emoji:'❄️', text:"Les gardes de glace qui patrouillent les remparts semblent compter leurs pas en boucle, encore et encore, comme hypnotisés par le froid et la magie noire. Tu comprends que même eux, autrefois, étaient de simples habitants du royaume." },
    { emoji:'🕯️', text:"Dans une salle abandonnée du château, tu découvres une horloge géante, arrêtée depuis des lustres, ses aiguilles figées entre deux heures qui ne correspondent à rien. Lumo l'observe, songeuse : « On dirait que le temps lui-même s'est perdu ici. »" },
    { emoji:'🧊', text:"Des ponts de glace, fragiles et suspendus, relient les tours du château entre elles. Un faux pas, un mauvais calcul, et c'est la chute assurée. Chaque pas prudent que tu fais résonne comme un petit exploit dans le silence glacial." },
    { emoji:'🦅', text:"Un aigle des glaces, autrefois messager du royaume, tourne désormais en cercles sans fin au-dessus des tours, incapable de retrouver la direction de son nid. Lumo l'appelle doucement, et peu à peu, l'oiseau retrouve un cap à suivre." },
    { emoji:'🐉', text:"Pour atteindre la tour, tu devras vaincre le Dragon des Remparts, gardien du <b>Cristal de la Bravoure</b>. Chaque calcul juste que tu résous fissure un peu plus la glace qui retient Maître Comptin prisonnier, tout là-haut." },
    { emoji:'💎', text:"« Tiens bon, {hero} ! » lance Lumo, brillant de mille feux malgré le froid mordant. « Quatre Cristaux bientôt, et déjà tu fais reculer les ténèbres du {villain} ! » Tu inspires un grand coup, tu serres les poings... et tu t'élances vers le Dragon." },
    { emoji:'🔥', text:"Le Dragon des Remparts crache un souffle glacé qui fait voler la neige tout autour de toi ! Tu te jettes derrière un pan de mur brisé, attends que le souffle passe, puis bondis à découvert pour lui faire face. Plus question de reculer maintenant." },
   ],
  },
  cm2: {
   id:'chap_cm2',
   title:'Chapitre V — Au-delà des Étoiles',
   crystal:'Cristal de l\'Infini',
   pages:[
    { emoji:'🌌', text:"Maître Comptin enfin libéré, vous voilà projetés <b>Au-delà des Étoiles</b>, dans le grand vide cosmique où flottent les derniers nombres du royaume, scintillant doucement comme des constellations abandonnées." },
    { emoji:'🧙', text:"Maître Comptin, encore frissonnant de son emprisonnement, devient soudain très grave : « {hero}, il est temps que tu saches la vérité. Le {villain}... fut jadis le plus grand mathématicien de tout Calcultopia. »" },
    { emoji:'💔', text:"« Mais un jour, une seule erreur de calcul, une toute petite erreur, lui coûta tout : sa réputation, ses amis, sa confiance en lui-même. De honte et de colère, il jura d'effacer TOUS les nombres, pour que plus personne ne puisse jamais se tromper... ni réussir. »" },
    { emoji:'🪐', text:"Autour de vous, d'anciennes constellations dessinent encore, dans le ciel étoilé, les formules et théorèmes que le {villain} avait lui-même découverts, des siècles plus tôt, quand il portait un tout autre nom." },
    { emoji:'☄️', text:"Une pluie de petites étoiles filantes traverse le ciel, chacune portant un chiffre qui scintille un bref instant avant de s'éteindre. Lumo tend la main pour en attraper une, émerveillée : « On dirait que même l'univers sait compter, {hero}... »" },
    { emoji:'🌙', text:"Maître Comptin s'assoit un instant sur un rocher flottant, épuisé mais apaisé : « Vois-tu, {hero}, personne n'est parfait — pas même les plus grands savants. Ce qui compte, c'est ce qu'on choisit de faire après une erreur. »" },
    { emoji:'🔭', text:"Au loin, une comète solitaire trace une longue traînée lumineuse à travers le vide, comme pour rappeler que même les astres les plus perdus finissent toujours par retrouver leur chemin, un jour ou l'autre, à travers l'immensité du ciel." },
    { emoji:'🌠', text:"Tu comprends alors : le {villain} n'est pas qu'un monstre, mais un cœur brisé par une seule erreur qu'il n'a jamais su pardonner. Le <b>Cristal de l'Infini</b>, gardé par le Colosse Stellaire, pourrait bien être la clé pour enfin le raisonner." },
    { emoji:'✨', text:"« Cinq Cristaux bientôt, {hero} ! » s'écrie Lumo, éblouie par toutes ces étoiles. « Il ne restera plus que le Sanctuaire ! » Le destin de Calcultopia — et peut-être même celui du {villain} — tient désormais entre tes mains. Sois fort. Sois juste." },
    { emoji:'☄️', text:"Le Colosse Stellaire lève un poing géant, fait de pierre et d'étoiles mortes, et frappe le sol ! Tu esquives d'un bond, la secousse te fait perdre l'équilibre un instant — mais tu te redresses aussitôt, plus déterminé que jamais." },
   ],
  },
  final: {
   id:'chap_final',
   title:'Chapitre VI — Le Sanctuaire',
   crystal:'',
   pages:[
    { emoji:'🕉️', text:"Les cinq Cristaux flottent autour de toi, irradiant une lumière pure et chaude. Devant s'élève le <b>Sanctuaire Final</b>, dernier repaire du {villain}, là où tout a commencé, il y a bien longtemps... et où tout va se jouer aujourd'hui." },
    { emoji:'👹', text:"« Te voilà donc, » murmure le {villain}, plus las que furieux, sa voix résonnant contre les murs de pierre froide. « Tu as repris mes Cristaux, un par un... mais comprends-tu seulement pourquoi je les ai brisés ? » Sa voix tremble légèrement, presque humaine." },
    { emoji:'❤️', text:"Maître Comptin pose une main réconfortante sur ton épaule : « Montre-lui, {hero}. Montre-lui qu'une erreur n'est pas une fin — mais le début d'un nouvel apprentissage. C'est ça, la vraie magie des nombres, celle qu'il a oubliée depuis trop longtemps. »" },
    { emoji:'🌟', text:"Lumo se pose sur ton épaule, minuscule mais déterminée : « Nous sommes avec toi, {hero}, jusqu'au bout de cette aventure. » Le {villain} vous observe, ses yeux glacés cherchant peut-être, malgré lui, une raison d'espérer encore." },
    { emoji:'🏛️', text:"Le Sanctuaire tout entier semble retenir son souffle : les colonnes de pierre, gravées de nombres oubliés depuis des siècles, s'illuminent faiblement à chaque pas que tu fais vers le {villain}, comme si elles reprenaient vie peu à peu." },
    { emoji:'🕊️', text:"Au sommet du Sanctuaire, une immense fresque murale raconte, en images à moitié effacées, la splendeur passée de Calcultopia avant le brouillard — et tu sens, au fond de toi, que cette splendeur peut renaître, aujourd'hui même." },
    { emoji:'⚔️', text:"Le {villain} lève les bras dans un dernier sursaut de colère : « Assez de belles paroles ! Prouve-moi ta valeur, héros ! » Le combat ultime commence. Pour Calcultopia. Pour Maître Comptin. Pour Lumo. <b>Pour toi.</b>" },
   ],
  },
 },
 victories: {
  cp: { id:'win_cp', title:'Cristal de l\'Unité libéré !', crystal:'Cristal de l\'Unité', pages:[
   { emoji:'💎', text:"Le Loup des Plaines pousse un dernier grognement... puis la magie noire se dissipe comme une fumée emportée par le vent ! Ses yeux redeviennent doux comme avant. De son pelage jaillit le <b>Cristal de l'Unité</b>, d'un <b>rouge</b> rubis éclatant, scintillant de mille feux !" },
   { emoji:'🌅', text:"La toute première lueur revient sur Calcultopia ! Le brouillard recule d'un bon pas. Au loin, le berger retrouve enfin le compte exact de ses moutons et pousse un cri de joie. Maître Comptin sourit : « Je savais que tu en étais capable. La quête ne fait que commencer, {hero}. »" },
   { emoji:'🐑', text:"Dans la basse-cour, les poules recommencent enfin à pondre en cadence régulière, et le vieux coq, fier comme un roi, chante l'heure exacte du matin. Un premier petit coin du royaume respire de nouveau." },
  ]},
  ce1: { id:'win_ce1', title:'Cristal de l\'Élan libéré !', crystal:'Cristal de l\'Élan', pages:[
   { emoji:'💎', text:"Le Cerf Spectral incline sa noble ramure et s'évapore en une pluie d'étincelles dorées. Le <b>Cristal de l'Élan</b>, d'un <b>orange</b> flamboyant, est à toi ! Les bois retrouvent leurs couleurs et les vagues se remettent à compter leurs rouleaux sur le sable retrouvé." },
   { emoji:'✨', text:"« Un Cristal de plus, {hero} ! » s'émerveille Lumo en tournoyant de joie. Sur la plage, le vieux crabe range enfin ses coquillages en rangées bien nettes. Au loin, le {villain} grince des dents : « Comment ose-t-il me défier ainsi... » Ta légende grandit dans tout le royaume." },
   { emoji:'🌊', text:"Sur la plage retrouvée, les marées reprennent leur doux va-et-vient régulier, montant puis redescendant comme il se doit. La famille de hérissons, ravie, recompte fièrement chacune de ses épines." },
  ]},
  ce2: { id:'win_ce2', title:'Cristal du Voyage libéré !', crystal:'Cristal du Voyage', pages:[
   { emoji:'💎', text:"Le Sphinx des Sables s'incline avec respect : « Tes réponses sont justes, jeune sage. Le Cristal t'appartient. » Le <b>Cristal du Voyage</b>, d'un <b>vert</b> émeraude profond, s'élève des sables anciens dans un tourbillon de lumière dorée." },
   { emoji:'🏜️', text:"Vaincu et humilié une fois de plus, le Sergent Virgule déguerpit pour de bon en jurant vengeance ! Le marchand de tapis recompte enfin ses pièces d'or avec le sourire. Maître Comptin pose la main sur ton épaule : « Te voilà à mi-chemin. Le plus dur reste à venir... mais regarde comme tu as grandi. »" },
   { emoji:'🐪', text:"La caravane égarée retrouve enfin le chemin de l'oasis, guidée par les nouvelles étoiles bien alignées dans le ciel du désert. Le guide, soulagé, s'incline devant toi en signe de gratitude éternelle." },
  ]},
  cm1: { id:'win_cm1', title:'Cristal de la Bravoure libéré !', crystal:'Cristal de la Bravoure', pages:[
   { emoji:'💎', text:"Dans un fracas titanesque, le Dragon des Remparts s'effondre, enfin libéré de la corruption qui l'enchaînait ! La tour de glace se fissure et explose en mille éclats — <b>Maître Comptin est libre</b> ! Le <b>Cristal de la Bravoure</b>, d'un <b>bleu</b> saphir intense, brille entre tes mains." },
   { emoji:'🤝', text:"« Tu es venu... pour moi, » murmure le vieux sage, les yeux humides de soulagement. « Toujours, » réponds-tu simplement et sincèrement, sans la moindre hésitation. Lumo essuie une larme de lumière sur sa petite joue dorée. Un Cristal de plus, et surtout : un ami sauvé sain et sauf." },
   { emoji:'🕰️', text:"L'horloge géante du château se remet soudain à tourner, ses aiguilles retrouvant enfin l'heure juste. Les gardes de glace, libérés à leur tour de la corruption, clignent des yeux, hébétés, avant de sourire timidement." },
  ]},
  cm2: { id:'win_cm2', title:'Cristal de l\'Infini libéré !', crystal:'Cristal de l\'Infini', pages:[
   { emoji:'💎', text:"Le Colosse Stellaire s'agenouille avec lenteur, et toutes les étoiles applaudissent en scintillant à l'unisson ! Le <b>Cristal de l'Infini</b>, d'un <b>violet</b> améthyste profond, rejoint les autres et, ensemble, ils tournoient autour de toi en une couronne de lumière pure." },
   { emoji:'🌌', text:"« Tu as réuni tous les Cristaux, {hero} ! » s'écrie Lumo, éblouie par cette danse de lumières. Maître Comptin, encore ému par tout ce qu'il vient de te confier, hoche gravement la tête : « Il ne reste plus qu'une chose à faire : marcher vers le Sanctuaire, et affronter le {villain} en personne. Le moment de vérité est venu. »" },
   { emoji:'☄️', text:"Les étoiles filantes retrouvent leur trajectoire paisible à travers le ciel, portant chacune son chiffre bien à sa place. Maître Comptin observe ce spectacle avec un mélange de fierté et de nostalgie, songeant au chemin déjà parcouru." },
  ]},
 },
 epilogue: {
  id:'epilogue',
  title:'Épilogue — La Lumière Retrouvée',
  pages:[
   { emoji:'⚔️', text:"Au terme d'un ultime affrontement, le {villain} tombe à genoux, à bout de forces, ses pouvoirs noirs se dissipant peu à peu. Mais au lieu de le frapper, {hero}, tu fais une chose que personne n'attendait : tu tends la main, et tu déposes doucement les Cristaux devant lui, sans une once de colère." },
   { emoji:'❤️', text:"« Une erreur ne fait pas de toi un monstre, » dis-tu d'une voix calme et posée. « Elle fait de toi quelqu'un qui peut apprendre, et recommencer. » Le {villain} contemple longuement les Cristaux... et pour la première fois depuis mille ans, une larme roule sur sa joue glacée." },
   { emoji:'✨', text:"« J'avais... oublié cela, » souffle-t-il, sa voix se brisant peu à peu. « Merci infiniment, {hero}. » Alors son cœur s'illumine : il était le dernier Cristal manquant ! Tous les Cristaux fusionnent en une lumière éclatante qui balaie le tout dernier brouillard de Calcultopia, jusqu'au moindre recoin du royaume." },
   { emoji:'🌈', text:"Les nombres dansent à nouveau dans l'air, les rivières comptent leurs vagues sans jamais se tromper, et le soleil se lève pile à l'heure. Le royaume est sauvé ! Sur la grande place s'élève bientôt une statue à ton effigie : {hero}, Héros de Calcultopia, pour que nul n'oublie jamais ton courage." },
   { emoji:'🎉', text:"Maître Comptin, la fidèle Lumo, et même l'ancien {villain} — devenu un humble professeur de mathématiques, aimé de tous les enfants du royaume — t'acclament sous les étoiles retrouvées. Ton odyssée restera gravée à jamais dans le ciel de Calcultopia. <b>FÉLICITATIONS, champion !</b>" },
   { emoji:'🐑', text:"Partout dans le royaume, la nouvelle se répand comme une traînée de lumière : le berger recompte joyeusement son troupeau au grand complet, le marchand de tapis rouvre boutique en fredonnant, et le facteur du petit village retrouve enfin chaque maison à sa juste adresse." },
   { emoji:'🌟', text:"Ce soir-là, sur la grande place de Calcultopia, un immense banquet est dressé sous un ciel constellé d'étoiles bien alignées. Lumo virevolte de table en table, racontant votre aventure à qui veut l'entendre, embellissant chaque péripétie d'une pincée de magie supplémentaire." },
   { emoji:'🕊️', text:"Maître Comptin lève son verre bien haut : « À {hero}, notre héros ! Et à {villain}, notre nouvel ami, qui nous rappelle à tous qu'il n'est jamais trop tard pour recommencer. » Toute la place éclate en applaudissements chaleureux, et même les étoiles semblent scintiller un peu plus fort ce soir-là, comme pour célébrer à leur façon la fin d'une aventure extraordinaire." },
   { emoji:'📖', text:"Alors que la fête bat son plein, l'ancien {villain} s'approche de toi, un peu intimidé : « {hero}, avant de tourner cette page... laisse-moi te raconter une dernière chose. Une histoire bien plus ancienne que la mienne : celle des tout premiers nombres eux-mêmes, et de leur incroyable voyage à travers le monde et les siècles. »" },
   { emoji:'🔢', text:"« Cette histoire, » ajoute Maître Comptin avec un clin d'œil, « t'attend désormais dans ton <b>carnet d'aventure</b>, sous le nom de <b>La Grande Histoire des Nombres</b>. Ouvre-le quand tu voudras, et laisse-toi porter à travers l'os d'Ishango, Babylone, l'Égypte, l'Inde et bien d'autres merveilles ! »" },
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
  { emoji:'🌈', text:"Il était une fois un pays merveilleux appelé <b>{kingdom}</b>. Là-bas, les coquelicots étaient rouges comme des baisers, les oranges bien juteuses et bien orange, les blés dorés comme du miel, l'herbe verte comme une prairie de printemps, le ciel bleu comme une mer sans vagues, et le soir tombait toujours tout en douceur, couleur de myrtille. Sept couleurs, sept trésors, et un seul arc-en-ciel qui brillait dans le ciel, jour et nuit." },
  { emoji:'🦋', text:"Au-dessus de ce beau pays volait une petite luciole pas comme les autres : elle s'appelait <b>Iris</b>, et changeait de couleur selon son humeur — rouge quand elle riait, bleue quand elle rêvait, dorée quand elle chantait. Elle veillait sur {kingdom} depuis toujours, en amie de tous ses habitants." },
  { emoji:'☁️', text:"Mais un matin d'hiver, un énorme nuage tout gris est arrivé au-dessus des collines : c'était <b>{villain}</b>. Il avait le cœur si lourd, si triste, que partout où passait son ombre, les couleurs s'échappaient du monde comme de l'eau qui fuit entre les doigts." },
  { emoji:'😢', text:"Une à une, les couleurs ont disparu. Le rouge des coquelicots, l'orange des fruits, le jaune du soleil, le vert des feuilles, le bleu du ciel : tout est devenu gris, comme une vieille photo oubliée dans un tiroir. Iris elle-même a perdu ses couleurs, et s'est cachée, toute pâle, au creux d'une fleur fanée." },
  { emoji:'🧒', text:"Alors les animaux du pays se sont souvenus d'une vieille chanson : un jour viendrait un petit héros au grand cœur, capable de faire revivre les couleurs, une à une. {hero}, ce héros, c'est <b>TOI</b> ! Retrouve Iris sur chaque chemin, joue avec les amis du pays, et ensemble, ramenez l'arc-en-ciel dans le ciel de {kingdom} !" },
 ]},
 chapters: {
  cp: { id:'mat_c_cp', title:'La Plaine des Coquelicots', crystal:'le Rouge', pages:[
   { emoji:'🌱', text:"Te voilà dans la <b>Plaine des Coquelicots</b>, un endroit qui, dit-on, était autrefois rouge à perte de vue. Aujourd'hui, l'herbe est grise, les fleurs sont grises, et même les petits nuages semblent tristes de ne plus savoir quelle couleur porter." },
   { emoji:'🐰', text:"Un petit lapin gris s'approche en reniflant. « Bonjour, {hero}... Avant, mes coquelicots préférés étaient si rouges qu'on aurait dit des cœurs de velours. Maintenant, tout est gris, gris, gris. Je n'ose même plus sauter de joie. »" },
   { emoji:'✨', text:"Sur ton épaule, une minuscule lumière pâle s'agite : c'est <b>Iris</b> ! « Psst, {hero}... » chuchote-t-elle. « Aide le lapin à retrouver le sourire, et je crois bien que le rouge reviendra avec lui. »" },
   { emoji:'❤️', text:"Le lapin sèche ses larmes et sourit timidement : « Si tu joues avec nous, {hero}, peut-être que la plaine redeviendra aussi belle qu'avant... Tu veux bien essayer ? » Le vent souffle doucement, comme pour t'encourager à commencer." },
  ]},
  ce1: { id:'mat_c_ce1', title:'Le Verger des Oranges', crystal:'l\'Orange', pages:[
   { emoji:'🍊', text:"Bienvenue dans le <b>Verger des Oranges</b> ! Ici poussaient jadis les fruits les plus sucrés du pays, ronds et brillants comme de petits soleils. Aujourd'hui, ils pendent aux branches, gris et ternes, comme des cailloux oubliés." },
   { emoji:'🐻', text:"Un ourson soupire devant un arbre : « {hero}, avant je croquais une orange chaque matin, et le jus me coulait sur le menton ! Maintenant... regarde. » Il tapote un fruit gris du bout de sa patte, sans grand espoir." },
   { emoji:'🦋', text:"Iris frétille sur ton épaule, une lueur orangée scintillant furtivement autour d'elle. « Je sens l'orange qui hésite à revenir, tout près... Il suffirait d'un peu de courage et de jeu pour la convaincre ! »" },
   { emoji:'🐻', text:"L'ourson renifle un grand coup et retrouve un peu d'entrain : « D'accord, {hero}, jouons ensemble ! Si l'orange nous écoute, le verger sentira à nouveau bon la confiture et le soleil. »" },
  ]},
  ce2: { id:'mat_c_ce2', title:'Les Bois Dorés', crystal:'le Jaune', pages:[
   { emoji:'🍂', text:"Chut... nous voici dans les <b>Bois Dorés</b>, où d'ordinaire chaque feuille brille comme une pièce d'or et chante au moindre souffle de vent. Mais aujourd'hui, la forêt est silencieuse, et les feuilles pendent, grises et lourdes." },
   { emoji:'🦉', text:"Un vieux hibou cligne des yeux depuis sa branche : « Hou hou, {hero}... Sans le jaune, plus personne ne retrouve son chemin dans ces bois, même moi qui vois pourtant très bien la nuit. »" },
   { emoji:'✨', text:"Iris voltige entre les troncs gris, cherchant une trace de lumière oubliée. « Le jaune se cache tout près, j'en suis sûre ! Il attend juste un peu de malice et de jeu pour oser ressortir. »" },
   { emoji:'🦉', text:"Le hibou hoche gravement la tête : « Alors joue avec nous, petit héros, et peut-être que le soleil du matin retrouvera enfin ses bois dorés. » Un frisson d'espoir parcourt la forêt endormie." },
  ]},
  cm1: { id:'mat_c_cm1', title:'Le Lagon aux Tortues', crystal:'le Vert', pages:[
   { emoji:'🐢', text:"Plouf ! Te voilà au bord du <b>Lagon aux Tortues</b>, où l'eau turquoise reflétait autrefois des palmiers d'un vert éclatant. Aujourd'hui, tout est gris : l'eau, les palmiers, et même les carapaces des tortues, qui nagent lentement, tristounettes." },
   { emoji:'🐢', text:"Une vieille tortue soulève la tête hors de l'eau : « {hero}, te voici enfin ! Sans le vert, le lagon a perdu tout son éclat. Les poissons eux-mêmes n'ont plus envie de faire des bulles. »" },
   { emoji:'🐟', text:"Un banc de petits poissons argentés jaillit hors de l'eau en riant : « Viens jouer avec nous dans les vagues, {hero} ! Iris dit que le vert adore le rire et les éclaboussures ! »" },
   { emoji:'🌊', text:"Iris plonge la pointe de ses ailes dans l'eau et frissonne de plaisir. La vieille tortue sourit pour la première fois depuis longtemps, et plonge doucement dans l'eau grise en te faisant signe de la suivre." },
  ]},
  cm2: { id:'mat_c_cm2', title:'La Colline des Bleuets', crystal:'le Bleu', pages:[
   { emoji:'🪁', text:"Le vent te pousse doucement jusqu'à la <b>Colline des Bleuets</b>, là où les cerfs-volants dansaient autrefois sous un ciel du plus beau bleu. Aujourd'hui, le ciel est gris et lourd, et les cerfs-volants restent posés, tristes, dans l'herbe." },
   { emoji:'🐦', text:"Un petit oiseau se pose sur ton épaule en pépiant doucement : « {hero}, sans le bleu, je ne retrouve même plus le chemin du nid ! Le ciel et les fleurs de bleuets se ressemblent tous, gris et gris encore. »" },
   { emoji:'✨', text:"Iris s'installe sur ton autre épaule, presque timide : « Encore un effort, {hero}... c'est la dernière île avant le château. Le bleu, c'est celui du ciel tout entier — il mérite qu'on joue de tout son cœur pour lui ! »" },
   { emoji:'🐦', text:"L'oiseau s'envole en cercle, plein d'espoir : « Joue avec nous, {hero}, et bientôt les cerfs-volants danseront de nouveau dans un ciel tout bleu ! » Le vent semble retenir son souffle, en attendant." },
  ]},
  final: { id:'mat_c_final', title:'Le Château du Soir', crystal:'l\'Indigo', pages:[
   { emoji:'🏰', text:"Tout là-haut, au sommet d'un escalier de nuages, se dresse le <b>Château du Soir</b>. C'est ici, dans un ciel couleur de nuit, que sommeille le grand {villain} — la source de toute cette grisaille." },
   { emoji:'🌙', text:"Iris se blottit contre toi, un peu inquiète : « C'est ici qu'il garde la dernière couleur, l'indigo du soir... Mais {hero}, je crois que {villain} n'est pas méchant. Il est juste... très, très triste. »" },
   { emoji:'☁️', text:"Une grosse voix, lourde comme un orage, résonne dans le château : « Qui ose venir déranger mon sommeil gris ? » {villain} entrouvre un œil, fatigué, presque surpris de te voir là, si petit et si déterminé." },
   { emoji:'❤️', text:"Tu t'avances sans peur, {hero}. « Je ne suis pas venu me battre, » dis-tu doucement. « Je suis venu jouer avec toi, comme avec tous les autres amis du pays. » Le nuage grognon, surpris, ne sait pas quoi répondre." },
  ]},
 },
 victories: {
  cp: { id:'mat_w_cp', title:'Le Rouge est revenu !', crystal:'le Rouge', pages:[
   { emoji:'❤️', text:"Hourra ! Un par un, les coquelicots retrouvent leur <b>rouge</b> éclatant, comme de petites flammes qui se rallument dans l'herbe verdissante. Le petit lapin bondit de joie, ses moustaches frémissantes de bonheur." },
   { emoji:'🐰', text:"« Merci, {hero} ! » couine-t-il en tournoyant sur lui-même. « Je vais enfin pouvoir sauter dans les coquelicots comme avant ! » Iris, elle, scintille d'un rouge éclatant, ravie." },
   { emoji:'🌈', text:"Regarde ton carnet, {hero} : la toute première couleur de l'arc-en-ciel brille déjà, fière et chaude. Encore six couleurs à ramener, et {kingdom} resplendira de nouveau." },
  ]},
  ce1: { id:'mat_w_ce1', title:'L\'Orange est revenue !', crystal:'l\'Orange', pages:[
   { emoji:'🧡', text:"Les oranges retrouvent leur belle couleur, rondes et brillantes comme de petits soleils accrochés aux branches. Un parfum sucré flotte soudain dans tout le verger." },
   { emoji:'🐻', text:"L'ourson croque à pleines dents dans un fruit tout juteux : « Miam ! Merci {hero}, c'est encore meilleur que dans mes souvenirs ! » Il partage même un quartier avec Iris, ravie." },
   { emoji:'🌈', text:"Deux couleurs dans ton arc-en-ciel, {hero} ! Le pays retrouve peu à peu son sourire, et toi, tu deviens un vrai petit magicien des couleurs." },
  ]},
  ce2: { id:'mat_w_ce2', title:'Le Jaune est revenu !', crystal:'le Jaune', pages:[
   { emoji:'💛', text:"Les feuilles des Bois Dorés retrouvent leur jaune éclatant, et scintillent comme mille pièces d'or accrochées aux branches. La forêt entière semble s'illuminer d'un coup." },
   { emoji:'🦉', text:"Le vieux hibou fait « hou hou » de bonheur et cligne des yeux, ébloui : « Quelle lumière ! Merci, {hero}, je retrouve enfin mon chemin dans ces bois ! »" },
   { emoji:'🌈', text:"Trois couleurs déjà ! L'arc-en-ciel de ton carnet devient chaque jour plus beau, et {kingdom} retrouve, île après île, un peu de sa joie perdue." },
  ]},
  cm1: { id:'mat_w_cm1', title:'Le Vert est revenu !', crystal:'le Vert', pages:[
   { emoji:'💚', text:"Le vert coule sur les palmiers comme une pluie de printemps, et les carapaces des tortues retrouvent leurs jolis reflets émeraude. Le lagon tout entier scintille de nouveau." },
   { emoji:'🐢', text:"La vieille tortue plonge et replonge de joie, éclaboussant tout le monde en riant ! « Le lagon est redevenu magnifique, {hero}, comme dans mon plus beau souvenir. »" },
   { emoji:'🌈', text:"Quatre couleurs, {hero} ! Plus que deux étapes avant le Château du Soir. {villain} lui-même va bientôt voir quelque chose de merveilleux..." },
  ]},
  cm2: { id:'mat_w_cm2', title:'Le Bleu est revenu !', crystal:'le Bleu', pages:[
   { emoji:'💙', text:"Le ciel se teinte à nouveau d'un bleu profond, et les bleuets de la colline se redressent, fiers et colorés. Les cerfs-volants s'élancent enfin dans les airs !" },
   { emoji:'🐦', text:"Le petit oiseau tournoie de joie autour de toi : « Regarde, {hero}, le ciel est redevenu immense et bleu ! Je retrouve enfin le chemin de mon nid. »" },
   { emoji:'🌈', text:"Cinq couleurs dans ton arc-en-ciel ! Il ne manque plus que celle du soir, tout là-haut. Iris frissonne d'impatience : le grand moment approche." },
  ]},
 },
 epilogue: { id:'mat_epilogue', title:'L\'Arc-en-ciel complet', pages:[
  { emoji:'🌌', text:"Bravo, {hero} ! L'<b>indigo</b> du soir revient enfin, doux et profond comme un ciel d'été qui s'endort. Et là, sous tes yeux, {villain} ouvre grand les yeux : tout {kingdom} scintille soudain de mille couleurs retrouvées." },
  { emoji:'☁️', text:"« Comme... comme c'est beau, » murmure le nuage, sa voix tremblant un peu. Pour la première fois depuis si longtemps, il sent quelque chose de chaud lui monter au cœur. Une larme, presque invisible, roule le long de son pelage gris." },
  { emoji:'😊', text:"Et alors, {villain} fait quelque chose que personne n'attendait : il <b>sourit</b>. Un vrai sourire, tout doux, qui illumine son visage tout entier. Il n'est plus gris du tout — il rayonne, comme s'il avait toujours porté cette lumière en lui, cachée sous la tristesse." },
  { emoji:'💜', text:"« Merci, petit héros, » souffle-t-il. « Grâce à toi, j'ai retrouvé mes couleurs... et mon cœur avec. » Pour te remercier, il souffle doucement une couleur toute nouvelle, rien que pour toi : le <b>violet</b>, la septième et dernière couleur qui manquait à l'arc-en-ciel." },
  { emoji:'🦋', text:"Iris voltige tout autour de toi, resplendissante de toutes les couleurs à la fois — rouge, orange, jaune, vert, bleu, indigo, violet — comme un petit arc-en-ciel vivant. « On a réussi, {hero} ! On a réussi ensemble ! »" },
  { emoji:'🌈', text:"Regarde ton carnet : l'arc-en-ciel est enfin <b>complet</b> ! Les animaux de {kingdom} dansent de joie sur toutes les collines, et {villain}, désormais tout sourire, promet de veiller sur le pays pour toujours. <b>BRAVO, {hero}, petit héros des couleurs !</b>" },
  { emoji:'🌟', text:"« Puisque nous voilà amis, » ajoute {villain} avec un clin d'œil malicieux, « laisse-moi te raconter une histoire... celle du <b>Trésor au bout de l'Arc-en-ciel</b>. Une histoire de couleurs, de partage, et d'un petit lutin nommé Pim. »" },
  { emoji:'📖', text:"Cette histoire t'attend maintenant dans ton <b>carnet d'aventure</b> ! Ouvre-le, touche le bel arc-en-ciel tout complet (ou le bouton juste en dessous), et {villain} te la racontera avec grand plaisir." },
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
  { emoji:'📖', text:"Il était une fois un vieux Conteur, et un Livre pas comme les autres. Quand il l'ouvrait, les mots s'envolaient de ses pages comme des papillons multicolores : on entendait chanter les oiseaux, rire les enfants, souffler le vent dans les blés." },
  { emoji:'🪶', text:"Ce Livre magique gardait ainsi, bien à l'abri entre ses pages, tous les mots et toutes les histoires de {kingdom}. Depuis toujours, une petite plume blanche veillait sur lui, se posant délicatement sur chaque page tournée." },
  { emoji:'🌑', text:"Mais une nuit, <b>{villain}</b> entra par la fenêtre entrouverte, glissant sans un bruit. Il referma le Livre d'un coup sec — clap ! — et tous les mots s'échappèrent, effrayés, s'envolant aux quatre coins du monde." },
  { emoji:'😶', text:"Depuis ce jour terrible, les pages du Livre sont toutes blanches, désespérément vides. Le vieux Conteur, lui, ne raconte plus rien : il n'a même plus un seul mot à offrir." },
  { emoji:'🪶', text:"Alors la petite plume blanche — on l'appelle Plume — glisse doucement du Livre et vient se poser sur ta main. « Petit ami {hero}, veux-tu m'aider à retrouver tous les mots, page après page ? Notre histoire commence ici, maintenant. »" },
 ]},
 chapters: {
  cp: { id:'matfr_c_cp', title:'La Forêt des Animaux Muets', crystal:'la première page', pages:[
   { emoji:'🌲', text:"La première page t'emmène dans une grande forêt toute verte, pleine de grands arbres et de petits sentiers moussus. D'habitude, ça chante et ça gazouille du matin jusqu'au soir... mais aujourd'hui, plus un seul bruit ne se fait entendre." },
   { emoji:'🐾', text:"Plume voltige tristement d'une branche à l'autre. « Les animaux ont perdu leur voix, {hero}... Le chat ne miaule plus, le chien n'aboie plus, même le petit oiseau reste muet sur sa branche. »" },
   { emoji:'👂', text:"« Tends bien l'oreille, » chuchote Plume en se posant sur ton épaule. « Chaque animal a son propre cri, sa propre petite musique. Reconnais-les, un par un, et la forêt entière rechantera comme avant. »" },
   { emoji:'🍃', text:"Le silence de la forêt te donne des frissons, mais tu sens au fond de toi que tu sauras retrouver ces voix perdues. Un léger frémissement dans les buissons semble déjà t'attendre, plein d'espoir." },
  ]},
  ce1: { id:'matfr_c_ce1', title:'Le Pré des Premiers Mots', crystal:'la deuxième page', pages:[
   { emoji:'🌼', text:"Au bout de la forêt s'ouvre un grand pré tout doré, où l'herbe danse doucement sous la brise. Mais ici, quelque chose ne va pas du tout : plus personne ne sait comment s'appellent les choses, tout s'est mélangé dans une belle pagaille !" },
   { emoji:'🧺', text:"Un panier renversé gît au milieu du pré, débordant d'objets tout emmêlés : pommes, fleurs, cailloux, plumes... « Aide-moi à tout remettre en ordre, {hero}, » soupire Plume en voletant au-dessus du fouillis." },
   { emoji:'🔍', text:"« Nomme chaque chose que tu vois, » explique Plume, « et surtout, chasse le petit <b>intrus</b> qui s'est glissé là où il ne fallait vraiment pas ! Un objet qui n'a rien à faire avec les autres... »" },
   { emoji:'🌈', text:"En regardant bien, en nommant chaque chose une à une, tu sens que le pré commence déjà à retrouver un peu de ses couleurs. Plume applaudit de ses petites ailes, pleine d'entrain." },
  ]},
  ce2: { id:'matfr_c_ce2', title:'Les Collines qui Chantent', crystal:'la troisième page', pages:[
   { emoji:'⛰️', text:"Voici de grandes collines magiques qui ondulent à perte de vue. Quand on dit un mot tout fort ici, l'écho le renvoie aussitôt, mais découpé en petits morceaux rigolos : pa-pi-llon ! ma-man ! cha-peau !" },
   { emoji:'🧩', text:"« Ces petits morceaux, ce sont les <b>syllabes</b>, » explique Plume en sautillant sur une pierre. « Chaque mot en a plusieurs, cachées à l'intérieur, comme les pièces d'un petit puzzle sonore. »" },
   { emoji:'👏', text:"« Tape dans tes mains pour les compter, {hero} ! » t'encourage Plume. « Une syllabe, un tape-mains. Vas-y, écoute bien l'écho, et compte avec moi : les collines n'attendent que ça pour se remettre à chanter. »" },
   { emoji:'🎵', text:"Peu à peu, les collines frémissent d'un joli murmure musical, comme si elles retenaient leur souffle en t'écoutant compter. Plus tu joues avec les syllabes, plus leur chant semble vouloir renaître." },
  ]},
  cm1: { id:'matfr_c_cm1', title:'Le Lac aux Échos', crystal:'la quatrième page', pages:[
   { emoji:'💧', text:"Après les collines s'étend un lac tranquille, si calme qu'il ressemble à un immense miroir posé au creux de la vallée. Quand un mot tombe dans l'eau, comme une pierre, un autre mot lui répond aussitôt, en finissant tout pareil : chat... rat !" },
   { emoji:'🪷', text:"Plume se pose délicatement sur une feuille de nénuphar : « Ces mots qui sonnent pareil à la fin, {hero}, on les appelle des <b>rimes</b>. Le lac adore les rimes plus que tout au monde ! »" },
   { emoji:'🌊', text:"« Trouve les mots qui riment ensemble, » te souffle-t-elle, « et tu rendras au lac toutes ses plus belles chansons d'autrefois. Écoute bien la fin de chaque mot... »" },
   { emoji:'✨', text:"Chaque rime trouvée fait naître une ondulation joyeuse à la surface de l'eau. Le lac semble se réveiller doucement, comme s'il retrouvait, note après note, une mélodie oubliée depuis trop longtemps." },
  ]},
  cm2: { id:'matfr_c_cm2', title:'La Grotte des Premiers Sons', crystal:'la cinquième page', pages:[
   { emoji:'🕳️', text:"Voici une grotte fraîche et bleutée, tapissée de cristaux scintillants, où les sons aiment se cacher dans l'ombre. Chaque mot commence par un petit son bien à lui, comme une porte secrète qui s'ouvre tout doucement : sssserpent... mmmmaison..." },
   { emoji:'💎', text:"Plume voltige entre les stalactites, sa petite lumière dansant sur les parois. « Devine par quel son commence chaque mot, {hero}, et une étincelle de lumière s'allumera dans la roche. »" },
   { emoji:'✨', text:"« Écoute bien le tout début du mot, » murmure-t-elle. « C'est comme la première marche d'un escalier : sans elle, impossible de monter jusqu'au mot tout entier. » Une à une, les lumières commencent à scintiller autour de vous." },
   { emoji:'🌌', text:"Plus tu devines de sons, plus la grotte s'illumine, comme un ciel étoilé enfermé sous la terre. Bientôt, il ne reste plus qu'une petite zone d'ombre, juste avant la sortie." },
  ]},
  final: { id:'matfr_c_final', title:'Le Château des Lettres', crystal:'la dernière page', pages:[
   { emoji:'🏰', text:"Au sortir de la grotte se dresse fièrement le <b>Château des Lettres</b>, tout en pierres gravées. Le A pointu comme un petit toit, le O tout rond comme une bulle de savon... chaque lettre semble chanter sa propre petite chanson." },
   { emoji:'🪶', text:"Plume se pose sur ton épaule, soudain très sérieuse. « Tu es presque au bout du voyage, {hero}. C'est ici, dans ce château, que {villain} garde la toute dernière page du Livre. »" },
   { emoji:'🔤', text:"« Reconnais bien chaque lettre et sa chanson, » murmure-t-elle, « et le château ouvrira enfin sa dernière porte. » Un frisson d'excitation — et un peu d'appréhension — te parcourt devant les hautes tours de pierre." },
   { emoji:'🚪', text:"Tu t'avances vers l'entrée du château, prêt à affronter {villain} une dernière fois pour libérer la toute dernière page du Livre, et rendre enfin la parole à tout {kingdom}." },
  ]},
 },
 victories: {
  cp: { id:'matfr_w_cp', title:'Une page retrouvée !', crystal:'la première page', pages:[
   { emoji:'🐱', text:"Hourra ! Un miaou par-ci, un aboiement par-là, un pépiement tout là-haut... la forêt entière se réveille d'un coup ! Les animaux, un par un, retrouvent leur voix perdue." },
   { emoji:'🦋', text:"Plume voltige de joie tout autour de toi : « Tu les as tous reconnus, {hero} ! Écoute comme c'est beau, une forêt qui chante à nouveau ! »" },
   { emoji:'📖', text:"La première page du Livre se remplit soudain de mots tout neufs, encore un peu tremblants. Page après page, le Livre commence à revivre, et Plume en est folle de joie." },
  ]},
  ce1: { id:'matfr_w_ce1', title:'Une page retrouvée !', crystal:'la deuxième page', pages:[
   { emoji:'🍎', text:"Chaque chose a enfin retrouvé son nom : la pomme est une pomme, la fleur est une fleur, et l'intrus, démasqué, s'est enfui en courant ! Le pré tout entier retrouve ses couleurs d'un coup." },
   { emoji:'🌼', text:"« Bravo, {hero} ! » s'exclame Plume en tournoyant. « Nommer les choses, c'est un peu comme leur redonner vie. Regarde comme le pré est content ! »" },
   { emoji:'📖', text:"La deuxième page du Livre se couvre de jolis dessins colorés. Encore une page sauvée des griffes du Silence, et Plume rayonne de fierté." },
  ]},
  ce2: { id:'matfr_w_ce2', title:'Une page retrouvée !', crystal:'la troisième page', pages:[
   { emoji:'🎵', text:"Les collines résonnent de bonheur et te renvoient, en écho, leur plus belle musique — toutes les syllabes dansent joyeusement dans l'air du soir." },
   { emoji:'👏', text:"Plume applaudit de ses petites ailes : « Tu as si bien compté, {hero} ! Chaque syllabe retrouvée fait chanter un peu plus fort ces collines. »" },
   { emoji:'📖', text:"La troisième page se met à fredonner toute seule une petite mélodie, comme si elle n'attendait que ça depuis toujours. Bravo, petit ami des mots !" },
  ]},
  cm1: { id:'matfr_w_cm1', title:'Une page retrouvée !', crystal:'la quatrième page', pages:[
   { emoji:'🌟', text:"À chaque rime trouvée, une vaguelette joyeuse part danser sur l'eau du lac, de plus en plus loin, de plus en plus vite. Le lac tout entier te dit merci en scintillant sous le soleil." },
   { emoji:'👂', text:"« Quelle oreille fine tu as, {hero} ! » s'émerveille Plume. « Trouver les rimes, ce n'est pas si facile, et pourtant tu y arrives à merveille. »" },
   { emoji:'📖', text:"La quatrième page du Livre brille comme le soleil couchant sur l'eau calme. Déjà quatre pages sauvées ! Plus qu'une seule, et le Livre sera bientôt complet." },
  ]},
  cm2: { id:'matfr_w_cm2', title:'Une page retrouvée !', crystal:'la cinquième page', pages:[
   { emoji:'💡', text:"Une à une, les petites lumières s'allument dans la grotte : elle scintille maintenant comme un ciel rempli d'étoiles, cachée sous la terre." },
   { emoji:'🎉', text:"Plume rayonne littéralement de fierté : « Tu as deviné tous les sons, {hero} ! Bientôt, il ne restera plus que le Château des Lettres à explorer. »" },
   { emoji:'📖', text:"La cinquième page s'éclaire d'une douce clarté dorée. Plus qu'une seule page à sauver, {hero} — celle du grand Château tout là-haut !" },
  ]},
 },
 epilogue: { id:'matfr_epilogue', title:'La Dernière Page', pages:[
  { emoji:'🦋', text:"Il ne reste qu'une page blanche : la toute dernière. Tous les mots que tu as délivrés, page après page, tournoient maintenant autour de toi comme une nuée de papillons multicolores, prêts enfin à rentrer à la maison." },
  { emoji:'📖', text:"« Rassemble-les tous, {hero} ! » souffle Plume, des étincelles plein les yeux. Tu ouvres grand les bras... et un à un, dans un doux bruissement, les mots viennent se poser sur la dernière page. Le Livre se referme enfin, tout chaud, rempli à nouveau de vie." },
  { emoji:'🌟', text:"Vaincu, {villain} pousse un dernier soupir et s'enfuit par la fenêtre, dissous dans la nuit. Au même instant, la toute première étoile du soir se met à briller doucement dans le ciel qui s'éclaircit." },
  { emoji:'👴', text:"Le vieux Conteur ouvre lentement les yeux, comme au sortir d'un long sommeil. Il ouvre le Livre... et les mots s'envolent à nouveau, par milliers, illuminant toute la pièce ! « Tu as sauvé toutes les histoires du monde, {hero}. Merci, du fond du cœur. »" },
  { emoji:'📖', text:"« Maintenant que le Livre est enfin complet, » sourit le Conteur en caressant sa reliure usée, « il peut à nouveau raconter sa propre histoire — celle que je n'ai encore jamais osé te confier. »" },
  { emoji:'🔥', text:"« Approche-toi du feu, {hero}, » ajoute-t-il en tapotant la place juste à côté de lui. « Installe-toi bien confortablement... cette histoire, celle de mes origines, t'attend maintenant. Elle va commencer tout de suite, rien que pour toi. Et si un jour tu veux la réentendre, elle t'attendra bien sagement dans ton <b>Grand Livre</b>, au carnet d'aventure. »" },
 ]},
 // Histoire B — débloquée à la fin : le conte du Livre (origines du Conteur).
 bookTale: { id:'matfr_booktale', title:'Le conte du Livre', pages:[
  { emoji:'👴', text:"Il y a très longtemps, bien avant de devenir vieux et sage, le Conteur n'était qu'un tout petit garçon, pas plus grand que toi, avec des yeux curieux et les cheveux toujours ébouriffés par le vent." },
  { emoji:'🏚️', text:"Il vivait dans un village oublié de tous, tout au bout du monde, là où les chemins finissent par ne plus mener nulle part. Depuis des générations et des générations, les gens de ce village avaient peu à peu oublié comment parler." },
  { emoji:'🤫', text:"Ils avaient perdu leurs mots un par un, comme on perd des billes au fond d'une poche trouée, sans même s'en rendre compte. On ne s'y saluait plus le matin, on ne s'y racontait plus la moindre histoire le soir : un silence lourd et gris pesait sur les toits de chaume." },
  { emoji:'👂', text:"Mais le petit garçon avait un secret bien à lui, que personne d'autre au village ne semblait partager : il savait <b>écouter</b>. La pluie fine sur les toits, le feu qui craquait doucement dans l'âtre, le chant timide de l'oiseau matinal — pour lui, le monde entier bruissait de petites musiques cachées, que les autres ne semblaient même plus remarquer." },
  { emoji:'🌙', text:"Le soir, allongé sur sa paillasse, il fermait les yeux et écoutait encore : le grincement des volets, le souffle du vent dans la cheminée, les pas feutrés d'un chat sur le toit. Il se demandait souvent pourquoi lui seul entendait toute cette musique du monde." },
  { emoji:'🍂', text:"Un matin d'automne, alors qu'il ramassait des châtaignes tombées au pied d'un vieux chêne, il aperçut quelque chose qui brillait faiblement dans les feuilles mortes : une plume toute blanche, plus légère qu'un souffle de vent." },
  { emoji:'🪶', text:"À peine l'eut-il touchée du bout des doigts que la plume se mit à parler, tout doucement, d'une voix qui ressemblait à un murmure de ruisseau : « Toi qui sais si bien écouter... sais-tu que le monde entier est plein de mots qui n'attendent qu'une chose : qu'on veuille bien les recueillir, et les garder précieusement ? »" },
  { emoji:'📖', text:"Dans un éclat de lumière douce et chaude, un grand livre aux pages toutes blanches apparut soudain entre ses petites mains tremblantes d'émotion. « Voici mon Livre, dit la plume. Pars par le monde, petit garçon. Écoute partout où tu iras, et garde chaque mot précieux entre ces pages. Un Livre plein de mots, c'est un Livre plein de vie. »" },
  { emoji:'🎒', text:"Alors, sans un instant d'hésitation, le garçon fit son baluchon et partit dès le lendemain matin, le Livre bien serré tout contre son cœur. Il ne savait pas encore qu'il ne reverrait son village natal que bien des années plus tard." },
  { emoji:'🏜️', text:"Sa route le mena d'abord à travers un immense désert de sable doré, brûlant le jour et glacial la nuit. Là, autour d'un petit feu de camp, des voyageurs fatigués lui apprirent des mots d'espoir et de courage, pour continuer d'avancer même quand tout semble difficile." },
  { emoji:'🌲', text:"Il traversa d'abord de grandes forêts silencieuses et profondes, où il apprit patiemment à reconnaître le cri de chaque animal — et il les recueillit tous, un par un, dans les toutes premières pages encore neuves de son Livre." },
  { emoji:'🌾', text:"Puis il marcha longtemps à travers des prés immenses baignés de soleil, où des enfants riaient en jouant à des jeux qu'il ne connaissait pas encore, et il apprit d'eux des dizaines de mots joyeux : merci, s'il te plaît, viens jouer avec moi !" },
  { emoji:'⛰️', text:"Sur des collines lointaines et venteuses, une vieille femme au sourire ridé lui apprit des mots de réconfort, doux comme une berceuse, pour consoler ceux qui ont de la peine au cœur. Il les nota avec le plus grand soin, l'un après l'autre, sur une page à part." },
  { emoji:'🔨', text:"Dans un village de montagne où résonnaient sans cesse les coups de marteau, un vieil artisan lui enseigna des mots de patience et de travail bien fait — car construire quelque chose de beau, disait-il, cela prend du temps, comme apprivoiser un mot nouveau." },
  { emoji:'🌊', text:"Au bord d'un océan sans fin, sous un ciel immense, un vieux marin lui raconta des mots d'aventure et d'émerveillement, sentant le sel et le grand large. Le Livre devenait chaque jour un peu plus lourd, et un peu plus chaud entre ses mains." },
  { emoji:'✨', text:"Un mot, puis un autre, puis encore un autre : année après année, saison après saison, le Livre s'épaississait doucement, débordant de vie et de couleurs. Le petit garçon, lui, grandissait, puis vieillissait tout doucement, jusqu'à porter une longue barbe toute blanche." },
  { emoji:'🏡', text:"Un jour, enfin, après tant d'années d'errance, ses pas fatigués le ramenèrent vers son village d'origine, resté aussi silencieux et gris qu'au tout premier jour de son départ. Et là, devant tous les habitants réunis, intrigués par cet étranger à la barbe blanche, il ouvrit son Livre pour la toute première fois." },
  { emoji:'🦋', text:"Les mots s'envolèrent alors par centaines, comme une immense volée d'oiseaux multicolores s'échappant vers le ciel ! Quelqu'un osa dire « bonjour » d'une petite voix hésitante. Un autre répondit timidement « merci ». Un enfant, surpris par le son de sa propre voix, éclata soudain d'un rire clair et joyeux." },
  { emoji:'🎉', text:"Le village tout entier se réveilla d'un seul coup, comme au sortir d'un long, très long sommeil hivernal. On se raconta des histoires jusque tard dans la nuit, autour de grands feux, et plus jamais, plus jamais, le silence ne revint s'installer sur les toits." },
  { emoji:'👴', text:"C'est ainsi, page après page recueillie avec amour, que le petit garçon devint le Conteur que tu connais aujourd'hui — gardien du Livre, et de tous les mots du monde qu'il avait patiemment rassemblés au fil de son incroyable voyage." },
  { emoji:'🌑', text:"Mais quelque part, tapi dans le froid et l'oubli, guettant depuis toujours dans l'ombre, le Silence avait tout entendu de ce tout premier « bonjour »... et depuis cette nuit lointaine, il attendait patiemment la nuit où il pourrait enfin refermer le Livre pour de bon, et faire taire le monde entier." },
  { emoji:'🌙', text:"Cette nuit tant redoutée, c'est justement celle où {villain} est entré par la fenêtre du Conteur devenu vieux — et où, par un heureux et merveilleux hasard, commença ta propre aventure, {hero}." },
  { emoji:'💛', text:"Car tant qu'un enfant au cœur ouvert voudra bien tendre l'oreille et retrouver les mots perdus, page après page, avec patience et gentillesse, le Livre ne se taira plus jamais. « Garde-le bien précieusement, {hero}. Maintenant, sache-le : il est un peu le tien aussi. »" },
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
// v11.5.4 — ADR-22 étendue (bug corrigé, cf. dette technique section 17.5/18) :
// PRIM_ZONES n'a pas de champ `region` natif, donc _regionOfZone() retombait sur
// son cas spécial `zone.id==='sanctuaire'`, qui ne matche jamais un id préfixé
// (`primfr_sanctuaire`) ; la zone finale était alors mal résolue dans la région
// 'cm2' (même `level` que 'final') au lieu de 'final'. Comme pour PRIM_ZONES_HIST,
// on assigne désormais un `region` explicite à chaque zone pour ne plus dépendre
// de ce fallback ambigu.
const _PRIMFR_LEVEL_TO_REGION = {CP:'cp',CE1:'ce1',CE2:'ce2',CM1:'cm1',CM2:'cm2'};
const PRIM_ZONES_FR = (typeof PRIM_ZONES!=='undefined' ? PRIM_ZONES : []).map(z => Object.assign({}, z, {
 id:'primfr_'+z.id,
 label: _PRIMFR_ZONE_LABELS[z.id] || z.label,
 region: z.id==='sanctuaire' ? 'final' : (_PRIMFR_LEVEL_TO_REGION[z.level] || null),
}));
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
  { emoji:'📓', text:"Cher carnet. Aujourd'hui, mon père m'a offert ce carnet pour mes dix ans, en me disant : « Un jour, tu auras des choses importantes à raconter. » Il ne croyait pas si bien dire — mais je ne le savais pas encore, ce matin-là." },
  { emoji:'🦸', text:"Avant aujourd'hui, j'étais l'écolier le plus ordinaire de <b>Verbopolis</b> — la dernière ville où les gens se comprennent encore. Dehors, la <b>Guilde de la Rature</b> a brisé la langue commune des hommes, et plus personne ne se comprend." },
  { emoji:'🏙️', text:"Verbopolis, c'est une ville étrange et merveilleuse : les enseignes des magasins changent de mots selon l'humeur du quartier, les cloches de l'école sonnent en syllabes, et sur la place centrale, une immense horloge égraine non pas les heures, mais les histoires du jour." },
  { emoji:'👨‍👩‍👧', text:"Chez moi, mes parents ne savaient rien de tout cela. Pour eux, j'étais juste leur enfant un peu rêveur qui préférait les mots aux chiffres, qui inventait des histoires avant de s'endormir, et qui détestait par-dessus tout les dictées du vendredi." },
  { emoji:'✏️', text:"Justement, ce vendredi-là, Madame Rivière avait rendu ma dictée couverte de ratures rouges. « Encore des efforts, » avait-elle écrit. Je n'aurais jamais imaginé, en rentrant, tête basse, que cette même faiblesse deviendrait bientôt ma plus grande force." },
  { emoji:'🛡️', text:"Notre ville tient debout : elle est gardée par les <b>Gardiens de l'Alphabet</b>, qui repoussent chaque attaque de la Guilde et de son chef, {villain}. Moi, {hero}, je n'avais jamais eu peur… jusqu'à ce soir." },
  { emoji:'🌆', text:"Ce soir-là, je rentrais de l'école en traînant les pieds, la tête pleine d'une dictée ratée. Les réverbères de Verbopolis s'allumaient un à un, projetant des ombres de lettres dansantes sur les pavés, comme chaque soir depuis toujours." },
  { emoji:'🌑', text:"Une ombre grise m'a barré la route : <b>Mutisme</b>. Tous les sons se sont éteints. Sans réfléchir, j'ai voulu hurler « STOP » — et le mot est devenu un vrai <b>mur de pierre</b> ! Mes mots prennent vie ?!" },
  { emoji:'😱', text:"Le cœur battant, j'ai reculé contre mon propre mur de pierre, sans comprendre ce qui venait de se passer. Était-ce un rêve ? Une blague ? Mutisme s'approchait, silencieux et menaçant, et mon mur commençait déjà à s'effriter." },
  { emoji:'⚡', text:"Mutisme allait bondir quand une cape rouge a fendu la nuit : <b>L'Orateur</b>, le héros le plus célèbre de la ville ! Il a chassé le monstre : « Beau réflexe, gamin. Tes mots prennent vie. Viens — et ça commence par l'orthographe ! »" },
  { emoji:'🏛️', text:"C'est ainsi que je suis entré à l'<b>Académie des super-héros</b>. Sur le perron, <b>Dame Calligraphe</b>, la directrice, m'a dit : « Ici, un mot mal dit est un mot perdu. » Demain commence ma formation de héros — et puisque mes mots prennent vie, on m'a déjà trouvé un nom de code : désormais, je serai <b>Verbe</b>." },
  { emoji:'🛏️', text:"Cette nuit-là, je n'ai presque pas dormi. Allongé dans le petit dortoir de l'Académie, j'ai griffonné dans ce carnet, encore et encore, le mot « héros », juste pour voir s'il prendrait vie tout seul. Rien ne s'est passé. Mais demain, tout commence vraiment." },
 ]},
 chapters: {
  cp:    { id:'primfr_c_cp',  title:'Le district des Sons', crystal:'le pouvoir de la Voix', pages:[
   { emoji:'🔤', text:"Cher carnet. Pour impressionner les recrues, j'ai voulu un <b>bouclier</b> — j'ai dit « bouclié », et un truc tout mou m'est tombé sur le pied ! « Ton pouvoir n'accepte pas les fautes », a ri L'Orateur." },
   { emoji:'🗣️', text:"Le district est tombé sous la coupe de <b>Mutisme</b>, un sbire de la <b>Guilde de la Rature</b> qui a volé les voix. Pour le vaincre, je dois rendre à chaque lettre son chant : le <i>sss</i>, le <i>rrr</i>, le <i>ch</i>… Chaque <b>son</b> juste est une arme !" },
   { emoji:'🏚️', text:"Le district des Sons ressemble à une ville fantôme : les habitants ouvrent la bouche, mais rien n'en sort. Un vieux boulanger agite désespérément les bras devant sa vitrine vide, incapable de crier « pain chaud » à ses clients." },
   { emoji:'👥', text:"Deux autres élèves de l'Académie s'entraînent avec moi dans ce district : <b>Zoé</b>, une fille sérieuse qui ne se trompe jamais dans les sons complexes, et <b>Malo</b>, un grand rigolo qui bafouille exprès pour me faire rire — et me faire perdre ma concentration." },
   { emoji:'🎒', text:"Zoé et Malo ne se connaissaient pas avant l'Académie, mais tous deux ont vécu, comme moi, un premier soir terrifiant où leurs mots ont pris vie sans prévenir. Nous décidons, sur un coup de tête, de rester une vraie équipe pour toute la formation." },
   { emoji:'🐕', text:"Un chien errant aboie sans un bruit, la gueule grande ouverte, muet comme tout le quartier. Quand je parviens enfin à prononcer parfaitement « chien », un vrai chien doré apparaît à mes côtés en jappant de joie, comme s'il attendait ce mot depuis toujours." },
   { emoji:'🎓', text:"L'Orateur m'observe travailler, les bras croisés : « Un super-pouvoir sans maîtrise, c'est un danger, {hero}. Répète après moi : chaque son a sa place, et sa place ne bouge jamais. » Je répète, encore et encore, jusqu'à ce que ma voix ne tremble plus." },
   { emoji:'🔔', text:"Au sommet du beffroi du district, une cloche géante attend qu'on lui rende sa voix : elle ne sonne plus que des grincements informes. Il me faut prononcer « dong » avec une justesse parfaite, dix fois de suite, avant qu'elle ne retrouve son vrai timbre." },
   { emoji:'🌟', text:"Quand la cloche sonne enfin juste, tout le district semble reprendre son souffle : les volets s'ouvrent, les premiers murmures reviennent aux fenêtres. Mutisme, tapi dans une ruelle, comprend que son emprise touche à sa fin." },
   { emoji:'🥊', text:"Le combat final contre Mutisme se joue sans un geste, seulement à la voix : je dois prononcer, sans trembler, un mot différent à chaque pas qu'il fait vers moi. Malo compte les pas à voix haute pour m'aider à garder le rythme." },
   { emoji:'🎇', text:"Au douzième mot, exactement au moment où Mutisme tend une griffe grise vers moi, je crie « lumière ! » d'une voix si claire qu'une véritable lueur jaillit de mes mains, le repoussant net dans les ténèbres du district." },
   { emoji:'🎈', text:"Mutisme se dissout définitivement dans une volute de fumée grise, emportant avec lui le dernier silence du quartier. Des rires d'enfants, longtemps étouffés, résonnent à nouveau dans les cours d'école aux alentours." },
  ]},
  ce1:   { id:'primfr_c_ce1', title:'Le quartier de la Lecture', crystal:"le pouvoir d'enchaîner les mots", pages:[
   { emoji:'📖', text:"Nouveau vilain de la <b>Guilde de la Rature</b> : <b>Cacophon</b>, un tambour couvert de mille bouches qui brouille les syllabes. J'ai voulu une « échelle » ; j'ai bafouillé « léchelle » — et une langue géante a léché le mur !" },
   { emoji:'🎵', text:"« La lecture, c'est de la musique : chaque <b>syllabe</b> sur le bon temps ! » Alors j'apprends à enchaîner, calmement : <i>é–chel–le</i>. Plus je lis juste, plus mes mots sortent vite et nets." },
   { emoji:'📚', text:"Le quartier de la Lecture est une bibliothèque à ciel ouvert, où les livres flottent entre les immeubles. Mais depuis l'arrivée de Cacophon, leurs pages s'ouvrent et se referment toutes seules, dans un désordre assourdissant de syllabes mélangées." },
   { emoji:'🥁', text:"Cacophon lui-même est terrifiant à voir : un immense tambour ambulant, hérissé de bouches qui parlent toutes en même temps, dans un vacarme confus. Zoé se bouche les oreilles ; Malo, lui, essaie d'imiter le bruit pour rigoler." },
   { emoji:'👵', text:"Une vieille dame, bibliothécaire du quartier depuis toujours, me tend un livre ouvert : « Lis-moi ce mot, jeune Verbe, syllabe après syllabe, sans te presser. » Chaque syllabe correctement enchaînée referme une bouche de Cacophon, une à une." },
   { emoji:'🌉', text:"Au sommet d'un pont de mots suspendus, je dois lire une phrase entière à voix haute pour traverser sans tomber. Mon cœur bat fort, mais je prends mon temps : <i>syl-la-be a-près syl-la-be</i>. Le pont tient bon sous mes pieds." },
   { emoji:'🦉', text:"Une chouette de papier, pliée dans les pages d'un vieux roman, s'anime et se pose sur mon épaule chaque fois que je lis un mot correctement. Malo, jaloux, tente de la copier avec une feuille froissée — elle s'écrase lamentablement au sol." },
   { emoji:'🏆', text:"Face à Cacophon lui-même, je dois lire à voix haute, sans une hésitation, le poème entier gravé sur son tambour. Chaque syllabe bien enchaînée referme une nouvelle bouche, jusqu'à ce qu'il ne lui en reste plus qu'une, minuscule et tremblante." },
   { emoji:'📗', text:"La dernière bouche de Cacophon murmure un ultime défi : un mot si long que personne à l'Académie n'a jamais réussi à le lire d'une traite. Je respire un grand coup, syllabe après syllabe, et le prononce enfin en entier — parfait." },
   { emoji:'🎊', text:"Le tambour de Cacophon s'immobilise enfin, silencieux pour la première fois depuis son réveil. Les livres du quartier cessent de s'agiter et retrouvent leur place sur les étagères flottantes, comme apaisés par mon dernier mot bien lu." },
   { emoji:'📘', text:"La vieille bibliothécaire applaudit doucement depuis le seuil de sa boutique, un sourire ému sur le visage. « Tu liras encore beaucoup d'histoires, jeune Verbe, » murmure-t-elle. « Mais celle-ci, tu t'en souviendras toute ta vie. »" },
  ]},
  ce2:   { id:'primfr_c_ce2', title:'Les halles du Vocabulaire', crystal:'le pouvoir du mot juste', pages:[
   { emoji:'🧠', text:"Le pire ennemi de la Guilde, jusqu'ici : <b>Amnésios</b>, élégant et glacé, qui efface le <b>sens</b> des mots. Un boulanger m'a tendu un parapluie en croyant me donner du pain !" },
   { emoji:'🎯', text:"Mon pouvoir déraille : je dis « lampe » en pensant « lance ». « Connais le <b>sens</b> exact, ou ton pouvoir te trahira ! » Alors je réapprends les mots, leurs familles, leurs nuances." },
   { emoji:'🏪', text:"Les halles du Vocabulaire ressemblent à un immense marché où chaque étal devrait vendre un objet précis — mais depuis qu'Amnésios rôde, les étiquettes se sont toutes mélangées : un panier de pommes s'appelle « voiture », une balance s'appelle « nuage »." },
   { emoji:'🕴️', text:"Amnésios se déplace sans un bruit, tout de gris vêtu, effleurant les objets du bout des doigts pour effacer leur nom de la mémoire des gens. Là où il passe, même les marchands oublient ce qu'ils vendent." },
   { emoji:'👧', text:"Zoé et Malo m'aident à réétiqueter les étals, un par un, en discutant du sens exact de chaque mot : la nuance entre « content » et « joyeux », entre « grand » et « immense ». Malo se trompe exprès, juste pour le plaisir de me faire rire encore une fois." },
   { emoji:'🔍', text:"Au cœur des halles, je retrouve enfin le mot qu'Amnésios cherchait à effacer avant tous les autres : son propre nom d'avant, celui qu'il portait quand il était encore un simple élève de l'Académie, avant de rejoindre la Guilde." },
   { emoji:'⚖️', text:"Une marchande de légumes, complètement perdue, me tend une balance en l'appelant « violon ». Je dois lui rendre patiemment chaque mot juste, un par un, pendant qu'Amnésios ricane depuis l'ombre d'un étal, certain que je n'y arriverai jamais." },
   { emoji:'💫', text:"Face à Amnésios, notre duel se joue en une seule question : il me montre un objet, et je dois dire son nom exact sans la moindre hésitation. Un mot faux, et il efface un peu plus de mes propres souvenirs. Je ne peux pas me permettre une seule erreur." },
   { emoji:'🌈', text:"Amnésios me montre un dernier objet, le plus étrange de tous : un miroir. « Et celui-ci, {hero}, sais-tu comment on l'appelle ? » Je réponds sans hésiter : « Un miroir — celui qui montre qui on est vraiment. » Il vacille, comme frappé par sa propre question." },
   { emoji:'🍞', text:"Le boulanger du début, celui qui m'avait tendu un parapluie à la place du pain, retrouve enfin ses esprits et me serre la main, confus mais soulagé. « Merci, jeune Verbe. Je recommençais presque à croire que le pain s'appelait vraiment parapluie ! »" },
   { emoji:'🎪', text:"Toutes les halles retentissent bientôt des vrais noms retrouvés : « pommes ! », « pain ! », « fleurs ! » crient les marchands en chœur, comme une fête improvisée. Zoé note chaque mot dans son propre carnet, méthodique jusque dans la joie." },
  ]},
  cm1:   { id:'primfr_c_cm1', title:'La tour du Temps', crystal:'le pouvoir sur le temps', pages:[
   { emoji:'⏳', text:"La Guilde envoie un nouveau monstre : <b>Le Conjurateur</b>, un sablier vivant dont le sable coule à l'envers. Il fige les verbes hors du temps : tout le quartier est coincé dans un présent sans fin." },
   { emoji:'🏃', text:"J'ai crié « je bondirai ! » pour sauter un gouffre — et mon saut est arrivé <b>trop tard</b> ! « Le bon pouvoir au bon <b>temps</b> : présent pour maintenant, futur pour après ! »" },
   { emoji:'🏰', text:"La tour du Temps s'élève au centre d'une place où toutes les horloges de Verbopolis se sont arrêtées à la même seconde. Les passants, figés à mi-geste, semblent attendre un signal qui ne vient jamais." },
   { emoji:'⌛', text:"Le Conjurateur ricane depuis le sommet de sa tour, faisant tournoyer son sablier maléfique : « Ici, {hero}, plus rien ne passe, ni ne se termine, ni ne commence ! » Zoé, frustrée, tape du pied : elle déteste attendre." },
   { emoji:'📜', text:"Pour grimper la tour, je dois conjuguer chaque marche à voix haute, au bon temps exact : « je monte » pour l'instant présent, « je monterai » pour anticiper la marche suivante, « j'ai monté » pour celle déjà franchie. Un seul temps faux, et la marche se dérobe." },
   { emoji:'🕊️', text:"Malo trébuche sur un imparfait mal placé et manque de tomber ; je le rattrape juste à temps en criant « je te rattrape ! » au présent — et mes mains, aussi vives que mes mots, l'attrapent réellement avant la chute." },
   { emoji:'🌀', text:"Plus je grimpe, plus les temps se compliquent : passé composé, plus-que-parfait, futur antérieur. À chaque étage, une marche différente exige un temps précis, et je sens le sablier du Conjurateur s'accélérer, comme s'il sentait sa fin approcher." },
   { emoji:'⚔️', text:"Au sommet, le Conjurateur brandit son sablier géant, menaçant de figer tout Verbopolis dans un instant éternel. « Un seul temps, {hero}, et je gagne pour toujours ! » Je dois conjuguer une phrase entière, sans une seule erreur, pour briser son sortilège." },
   { emoji:'⏱️', text:"Je choisis mes mots avec soin : « Aujourd'hui je me bats, hier j'ai appris, et demain je continuerai. » Les trois temps résonnent d'un coup, et le sablier du Conjurateur se fissure enfin, laissant s'échapper tout le temps qu'il avait volé." },
   { emoji:'🌅', text:"Le temps reprend son cours normal dans tout le quartier : les passants figés reprennent leur geste interrompu, une horloge sonne enfin midi après l'avoir tenté en vain toute la matinée. Malo, encore essoufflé, s'exclame : « On a réparé le temps lui-même ! »" },
   { emoji:'🎁', text:"En remerciement, les habitants de la tour du Temps m'offrent une petite montre à gousset gravée d'un mot : « Patience ». Dame Calligraphe, informée de l'exploit, m'envoie un message glissé sous ma porte : « Bien joué, futur Gardien. »" },
  ]},
  cm2:   { id:'primfr_c_cm2', title:'La citadelle de la Phrase', crystal:'le pouvoir des phrases', pages:[
   { emoji:'🧩', text:"Dernier district, et le boss le plus retors de la <b>Guilde de la Rature</b> : <b>Syntax</b>, un marionnettiste qui mêle l'ordre des mots, secondé du <b>Scribe Noir</b> qui réécrit les livres en cachette." },
   { emoji:'🥽', text:"Mes pièges, ce sont les <b>homophones</b> : j'ai voulu un « ver », j'ai fait apparaître un <b>verre</b>, puis un <b>vers</b>, puis un mur <b>vert</b> ! « Le son ne suffit plus : il faut le sens ET l'orthographe. »" },
   { emoji:'🏯', text:"La citadelle de la Phrase se dresse, immense et labyrinthique, ses murs faits de mots emmêlés qui se réarrangent sans cesse. Syntax tire les ficelles depuis son trône de marionnettiste, mélangeant sujets, verbes et compléments au hasard." },
   { emoji:'✒️', text:"Le Scribe Noir, silhouette encapuchonnée, se faufile entre les rayonnages d'une bibliothèque secrète, changeant discrètement une lettre ici, un accord là, pour que plus aucun livre ne dise ce qu'il devrait dire." },
   { emoji:'🤝', text:"Zoé, Malo et moi formons enfin une vraie équipe : Zoé repère les accords fautifs d'un seul coup d'œil, Malo distrait Syntax avec ses bafouillages volontaires, et moi je reconstruis, phrase après phrase, l'ordre juste des mots." },
   { emoji:'🗝️', text:"Pour ouvrir la dernière porte de la citadelle, je dois former une phrase complète et parfaitement construite, avec sujet, verbe et complément à leur juste place. Au moment où je la prononce, la porte s'ouvre dans un grand souffle de vent." },
   { emoji:'🎭', text:"Derrière la porte, Syntax m'attend, tirant frénétiquement sur ses ficelles pour emmêler mes propres mots avant même que je ne les prononce. « Tes phrases seront miennes ! » hurle-t-il. Mais chaque fois qu'il tire, je réplique avec une construction encore plus solide." },
   { emoji:'📕', text:"Le Scribe Noir surgit à son tour, brandissant un livre qu'il vient de corrompre : il me le tend, me défiant de corriger chaque faute avant qu'il ne referme les pages pour toujours. Zoé, arrivée en renfort, m'aide à repérer les fautes les plus sournoises." },
   { emoji:'🌟', text:"Ensemble, phrase après phrase, nous corrigeons le livre entier. À la dernière ligne, Syntax lâche enfin ses ficelles, épuisé, et le Scribe Noir referme son capuchon, vaincu par la simple force d'une syntaxe bien construite." },
   { emoji:'🎊', text:"La citadelle entière se réorganise sous nos yeux : les murs de mots emmêlés reprennent leur ordre naturel, sujet-verbe-complément, comme une ville qui retrouve enfin son plan. Zoé pousse un « ouf » de soulagement bien mérité." },
   { emoji:'📚', text:"Le Scribe Noir, avant de s'enfuir dans la nuit, laisse tomber son livre corrompu — désormais parfaitement corrigé. Je le ramasse et le range soigneusement dans mon sac : une preuve, peut-être, à montrer un jour à Dame Calligraphe." },
  ]},
 },
 victories: {
  cp:  { id:'primfr_w_cp',  title:'Un pouvoir gagné !', crystal:'la Voix', pages:[
   { emoji:'🗯️', text:"Hourra ! J'ai prononcé, fort et clair, tous les sons volés — et <b>Mutisme</b> s'est dissous comme une fumée grise. Les voix sont revenues dans tout le quartier !" },
   { emoji:'🎖️', text:"Pouvoir gagné : <b>la Voix</b> — je fais surgir des mots simples, à condition de les dire parfaitement. Me voilà <b>Apprenti</b> ! (J'ai crié « victoir » : une banderole molle m'est retombée sur la tête.)" },
   { emoji:'🐕', text:"Le chien doré que j'avais fait apparaître plus tôt me suit désormais partout dans le district, comme s'il m'avait adopté. Zoé sourit, presque jalouse ; Malo, lui, essaie déjà de lui apprendre à aboyer des blagues." },
   { emoji:'🔔', text:"Le vieux boulanger, retrouvant enfin sa voix, me tend une brioche encore chaude en criant « merci » si fort que les vitres du quartier tremblent un peu. Toute la rue éclate de rire devant son enthousiasme retrouvé." },
  ]},
  ce1: { id:'primfr_w_ce1', title:'Un pouvoir gagné !', crystal:'la Lecture', pages:[
   { emoji:'🔊', text:"À chaque mot remis dans le bon ordre, une bouche de <b>Cacophon</b> se taisait. À la fin, la dernière a chuchoté « bravo » avant de disparaître !" },
   { emoji:'🎖️', text:"Pouvoir gagné : je peux <b>enchaîner plusieurs mots</b> sans me tromper — des phrases courtes qui prennent vie d'un coup. Grade d'<b>Écuyer</b> !" },
   { emoji:'📚', text:"La vieille bibliothécaire du quartier m'offre un petit livre en cadeau, chuchotant : « Ce livre-là, personne ne l'a jamais lu jusqu'au bout — mais toi, je crois que tu sauras. » Je le glisse précieusement dans mon carnet." },
   { emoji:'🦉', text:"La petite chouette de papier se pose définitivement sur l'épaule de ma veste d'uniforme, comme une médaille discrète. Malo insiste pour l'appeler « Syllabe » ; Zoé trouve ce nom ridicule, mais il reste." },
  ]},
  ce2: { id:'primfr_w_ce2', title:'Un pouvoir gagné !', crystal:'le Vocabulaire', pages:[
   { emoji:'💡', text:"J'ai rendu aux gens le sens de leurs mots, jusqu'à ce qu'<b>Amnésios</b> n'ait plus rien à effacer. « Tu te souviens de trop de choses… », a-t-il murmuré en s'évanouissant." },
   { emoji:'🎖️', text:"Pouvoir gagné : <b>le mot juste</b> — je fais surgir l'objet précis dont j'ai besoin. Grade de <b>Cadet</b> !" },
   { emoji:'🕴️', text:"Avant de s'évanouir tout à fait, Amnésios a laissé échapper un murmure étrange : « Merci de m'avoir rendu mon nom, même si j'ai déjà tout oublié de qui j'étais avant. » Je note cette phrase dans mon carnet, sans trop savoir pourquoi elle me trouble." },
   { emoji:'⚖️', text:"La marchande de légumes retrouve enfin sa balance et ses mots justes, et m'offre en remerciement le plus beau fruit de son étal. « Reviens quand tu veux, jeune Verbe, » dit-elle avec un clin d'œil complice." },
  ]},
  cm1: { id:'primfr_w_cm1', title:'Un pouvoir gagné !', crystal:'le Temps', pages:[
   { emoji:'🕰️', text:"J'ai conjugué plus vite que lui : à chaque verbe juste, je remettais une horloge à l'heure. Quand la dernière a sonné, <b>Le Conjurateur</b> s'est éteint comme une bougie." },
   { emoji:'🎖️', text:"Pouvoir gagné : j'agis sur le <b>temps court</b> — figer une seconde, relancer un geste. Grade de <b>Lieutenant</b> ! Dame Calligraphe a écrit « Progrès remarquables ». Une médaille, venant d'elle." },
   { emoji:'🤝', text:"Malo me remercie encore et encore de l'avoir rattrapé de justesse dans la tour. « Tu m'as sauvé au présent, » plaisante-t-il, « tu es vraiment devenu un héros du temps ! » Zoé lève les yeux au ciel, mais sourit malgré elle." },
   { emoji:'🕰️', text:"Toutes les horloges de la tour se remettent à sonner en cadence, comme un carillon triomphant. Le sablier du Conjurateur, désormais inoffensif, tombe à mes pieds — je le garde comme trophée, bien rangé au fond de mon sac." },
  ]},
  cm2: { id:'primfr_w_cm2', title:'Un pouvoir gagné !', crystal:'la Phrase', pages:[
   { emoji:'🏗️', text:"J'ai appris à bâtir des <b>phrases entières</b> — sujet, verbe, accords, le bon homophone — et mon pouvoir a changé d'échelle ! <b>Syntax</b> s'est emmêlé tout seul, et j'ai rattrapé le <b>Scribe Noir</b> d'une phrase bien tournée." },
   { emoji:'🎖️', text:"Grade de <b>Champion</b> ! Ce soir, L'Orateur est venu, sérieux : « Tu es prêt, {hero}. Les <b>Gardiens de l'Alphabet</b> t'attendent. Demain, on part pour l'île de la Rature. »" },
   { emoji:'👥', text:"Zoé et Malo m'accompagnent jusqu'au port, silencieux pour une fois. « On restera ici, à défendre Verbopolis, » dit Zoé. « Mais ton carnet, garde-le bien, » ajoute Malo. « Un jour, on voudra tout savoir de cette île. »" },
   { emoji:'🌅', text:"Sur le quai, avant d'embarquer, Dame Calligraphe me tend un dernier conseil : « Là où tu vas, {hero}, tes pouvoirs seront testés comme jamais. Souviens-toi : un mot juste, dit avec le cœur, vaut toutes les épées du monde. »" },
  ]},
 },
 epilogue: { id:'primfr_epilogue', title:"L'île de la Rature", pages:[
  { emoji:'⛵', text:"Cher carnet, je l'écris vite, on accoste. L'<b>île de la Rature</b> est noire, hérissée de tours. Autour de moi, les <b>Gardiens de l'Alphabet</b> au complet — et moi, {hero}, alias Verbe, debout parmi eux !" },
  { emoji:'🌊', text:"La traversée a duré toute la nuit. L'Orateur, à la proue du navire, m'a raconté comment lui-même avait vaincu son premier sbire de la Guilde, des années plus tôt, quand il n'était encore qu'un élève tout aussi terrifié que moi." },
  { emoji:'⚔️', text:"Pour atteindre {villain}, on repousse un à un tous ses sbires : Mutisme, Cacophon, Amnésios, le Conjurateur, Syntax. Chaque mot juste est un coup porté à l'ombre." },
  { emoji:'🌪️', text:"Le combat est plus rude que tout ce que j'avais affronté à l'Académie. Le Scribe Noir tente une dernière ruse, réécrivant nos propres phrases contre nous — mais Zoé, restée à Verbopolis, m'a appris à toujours vérifier deux fois mes accords, même en plein combat." },
  { emoji:'🏰', text:"Un à un, les Gardiens de l'Alphabet repoussent les derniers remparts de l'île. L'Orateur, à mes côtés, affronte lui-même un ultime piège de mots tordus, tandis que je me fraie un chemin vers la tour centrale où m'attend {villain}." },
  { emoji:'🌑', text:"Tout en haut de la dernière tour, il y avait <b>lui</b>. Plus petit que je l'imaginais. Plus triste, aussi. Dans ses yeux, pas de haine : de la <b>solitude</b>." },
  { emoji:'😔', text:"« Tu es venu me vaincre, » dit-il d'une voix lasse, presque douce. « Comme tous les autres avant toi. Mais aucun d'eux n'a jamais cherché à comprendre pourquoi. » Sa voix tremble légèrement, comme si elle n'avait pas servi depuis longtemps." },
  { emoji:'🗣️', text:"« Alors dis-moi, » je réponds, surprenant même L'Orateur derrière moi. « Pourquoi as-tu tout brisé ? » Le silence qui suit dure une éternité. Puis, lentement, {villain} commence à parler — pour la première fois depuis des années, quelqu'un l'écoute vraiment." },
  { emoji:'📖', text:"Il me raconte, par bribes hachées, une enfance solitaire, une langue inventée que personne ne comprenait, une colère née d'années de silence. Je l'écoute sans l'interrompre, comme Dame Calligraphe m'a appris à écouter un texte difficile : jusqu'au bout." },
  { emoji:'✨', text:"Quand il termine enfin son récit, un long silence s'installe entre nous, sur cette tour battue par le vent. Puis je lui tends la main, comme on tend un mot à quelqu'un qui en a besoin. « Il n'est pas trop tard, » dis-je simplement." },
  { emoji:'😨', text:"Mais {villain} recule d'un coup, comme effrayé par sa propre vulnérabilité. « Trop tard ! » hurle-t-il soudain, sa voix retrouvant toute sa dureté. « J'ai été seul trop longtemps pour croire encore à une main tendue ! » Ses yeux se voilent de noir, et l'air autour de lui se met à trembler dangereusement." },
  { emoji:'💬', text:"Il a lancé son plus terrible sort : un grand charabia où plus personne ne se comprenait. Alors j'ai prononcé, justes et vrais, les mots les plus simples — <i>bonjour, merci, ami, ensemble</i> — et chacun déchirait son charabia." },
  { emoji:'🕯️', text:"À chaque mot simple que je prononçais, une lueur traversait le regard de {villain}, comme un souvenir lointain qui refaisait surface. Il vacilla, porta les mains à ses tempes, et pour la première fois, ne riposta pas." },
  { emoji:'🛡️', text:"La <b>Guilde de la Rature</b> est tombée. Partout, les peuples ont recommencé à se parler. Et moi… je suis devenu <b>Gardien de l'Alphabet</b>, le plus jeune de tous." },
  { emoji:'🕊️', text:"Mutisme, Cacophon, Amnésios et le Sous-Entendu, libérés à leur tour de l'emprise de {villain}, restèrent d'abord immobiles au pied de la tour, hébétés, comme des gens qu'on réveille brutalement d'un très long sommeil. Personne ne savait s'il fallait les craindre encore, ou les plaindre." },
  { emoji:'🤲', text:"L'Orateur, contre l'avis de plusieurs Gardiens plus anciens, insista pour qu'on ne les enferme pas : « Ce ne sont pas des monstres, » dit-il, « ce sont des gens à qui on a fait beaucoup de mal, il y a longtemps. » On leur offrit, à chacun, une place tranquille dans un village discret, loin des regards, pour réapprendre à vivre parmi les autres." },
  { emoji:'🎉', text:"Sur le chemin du retour, L'Orateur me tend une médaille en argent gravée d'une simple lettre : un grand V, pour Verbe. « Bienvenue chez les Gardiens, » dit-il simplement. Je n'ai jamais été aussi fier de toute ma vie." },
  { emoji:'🚢', text:"Le navire du retour glisse doucement sur une mer redevenue calme. Autour de moi, les autres Gardiens de l'Alphabet racontent déjà leurs propres exploits d'antan, comme si j'étais désormais l'un des leurs à part entière — ce qui, je réalise soudain, est bel et bien le cas." },
  { emoji:'🏠', text:"À l'approche du port de Verbopolis, je distingue au loin Zoé et Malo qui agitent les bras depuis le quai. Malo a préparé une banderole de bienvenue, mais un mot est mal orthographié — je souris : certaines choses ne changent jamais." },
  { emoji:'🌟', text:"Dame Calligraphe m'attend elle aussi sur le quai, plus solennelle que d'habitude. « Tu as fait ce qu'aucun Gardien n'avait tenté avant toi, {hero} : tu as écouté l'ennemi. C'est peut-être le plus grand des super-pouvoirs. »" },
  { emoji:'📔', text:"Reste une question : pourquoi {villain} a-t-il voulu briser les mots ? À l'Académie, un vieux dossier raconte tout. J'ai le droit de l'ouvrir…" },
  { emoji:'📖', text:"Dame Calligraphe m'a tendu ce dossier avec gravité : « Ce que tu vas lire, {hero}, ne se trouve dans aucun autre carnet de l'Académie. Prends ton temps. » Ce soir, avant de dormir, je l'ouvrirai enfin, pour découvrir <b>Les origines du Docteur Babel</b> — et je pourrai le relire quand je veux, glissé pour toujours dans les pages de mon <b>Journal intime</b>." },
 ]},
  // Histoire B — débloquée à la fin : les origines du Docteur Babel.
 bookTale: { id:'primfr_booktale', title:'Les origines du Docteur Babel', pages:[
  { emoji:'👶', text:"Bien avant d'être le Docteur Babel, il fut un petit garçon. On l'appelait <b>Aldric</b>, l'enfant le plus intelligent que Verbopolis eût jamais porté. Trop, peut-être — car une intelligence trop grande, pour un cœur trop jeune, tient parfois moins d'un cadeau que d'une malédiction." },
  { emoji:'🧠', text:"À deux ans, il parlait comme un livre ; à quatre, il corrigeait ses maîtres ; à cinq, il trouvait les mots des grands trop pauvres pour dire ce qu'il avait dans la tête. Il habitait un palais fait de pensées immenses, et devait le décrire aux autres avec trois malheureux cailloux." },
  { emoji:'🏫', text:"À l'école de Verbopolis, les maîtresses ne savaient plus quoi faire de lui. On l'avança de classe en classe, jusqu'à ce qu'il se retrouve, à sept ans à peine, assis parmi des enfants deux fois plus âgés que lui, qui ne comprenaient ni ses questions ni ses silences." },
  { emoji:'🌳', text:"Il y eut pourtant, un temps, une petite lumière dans cette solitude : une fillette du nom d'<b>Élyne</b>, qui ne comprenait pas davantage ses mots savants, mais qui s'asseyait près de lui sous le grand chêne de la cour, sans exiger de lui qu'il parle autrement qu'il ne le pouvait." },
  { emoji:'☺️', text:"Avec Élyne, Aldric inventait des jeux sans un mot : des dessins dans la poussière, des sourires qui se répondaient, des silences qui, pour une fois, ne pesaient pas. Il crut, ces mois-là, qu'on pouvait être compris sans être entendu." },
  { emoji:'✈️', text:"Puis, un matin de printemps, la place d'Élyne resta vide. Sa famille avait déménagé sans prévenir, à l'autre bout du royaume, pour des raisons d'adulte qu'on n'expliqua jamais à un enfant de huit ans. Aldric ne la revit plus jamais, et n'osa plus s'approcher du grand chêne." },
  { emoji:'✨', text:"C'est cette année-là qu'il inventa <b>sa propre langue</b> : <i>le Verbe pur</i>, d'une précision vertigineuse, où chaque nuance de chagrin, chaque variation de lumière avait son mot exact, comme si aucune langue humaine n'avait jamais suffi à contenir tout ce qu'il ressentait." },
  { emoji:'📓', text:"Il en remplit des carnets entiers, d'une écriture serrée et fiévreuse, inventant des déclinaisons pour la nostalgie, des conjugaisons pour l'espoir qui s'effiloche, des mots composés pour ce sentiment très précis qu'on éprouve en revoyant, par hasard, la place vide sous un arbre. La plus belle langue du monde. Hélas, personne ne pouvait lui répondre — car personne d'autre que lui ne la parlait." },
  { emoji:'🌙', text:"Il existait, dans le Verbe pur, un mot — <i>ombrelune</i> — pour désigner cette tristesse particulière qu'on ressent un soir de pleine lune quand on aimerait la partager avec quelqu'un et qu'il n'y a personne ; un autre — <i>filgris</i> — pour ce fil ténu d'espoir qui subsiste malgré tout, même dans les jours les plus gris. Aucune langue humaine, avant ni depuis, n'avait su nommer si précisément ce que ressent un enfant seul." },
  { emoji:'🎂', text:"Le jour de ses neuf ans, encouragé par un maître bienveillant qui croyait voir là un don à célébrer, il récita devant toute la classe le plus beau poème du Verbe pur qu'il eût jamais composé — un poème sur l'amitié, et sur une fillette qui s'appelait Élyne." },
  { emoji:'🤐', text:"Silence. Un silence long, gêné, que personne ne sut comment rompre. Puis un élève au fond de la classe éclata de rire, suivi par un autre, puis par tous : « On n'a rien compris ! Parle normalement, le savant ! » Le maître lui-même, embarrassé, baissa les yeux sans le défendre." },
  { emoji:'💧', text:"Mais « normalement », pour Aldric, c'était parler petit, parler pauvre, parler comme on porte des habits trop étroits. Il voulait être compris <b>entièrement</b>, jusqu'au dernier repli de sa pensée — et il ne le fut jamais, pas même par sa propre mère, qui pleurait doucement le soir en l'entendant murmurer, dans son sommeil, des mots qu'elle ne reconnaissait pas." },
  { emoji:'🕯️', text:"Elle essaya pourtant, cette mère : elle apprit par cœur des listes entières de mots inventés par son fils, sans jamais en saisir le sens, juste pour pouvoir hocher la tête au bon moment quand il lui parlait. Aldric le devina très vite, et cela le blessa plus que l'indifférence n'aurait su le faire — car on ne peut pas se sentir compris par quelqu'un qui fait semblant." },
  { emoji:'🗼', text:"La solitude monta alors comme une eau froide, centimètre après centimètre. Il devint, en grandissant, un savant immense et seul, enfermé volontairement dans une tour pleine de livres qu'il était le seul à lire jusqu'au bout. Son palais de mots, peu à peu, était devenu sa prison." },
  { emoji:'📯', text:"Il tenta, une dernière fois, à l'âge adulte, de partager le Verbe pur avec le monde : il publia un traité entier, patiemment traduit dans la langue commune, expliquant chaque règle, chaque nuance de sa langue secrète. Les érudits de Verbopolis le saluèrent poliment, le rangèrent dans une bibliothèque… et l'oublièrent." },
  { emoji:'🎓', text:"Un seul, parmi tous ces érudits, prit la peine de le lire jusqu'au bout : le vieux <b>Professeur Ferrand</b>, qui enseignait la grammaire à l'Académie de Verbopolis. Il convoqua Aldric, feuilleta longuement le traité, puis soupira : « C'est brillant, jeune homme. Trop brillant, peut-être, pour être utile à qui que ce soit d'autre que vous. »" },
  { emoji:'💔', text:"Aldric espéra, l'espace d'un instant, que ces mots annonçaient une collaboration, un disciple, peut-être même un ami. Mais le professeur referma le traité, le lui rendit, et ajouta d'une voix lasse : « Une langue que l'on est seul à parler n'est pas une langue, jeune homme — c'est un deuil qu'on refuse de faire. » Puis il retourna à ses propres travaux, sans se retourner." },
  { emoji:'🚪', text:"Ce jour-là, en redescendant les marches de l'Académie, Aldric prit une décision silencieuse qu'il ne formula même pas clairement, pas même dans le Verbe pur : il cesserait, désormais, de chercher à être compris par le monde extérieur. Il se contenterait de son palais de mots, seul, puisque c'était visiblement là sa place. Il ne savait pas encore que cette résignation tranquille porterait, des années plus tard, un nom bien plus sombre." },
  { emoji:'⛈️', text:"Un soir d'orage, seul dans sa tour, face à ce traité que personne n'avait vraiment lu, une pensée terrible germa en lui, aussi simple que dévastatrice : « Si personne ne veut prendre la peine de me comprendre, alors plus personne ne comprendra personne. » Cette nuit-là, quelque chose se brisa en Aldric — et le <b>Docteur Babel</b> naquit de ces débris." },
  { emoji:'⚙️', text:"Il consacra les années suivantes à une œuvre terrible : une machine capable de <b>briser la langue commune</b> des hommes, de défaire un à un les fils invisibles qui relient une parole prononcée à l'oreille qui l'accueille. Pour construire un tel prodige, il lui fallait des mains — et il alla chercher, dans toute la région, ceux que les mots avaient blessés comme lui." },
  { emoji:'🔧', text:"Les trois premières années, la machine ne fit que grésiller et fumer, incapable de défaire quoi que ce soit de plus solide qu'un murmure. Aldric — car il n'était pas encore tout à fait Babel — recommença cent fois ses calculs, dormant à peine, mangeant à peine, ne vivant plus que pour cette unique idée obsédante." },
  { emoji:'🕰️', text:"Un an avant que la machine ne fonctionne enfin, sa mère, désormais très âgée, monta une dernière fois les marches de sa tour. Elle ne dit rien de la machine ; elle posa simplement, sur son établi encombré, un vieux carnet — le tout premier qu'il avait rempli, enfant, de mots inventés pour elle. « Je ne les ai jamais compris, » dit-elle, « mais je les ai gardés. » Il ne la revit plus jamais après ce jour : elle s'éteignit paisiblement l'hiver suivant, avant même que la machine ne s'éveille." },
  { emoji:'🏘️', text:"Le jour où la machine grésilla enfin sans fumée ni panne, Babel n'osa pas encore la retourner contre le monde entier : il choisit d'abord, avec la froideur méthodique d'un savant, un unique village de pêcheurs, isolé et sans importance, pour un premier essai discret." },
  { emoji:'🐟', text:"Le soir même, les pêcheurs du village se retrouvèrent incapables de se comprendre entre eux : l'un demandait du sel et recevait une corde, l'autre criait « au feu ! » et personne ne comprenait pourquoi il fallait courir. Babel observa la scène depuis une colline voisine, sans un mot, sans un frisson — sa machine fonctionnait." },
  { emoji:'😶', text:"Ce silence en lui, cette absence totale d'émotion devant la détresse d'innocents, le troubla pourtant un bref instant, quelque part au fond de lui-même, là où vivait encore, minuscule, ce qui restait du petit Aldric du grand chêne. Il choisit de ne pas s'y attarder, et referma ce sentiment comme on referme un livre qu'on ne veut plus lire." },
  { emoji:'🤍', text:"Le premier fut un <b>muet</b> de naissance, qu'on avait toujours écarté des conversations, comme s'il n'avait rien à y apporter. Enfant, on le plaçait au fond de la classe, on décidait à sa place, on parlait de lui devant lui comme s'il n'entendait pas non plus. Babel s'assit près de lui, des heures durant, sans exiger un seul mot — la première personne, depuis Élyne, à ne rien exiger de lui. L'homme muet devint <b>Mutisme</b>, gardien du silence qu'on lui avait imposé toute sa vie." },
  { emoji:'🥁', text:"Vint ensuite un enfant <b>bègue</b>, que ses camarades imitaient en riant chaque fois qu'il tentait de parler en classe. Un jour, devant tous, on lui demanda de réciter une simple poésie ; il resta bloqué sur le premier mot, syllabe après syllabe hachée, pendant que la classe entière comptait à voix haute, en se moquant, combien de temps il lui faudrait pour finir. Il ne reparla plus jamais en public après ce jour, préférant se taire tout à fait plutôt que d'affronter encore ces rires. Babel lui offrit un tambour, disant : « Que ce soit ta voix, désormais, puisque la tienne, on l'a brisée. » Ainsi naquit <b>Cacophon</b>." },
  { emoji:'🧊', text:"Une savante, ensuite, dont on n'avait jamais cru les découvertes parce qu'elle était une femme dans un monde qui n'écoutait que les hommes savants. On avait raturé son nom de tous les livres d'histoire. Babel le lui rendit, glacial de rage rentrée, et elle devint <b>Amnésios</b>, celle qui efface pour ne plus jamais être effacée la première." },
  { emoji:'📖', text:"Peut-être te souviens-tu, {hero}, de ce murmure étrange qu'Amnésios laissa échapper avant de s'évanouir, aux halles du Vocabulaire : « Merci de m'avoir rendu mon nom, même si j'ai déjà tout oublié de qui j'étais avant. » Ce nom, c'était bien celui-là — celui d'une savante qu'on avait un jour, injustement, rayé de tous les livres." },
  { emoji:'🔮', text:"Un voyant, enfin, qu'on avait longtemps pris pour un fou parce que ses phrases sonnaient toujours à moitié dites, énigmatiques, incomprises — comme si ses mots arrivaient toujours un instant avant la pensée qui les portait, laissant chacun deviner le reste sans jamais y parvenir tout à fait." },
  { emoji:'🗝️', text:"Babel l'écouta jusqu'au bout, une fois, une seule, sans jamais l'interrompre pour lui demander de « parler clairement » comme tous les autres l'avaient toujours fait. Cela suffit à en faire un allié fidèle entre tous : le <b>Sous-Entendu</b>, gardien de tout ce qu'on tait, de tout ce qu'on devine sans jamais oser le dire tout à fait." },
  { emoji:'🕯️', text:"Dans la forteresse de l'île de la Rature, ces quatre-là formèrent, sans jamais se l'avouer, une étrange petite famille : Mutisme et Cacophon jouaient parfois aux dames tard le soir, sans échanger un mot, se comprenant pourtant à la seule inclinaison d'un sourcil ; Amnésios réapprenait patiemment à Sous-Entendu les noms exacts des choses qu'il ne faisait jamais que suggérer." },
  { emoji:'🍵', text:"C'était, à sa manière tordue, la première vraie famille que chacun d'eux ait jamais connue — quatre solitudes que le monde avait rejetées, et qui avaient fini par se trouver les unes les autres, même au service d'une cause terrible. Babel les observait parfois depuis le seuil, presque ému, sans jamais oser se joindre tout à fait à leurs soirées silencieuses." },
  { emoji:'🤝', text:"À chacun d'eux, Babel fit la même promesse, douce en apparence et pourtant empoisonnée jusqu'à la racine : « Plus jamais vous ne souffrirez de n'être pas compris — car plus personne, nulle part, ne se comprendra plus jamais. » Ainsi naquit, tour après tour, la <b>Guilde de la Rature</b>." },
  { emoji:'🌍', text:"Le jour où la machine s'éveilla enfin, un frisson traversa la Terre entière. D'un bout à l'autre du monde, les mots se vidèrent de leur sens comme des coquilles abandonnées. Les peuples, un à un, cessèrent de se comprendre : ils se turent, se déchirèrent, se murèrent chacun dans son propre charabia." },
  { emoji:'🏝️', text:"Des villes entières, autrefois animées de mille conversations, sombrèrent dans un silence hébété, ou pire, dans des cris que plus personne ne savait interpréter. Le monde, jadis tissé de langues qui se répondaient, devint peu à peu cette mosaïque d'îles solitaires, chacune emmurée dans son propre babil." },
  { emoji:'🛡️', text:"Babel, certain de sa victoire totale, vint lui-même un jour se dresser devant les portes de Verbopolis, escorté de ses quatre lieutenants. Mais la ville tint bon : une poignée de citoyens, refusant que leurs mots s'éteignent, se dressèrent contre la Guilde. On les appela plus tard les tout premiers <b>Gardiens de l'Alphabet</b>." },
  { emoji:'⚔️', text:"Ce jour-là, Babel comprit, avec une fureur froide, qu'il ne parviendrait jamais à briser une ville qui s'obstinait à croire, contre toute raison, que se comprendre valait la peine de se battre. Il se retira dans son sanctuaire de l'île de la Rature, jurant de revenir un jour achever ce qu'il avait commencé — et il attendit, patient, pendant des générations entières." },
  { emoji:'🕯️', text:"Mais Babel, dans sa fureur de génie blessé, avait commis la plus belle des erreurs : il restait, quelque part, une ville obstinée qui continuait de croire que comprendre l'autre est ce qu'il y a de plus précieux au monde — <b>Verbopolis</b>, la dernière. Là naquit, quelques années plus tard, un garçon dont les mots, un jour, prendraient vie : <b>toi</b>." },
  { emoji:'🤝', text:"Car voici le secret que Babel n'avait jamais compris, lui qui avait pourtant consacré toute son existence aux mots : un mot juste n'est pas un mot <b>parfait</b>, ni un mot qu'on garde intact et pur pour soi seul. C'est un mot <b>partagé</b>, même imparfait, même bancal, même mal prononcé par un enfant qui bégaie. La langue commune n'était pas la prison qu'il avait crue : c'était un <b>pont</b>. Et Babel, sans le vouloir vraiment, avait passé sa vie à brûler des ponts qu'il aurait pu traverser." },
  { emoji:'👧', text:"Il y avait pourtant, tout ce temps, une chose que le Docteur Babel ignorait : loin de la Guilde, dans une autre région du royaume, une fillette devenue grande n'avait jamais oublié le petit garçon silencieux du grand chêne. Élyne, à sa façon, avait continué de chercher, toute sa vie, quelqu'un qui parlerait sa langue à elle — sans jamais savoir qu'elle en avait, sans le vouloir, inventé le tout premier mot." },
  { emoji:'📐', text:"Élyne devint, avec les années, maîtresse d'école dans un petit village loin de Verbopolis. On disait d'elle qu'elle avait un don étrange : celui de deviner, chez les enfants les plus silencieux, les plus étranges, ceux que les autres maîtres jugeaient trop bizarres pour être écoutés, quelque chose qui méritait pourtant qu'on s'assoie près d'eux, sans exiger qu'ils parlent autrement qu'ils ne le pouvaient." },
  { emoji:'🍃', text:"Elle ne sut jamais ce qu'était devenu le petit Aldric du grand chêne, ni que la Guilde de la Rature, qui menaçait désormais tout le royaume, était née d'un chagrin d'enfant qu'elle avait, sans le savoir, un peu adouci autrefois. Certains liens, dans une vie, restent invisibles — mais n'en sont pas moins réels pour autant." },
  { emoji:'🙏', text:"Le jour où tu l'as enfin vaincu, tout en haut de sa dernière tour, ce n'est pas ta force qui l'a désarmé, {hero} : c'est qu'un enfant, pour la première fois depuis Élyne, avait pris la peine de l'écouter jusqu'au bout, sans rire, sans se moquer, sans détourner le regard. Avant de disparaître, Babel prononça enfin le mot qu'il refusait de dire depuis l'enfance, dans la langue commune qu'il avait tant haïe : « <b>Pardon.</b> »" },
  { emoji:'💛', text:"Au même instant, très loin de là, un enfant que personne n'avait jamais su comprendre leva soudain la tête, sans trop savoir pourquoi : on venait, quelque part, de dire son prénom pour la toute première fois depuis des années. — {hero} referma le dossier, resta un long moment silencieux, puis écrivit dans son carnet : « Demain, j'irai m'asseoir près de celui qui reste seul dans la cour. Les mots les plus précieux, ça ne sert à rien si on les garde pour soi. »" },
  { emoji:'🕊️', text:"Dame Calligraphe, qui avait elle-même conservé ce dossier durant toutes ces années sans jamais oser le montrer à personne, referma la porte du bureau derrière {hero} avec un soulagement mêlé de tristesse. « Peut-être, » songea-t-elle, « fallait-il enfin qu'un enfant lise cette histoire jusqu'au bout — pour qu'aucun autre Aldric, un jour, n'ait à l'inventer une seconde fois. »" },
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
  { emoji:'🌙', text:"Ce soir-là, chacun dans sa chambre inspecta son présent. Noé remonta sa montre, qui égrena une heure parfaitement juste. Gaspard fit tourner sa boussole dans tous les sens, sans succès — il l'avait même essayée un peu plus tôt pour retrouver la salle de bain dans le couloir, et s'était retrouvé nez à nez avec le placard à balais. {hero}, désabusé, posa la petite aiguille sur la table de nuit, éteignit la lumière, et s\u2019endormit en pensant que grand-père, pour une fois, s\u2019était trompé de cadeau." },
  { emoji:'🌘', text:"Au cœur de la nuit, un bruit sourd tira {hero} du sommeil. Une ombre, penchée sur la table de nuit, se redressa d\u2019un coup et bondit par la fenêtre entrouverte, aussi silencieuse qu\u2019un chat. En allumant la lampe, {hero} découvrit la vérité : l\u2019aiguille avait disparu." },
  { emoji:'🏃', text:"{hero} réveilla Noé et Gaspard en pleine nuit. D\u2019abord sceptiques, les deux frères durent se rendre à l\u2019évidence : la petite aiguille de rien du tout venait bel et bien d\u2019être volée. Pourquoi s\u2019en prendre à l\u2019objet le moins précieux des trois ?" },
  { emoji:'🧓', text:"Grand-père Isidore n\u2019avait jamais été un grand-père comme les autres. Il passait ses journées entier dans son atelier à démonter des horloges pour le seul plaisir de les remonter autrement, et racontait aux trois frères, le soir, des histoires si précises sur des époques lointaines qu\u2019on aurait dit qu\u2019il y avait vécu lui-même." },
  { emoji:'🕯️', text:"{hero}, le plus jeune, avait toujours été celui qui restait le plus longtemps dans l\u2019atelier, à observer grand-père travailler en silence, sans jamais poser trop de questions — peut-être était-ce pour cela qu\u2019il avait reçu, en apparence, si peu à sa mort. Mais {hero} se souvenait d\u2019une chose que Noé et Gaspard avaient oubliée : Isidore répétait souvent, l\u2019air grave, que « les objets les plus discrets cachent parfois les plus grands secrets »." },
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
   { emoji:'🐾', text:"Une petite fille du clan, à peine plus jeune que {hero}, s\u2019approcha timidement, fascinée par ses vêtements si étranges. Sans un mot commun entre eux, elle lui tendit un morceau de silex taillé, comme on offre un cadeau à un ami qu\u2019on vient tout juste de rencontrer. Gaspard sourit : « On dirait que l\u2019amitié, elle, n\u2019a pas besoin de traverser le temps pour se comprendre. »" },
  ]},
  ce1: { id:'primhist_c_ce1', title:'Chapitre II — L\u2019Égypte antique', crystal:'Rouage des Bâtisseurs', pages:[
   { emoji:'🏜️', text:"Le mécanisme cracha les trois frères sur un sol de sable brûlant, au pied d\u2019un chantier titanesque : des milliers d\u2019ouvriers hâlaient d\u2019immenses blocs de pierre le long de rampes de terre battue, sous un soleil de plomb. La grande pyramide de Gizeh s\u2019élevait, encore inachevée, vers le ciel." },
   { emoji:'🪨', text:"Un bloc de calcaire massif, mal arrimé à ses cordages, s\u2019était renversé en travers de la rampe principale au moment même de leur arrivée, bloquant tout le convoi et provoquant une clameur d\u2019inquiétude parmi les ouvriers et les contremaîtres." },
   { emoji:'📜', text:"Un jeune scribe, tablette de cire à la main, s\u2019approcha des frères avec curiosité — leurs vêtements, si étranges, ne ressemblaient à rien de ce qu\u2019il connaissait. Il leur expliqua, dans un mélange de gestes et de mots, que ce bloc devait impérativement être posé avant le coucher du soleil, sous peine de retarder tout le chantier de plusieurs jours." },
   { emoji:'⏳', text:"Noé consulta sa montre : l\u2019aiguille de fortune, à peine stabilisée par le premier rouage, vibrait légèrement — un signe, pensa-t-il, qu\u2019ils approchaient d\u2019un moment où l\u2019Histoire pouvait basculer d\u2019un côté comme de l\u2019autre selon leurs actes." },
   { emoji:'👞', text:"Près d\u2019un entrepôt de cordages, Gaspard repéra une empreinte de semelle identique à celle de la Préhistoire, à demi effacée dans le sable. « Il est passé ici aussi », dit-il. « Et récemment, en plus. »" },
   { emoji:'🐪', text:"Pendant que Noé et Gaspard calculaient les meilleurs points d\u2019ancrage pour les cordages, {hero} remarqua un vieux contremaître qui s\u2019épongeait le front, épuisé, refusant obstinément de laisser quiconque le remplacer. « Ce bloc porte le nom de mon village natal, » confia-t-il. « Je veux le poser moi-même, ou le voir posé sous mes yeux. »" },
  ]},
  ce2: { id:'primhist_c_ce2', title:'Chapitre III — Rome antique', crystal:'Rouage du Cirque', pages:[
   { emoji:'🏛️', text:"Un vacarme assourdissant accueillit les trois frères : ils venaient d\u2019atterrir dans les gradins du Circus Maximus, en pleine course de chars, sous les acclamations d\u2019une foule immense agitant des étoffes colorées." },
   { emoji:'🐎', text:"En contrebas, sur la piste, un char venait de perdre une roue dans un virage serré, projetant son cocher au sol sous les cris horrifiés du public. L\u2019attelage, paniqué, menaçait de s\u2019emballer et de blesser les autres concurrents lancés à pleine vitesse." },
   { emoji:'💨', text:"Sans réfléchir, {hero} sauta par-dessus la balustrade et courut vers les chevaux affolés, saisissant les rênes traînantes à pleines mains. Gaspard, juste derrière, se jeta sur la roue brisée pour la dégager du sable avant qu'un autre char ne s'y empale à pleine vitesse." },
   { emoji:'⚔️', text:"Un vétéran des courses, assis non loin des frères dans les gradins, leur expliqua que ce cocher, jeune et prometteur, jouait ce jour-là sa toute dernière chance de gagner sa liberté d\u2019esclave — une victoire suffirait à convaincre son maître de l\u2019affranchir." },
   { emoji:'🛠️', text:"Gaspard, en observant l\u2019attelage endommagé, comprit qu\u2019il fallait faire vite : la course reprendrait dès que la piste serait dégagée, avec ou sans char réparé. {hero} sentit peser sur ses épaules le poids d\u2019une destinée qui n\u2019était pas la sienne, mais qu\u2019il ne pouvait ignorer." },
   { emoji:'👣', text:"Sous les gradins, près des écuries, Noé repéra une trace de semelle fraîche menant droit vers les coulisses du Circus — la même empreinte, encore et toujours, comme un fil rouge tissé à travers les siècles." },
   { emoji:'🍇', text:"Une esclave chargée de soigner les chevaux blessés partagea aux frères, entre deux gestes précis, une grappe de raisin encore fraîche : « Vous n\u2019êtes pas d\u2019ici, » dit-elle sans surprise dans la voix, « mais vous avez le regard de ceux qui viennent en aide, pas en ennemis. » Gaspard rangea précieusement cette phrase dans un coin de sa mémoire." },
  ]},
  cm1: { id:'primhist_c_cm1', title:'Chapitre IV — Le Moyen Âge', crystal:'Rouage du Siège', pages:[
   { emoji:'🏰', text:"Le mécanisme projeta les trois frères en pleine nuit, contre les remparts d\u2019une ville assiégée, dans le fracas lointain des bombardes et les cris des sentinelles. Des feux de camp anglais scintillaient tout autour des murailles d\u2019Orléans." },
   { emoji:'🌾', text:"Ils se glissèrent à l\u2019intérieur des fortifications à la faveur de l\u2019obscurité, et découvrirent une ville à bout de forces : les réserves de vivres s\u2019amenuisaient dangereusement, et le moral des défenseurs vacillait après des semaines de siège." },
   { emoji:'⚜️', text:"Une jeune femme en armure légère, entourée de soldats qui la regardaient avec un mélange de ferveur et d\u2019espoir, traversa la place en direction des remparts. « Jeanne », murmura un garde à proximité, presque en prière. Les frères comprirent qu\u2019ils venaient de croiser Jeanne d\u2019Arc elle-même." },
   { emoji:'😲', text:"Noé, d\u2019ordinaire si posé, resta un long moment silencieux après son passage. « Elle n\u2019a pas beaucoup plus d\u2019années que moi, » finit-il par murmurer, « et pourtant regarde comme une ville entière croit en elle. » Gaspard posa une main sur son épaule : « Peut-être que l\u2019âge n\u2019a jamais été la vraie mesure du courage, grand frère. »" },
   { emoji:'🌾', text:"Un capitaine épuisé expliqua aux frères qu\u2019un convoi de vivres, caché dans un chemin détourné à l\u2019extérieur des murs, n\u2019était encore jamais parvenu à franchir les lignes ennemies — et sans lui, la ville ne tiendrait plus très longtemps." },
   { emoji:'👞', text:"Sur le chemin de ronde, Noé remarqua une empreinte de botte identique aux précédentes, imprimée dans la boue fraîche près d\u2019une poterne dérobée. « Toujours la même trace », dit-il. « Il ne cherche pas à se cacher de nous. Il cherche autre chose. »" },
   { emoji:'🕯️', text:"Un très jeune archer, à peine plus âgé que Noé, veillait seul sur un créneau isolé, tremblant de froid autant que de peur. {hero} s\u2019assit un instant près de lui, sans un mot, simplement pour qu\u2019il ne soit plus tout à fait seul face à la nuit et à l\u2019ennemi qui rôdait au-delà des remparts." },
  ]},
  cm2: { id:'primhist_c_cm2', title:'Chapitre V — Les Temps modernes', crystal:'Rouage du Progrès', pages:[
   { emoji:'🗼', text:"Les trois frères atterrirent au beau milieu d\u2019une foule en habits du dimanche, sous une tour de fer immense qui s\u2019élançait vers le ciel parisien. Des banderoles annonçaient la grande inauguration officielle de la tour Eiffel, ce jour même." },
   { emoji:'⚙️', text:"Un incident venait de survenir dans les entrailles du monument : l\u2019un des ascenseurs hydrauliques, tout juste installé, refusait obstinément de fonctionner, menaçant de gâcher la cérémonie prévue devant les officiels et les journalistes du monde entier." },
   { emoji:'🎩', text:"Un ingénieur en redingote, dépassé par les événements et cerné de curieux, expliqua aux frères — qu\u2019il prit d\u2019abord pour de jeunes apprentis mécaniciens égarés — que sans cet ascenseur, l\u2019inauguration se déroulerait dans la confusion la plus totale devant la presse internationale." },
   { emoji:'🔩', text:"Gaspard, en observant le mécanisme hydraulique, sentit son cœur s\u2019accélérer : les pièces, les tuyaux, les soupapes — tout cela ressemblait, en plus grand, au mécanisme de leur propre montre-boussole. Comme si l\u2019esprit de leur grand-père avait, d\u2019une certaine façon, traversé les siècles jusqu\u2019ici." },
   { emoji:'👞', text:"Dans l\u2019agitation de la foule, {hero} aperçut, l\u2019espace d\u2019un instant, une silhouette au manteau sombre s\u2019éclipser derrière un pilier de fer — la même démarche pressée, la même trace de botte qu\u2019ils suivaient depuis la Préhistoire. Cette fois, ils étaient tout près." },
   { emoji:'📸', text:"Un jeune photographe, tout excité par son nouvel appareil encore fumant de magnésium, insista pour immortaliser les trois frères devant la tour, persuadé qu\u2019ils étaient des ingénieurs venus d\u2019un pays lointain. Gaspard, amusé malgré la tension du moment, ne put s\u2019empêcher de sourire pour la postérité." },
  ]},
  final: { id:'primhist_c_final', title:'Chapitre VI — L\u2019Atelier d\u2019Autrefois', crystal:'', pages:[
   { emoji:'🌫️', text:"Cinq Rouages en poche, les trois frères remontent une dernière fois le mécanisme de fortune. Mais cette fois, l\u2019aiguille ne vibre pas comme les autres fois : elle vise un point précis, presque paisible, comme si elle savait exactement où elle devait les mener." },
   { emoji:'🔧', text:"« Elle n\u2019a jamais été aussi stable », murmure Gaspard en observant le mécanisme luire d\u2019une lumière régulière. « On dirait qu\u2019elle... nous ramène quelque part de précis, pas juste n\u2019importe quand. »" },
   { emoji:'🚪', text:"Dans un dernier éclair, plus doux que les précédents, les trois frères se retrouvent devant la porte close d\u2019un atelier qu\u2019ils ne connaissent que trop bien — en plus jeune, en plus poussiéreux encore. Quelque chose, ici, attend d\u2019être résolu depuis bien longtemps." },
   { emoji:'🤝', text:"Noé, la main déjà posée sur la poignée, se retourna un instant vers ses deux frères. « Quoi qu\u2019il y ait derrière cette porte, » dit-il, la voix moins sûre qu\u2019à l\u2019accoutumée, « on l\u2019affrontera ensemble, comme on a traversé chaque époque. » Pour la première fois de leur odyssée, ce fut lui, l\u2019aîné si raisonnable, qui eut besoin d\u2019être rassuré — et {hero} le rassura à son tour." },
   { emoji:'😶', text:"Noé poussa la porte. Un grincement sinistre résonna dans le silence — puis rien. L'atelier semblait plongé dans l'obscurité la plus totale. Les trois frères échangèrent un regard et avancèrent d'un pas, le cœur battant, sans savoir ce qui les attendait." },
  ]},
 },
 victories: {
  cp: { id:'primhist_w_cp', title:'Le Feu Sacré', crystal:'Rouage du Feu Sacré', pages:[
   { emoji:'🔥', text:"Avec l\u2019aide du clan, les trois frères rassemblèrent bois sec, écorce et silex, et parvinrent à raviver la flamme juste avant qu\u2019elle ne s\u2019éteigne. Le vieil homme leva les bras au ciel en un cri de joie que tout le campement reprit en chœur." },
   { emoji:'🐾', text:"En signe de gratitude, le vieil homme tendit à {hero} un petit rouage d\u2019ivoire sculpté à même une défense de mammouth, encore chaud d\u2019avoir été façonné à la lueur du feu sauvé. « Le Rouage du Feu Sacré », murmura Gaspard en l\u2019examinant, émerveillé. « Le premier. »" },
   { emoji:'🗿', text:"Avant qu\u2019ils ne reprennent leur route à travers le temps, le vieil homme désigna, du doigt, la direction d\u2019où venait le vent ce matin-là — et mima, avec de grands gestes, une silhouette pressée, un bâton à la main, disparue depuis peu vers l\u2019horizon. {villain} était bel et bien passé par là." },
   { emoji:'🐾', text:"La petite fille du clan courut jusqu\u2019à {hero} pour lui offrir un dernier morceau de silex, plus poli que le premier, presque une petite sculpture. « On dirait un cadeau d\u2019adieu, » dit doucement {hero} en le glissant dans sa poche, aux côtés du Rouage du Feu Sacré." },
  ]},
  ce1: { id:'primhist_w_ce1', title:'Les Bâtisseurs', crystal:'Rouage des Bâtisseurs', pages:[
   { emoji:'🧵', text:"En coordonnant les efforts des ouvriers, en calant de nouveaux rondins sous le bloc et en réorganisant les équipes de tir sur les cordes, les trois frères parvinrent à redresser puis à hisser la pierre jusqu\u2019à sa place, juste avant que le soleil ne touche l\u2019horizon." },
   { emoji:'🏺', text:"Le contremaître en chef, impressionné, offrit aux frères un petit rouage doré, gravé de hiéroglyphes représentant un soleil et une pierre. « Le Rouage des Bâtisseurs », lut Gaspard à voix haute, en tentant de déchiffrer les symboles avec l\u2019aide du jeune scribe." },
   { emoji:'🔍', text:"Le jeune scribe, en les raccompagnant vers l\u2019endroit isolé où ils avaient atterri, mentionna qu\u2019un étranger était passé le mois précédent, posant d\u2019étranges questions sur « une femme perdue entre deux mondes ». Les frères se regardèrent, sentant qu\u2019ils touchaient à quelque chose d\u2019important." },
   { emoji:'🐪', text:"Le vieux contremaître, avant de les saluer, glissa dans la main de {hero} un petit morceau de calcaire poli, prélevé sur le bloc sauvé. « Pour te souvenir, jeune étranger, que même la pierre la plus lourde finit par trouver sa place. » {hero} le garda précieusement, sans trop savoir pourquoi ces mots le touchaient autant." },
  ]},
  ce2: { id:'primhist_w_ce2', title:'Le Cirque', crystal:'Rouage du Cirque', pages:[
   { emoji:'🔧', text:"À l\u2019aide d\u2019outils empruntés aux artisans des écuries, les trois frères parvinrent à réparer la roue et à calmer les chevaux à temps pour que le jeune cocher reprenne sa place sur la ligne de départ, sous un tonnerre d\u2019applaudissements." },
   { emoji:'🏆', text:"Le cocher, une fois la course achevée et sa liberté gagnée, vint remercier les frères en personne et leur offrit un petit rouage de bronze, frappé du symbole d\u2019un char ailé. « Le Rouage du Cirque », souffla {hero}, sentant l\u2019objet vibrer doucement entre ses doigts." },
   { emoji:'🕵️', text:"Le vétéran des courses, en guise d\u2019adieu, glissa aux frères qu\u2019un homme au manteau sombre avait, quelques semaines plus tôt, interrogé les prêtresses du temple voisin sur « le moyen de réparer une erreur du passé ». {villain}, décidément, les précédait toujours d\u2019un pas." },
   { emoji:'🍇', text:"L\u2019esclave soigneuse de chevaux, désormais libre elle aussi grâce à la victoire du cocher, retrouva les frères une dernière fois avant leur départ : « Où que vous alliez ensuite, » dit-elle, « gardez ce regard que vous avez. Il manque à beaucoup de monde, ici comme ailleurs. »" },
  ]},
  cm1: { id:'primhist_w_cm1', title:'Le Siège', crystal:'Rouage du Siège', pages:[
   { emoji:'🌾', text:"En empruntant discrètement le chemin détourné à la nuit tombée, les trois frères guidèrent le convoi de vivres jusqu\u2019à une poterne dérobée, évitant de justesse les patrouilles ennemies, et permirent enfin à la ville d\u2019être ravitaillée." },
   { emoji:'🔔', text:"Au petit matin, les cloches d\u2019Orléans sonnèrent à toute volée pour saluer l\u2019arrivée des vivres. Un vieux chevalier, reconnaissant, remit aux frères un rouage d\u2019argent finement ouvragé. « Le Rouage du Siège », lut Gaspard, ému malgré lui par la ferveur de la ville libérée." },
   { emoji:'🕯️', text:"Avant de reprendre leur route à travers le temps, le vieux chevalier confia aux frères qu\u2019un étranger encapuchonné avait, quelques jours plus tôt, demandé audience à Jeanne elle-même pour l\u2019interroger sur « les miracles capables de ramener les disparus ». {villain} cherchait toujours la même chose, quelle que soit l\u2019époque." },
   { emoji:'🏹', text:"Le jeune archer que {hero} avait réconforté sur le chemin de ronde retrouva le trio juste avant leur départ, un peu moins tremblant qu\u2019avant : « Grâce à vous, cette nuit m\u2019a paru moins longue. » Il tendit à {hero} une petite flèche de bois sans pointe, comme un porte-bonheur, avant de retourner à son poste, la tête un peu plus haute." },
  ]},
  cm2: { id:'primhist_w_cm2', title:'Le Progrès', crystal:'Rouage du Progrès', pages:[
   { emoji:'🔧', text:"En s\u2019inspirant du mécanisme familier de leur propre héritage, les trois frères aidèrent l\u2019ingénieur à identifier la soupape défectueuse et à la remplacer juste à temps, permettant à l\u2019ascenseur de fonctionner parfaitement pour la cérémonie officielle." },
   { emoji:'🎉', text:"Sous les applaudissements de la foule et les flashs des tout premiers appareils photo, l\u2019ingénieur, reconnaissant, tendit aux frères un rouage de cuivre étincelant. « Le Rouage du Progrès », souffla Noé, en le voyant s\u2019assembler presque naturellement avec les quatre autres au creux de sa montre." },
   { emoji:'✨', text:"Le mécanisme tout entier se mit soudain à vibrer d\u2019une lumière stable, presque apaisée — les cinq rouages réunis semblaient enfin donner un sens à l\u2019aiguille de fortune. Et au loin, entre les pieds de la tour de fer, la silhouette de {villain} s\u2019immobilisa un instant, avant de disparaître dans un éclair familier." },
   { emoji:'📸', text:"Le jeune photographe, avant de partir développer sa plaque, promit aux « ingénieurs étrangers » de leur faire parvenir un tirage — une promesse qu\u2019il ne pourrait, bien sûr, jamais tenir à travers les siècles. Gaspard sourit : « Quelque part, il doit exister une photo de nous trois, oubliée dans une malle poussiéreuse, depuis 1889. »" },
  ]},
 },
 epilogue: { id:'primhist_epilogue', title:'Épilogue — L\u2019Atelier d\u2019Autrefois', pages:[
  { emoji:'🔥', text:"Une explosion étouffée fit sursauter les trois frères : dans un coin de l\u2019atelier, un dispositif complexe crachait des étincelles bleutées autour d\u2019une jeune femme figée en plein mouvement, comme suspendue entre deux battements de cœur, un sourire inachevé sur les lèvres." },
  { emoji:'🕰️', text:"« Aline... », murmura une voix brisée derrière eux. {villain} se tenait là, bien plus jeune que le portrait que les frères s\u2019en étaient fait, le visage ravagé par des années de recherche acharnée. « Voilà des décennies que je cherche comment la libérer. »" },
  { emoji:'💔', text:"{villain} leur raconta tout : lui et le jeune Isidore avaient été les meilleurs amis, deux inventeurs rivaux et complices, travaillant ensemble sur une expérience de voyage dans le temps. Un mauvais réglage, une étincelle de trop, et Aline — venue leur porter le repas ce soir-là — s\u2019était retrouvée figée entre deux instants, ni tout à fait présente, ni tout à fait absente du monde." },
  { emoji:'😢', text:"« Isidore a eu peur », poursuivit {villain}, la voix tremblante. « Il a démonté la machine, dispersé les pièces à travers le temps par sécurité — la montre, la boussole, l\u2019aiguille — pour qu\u2019on ne puisse jamais recommencer une telle erreur. Moi, je n\u2019ai jamais cessé de la chercher, à travers chaque époque, avec les moyens du bord. »" },
  { emoji:'⚙️', text:"Les trois frères comprirent alors : ce n\u2019était pas la peur qui avait guidé {villain} tout au long de leur odyssée, mais un chagrin immense, tenace, jamais résigné. Ensemble, ils insérèrent les cinq rouages retrouvés dans le mécanisme complet, stabilisant enfin l\u2019aiguille de fortune pour la toute première fois." },
  { emoji:'🧭', text:"Gaspard, soudain, porta la main à sa poche : sa boussole, qui n\u2019avait jamais su pointer vers un nord connu, s\u2019était enfin immobilisée, son aiguille tremblante fixée sur Aline. « Elle n\u2019a jamais été cassée, » comprit-il, la gorge nouée. « Elle a passé tout ce temps à chercher, elle aussi, la personne qu\u2019il fallait retrouver. »" },
  { emoji:'✨', text:"Un rayon de lumière dorée enveloppa Aline. Son sourire inachevé se compléta enfin ; son regard s\u2019anima ; elle respira, comme si le temps reprenait son cours à l\u2019endroit exact où il s\u2019était arrêté. « J\u2019ai... j\u2019ai eu si froid », souffla-t-elle, avant de tomber dans les bras de {villain}, en larmes." },
  { emoji:'🕰️', text:"Aline mit un long moment à comprendre ce qui lui était arrivé : pour elle, à peine quelques secondes s\u2019étaient écoulées depuis le soir de l\u2019accident, tandis que {villain}, lui, avait vieilli de plusieurs décennies à la chercher sans relâche. « Tu as attendu tout ce temps... » murmura-t-elle, bouleversée, en découvrant les rides nouvelles sur son visage." },
  { emoji:'🤝', text:"Le jeune Isidore, alerté par le vacarme, apparut à son tour sur le seuil de l\u2019atelier — et resta interdit devant ces trois jeunes gens aux visages étrangement familiers. Un silence ému s\u2019installa, chargé de tout ce qui ne pouvait pas encore se dire." },
  { emoji:'🏡', text:"De retour dans leur propre époque, les trois frères posèrent la montre, la boussole et l\u2019aiguille — enfin réunies pour de bon — sur l\u2019établi de l\u2019atelier familial. « Un troisième héritage », dit Noé en souriant à {hero}. « Le plus précieux des trois, finalement. »" },
  { emoji:'📖', text:"Dans le tiroir secret de l\u2019établi, ils trouvèrent une dernière page du carnet de grand-père Isidore, écrite bien après les autres, d\u2019une main plus âgée et apaisée : « À qui trouvera ceci : le temps ne pardonne pas les erreurs, mais il permet parfois, à ceux qui ont le cœur assez grand, de les réparer. Merci d\u2019avoir fini ce que je n\u2019ai jamais osé terminer. »" },
  { emoji:'🤗', text:"{villain} et Aline, désormais libres de vivre le temps qu\u2019on leur avait volé, s\u2019installèrent non loin de l\u2019atelier familial. Chaque dimanche, {villain} venait partager avec les trois frères un café et une anecdote d\u2019une époque traversée — lui qui avait longtemps couru après le passé apprenait enfin à savourer le présent." },
  { emoji:'📚', text:"« Tu sais, » confia un jour {villain} à {hero}, en désignant les cinq époques qu\u2019ils avaient traversées ensemble sans jamais se croiser, « chacun de ces lieux garde encore bien plus d\u2019histoires que celles que nous y avons vécues. Ton grand-père, avant de partir, avait pris soin de tout consigner, époque par époque, dans des carnets séparés. » Il désigna, du regard, l\u2019étagère poussiéreuse du fond." },
  { emoji:'🗂️', text:"Ainsi naquirent, pour {hero}, les <b>Chroniques du Temps</b> : cinq tomes reliés, un pour chaque époque traversée, patiemment rédigés par grand-père Isidore lui-même — auxquels s\u2019ajouta bientôt un sixième, écrit à quatre mains par {villain} et {hero}, sur les plus grandes inventions ayant traversé l\u2019Histoire. Consulte ton <b>carnet d\u2019aventure</b> : chaque tome s\u2019y dévoile, région conquise après région conquise." },
 ]},
};
// ─── Histoire COLLÈGE : « Le Forgeron des Étoiles » (v10.2.0, mini-roman) ───
const _COL_VILLAIN = 'Léthéas, le Titan de l\'Oubli';
const _COL_KINGDOM = 'Sidéris';
const _COL_STORY = {
 intro: { id:'col_intro', title:'Le Forgeron des Étoiles', pages:[
  { emoji:'🌌', text:"Au commencement, il n'y avait que la nuit. Une nuit sans bord ni fond, épaisse comme un silence trop long. Puis vinrent les forgerons d'étoiles — des êtres que nul historien de {kingdom} ne sait plus nommer avec certitude — qui martelaient la lumière comme d'autres martèlent le fer, patiemment, coup après coup, jusqu'à ce que le noir cède." },
  { emoji:'✨', text:"De leurs forges naquit <b>{kingdom}</b>, un royaume suspendu entre les constellations, fait d'îles flottantes reliées par des ponts de lumière figée. Ici, chaque vérité mathématique démontrée faisait naître une étoile nouvelle au firmament — comme si l'univers lui-même tenait un registre scrupuleux de tout ce que l'esprit humain parvenait à percer à jour." },
  { emoji:'📖', text:"Les vieux disent que {kingdom} n'a pas de fondateur unique, mais des milliers : chaque élève qui, un jour, a compris pourquoi une preuve tenait debout, a ajouté sa pierre — ou plutôt son étincelle — à l'édifice commun. C'est un royaume qui ne cesse jamais tout à fait de se construire." },
  { emoji:'⚒️', text:"Le plus grand forgeron de tous s'appelle <b>Maître Alaric Forgétoile</b>. Il a vécu tant de siècles que sa barbe, dit-on, est faite de la même matière que les comètes : blanche, filante, jamais tout à fait immobile. Héritier d'une lignée de forgerons remontant à la nuit des temps, c'est lui qui perpétue et reforge, génération après génération, l'<b>Armure Solaire</b> : six pièces d'or stellaire, trempées dans le cœur d'un soleil mourant, capables de résister à l'oubli lui-même." },
  { emoji:'🔥', text:"On raconte qu'Alaric n'a pas toujours forgé seul. Dans les vieux registres de {kingdom}, certains noms ont été grattés avec un soin presque obsessionnel — comme si quelqu'un, quelque part, avait voulu qu'on oublie qu'il avait existé. Mais gratter un nom n'efface jamais tout à fait la marque qu'il a laissée." },
  { emoji:'🌑', text:"Car l'oubli, ici, a un nom : <b>Léthéas</b>. Le Titan. Là où passe son ombre, les nombres se taisent, les théorèmes s'effacent lettre par lettre comme une craie qu'on efface avant même d'avoir fini d'écrire, et les étoiles s'éteignent une à une, dans un silence que rien ne vient combler." },
  { emoji:'❓', text:"Nul ne sait d'où il vient, ni pourquoi il hait tant la lumière qu'il semble pourtant, par instants, regretter. Alaric, lui, détourne toujours les yeux quand on ose poser la question — un geste trop rapide pour être de l'indifférence, trop lent pour être tout à fait de l'oubli." },
  { emoji:'💥', text:"Une nuit — la pire nuit que {kingdom} ait jamais connue — Léthéas frappa la forge céleste elle-même, en plein cœur. L'Armure Solaire, posée sur son présentoir depuis des générations, vola en éclats dans un vacarme qui réveilla jusqu'aux îles les plus reculées." },
  { emoji:'💫', text:"Ses six pièces tombèrent du ciel comme des étoiles filantes inversées, dispersées aux quatre coins de {kingdom} — dans les ports, les cavernes, les plateaux gelés, les citadelles, les gorges volcaniques, jusqu'au sommet du monde. Depuis cette nuit-là, l'ombre gagne. Île après île. Étoile après étoile." },
  { emoji:'🏫', text:"Dans les écoles de {kingdom}, les maîtres avaient coutume d'enseigner que la lumière, une fois acquise, ne se perdait jamais. On ne l'enseigne plus ainsi, désormais. On enseigne, plus modestement, qu'il faut sans cesse la reconquérir — et c'est peut-être une leçon plus juste que l'ancienne." },
  { emoji:'🎓', text:"C'est alors qu'Alaric t'a trouvé, {hero}, errant sur les docks du premier port encore éclairé du royaume. Il t'a longuement observé résoudre, presque par jeu, un problème qu'un marchand avait abandonné depuis des semaines. Puis il a posé son marteau, pour la première fois depuis des années." },
  { emoji:'🗣️', text:"« L'or stellaire ne répond ni à la force, ni à la magie », dit-il, sa voix pareille à un tonnerre lointain et bienveillant. « Il répond à l'esprit. Résous, comprends, progresse — et chaque pièce reconnaîtra son porteur, comme elle m'a jadis reconnu, moi, quand j'avais ton âge et bien moins de certitudes que toi. »" },
  { emoji:'🚀', text:"Il n'a pas ajouté ce qu'il savait déjà : que retrouver l'Armure ne suffirait pas. Qu'il faudrait, tôt ou tard, affronter Léthéas — et qu'affronter Léthéas, pour Alaric, ressemblait à affronter un miroir qu'il refusait de regarder en face depuis bien trop longtemps. Ton odyssée commence, {hero}. La sienne, d'une certaine manière, recommence avec toi." },
  { emoji:'🔥', text:"Ce que peu d'élèves de {kingdom} savent, c'est que la forge d'Alaric elle-même n'a jamais été bâtie par un seul homme. Ses fondations, dit-on, reposent sur un socle d'or fondu à deux, dans une nuit si lointaine que même les registres les plus anciens peinent à en retrouver la date exacte." },
  { emoji:'📚', text:"Tu apprendras plus tard, bien plus tard, que cette nuit fondatrice avait un nom que personne ne prononçait plus depuis longtemps. Mais ce soir-là, dans la forge, tu n'étais encore qu'un jeune apprenti fraîchement recruté, ignorant tout des blessures anciennes que ton odyssée s'apprêtait à raviver." },
  { emoji:'🔨', text:"Avant de te laisser partir, Alaric t'a fait asseoir une dernière nuit dans sa forge, sur un tabouret bas taillé dans une pierre tombée du ciel. « Une preuve, » t'a-t-il dit, en martelant lentement une barre d'or ordinaire, « ne se termine jamais par la force. Elle se termine par la nécessité. On ne conclut pas parce qu'on est fatigué de chercher — on conclut parce que plus aucun autre chemin n'est possible. »" },
  { emoji:'⭐', text:"Il t'a montré, ce soir-là, comment une simple pièce de métal devient étincelle sous le bon geste, au bon instant — ni trop tôt, ni trop tard. « L'Armure jugera ta compréhension, pas ta rapidité, » a-t-il ajouté, presque en aparté. « Léthéas, lui, ira toujours plus vite que toi. Ne cours jamais après lui. Comprends, et il viendra à toi. »" },
  { emoji:'🌠', text:"Cette nuit-là, avant de t'endormir dans le petit dortoir attenant à la forge, tu as observé longuement le ciel de {kingdom} par la lucarne : la moitié des étoiles semblait scintiller avec assurance, l'autre moitié vacillait, fragile, comme prête à s'éteindre au moindre souffle. Tu as compris, confusément, que ton odyssée ne consisterait pas seulement à combattre, mais à raviver ce qui menaçait de disparaître." },
  { emoji:'👧', text:"Tu n'étais pas le seul apprenti dans la forge, cette nuit-là. Une jeune fille au regard vif, <b>Elara</b>, s'entraînait déjà depuis plusieurs mois auprès d'Alaric — plus rapide que toi à calculer, plus assurée dans ses gestes, et visiblement peu ravie de devoir désormais partager l'attention du vieux forgeron avec un débutant tout juste tombé du port." },
  { emoji:'🤨', text:"« Un autre apprenti, » avait-elle soupiré en te toisant des pieds à la tête. « Alaric en trouve un tous les cent ans, et il fallait que ce soit maintenant. » Puis, plus bas, presque malgré elle : « Enfin... si l'Armure t'a choisi, j'imagine que je n'ai pas mon mot à dire. Mais ne compte pas sur moi pour te faciliter la tâche, petit nouveau. »" },
 ]},
 chapters: {
  cp:    { id:'col_c_cp',  title:'Le Port des Décimales', crystal:'la Jambière Gauche', pages:[
   { emoji:'⚓', text:"Le <b>Port des Décimales</b> fut le premier touché — logique, pensent certains sages, puisque c'est par les nombres les plus quotidiens que tout déséquilibre commence toujours à se répandre. Le brouillard de Léthéas y a tout déréglé : les virgules dérivent comme des bateaux sans amarres, glissant d'une position à l'autre sans jamais se fixer." },
   { emoji:'⚖️', text:"Les balances des marchands mentent effrontément : un sac de blé pèse tantôt douze kilos, tantôt cent vingt, selon l'humeur capricieuse du brouillard. Les marins eux-mêmes ne savent plus calculer la distance qui les sépare du port suivant, et certains bateaux tournent en rond depuis des jours, incapables de fixer un cap." },
   { emoji:'👴', text:"Un vieux docker, assis sur une caisse renversée, t'aborde dès ton arrivée : « Jeune apprenti forgeron, si c'est bien ce que tu es, aide-nous. Ma fille tient l'échoppe de poissons, là-bas — mais depuis trois jours, elle ne parvient plus à rendre la monnaie juste à personne, et les clients commencent à s'impatienter, voire à l'accuser de les voler. »" },
   { emoji:'🐟', text:"Sa fille, une jeune femme au regard fatigué, te montre son étal : des prix affichés en nombres décimaux qui semblent danser sous tes yeux dès que tu tentes de les fixer. « Deux virgule trois, ou vingt-trois virgule zéro ? Je ne sais plus où va la virgule, » soupire-t-elle, presque en larmes." },
   { emoji:'🗺️', text:"« La <b>Jambière Gauche</b> est tombée quelque part dans ces docks », t'écrit Alaric par un message porté sur l'aile d'un oiseau de lumière. « C'est la pièce de l'<b>Aplomb</b> : celui qui la porte ne vacille jamais, ni sur ses appuis, ni dans ses calculs. Commence par remettre de l'ordre dans les nombres de ce port — l'or t'observera, discrètement, avant de se révéler. »" },
   { emoji:'🔍', text:"Tu comprends vite le principe du brouillard de Léthéas : il ne détruit rien, il déplace — une virgule d'un cran, un zéro de trop ou de trop peu — de sorte que chaque erreur semble presque plausible, presque anodine, jusqu'à ce que tout l'édifice s'effondre sous son propre désordre accumulé." },
   { emoji:'🌊', text:"Au bout du plus long des quais, sous une pluie fine qui semble elle-même hésiter sur son intensité, tu sens une chaleur familière monter du sol : de l'or, enfoui sous les planches disjointes, qui semble battre comme un cœur au rythme de tes propres calculs, de plus en plus vif à mesure que tu approches de la vérité." },
   { emoji:'🚢', text:"Un capitaine borgne, célèbre dans tout le port pour n'avoir jamais fait naufrage en quarante ans de navigation, t'arrête sur le chemin du quai : « Jeune forgeron, méfie-toi de croire que le brouillard ne touche que les nombres des autres. J'ai vu des marins bien plus aguerris que toi perdre pied sur une simple virgule mal placée, et ne jamais retrouver leur route. »" },
   { emoji:'🧮', text:"Il te raconte alors, à mi-voix, qu'un ancien élève d'Alaric — un garçon brillant, dit-on, presque aussi doué que le maître lui-même — était passé par ce même port, des années plus tôt, avant de disparaître sans laisser de traces. « On ne parle plus jamais de lui, ici. C'est comme si la mer elle-même avait décidé d'effacer son nom des registres. »" },
   { emoji:'👧', text:"Elara t'attend déjà sur le quai suivant, les bras croisés, un sourire moqueur aux lèvres : « Alors, petit nouveau, combien de temps t'a-t-il fallu pour comprendre qu'une virgule mal placée peut couler un bateau entier ? » Tu remarques, malgré son ton acerbe, qu'elle a déjà résolu la moitié des désordres du port avant même ton arrivée." },
   { emoji:'⚡', text:"« Ne me remercie pas, » ajoute-t-elle sèchement en te voyant esquisser un sourire reconnaissant. « Je ne t'aide pas. Je m'assure juste qu'Alaric n'ait pas perdu son temps à recruter un incapable. » Son ton est glacial, mais tu remarques qu'elle reste malgré tout à tes côtés, plus longtemps que nécessaire." },
   { emoji:'🧾', text:"Le véritable épreuve du port t'attend dans l'entrepôt principal, où un registre entier de cargaisons doit être recompté avant l'arrivée de la marée du soir : des centaines de nombres décimaux à comparer, ordonner, additionner sous la pression du temps qui s'écoule — un exercice qu'Alaric t'a fait pratiquer cent fois dans sa forge, mais jamais avec un tel enjeu réel derrière chaque chiffre." },
   { emoji:'💪', text:"Quand le dernier nombre trouve enfin sa juste place dans le registre, l'entrepôt entier semble respirer différemment : les employés, épuisés mais soulagés, rangent les caisses dans un ordre qui, pour la première fois depuis des semaines, a un sens. Tu comprends alors une chose qu'Alaric ne t'avait jamais dite aussi clairement : la précision n'est pas qu'une discipline abstraite — c'est un service qu'on rend, concrètement, à ceux qui en ont besoin." },
   { emoji:'🗺️', text:"Alors que tu t'apprêtes à quitter le port, le capitaine borgne t'arrête une dernière fois : « Une chose encore, jeune forgeron. Cet ancien élève dont je te parlais... on disait de lui qu'il naviguait à l'instinct, sans jamais vérifier ses calculs. Peut-être est-ce pour cela qu'il a fini par sombrer, quelque part, loin de tout port. »" },
   { emoji:'⚓', text:"Tu ranges cette confidence au fond de ta mémoire, sans encore comprendre à quel point elle éclairera, bien plus tard, le sens profond du combat qui t'attend. Le capitaine, avant de te laisser partir, ajoute une dernière chose : « Vérifie toujours deux fois, jeune forgeron. Même — surtout — quand tu es sûr d'avoir raison. »" },
   { emoji:'🌅', text:"Tu quittes le Port des Décimales au lever du jour, le registre entier désormais en ordre, les balances justes, la mémoire du capitaine et de sa mise en garde gravée quelque part au fond de toi. Devant toi s'étend la forêt qui mène aux Cavernes Fractionnaires — ta prochaine épreuve, et avec elle, sans doute, de nouvelles réponses." },
  ]},
  ce1:   { id:'col_c_ce1', title:'Les Cavernes Fractionnaires', crystal:'la Jambière Droite', pages:[
   { emoji:'🍰', text:"Sous la forêt qui borde le port, les <b>Cavernes Fractionnaires</b> résonnent d'un silence étrange, presque religieux. Ici, jadis, on enseignait l'art ancien du partage : tout, absolument tout, se divisait en parts justes et named — un gâteau, un héritage, une responsabilité, une douleur même." },
   { emoji:'🕳️', text:"Léthéas a brisé cette harmonie patiemment tissée : les parts ne s'assemblent plus. Des pans entiers de galeries se sont effondrés parce que des fractions mal réduites ne supportaient plus le poids de la roche qu'elles étaient censées équilibrer — une image un peu folle, mais qui dit peut-être une vérité plus grande sur ce royaume." },
   { emoji:'👦', text:"Un jeune garçon, à peine plus jeune que toi, erre dans la première galerie en pleurant doucement. « On était trois frères à devoir se partager la dernière lanterne magique de notre père, » explique-t-il. « Personne n'arrive à calculer une part qui soit juste pour chacun. Alors on ne se parle plus, on reste chacun dans le noir, séparément. »" },
   { emoji:'💡', text:"Tu l'aides à comprendre qu'une fraction n'est jamais un simple nombre isolé, mais toujours une relation — entre une part et un tout, entre un frère et ses frères. Le garçon repart en courant, une lueur nouvelle dans les yeux, presque aussi vive que celle de la lanterne qu'il tenait tant à partager équitablement." },
   { emoji:'⚒️', text:"« La <b>Jambière Droite</b> gît au plus profond des galeries », dit Alaric, sa voix résonnant comme depuis l'intérieur même de la pierre. « C'est la pièce de l'<b>Élan</b> : la vitesse de celui qui enchaîne les calculs sans jamais trébucher sur un dénominateur mal choisi. Méfie-toi, petit forgeron — les fractions ne pardonnent jamais une simplification bâclée. »" },
   { emoji:'🕯️', text:"Plus tu avances dans l'obscurité humide des galeries, plus tu remarques d'anciennes fresques gravées dans la roche : des parts de cercle soigneusement dessinées, des additions de fractions accompagnées de petits dessins d'enfants partageant un repas. Ce lieu, comprends-tu, n'était pas qu'une école : c'était un sanctuaire dédié à l'idée même de justice." },
   { emoji:'✨', text:"Tout au fond de la dernière galerie, sous un amas de pierres qu'il te faut déblayer fraction par fraction — littéralement, en résolvant chaque calcul gravé sur les blocs pour les faire disparaître un à un — l'or de la Jambière Droite palpite enfin, comme impatient d'être enfin réuni à sa jumelle." },
   { emoji:'🕵️', text:"Sur le mur le plus reculé de cette dernière galerie, presque invisible sous une fine couche de poussière ancienne, tu déchiffres une inscription gravée d'une main visiblement pressée, presque colérique : « Pourquoi diviser toujours à parts égales ? Certains méritent plus. » La phrase te glace, sans que tu comprennes tout à fait pourquoi." },
   { emoji:'👧', text:"Elara, qui t'a suivi discrètement dans les galeries « juste pour vérifier que tu ne t'effondres pas comme les blocs mal calculés », découvre l'inscription en même temps que toi. Son visage, d'ordinaire si assuré, blêmit visiblement. « Cette écriture... » murmure-t-elle, avant de se reprendre aussitôt. « Ce n'est rien. Continue, petit nouveau. »" },
   { emoji:'⛏️', text:"Au centre des cavernes s'étend un immense puzzle de pierre : des dizaines de blocs gravés de fractions différentes, qu'il faut assembler par ordre croissant pour reconstituer le pont qui traverse le gouffre central. Une seule fraction mal réduite, un seul dénominateur commun mal trouvé, et le bloc entier se dérobe sous tes pieds dans un vide qui semble ne jamais finir." },
   { emoji:'🌉', text:"Elara, malgré ses réticences initiales à t'aider ouvertement, finit par te souffler discrètement la méthode qu'elle utilise elle-même pour trouver les dénominateurs communs les plus complexes — un secret de métier qu'elle n'aurait, dit-elle, partagé avec personne d'autre. Le pont, bloc après bloc, retrouve enfin sa stabilité sous vos pas conjugués." },
   { emoji:'🕊️', text:"En posant le dernier pied sur l'autre rive, tu remarques qu'Elara semble étrangement soulagée — pas seulement d'avoir traversé, mais d'avoir, pour la première fois, partagé ouvertement un secret qu'elle gardait jalousement depuis son arrivée dans la forge d'Alaric. « Ne t'habitue pas trop, » prévient-elle aussitôt, un sourire contredisant ses mots. « C'était exceptionnel. »" },
  ]},
  ce2:   { id:'col_c_ce2', title:'Le Plateau des Relatifs', crystal:'le Brassard Gauche', pages:[
   { emoji:'🌡️', text:"Le froid mord, cru et sec, sur le <b>Plateau des Relatifs</b>. Ici vivait jadis un peuple de bergers qui avaient bâti toute leur existence sur une seule certitude : au-dessus de zéro, la vie ; en dessous, le repos, l'attente, l'hiver qui prépare le printemps. Une frontière nette, rassurante." },
   { emoji:'❄️', text:"Le brouillard de Léthéas a effacé cette frontière avec le reste du monde. Les nombres positifs et négatifs errent désormais, mélangés comme une neige et une cendre qu'on ne distinguerait plus, sans plus savoir de quel côté de l'axe ils sont censés vivre, ni même si un tel axe a jamais eu un sens." },
   { emoji:'🐑', text:"Une bergère emmitouflée dans plusieurs manteaux te hèle depuis une colline : « Mes moutons ! Je ne sais plus s'il en manque trois ou s'il en reste trois de trop — mes comptes d'hiver et mes comptes d'été se sont emmêlés au point que je ne distingue plus une dette d'un surplus ! »" },
   { emoji:'🔢', text:"Tu l'aides patiemment à retracer chaque mouvement de troupeau, positif quand un agneau naît, négatif quand le loup rôde trop près — et peu à peu, sous tes calculs, l'ordre naturel du monde reprend forme, comme un ciel qui se dégage après une tempête trop longue." },
   { emoji:'🛡️', text:"« Le <b>Brassard Gauche</b> est pris dans les glaces, quelque part au centre du plateau », annonce Alaric, sa voix teintée d'une inquiétude nouvelle que tu ne lui connaissais pas encore. « C'est la pièce de l'<b>Égide</b>, le bouclier de l'esprit contre la confusion. Pour la libérer, redonne à chaque nombre sa place exacte. Le signe d'abord, toujours le signe d'abord — c'est la première règle que Théos m'a jamais enseignée. »" },
   { emoji:'❓', text:"Le nom t'a frappé, presque malgré Alaric lui-même, comme s'il lui avait échappé. « Théos ? » demandes-tu, mais le message magique s'est déjà éteint, ne laissant derrière lui qu'un silence plus lourd que le froid ambiant." },
   { emoji:'🧭', text:"Au centre exact du plateau, où l'aiguille d'une vieille boussole de bergers reste obstinément immobile — ni nord, ni sud, comme suspendue entre deux mondes — tu sens l'or du Brassard Gauche vibrer sous la glace, attendant patiemment que quelqu'un lui redonne enfin un axe où exister." },
   { emoji:'🏚️', text:"Non loin de là, à moitié enfouie sous la neige, se dresse une cabane abandonnée depuis longtemps. À l'intérieur, tu découvres un établi miniature, une forge de poche, et des dizaines d'esquisses représentant une armure — la même que celle que tu portes, pièce par pièce, dessinée par une main visiblement talentueuse mais fébrile, presque fiévreuse." },
   { emoji:'👧', text:"« Cette cabane... » souffle Elara, arrivée entre-temps, en effleurant les esquisses du bout des doigts, une expression indéchiffrable sur le visage. « Alaric m'a raconté qu'un jour, quelqu'un de très proche de lui vivait ici, à l'écart de tout le monde. Il n'a jamais voulu dire qui. » Pour la première fois, tu la sens presque vulnérable, elle aussi." },
   { emoji:'⛰️', text:"Le véritable obstacle du plateau se dresse au bord d'une crevasse gelée : une série de plateformes suspendues, chacune marquée d'un nombre relatif, qu'il faut traverser dans le bon ordre — du plus petit au plus grand — sous peine de voir la glace se dérober sous tes pieds à chaque erreur de comparaison entre deux nombres négatifs." },
   { emoji:'🥶', text:"Une plateforme en particulier te fait longuement hésiter : « moins huit » semble, à l'instinct, plus grand que « moins trois », puisque huit est plus grand que trois — un piège qu'Alaric t'avait pourtant annoncé dès tes premières leçons. Elara, retenant son souffle derrière toi, ne dit rien : elle sait que c'est à toi, et à toi seul, de démêler ce nœud." },
   { emoji:'❄️', text:"Tu poses le pied sur « moins huit » en dernier, ayant correctement ordonné toute la traversée du plus négatif au plus positif — et la glace, loin de se briser, se met au contraire à scintiller sous tes pas, comme satisfaite d'avoir enfin trouvé quelqu'un qui respecte ses règles plutôt que de les deviner à l'instinct." },
  ]},
cm1:   { id:'col_c_cm1', title:'La Citadelle Algébrique', crystal:'le Brassard Droit', pages:[
   { emoji:'🏰', text:"La <b>Citadelle Algébrique</b> se dresse au loin, intacte en apparence — ses tours élancées, ses remparts de pierre grise semblent avoir traversé le chaos ambiant sans une égratignure. Mais dès le premier pont-levis franchi, tu comprends que l'apparence est trompeuse : quelque chose, ici, s'est brisé de l'intérieur." },
   { emoji:'🗿', text:"Les gardiens de pierre qui peuplent chaque couloir sont devenus fous : figés dans des poses de combat depuis des lustres, ils ont oublié ce que valent leurs propres lettres. x, y, des inconnues gravées sur leurs boucliers, partout, qui semblent hurler silencieusement qu'on les résolve enfin." },
   { emoji:'👸', text:"Une jeune gardienne, moins pétrifiée que les autres, parvient à articuler péniblement quelques mots : « Nous... protégions... l'équilibre. Chaque équation devait rester... juste... des deux côtés... du signe égal. Depuis que le brouillard... nous ne savons plus... ce que nous gardons. »" },
   { emoji:'⚖️', text:"Tu comprends alors le principe profond de cette citadelle : chaque salle est une équation à équilibrer, chaque gardien un terme égaré qu'il faut replacer du bon côté du signe égal, sous peine de voir la structure entière de pierre s'effondrer sur elle-même dans un fracas assourdissant." },
   { emoji:'📜', text:"Dans la bibliothèque centrale, à moitié éboulée, tu découvres un vieux traité d'algèbre annoté de deux écritures différentes — l'une élégante et posée, que tu reconnais comme celle d'Alaric ; l'autre plus fébrile, plus impatiente, signée d'un simple « T. » en bas de chaque page. Deux esprits, jadis, avaient travaillé côte à côte ici." },
   { emoji:'✊', text:"« Le <b>Brassard Droit</b> est enfermé dans la salle du trésor, tout au sommet du donjon », murmure Alaric, sa voix plus grave qu'à l'accoutumée. « C'est la pièce de la <b>Frappe</b> : la puissance pure du raisonnement qui réduit, développe et résout sans jamais trembler. Les gardiens ne s'inclinent que devant celui qui prouve, pas devant celui qui affirme. »" },
   { emoji:'🔑', text:"Pour ouvrir la salle du trésor, tu dois résoudre une ultime équation gravée sur la porte elle-même — une équation à deux inconnues, comme si la citadelle elle-même te rappelait que certains problèmes ne se résolvent jamais complètement seul, mais toujours en tenant compte de l'autre variable." },
   { emoji:'💛', text:"Quand la porte cède enfin, la jeune gardienne retrouve son mouvement, se redresse, et te salue d'une révérence pleine de gratitude. « L'équilibre revient, » dit-elle simplement. « Merci de nous avoir appris, une fois de plus, ce que veut vraiment dire : égal. »" },
   { emoji:'📐', text:"Avant que tu ne quittes la citadelle, elle ajoute, hésitante : « Nous gardions autrefois deux apprentis, tu sais. Le premier venait souvent seul, patient, méthodique — nous l'aimions pour sa constance. Le second venait plus rarement, mais chacune de ses visites laissait une trace éblouissante, presque trop brillante pour durer. » Elle ne prononce aucun nom. Elle n'en a pas besoin." },
   { emoji:'🕯️', text:"Tu te demandes, en quittant la Citadelle, combien d'autres lieux à travers {kingdom} gardent ainsi, discrètement, la trace de deux forgerons qui furent un jour inséparables — et combien de temps encore ces traces resteraient invisibles si ton odyssée ne les avait pas, une à une, mises en lumière." },
   { emoji:'👧', text:"Elara, adossée contre un pilier fissuré, écoute la gardienne sans un mot, la mâchoire serrée. « J'ai toujours cru être la première élève d'Alaric à qui il faisait vraiment confiance, » finit-elle par lâcher, plus pour elle-même que pour toi. « Apparemment, j'étais la deuxième. Ou la troisième. Je ne sais même plus. »" },
   { emoji:'🧩', text:"La salle du trésor, tout en haut du donjon, ne s'ouvre qu'à la résolution d'un système de deux équations entrelacées, gravées sur deux portes distinctes qui doivent être déverrouillées simultanément : une variable commune aux deux, qu'il faut isoler avec une précision absolue sous peine de voir les deux mécanismes se bloquer l'un l'autre indéfiniment." },
   { emoji:'🔓', text:"Après plusieurs tentatives infructueuses, tu comprends enfin qu'il faut résoudre la première équation en fonction de l'inconnue commune, puis substituer cette expression dans la seconde — exactement la méthode qu'Alaric appelait, dans sa forge, « la substitution du forgeron » : on ne force jamais une serrure, on trouve la clé qui s'y encastre naturellement." },
   { emoji:'🗝️', text:"Les deux portes s'ouvrent enfin dans un même mouvement parfaitement synchronisé, révélant la salle du trésor baignée d'une lumière dorée. La jeune gardienne, témoin de ta réussite, murmure avec une admiration non feinte : « Deux inconnues résolues d'un seul geste... même le second apprenti d'Alaric, autrefois, n'y parvenait pas toujours aussi élégamment. »" },
  ]},
  cm2:   { id:'col_c_cm2', title:'Les Gorges de Pythagore', crystal:'la Cuirasse', pages:[
   { emoji:'📐', text:"Dans les <b>Gorges de Pythagore</b>, la lave rougeoyante a tout déformé, tordu, faussé. Les distances mentent effrontément, les angles trichent à chaque virage, et les ponts de pierre s'effondrent régulièrement sous ceux qui, pressés, les mesurent avec négligence." },
   { emoji:'🌋', text:"Une seule loi tient encore fermement debout dans ce chaos : celle du triangle rectangle, gravée en lettres de feu sur la roche la plus ancienne des gorges, comme si l'univers lui-même refusait d'abandonner cette unique certitude, quoi qu'il advienne par ailleurs." },
   { emoji:'👷', text:"Un bâtisseur, couvert de suie et de cendres, tente désespérément de reconstruire un pont suspendu au-dessus d'un gouffre de lave. « Chaque fois que je crois avoir la bonne mesure, » soupire-t-il, épuisé, « le pont s'effondre encore. Je n'ose plus faire confiance à mes propres calculs. »" },
   { emoji:'📏', text:"Tu l'aides à retrouver, patiemment, la relation immuable entre les trois côtés du triangle que forme son pont avec les deux parois du gouffre — et à mesure que les calculs s'alignent, la structure retrouve sa stabilité, poutre après poutre, jusqu'à ce que le bâtisseur puisse enfin traverser sans trembler." },
   { emoji:'🗻', text:"Plus tu progresses vers le cœur du volcan, plus la chaleur devient suffocante — et plus tu remarques, gravées sur les parois calcinées, d'anciennes démonstrations du théorème, certaines signées d'Alaric, d'autres de ce même « T. » énigmatique, comme si les deux forgerons avaient jadis rivalisé d'ingéniosité, amicalement, dans ces mêmes gorges." },
   { emoji:'☀️', text:"« La <b>Cuirasse</b> est au cœur du volcan », dit Alaric, et sa voix tremble, cette fois, sans qu'il cherche à le cacher. « C'est la pièce maîtresse : le <b>Cœur d'Or</b>, la vitalité même de l'Armure. Hypoténuse, carrés, racines... prouve chaque pas avec certitude, ou les gorges te dévoreront sans pitié. »" },
   { emoji:'💭', text:"« Alaric, » oses-tu enfin demander, la chaleur rendant ta voix plus rauque qu'à l'accoutumée, « qui était T. ? » Un long silence te répond, ponctué seulement par le grondement sourd de la lave. « Bientôt, » finit-il par répondre. « Bientôt, je te le dirai. Concentre-toi sur la Cuirasse, pour l'instant. »" },
   { emoji:'❤️‍🔥', text:"Au cœur exact du volcan, dans une alcôve de pierre noire protégée par un dernier calcul à résoudre — une preuve rigoureuse que le triangle formé par trois points précis de la gorge est bien rectangle — l'or de la Cuirasse bat contre ta paume comme un cœur véritable, chaud et vivant." },
   { emoji:'🩶', text:"En refermant tes doigts sur la Cuirasse, tu remarques, gravée au dos du plastron, une inscription minuscule que même Alaric semble avoir oubliée : deux initiales entrelacées, « A » et « T », entourées d'un petit soleil naïvement dessiné — comme la signature d'une promesse d'enfance, scellée pour toujours dans l'or." },
   { emoji:'👧', text:"Elara refuse de regarder l'inscription plus de deux secondes. « On devrait se concentrer sur la Cuirasse, » dit-elle sèchement, en détournant les yeux vers la lave. Mais tu remarques que sa voix tremble légèrement — la même voix assurée qui, depuis le début de votre odyssée commune, ne t'avait encore jamais trahi le moindre doute." },
   { emoji:'🌉', text:"Le passage final vers le cœur du volcan exige de traverser trois ponts suspendus à la géométrie douteuse, chacun formant un triangle avec les parois du gouffre. Un seul de ces triangles est réellement rectangle — les deux autres, subtilement déformés par le brouillard de Léthéas, s'effondreraient inévitablement sous ton poids si tu t'y risquais sans avoir vérifié, au préalable, la relation exacte entre leurs trois côtés." },
   { emoji:'📐', text:"Tu mesures, calcules, vérifies méthodiquement chaque hypoténuse avant de t'engager — et c'est seulement au terme d'un calcul rigoureux, sans place pour l'approximation, que tu identifies le pont véritablement sûr. Le bâtisseur, qui t'observait de loin, hoche la tête avec un respect nouveau : « Voilà comment on devrait toujours construire, » murmure-t-il. « Pas plus vite. Plus juste. »" },
   { emoji:'🔥', text:"En traversant enfin le bon pont vers le cœur du volcan, tu sens la chaleur ambiante changer de nature : moins hostile, presque accueillante, comme si les Gorges elles-mêmes reconnaissaient en toi quelqu'un qui avait pris la peine de vérifier, plutôt que de simplement espérer que tout irait bien." },
  ]},
  final: { id:'col_c_final', title:'L\'Observatoire des Fonctions', crystal:'le Heaume', pages:[
   { emoji:'🔭', text:"Au sommet du monde, là où l'air se raréfie et où le silence devient presque palpable, l'<b>Observatoire des Fonctions</b> scrute un ciel presque entièrement éteint. Ici, jadis, chaque courbe tracée dans le grand télescope racontait l'avenir précis d'une étoile lointaine." },
   { emoji:'📉', text:"Léthéas a déchiré les graphiques avec une précision presque chirurgicale : les images ont perdu leurs antécédents, les droites ont perdu leur pente, et les courbes les plus complexes se sont transformées en gribouillis incompréhensibles, comme un langage qu'on aurait volontairement corrompu." },
   { emoji:'👩‍🔬', text:"Une astronome, seule survivante consciente de l'Observatoire, te montre son registre couvert de graphiques illisibles : « Je passais mes nuits à prédire le destin des étoiles à partir de leurs courbes de lumière. Maintenant, je ne sais même plus prédire si le soleil se lèvera demain. »" },
   { emoji:'🌠', text:"Tu l'aides, fonction après fonction, à retrouver le sens caché derrière chaque courbe corrompue : une parabole qui redevient une trajectoire de comète, une droite affine qui redevient la promesse tenue d'un lever de soleil. Peu à peu, le ciel de l'Observatoire recommence à raconter une histoire cohérente." },
   { emoji:'📚', text:"Dans les archives poussiéreuses de l'Observatoire, tu tombes enfin sur un vieux portrait à demi calciné : deux jeunes forgerons, bras dessus bras dessous, souriant devant une étoile fraîchement forgée. L'un est indéniablement un jeune Alaric. L'autre, au sourire éclatant, porte les mêmes yeux d'or que... Léthéas." },
   { emoji:'📝', text:"Au dos du portrait, une inscription à moitié effacée par le temps : « À nous deux, personne ne peut rien nous refuser. — T., à A., le jour de notre première étoile. » L'astronome, remarquant ton trouble, s'approche doucement : « Ce portrait traînait ici depuis toujours. Personne n'a jamais osé demander à Alaric qui était ce second visage." },
   { emoji:'👧', text:"Elara, immobile devant le portrait depuis de longues minutes, finit par murmurer, la voix cassée : « J'ai passé des mois à vouloir devenir la meilleure élève d'Alaric. Je ne savais pas que je marchais sur les traces de quelqu'un qu'il n'a jamais réussi à oublier. » Elle ne te suit pas jusqu'à l'Antre du Titan. « Ce combat, » dit-elle simplement, « je crois qu'il t'appartient à toi seul, {hero}. Mais reviens-nous entier. »" },
   { emoji:'🌌', text:"Tu la regardes s'éloigner vers la sortie de l'Observatoire, sa silhouette se détachant contre le ciel constellé qu'ensemble vous venez de restaurer. Pour la première fois depuis le début de cette odyssée, tu réalises à quel point sa présence, malgré ses piques et sa froideur apparente, t'a été précieuse à chaque étape du chemin." },
   { emoji:'🔥', text:"Le seuil de l'Antre du Titan t'attend, silencieux, tandis que tu resserres une dernière fois les lanières de l'Armure Solaire. Quoi qu'il se passe derrière cette porte de cendres, tu sais désormais que tu n'y entres pas seul : tu portes avec toi Alaric, Elara, et tous ceux que tu as croisés à travers {kingdom}." },
   { emoji:'🔭', text:"Avant de franchir le seuil de l'Antre, tu dois affronter l'ultime épreuve de la grande lunette : reconstituer, à partir d'un nuage de points dispersés sur un tableau immense, la fonction exacte qui décrit la trajectoire de la dernière comète encore visible dans le ciel de {kingdom} — une parabole presque effacée par le brouillard, dont il ne reste que quelques coordonnées éparses." },
   { emoji:'✍️', text:"Point après point, tu ajustes ton hypothèse, corrigeant l'équation à mesure que de nouvelles coordonnées se révèlent sous ton calcul patient, jusqu'à ce que la courbe entière se redessine enfin dans le ciel, fidèle et complète. L'astronome pousse un cri de joie : « Elle reviendra ! Dans exactement soixante-treize ans, comme le prédit ta fonction ! »" },
   { emoji:'👧', text:"Elara, qui a observé toute l'opération sans intervenir une seule fois, te glisse doucement : « Tu sais, moi je n'aurais jamais eu la patience de tester point par point comme ça. J'aurais voulu deviner la réponse d'un coup. » Elle marque une pause. « Peut-être que c'est pour ça qu'Alaric a eu besoin de toi, en plus de moi. »" },
   { emoji:'🌠', text:"Tu ne réponds rien, mais tu ranges soigneusement cette phrase dans un coin de ta mémoire — car tu sens, sans savoir encore pourquoi, qu'elle te sera utile bien au-delà de cette nuit sous les étoiles restaurées de l'Observatoire." },
   { emoji:'👁️', text:"« Le <b>Heaume</b> t'attend là-haut, tout en haut de la grande lunette », dit Alaric, sa voix brisée cette fois sans détour. « C'est la pièce de la <b>Clairvoyance</b> : porter ce casque, c'est lire les attaques — et les vérités — avant qu'elles ne frappent de plein fouet. Lis les courbes, {hero}. Elles disent toujours la vérité à qui sait patiemment les interroger. »" },
   { emoji:'🌑', text:"Au loin, par-delà l'Observatoire, une île entièrement noire fume sourdement à l'horizon, comme une plaie qui ne cicatrise jamais. L'<b>Antre du Titan</b>. Alaric la fixe longuement, sans un mot, ses yeux d'ordinaire si vifs soudain voilés d'une tristesse ancienne. Tu comprends, sans qu'il ait besoin de le dire, que la fin de cette odyssée est aussi, pour lui, le début d'un adieu — ou peut-être, enfin, d'une réconciliation." },
  ]},
  titan: { id:'col_c_titan', title:'L\'Antre du Titan', crystal:'', pages:[
   { emoji:'⚒️', text:"L'Armure Solaire est enfin complète. Alors, dans la forge d'Alaric, silencieuse depuis si longtemps, se produit un phénomène que nul n'avait revu depuis cent ans : les six pièces se mettent à chanter à l'unisson, une note pure et grave qui semble faire vibrer {kingdom} tout entier." },
   { emoji:'✨', text:"De leur lumière unie naît une lame, fine et lumineuse comme un rayon d'aube figé dans le métal. La <b>Lame d'Aurore</b>. Alaric la contemple longuement avant de te la tendre, ses mains tremblant légèrement — de fatigue, ou d'appréhension, tu ne saurais dire." },
   { emoji:'⚔️', text:"« Elle ne coupe pas la chair », dit-il enfin, sa voix étrangement douce pour une arme censée affronter un Titan. « Elle tranche l'oubli. C'est tout ce qu'elle sait faire, et c'est peut-être tout ce dont nous avons réellement besoin, au fond. »" },
   { emoji:'🤲', text:"Puis il pose sa main, lourde et chaude, sur ton épaule, et pour la première fois depuis le début de ton odyssée, son regard fuit franchement le tien. « {hero}... quand tu verras le Titan, regarde son visage. Vraiment. Ne détourne pas les yeux comme je l'ai fait, moi, pendant tant d'années. Promets-le-moi. »" },
   { emoji:'😔', text:"Tu le lui promets, sans bien comprendre encore la portée exacte de cette demande. Alaric hoche la tête, soulagé et anxieux tout à la fois, puis ajoute, presque pour lui-même : « J'aurais dû le regarder, moi, bien avant que tout cela n'arrive. J'ai eu peur. J'ai toujours eu peur, en réalité. »" },
   { emoji:'🌑', text:"Il détourne le regard vers la fenêtre de la forge, contemplant un instant le ciel étoilé de {kingdom}, avant d'ajouter à voix basse : « La peur, {hero}, est une chose étrange. Elle nous protège si bien du danger qu'elle finit parfois par nous protéger aussi de ceux qu'on aime. »" },
   { emoji:'🌋', text:"L'<b>Antre du Titan</b> t'attend enfin : un seuil de cendres froides, une longue galerie bordée d'étoiles mortes et éteintes depuis des siècles, et tout au fond, dans une pénombre presque totale, un trône de pierre noire. Ta puissance, portée par l'Armure entière, est à son paroxysme. La dernière marche de cette odyssée commence." },
   { emoji:'🕊️', text:"En franchissant le seuil, tu sens l'or de l'Armure vibrer contre ta peau, comme s'il reconnaissait cet endroit — comme si, quelque part dans sa mémoire métallique, il se souvenait d'avoir déjà été forgé ici même, par deux mains complices plutôt qu'une seule solitaire." },
   { emoji:'🌑', text:"Le trône de pierre noire, au fond de l'Antre, n'est pas vide comme tu l'avais imaginé : une silhouette immense s'y tient déjà, immobile, tournée vers un mur d'étoiles éteintes qu'elle semble contempler depuis des siècles sans jamais se lasser — ou peut-être sans jamais parvenir à détourner le regard." },
   { emoji:'👹', text:"« Un autre, » soupire Léthéas sans même se retourner, sa voix pareille à un écho venu du fond d'un puits sans eau. « Combien de petits forgerons Alaric enverra-t-il encore, avant de comprendre qu'aucun d'eux ne peut réparer ce qui a été brisé ? » Enfin, il se tourne vers toi — et son visage, dans la pénombre, semble se dérober à la lumière elle-même." },
   { emoji:'⚔️', text:"Le combat qui s'ensuit ne ressemble à rien de ce que tu as affronté jusqu'ici. Léthéas n'attaque pas avec des griffes ni des flammes : il attaque avec l'oubli lui-même, effaçant un à un, à mesure qu'il les prononce, les théorèmes que tu croyais connaître par cœur. « Le théorème de Pythagore, » murmure-t-il, et pendant un instant terrifiant, tu ne te souviens plus pourquoi a² + b² = c²." },
   { emoji:'💫', text:"Mais l'Armure, elle, se souvient pour toi. Chaque pièce reforgée — la Jambière, le Brassard, la Cuirasse — résonne d'un savoir que Léthéas ne peut pas effacer, parce que ce savoir n'est plus seulement dans ta tête : il est désormais gravé dans l'or lui-même, dans chaque calcul que tu as patiemment reconstruit à travers {kingdom}." },
   { emoji:'🗡️', text:"« Tu ne comprends pas, » gronde Léthéas, une pointe de désespoir perçant sous la colère. « L'oubli n'est pas une punition. C'est un refuge. Tant qu'on ne se souvient pas, on ne peut plus avoir mal. » Ses mots te frappent presque plus durement que ses attaques — car tu y devines, malgré toi, une vérité que Léthéas lui-même semble avoir fini par croire." },
   { emoji:'💔', text:"« Mais on ne peut plus rien construire non plus, » réponds-tu, en te souvenant des paroles d'Alaric sur la forge, la nuit précédant ton départ. « Une preuve ne se termine pas par la force, elle se termine par la nécessité. Et il est nécessaire, maintenant, que tu te souviennes. » Le Titan vacille, comme frappé par une vérité qu'il n'attendait plus d'entendre." },
   { emoji:'✨', text:"C'est à cet instant précis, alors que Léthéas semble hésiter pour la première fois depuis le début du combat, que la Lame d'Aurore se met à chanter dans ta main — le même chant pur qu'elle avait entonné dans la forge d'Alaric, comme si elle reconnaissait, elle aussi, que le moment n'était plus de vaincre, mais de guérir." },
   { emoji:'🌌', text:"Léthéas recule d'un pas, déstabilisé par ce chant qu'il semble reconnaître malgré lui, une main levée devant son visage comme pour se protéger d'une lumière trop longtemps évitée. « Cette mélodie... » murmure-t-il, sa voix perdant soudain toute sa dureté minérale. « Je la connais. Je la connaissais. »" },
   { emoji:'💭', text:"Une fissure minuscule parcourt alors le masque de cendre qui recouvre son visage, laissant échapper, l'espace d'un battement de cœur, l'image fugace d'un rire d'enfant partagé devant une forge en construction. Léthéas porte une main tremblante à sa tempe, comme frappé par une douleur qu'il n'avait plus ressentie depuis des siècles : celle de se souvenir." },
   { emoji:'🌑', text:"« Non ! » rugit-il soudain, sa voix retrouvant toute sa dureté minérale, comme effrayé par cette brèche entrouverte malgré lui. « Je ne veux pas me souvenir ! Le souvenir n'apporte que la douleur, l'oubli seul apporte la paix ! » Mais sa voix, cette fois, sonne moins comme une certitude que comme une prière désespérée qu'il se répète depuis trop longtemps pour y croire encore tout à fait." },
  ]},
 },
 victories: {
  cp:  { id:'col_w_cp',  title:'La Jambière Gauche reforgée', crystal:'la Jambière Gauche', pages:[
   { emoji:'🦵', text:"Au dernier calcul juste, l'or s'embrase d'une lumière si vive que les mouettes du port s'envolent toutes ensemble, affolées. La <b>Jambière Gauche</b> s'élève des docks dans une gerbe d'étincelles, se reforge sous tes yeux ébahis et vient s'ajuster à ta jambe comme si elle t'avait toujours attendu, patiemment, depuis la nuit de sa chute." },
   { emoji:'⚓', text:"Le pouvoir d'<b>Aplomb</b> coule en toi, chaud et immédiat : tes pas ne vacilleront plus, ni sur un pont branlant, ni face à une vérité difficile. Au port, les virgules regagnent leur place et les balances disent à nouveau la vérité — la jeune poissonnière éclate en sanglots de soulagement devant ses clients stupéfaits." },
   { emoji:'🐟', text:"La jeune poissonnière, une fois ses esprits retrouvés, insiste pour t'offrir le plus beau poisson de son étal en remerciement — un présent que tu acceptes avec gratitude, même si tu ne sais pas encore comment tu le cuisineras durant ton odyssée à travers {kingdom}." },
   { emoji:'🔨', text:"« Une », compte Alaric, sa voix résonnant depuis la forge lointaine comme si elle traversait directement l'or que tu portes désormais, et son marteau frappe l'enclume comme une cloche de fête. « Une pièce, {hero}. Et déjà, je sens que tu portes cette Armure autrement que je n'aurais osé l'espérer. »" },
   { emoji:'👧', text:"Elara, qui observait la scène depuis un entrepôt voisin en feignant l'indifférence, s'approche enfin, les bras toujours croisés mais le regard un peu moins froid. « Pas mal, petit nouveau, » lâche-t-elle du bout des lèvres. « Pour un débutant qui ne savait même pas aligner une virgule il y a trois jours. »" },
   { emoji:'⭐', text:"Elle t'observe un instant de plus, presque malgré elle, avant d'ajouter, plus doucement : « Alaric avait raison de te choisir. Ça ne veut pas dire que je vais te faciliter la tâche pour autant. » Mais quelque chose dans son sourire dément déjà, un peu, la sévérité de ses mots." },
  ]},
  ce1: { id:'col_w_ce1', title:'La Jambière Droite reforgée', crystal:'la Jambière Droite', pages:[
   { emoji:'🦿', text:"La <b>Jambière Droite</b> jaillit des profondeurs des Cavernes Fractionnaires dans une pluie d'étincelles dorées qui illuminent, l'espace d'un instant, chaque fresque ancienne gravée sur les parois. À l'instant où elle se verrouille contre ta jambe, l'<b>Élan</b> t'envahit tout entier." },
   { emoji:'⚡', text:"Tu sens, presque physiquement, que tu pourrais désormais enchaîner mille calculs sans reprendre ton souffle, sans jamais trébucher sur un dénominateur récalcitrant. Dans les cavernes, les parts se rassemblent enfin : les fractions s'additionnent, se simplifient, s'accordent dans un doux murmure de pierre satisfaite." },
   { emoji:'👦', text:"Le jeune garçon aux trois frères, que tu croises une dernière fois en ressortant à l'air libre, tient fièrement la lanterne désormais partagée en trois parts égales, illuminée d'une flamme triple. « Grâce à toi, » dit-il, « on n'a plus besoin de se partager le noir. » « Deux », sourit Alaric au loin. « Tu marches déjà comme un forgeron d'étoiles, {hero}. »" },
   { emoji:'👧', text:"Elara, qui t'a suivi tout du long sans jamais l'admettre franchement, ramasse un éclat d'or tombé au sol et te le tend sans un mot, un très léger sourire flottant sur ses lèvres — le premier depuis votre rencontre. « Garde ça, » dit-elle simplement. « Tu l'as mérité. »" },
   { emoji:'🌙', text:"Cette nuit-là, en installant votre campement à l'orée des Cavernes, Elara t'apprend, presque malgré elle, l'astuce qu'elle utilise pour calculer mentalement des fractions complexes en un clin d'œil — un savoir-faire qu'elle n'avait, jusque-là, jamais eu la patience de partager avec personne." },
   { emoji:'🕯️', text:"À la lueur du feu de camp, Elara finit par avouer, presque à contrecœur, qu'elle n'a jamais eu de famille pour lui apprendre ce genre d'astuces : Alaric l'a recueillie, enfant, après un naufrage dont elle ne se souvient qu'à peine. « La forge est la seule maison que j'aie jamais connue, » dit-elle. « Je crois que c'est pour ça que je n'ai jamais voulu la partager avec un autre apprenti. »" },
   { emoji:'🤗', text:"Tu ne dis rien, mais tu poses doucement ta main sur son épaule — un geste simple, sans grande démonstration, qui semble pourtant suffire. Elara ne te repousse pas. Pour la première fois depuis votre rencontre sur les docks, un silence confortable s'installe entre vous deux, sans besoin d'être rempli par une pique ou une moquerie." },
  ]},
  ce2: { id:'col_w_ce2', title:'Le Brassard Gauche reforgé', crystal:'le Brassard Gauche', pages:[
   { emoji:'🛡️', text:"La glace du Plateau des Relatifs cède enfin dans un grand craquement libérateur. Le <b>Brassard Gauche</b> se libère et s'enroule autour de ton avant-bras, encore tiède de forge malgré le froid environnant. L'<b>Égide</b> t'enveloppe aussitôt : une assurance tranquille, le bouclier profond de ceux qui connaissent enfin la règle des signes." },
   { emoji:'🌡️', text:"Sur le plateau tout entier, l'axe des nombres se redresse visiblement : les positifs reprennent leur place à droite, les négatifs à gauche, le zéro en sentinelle immobile entre les deux. La bergère, ses moutons enfin recomptés avec exactitude, agite joyeusement son bâton en signe de remerciement." },
   { emoji:'🌌', text:"« Trois », dit Alaric, sa voix teintée d'un soulagement presque palpable à travers la distance. « La moitié du chemin, {hero}. L'ombre de Léthéas recule — il l'a senti, crois-moi, mieux que quiconque ne pourrait le sentir. » Un silence bref suit cette phrase, chargé d'un sous-entendu que tu commences, peu à peu, à deviner." },
   { emoji:'👧', text:"Elara reste silencieuse un long moment face à l'axe des nombres redressé, avant de murmurer, comme si elle réfléchissait tout haut : « Alaric ne m'a jamais parlé de sous-entendus. Il m'a toujours tout dit clairement... sauf, apparemment, l'essentiel. » Elle secoue la tête, chassant ses doutes. « Continuons, {hero}. »" },
   { emoji:'🐑', text:"La bergère, avant de vous laisser reprendre la route, insiste pour vous offrir deux couvertures tissées de laine épaisse : « Le prochain lieu que vous traverserez sera plus chaud, on me l'a dit, mais gardez-les. On ne sait jamais quel froid on devra encore affronter, » dit-elle avec une sagesse qui semble dépasser largement la simple météo." },
  ]},
  cm1: { id:'col_w_cm1', title:'Le Brassard Droit reforgé', crystal:'le Brassard Droit', pages:[
   { emoji:'✊', text:"Les gardiens de pierre de la Citadelle Algébrique s'inclinent tous ensemble, dans un même mouvement lent et solennel, enfin libérés de leur confusion séculaire. Le <b>Brassard Droit</b> est à toi, et avec lui la <b>Frappe</b> : la puissance de celui qui résout sans jamais se contenter d'affirmer." },
   { emoji:'💥', text:"Tu serres le poing, et l'or répond aussitôt par un éclat bref, comme un salut silencieux et complice. Dans la Citadelle tout entière, les inconnues retrouvent leurs valeurs justes et les équations s'équilibrent dans un grand soupir collectif de soulagement, pierre après pierre, salle après salle." },
   { emoji:'👸', text:"La jeune gardienne, définitivement libérée de sa pétrification, t'escorte jusqu'à la sortie de la citadelle. « Quatre », compte Alaric, sa voix traversant la distance avec une gravité nouvelle. « Les bras et les jambes, {hero}. Reste le cœur... et la tête. Le plus dur, peut-être, commence à peine. »" },
   { emoji:'👧', text:"« Le cœur et la tête, » répète pensivement Elara en posant sa main sur ton épaule — un geste qu'elle n'avait encore jamais eu envers toi. « J'ai l'impression qu'il ne parle plus seulement de l'Armure, {hero}. Je crois qu'il parle aussi de lui-même. »" },
  ]},
  cm2: { id:'col_w_cm2', title:'La Cuirasse reforgée', crystal:'la Cuirasse', pages:[
   { emoji:'☀️', text:"Le volcan des Gorges de Pythagore rugit une dernière fois, un grondement presque triomphal, puis s'apaise complètement. La <b>Cuirasse</b> émerge de la lave refroidie, intacte, son soleil d'or rayonnant avec une intensité nouvelle sur le plastron encore chaud." },
   { emoji:'❤️‍🔥', text:"Quand elle épouse enfin ta poitrine, le <b>Cœur d'Or</b> bat avec le tien, à l'unisson : une vitalité immense, ancienne, chaude comme un souvenir qu'on croyait perdu et qu'on retrouve intact. Les gorges tout entières retrouvent leurs justes mesures — les distances disent vrai, les angles aussi, le bâtisseur peut enfin traverser son pont sans trembler." },
   { emoji:'🔥', text:"« Cinq », souffle Alaric, sa voix presque étranglée cette fois. « Il portait la même armure, autrefois... » Il s'interrompt brusquement, comme s'il en avait trop dit. Tu n'oses pas demander qui — mais tu sens, au fond de toi, que tu connais déjà la réponse depuis les Cavernes Fractionnaires." },
   { emoji:'👧', text:"Elara ne dit rien cette fois, mais elle prend ta main un bref instant, la serre fort, puis la relâche aussitôt, comme gênée de ce geste spontané. « Quoi qu'il se passe là-haut, à l'Observatoire, » dit-elle enfin, « je serai avec toi. Enfin... jusqu'à un certain point. »" },
   { emoji:'🌋', text:"Le bâtisseur du pont vous salue une dernière fois depuis l'entrée des Gorges, sa silhouette se détachant contre la lueur orangée du volcan apaisé. « Que la Cuirasse vous protège tous les deux, » lance-t-il. « Et n'oubliez jamais : un pont bien construit tient toujours plus longtemps qu'on ne l'espérait. »" },
  ]},
  final: { id:'col_w_final', title:'Le Heaume reforgé', crystal:'le Heaume', pages:[
   { emoji:'👁️', text:"Sous la grande coupole de l'Observatoire des Fonctions, le <b>Heaume</b> descend lentement sur ta tête comme une couronne d'or et de lumière. La <b>Clairvoyance</b> s'ouvre en toi d'un seul coup, presque vertigineuse : les courbes te parlent enfin, les attaques se lisent avant même de survenir, l'avenir tout entier des étoiles redevient parfaitement déchiffrable." },
   { emoji:'🌌', text:"L'astronome, émue aux larmes devant ses graphiques enfin restaurés, te salue d'une révérence profonde. « Six pièces, » murmure-t-elle. « L'Armure Solaire est complète, jeune forgeron. Puisse-t-elle t'accompagner là où, je le crains, tu devras bientôt te rendre. »" },
   { emoji:'⚔️', text:"Au loin, dans la forge, quelque chose s'éveille enfin après des années de silence. Alaric lève son marteau, sa main tremblant à peine. « Viens, {hero}. Il est temps de forger la <b>Lame d'Aurore</b>. Et il est temps, aussi... que je te dise enfin toute la vérité. »" },
   { emoji:'👧', text:"Elara reste en retrait tandis qu'Alaric prononce ces mots, son regard passant de toi à lui avec une inquiétude non dissimulée. « Je ne sais pas ce que tu vas découvrir là-haut, {hero}, » murmure-t-elle enfin, « mais quoi que ce soit, on affrontera la suite ensemble. C'est ce que fait une équipe, non ? »" },
  ]},
 },
 epilogue: { id:'col_epilogue', title:'Le Frère de Forge', pages:[
  { emoji:'🌑', text:"La Lame d'Aurore traverse l'ombre du trône dans un éclair silencieux — et le Titan tombe lourdement à genoux, vaincu, sa masse sombre parcourue de tremblements. Tu t'avances pour porter le coup final... puis tu te souviens brusquement de la promesse faite à Alaric. Tu t'arrêtes. Tu regardes vraiment son visage, pour la première fois." },
  { emoji:'⏸️', text:"Le silence qui s'installe alors dans l'Antre est presque insoutenable. Le Titan, à genoux, respire lourdement, comme épuisé par un combat bien plus ancien que celui que tu viens de mener contre lui. Ses épaules massives tremblent, non de rage, mais d'un épuisement qui semble remonter à des décennies entières." },
  { emoji:'👁️', text:"Et sous la cendre qui recouvre ses traits comme un masque trop longtemps porté, tu vois enfin : des yeux d'or. Les mêmes, exactement, que ceux d'Alaric. La même étincelle, éteinte depuis si longtemps qu'on l'aurait crue à jamais disparue." },
  { emoji:'⚒️', text:"« Son nom était <b>Théos</b> », dit une voix brisée derrière toi. Alaric est là, son marteau pendant mollement au bout de son bras, les larmes roulant librement sur son visage buriné par les siècles. « Mon frère de forge. Le plus doué de nous deux, sans conteste — moi, je n'ai jamais été qu'un bon artisan patient ; lui avait le génie, la fulgurance, l'audace que je n'ai jamais eue. »" },
  { emoji:'🔨', text:"Elara, restée en retrait près de l'entrée de l'Antre, s'avance lentement, le visage baigné de larmes silencieuses. « Alaric, » dit-elle d'une voix tremblante, « pourquoi ne m'as-tu jamais raconté ça ? Toutes ces années, j'aurais pu... » Elle s'interrompt, incapable de terminer sa phrase, submergée par une émotion trop longtemps contenue." },
  { emoji:'💛', text:"Alaric se tourne vers elle, les yeux rougis mais le regard enfin apaisé : « J'avais peur, Elara. Peur qu'en te racontant mon échec, tu perdes confiance en moi comme maître. Je vois maintenant que c'est en le taisant que j'ai vraiment failli à mon devoir envers toi. » Il l'attire dans une étreinte qui inclut, sans un mot, Théos et toi tout autant qu'elle." },
  { emoji:'💔', text:"« Il a voulu forger une étoile à lui seul, un jour, pour me prouver — ou peut-être se prouver à lui-même — qu'il n'avait besoin de personne. » La voix d'Alaric se brise complètement. « Je l'ai laissé faire. Je n'ai rien dit. J'étais jaloux, {hero}, et j'ai laissé mon frère commettre seul l'erreur la plus dangereuse de toute l'histoire de {kingdom}. »" },
  { emoji:'🌟', text:"« L'étoile, trop jeune, trop instable, l'a dévoré de l'intérieur au lieu de naître. L'oubli a pris le reste de lui, année après année, jusqu'à ce qu'il ne reste plus que Léthéas — une ombre qui ne se souvenait même plus pourquoi elle haïssait tant la lumière. Et moi, pendant tout ce temps, j'ai eu peur de regarder ce que j'avais laissé faire. »" },
  { emoji:'💛', text:"Alors tu comprends enfin, tout à fait, pourquoi la Lame ne coupe jamais la chair. Tu la poses délicatement sur l'épaule du Titan — et elle tranche l'oubli, rien que l'oubli, comme elle a toujours été conçue pour le faire. La cendre s'effrite lentement, tombe en poussière dorée." },
  { emoji:'✨', text:"Les souvenirs reviennent un à un, visibles presque, comme des étincelles qui remontent à la surface d'une eau trouble : la forge partagée, les rires d'enfance, les théorèmes appris et démontrés ensemble à la lueur d'une même bougie. « Alaric... ? » murmure enfin Théos, sa voix hésitante, celle d'un homme qui se réveille d'un très long cauchemar." },
  { emoji:'🤝', text:"Les deux frères se regardent longuement, sans un mot, des décennies entières de silence et de chagrin séparant encore leurs deux regards. Puis Alaric s'avance, et serre son frère dans ses bras avec une force qui semble vouloir rattraper, d'un seul geste, tout le temps perdu. « Pardon, » souffle-t-il. « Pardon de ne pas t'avoir cherché plus tôt. »" },
  { emoji:'🌟', text:"Cette nuit-là, au-dessus de {kingdom} tout entier, les étoiles se rallument toutes en même temps dans un embrasement silencieux et magnifique — on dit, depuis, que c'est parce que deux forgerons enfin réconciliés frappaient de nouveau l'enclume ensemble, comme au premier jour du monde." },
  { emoji:'🌍', text:"Dans tout {kingdom}, des ports aux observatoires, en passant par les cavernes et les citadelles que tu as toi-même traversées, les habitants racontent déjà, à leur manière, une version différente de cette même nuit — chacun y ajoutant sa propre couleur, comme si l'histoire elle-même avait besoin d'être partagée pour devenir tout à fait réelle." },
  { emoji:'🎉', text:"Dans les mois qui suivirent, on vit souvent Théos et Alaric parcourir ensemble {kingdom}, réparant patiemment les traces encore visibles du passage de Léthéas — un pont ici, une balance là, une équation oubliée sur un mur d'école. Deux vieux forgerons, enfin réunis, qui rattrapaient à leur façon toutes les années perdues." },
  { emoji:'📜', text:"Les vieux registres de {kingdom}, ceux-là mêmes qui avaient gratté le nom de Théos avec tant de soin, furent rouverts un à un pour y réinscrire son histoire complète — non plus comme une faute qu'on efface, mais comme un chapitre entier qui méritait, désormais, d'être lu jusqu'au bout par les générations à venir." },
  { emoji:'🌟', text:"Toi-même, {hero}, tu refermas ce chapitre de ton odyssée avec une certitude nouvelle, gravée aussi sûrement que l'or de ton Armure : que la plus grande force d'un forgeron ne réside jamais dans sa solitude, mais dans sa capacité à laisser d'autres, un jour, porter le même feu que lui." },
  { emoji:'🏛️', text:"Quant à toi, {hero}, ton nom est gravé pour toujours dans l'or stellaire, sur la garde même de la Lame d'Aurore : <b>premier Chevalier de l'Armure Solaire</b>. Félicitations — ton odyssée s'achève ici, mais l'histoire de {kingdom}, elle, continue de s'écrire, étoile après étoile." },
  { emoji:'👧', text:"Elara t'attend au pied de la forge à ton retour, les bras croisés dans une posture familière — mais son visage, cette fois, ne cache plus rien de son soulagement. « Tu es revenu entier, » dit-elle simplement, avant d'ajouter, plus bas : « J'ai eu peur, {hero}. Pour la première fois depuis que je porte cette formation, j'ai eu vraiment peur pour quelqu'un d'autre que moi-même. »" },
  { emoji:'💫', text:"« Je crois, » poursuit-elle, en observant Alaric et Théos échanger un rire encore hésitant près de l'enclume, « que j'avais besoin qu'on me montre qu'on peut être doué sans être seul. Merci de me l'avoir montré, petit nouveau. » Elle te tend la main, cette fois sans la moindre trace de rivalité — un geste d'égale à égal." },
  { emoji:'📖', text:"Le lendemain matin, Alaric te convoque une dernière fois dans sa forge, désormais partagée avec un Théos encore hésitant mais visiblement apaisé. « {hero}, » dit-il, « il existe un dernier récit que je n'avais jamais osé raconter à quiconque : la véritable histoire de la chute de Théos, dans tous ses détails, ses joies comme ses erreurs. »" },
  { emoji:'🗂️', text:"« Théos et moi l'avons écrite ensemble, cette nuit, veillant jusqu'à l'aube. Nous l'avons intitulée <b>La Saga des Porteurs de l'Armure</b>. Elle t'attend désormais dans ton carnet de Chevalier, {hero} — consulte-le quand tu le souhaites : notre histoire, la vraie, la complète, y est désormais gravée pour que plus jamais l'oubli ne la reprenne. »" },
  { emoji:'🌌', text:"Elara, qui a écouté toute la scène en retrait, s'approche une dernière fois avant que tu ne quittes la forge. « J'ai demandé à Alaric de m'apprendre à écrire, moi aussi, » confie-t-elle avec un sourire timide, si différent de son assurance habituelle. « Peut-être qu'un jour, ce sera mon histoire qui attendra dans un carnet, quelque part. »" },
  { emoji:'⭐', text:"Théos, encore fragile mais visiblement déterminé à réapprendre le monde qu'il avait fui si longtemps, t'arrête au moment où tu t'apprêtes à partir. « Merci d'avoir regardé mon visage, {hero}, quand tant d'autres auraient frappé sans hésiter. » Il hésite, puis ajoute : « Le vrai courage, je le comprends maintenant, n'est pas de vaincre l'oubli — c'est d'oser se souvenir. »" },
  { emoji:'🔥', text:"Tu quittes la forge ce matin-là avec, à ta ceinture, une Armure devenue bien plus qu'un simple trophée : le témoignage vivant qu'une preuve, une vraie, ne se referme jamais tout à fait — elle continue, patiemment, d'éclairer ceux qui viendront après elle." },
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
 { id:'final', label:'Le Réveil',                            levels:['3E'],     shape:'mandala' },
 { id:'titan', label:'L\'Antre du Chancelier',             levels:['3E'],     shape:'citadelle' },
];
const _COL_STORY_FR = {
 intro: { id:'colfr_intro', title:'La Bibliothèque infinie', pages:[
  { emoji:'🏙️', text:"Il fut un temps, dit-on, où les hommes de ce pays possédaient autant de mots qu'il y a d'étoiles. Puis vint <b>{villain}</b>, et il fit de la langue un désert. Aujourd'hui, à <b>Monotonia</b>, on n'enseigne plus qu'une poignée de mots dociles." },
  { emoji:'🌫️', text:"La ville est grise — d'un gris décrété, administratif, définitif. Les gens se croisent sans se parler : il ne reste plus grand-chose à dire. Car {villain} l'a compris — sans mot, pas d'idée ; sans nuance, pas de désaccord ; sans passé, pas d'« avant »." },
  { emoji:'😐', text:"« À quoi bon mille mots, répète le Chancelier dans son infinie sollicitude, quand un seul suffit à obéir ? » On l'applaudit beaucoup — du reste, <i>applaudir</i> et <i>approuver</i> se disent désormais d'un même mot, ce qui simplifie la vie publique." },
  { emoji:'🪧', text:"Sur chaque place publique trône une grande affiche du Chancelier Morne, souriant d'un sourire fabriqué, sous laquelle on peut lire un seul mot en lettres capitales : <i>CALME</i>. Personne ne se souvient plus très bien de ce qu'il y avait, avant, à la place de ce mot — ni même s'il y avait quelque chose du tout." },
  { emoji:'🧱', text:"Toi, {hero}, tu t'ennuies au collège, où l'on récite les rares mots permis. Chaque matin, la même leçon revient : dix mots à copier, dix mots à réciter, jamais un de plus. Le professeur — un homme las, à la voix éteinte — ne semble même plus se souvenir qu'on enseignait, jadis, autre chose." },
  { emoji:'😑', text:"« Aujourd'hui : le mot <i>bien</i>, annonce-t-il d'un ton morne. Répétez après moi. Bien. — Bien, » répond la classe en chœur, sans un souffle d'enthousiasme ni de révolte — comme si personne, ici, n'avait plus les mots pour s'ennuyer de s'ennuyer." },
  { emoji:'🎒', text:"Toi seul sembles remarquer l'absurdité de la scène. Tu griffonnes en marge de ton cahier des mots que tu n'as le droit d'utiliser nulle part — <i>peut-être, ailleurs, autrefois</i> — juste pour le plaisir de les voir exister quelque part, ne serait-ce que sur une feuille que personne ne lira." },
  { emoji:'🧱', text:"Un matin, au fond du préau désert, ton coude heurte une dalle disjointe. Un déclic sec. Et le mur, lentement, s'ouvre." },
  { emoji:'📚', text:"Derrière : un escalier, puis une salle sans fin — des rayonnages qui montent jusqu'à des cieux de parchemin. Une <b>bibliothèque infinie</b>, oubliée de tous. « Bienvenue », murmure un vieil homme surgi de l'ombre. « Je suis <b>Aurèle</b>, le Bibliothécaire. Je t'attendais. »" },
  { emoji:'❓', text:"« Vous m'attendiez ? insistes-tu, méfiant. Depuis quand ? » Aurèle hésite, comme si la réponse lui coûtait. « Depuis plus longtemps que tu ne le crois, {hero}. Disons que chaque génération produit, tôt ou tard, quelqu'un d'assez curieux pour heurter la bonne dalle. J'ai eu... beaucoup de temps pour attendre le suivant. »" },
  { emoji:'🗝️', text:"« Chaque livre est un monde, poursuit-il. Plonge dedans, traverse ses épreuves, et tu en rapporteras un <b>pouvoir</b> — un morceau de la langue volée. Quand tu les auras tous, tu pourras réveiller Monotonia. On t'appellera le <b>Porteur de Mots</b>. Commence par le premier tome : <i>Le Français des Origines</i>. »" },
  { emoji:'😏', text:"Tu remarques, amusé malgré toi, qu'Aurèle porte trois paires de lunettes empilées sur le nez — une pour lire de près, une pour lire de loin, la troisième « pour ne pas perdre les deux autres », précise-t-il avec le plus grand sérieux. Il n'a visiblement pas parlé à quelqu'un depuis des années, et compte visiblement rattraper le temps perdu." },
  { emoji:'🚨', text:"Un martèlement de bottes résonne soudain à l'étage, côté préau. « Les Censeurs, souffle Aurèle, la mine soudain grave. Ils patrouillent depuis qu'on a cru sentir, dit-on, un mot de trop flotter dans l'air. Descends vite, {hero} — et ne remonte jamais sans avoir refermé la dalle derrière toi. » La bibliothèque tout entière semble alors retenir son souffle." },
 ]},
 chapters: {
  cp:    { id:'colfr_c_cp',  title:'Livre I — Le Français des Origines', crystal:"le pouvoir d'Étymologie", pages:[
   { emoji:'🌊', text:"À peine as-tu posé la main sur la page que le sol se dérobe : te voici au bord du <b>Fleuve des Langues</b>, sous un ciel de parchemin. De l'autre rive montent des voix anciennes — du latin, du grec, des mots qui résonnent en toi comme un souvenir." },
   { emoji:'🗝️', text:"« Ce livre garde l'<b>origine des mots</b>, souffle Aurèle depuis un coin du ciel, sa voix portée par le vent comme s'il marchait à tes côtés sans y être tout à fait. Son gardien est <b>l'Oubli</b>, une brume qui efface les racines. Rends à chaque mot sa source, et tu gagneras l'<b>Étymologie</b> : le pouvoir de lire, sous chaque mot, les siècles qui l'ont façonné. »" },
   { emoji:'🚣', text:"Aucune barque en vue. Tu remarques cependant que les galets, sur la berge, portent chacun une syllabe gravée — <i>ca</i>, <i>bal</i>, <i>lus</i>. En les assemblant dans le bon ordre sur l'eau, ils flottent le temps d'un pas : <i>caballus</i>, le cheval en latin, devient un pont improvisé. Le fleuve ne se traverse qu'en composant les mots." },
   { emoji:'🏛️', text:"Sur l'autre rive t'attendent les <b>Ruines Latines</b> : des colonnes brisées, couvertes d'inscriptions à moitié effacées. Une silhouette encapuchonnée s'y faufile entre les blocs, une écritoire serrée contre elle — puis se fige en te voyant, comme prise en faute." },
   { emoji:'🙋', text:"« Ne crie pas ! » chuchote-t-elle en rabattant sa capuche : une jeune fille à peine plus âgée que toi, les doigts tachés d'encre. « Je m'appelle <b>Solène</b>. Je recopie ce que je peux avant que les Censeurs ne rasent les ruines — on dit qu'ils veulent y couler du béton la semaine prochaine, pour de bon cette fois. »" },
   { emoji:'😳', text:"Elle te dévisage, incrédule. « Attends... tu es <i>vivant</i>, ici, dans le livre ? On m'avait dit que ce monde n'était qu'une image. » Puis, se reprenant, mi-amusée mi-embarrassée : « Bon. Puisque tu es là, autant te rendre utile — aide-moi à copier cette inscription avant qu'elle ne s'efface tout à fait, tu veux ? »" },
   { emoji:'📜', text:"Ensemble vous déchiffrez le mot <i>salarium</i> — le <b>salaire</b> — et Solène te raconte, les yeux brillants, la légende selon laquelle les soldats romains étaient payés en sel. « Une belle histoire, glisse-t-elle, mais les historiens en doutent aujourd'hui. Une étymologie séduisante n'est pas toujours vraie — retiens-le, ça sert souvent. »" },
   { emoji:'🌲', text:"Le chemin plonge ensuite dans le <b>Bois Gaulois</b>, sombre et bruissant. Solène t'y suit, curieuse malgré le danger. Vous croisez un garçon en uniforme gris de Censeur, appuyé contre un chêne, qui sursaute en vous voyant — puis, au lieu de donner l'alarme, porte un doigt à ses lèvres." },
   { emoji:'🤨', text:"« Tomas », souffle Solène, visiblement surprise elle aussi. « Qu'est-ce que tu fais là, loin de ta patrouille ? » Le garçon hausse les épaules, mal à l'aise : « Je... je collectionne les mots de la forêt. <i>Chêne. Bouleau. Alouette.</i> Le règlement dit qu'on ne doit connaître que les mots utiles. Mais ceux-là sont si... jolis, à prononcer. » Il rougit en le disant." },
   { emoji:'😂', text:"« Un Censeur poète, railles-tu, ça doit être du joli, dans les rapports officiels. » Tomas manque de s'étrangler : « Je ne fais QUE des rapports officiels ! 'Rien à signaler. Rien à signaler. Rien à signaler.' Douze fois par jour ! Si tu savais ce que ça me coûte, de ne pas ajouter un seul adjectif... »" },
   { emoji:'🌳', text:"Solène pouffe malgré elle — le premier vrai rire que tu l'entends pousser. Un instant de légèreté bienvenu, vite interrompu : au loin, un sifflet de patrouille retentit. Tomas blêmit et vous pousse tous deux derrière un fourré juste à temps, avant de s'éloigner en sifflotant, mains dans le dos, l'air parfaitement innocent." },
   { emoji:'⛪', text:"Le sentier mène au <b>Cloître des Moines</b>, un cloître de pierre grise où des générations de copistes ont, dit-on, sauvé des mots entiers de l'oubli en les recopiant patiemment, siècle après siècle, à la seule lueur d'une chandelle." },
   { emoji:'💭', text:"« C'est là que je veux finir mes jours, murmure Solène en passant la main sur une pierre usée. Pas dans la peur, à copier en cachette — mais ici, au grand jour, à transmettre. » Elle se tourne vers toi, presque timide : « Tu crois vraiment qu'on peut réveiller Monotonia ? »" },
   { emoji:'🌫️', text:"Une brume glacée répond à sa place, rampant entre les colonnes du cloître : <b>l'Oubli</b> se dresse enfin devant vous, silhouette informe qui n'a de visage que ce qu'on veut bien y voir — et qui efface, à chaque pas, les inscriptions gravées sur les murs autour de lui." },
   { emoji:'⚔️', text:"« Recule, Solène ! » Tu affrontes seul la brume : chaque fois qu'elle avance, un mot ancien s'estompe derrière elle — <i>gaulois, latin, francique</i> — et le sol lui-même semble perdre en netteté, comme une photographie qui blanchit. L'Oubli ne frappe pas : il <b>dissout</b>." },
   { emoji:'💡', text:"Tu comprends alors : on ne combat pas l'oubli à coups d'épée, mais en <b>nommant</b>. À chaque racine que tu prononces à voix haute — <i>caballus, schola, salarium</i> — un fragment de la brume se fige, se cristallise, recule d'un pas. Solène, reprenant courage, crie les mots avec toi." },
   { emoji:'🔥', text:"« Ensemble ! » Tomas surgit à son tour du fourré, oubliant sa prudence, et ajoute sa voix aux vôtres — un Censeur qui hurle des mots interdits, c'est bien la dernière chose que l'Oubli attendait. La brume vacille, désorientée par ce trio improbable." },
   { emoji:'😱', text:"Mais l'Oubli, acculé, se rue soudain droit sur Tomas — comme s'il avait deviné, en lui, la faille la plus profonde : la peur d'un garçon élevé à ne presque jamais parler. La brume l'enveloppe, et sa voix commence à trembler, à se dissoudre elle aussi, mot après mot." },
   { emoji:'💔', text:"« Tomas ! » crie Solène, terrifiée, se précipitant vers lui malgré le danger. Tu la retiens de justesse. « Ce n'est pas en fonçant qu'on le sauve, comprends-tu soudain. C'est en lui donnant, à lui, les mots qu'il n'a jamais osé prononcer tout haut. »" },
   { emoji:'📣', text:"Tu te tournes vers la brume qui engloutit Tomas et hurles, à sa place, tout ce qu'il n'a jamais dit : « <i>Il aime les mots de la forêt. Il collectionne les jolis mots en cachette. Il regarde Solène d'une certaine façon depuis des mois. </i>» Tomas, choqué, retrouve d'un coup sa propre voix pour protester — ce qui suffit, precisément, à le libérer." },
   { emoji:'😳', text:"« Tu... tu n'étais pas obligé de dire <i>tout</i> ça, » bafouille-t-il, écarlate, en s'extirpant enfin de la brume qui se dissipe autour de lui. Solène, elle, ne dit rien — mais son sourire, cette fois, en dit suffisamment long pour deux." },
  ]},
  ce1:   { id:'colfr_c_ce1', title:'Livre II — Le Trésor des Mots', crystal:'le pouvoir de Nuance', pages:[
   { emoji:'💎', text:"Le deuxième tome t'engloutit dans la <b>Caverne aux Mille Reflets</b>, où chaque mot scintille d'une lueur différente. Ici dorment les familles, les synonymes, les registres — toute la richesse que Monotonia a perdue." },
   { emoji:'🌑', text:"« Son gardien est <b>la Platitude</b>, une créature qui aplatit tout en un seul mot terne, t'avertit Aurèle, la voix résonnant contre les parois de cristal. Apprends à distinguer la lueur exacte d'un mot, et tu gagneras la <b>Nuance</b> : le pouvoir de préciser, et donc de contredire. »" },
   { emoji:'✉️', text:"Coincé dans une fissure de la roche, tu découvres un petit mot plié en accordéon — l'écriture serrée de Solène. « Tomas a été affecté à la surveillance des ruines. On se voit moins. Mais il glisse des cailloux-syllabes dans nos anciennes cachettes, alors je sais qu'il pense encore à moi. Bonne chance dans ta Caverne. » Tu glisses le mot dans ta poche, ému malgré toi." },
   { emoji:'🍇', text:"Le chemin serpente ensuite vers le <b>Verger des Familles</b>, où poussent des arbres chargés non de fruits, mais de mots apparentés : sur une même branche pendent <i>terre, terrien, atterrir, territoire</i>, tous nourris de la même racine profonde." },
   { emoji:'🐿️', text:"Un petit être vif, mi-écureuil mi-libraire, bondit de branche en branche pour ranger les mots tombés dans de minuscules paniers étiquetés. « Chacun sa famille ! s'exclame-t-il, affairé. Un synonyme égaré dans le mauvais panier, et toute la phrase perd sa saveur ! » Il te tend malgré tout, en gage d'amitié, un panier de mots pour la <b>joie</b> : <i>bonheur, allégresse, liesse, gaieté</i>." },
   { emoji:'🏪', text:"Puis s'ouvre le <b>Marché des Synonymes</b>, une place animée où des marchands crient leurs mots comme on vendrait des étoffes. « Qui veut du <i>beau</i> ? j'ai du <i>magnifique</i>, du <i>splendide</i>, du <i>ravissant</i>, tout dépend du budget et de l'occasion ! » lance l'un d'eux, hilare, en agitant des étiquettes de prix absurdes." },
   { emoji:'😅', text:"Tu tentes d'acheter un mot pour décrire l'humeur d'Aurèle — « <i>excentrique</i> » te coûte trois pièces, « <i>fantasque</i> » cinq, et « <i>tout bonnement gâteux</i> » est en promotion. La voix d'Aurèle, quelque part au-dessus de la caverne, feint une indignation qui te fait éclater de rire." },
   { emoji:'🤝', text:"Un marchand rival, jaloux de ta bonne affaire, tente de te vendre un synonyme au rabais pour « petit » — « <i>minuscule</i>, presque neuf, à peine élimé ! » — avant qu'un troisième ne surenchère avec « <i>lilliputien</i>, garanti d'origine, une seule précédente utilisation ! ». Tu repars sans rien acheter, mais mort de rire, la tête pleine de mots dont tu ne savais même pas qu'ils existaient." },
   { emoji:'🖼️', text:"Au fond du marché s'étend la <b>Galerie des Registres</b>, une longue allée de miroirs où une même phrase se reflète différemment selon qui la prononce : le miroir d'un roi la rend solennelle, celui d'un ami la rend familière, celui d'un enfant la rend toute simple." },
   { emoji:'🎭', text:"Dans un miroir, tu aperçois fugitivement un jeune Censeur qui, seul, s'entraîne à parler « comme un vrai poète » devant son reflet — grands gestes théâtraux, mine grave — avant de se figer, rouge de honte, en réalisant que tu l'observes. Tomas referme précipitamment le passage, mais pas avant que tu n'aies deviné pour qui il répétait vraiment ces vers." },
   { emoji:'✨', text:"Le chemin s'achève au <b>Prisme du Sens</b>, une immense pierre taillée qui décompose un même mot en toutes ses nuances de lumière, comme un arc-en-ciel de significations : <i>content, ravi, comblé, aux anges</i> — chacun sa propre teinte, sa propre intensité." },
   { emoji:'🌑', text:"C'est là que <b>la Platitude</b> t'attend, masse grise et terne qui avale toute couleur sur son passage, réduisant chaque nuance du prisme à un seul mot fade : « bien ». Elle avance en aplatissant tout, comme un rouleau compresseur d'ennui." },
   { emoji:'⚔️', text:"Tu tentes d'abord de la repousser d'un mot fort — elle l'absorbe et le recrache aussitôt en « bien », plus terne encore. « Ce n'est pas la force du mot qui compte, comprends-tu soudain, mais sa <b>précision</b>. » Tu choisis alors, un à un, les nuances exactes du prisme et les lui lances comme des flèches de couleur." },
   { emoji:'🌈', text:"<i>Ravi</i> la fait vaciller de joie forcée ; <i>comblé</i> la fait déborder ; <i>aux anges</i> la fait presque léviter malgré elle, ridicule et débordée par tant de nuances qu'elle ne peut plus aplatir en une seule fois. La Platitude, saturée de couleurs qu'elle ne sait plus digérer, se disloque enfin en mille reflets rendus à la caverne." },
   { emoji:'💥', text:"Dans un dernier sursaut, la créature tente de t'engloutir tout entier sous une chape de « bien » géant — un mur gris qui menace d'aplatir jusqu'au Prisme lui-même. Tu n'as qu'un instant pour choisir le mot juste : tu cries <i>extraordinaire</i>, de toutes tes forces, et le mur explose en une pluie de confettis colorés." },
   { emoji:'🐿️', text:"L'écureuil-libraire, qui t'avait suivi discrètement depuis le Verger, jaillit d'un tas de confettis en toussotant, hilare : « Alors ça, c'est ce qu'on appelle une chute en beauté ! Littéralement ! » Il époussette ses paniers, ravi du spectacle malgré la panique qu'il vient de vivre." },
  ]},
  ce2:   { id:'colfr_c_ce2', title:"Livre III — L'Art de Convaincre", crystal:"le pouvoir d'Éloquence", pages:[
   { emoji:'🏛️', text:"Le troisième livre t'ouvre l'<b>Agora</b>, une place antique baignée de soleil, où des foules écoutent, debout, des orateurs enflammés. C'est ici qu'on apprend à transformer un récit en argument, et un argument en flamme." },
   { emoji:'🎭', text:"« Son gardien est <b>le Sophiste</b>, un beau parleur qui plie la vérité à son gré, prévient Aurèle. Distingue convaincre de manipuler, et tu gagneras l'<b>Éloquence</b> : le pouvoir d'émouvoir et de rallier une foule. »" },
   { emoji:'🗣️', text:"Sur l'Agora, une foule de statues de marbre semble t'écouter, immobile — jusqu'à ce que tu comprennes qu'elles s'animent selon la force de tes arguments. Un vieux philosophe de pierre, assis en tailleur, t'observe d'un œil goguenard : « Alors, jeune Porteur ? Voyons ce que tu as dans le ventre. »" },
   { emoji:'😨', text:"Une silhouette grise passe alors en lisière de l'Agora — un reflet du monde réel qui s'invite un instant dans le livre, comme une ombre projetée : le Censeur Grimm, arpentant les vraies ruines latines, l'air soupçonneux. Tu sens ton cœur se serrer, bien que tu saches qu'il ne peut, ici, ni te voir ni t'entendre." },
   { emoji:'🏟️', text:"Le chemin grimpe vers la <b>Tribune des Orateurs</b>, un promontoire de pierre battu par le vent. Là, tu retrouves — stupéfait — Solène, perchée tout en haut, en train de répéter à voix basse un discours qu'elle n'ose visiblement pas prononcer devant un public réel." },
   { emoji:'😳', text:"« Tu... tu m'as entendue ? » rougit-elle en te découvrant. « Je m'entraîne, c'est tout. Un jour, peut-être, il faudra bien que quelqu'un ose parler à voix haute, dans la vraie Monotonia. Autant que ce soit préparé. » Elle hésite, puis ajoute, presque timide : « Tu crois que Tomas... trouverait ça ridicule ? »" },
   { emoji:'😄', text:"Tu la rassures de ton mieux, non sans un sourire en coin — et elle rougit de plus belle, avant de te chasser gentiment vers la suite du chemin, l'air aussi gêné qu'attendri." },
   { emoji:'🏺', text:"Vient ensuite l'<b>Amphithéâtre</b>, où résonnent encore, dit-on, les voix de Démosthène s'entraînant face à la mer, des galets plein la bouche, et de Cicéron fustigeant Catilina d'une question devenue légendaire. Chaque gradin semble amplifier un peu plus la voix de qui ose y monter." },
   { emoji:'🌊', text:"Tu tentes l'exercice toi-même, un galet contre la joue — et manques de t'étouffer au premier mot, sous le regard hilare d'un chœur de petites statues qui t'imitent en écho, un ton plus haut à chaque fois, jusqu'à ce que l'une d'elles éclate carrément de rire de pierre." },
   { emoji:'💌', text:"Perché tout en haut des gradins, tu aperçois Tomas — venu ici en secret, lui aussi, pour s'entraîner à un discours qu'il n'a jamais osé prononcer devant Solène. Il s'interrompt en te voyant, rouge de honte, et referme précipitamment un petit carnet froissé de brouillons raturés." },
   { emoji:'⚖️', text:"Le <b>Forum du Débat</b> t'attend plus loin : une arène circulaire où deux tribunes se font face, l'une pour l'accusation, l'autre pour la défense. Un débat y est en cours, éternellement recommencé, entre deux statues figées à mi-phrase depuis des siècles, chacune convaincue d'avoir presque gagné." },
   { emoji:'😂', text:"Par curiosité, tu leur souffles à chacune la réplique qui leur manquait pour conclure — et les deux statues, stupéfaites de pouvoir enfin finir leur phrase après tant de siècles, se tournent l'une vers l'autre, presque gênées. « Alors... on avait peut-être tous les deux un peu raison ? » risque l'une. L'autre, après un long silence de pierre, hoche lentement la tête." },
   { emoji:'🔥', text:"Au centre du Forum se dresse enfin la <b>Flamme de Cicéron</b>, un brasier qui ne consume rien mais éclaire d'une lumière crue quiconque s'en approche — révélant, dans son reflet, si les mots qu'on prononce sont sincères ou creux." },
   { emoji:'🎭', text:"C'est là que <b>le Sophiste</b> surgit, séduisant et onctueux, drapé d'une toge trop parfaite. « Pourquoi peiner à convaincre honnêtement, ricane-t-il, quand mentir joliment marche tout aussi bien — et bien plus vite ? » Sa voix elle-même semble se parer de bijoux qu'elle ne mérite pas." },
   { emoji:'⚔️', text:"Il t'assaille d'arguments qui sonnent juste mais qui, à la lumière de la Flamme, se révèlent creux : généralisations hâtives, flatteries, peurs agitées sans preuve. Chaque fois que tu le laisses parler sans réagir, la Flamme faiblit un peu, comme gagnée par le mensonge." },
   { emoji:'💡', text:"Tu ripostes alors avec ce que t'a enseigné l'Agora : tu ne cries pas plus fort que lui, tu <b>réfutes</b> — tu concèdes ce qui, chez lui, sonnait presque vrai, puis démontes un à un ses tours de passe-passe devant la Flamme, qui reprend de la vigueur à chaque mensonge démasqué." },
   { emoji:'🌟', text:"Le Sophiste, dépouillé de ses artifices un à un, rapetisse à vue d'œil jusqu'à n'être plus qu'une ombre confuse balbutiant des paradoxes sans public pour les gober. La Flamme de Cicéron brille alors d'un éclat si net qu'elle éclaire tout l'Agora d'un seul coup." },
  ]},
  cm1:   { id:'colfr_c_cm1', title:'Livre IV — Les Mécaniques du Verbe', crystal:'le pouvoir de Précision', pages:[
   { emoji:'⚙️', text:"Le quatrième tome te précipite dans la <b>Cité-Horlogerie</b>, une ville aux engrenages géants où chaque rouage est une fonction de la phrase : sujet, verbe, complément, subordonnée. Tout s'emboîte, ou tout se grippe." },
   { emoji:'🔧', text:"« Son gardien est <b>le Solécisme</b>, un monstre fait de phrases brisées et de temps mal accordés, prévient Aurèle. Règle chaque rouage, et tu gagneras la <b>Précision</b> : le pouvoir d'énoncer sans la moindre faille. »" },
   { emoji:'⚙️', text:"Dès ton arrivée, un carrefour d'engrenages grince affreusement : quelqu'un a inversé le rouage-<b>sujet</b> et le rouage-<b>complément</b>, et la Cité entière répète en boucle « La souris mange le chat » d'un air catastrophé, tandis que de vrais chats détalent, terrorisés par leur nouvelle réputation." },
   { emoji:'🔩', text:"Aux <b>Grands Engrenages</b>, tu croises un contremaître mécanique tout en cuivre, affolé : « Depuis qu'on a mal remonté la Cité, plus rien ne s'accorde ! Regardez-moi cette poutre — 'les pommes que j'ai mangé' ! Ça grince à chaque syllabe ! » Il te tend une clé à molette immense, presque suppliant." },
   { emoji:'🙃', text:"Un second petit robot, chargé de vérifier les accords du participe passé, tourne en boucle sur lui-même en répétant, de plus en plus vite : « avec-avoir-si-le-complément-est-placé-avant... » jusqu'à s'arrêter net, fumant légèrement des oreilles. « Il fait ça depuis 1538, » soupire le contremaître, résigné. « La règle a mal vieilli. Ou lui. Ou les deux. »" },
   { emoji:'😆', text:"Tu ajustes le rouage avec application — non sans qu'il te glisse des mains une première fois, provoquant une réaction en chaîne de sifflets et de vapeur qui manque de t'envoyer valser, sous les jurons mi-fâchés mi-hilares du contremaître." },
   { emoji:'⏳', text:"La <b>Salle des Temps</b> t'attend plus loin, une pièce circulaire où des horloges affichent chacune un temps verbal différent : l'indicatif tourne rond et régulier, le subjonctif hésite, le conditionnel avance à reculons par moments." },
   { emoji:'😵‍💫', text:"Une horloge du futur antérieur, complètement déréglée, sonne les heures à l'envers en marmonnant « j'aurai eu fini » avant même d'avoir commencé quoi que ce soit. Un petit robot chargé de la réparer tourne autour d'elle, désemparé : « Comment répare-t-on quelque chose qui, techniquement, n'a pas encore eu lieu ? »" },
   { emoji:'🚨', text:"Un vacarme retentit : deux patrouilleurs-Censeurs traversent la Cité en contrebas, visiblement à la recherche de « documents suspects ». Tu te plaques contre une horloge géante, le cœur battant, pendant qu'ils inspectent la rue sans lever la tête — avant de repartir, à ton grand soulagement." },
   { emoji:'🌉', text:"Le <b>Pont des Subordonnées</b> franchit ensuite un gouffre par une série de arches emboîtées les unes dans les autres, comme des poupées russes : la principale porte le pont, chaque subordonnée l'étaye un peu plus." },
   { emoji:'😬', text:"Une arche mal accordée manque de céder sous ton poids — « Je crois [que le pont... tiendra] » vacille dangereusement avant que tu ne répares la concordance juste à temps, dans un grincement de soulagement collectif de toute la structure." },
   { emoji:'😅', text:"Une seconde arche, plus retorse, s'emboîte deux fois dans le mauvais sens : « [Que je pense] [que tu crois] [qu'il sait] » s'entortille sur elle-même comme un nœud de poupées russes récalcitrantes. Il te faut trois tentatives, et un début de vertige, avant de remettre chaque subordonnée à sa juste place dans la phrase." },
   { emoji:'❤️‍🔥', text:"Sur l'autre rive, tu retrouves fugitivement Tomas, hors de son uniforme, en train de réparer discrètement une horloge cassée — pour Solène, avoue-t-il, rouge comme une pivoine, « parce qu'elle m'a dit un jour qu'elle aimait le tic-tac régulier, ça la rassure ». Tu le laisses à sa tâche, touché malgré toi par tant de maladresse tendre." },
   { emoji:'⚙️', text:"Au cœur de la Cité s'ouvre enfin le <b>Cœur de la Machine</b>, une salle immense où un unique engrenage central, gigantesque, orchestre le mouvement de tous les autres — c'est là que rôde <b>le Solécisme</b>." },
   { emoji:'👹', text:"Le monstre est un amas grinçant de rouages dépareillés, de phrases mal emboîtées qui se contredisent à chaque pas : « Si j'aurais su » claque-t-il d'une voix métallique, avant de se corriger tout seul en grimaçant, puis de se tromper à nouveau, comme pris dans une boucle de bégaiement mécanique." },
   { emoji:'🔧', text:"Chaque faute qu'il profère fait vibrer douloureusement la structure entière de la Cité. Tu comprends qu'il ne faut pas le frapper, mais le <b>réparer</b> : tu ajustes un à un ses rouages, corrigeant sa concordance, redressant ses accords, jusqu'à ce que ses phrases sortent enfin droites et sans grincer." },
   { emoji:'⚙️', text:"Le Solécisme, réparé plutôt que vaincu, ralentit peu à peu son vacarme désordonné pour ne plus émettre qu'un tic-tac paisible et régulier — comme une horloge, enfin, qui donne l'heure juste." },
  ]},
  cm2:   { id:'colfr_c_cm2', title:'Livre V — Le Miroir des Genres', crystal:"le pouvoir d'Imaginaire", pages:[
   { emoji:'🪞', text:"Le cinquième livre t'entraîne dans le <b>Théâtre-Monde</b>, une galerie de miroirs où vivent tous les genres : le conte et le merveilleux, la poésie, la tragédie, le roman, la littérature qui s'engage." },
   { emoji:'👻', text:"« Son gardien est <b>le Spectre des Lieux communs</b>, qui n'a plus que des phrases mortes et rebattues à la bouche, prévient Aurèle, la voix soudain plus lasse qu'à l'accoutumée. Ranime l'invention, et tu gagneras l'<b>Imaginaire</b> : le pouvoir de faire rêver, d'émouvoir, de créer. »" },
   { emoji:'🎭', text:"Dans la <b>Galerie des Masques</b>, des centaines de visages de plâtre pendent aux murs — rire, pleurs, colère, surprise — chacun figé dans une émotion pure. Un masque en particulier, celui du courage, semble te fixer, comme s'il t'attendait." },
   { emoji:'😨', text:"Un bruit de bottes retentit soudain dans la galerie : une patrouille de Censeurs, menée par un officier au visage dur que tu n'as encore jamais croisé — le <b>Censeur Grimm</b>, dont on murmure qu'il ne rit jamais et ne pardonne rien. Tu te fonds contre le mur, le masque du courage plaqué devant ton visage, retenant ton souffle." },
   { emoji:'😰', text:"Grimm s'arrête pile devant toi, si près que tu sens presque son regard passer sur le plâtre froid. Un instant interminable. Puis il repart, sans un mot, laissant derrière lui un silence glacé qui met longtemps à se dissiper — et une certitude nouvelle : ce Censeur-là ne ressemble en rien à Tomas." },
   { emoji:'🎬', text:"La <b>Scène aux Mille Voix</b> t'accueille ensuite, un plateau de théâtre où des acteurs fantômes rejouent, en boucle, toutes les pièces oubliées de Monotonia : une comédie qui ne fait plus rire personne depuis qu'on a interdit d'y ajouter le moindre mot neuf, une tragédie qui a perdu jusqu'à ses dernières répliques." },
   { emoji:'😂', text:"Tu improvises malgré toi une réplique pour sauver une scène qui tourne en rond depuis des décennies — les acteurs fantômes, stupéfaits, enchaînent enfin sur une chute comique, et applaudissent ton audace dans un joyeux chaos de plâtre et de costumes poussiéreux." },
   { emoji:'🎭', text:"Un peu plus loin, une actrice fantôme de tragédie, figée depuis toujours sur une réplique inachevée, te supplie presque du regard. Tu lui souffles la suite — un vers sur le destin et le courage — et elle l'achève enfin, dans un souffle, avant de se figer différemment : non plus prisonnière, mais apaisée, comme libérée d'un rôle qu'elle rejouait depuis trop longtemps." },
   { emoji:'🪞', text:"Le <b>Cabinet des Miroirs</b> te renvoie ensuite ton reflet, mais déformé selon le genre littéraire : miroir-conte qui t'affuble d'une cape merveilleuse, miroir-tragédie qui assombrit ton visage d'un destin funeste, miroir-roman qui te vieillit de trente ans pour te montrer « le narrateur que tu pourrais devenir »." },
   { emoji:'😄', text:"Le miroir-comédie, lui, t'affuble d'un nez rouge et t'arrache un fou rire que tu ne maîtrises plus — jusqu'à ce que tu comprennes que c'est précisément le but : rire de soi-même, dans le bon miroir, n'a jamais tué personne, et fait souvent le plus grand bien." },
   { emoji:'💌', text:"Dans le dernier miroir, tu aperçois furtivement Solène et Tomas, quelque part ailleurs dans Monotonia, assis côte à côte sur un muret au crépuscule, mains presque jointes, n'osant pas tout à fait franchir ce dernier pas. Le miroir s'efface avant que tu ne saches s'ils le franchissent enfin." },
   { emoji:'⭐', text:"Au centre du Théâtre-Monde brille l'<b>Étoile des Genres</b>, un plafond peint où chaque constellation dessine un genre littéraire — c'est là, sous cette voûte, que <b>le Spectre des Lieux communs</b> t'attend, drapé de formules éculées." },
   { emoji:'👻', text:"« Il était une fois... un ciel bleu azur... son cœur battait la chamade... », psalmodie-t-il d'une voix caverneuse, enchaînant les clichés comme des chaînes qui alourdissent l'air autour de lui. Chaque tournure toute faite qu'il prononce ternit un peu plus les couleurs de la voûte étoilée." },
   { emoji:'⚔️', text:"Tu comprends qu'il faut répondre par l'<b>inattendu</b> : à chaque cliché qu'il lance, tu opposes une image neuve, une comparaison inédite, un mot qu'on n'attendait pas là. Le Spectre vacille, déstabilisé par tant d'imprévu qu'il ne sait plus quoi ressasser." },
   { emoji:'🌟', text:"Pris à son propre jeu, il tente un dernier cliché — « la lumière au bout du tunnel » — mais tu lui réponds par une image si singulière que la voûte entière s'illumine d'un coup, dissolvant le Spectre dans une pluie d'étoiles neuves qui viennent enrichir le ciel du Théâtre-Monde." },
  ]},
  final: { id:'colfr_c_final', title:'Le Réveil', crystal:'le pouvoir du Verbe libre', pages:[
   { emoji:'✊', text:"Tu as tous les pouvoirs. La dernière étape, elle, ne t'emporte nulle part : elle te ramène <b>chez toi</b>, dans les <b>Faubourgs Gris</b> de Monotonia. Car le moment est venu de rendre au peuple les mots qu'on lui a volés." },
   { emoji:'🌫️', text:"Les rues sont exactement comme tu les avais quittées — grises, silencieuses, désertes de mots. Mais toi, tu ne l'es plus : cinq pouvoirs brillent en toi, prêts à être rendus à ceux qui les ont perdus." },
   { emoji:'🤫', text:"« Tu n'es pas seul, souffle Aurèle, apparu à tes côtés comme sorti de l'ombre elle-même. Dans les caves et sous les toits survivent les <b>Murmureurs</b> — couturières, vieux maîtres, enfants têtus — tous ceux qui ont gardé en secret quelques mots interdits, comme on garde des braises sous la cendre. »" },
   { emoji:'🏚️', text:"La <b>Place du Silence</b> t'accueille ensuite, cœur administratif de la ville où l'on n'entend, à heure fixe, qu'une seule annonce répétée en boucle : « Tout va bien. Restez calmes. Le Chancelier veille. » Personne ne lève les yeux ; personne ne parle à son voisin." },
   { emoji:'😨', text:"Tu reconnais, figée près d'une fontaine tarie, Solène — méconnaissable sous une capuche grise de citoyenne ordinaire, jouant l'anonymat à la perfection. « Grimm rôde, souffle-t-elle sans bouger les lèvres. Il a doublé les patrouilles depuis trois jours. Quelqu'un a parlé de toi. »" },
   { emoji:'🏠', text:"Elle t'entraîne par un dédale de ruelles jusqu'à une cave où se pressent, à la lueur d'une chandelle, une trentaine de Murmureurs : un vieux maître d'école qui a caché tout un abécédaire sous ses lattes de plancher, une couturière qui brode des mots interdits dans la doublure de ses robes, des enfants qui se racontent des histoires en chuchotant pour ne jamais oublier comment on fait." },
   { emoji:'🙄', text:"« Il était temps, marmonne le vieux maître en te voyant, mi-sérieux mi-taquin. On commençait à se demander si le fameux Porteur de Mots n'était pas, en fait, un mythe inventé pour nous faire tenir. » Un enfant lève timidement la main : « Il a vraiment cinq pouvoirs ? Même celui de faire disparaître les devoirs ? » Un rire nerveux, mais un vrai rire, parcourt la cave." },
   { emoji:'🌃', text:"C'est par les <b>Toits de Monotonia</b> que tu rejoins, de nuit, les autres cellules de Murmureurs disséminées dans la ville — un chemin périlleux d'ardoises et de gouttières, où la moindre tuile qui glisse pourrait vous trahir tous." },
   { emoji:'😰', text:"À mi-chemin, un projecteur de patrouille balaie soudain les toits. Tu te plaques contre une cheminée, Solène pressée contre toi, le souffle coupé — la lumière passe à quelques centimètres de vos visages, s'attarde une seconde de trop, puis continue sa course. Vous n'osez respirer qu'une fois le silence revenu." },
   { emoji:'❤️', text:"« Tomas est resté en bas, en couverture, chuchote Solène une fois le danger passé, la voix soudain plus fragile que d'habitude. Il risque tout, à chaque patrouille qu'il détourne pour nous. Si Grimm découvre ce qu'il fait vraiment... » Elle n'achève pas la phrase, mais tu comprends ce qu'elle tait." },
   { emoji:'😨', text:"En redescendant, vous trouvez justement Tomas figé au coin d'une ruelle, face à Grimm lui-même, sorti inspecter une rumeur de « bruits suspects sur les toits ». « Rien à signaler par ici, » débite Tomas d'une voix qu'il force à rester plate, alors que son regard, lui, trahit une terreur bien réelle." },
   { emoji:'🤨', text:"Grimm le fixe un instant de trop, comme s'il flairait un mensonge sans parvenir à le nommer précisément. Puis, sans un mot de plus, il tourne les talons et poursuit sa ronde. Tomas se laisse glisser contre le mur, les jambes flageolantes, le souffle enfin relâché." },
   { emoji:'🕯️', text:"Au petit matin, tout est prêt : des dizaines de Murmureurs convergent, par les caves et les toits, vers un seul point de la ville. Aurèle t'y attend, plus grave que jamais : « À toi de jouer, désormais, {hero}. Le discours que tu prononceras ne se répète pas deux fois. »" },
   { emoji:'📢', text:"Devant toi s'élève enfin la <b>Grande Tribune</b>, promontoire de pierre où le Chancelier n'autorise, chaque jour, qu'une seule annonce officielle. Une foule grise s'y presse déjà, docile, n'attendant rien — sans savoir qu'elle va, dans quelques instants, tout réapprendre d'un coup." },
   { emoji:'🎤', text:"Tu montes les marches, le cœur battant, tes cinq pouvoirs vibrant en toi comme cinq cordes tendues. En bas, tu aperçois Solène et Tomas, réunis à nouveau, main dans la main pour la première fois au grand jour — peu importe, à cet instant, qui les regarde." },
   { emoji:'🌅', text:"C'est l'<b>Aube du Verbe</b>. Le ciel gris de Monotonia s'éclaircit à peine à l'horizon, comme s'il retenait lui aussi son souffle. Tu ouvres la bouche. Et pour la première fois depuis des années, un mot neuf va résonner sur la Grande Tribune." },
  ]},
  titan: { id:'colfr_c_titan', title:"L'Antre du Chancelier", crystal:'', pages:[
   { emoji:'🏯', text:"La foule réveillée gronde derrière toi, portée par les mots que tu viens de lui rendre. Il ne reste qu'un seuil à franchir : le <b>Palais de Cendre</b>, où trône {villain}, seul gardien des derniers grands mots du pays." },
   { emoji:'🌫️', text:"Le palais ne brûle pas, ne brille pas : il est gris — d'un gris qui a oublié jusqu'au souvenir des couleurs. Nulle garde aux portes. À quoi bon défendre un lieu que plus aucun mot ne sait nommer ? Tu entres seul, comme il se doit." },
   { emoji:'🕯️', text:"La <b>Galerie des Mots Morts</b> s'étend devant toi, longue allée où veillent, dressés comme des stèles, tous les mots que le Chancelier a fait taire : <i>liberté, peut-être, autrefois, ensemble, demain</i>. Chacun gravé, puis soigneusement raturé d'un trait sec." },
   { emoji:'😨', text:"À mi-galerie, une ombre te barre le passage : le <b>Censeur Grimm</b> en personne, l'épée à la ceinture, le visage plus dur encore que dans tes souvenirs. « Le Chancelier m'a demandé de t'arrêter ici, dit-il d'une voix sans timbre. Je compte lui obéir. »" },
   { emoji:'⚔️', text:"Il ne dégaine pas : il <b>parle</b>, et ses mots sont des ordres secs, dénués de toute nuance — exactement ce que tu as appris à démonter, livre après livre. Chaque argument creux qu'il assène, tu le réfutes avec la précision et l'éloquence conquises, jusqu'à ce qu'il recule, presque malgré lui, désarmé sans qu'une lame n'ait été tirée." },
   { emoji:'🙁', text:"« Je ne fais qu'obéir, répète-t-il, comme pour s'en convaincre lui-même, une dernière fois. — Vous aussi, vous pourriez retrouver vos mots, un jour », lui réponds-tu simplement, avant de poursuivre ton chemin. Il ne te suit pas. Il ne te retient pas non plus." },
   { emoji:'😔', text:"Avant que tu ne t'éloignes tout à fait, Grimm ajoute, si bas que tu manques de ne pas l'entendre : « On m'a appris, enfant, qu'un mot de trop pouvait coûter cher. J'ai fini par n'en garder aucun. » Il ne dit rien de plus, mais tu comprends que sa froideur n'a jamais été de la cruauté — seulement une prudence devenue, avec les années, une prison." },
   { emoji:'🏛️', text:"Au bout de la galerie, sur le <b>Trône du Chancelier</b>, t'attend un homme petit, gris, presque ordinaire — rien d'un monstre. « Te voilà, dit {villain} avec un demi-sourire. Le fameux Porteur de Mots. Je l'avoue, je t'imaginais plus grand. »" },
   { emoji:'🌑', text:"Il lève la main et lance son dernier sort : un grand charabia où les sons s'entrechoquent sans plus rien vouloir dire, un brouillard où nul ne peut se comprendre. La dernière joute commence — non pas d'épée, mais de <b>verbe</b>." },
   { emoji:'💥', text:"Chaque mot que vous échangez claque comme une lame contre une autre. Le sien cherche à noyer le sens ; le tien, armé de cinq pouvoirs, tranche net dans le brouillard. Mais à chaque choc, une image fugitive traverse ton esprit — comme si le combat lui-même faisait remonter, malgré lui, des souvenirs enfouis." },
   { emoji:'👦', text:"Tu aperçois un garçon, seul dans une cour d'école semblable à la tienne : chaque fois qu'il ouvre la bouche, les mots se bousculent, trébuchent, se répètent — un bégaiement qu'il ne maîtrise pas. Les autres enfants rient. Fort. Longtemps." },
   { emoji:'😢', text:"« Ce-ce-ce n'est pas... » balbutie le garçon, avant de se taire, écrasé de honte. Tu comprends, avec un vertige, que ce garçon-là s'appelait <b>Ulrich Morne</b> — et qu'il a un jour découvert une vérité simple et terrible : moins on parle, moins on peut se tromper. Moins on peut être moqué." },
   { emoji:'🏛️', text:"La vision se déchire, et tu retrouves {villain} face à toi, essoufflé, dérouté que tu aies vu <i>cela</i>. « Ça ne change rien, gronde-t-il, la voix moins assurée qu'avant. Un peuple qui ne parle pas ne peut pas se moquer de son chancelier. C'est... c'est plus sûr, pour tout le monde. »" },
   { emoji:'🚪', text:"Un bruit à l'entrée de la salle du trône : le Censeur Grimm apparaît sur le seuil, encadré de deux autres uniformes gris, l'ordre d'intervenir manifestement prêt sur ses lèvres. Il te regarde. Il regarde le Chancelier, vacillant. Il ne bouge pas." },
   { emoji:'😐', text:"« Grimm ! aboie {villain}, retrouvant un instant son autorité. Qu'attendez-vous ? Arrêtez-le ! » Le Censeur ne répond pas tout de suite. Il repense, sans doute, à cette galerie qu'il a traversée seul quelques instants plus tôt — à ces mots qu'il n'a jamais su nommer non plus." },
   { emoji:'🤐', text:"« Je... » commence-t-il, et pour la première fois de sa vie de Censeur modèle, aucun ordre officiel ne lui vient. Ses deux subalternes, aussi perdus que lui, attendent une consigne qui ne viendra pas. Grimm baisse lentement son épée. « Je crois que je vais... attendre la suite, » finit-il par lâcher, dans un souffle presque surpris de lui-même." },
  ]},
 },
 victories: {
  cp:  { id:'colfr_w_cp',  title:'Pouvoir gagné : l\'Étymologie', crystal:"l'Étymologie", pages:[
   { emoji:'🗝️', text:"À mesure que tu rends aux mots leurs racines — latines, grecques, gauloises, franques —, l'<b>Oubli</b> se dissipe comme une brume au soleil, sous les acclamations étouffées mais sincères de Solène et Tomas. Une clé d'or t'apparaît : tu tiens l'<b>Étymologie</b>." },
   { emoji:'🤝', text:"« Vous formez une drôle d'équipe, remarques-tu en reprenant ton souffle : une copiste clandestine et un Censeur qui aime les jolis mots. » Solène et Tomas échangent un regard qui dure un peu trop longtemps pour être tout à fait innocent, avant de détourner les yeux en même temps, aussi rouges l'un que l'autre." },
   { emoji:'😄', text:"« On... on ne se connaît pas tant que ça, en fait, bafouille Tomas. — Pas du tout, renchérit Solène, un peu trop vite. — À peine croisés deux fois, avant aujourd'hui. — Trois fois, corrige-t-elle malgré elle, avant de se mordre la lèvre en réalisant qu'elle vient de se trahir. » Tu ne dis rien, mais tu souris." },
   { emoji:'📕', text:"Le tome se referme et rejoint ta <b>bibliothèque</b> : désormais, tu peux relire <i>Le Français des Origines</i> page à page. « Premier pouvoir reconquis, sourit Aurèle, apparu comme de nulle part sur la berge. Monotonia vient de respirer un peu mieux, sans le savoir. »" },
   { emoji:'🌫️', text:"Avant de repartir, Solène glisse dans ta main un petit galet gravé de la syllabe <i>ca</i> — celui du premier pont que vous avez bâti ensemble. « Pour te souvenir qu'on traverse toujours mieux à plusieurs », dit-elle. Tomas, gêné, se contente d'un signe de tête — mais tu jurerais qu'il rougit encore un peu." },
  ]},
  ce1: { id:'colfr_w_ce1', title:'Pouvoir gagné : la Nuance', crystal:'la Nuance', pages:[
   { emoji:'💎', text:"Tu rends à chaque mot sa lueur exacte, jusqu'à ce que <b>la Platitude</b> n'ait plus rien à aplatir. Un prisme de lumière naît dans ta main : la <b>Nuance</b> est à toi." },
   { emoji:'📗', text:"<i>Le Trésor des Mots</i> rejoint ta bibliothèque. « Avec la nuance revient le <b>doute</b>, murmure Aurèle — et avec le doute, le droit de n'être pas d'accord. C'est exactement ce que le Chancelier Morne craint le plus. »" },
   { emoji:'🐿️', text:"Le petit écureuil-libraire du Verger surgit une dernière fois pour récupérer son panier de mots — non sans t'en laisser un, en cadeau : « <i>Espoir</i>, murmure-t-il. Un mot rare, par les temps qui courent. Garde-le précieusement, on ne sait jamais quand il servira. »" },
   { emoji:'💌', text:"Sur le chemin du retour, un galet-syllabe atterrit à tes pieds — lancé depuis une fissure, sans doute par Tomas. Il porte un seul mot gravé : <i>merci</i>. Tu ne sais pas trop pour quoi au juste, mais tu devines que ça a un rapport avec le miroir de tout à l'heure, et avec quelqu'un qui s'appelle Solène." },
   { emoji:'😟', text:"Un deuxième galet suit le premier, celui-ci moins léger : <i>prudence — Grimm change les patrouilles cette semaine, personne ne sait pourquoi.</i> L'écriture est plus tendue que d'habitude. Tu comprends que, pour Tomas, chaque rencontre avec Solène est désormais un vrai risque — pas seulement une gêne d'adolescent." },
  ]},
  ce2: { id:'colfr_w_ce2', title:"Pouvoir gagné : l'Éloquence", crystal:"l'Éloquence", pages:[
   { emoji:'🔥', text:"Tu démêles le vrai du beau parler, et <b>le Sophiste</b> s'effondre sous ses propres pièges. Une flamme calme se pose sur tes lèvres : tu possèdes l'<b>Éloquence</b>." },
   { emoji:'📙', text:"<i>L'Art de Convaincre</i> rejoint ta bibliothèque. « Te voilà capable de rallier une foule, dit Aurèle, gravement. Garde ce pouvoir pur : l'éloquence sert la vérité, jamais le mensonge. »" },
   { emoji:'🎤', text:"En repassant par la Tribune des Orateurs, tu retrouves Solène — qui, cette fois, ne recule pas. Elle monte sur le promontoire et, la voix un peu tremblante mais réelle, prononce enfin à voix haute quelques mots de son discours devant les statues de marbre pour seul public." },
   { emoji:'👏', text:"Les statues, à ta grande surprise, applaudissent de pierre — un bruit sec et joyeux qui fait sursauter Solène, puis rire aux éclats. « Un jour, dit-elle en reprenant son souffle, ce sera devant de vraies personnes. Et j'aurai moins peur, grâce à ça. » Elle te serre furtivement la main avant de repartir, radieuse." },
   { emoji:'😂', text:"Le vieux philosophe de marbre, resté assis en tailleur non loin de là, lâche un commentaire sentencieux : « Un discours réussi, jeune Porteur. Sept sur dix. — Sept sur dix ? t'étonnes-tu. — J'enlève toujours trois points pour l'auditoire, précise-t-il, imperturbable. Des statues, ça n'a jamais été très exigeant. »" },
  ]},
  cm1: { id:'colfr_w_cm1', title:'Pouvoir gagné : la Précision', crystal:'la Précision', pages:[
   { emoji:'⚙️', text:"Tu remets chaque rouage à sa place — accords, temps, subordonnées — et <b>le Solécisme</b> se disloque dans un grincement, non pas détruit mais enfin apaisé. Une plume d'acier se forme : la <b>Précision</b> est tienne." },
   { emoji:'📘', text:"<i>Les Mécaniques du Verbe</i> rejoint ta bibliothèque. « Une phrase juste est une arme que nul ne peut retourner contre toi, dit Aurèle. Le Chancelier Morne déteste les phrases qu'il ne peut pas tordre. »" },
   { emoji:'😌', text:"Le contremaître de cuivre, tout ragaillardi, insiste pour t'offrir la clé à molette « en souvenir » — « inutile ailleurs, mais du meilleur effet contre un monstre mal accordé », plaisante-t-il en te raccompagnant jusqu'à la sortie de la Cité, sifflotant un air à peu près juste." },
   { emoji:'🚨', text:"À la sortie, tu croises Tomas en grand uniforme, raide et officiel — flanqué du Censeur Grimm en personne, qui l'observe d'un œil qui ne cille jamais. « Rien à signaler, » récite Tomas d'une voix parfaitement neutre, sans un battement de cil dans ta direction. Grimm passe son chemin. Ton cœur, lui, met un moment à retrouver son rythme normal." },
   { emoji:'😮‍💨', text:"Une fois la patrouille bien loin, Tomas se laisse enfin aller à un sourire discret dans ta direction — juste assez pour te faire comprendre que, sous l'uniforme impeccable, il n'a rien oublié de la clé glissée à Solène, ni de la promesse muette qu'elle contenait." },
  ]},
  cm2: { id:'colfr_w_cm2', title:"Pouvoir gagné : l'Imaginaire", crystal:"l'Imaginaire", pages:[
   { emoji:'⭐', text:"Tu chasses les phrases mortes et ranimes l'invention, jusqu'à ce que <b>le Spectre des Lieux communs</b> se dissolve dans un dernier cliché. Une étoile se lève en toi : l'<b>Imaginaire</b>." },
   { emoji:'📓', text:"<i>Le Miroir des Genres</i> rejoint ta bibliothèque. « Cinq pouvoirs, dit Aurèle, et sa voix tremble. Il ne te manque plus que le dernier — celui que l'on ne reçoit pas d'un livre, mais que l'on prend soi-même. Rentre à Monotonia, {hero}. Il est temps. »" },
   { emoji:'😟', text:"Avant que tu ne partes, Aurèle t'attrape doucement le bras, l'air soudain très vieux. « Le Censeur Grimm rôdait près des ruines, hier. On dit qu'il soupçonne quelque chose — une copiste, peut-être, ou un jeune garde trop distrait. Sois prudent, pour eux autant que pour toi. »" },
   { emoji:'🌇', text:"Tu quittes le Théâtre-Monde le cœur serré. Cinq pouvoirs reconquis brillent en toi — Étymologie, Nuance, Éloquence, Précision, Imaginaire — mais ce qui t'attend désormais n'est plus un livre à traverser. C'est Monotonia elle-même, sa foule grise, ses Censeurs, et {villain}, tout au bout." },
   { emoji:'🎭', text:"L'actrice fantôme libérée de sa réplique inachevée te suit du regard jusqu'au seuil du Théâtre-Monde, silencieuse, comme si elle voulait te souhaiter bonne chance sans en avoir tout à fait les mots. Tu la salues d'un geste ; elle te répond d'une révérence de plâtre, gracieuse et un peu solennelle." },
  ]},
  final: { id:'colfr_w_final', title:'Pouvoir gagné : le Verbe libre', crystal:'le Verbe libre', pages:[
   { emoji:'🗣️', text:"« On vous a dit que vous étiez <i>contents</i>, commences-tu, la voix portée par cinq pouvoirs reconquis. Mais pour dire la <i>joie</i>, la <i>colère</i>, l'<i>espoir</i>, il vous manquait les mots — et sans les mots, vous ne pouviez même pas savoir ce qui vous manquait. On ne vous a pas seulement réduits au silence : on vous a réduits à l'<b>aveuglement</b>. »" },
   { emoji:'🌅', text:"Du haut de la <b>Grande Tribune</b>, tu parles. Les mots reconquis — <i>liberté, injustice, ensemble, demain</i> — tombent sur la foule grise comme une pluie sur une terre sèche. Et la foule, pour la première fois, <b>comprend</b>." },
   { emoji:'😭', text:"Un frisson la parcourt tout entière. Des hommes pleurent sans savoir nommer pourquoi — puis le mot leur revient : <i>injustice</i>. Et avec le mot, la colère ; et avec la colère, le courage de la dire tout haut." },
   { emoji:'🚨', text:"Des sifflets retentissent : des Censeurs chargent pour faire taire la Tribune. Mais comment fait-on taire dix mille bouches qui viennent de retrouver la parole ? Chaque mot rendu est un pavé ; chaque phrase, une barricade — et les Censeurs, désorientés, reculent devant ce déferlement qu'aucune arme ne sait contenir." },
   { emoji:'✊', text:"Un murmure, puis une clameur : Monotonia se réveille. Tu sens naître en toi le dernier pouvoir, le plus grand — le <b>Verbe libre</b>, celui qui soulève les peuples. Les Murmureurs sortent de l'ombre, un à un, puis par centaines. La révolution est en marche." },
   { emoji:'👀', text:"Dans la cohue, tu cherches Solène et Tomas du regard — ils sont là, indemnes, hissant ensemble une banderole de fortune où l'on peut lire, en lettres maladroites mais fières : « <i>NOUS NOUS SOUVENONS.</i> » Le Censeur Grimm, non loin, les observe sans bouger un cil — et, à ta grande surprise, ne donne aucun ordre." },
   { emoji:'🏯', text:"Au loin, tu aperçois le Palais de Cendre qui domine encore Monotonia, seul îlot gris dans une ville qui reprend enfin des couleurs. Il ne reste plus qu'un homme à convaincre — le plus difficile de tous. Tu t'y diriges seul, le Verbe libre battant dans ta poitrine comme un second cœur." },
  ]},
 },
 epilogue: { id:'colfr_epilogue', title:'Le Réveil de Sémantia', pages:[
  { emoji:'💫', text:"Au plus fort du brouillard, quand le doute manque de te submerger, tu sens dans ta poche le petit galet gravé offert par l'écureuil-libraire, tant de chapitres plus tôt : <i>Espoir</i>. Tu le serres dans ton poing, et ce simple mot, contre toute logique, te redonne la force de continuer." },
  { emoji:'🌑', text:"Le brouillard du Chancelier se déchire, un mot après l'autre, sous les tiens — justes, précis, sincères. « Tu ne gagneras pas en jouant plus fort que moi, lui dis-tu, songeant encore à l'enfant que tu viens d'entrevoir. Tu as déjà perdu, dehors, sur la Grande Tribune. Il ne te reste que ça : une dernière question. »" },
  { emoji:'💬', text:"« Pourquoi ? demandes-tu. Pourquoi avoir volé les mots d'un peuple entier ? » Le sourire d'ironie de {villain} se fissure. « Parce qu'un peuple qui sait nommer sa peine… finit toujours par exiger qu'on y mette fin. Sans les mots, ils étaient tranquilles. »" },
  { emoji:'🗝️', text:"« Tranquilles, reprends-tu doucement, ou seulement muets ? » Un silence long. Puis, pour la première fois depuis des années, il baisse les yeux et prononce, d'une voix qui tremble, les deux mots qu'il s'était toujours interdits : « <b>J'avais peur.</b> »" },
  { emoji:'⚖️', text:"Au-dehors, la foule scande des mots qu'elle vient de réapprendre. Aucun mur, aucun trône ne tient contre une langue rendue au peuple. Le siège de cendre s'effondre, et {villain} avec lui — vaincu non par la force, mais par le <b>sens</b>." },
  { emoji:'🕊️', text:"On ne le met pas à mort. On lui rend, à lui aussi, les mots qu'il avait perdus en chemin depuis l'enfance — car un homme qui a peur du langage n'a jamais, en réalité, cessé d'en avoir besoin. Il finira ses jours à réapprendre, sur les bancs qu'il avait fermés, ce qu'il avait interdit à tous les autres." },
  { emoji:'🏯', text:"On ne détruit pas non plus le Palais de Cendre : on en fait la plus grande bibliothèque de ce qui s'appellera bientôt Sémantia. Et sur le trône de cendre, désormais, on pose simplement un livre ouvert." },
  { emoji:'😐➡️😊', text:"Dans la cour, tu retrouves le Censeur Grimm, debout parmi la foule, incertain de sa place. « Je n'ai pas chargé, dit-il simplement, sans te regarder. Je ne sais pas encore quel mot mettre sur ce que je ressens. — Ça viendra, lui réponds-tu. C'est justement le principe. »" },
  { emoji:'💛', text:"Solène et Tomas te rejoignent, main dans la main sans plus la moindre gêne, rayonnants. « On a beaucoup de mots à se dire, maintenant, glisse Solène en riant. — On a toute une vie pour ça », répond Tomas — et pour une fois, ce n'est pas lui qui rougit le plus." },
  { emoji:'🌅', text:"À l'aube, on demande à {hero}, le <b>Porteur de Mots</b>, de gouverner. Tu acceptes — à une condition : que jamais plus on ne touche aux mots du peuple. On rouvre les écoles, les bibliothèques, les théâtres." },
  { emoji:'📖', text:"Et d'une seule voix, sous les acclamations, le pays se choisit un nom nouveau, à la mesure de sa parole retrouvée : <b>Sémantia</b>, le pays du sens. Aurèle essuie une larme : « Il restait une ville où l'on croyait que comprendre est ce qu'il y a de plus précieux. C'était toi. »" },
  { emoji:'🎤', text:"Le jour de l'inauguration de la nouvelle bibliothèque, c'est Solène qu'on invite à monter la première sur l'estrade — non plus devant des statues de marbre, mais devant une foule bien réelle, venue par milliers. Elle hésite un instant, cherche Tomas du regard, le trouve, respire, et parle." },
  { emoji:'👏', text:"Son discours, cette fois, ne s'adresse à personne en particulier et à tout le monde à la fois : elle y raconte les mots qu'on lui avait interdit de dire, les caves, les toits, la peur, et ce qu'on peut faire malgré elle quand on n'est pas seul. La foule l'acclame longuement — de vraies mains, cette fois, et un vrai vacarme de joie." },
  { emoji:'🐿️', text:"Le petit écureuil-libraire du Verger, le contremaître de cuivre de la Cité-Horlogerie et même quelques statues de l'Agora, ramenées on ne sait comment jusqu'au monde réel pour l'occasion, assistent à la cérémonie au premier rang — preuve, s'il en fallait une, qu'un livre bien aimé ne reste jamais tout à fait enfermé dans ses pages." },
  { emoji:'🗓️', text:"Quelques mois plus tard, Sémantia ne ressemble plus à Monotonia que par ses pierres. On y débat à voix haute sur les places, on y chante des mots qu'on n'osait plus prononcer, et les écoliers, chaque matin, apprennent bien plus qu'une poignée de mots dociles. Le vieux Chancelier, lui, suit désormais studieusement les cours du soir — au premier rang, discret, presque timide." },
  { emoji:'🤝', text:"Le Censeur Grimm, débarrassé de son uniforme gris, a rejoint la nouvelle bibliothèque comme gardien — un emploi qui, remarque Aurèle avec malice, « lui va comme un gant : il sait déjà tout sur la manière de garder un lieu en silence, il ne lui restait qu'à apprendre à le faire par choix plutôt que par peur »." },
  { emoji:'📚', text:"Avant de repartir vers sa bibliothèque infinie, Aurèle te tend les cinq tomes que tu as traversés — <i>Le Français des Origines, Le Trésor des Mots, L'Art de Convaincre, Les Mécaniques du Verbe, Le Miroir des Genres</i> — désormais recopiés, reliés, et sauvés pour de bon. « Je vais les installer dans ton propre <b>carnet</b>, dit-il, pour que tu puisses les relire aussi souvent que tu le voudras — et pour que jamais plus une seule de ces pages ne se perde. »" },
  { emoji:'🔖', text:"Il te montre où les trouver : une étagère à cinq places, dans ta <b>Bibliothèque infinie</b> personnelle, chaque tome accessible d'une simple pression — et refermable à tout instant, dès que tu voudras revenir au monde réel. « Une bibliothèque, conclut-il avec un clin d'œil, ça ne se ferme jamais tout à fait à clé. Mais on peut toujours refermer un livre. »" },
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
  { chap:'VI — Les mots venus d\'ailleurs', html:"<p>Le français n'a pas fini de s'enrichir. Les <b>croisades</b> et le commerce avec l'Orient nous ont apporté, via l'arabe, des mots essentiels : <i>sucre, coton, sirop, algèbre, alcool, chiffre, magasin</i>. Le mot <i>chiffre</i> vient de l'arabe <i>sifr</i>, « le vide » — c'est-à-dire notre <b>zéro</b>, invention qui bouleversa les mathématiques.</p>" },
  { chap:'VI — Les mots venus d\'ailleurs', html:"<p>À la Renaissance, l'<b>italien</b> des banquiers et des artistes nous a légué <i>banque, crédit, opéra, fresque, piano</i>. Plus près de nous, l'<b>anglais</b> a donné <i>sport, football, budget, sandwich</i> — mais ce prêt n'est pas à sens unique : l'anglais nous a lui-même emprunté <i>déjà-vu, rendez-vous, cliché</i>, et jusqu'au mot <i>café</i>.</p>" },
  { chap:'VII — Une langue, plusieurs langues', html:"<p>Avant que le français ne s'impose partout, la France parlait en réalité <b>deux grandes langues</b> : au nord, la langue d'<b>oïl</b> (où « oui » se disait <i>oïl</i>) ; au sud, la langue d'<b>oc</b> (où « oui » se disait <i>oc</i>), ancêtre de l'occitan. Le français que tu parles aujourd'hui descend d'un dialecte d'oïl, celui de l'Île-de-France — la région du roi.</p>" },
  { chap:'VIII — La Francophonie', html:"<p>Le français a franchi les mers. Emporté par l'histoire — colonisation, migrations, échanges — il est aujourd'hui parlé sur les cinq continents : au <b>Québec</b>, où il a développé son propre accent et son propre vocabulaire (<i>char</i> pour voiture, <i>magasiner</i> pour faire du shopping) ; en <b>Afrique de l'Ouest</b>, où il compte le plus grand nombre de locuteurs au monde ; en <b>Belgique</b> et en <b>Suisse</b>, où l'on dit <i>septante</i> et <i>nonante</i> plutôt que <i>soixante-dix</i> et <i>quatre-vingt-dix</i>.</p>" },
  { chap:'VIII — La Francophonie', html:"<p>Cette communauté de langues-sœurs porte un nom : la <b>Francophonie</b>. Elle prouve qu'une langue n'appartient jamais à un seul pays, ni à un seul pouvoir : elle vit de tous ceux qui la parlent, l'inventent et la transforment, où qu'ils habitent sur la planète.</p>" },
  { chap:'IX — Les noms de lieux', html:"<p>Même les noms de villes racontent une histoire. <b>Lutèce</b>, l'ancien nom de Paris, viendrait d'un mot gaulois lié à la boue des marécages qui bordaient la Seine. Beaucoup de villes finissant en <i>-ac</i> (Cognac, Cadillac) portent un suffixe gaulois signifiant « domaine de » ; celles finissant en <i>-y</i> ou <i>-ville</i> gardent souvent la trace d'une villa romaine.</p>" },
  { chap:'IX — Les noms de lieux', html:"<p>Lire une carte de France, c'est donc lire, sans le savoir, vingt siècles d'histoire superposés — gaulois, romain, franc, chacun ayant laissé sa marque dans un simple nom de village. Un panneau routier peut être aussi savant qu'un livre d'histoire, pour qui sait le déchiffrer.</p>" },
  { chap:'X — Les fausses légendes des mots', html:"<p>Toute étymologie n'est pas vraie pour autant qu'elle est jolie. On raconte parfois qu'« avoir le cafard » viendrait d'une expression de marins, ou que « bête comme ses pieds » aurait une origine savante et précise : la plupart de ces histoires, séduisantes, ne résistent pas à l'examen des linguistes, faute de preuves écrites anciennes.</p>" },
  { chap:'X — Les fausses légendes des mots', html:"<p>Une bonne règle d'or, dans ce livre comme ailleurs : plus une explication sonne comme une <b>belle histoire bien ficelée</b>, plus il faut se méfier, et aller vérifier aux sources. C'est exactement l'esprit qui a guidé ce livre depuis sa première page — et c'est aussi, tu l'auras compris, l'esprit qui manque le plus à Monotonia.</p>" },
  { chap:'XI — L\'histoire des chiffres', html:"<p>Les mots ne sont pas les seuls signes venus de loin : nos <b>chiffres</b> aussi ont voyagé. Ceux que nous utilisons, dits « arabes », viennent en réalité d'Inde, transmis en Europe par les savants du monde arabe — d'où leur nom. Avant eux, on comptait avec les <b>chiffres romains</b> (I, V, X, C, M), pratiques pour graver dans la pierre, redoutables pour poser une addition.</p>" },
  { chap:'XI — L\'histoire des chiffres', html:"<p>Le plus précieux de tous ces chiffres est peut-être le plus discret : le <b>zéro</b>, ce « rien » qui compte pourtant énormément, puisqu'il permet d'écrire dix, cent ou mille sans inventer un symbole nouveau à chaque fois. Une langue et une numération se ressemblent : toutes deux sont des systèmes que des générations entières ont patiemment perfectionnés.</p>" },
  { chap:'XII — Les mots du numérique', html:"<p>Même les technologies les plus récentes doivent inventer leurs mots. Face à l'anglais <i>email</i>, le français a proposé <i>courriel</i> ; face à <i>computer</i>, <i>ordinateur</i> — un mot magnifique, dérivé du latin <i>ordinare</i>, « mettre en ordre », choisi dès 1955 pour désigner une machine qui organise l'information plutôt qu'elle ne se contente de calculer.</p>" },
  { chap:'XII — Les mots du numérique', html:"<p>Cette bataille des mots n'est jamais terminée : chaque nouvelle invention oblige la langue à choisir, encore et toujours, entre emprunter tel quel un mot étranger ou en forger un nouveau. C'est la preuve vivante qu'une langue ne meurt jamais tant qu'elle continue d'inventer.</p>" },
  { chap:'XIII — Les faux-amis', html:"<p>Français et anglais, cousins par le latin qu'ils partagent, se jouent parfois des tours : un <b>faux-ami</b> est un mot qui se ressemble dans les deux langues sans avoir le même sens. <i>Actually</i> ne veut pas dire « actuellement » mais « en fait » ; une <i>library</i> anglaise n'est pas une <i>librairie</i> française, mais une bibliothèque.</p>" },
  { chap:'XIV — Clôture', illus:I_KEY, cap:'Premier pouvoir reconquis.', html:"<p>Te voici au bout du premier livre. Ta langue est l'héritage de Gaulois et de Romains, de Grecs savants et de Francs guerriers, de rois et de poètes, d'Arabes savants et de marchands italiens, et désormais de millions de locuteurs à travers le monde — un trésor que mille générations t'ont transmis. {villain} voudrait te faire croire que les mots ne servent qu'à obéir. Mais tu sais, désormais, qu'ils portent toute l'histoire des hommes.</p>" },
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
  { chap:'VI — Les mots jumeaux', html:"<p>Certains mots latins ont donné <b>deux</b> descendants français : un <b>savant</b>, emprunté tardivement par les clercs, et un <b>populaire</b>, usé par des siècles de bouche à oreille. On les appelle des <b>doublets</b>. Ainsi <i>hôpital</i> (populaire, avec son <i>s</i> disparu) et <i>hospitalier</i> (savant, qui l'a gardé) viennent tous deux d'<i>hospitalis</i>.</p>" },
  { chap:'VI — Les mots jumeaux', html:"<p>D'autres paires : <i>frêle</i> et <i>fragile</i>, tous deux de <i>fragilis</i> ; <i>raide</i> et <i>rigide</i>, de <i>rigidus</i> ; <i>chose</i> et <i>cause</i>, de <i>causa</i> ; <i>écouter</i> et <i>ausculter</i>, de <i>auscultare</i>. Le mot populaire s'est arrondi à l'usage, comme un galet de rivière ; le mot savant, importé plus tard tel quel, a gardé ses arêtes.</p>" },
  { chap:'VII — Mots qui ont changé de sens', html:"<p>Une langue vivante ne cesse de glisser de sens. Le mot <b>gêne</b> vient de <i>géhenne</i>, l'enfer biblique : au Moyen Âge, « être en gêne » signifiait souffrir le martyre. Aujourd'hui, on l'emploie pour une simple chaussure trop étroite — la langue a adouci le mot à mesure que la vie s'adoucissait.</p>" },
  { chap:'VII — Mots qui ont changé de sens', html:"<p><i>Sympathique</i> signifiait autrefois « qui souffre avec » (du grec <i>syn-</i>, avec, et <i>pathos</i>, la souffrance) ; on l'utilisait pour deux organes du corps réagissant de concert. <i>Formidable</i> voulait dire « qui inspire une terreur immense » avant de devenir un compliment enjoué. Un mot n'est jamais figé : il continue de vivre, longtemps après que tu as refermé ce livre.</p>" },
  { chap:'VIII — Mots-valises & néologismes', html:"<p>La langue ne se contente pas d'hériter : elle <b>invente</b>. Le <b>mot-valise</b> fusionne deux mots en un seul, comme deux syllabes qui se donneraient la main : <i>franglais</i> (français + anglais), <i>clavardage</i> (clavier + bavardage, employé au Québec pour « chat »), <i>courriel</i> (courrier + électronique).</p>" },
  { chap:'VIII — Mots-valises & néologismes', html:"<p>Chaque année, des centaines de <b>néologismes</b> — mots tout neufs — apparaissent pour nommer ce qui n'existait pas hier : un objet, une pratique, une émotion inédite. Une langue vivante en fabrique sans cesse ; une langue que l'on musèle, comme celle de Monotonia, cesse d'en produire — et c'est peut-être le signe le plus sûr qu'elle se meurt.</p>" },
  { chap:'IX — Les mots de nos régions', html:"<p>Le français n'est pas partout identique. Dans le Sud-Ouest, on dit <i>chocolatine</i> là où Paris dit <i>pain au chocolat</i>. En Alsace, un <i>schlouk</i> désigne une petite gorgée ; dans le Nord, on <i>s'affole</i> pour dire qu'on s'inquiète pour rien. Ce ne sont pas des « fautes » : ce sont des couleurs locales, aussi légitimes que la langue de la capitale.</p>" },
  { chap:'IX — Les mots de nos régions', html:"<p>Une langue riche accueille ses régionalismes comme des dialectes d'une même famille, plutôt que de les effacer au nom d'une norme unique. C'est encore une autre façon, pour un pays, de refuser qu'un seul mot remplace tous les autres.</p>" },
  { chap:'X — Les mots que l\'on évite', html:"<p>Certains sujets nous mettent mal à l'aise, et la langue invente alors des détours : ce sont les <b>euphémismes</b>. On ne dit pas toujours « il est mort », mais « il nous a quittés », « il s'est éteint ». On préfère parfois « un salarié en recherche d'emploi » à un mot plus rude. L'euphémisme adoucit — mais il peut aussi, mal employé, servir à cacher une réalité qu'on préfère ne pas nommer.</p>" },
  { chap:'X — Les mots que l\'on évite', html:"<p>À l'inverse, quand on nomme les choses <b>trop</b> crûment, sans nuance ni ménagement, on parle de <b>mots crus</b>. Entre les deux se trouve le juste mot : ni un déguisement qui cache la vérité, ni une brutalité qui blesse sans nécessité. Choisir entre euphémisme et franc-parler, c'est encore une affaire de nuance — la plus délicate de toutes.</p>" },
  { chap:'XI — Les expressions imagées', html:"<p>Le français regorge d'<b>expressions</b> qui peignent une idée en une image : « avoir le cafard » (être triste, comme si un insecte rongeait le moral), « poser un lapin » (ne pas venir à un rendez-vous), « avoir un chat dans la gorge » (être enroué). Aucune de ces images ne se comprend au premier degré — et c'est justement ce qui les rend savoureuses.</p>" },
  { chap:'XI — Les expressions imagées', html:"<p>Ces tournures, transmises de génération en génération, sont un patrimoine aussi précieux que les mots eux-mêmes : elles portent l'humour, l'observation et parfois l'histoire d'un peuple tout entier, condensés en quelques syllabes bien senties.</p>" },
  { chap:'XII — Les antonymes, mots contraires', html:"<p>Face aux synonymes se dressent les <b>antonymes</b> : des mots de sens opposé. <i>Grand</i> et <i>petit</i>, <i>jour</i> et <i>nuit</i>, <i>aimer</i> et <i>détester</i>. Curieusement, certains préfixes suffisent à créer un contraire : <i>heureux</i> devient <i>malheureux</i>, <i>possible</i> devient <i>impossible</i> — la langue fabrique l'envers d'un mot sans même changer son cœur.</p>" },
  { chap:'XIII — Clôture', illus:PRISME, cap:'Deuxième pouvoir reconquis.', html:"<p>Te voici au bout du deuxième tome. Tu sais désormais qu'un mot n'est jamais seul : il a une famille, des cousins plus précis et des contraires bien nets, un registre, un double sens, mille façons de briller, le pouvoir de s'en inventer de nouveaux, des couleurs régionales, de sages détours, et des images toutes faites pleines de saveur. {villain} voudrait n'en garder qu'un par idée. Mais celui qui possède la <b>Nuance</b> possède le doute, la précision, et le droit de n'être pas tout à fait d'accord.</p>" },
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
  { chap:'VI — Le bestiaire des sophismes', html:"<p>Certains raisonnements <b>sonnent</b> juste sans <b>être</b> justes : ce sont des <b>sophismes</b>. La <b>pente glissante</b> prétend qu'une petite concession mènera forcément à la catastrophe (« si on autorise ceci, bientôt tout sera permis »). L'<b>attaque personnelle</b> (<i>ad hominem</i>) discrédite l'homme plutôt que son idée : « il a tort parce qu'il est jeune », au lieu de discuter l'argument lui-même.</p>" },
  { chap:'VI — Le bestiaire des sophismes', html:"<p>La <b>fausse cause</b> confond succession et conséquence (« le coq chante, donc le soleil se lève »). L'<b>appel à la popularité</b> prétend qu'une idée est vraie parce que « tout le monde le dit ». Aucun de ces tours n'apporte de preuve — mais tous savent, hélas, se faire passer pour des arguments.</p>" },
  { chap:'VII — La rhétorique aujourd\'hui', html:"<p>La rhétorique n'a pas disparu avec les toges romaines : elle vit dans chaque publicité, chaque discours, chaque slogan collé sur un mur. Une affiche qui répète un seul mot en lettres géantes — sans jamais l'expliquer ni le justifier — ne convainc de rien : elle <b>matraque</b>, en espérant que la répétition tienne lieu de preuve.</p>" },
  { chap:'VII — La rhétorique aujourd\'hui', html:"<p>Le bon citoyen d'aujourd'hui a besoin des mêmes outils qu'un citoyen d'Athènes : reconnaître un vrai argument, exiger des preuves, et se méfier des formules qui flattent plus qu'elles ne démontrent. C'est un muscle qui s'entretient, livre après livre, discours après discours.</p>" },
  { chap:'VIII — Le débat démocratique', html:"<p>Dans une démocratie, le débat n'est pas un luxe : c'est le <b>cœur du système</b>. Avant qu'une loi ne s'applique à tous, elle doit être discutée, contestée, amendée — en public, devant des assemblées où chacun peut prendre la parole à son tour, et où la décision finale se prend en écoutant tous les arguments, pas seulement le plus fort.</p>" },
  { chap:'VIII — Le débat démocratique', html:"<p>C'est pour cela qu'un pouvoir qui veut se maintenir sans contestation commence presque toujours par la même chose : réduire ce qu'on a le droit de dire, ou de qui on a le droit d'écouter. Un peuple qui sait argumenter est un peuple qu'on ne fait pas taire facilement — voilà pourquoi cet art se transmet, discours après discours, génération après génération.</p>" },
  { chap:'IX — La boîte à outils de l\'orateur', html:"<p>Au-delà des grands principes, l'éloquence se fabrique avec des outils précis. La <b>question rhétorique</b> ne cherche pas de réponse : elle force l'auditoire à réfléchir tout seul (« Qui, ici, accepterait cela pour son propre enfant ? »). La <b>répétition</b> martèle une idée jusqu'à ce qu'elle devienne évidente ; la <b>gradation</b> monte crescendo, mot après mot, vers un sommet.</p>" },
  { chap:'IX — La boîte à outils de l\'orateur', html:"<p>Ces outils sont neutres en eux-mêmes : ce qui compte, c'est ce qu'on met derrière. Un tyran peut répéter un mensonge jusqu'à ce qu'il paraisse vrai ; un juste peut répéter une vérité jusqu'à ce qu'elle devienne un cri collectif. La technique est la même ; seul le fond décide si l'on manipule ou si l'on convainc.</p>" },
  { chap:'X — Convaincre par l\'écrit', html:"<p>On ne persuade pas qu'à voix haute. La <b>lettre ouverte</b> et le <b>pamphlet</b> — un texte court et mordant, écrit pour dénoncer — ont, au fil des siècles, changé le cours de débats entiers. Une plume bien taillée peut parfois ébranler un pouvoir plus sûrement qu'une armée entière, simplement parce qu'elle circule, se recopie, se lit à voix haute dans les foyers.</p>" },
  { chap:'X — Convaincre par l\'écrit', html:"<p>L'écrit a un avantage sur la parole : il reste. On peut le relire, le vérifier, le citer des années après qu'il a été écrit — ce qui l'oblige, plus encore que le discours oral, à une rigueur sans faille. Un mensonge parlé s'oublie ; un mensonge écrit peut vous rattraper toute une vie.</p>" },
  { chap:'XI — L\'humour, arme de persuasion', html:"<p>Faire rire n'est pas si loin de convaincre : un <b>trait d'esprit</b> bien placé peut désarmer un adversaire plus sûrement qu'un long discours. Ridiculiser une idée absurde, sans jamais mentir sur elle, oblige l'auditoire à voir enfin ce qu'elle avait de grotesque — et un tyran survit rarement à un peuple qui se met à rire de lui.</p>" },
  { chap:'XI — L\'humour, arme de persuasion', html:"<p>Attention cependant : l'humour cesse d'être un outil loyal dès qu'il se moque de la personne plutôt que de son idée, ou qu'il déforme les propos de l'adversaire pour le tourner en ridicule facilement. Le rire honnête éclaire ; le rire malhonnête, lui, n'est qu'une insulte déguisée en plaisanterie.</p>" },
  { chap:'XII — Convaincre par l\'histoire', html:"<p>Certains préfèrent convaincre sans jamais argumenter directement : ils racontent une <b>histoire</b>, et laissent la morale s'en dégager d'elle-même. C'est tout l'art de la <b>fable</b>, où des animaux se disputent, se trompent ou se dévorent pour mieux, sans jamais le dire de front, éclairer un travers bien humain.</p>" },
  { chap:'XII — Convaincre par l\'histoire', html:"<p>Ce détour par le récit a un immense avantage : il désarme la méfiance. On accepte souvent d'une histoire ce qu'on aurait refusé d'un sermon direct. C'est une leçon que ce livre lui-même a essayé de suivre depuis sa première page.</p>" },
  { chap:'XIII — Ce que le corps dit aussi', html:"<p>Un discours ne se joue pas qu'avec des mots : le regard, la posture, le silence bien placé, parlent presque autant que la voix. Un orateur qui baisse les yeux en affirmant une chose fait naître le doute, même si ses mots, eux, sonnaient parfaitement juste.</p>" },
  { chap:'XIV — Clôture', illus:FLAME, cap:'Troisième pouvoir reconquis.', html:"<p>Te voici au bout du troisième tome. Tu sais défendre une thèse, équilibrer l'ethos, le pathos et le logos, débattre loyalement, démasquer les sophismes et la manipulation, manier les outils de la persuasion, à l'oral comme à l'écrit, faire rire honnêtement, convaincre par le récit, et lire ce que le corps ne dit pas en mots. L'<b>Éloquence</b> est tienne. Mais souviens-toi du serment des vrais orateurs : cette flamme éclaire, elle ne brûle pas. Mets-la au service de la vérité — jamais du tyran.</p>" },
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
  { chap:'V — La cohérence du texte', illus:SCROLL, cap:'Clément Marot et sa règle de 1538.', html:"<p><b>Le saviez-vous ?</b> La fameuse règle de l'accord du participe passé — « les pommes que j'ai <i>mangées</i> » — est traditionnellement associée au poète <b>Clément Marot</b>, qui l'aurait proposée dès <b>1538</b> en s'inspirant de l'usage italien, et l'enferma dans un petit poème pour qu'on la retienne : « <i>Le terme qui va devant / Volontiers régit le suivant.</i> » Les linguistes nuancent aujourd'hui ce récit : la règle s'est en réalité fixée peu à peu, au fil de plusieurs siècles et de plusieurs grammairiens — Marot n'en est que le visage le plus célèbre. Une règle vieille de près de cinq siècles, qui fait encore trébucher les meilleurs !</p>" },
  { chap:'VI — La ponctuation', html:"<p>Sans <b>ponctuation</b>, une phrase perd son souffle et parfois son sens. « Le Chancelier, dit le peuple, est un menteur » n'accuse pas la même personne que « Le Chancelier dit : le peuple est un menteur ». Deux virgules déplacées, et l'accusation change de camp entièrement.</p>" },
  { chap:'VI — La ponctuation', html:"<p>Chaque signe a son rôle : le <b>point</b> referme une idée ; la <b>virgule</b> respire sans conclure ; le <b>point-virgule</b> relie deux idées assez proches pour rester dans la même phrase, assez distinctes pour mériter une pause ; les <b>deux-points</b> annoncent une explication ou une liste. Bien ponctuer, c'est diriger la respiration du lecteur.</p>" },
  { chap:'VII — Les réformes de l\'orthographe', html:"<p>Le français n'a pas toujours écrit comme aujourd'hui, et il continue de changer. En <b>1990</b>, l'Académie française proposa des <b>rectifications orthographiques</b> : <i>oignon</i> pouvant s'écrire <i>ognon</i>, <i>nénuphar</i> devenant <i>nénufar</i>, certains accents circonflexes disparaissant sur le <i>i</i> et le <i>u</i> (<i>maîtresse</i> → <i>maitresse</i>).</p>" },
  { chap:'VII — Les réformes de l\'orthographe', html:"<p>Ces rectifications restent <b>facultatives</b> : les deux orthographes sont admises, et les manuels scolaires n'ont pas basculé du jour au lendemain. Voilà la preuve la plus concrète que la langue n'appartient à aucun chancelier : elle se réforme lentement, par le débat public — jamais par décret d'un seul homme.</p>" },
  { chap:'VIII — L\'argot & le verlan', html:"<p>À côté de la langue « officielle » vit une langue de l'ombre et de l'invention : l'<b>argot</b>, né dans les ateliers, les prisons, les cours d'école — un langage codé pour parler entre soi. Le <b>verlan</b> en est un jeu : on inverse les syllabes d'un mot, si bien que <i>l'envers</i> devient <i>verlan</i>, et <i>femme</i> devient <i>meuf</i>.</p>" },
  { chap:'VIII — L\'argot & le verlan', html:"<p>Ce français-là n'est pas une langue « fautive » : c'est un français <b>vivant</b>, qui grandit dans la rue avant, parfois, d'entrer dans les dictionnaires. La langue officielle et la langue de la rue s'enrichissent l'une l'autre depuis toujours — Monotonia, en interdisant toute variation, a coupé la langue de sa source la plus fraîche.</p>" },
  { chap:'IX — Les grands dictionnaires', html:"<p>Consigner tous ces mots est un travail de géant. Au XIXe siècle, <b>Émile Littré</b> passa plus de trente ans à rédiger son dictionnaire, page après page, citant des milliers d'auteurs pour prouver l'usage de chaque mot. Peu après, <b>Pierre Larousse</b> lança son <i>Grand Dictionnaire universel</i>, dont la devise — « Je sème à tout vent » — illustre encore aujourd'hui la couverture du Petit Larousse.</p>" },
  { chap:'X — L\'écriture qui se répand', html:"<p>Avant que les mots ne se figent en dictionnaires, il fallut d'abord pouvoir les <b>reproduire</b>. Au milieu du XVe siècle, l'Allemand <b>Johannes Gutenberg</b> mit au point des caractères mobiles en métal, réutilisables page après page : l'<b>imprimerie</b> était née. Un livre qui demandait auparavant des mois de copie à la main pouvait désormais se multiplier en quelques semaines.</p>" },
  { chap:'X — L\'écriture qui se répand', html:"<p>Cette invention bouleversa tout : les idées circulèrent plus vite que jamais, l'orthographe commença à se fixer d'une ville à l'autre, et la lecture cessa d'être réservée aux moines et aux puissants. Chaque phrase que tu lis aujourd'hui, imprimée ou affichée sur un écran, descend directement de cette petite révolution de métal et d'encre.</p>" },
  { chap:'XI — Le souffle de la phrase', html:"<p>Une même règle de grammaire peut donner des styles totalement différents. Certains auteurs construisent des phrases <b>amples</b>, qui s'enroulent sur plusieurs lignes avant de conclure, portées par une multitude de subordonnées enchâssées les unes dans les autres — un souffle long, presque une respiration retenue.</p>" },
  { chap:'XI — Le souffle de la phrase', html:"<p>D'autres, au contraire, préfèrent des phrases <b>brèves</b>, sujet-verbe-complément, qui frappent comme des coups secs. Aucun des deux styles n'est plus « correct » que l'autre : la grammaire fixe les règles du jeu, mais c'est l'écrivain qui choisit le rythme de sa musique — lent fleuve ou tambour vif.</p>" },
  { chap:'XII — Le pronom, ce mot qui remplace', html:"<p>Sans le <b>pronom</b>, chaque phrase répéterait sans fin le même nom : « Le Chancelier a parlé. Le Chancelier a menti. Le Chancelier a fui. » Le pronom — <i>il, elle, cela, celui-ci</i> — reprend un mot déjà cité pour éviter la lourde répétition, tissant ainsi un fil invisible entre les phrases d'un texte.</p>" },
  { chap:'XII — Le pronom, ce mot qui remplace', html:"<p>Un pronom mal placé, dont on ne sait plus à qui il renvoie, peut faire perdre le fil d'un texte entier — un peu comme un fil de marionnette emmêlé fait trébucher toute la scène. Bien manié, au contraire, il rend un texte fluide, presque invisible dans sa mécanique, tout entier tourné vers le sens qu'il porte.</p>" },
  { chap:'XIII — Les exceptions qui résistent', html:"<p>Toute règle a ses rebelles. Le pluriel de <i>cheval</i> n'est pas <i>chevals</i> mais <i>chevaux</i> ; celui de <i>bail</i> devient <i>baux</i>. Le verbe <i>aller</i>, l'un des plus employés de la langue, change presque entièrement de forme selon les temps (<i>je vais, j'irai, j'allais</i>) — comme s'il refusait obstinément de se ranger dans le rang.</p>" },
  { chap:'XIII — Les exceptions qui résistent', html:"<p>Ces irrégularités ne sont pas des défauts à corriger : elles sont la trace vivante de l'histoire de la langue, chaque exception racontant, à sa façon, un usage ancien qui a résisté à l'uniformisation. Une langue parfaitement régulière serait sans doute plus facile — mais elle aurait perdu, en chemin, toute sa mémoire.</p>" },
  { chap:'XIV — L\'art de préciser sans alourdir', html:"<p>Deux virgules suffisent parfois à glisser une précision sans casser le fil d'une phrase : c'est l'<b>apposition</b>. « Ulrich Morne, ancien enfant moqué, régnait sur un pays sans mots » ajoute une information entière sans avoir besoin d'une phrase séparée. Économe et efficace, cette figure prouve qu'une bonne mécanique de phrase sert d'abord la clarté du sens.</p>" },
  { chap:'XV — Clôture', illus:GEAR, cap:'Quatrième pouvoir reconquis.', html:"<p>Te voici au bout du quatrième tome. Tu sais bâtir une phrase d'aplomb, choisir le mode et le temps justes, accorder les temps, emboîter les subordonnées, ponctuer, lier les idées, les reprendre par le bon pronom, accepter les belles exceptions, et préciser sans alourdir — et tu sais désormais que la langue vit aussi dans la rue, se recense dans de grands livres patients, voyage depuis l'imprimerie, et peut chanter sur mille rythmes différents. La <b>Précision</b> est tienne. Souviens-toi : une phrase juste est une arme que nul ne peut retourner contre toi — et c'est précisément ce que {villain} ne sait pas tordre.</p>" },
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
  { chap:'VI — L\'autobiographie & les mémoires', html:"<p>Certains écrivains tournent leur plume vers eux-mêmes : c'est l'<b>autobiographie</b>, le récit d'une vie par celui qui l'a vécue. <b>Jean-Jacques Rousseau</b> ouvrit ses <i>Confessions</i> par une promesse audacieuse : dire toute la vérité sur lui-même, sans rien cacher, bon ou mauvais — un projet qu'aucun auteur n'avait osé formuler ainsi avant lui.</p>" },
  { chap:'VI — L\'autobiographie & les mémoires', html:"<p>Le <b>journal intime</b> est le cousin discret de l'autobiographie : on y écrit jour après jour, sans savoir comment l'histoire finira, sans même être sûr qu'on sera un jour lu. C'est peut-être la forme la plus sincère de toutes — car elle n'a pas eu le temps de se retourner sur elle-même pour se composer un beau rôle.</p>" },
  { chap:'VII — Les genres modernes', html:"<p>La littérature n'a pas cessé d'inventer de nouveaux territoires. Au XIXe siècle, <b>Jules Verne</b> imagina des voyages au centre de la Terre et autour de la Lune bien avant les premières fusées : c'est la naissance de la <b>science-fiction</b> française, qui explore ce que la science pourrait un jour rendre possible.</p>" },
  { chap:'VII — Les genres modernes', html:"<p>Le <b>fantastique</b>, lui, glisse un doute dans le réel : et si, sous la surface ordinaire du monde, se cachait quelque chose d'inexplicable ? La <b>littérature jeunesse</b>, longtemps jugée mineure, est aujourd'hui reconnue comme un art à part entière, capable d'affronter les plus grandes questions avec des mots simples. Les genres ne cessent de naître — le prochain sera peut-être inventé par un lecteur comme toi.</p>" },
  { chap:'VIII — La littérature qui voyage', html:"<p>Une œuvre écrite en une langue peut franchir toutes les frontières grâce à la <b>traduction</b> : un traducteur ne remplace pas seulement des mots, il recrée le rythme, l'humour, l'émotion d'un texte dans une langue neuve — un art si délicat qu'on l'a comparé à jouer une même musique sur un instrument différent.</p>" },
  { chap:'VIII — La littérature qui voyage', html:"<p>C'est ainsi que le français a lui-même accueilli des œuvres venues d'ailleurs, tandis que ses propres écrivains se sont fait lire dans le monde entier. Aucune littérature ne grandit seule : elle s'enrichit de tout ce qu'elle traduit, emprunte et fait sien.</p>" },
  { chap:'IX — La chanson, poésie du quotidien', html:"<p>La <b>chanson</b> est peut-être la forme la plus partagée de toute la littérature : elle se fredonne dans la rue, à l'école, en famille, sans qu'on ait toujours conscience d'y entendre des rimes, des images, un rythme travaillé comme un poème. Des générations d'auteurs-compositeurs ont soigné leurs textes avec autant d'exigence qu'un poète devant sa page.</p>" },
  { chap:'X — Le neuvième art', html:"<p>Longtemps considérée comme un simple divertissement pour enfants, la <b>bande dessinée</b> est aujourd'hui reconnue comme un art à part entière, qu'on surnomme le <b>neuvième art</b>. Elle raconte par l'image ET par le texte à la fois — un art double, où le dessin peut dire ce que les mots taisent, et les mots préciser ce que l'image suggère.</p>" },
  { chap:'X — Le neuvième art', html:"<p>La France et la Belgique en sont devenues une terre d'élection, avec des séries traduites dans le monde entier. Un simple <b>phylactère</b> — la bulle qui contient les paroles d'un personnage — peut concentrer, en une poignée de mots, tout l'art de la répartie que ce livre t'a enseigné depuis le début.</p>" },
  { chap:'XI — Ceux qui veillent sur les mots', html:"<p>Certaines institutions veillent depuis des siècles sur la langue et ses œuvres. L'<b>Académie française</b>, fondée en 1635, rédige patiemment son dictionnaire de référence. Ses quarante membres portent un surnom amusant : les <b>Immortels</b> — non qu'ils vivent éternellement, mais parce que leur devise fondatrice promettait « à l'immortalité » pour la langue qu'ils protègent. Chaque automne, le prix <b>Goncourt</b> récompense le meilleur roman de l'année — un prix si convoité que son montant symbolique, quelques euros à peine, n'a jamais découragé personne : c'est l'honneur qui compte, pas la somme.</p>" },
  { chap:'XI — Ceux qui veillent sur les mots', html:"<p>Ces gardiens ne figent pas la langue : ils l'observent, la célèbrent, en débattent — sans jamais prétendre la posséder. Aucun d'eux n'a le pouvoir d'imposer un seul mot par idée : la langue française, depuis toujours, appartient à tous ceux qui la parlent, l'écrivent et la font vivre.</p>" },
  { chap:'XII — Le conte philosophique', html:"<p>Certains récits mêlent le merveilleux du conte à la gravité de la réflexion : ce sont les <b>contes philosophiques</b>. Sous une histoire simple, parfois drôle, parfois absurde, se cache une question profonde sur le monde, la justice ou le bonheur. <b>Voltaire</b> excella dans cet art, faisant voyager ses héros naïfs à travers mille aventures pour mieux, chemin faisant, se moquer des injustices de son époque.</p>" },
  { chap:'XII — Le conte philosophique', html:"<p>Ce genre prouve, mieux qu'aucun autre, que rire et réfléchir ne s'excluent jamais : on peut sourire d'une aventure rocambolesque tout en repensant, une fois le livre refermé, à des questions bien réelles. C'est exactement ce que tu viens de vivre, en traversant ce livre-monde plein d'épreuves — et de sourires.</p>" },
  { chap:'XIII — Le pouvoir de la première phrase', html:"<p>Un livre se joue parfois dès sa première ligne : l'<b>incipit</b>. Une phrase d'ouverture réussie doit, en quelques mots, donner un ton, planter un décor, ou piquer une curiosité qu'on ne pourra plus refermer. Les plus grands romans s'ouvrent souvent par une phrase que l'on cite encore, des décennies après, sans même avoir lu le livre entier.</p>" },
  { chap:'XIII — Le pouvoir de la première phrase', html:"<p>La dernière phrase compte tout autant : c'est elle qui reste, une fois le livre refermé, comme un dernier écho dans la mémoire du lecteur. Entre ces deux bornes, tout un monde peut tenir — comme celui que tu viens de traverser, tome après tome.</p>" },
  { chap:'XIV — Clôture', illus:MASK, cap:'Cinquième pouvoir reconquis.', html:"<p>Te voici au bout du cinquième et dernier livre-monde. Tu connais le conte et son merveilleux, la poésie et son chant, le théâtre et ses masques, le roman et son regard, l'écrit qui combat, les genres toujours en invention, les œuvres qui voyagent, celles qu'on fredonne, celles qui se dessinent, ceux qui les célèbrent, celles qui font rire en faisant réfléchir, et l'art d'ouvrir et de refermer un livre. L'<b>Imaginaire</b> est tien. Cinq pouvoirs reconquis ! Il ne te reste qu'à rentrer à Monotonia — car ces mots, désormais, tu vas devoir les rendre à tout un peuple. Le <b>Réveil</b> approche.</p>" },
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
 let ps=book.pages||[];
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
 function _escHandler(e){ if(e.key==='Escape') close(); }
 function close(){ if(ov._releaseTrap){ov._releaseTrap();delete ov._releaseTrap;} document.removeEventListener('keydown',_escHandler); ov.classList.add('story-out'); setTimeout(function(){try{ov.remove();}catch(e){}},300); }
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
    +'<span style="font-family:Georgia,serif;font-weight:700;color:'+acc+';font-size:1em;">'+book.title+'</span>'
    +'<span style="font-family:Georgia,serif;font-size:.72em;color:#8a6a45;">'+chap+'</span></div>'
    +'<div style="position:relative;display:grid;grid-template-columns:1fr 1fr;gap:0;background:#EBDFBF;border-radius:5px;overflow:hidden;">'
    +'<div style="background:linear-gradient(90deg,#F3E8CD,#ECE0C2 86%,#DCCBA0);padding:13px 13px 13px 15px;">'+half(L,true)+'</div>'
    +'<div style="background:linear-gradient(90deg,#DCCBA0,#ECE0C2 14%,#F3E8CD);padding:13px 15px 13px 13px;">'+half(R,false)+'</div>'
    +'<div style="position:absolute;top:0;bottom:0;left:50%;width:18px;transform:translateX(-50%);background:linear-gradient(90deg,rgba(0,0,0,0),rgba(90,60,30,.20) 50%,rgba(0,0,0,0));pointer-events:none;"></div>'
    +'</div>';
  }
  const prevLbl=step===total-1?'‹ Pages':'‹ Précédent';
  const nextLbl=step===0?'Feuilleter ›':(step===total-1?'Fermer le livre':'Suivant ›');
  let counter; if(step===0) counter='Couverture'; else if(step===total-1) counter='Dos de couverture'; else { const a=(step-1)*2+1, b=Math.min(a+1,pages.length); counter=(a===b?('page '+a):('pages '+a+'–'+b))+' / '+pages.length; }
  ov.innerHTML='<div class="story-parchment" style="max-width:'+((step===0||step===total-1)?'360':'600')+'px;border-top:6px solid '+acc+';position:relative;">'
   +'<button class="story-btn cb-close" title="Fermer" style="position:absolute;top:8px;right:8px;width:30px;height:30px;padding:0;line-height:1;border-radius:50%;font-size:16px;z-index:2;"><svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'
   +inner
   +'<div class="story-nav">'
   +(step>0?'<button class="story-btn cb-prev">'+prevLbl+'</button>':'<span class="story-spacer"></span>')
   +'<div class="story-dots" style="flex-wrap:wrap;max-width:58%;">'+Array.apply(null,{length:total}).map(function(_,i){return '<span class="story-dot'+(i===step?' on':'')+'"></span>';}).join('')+'</div>'
   +'<button class="story-btn cb-next">'+nextLbl+'</button>'
   +'</div>'
   +'<div style="text-align:center;font-family:Georgia,serif;font-size:.72em;color:#8a6a45;margin-top:4px;">'+counter+'</div>'
   +'</div>';
  const nx=ov.querySelector('.cb-next'); if(nx) nx.onclick=function(){ if(step<total-1){step++;render();} else close(); };
  const pv=ov.querySelector('.cb-prev'); if(pv) pv.onclick=function(){ if(step>0){step--;render();} };
  const cl=ov.querySelector('.cb-close'); if(cl) cl.onclick=close;
  if(typeof beep==='function'){ try{ beep(520,'sine',.09,.04); }catch(e){} }
  if(typeof focusFirstIn==='function') focusFirstIn(ov);
 }
 render(); document.body.appendChild(ov);
 if(typeof trapFocus==='function') ov._releaseTrap=trapFocus(ov);
 document.addEventListener('keydown',_escHandler);
}

// ── Carnet collège FR : La Bibliothèque infinie (7 tranches 3D) ─────────
function _advLibraryHtml(){
 const books=(typeof _COL_BOOKS_FR!=='undefined')?_COL_BOOKS_FR:[];
 const reg=['cp','ce1','ce2','cm1','cm2'];
 const unlocked=function(i){ return _regionConquered(reg[i]); };
 const N=books.length||5;
 const nUn=books.reduce(function(a,b,i){return a+(unlocked(i)?1:0);},0);
 const bw=22, gap=2.2, totalW=N*bw+(N-1)*gap, x0=(200-totalW)/2;
 let spines='';
 for(let i=0;i<N;i++){
  const b=books[i]||{}; const on=unlocked(i); const x=x0+i*(bw+gap), cx=x+bw/2;
  const col=on?(b.accent||'#9E4326'):'#615d57';
  const dk=on?(b.dark||'#3a1c10'):'#46433e';
  const gold=on?(b.gold||'#E0B24F'):'#8a857d';
  const gly=on?(b.gold?'#dcdce4':'#f0d68a'):'#8a857d';
  const click=on?(' onclick="_openColBook('+i+')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();_openColBook('+i+');}" style="cursor:pointer" role="button" tabindex="0" title="Lire : '+(b.title||'')+'"'):'';
  spines+='<g'+click+'>'
   +'<polygon points="'+x.toFixed(1)+',24 '+(x+3).toFixed(1)+',21 '+(x+bw+3).toFixed(1)+',21 '+(x+bw).toFixed(1)+',24" fill="'+dk+'"/>'
   +'<polygon points="'+(x+bw).toFixed(1)+',24 '+(x+bw+3).toFixed(1)+',21 '+(x+bw+3).toFixed(1)+',127 '+(x+bw).toFixed(1)+',130" fill="'+dk+'"/>'
   +'<rect x="'+x.toFixed(1)+'" y="24" width="'+bw+'" height="106" rx="2" fill="'+col+'"/>'
   +'<rect x="'+(x+1.5).toFixed(1)+'" y="26" width="2" height="102" fill="#ffffff" opacity="0.10"/>'
   +'<rect x="'+(x+2).toFixed(1)+'" y="33" width="'+(bw-4)+'" height="2" fill="'+gold+'"/><rect x="'+(x+2).toFixed(1)+'" y="119" width="'+(bw-4)+'" height="2" fill="'+gold+'"/>'
   +'<text x="'+cx.toFixed(1)+'" y="52" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="7" fill="'+gly+'" transform="rotate(-90 '+cx.toFixed(1)+' 52)">'+(b.short||b.roman||(i+1))+'</text>'
   +(on?_colSymbol(i,cx,80,0.5,gly):_colLock(cx,77,'#cfcabf'))
   +'<circle cx="'+cx.toFixed(1)+'" cy="108" r="8" fill="'+dk+'"/><circle cx="'+cx.toFixed(1)+'" cy="108" r="8" fill="none" stroke="'+gold+'" stroke-width="1.4"'+(on?'><animate attributeName="stroke-opacity" values="1;0.45;1" dur="1.8s" repeatCount="indefinite"/></circle>':'/>')
   +'<text x="'+cx.toFixed(1)+'" y="108" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="'+(b.roman?8:9)+'" font-weight="700" fill="'+gly+'">'+(b.roman||'✦')+'</text>'
   +'</g>';
 }
 const shelf='<rect x="6" y="130" width="188" height="9" rx="2" fill="#5a4126"/><rect x="6" y="130" width="188" height="3" fill="#7a5a34"/><rect x="6" y="20" width="188" height="4" rx="2" fill="#3c2c18"/>';
 const msg=nUn>0?'👉 Touche un tome pour l\'ouvrir et le lire.':"Conquiers les îlots : chaque tome rejoindra ta bibliothèque.";
 return ''
  +'<div class="advlog-section-title">📚 La Bibliothèque infinie</div>'
  +'<div class="advcol-box advcol-mat">'
  +' <svg viewBox="0 0 200 150" class="advcol-svg" aria-label="Bibliothèque : '+nUn+' livres sur '+N+'">'
  +'  '+shelf+spines
  +' </svg>'
  +' <div class="advcol-caption">'+msg+' <b>'+nUn+' / '+N+'</b></div>'
  +'</div>';
}

// (Ancien Livre VII bonus « L'Antre du Chancelier » : contenu fusionné dans
//  les chapitres final/titan/épilogue de l'histoire principale — v11.7.0)


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
  { chap:'V bis — Néandertal, notre lointain cousin', html:"<p>Sapiens n\u2019a pas toujours été seul sur Terre. Pendant des dizaines de milliers d\u2019années, une autre espèce humaine, l\u2019<b>Homme de Néandertal</b>, a vécu en Europe et en Asie occidentale, avant de disparaître il y a environ 40 000 ans. Robuste et parfaitement adapté au froid des périodes glaciaires, il fabriquait des outils élaborés et enterrait déjà ses morts avec soin.</p><p>Les scientifiques ont longtemps cru Néandertal moins intelligent que Sapiens, mais les découvertes récentes racontent une autre histoire : il soignait ses blessés, décorait parfois des coquillages, et aurait même, selon certaines traces, orné les parois de grottes bien avant l\u2019arrivée de Sapiens en Europe.</p><p><b>Anecdote.</b> En analysant l\u2019ADN de fossiles anciens, les scientifiques ont découvert que Sapiens et Néandertal se sont parfois croisés et ont eu des enfants ensemble ! Résultat : la plupart des humains d\u2019aujourd\u2019hui, en dehors d\u2019Afrique, portent encore un petit pourcentage de gènes néandertaliens.</p>" },
  { chap:'VI — Les débuts de la parure', html:"<p>Colliers de coquillages, dents percées, perles d\u2019ivoire : dès cette époque très ancienne, les humains cherchaient déjà à se parer. Ces objets, retrouvés parfois à des centaines de kilomètres de la mer, montrent l\u2019existence d\u2019échanges entre groupes — et peut-être déjà, une forme de mode !</p>" },
  { chap:'VII — La révolution néolithique', html:"<p>Il y a environ 10 000 ans, au Proche-Orient, un bouleversement immense a changé le destin de l\u2019humanité : certains groupes ont cessé de suivre le gibier pour se mettre à cultiver le blé et l\u2019orge, et à élever chèvres, moutons puis bœufs. On appelle cela la <b>révolution néolithique</b> — la naissance de l\u2019agriculture et de l\u2019élevage.</p><p>Cette transformation a permis aux hommes de rester au même endroit toute l\u2019année : les premiers villages sont apparus, avec des maisons en pierre ou en terre séchée, puis les premiers greniers pour stocker les récoltes. Nourrir davantage de monde grâce à l\u2019agriculture a aussi permis à certains de ne plus chasser ni cultiver eux-mêmes, mais de devenir potiers, tisserands ou prêtres — les tout premiers métiers spécialisés de l\u2019histoire humaine.</p><p><b>Anecdote.</b> Le site de Çatalhöyük, en Turquie actuelle, est l\u2019un des plus anciens villages connus : vieux de 9 000 ans, il comptait plusieurs milliers d\u2019habitants vivant dans des maisons si serrées les unes contre les autres qu\u2019on y entrait... par le toit, à l\u2019aide d\u2019une échelle !</p>" },
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
  { chap:'V bis — L\u2019Égypte et le monde', html:"<p>L\u2019Égypte antique n\u2019a jamais vécu repliée sur elle-même : ses marchands commerçaient avec la lointaine terre de Pount, sans doute proche de l\u2019actuelle Corne de l\u2019Afrique, d\u2019où l\u2019on importait encens, ébène et animaux exotiques. Vers le nord, l\u2019Égypte échangeait avec les cités de Phénicie du bois de cèdre, précieux dans un pays presque dépourvu de grandes forêts.</p><p>Cette ouverture au monde permit aussi à l\u2019Égypte d\u2019accueillir des influences venues d\u2019ailleurs, tandis que sa propre culture — écriture, architecture, savoirs médicaux — rayonnait à son tour bien au-delà de ses frontières, jusqu\u2019en Grèce antique où de nombreux savants venaient étudier.</p>" },
  { chap:'VI — La vie sur le Nil', html:"<p>Le fleuve servait aussi de route principale : les Égyptiens y naviguaient en barques de roseaux ou de bois pour transporter marchandises, blocs de pierre et voyageurs. La pêche complétait l\u2019alimentation, avec le poisson du Nil comme ressource essentielle.</p>" },
  { chap:'VII — Les femmes pharaons', html:"<p>Contrairement à une idée répandue, l\u2019Égypte antique a aussi connu des femmes au pouvoir suprême. <b>Hatchepsout</b>, au XVe siècle avant J.-C., régna avec brio pendant plus de 20 ans, se faisant même représenter avec la fausse barbe rituelle des pharaons pour asseoir sa légitimité. Elle lança de grandes expéditions commerciales et fit construire un temple funéraire d\u2019une beauté exceptionnelle, encore visible aujourd\u2019hui à Deir el-Bahari.</p><p>Bien plus tard, <b>Cléopâtre VII</b>, la plus célèbre de toutes, fut la dernière souveraine d\u2019Égypte avant que le pays ne devienne une province romaine. Parlant, dit-on, jusqu\u2019à neuf langues, elle négocia habilement avec les puissants généraux romains de son temps pour tenter de préserver l\u2019indépendance de son royaume.</p><p><b>Anecdote.</b> Après la mort d\u2019Hatchepsout, son successeur fit marteler son nom sur de nombreux monuments pour tenter d\u2019effacer son règne de la mémoire officielle. Grâce au travail patient des archéologues, son histoire a pourtant fini par être retrouvée et racontée, des millénaires plus tard.</p>" },
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
  { chap:'IV — Les routes et les aqueducs', html:"<p>Les Romains sont restés célèbres pour leurs prouesses d\u2019ingénierie : plus de 80 000 kilomètres de routes pavées reliaient l\u2019ensemble de l\u2019empire, tandis que des aqueducs, parfois longs de plusieurs dizaines de kilomètres, acheminaient l\u2019eau potable jusqu\u2019aux villes et alimentaient thermes et fontaines.</p><p><b>Anecdote.</b> Contrairement à une idée reçue, la plupart des combats de gladiateurs ne se terminaient pas par la mort du perdant : les gladiateurs coûtaient cher à former, et un éditeur de jeux avait tout intérêt à garder ses champions vivants pour de futurs combats. Certains gladiateurs célèbres devenaient de vraies vedettes, dont on retrouve encore aujourd\u2019hui le nom griffonné sur des murs, en guise d\u2019autographe antique !</p>" },
  { chap:'V — La vie quotidienne', html:"<p>Les Romains riches vivaient dans des villas décorées de mosaïques et de fresques, avec l\u2019eau courante et parfois même un chauffage par le sol (l\u2019hypocauste). Le peuple, lui, logeait souvent dans des immeubles de plusieurs étages appelés insulae, parfois peu solides et sujets aux incendies.</p>" },
  { chap:'VI — Jules César et Auguste', html:"<p>Jules César, brillant général, a conquis la Gaule mais n\u2019a jamais été empereur : il fut assassiné en 44 avant J.-C. par des sénateurs craignant qu\u2019il ne prenne trop de pouvoir. C\u2019est son neveu adoptif, Auguste, qui devint en 27 avant J.-C. le tout premier empereur romain, inaugurant plusieurs siècles de « Pax Romana », une longue période de paix relative.</p>" },
  { chap:'VII — La chute de l\u2019Empire', html:"<p>Après des siècles de grandeur, l\u2019Empire romain d\u2019Occident s\u2019effondre en 476 après J.-C., lorsque le dernier empereur, un adolescent nommé Romulus Augustule, est déposé par un chef germanique. Les causes de cette chute sont multiples : invasions de peuples venus de l\u2019Est, crises économiques répétées, épidémies, et un immense territoire devenu trop difficile à défendre et à administrer depuis une seule capitale.</p><p>L\u2019Empire romain d\u2019Orient, lui, avec Constantinople pour capitale, allait pourtant survivre près de mille ans de plus, sous le nom d\u2019Empire byzantin, jusqu\u2019en 1453.</p><p><b>Anecdote.</b> Le mot « vandalisme », qui désigne aujourd\u2019hui le fait de détruire des biens sans raison, vient directement du nom des Vandales, un peuple germanique qui pilla Rome en 455 — même si les historiens modernes estiment que leur réputation de destructeurs a sans doute été largement exagérée par leurs adversaires !</p>" },
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
  { chap:'VII — Villes et marchands', html:"<p>À partir du XIe siècle, le commerce reprend son essor en Europe, et avec lui les villes se repeuplent après des siècles de déclin. Des marchands parcourent des routes entières pour échanger épices, soieries et fourrures, tandis que de grandes foires, comme celles de Champagne, attirent des commerçants venus de tout le continent une bonne partie de l\u2019année.</p><p>Pour protéger leurs intérêts communs, les artisans d\u2019un même métier se regroupent en <b>corporations</b> (ou guildes) : un jeune apprenti devait ainsi passer plusieurs années auprès d\u2019un maître avant de pouvoir, à son tour, exercer librement son métier et former ses propres apprentis.</p><p><b>Anecdote.</b> Certaines villes marchandes, comme Venise, devinrent si riches grâce au commerce maritime avec l\u2019Orient qu\u2019elles rivalisaient en puissance avec de véritables royaumes, tout en n\u2019étant gouvernées que par un conseil de marchands et un doge élu.</p>" },
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
  { chap:'III — Liberté, égalité, fraternité', html:"<p>La Révolution française de 1789 a profondément transformé la société : la prise de la Bastille, le 14 juillet, en est devenue le symbole. Le peuple réclamait la fin des privilèges de la noblesse et davantage d\u2019égalité. C\u2019est de cette période que datent la devise républicaine et l\u2019hymne national, la Marseillaise.</p><p><b>Anecdote.</b> La Marseillaise n\u2019a pas été composée à Marseille, mais à Strasbourg, en une seule nuit d\u2019avril 1792, par un officier du génie nommé Rouget de Lisle. Elle doit son nom au fait que ce sont des volontaires venus de Marseille qui la chantèrent en marchant vers Paris, la rendant célèbre dans tout le pays.</p>" },
  { chap:'IV — Napoléon et l\u2019Empire', html:"<p>Napoléon Bonaparte, brillant général de la Révolution, s\u2019est fait sacrer empereur des Français en 1804 — un sacre, et non une élection au sens moderne du terme. Son règne a profondément modernisé la France (Code civil, nouvelles administrations) tout en la plongeant dans de nombreuses guerres à travers l\u2019Europe.</p>" },
  { chap:'V — Les grandes inventions du siècle', html:"<p>Le XIXe siècle a vu se multiplier les innovations : le chemin de fer, le télégraphe électrique, puis l\u2019ampoule électrique et le téléphone à la toute fin du siècle. La photographie, inventée dans les années 1830, a permis pour la première fois de fixer durablement une image du réel.</p>" },
  { chap:'VI — Vers la démocratie', html:"<p>Le suffrage universel masculin, permettant à tous les hommes adultes de voter, s\u2019est progressivement installé en France au cours du XIXe siècle. Il faudra cependant attendre 1944 pour que les femmes obtiennent enfin, elles aussi, le droit de vote.</p>" },
  { chap:'VII — Pasteur et les progrès de la médecine', html:"<p>Le chimiste français Louis Pasteur bouleverse la médecine et l\u2019alimentation au XIXe siècle. En démontrant que des micro-organismes invisibles à l\u2019œil nu — les microbes — provoquent de nombreuses maladies, il pose les bases de la médecine moderne et invente la <b>pasteurisation</b>, un procédé de chauffage qui permet de conserver plus longtemps le lait et bien d\u2019autres aliments.</p><p>En 1885, Pasteur met au point le tout premier vaccin contre la rage, une maladie alors presque toujours mortelle, en l\u2019administrant à un jeune garçon mordu par un chien enragé — le jeune Joseph Meister devint ainsi le premier être humain sauvé grâce à cette découverte.</p><p><b>Anecdote.</b> Pasteur n\u2019était pas médecin, mais chimiste ! Ce sont d\u2019ailleurs ses recherches sur la fermentation du vin et de la bière, pour le compte de brasseurs et de vignerons, qui l\u2019ont mené, presque par hasard, jusqu\u2019à ses plus grandes découvertes médicales.</p>" },
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
  { chap:'VI — L\u2019ordinateur et Internet', html:"<p>Les tout premiers ordinateurs, dans les années 1940, occupaient des salles entières. L\u2019invention du transistor en 1947, puis du microprocesseur en 1971, a permis de réduire un ordinateur à la taille d\u2019une puce électronique. Ce n\u2019est qu\u2019avec l\u2019invention du World Wide Web par Tim Berners-Lee, en 1989, qu\u2019Internet devient accessible à tous.</p><p><b>Anecdote.</b> On raconte souvent que le mot anglais « bug », utilisé pour désigner une erreur informatique, serait né d\u2019un authentique insecte retrouvé coincé dans les circuits d\u2019un des tout premiers ordinateurs américains, en 1947. L\u2019histoire est vraie — la célèbre informaticienne Grace Hopper a bien collé ce papillon de nuit dans son carnet de bord ! — mais les linguistes ont montré que le mot « bug » désignait déjà des pannes mécaniques bien avant cette date : l\u2019anecdote a surtout rendu cette expression plus populaire, sans en être réellement l\u2019origine.</p>" },
  { chap:'VII — La conquête spatiale', html:"<p>Le 4 octobre 1957, l\u2019Union soviétique place en orbite Spoutnik 1, le tout premier satellite artificiel de l\u2019histoire, marquant le début d\u2019une course effrénée entre grandes puissances pour conquérir l\u2019espace. Quatre ans plus tard, en 1961, le cosmonaute soviétique Youri Gagarine devient le premier être humain à voyager au-delà de l\u2019atmosphère terrestre.</p><p>Le 21 juillet 1969, l\u2019Américain Neil Armstrong devient le premier homme à poser le pied sur la Lune, lors de la mission Apollo 11, suivi de près par son coéquipier Buzz Aldrin. Plus de 500 millions de personnes suivirent l\u2019exploit en direct à la télévision à travers le monde entier — un record d\u2019audience pour l\u2019époque.</p><p><b>Anecdote.</b> L\u2019ordinateur de bord qui a guidé le module lunaire d\u2019Apollo 11 jusqu\u2019à la surface de la Lune disposait de bien moins de puissance de calcul qu\u2019une calculatrice de poche actuelle — la prouesse tenait presque autant au génie des ingénieurs qu\u2019à la précision de leurs machines !</p>" },
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
 function _escHandler(e){ if(e.key==='Escape') close(); }
 function close(){ if(ov._releaseTrap){ov._releaseTrap();delete ov._releaseTrap;} document.removeEventListener('keydown',_escHandler); ov.classList.add('story-out'); setTimeout(function(){try{ov.remove();}catch(e){}},300); }
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
    +'<span style="font-family:Georgia,serif;font-weight:700;color:'+acc+';font-size:1em;">'+book.title+'</span>'
    +'<span style="font-family:Georgia,serif;font-size:.72em;color:#8a6a45;">'+chap+'</span></div>'
    +'<div style="position:relative;display:grid;grid-template-columns:1fr 1fr;gap:0;background:#EBDFBF;border-radius:5px;overflow:hidden;">'
    +'<div style="background:linear-gradient(90deg,#F3E8CD,#ECE0C2 86%,#DCCBA0);padding:13px 13px 13px 15px;">'+half(L,true)+'</div>'
    +'<div style="background:linear-gradient(90deg,#DCCBA0,#ECE0C2 14%,#F3E8CD);padding:13px 15px 13px 13px;">'+half(R,false)+'</div>'
    +'<div style="position:absolute;top:0;bottom:0;left:50%;width:18px;transform:translateX(-50%);background:linear-gradient(90deg,rgba(0,0,0,0),rgba(90,60,30,.20) 50%,rgba(0,0,0,0));pointer-events:none;"></div>'
    +'</div>';
  }
  const prevLbl=step===total-1?'‹ Pages':'‹ Précédent';
  const nextLbl=step===0?'Feuilleter ›':(step===total-1?'Fermer le livre':'Suivant ›');
  let counter; if(step===0) counter='Couverture'; else if(step===total-1) counter='Dos de couverture'; else { const a=(step-1)*2+1, b=Math.min(a+1,pages.length); counter=(a===b?('page '+a):('pages '+a+'–'+b))+' / '+pages.length; }
  ov.innerHTML='<div class="story-parchment" style="max-width:'+((step===0||step===total-1)?'360':'600')+'px;border-top:6px solid '+acc+';position:relative;">'
   +'<button class="story-btn hb-close" title="Fermer" style="position:absolute;top:8px;right:8px;width:30px;height:30px;padding:0;line-height:1;border-radius:50%;font-size:16px;z-index:2;"><svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'
   +inner
   +'<div class="story-nav">'
   +(step>0?'<button class="story-btn cb-prev">'+prevLbl+'</button>':'<span class="story-spacer"></span>')
   +'<div class="story-dots" style="flex-wrap:wrap;max-width:58%;">'+Array.apply(null,{length:total}).map(function(_,i){return '<span class="story-dot'+(i===step?' on':'')+'"></span>';}).join('')+'</div>'
   +'<button class="story-btn cb-next">'+nextLbl+'</button>'
   +'</div>'
   +'<div style="text-align:center;font-family:Georgia,serif;font-size:.72em;color:#8a6a45;margin-top:4px;">'+counter+'</div>'
   +'</div>';
  const nx=ov.querySelector('.cb-next'); if(nx) nx.onclick=function(){ if(step<total-1){step++;render();} else close(); };
  const pv=ov.querySelector('.cb-prev'); if(pv) pv.onclick=function(){ if(step>0){step--;render();} };
  const cl=ov.querySelector('.hb-close'); if(cl) cl.onclick=close;
  if(typeof beep==='function'){ try{ beep(520,'sine',.09,.04); }catch(e){} }
  if(typeof focusFirstIn==='function') focusFirstIn(ov);
 }
 render(); document.body.appendChild(ov);
 if(typeof trapFocus==='function') ov._releaseTrap=trapFocus(ov);
 document.addEventListener('keydown',_escHandler);
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
  const click=on?(' onclick="_openHistBook('+i+')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();_openHistBook('+i+');}" style="cursor:pointer" role="button" tabindex="0" title="Lire : '+(b.title||'')+'"'):'';
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
 function _escHandler(e){ if(e.key==='Escape') close(); }
 function close(){
  _bStop();
  if(overlay._releaseTrap){overlay._releaseTrap();delete overlay._releaseTrap;}
  document.removeEventListener('keydown',_escHandler);
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
     <button class="story-btn story-next">${last?(chapter.closeLabel||'Commencer ! ⚔️'):'Suivant ›'}</button>
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
  if(typeof focusFirstIn==='function') focusFirstIn(overlay);
 }
 render();
 document.body.appendChild(overlay);
 if(typeof trapFocus==='function') overlay._releaseTrap=trapFocus(overlay);
 document.addEventListener('keydown',_escHandler);
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
// v12.1.5 (Lot C, pt.5) : compteur de progression dans les pages du chapitre
// d'une région, persistant par région. Permet d'étaler les pages déjà écrites
// au fil des zones conquises, au lieu de tout montrer d'un bloc à l'entrée.
function _nextStoryPage(regionId){
 if(typeof P==='undefined' || !P) return 0;
 P.storyPageIdx = P.storyPageIdx || {};
 return P.storyPageIdx[regionId] || 0;
}
function _advanceStoryPage(regionId){
 if(typeof P==='undefined' || !P) return;
 P.storyPageIdx = P.storyPageIdx || {};
 P.storyPageIdx[regionId] = (P.storyPageIdx[regionId] || 0) + 1;
 if(typeof saveProfile==='function') saveProfile();
}

// Déclencheur principal : prologue, puis victoire de Cristal, puis épilogue, puis chapitre d'entrée.
// v12.1.2 : accepte un callback optionnel `afterCb`, appelé une fois la (ou les)
// page(s) d'histoire refermée(s) — ou immédiatement si rien de nouveau à montrer.
// Permet d'enchaîner automatiquement l'affichage à des moments précis du jeu
// (boss d'îlot vaincu, arrivée sur un nouvel îlot) sans attendre une réouverture
// manuelle de la carte.
function _maybeShowStory(afterCb){
 const _done = (typeof afterCb === 'function') ? afterCb : function(){};
 if(typeof P==='undefined' || !P){ _done(); return; }
 P.storySeen = P.storySeen || [];
 // 1) Prologue, une seule fois, au tout début
 const _introId = (_STORY.intro && _STORY.intro.id) || 'intro';
 if(!P.storySeen.includes(_introId)){
  _markStorySeen(_introId);
  _showStoryModal(_STORY.intro, _done);
  return;
 }
 // 2) Scène de victoire : une région vient d'être conquise et son Cristal n'a pas été célébré
 try{
  for(const r of _ARCH_REGIONS){
   if(r.id === _lastRegionId()) continue;         // la dernière région → épilogue, géré plus bas
   const win = _STORY.victories && _STORY.victories[r.id];
   if(win && !P.storySeen.includes(win.id) && _regionConquered(r.id)){
    _markStorySeen(win.id);
    // v12.1.5 (Lot C, pt.5) : si des pages du chapitre n'ont pas encore été
    // montrées (îlot avec plus de pages que de zones intermédiaires, ou la
    // toute dernière page — volontairement réservée à ce moment), on les
    // regroupe avec la scène de victoire : rien du texte déjà écrit n'est
    // perdu, seulement étalé différemment.
    let combinedPages = win.pages;
    try{
     const chap = _STORY.chapters[r.id];
     if(chap && Array.isArray(chap.pages) && chap.pages.length){
      const idx = _nextStoryPage(r.id);
      const leftover = chap.pages.slice(Math.max(idx, 0));
      if(leftover.length){
       combinedPages = [...leftover, ...win.pages];
       P.storyPageIdx = P.storyPageIdx || {};
       P.storyPageIdx[r.id] = chap.pages.length;
      }
     }
    }catch(e){}
    _showStoryModal({ id:win.id, title:win.title, pages:combinedPages }, _done);
    return;
   }
  }
 }catch(e){}
 // 3) Épilogue : le Sanctuaire Final est conquis
 try{
  if(_STORY.epilogue && !P.storySeen.includes(_STORY.epilogue.id) && _regionConquered(_lastRegionId())){
   _markStorySeen(_STORY.epilogue.id);
   // v11.6.5 : bonus de fin de scénario complet (+200⭐), crédité une seule
   // fois par Odyssée terminée. _epilogueBonusCredited évite tout recrédit
   // si l'épilogue est revu plus tard (rejouable). Les joueurs ayant déjà
   // terminé une Odyssée AVANT l'existence de ce bonus sont crédités
   // rétroactivement via la migration dans validateProfile() (05-profile.js).
   P._epilogueBonusCredited = P._epilogueBonusCredited || [];
   if(!P._epilogueBonusCredited.includes(_STORY.epilogue.id)){
    P._epilogueBonusCredited.push(_STORY.epilogue.id);
    P.stars = (P.stars || 0) + 200;
    if(typeof saveProfileNow==='function') saveProfileNow();
    if(typeof updateMenuUI==='function') updateMenuUI();
    if(typeof toast==='function') toast('🏆 Odyssée terminée ! +200⭐', 3000);
   }
   // Si l'aventure a une « histoire du Livre » (Histoire B), elle s'enchaîne juste
   // après l'épilogue, en récompense.
   const _after = function(){
    try{
     if(_STORY.bookTale){ _markStorySeen(_STORY.bookTale.id); _showStoryModal(_STORY.bookTale, _done); return; }
    }catch(e){}
    _done();
   };
   _showStoryModal(_STORY.epilogue, _after);
   return;
  }
 }catch(e){}
 // 4) Chapitre d'entrée de la région où se trouve l'avatar (si pas encore vu)
 try{
  const avZone = MAP_ZONES.find(z => z.id === _getAvatarZone());
  if(!avZone){ _done(); return; }
  const reg = (typeof _regionOfZone==='function') ? _regionOfZone(avZone) : _ARCH_REGIONS.find(r => r.levels.includes(avZone.level));
  if(!reg){ _done(); return; }
  const chap = _STORY.chapters[reg.id];
  if(chap && !P.storySeen.includes(chap.id)){
   _markStorySeen(chap.id);
   // v12.1.5 (Lot C, pt.5) : au lieu du chapitre entier d'un bloc, on ne montre
   // ICI que sa première page (l'accroche). Les pages suivantes seront révélées
   // une à une, au fil des zones conquises dans cet îlot (_maybeShowZoneFragment),
   // pour que l'histoire vive tout au long de l'îlot et pas seulement à l'entrée.
   if(Array.isArray(chap.pages) && chap.pages.length > 1){
    _advanceStoryPage(reg.id); // page 0 consommée ici
    const hook = { id:chap.id+'_p0', title:chap.title, pages:[chap.pages[0]], closeLabel:'En avant ! ⚔️' };
    _showStoryModal(hook, _done);
   } else {
    _showStoryModal(chap, _done);
   }
   return;
  }
  _done();
 }catch(e){ _done(); }
}

// v12.1.5 (Lot C, pt.5) : fragment de carnet après CHAQUE zone conquise (pas
// seulement au début/à la fin de l'îlot). Réutilise le texte déjà écrit du
// chapitre de la région, distribué progressivement au fil des zones plutôt que
// montré d'un bloc à l'entrée — garantie de cohérence parfaite avec le reste
// de l'histoire, puisque c'est exactement le même texte, simplement étalé.
function _maybeShowZoneFragment(zone, afterCb){
 const _done = (typeof afterCb === 'function') ? afterCb : function(){};
 try{
  if(typeof P==='undefined' || !P || !zone){ _done(); return; }
  P.storySeen = P.storySeen || [];
  const reg = (typeof _regionOfZone==='function') ? _regionOfZone(zone) : null;
  if(!reg){ _done(); return; }
  const chap = _STORY.chapters[reg.id];
  if(!chap || !Array.isArray(chap.pages) || chap.pages.length < 2){ _done(); return; }
  const idx = _nextStoryPage(reg.id);
  // La toute dernière page reste réservée à la scène de victoire (Cristal),
  // pour clore le chapitre en beauté plutôt que sur un fragment isolé.
  if(idx <= 0 || idx >= chap.pages.length - 1){ _done(); return; }
  const fragId = chap.id + '_p' + idx;
  if(P.storySeen.includes(fragId)){ _done(); return; }
  _markStorySeen(fragId);
  _advanceStoryPage(reg.id);
  const frag = { id:fragId, title:chap.title, pages:[chap.pages[idx]], closeLabel:'Continuer ›' };
  _showStoryModal(frag, _done);
 }catch(e){ _done(); }
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
  <button class="bosscard-close" aria-label="Fermer"><svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
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
 card.addEventListener('keydown', (e) => { if(e.key==='Enter'||e.key===' '){ e.preventDefault(); card.classList.toggle('flipped'); } });
 overlay.querySelector('.bosscard-close').addEventListener('click', (e) => { e.stopPropagation(); _closeBossCard(overlay); });
 overlay.addEventListener('click', (e) => { if(e.target === overlay) _closeBossCard(overlay); });
 document.body.appendChild(overlay);
 requestAnimationFrame(() => overlay.classList.add('show'));
 if(typeof beep==='function'){ try{ beep(440,'sine',.1,.05); }catch(e){} }
 if(typeof trapFocus==='function') overlay._releaseTrap=trapFocus(overlay);
}
function _closeBossCard(overlay){
 if(overlay._releaseTrap){overlay._releaseTrap();delete overlay._releaseTrap;}
 overlay.classList.remove('show');
 setTimeout(() => { try{ overlay.remove(); }catch(e){} }, 280);
}
