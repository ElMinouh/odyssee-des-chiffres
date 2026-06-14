// 03-figurines-data.js — L'Odyssée des Chiffres
'use strict';

// Données des figurines : portraits SVG, raretés, icônes univers, liste complète.

// FIGURINES — 50 personnages à collectionner
// ═══════════════════════════════════════════════════════
// ── Portraits SVG ─────────────────────────────────────────────────────
// Les 232 portraits sont externalisés dans assets/portraits.svg (sprite unique).
// On les charge une fois en mémoire au premier accès, puis on sert depuis le cache.
// API rétrocompatible : CHAR_PORTRAITS[id] renvoie une chaîne HTML <svg>...</svg>
//   comme avant, pour que le reste du code (openFigViewer, _ensureArms) fonctionne
//   sans modification.
const CHAR_PORTRAITS = {};
let _portraitsLoaded = false;
let _portraitsLoadPromise = null;

function loadPortraits() {
  if (_portraitsLoaded) return Promise.resolve();
  if (_portraitsLoadPromise) return _portraitsLoadPromise;
  _portraitsLoadPromise = fetch('assets/portraits.svg')
    .then(r => r.ok ? r.text() : Promise.reject(new Error('HTTP ' + r.status)))
    .then(svgText => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, 'image/svg+xml');
      doc.querySelectorAll('symbol').forEach(sym => {
        const id = sym.getAttribute('id');
        const vb = sym.getAttribute('viewBox') || '0 0 100 110';
        // Reconstituer un <svg> autonome à partir du <symbol>
        CHAR_PORTRAITS[id] =
          `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${sym.innerHTML}</svg>`;
      });
      _portraitsLoaded = true;
    })
    .catch(err => {
      console.warn('Portraits non chargés :', err.message);
      _portraitsLoaded = true; // éviter de re-tenter en boucle
    });
  return _portraitsLoadPromise;
}

// Charger dès que possible, en arrière-plan (n'empêche pas le reste de tourner).
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => { loadPortraits(); });
}

// ═══════════════════════════════════════════════════════
// Chantier E1 : portraits HD (images WebP) avec fallback SVG
// ═══════════════════════════════════════════════════════
// Détection automatique : on tente de charger l'image au premier appel ;
// si elle existe, on la garde en cache (Set) ; si 404, on la marque comme absente
// pour ne plus retenter.
// AVANTAGE : aucune maintenance du Set quand tu ajoutes une figurine.
// Il suffit de déposer le .webp dans assets/figurines/ et c'est détecté.
const FIG_IMG_AVAILABLE = new Set();
const FIG_IMG_TESTED = new Set(); // évite de re-tester les images déjà checkées
const FIG_IMG_FAILED = new Set();  // images confirmées absentes (404)

/**
 * Probe l'existence d'une image figurine. Async, met à jour les Sets.
 * Si tu préfères forcer manuellement la liste, ajoute les IDs dans FIG_IMG_AVAILABLE
 * dans la liste FIG_IMG_PRELOAD ci-dessous.
 */
function _probeFigImage(id){
 if(FIG_IMG_TESTED.has(id)) return; // déjà testée
 FIG_IMG_TESTED.add(id);
 const img = new Image();
 img.onload = ()=>{
  FIG_IMG_AVAILABLE.add(id);
  // Re-render éventuel de la galerie si elle est ouverte (sinon ce sera au prochain rendu)
  if(typeof renderFigCollection==='function' && document.getElementById('v-figs') && !document.getElementById('v-figs').classList.contains('hidden')){
   renderFigCollection();
  }
 };
 img.onerror = ()=>{ FIG_IMG_FAILED.add(id); };
 img.src = 'assets/figurines/' + id + '.webp';
}

// Liste de pré-chargement explicite : pour les figurines que tu sais avoir
// une image HD (évite le délai de probe au premier rendu).
// Ajoute simplement l'ID quand tu pousses un nouveau .webp.
const FIG_IMG_PRELOAD = [
  // Dragon Ball (36)
  'db01', 'db02', 'db03', 'db04', 'db05', 'db06', 'db07',
  'db08', 'db09', 'db10', 'db11', 'db12', 'db13', 'db14',
  'db15', 'db16', 'db17', 'db18', 'db19', 'db20', 'db21',
  'db22', 'db23', 'db24', 'db25', 'db26', 'db27', 'db28',
  'db29', 'db30', 'db31', 'db32', 'db33', 'db34', 'db35',
  'db36',
  // Ninjago (13)
  'nj01', 'nj02', 'nj03', 'nj04', 'nj05', 'nj06', 'nj07',
  'nj08', 'nj09', 'nj10', 'nj11', 'nj12', 'nj13',
  // Sailor Moon (5)
  'sm01', 'sm02', 'sm03', 'sm04', 'sm05',
  // Tortues Ninja (7)
  'tu01', 'tu02', 'tu03', 'tu04', 'tu05', 'tu06', 'tu07',
  // Bluey (6)
  'bl01', 'bl02', 'bl03', 'bl04', 'bl05', 'bl06',
  // Dragons (13)
  'dr01', 'dr02', 'dr03', 'dr04', 'dr05', 'dr06', 'dr07',
  'dr08', 'dr09', 'dr10', 'dr11', 'dr12', 'dr13',
  // Miraculous (6)
  'mi01', 'mi02', 'mi03', 'mi04', 'mi05', 'mi06',
  // Pyjamasques (7)
  'pj01', 'pj02', 'pj03', 'pj04', 'pj05', 'pj06', 'pj07',
  // Harry Potter (12)
  'hp01', 'hp02', 'hp03', 'hp04', 'hp05', 'hp06', 'hp07',
  'hp08', 'hp09', 'hp10', 'hp11', 'hp12',
  // Star Wars (17)
  'sw01', 'sw02', 'sw03', 'sw04', 'sw05', 'sw06', 'sw07',
  'sw08', 'sw09', 'sw10', 'sw11', 'sw12', 'sw13', 'sw14',
  'sw15', 'sw16', 'sw17',
  // Reine des Neiges (7)
  'fr01', 'fr02', 'fr03', 'fr04', 'fr05', 'fr06', 'fr07',
  // Mickey & Amis (8)
  'mk01', 'mk02', 'mk03', 'mk04', 'mk05', 'mk06', 'mk07',
  'mk08',
  // Marvel (33)
  'mv01', 'mv02', 'mv03', 'mv04', 'mv05', 'mv06', 'mv07',
  'mv08', 'mv09', 'mv10', 'mv11', 'mv12', 'mv13', 'mv14',
  'mv15', 'mv16', 'mv17', 'mv18', 'mv19', 'mv20', 'mv21',
  'mv22', 'mv23', 'mv24', 'mv25', 'mv26', 'mv27', 'mv28',
  'mv29', 'mv30', 'mv31', 'mv32', 'mv33',
  // Pokémon (27)
  'pk01', 'pk02', 'pk03', 'pk04', 'pk05', 'pk06', 'pk07',
  'pk08', 'pk09', 'pk10', 'pk11', 'pk12', 'pk13', 'pk14',
  'pk15', 'pk16', 'pk17', 'pk18', 'pk19', 'pk20', 'pk21',
  'pk22', 'pk23', 'pk24', 'pk25', 'pk26', 'pk27',
  // Mario Bros (8)
  'mr01', 'mr02', 'mr03', 'mr04', 'mr05', 'mr06', 'mr07',
  'mr08',
  // Totally Spies (5)
  'sp01', 'sp02', 'sp03', 'sp04', 'sp05',
  // Cités d'Or (11)
  'mc01', 'mc02', 'mc03', 'mc04', 'mc05', 'mc06', 'mc07',
  'mc08', 'mc09', 'mc10', 'mc11',
  // Goldorak (11)
  'gd01', 'gd02', 'gd03', 'gd04', 'gd05', 'gd06', 'gd07',
  'gd08', 'gd09', 'gd10', 'gd11',
  // Chevaliers du Zodiaque (31)
  'cz01', 'cz02', 'cz03', 'cz04', 'cz05', 'cz06', 'cz07',
  'cz08', 'cz09', 'cz10', 'cz11', 'cz12', 'cz13', 'cz14',
  'cz15', 'cz16', 'cz17', 'cz18', 'cz19', 'cz20', 'cz21',
  'cz22', 'cz23', 'cz24', 'cz25', 'cz26', 'cz27', 'cz28',
  'cz29', 'cz30', 'cz31',
  // 3 Mousquetaires (10)
  'tm01', 'tm02', 'tm03', 'tm04', 'tm05', 'tm06', 'tm07',
  'tm08', 'tm09', 'tm10',
  // DC Comics (28)
  'dc01', 'dc02', 'dc03', 'dc04', 'dc05', 'dc06', 'dc07',
  'dc08', 'dc09', 'dc10', 'dc11', 'dc12', 'dc13', 'dc14',
  'dc15', 'dc16', 'dc17', 'dc18', 'dc19', 'dc20', 'dc21',
  'dc22', 'dc23', 'dc24', 'dc25', 'dc26', 'dc27', 'dc28',
  // Tintin (8)
  'tn01', 'tn02', 'tn03', 'tn04', 'tn05', 'tn06', 'tn07', 'tn08',
  // Astérix (9)
  'ax01', 'ax02', 'ax03', 'ax04', 'ax05', 'ax06', 'ax07', 'ax08', 'ax09',
  // Cobra (8)
  'co01', 'co02', 'co03', 'co04', 'co05', 'co06', 'co07', 'co08',
  // Albator (8)
  'al01', 'al02', 'al03', 'al04', 'al05', 'al06', 'al07', 'al08',
  // Olive & Tom (23)
  'ot01', 'ot02', 'ot03', 'ot04', 'ot05', 'ot06', 'ot07',
  'ot08', 'ot09', 'ot10', 'ot11', 'ot12', 'ot13', 'ot14',
  'ot15', 'ot16', 'ot17', 'ot18', 'ot19', 'ot20', 'ot21',
  'ot22', 'ot23',
];
// Marque immédiatement comme disponibles + précharge
if(typeof window !== 'undefined'){
 FIG_IMG_PRELOAD.forEach(id => {
  FIG_IMG_AVAILABLE.add(id);
  FIG_IMG_TESTED.add(id);
  // Précharge le fichier pour qu'il soit déjà en cache navigateur quand l'utilisateur ouvre la galerie
  const img = new Image();
  img.src = 'assets/figurines/' + id + '.webp';
 });
}

/**
 * Retourne le HTML du portrait d'une figurine, en privilégiant l'image HD si dispo,
 * sinon le portrait SVG (sprite legacy), sinon une fallback emoji.
 *
 * @param {string} id - ID de la figurine (ex. 'db01')
 * @param {object} [opts] - { size: number en px, emoji: string fallback emoji }
 * @returns {string} HTML
 */
function getCharPortrait(id, opts = {}){
 const size = opts.size || 100;
 const emoji = opts.emoji || '❓';
 // 1. Image HD si disponible (préchargée OU détectée)
 if(FIG_IMG_AVAILABLE.has(id)){
  const fallbackHTML = (CHAR_PORTRAITS[id] || `<div style="font-size:${size*0.45}px;line-height:${size}px;text-align:center;">${emoji}</div>`)
    .replace(/'/g, '&#39;').replace(/"/g, '&quot;');
  // Le onerror : si le fichier .webp n'existe pas (404), on log pour diagnostic
  // et on bascule sur le fallback (SVG ou emoji).
  return `<img src="assets/figurines/${id}.webp" alt="" loading="lazy" decoding="async"
    style="width:100%;height:100%;object-fit:contain;display:block;"
    onerror="console.warn('[fig img 404] Fichier manquant : assets/figurines/${id}.webp');FIG_IMG_AVAILABLE.delete('${id}');FIG_IMG_FAILED.add('${id}');this.outerHTML='${fallbackHTML}'"/>`;
 }
 // 2. Pas en cache + pas encore testé : on lance une probe asynchrone (sans bloquer)
 //    et on retombe sur SVG en attendant. Quand la probe réussit, la prochaine ouverture
 //    de la galerie affichera l'image.
 if(!FIG_IMG_TESTED.has(id) && !FIG_IMG_FAILED.has(id)){
  _probeFigImage(id);
 }
 // 3. Sprite SVG legacy
 if(CHAR_PORTRAITS[id]) return CHAR_PORTRAITS[id];
 // 4. Emoji fallback
 return `<div style="font-size:${size*0.45}px;line-height:${size}px;text-align:center;">${emoji}</div>`;
}

const RARITY_COL={commun:'#95a5a6',rare:'#3498db',épique:'#9b59b6',légendaire:'#f39c12',mythique:'#e91e8c',exclusif:'#f1c40f'};
const RARITY_STARS={commun:'◆',rare:'◆◆',épique:'◆◆◆',légendaire:'◆◆◆◆',mythique:'◆◆◆◆◆',exclusif:'✨◆✨'};
const UNI_ICON={db:'🐉',hp:'⚡',sw:'🚀',nj:'🐲',fr:'❄️',mk:'🐭',mv:'⚡',pk:'⚡',mr:'🍄',gd:'🤖',mc:'🌟',cz:'🏆',tm:'⚔️',tn:'🔍',ax:'🏺',mi:'🐞',pj:'🦸',ot:'⚽',co:'🔫',al:'☠️',tu:'🐢',sm:'🌙',sp:'🕵️',bl:'🐕',dr:'🐉',sx:'🎂',dc:'🦸',kp:'🎤',sc:'🍄',zl:'🗡️'};
const FIGURINES=[
{id:'db01',name:'Goku Super Saiyen',uni:'Dragon Ball',uk:'db',em:'🌀',em2:'⚡',color:'#f39c12',gc:'#ffb300',desc:'Fils de Bardock, élevé sur Terre par les humains, Son Goku est le plus grand guerrier de l\'univers. Il maîtrise le Kaméhaméha, une attaque d\'énergie bleue chargée entre les paumes. En Super Saiyen, ses cheveux dorés et ses yeux verts révèlent une puissance colossale. Toujours prêt à dépasser ses limites, il cherche non la victoire, mais le dépassement de soi.',r:'légendaire',p:350},
{id:'db02',name:'Végéta',uni:'Dragon Ball',uk:'db',em:'👑',em2:'⚡',color:'#3498db',gc:'#5dade2',desc:'Prince des Saiyens, Végéta est le rival éternel de Goku. Arrogant et fier de son sang royal, il a progressivement choisi la voie du bien. Son Gallic Gun libère une explosion violette dévastatrice. Rival devenu allié, père aimant et guerrier d\'élite, Végéta reste l\'un des personnages les plus complexes et aimés de Dragon Ball Z.',r:'épique',p:230},
{id:'db03',name:'Gohan SS2',uni:'Dragon Ball',uk:'db',em:'🔥',em2:'📚',color:'#f1c40f',gc:'#f4d03f',desc:'Fils de Goku et Chi-Chi, Gohan possède un potentiel qui dépasse celui de son père. En Super Saiyen 2, des éclairs crépitent autour de son corps. C\'est lui qui vainc Cell lors du Tournoi des Jeux Cellulaires. Doté d\'une intelligence hors-normes et d\'une puissance légendaire, Gohan est le futur protecteur de la Terre.',r:'épique',p:230},
{id:'db04',name:'Piccolo',uni:'Dragon Ball',uk:'db',em:'🟢',em2:'🤝',color:'#27ae60',gc:'#2ecc71',desc:'Ancien ennemi devenu le mentor le plus dévoué de Gohan, Piccolo est un guerrier Namek. Il peut allonger ses membres et se régénérer. Son Makankôsappô est un rayon perceur en spirale d\'une précision redoutable. Sage, stoïque et profondément honorable, Piccolo représente la rédemption par l\'amitié et le sacrifice.',r:'rare',p:150},
{id:'db05',name:'Freezer Forme Finale',uni:'Dragon Ball',uk:'db',em:'❄️',em2:'👿',color:'#9b59b6',gc:'#bb8fce',desc:'Seigneur de l\'espace qui détruisit la planète Végéta, Freezer cache dans sa forme finale une puissance terrifiante. Son Rayon de la Mort transperce ses adversaires avec une précision chirurgicale. Cruel, élégant et impitoyable, il est le symbole absolu du mal dans Dragon Ball Z.',r:'légendaire',p:350},
{id:'db06',name:'Cell Parfait',uni:'Dragon Ball',uk:'db',em:'😈',em2:'💚',color:'#1abc9c',gc:'#00e676',desc:'Androïde bio-mécanique créé par le Dr Gero, Cell absorba les Androïdes 17 et 18 pour atteindre la perfection. Capable d\'utiliser les attaques de tous les guerriers absorbés, sa défaite face à Gohan SS2 lors du Kaméhaméha Final reste l\'une des scènes les plus épiques de la saga.',r:'épique',p:230},
{id:'db07',name:'Majin Buu',uni:'Dragon Ball',uk:'db',em:'🍬',em2:'💗',color:'#e91e8c',gc:'#f48fb1',desc:'Créature magique rose d\'une puissance terrifiante, Majin Buu peut transformer ses ennemis en bonbons. Sa forme la plus dangereuse, Buu Pur, est une entité de destruction absolue vaincue grâce au Géno-Kaméhaméha de Goku Super Saiyen 3. Le M sur son front trahit la magie du sorcier Babidi.',r:'épique',p:230},
{id:'db08',name:'Trunks du Futur',uni:'Dragon Ball',uk:'db',em:'⚔️',em2:'💜',color:'#8e44ad',gc:'#bb8fce',desc:'Fils de Végéta et Bulma venu d\'un futur post-apocalyptique, Trunks voyage dans le passé pour changer l\'histoire. Combattant solitaire ayant affronté seul les Androïdes, il manie son épée avec une maîtrise absolue. Courageux et mélancolique, il est déterminé à protéger sa famille.',r:'rare',p:150},
{id:'db09',name:'Krilin',uni:'Dragon Ball',uk:'db',em:'☯️',em2:'💪',color:'#e67e22',gc:'#f0a500',desc:'Meilleur ami de Goku depuis l\'enfance, Krilin est l\'humain le plus fort du monde Dragon Ball. Ses six points sur le front et l\'absence de nez sont ses marques de fabrique. Son Kienzan, disque d\'énergie tranchant comme un rasoir, peut couper presque tout. Il prouve que l\'amitié vaut plus que la puissance.',r:'commun',p:90},
{id:'db10',name:'Androïde 18',uni:'Dragon Ball',uk:'db',em:'👱‍♀️',em2:'🤖',color:'#00bcd4',gc:'#00e5ff',desc:'Cyborg créée par le Dr Gero, l\'Androïde 18 a une force surhumaine et une énergie inépuisable. Froide au début, elle épouse Krilin et devient une mère aimante. Ses cheveux blonds courts et ses yeux bleus glacés en font un personnage inoubliable, redoutable au Tournoi du Pouvoir.',r:'rare',p:150},
{id:'db11',name:'Broly Légendaire',uni:'Dragon Ball',uk:'db',em:'💥',em2:'🌿',color:'#00c853',gc:'#69f0ae',desc:'Le Super Saiyen Légendaire, né avec un niveau de puissance si élevé que le roi Végéta ordonna sa mort. En SS Légendaire, ses cheveux verts et son aura vert lime font trembler l\'univers. Traumatisé par les pleurs de Kakarot bébé, il hurle ce nom dans ses accès de rage incontrôlable.',r:'légendaire',p:350},
{id:'db12',name:'Goku Ultra Instinct',uni:'Dragon Ball',uk:'db',em:'⭐',em2:'🌌',color:'#e0e0e0',gc:'#ffffff',desc:'L\'Ultra Instinct est la forme divine que même les dieux peinent à maîtriser. Goku y accède lors du Tournoi du Pouvoir en dépassant ses propres limites. Son corps réagit et esquive seul sans que son esprit pense. Cheveux et yeux argentés, aura blanche divine : la perfection absolue au combat.',r:'mythique',p:500},
{id:'db13',name:'Hercule',uni:'Dragon Ball',uk:'db',em:'🥋',em2:'🏆',color:'#f1c40f',gc:'#f4d03f',desc:'Mr Satan, autoproclamé Champion du Monde de la Terre, est l\'imposteur le plus aimé de l\'univers Dragon Ball. Son afro noire bouclée, sa moustache et sa cape blanche cachent un combattant beaucoup moins puissant qu\'il ne le prétend. Drôle, lâche mais finalement courageux, il sauvera la Terre face à Buu en se liant d\'amitié avec lui.',r:'rare',p:150},
{id:'db14',name:'C-17',uni:'Dragon Ball',uk:'db',em:'🤖',em2:'😎',color:'#1a1a1a',gc:'#34495e',desc:'Cyborg numéro 17 créé par le Dr Gero, frère jumeau de C-18. Cheveux noirs, écharpe orange et débardeur noir, il est froid, sarcastique et incroyablement puissant. Énergie infinie grâce à son réacteur. Après avoir aidé Goku contre Cell, il devient garde forestier et père de famille, prouvant qu\'un cyborg peut avoir un cœur.',r:'épique',p:230},
{id:'db15',name:'Tortue Géniale',uni:'Dragon Ball',uk:'db',em:'🐢',em2:'😎',color:'#9b59b6',gc:'#bdc3c7',desc:'Maître Roshi, légendaire vieux maître des arts martiaux qui forma Goku, Krilin, Yamcha. Sa carapace de tortue, son crâne chauve, ses lunettes de soleil et sa canne en font le mentor le plus iconique. Inventeur du Kamehameha, sa puissance est immense malgré son apparence. Pervers notoire mais sage profond, il guide les héros depuis les premiers épisodes.',r:'épique',p:230},
{id:'db16',name:'Chichi',uni:'Dragon Ball',uk:'db',em:'👩',em2:'🍳',color:'#9b59b6',gc:'#c0392b',desc:'Femme de Goku et mère de Gohan et Goten. Princesse du Mont Frypan, fille du Roi Gyumao, ses longs cheveux noirs noués et son tempérament explosif sont légendaires. Obsédée par les études de ses fils, elle empêche Gohan de combattre. Son amour pour sa famille est aussi grand que son côté autoritaire est célèbre.',r:'rare',p:150},
{id:'db17',name:'Son Goten',uni:'Dragon Ball',uk:'db',em:'⭐',em2:'🥋',color:'#c0392b',gc:'#e67e22',desc:'Fils cadet de Goku et Chichi, frère de Gohan. Sa coupe en piques noirs identique à son père Goku jeune, son gi orange et bleu en font un mini-Goku. Capable de devenir Super Saiyan dès 7 ans, il fusionne avec Trunks via la Fusion pour devenir Gotenks. Innocent et joyeux, il symbolise l\'espoir des nouvelles générations.',r:'épique',p:230},
{id:'db18',name:'Trunks enfant',uni:'Dragon Ball',uk:'db',em:'💜',em2:'🥋',color:'#7d3c98',gc:'#9b59b6',desc:'Fils de Vegeta et Bulma, Trunks enfant est mauve aux cheveux indisciplinés. Son tempérament arrogant hérité de son père et son intelligence de sa mère en font un combattant prodige. Capable de devenir Super Saiyan plus jeune que Goten, il forme avec lui le duo Gotenks. Sa version adulte du futur est totalement différente.',r:'épique',p:230},
{id:'db19',name:'Bulma',uni:'Dragon Ball',uk:'db',em:'🔵',em2:'🔧',color:'#3498db',gc:'#74b9ff',desc:'Bulma Briefs, scientifique géniale et héritière de la Capsule Corp. Cheveux changeant souvent de couleur (verts, bleus turquoise), son intelligence et son tempérament fort en font la femme la plus iconique de Dragon Ball. Inventeuse du radar des Dragon Balls, elle finira par épouser Vegeta avec qui elle aura Trunks et Bra.',r:'rare',p:150},
{id:'db20',name:'Videl',uni:'Dragon Ball',uk:'db',em:'👊',em2:'🥋',color:'#7f8c8d',gc:'#bdc3c7',desc:'Fille d\'Hercule et future femme de Gohan, Videl est une combattante d\'arts martiaux capable. Ses petites couettes courtes noires, son t-shirt blanc et son short rouge sont son look iconique. Détective défendant la justice, elle sera entraînée par Gohan en vol. Mère de Pan, elle prouve que les femmes peuvent aussi être des héroïnes.',r:'rare',p:150},
{id:'db21',name:'Yamcha',uni:'Dragon Ball',uk:'db',em:'🐺',em2:'⚔️',color:'#e67e22',gc:'#d4a017',desc:'Bandit du désert reconverti en Z-fighter, Yamcha est l\'éternel sous-estimé de la troupe. Ses cheveux longs noirs et sa cicatrice sur la joue le rendent charismatique. Premier amour de Bulma, ses techniques (Pied Loup, Coup de Bélier) sont efficaces mais il finit toujours par perdre face aux ennemis majeurs. Sa pose en croix est devenue mème.',r:'rare',p:150},
{id:'db22',name:'Tenshinhan',uni:'Dragon Ball',uk:'db',em:'👁️',em2:'⚔️',color:'#27ae60',gc:'#16a085',desc:'Le combattant à trois yeux, Tenshinhan est un guerrier discipliné et stoïque. Son troisième œil sur le front, son crâne rasé et son physique sculpté en font un combattant impressionnant. Maître du Kikoho et de la Multiplication, sa rivalité avec Goku tournera à l\'amitié. Toujours accompagné de son fidèle Chaozu, leur lien est touchant.',r:'rare',p:150},
{id:'db23',name:'Chaozu',uni:'Dragon Ball',uk:'db',em:'🤡',em2:'💖',color:'#ecf0f1',gc:'#f8c8dc',desc:'Petit combattant au visage blanc et aux joues rouges, Chaozu ressemble à un mime. Inséparable de Tenshinhan, il maîtrise des pouvoirs psychiques. Ses techniques de paralysie sont efficaces mais il est souvent dépassé par les ennemis trop forts. Son sacrifice héroïque contre Nappa, en s\'autodétruisant, reste un moment poignant.',r:'commun',p:90},
{id:'db24',name:'Yajirobé',uni:'Dragon Ball',uk:'db',em:'⚔️',em2:'🍡',color:'#27ae60',gc:'#a8e6cf',desc:'Samouraï rondelet vivant en haut de la Tour Karin, Yajirobé est plus malin que vaillant. Ses longs cheveux noirs hirsutes, sa veste verte et son katana en font un personnage atypique. Lâche notoire mais doté de potentiel, il a coupé la queue de Vegeta et l\'a empêché de tuer Goku. Toujours là pour donner les Senzu salvateurs.',r:'commun',p:90},
{id:'db25',name:'C-16',uni:'Dragon Ball',uk:'db',em:'🤖',em2:'💚',color:'#27ae60',gc:'#2ecc71',desc:'Cyborg numéro 16 créé par le Dr Gero, géant pacifique au cœur noble. Son physique imposant à coupe rousse et son armure verte le rendent reconnaissable. Contrairement à ses frères C-17 et C-18, il chérit la nature et refuse de tuer Goku. Son sacrifice héroïque face à Cell, encourageant Gohan à libérer sa colère, reste l\'un des moments les plus émouvants de Dragon Ball Z.',r:'rare',p:150},
{id:'db26',name:'Mr. Popo',uni:'Dragon Ball',uk:'db',em:'🧞',em2:'🌍',color:'#1a1a1a',gc:'#27ae60',desc:'Assistant éternel de Dieu/Dendé au Palais du Très-Haut, Mr. Popo est un génie à la peau noire et aux lèvres rouges. Sa robe blanche et son turban orange à plume en font une figure mystique. Plus puissant qu\'il n\'y paraît, il a entraîné Goku à parler avec Karin. Bienveillant gardien des dieux terriens depuis des millénaires.',r:'rare',p:150},
{id:'db27',name:'Kaio Shin',uni:'Dragon Ball',uk:'db',em:'🌌',em2:'⚔️',color:'#9b59b6',gc:'#bb8fce',desc:'Kaio Shin de l\'Est, dieu suprême Kaio Shin de l\'univers de Dragon Ball Z. Sa peau violette, ses cheveux blancs en pointes Mohawk et sa boucle d\'oreille jaune en font un personnage divin reconnaissable. Plus puissant que les Kaio simples, il aide les Z-fighters contre Buu. Son rang céleste cache une certaine candeur.',r:'épique',p:230},
{id:'db28',name:'Shenron',uni:'Dragon Ball',uk:'db',em:'🐉',em2:'🌟',color:'#27ae60',gc:'#2ecc71',desc:'Le Dragon Sacré qui apparaît quand on rassemble les 7 Dragon Balls. Long serpent vert aux écailles brillantes, ses yeux rouges, ses moustaches blanches et ses bois imposants emplissent le ciel. Capable d\'exaucer un vœu (puis trois après amélioration), il est le McGuffin central de toute la saga. Sa voix grave est légendaire.',r:'mythique',p:500},
{id:'db29',name:'Guerrier intergalactique',uni:'Dragon Ball',uk:'db',em:'⚔️',em2:'🌌',color:'#34495e',gc:'#7f8c8d',desc:'Combattant générique des arts martiaux intergalactiques, ce guerrier symbolise les nombreux participants des tournois cosmiques. Armure et casque variés selon son origine, il représente l\'amplitude des univers explorés dans Dragon Ball. Plus faible que les héros principaux mais respectable adversaire dans les arènes intergalactiques.',r:'commun',p:90},
{id:'db30',name:'Bardock',uni:'Dragon Ball',uk:'db',em:'🥋',em2:'🩸',color:'#e74c3c',gc:'#c0392b',desc:'Père biologique de Goku et guerrier de la planète Vegeta. Sa coupe identique à son fils, sa bandeau rouge sur le front et sa cicatrice sur la joue gauche en font un héros tragique. Doté de visions du futur, il a tenté en vain de prévenir le génocide saiyan par Freezer. Son sacrifice héroïque lors de la destruction de Vegeta est mémorable.',r:'épique',p:230},
{id:'db31',name:'Tao Pai Pai',uni:'Dragon Ball',uk:'db',em:'⚔️',em2:'🤖',color:'#7f0000',gc:'#c0392b',desc:'Assassin légendaire engagé par l\'Armée du Ruban Rouge, Tao Pai Pai était l\'antagoniste arrogant qui tua Bora et blessa gravement le jeune Goku. Sa tunique de soie chinoise et sa moustache pointue en font un méchant classique. Reconstruit en cyborg après une défaite, il revient pour des combats secondaires teintés de comique.',r:'rare',p:150},
{id:'db32',name:'Saibaman',uni:'Dragon Ball',uk:'db',em:'👹',em2:'🌱',color:'#27ae60',gc:'#16a085',desc:'Créature verte issue de graines extraterrestres saiyennes plantées dans le sol. Petits, agiles et dotés d\'un acide vert corrosif, les Saibamen sont les sbires apparus avec Vegeta et Nappa lors de l\'attaque sur Terre. Leur sacrifice de Yamcha en s\'autodétruisant est resté gravé dans les mémoires des fans.',r:'commun',p:90},
{id:'db33',name:'Nappa',uni:'Dragon Ball',uk:'db',em:'🥋',em2:'😈',color:'#bd6f00',gc:'#e67e22',desc:'Saiyan d\'élite, partenaire de Vegeta lors de l\'attaque sur Terre. Géant chauve à la moustache noire, son armure saiyan et sa puissance brutale en ont fait l\'antagoniste qui élimina plusieurs Z-fighters (Tenshinhan, Chaozu, Piccolo, Yamcha). Son arrogance le perdra face à Goku revenu plus puissant. Tué brutalement par Vegeta après avoir échoué.',r:'rare',p:150},
{id:'db34',name:'Capitaine Ginyu',uni:'Dragon Ball',uk:'db',em:'💪',em2:'🎭',color:'#7d3c98',gc:'#9b59b6',desc:'Capitaine du Commando Ginyu, l\'élite de Freezer. Cornu, peau violette et armure imposante, il pose en groupe avec ses 4 lieutenants. Sa technique signature : l\'échange de corps avec son adversaire. Goku le piégera dans le corps d\'une grenouille. Théâtral et obsédé par les poses ridicules, il est l\'un des méchants les plus mémorables.',r:'rare',p:150},
{id:'db35',name:'Dabra',uni:'Dragon Ball',uk:'db',em:'😈',em2:'🔱',color:'#7f0000',gc:'#c0392b',desc:'Roi des démons et serviteur de Babidi, Dabra est un guerrier rouge aux cornes pointues et au cape sombre. Sa salive transforme ses ennemis en pierre. Très puissant, il fut tué par Buu sans pouvoir se défendre. Lors de son passage au paradis, il tomba sous le charme et devint pacifique, prouvant que même un démon peut changer.',r:'rare',p:150},
{id:'db36',name:'Frieza Doré',uni:'Dragon Ball',uk:'db',em:'👑',em2:'✨',color:'#f1c40f',gc:'#fdc830',desc:'Forme ultime de Freezer obtenue après 4 mois d\'entraînement intensif en enfer. Son corps doré scintillant et ses pupilles violettes témoignent d\'une puissance multipliée. Plus rapide et plus puissant que sa forme finale précédente, il rivalise même avec Goku Super Saiyan Blue. Sa vanité divine en fait un antagoniste éternellement fascinant.',r:'légendaire',p:350},
{id:'hp01',name:'Harry Potter',uni:'Harry Potter',uk:'hp',em:'🧙',em2:'⚡',color:'#c0392b',gc:'#e74c3c',desc:'Né le 31 juillet, Harry Potter est le Survivant, seul sorcier à avoir résisté à Avada Kedavra enfant. Sa cicatrice en éclair et ses lunettes rondes sont ses marques distinctives. Avec Hermione et Ron, il affronte Voldemort et le vainc lors de la Bataille de Poudlard grâce à l\'amour maternel de Lily.',r:'épique',p:230},
{id:'hp02',name:'Hermione Granger',uni:'Harry Potter',uk:'hp',em:'📚',em2:'✨',color:'#c0392b',gc:'#e74c3c',desc:'Sorcière la plus brillante de sa génération, Hermione est la meilleure élève de Poudlard. Fille de Moldus, elle compense par un travail acharné et une mémoire prodigieuse. Sans elle, Harry n\'aurait jamais vaincu Voldemort. Courageuse, loyale et d\'une intelligence redoutable, elle est l\'âme logique du trio.',r:'épique',p:230},
{id:'hp03',name:'Ron Weasley',uni:'Harry Potter',uk:'hp',em:'♟️',em2:'🧡',color:'#e67e22',gc:'#f39c12',desc:'Sixième enfant de la famille Weasley, Ron est le meilleur ami de Harry depuis le Poudlard Express. Ses cheveux roux et ses taches de rousseur le font reconnaître entre mille. Joueur d\'échecs exceptionnel, gardien de Quidditch et ami loyal, il apporte humour et humanité indispensables au trio.',r:'rare',p:150},
{id:'hp04',name:'Albus Dumbledore',uni:'Harry Potter',uk:'hp',em:'🔮',em2:'🧙‍♂️',color:'#9b59b6',gc:'#bb8fce',desc:'Le plus grand sorcier depuis Merlin, directeur bien-aimé de Poudlard. Vainqueur de Grindelwald, détenteur de la Baguette de Sureau. Son phénix Fumseck chante une mélodie qui redonne courage. Ses plans menés en secret sur plusieurs décennies auront finalement sauvé tout le monde de la magie.',r:'légendaire',p:350},
{id:'hp05',name:'Voldemort',uni:'Harry Potter',uk:'hp',em:'💀',em2:'🐍',color:'#7f8c8d',gc:'#aab7b8',desc:'Tom Jedusor, devenu Lord Voldemort, est le sorcier le plus redouté de tous les temps. Ses yeux rouges en fente et son visage sans nez témoignent du prix payé pour l\'immortalité via ses sept Horcruxes. Seul l\'amour maternel de Lily Potter peut contrecarrer sa puissance absolue.',r:'légendaire',p:350},
{id:'hp06',name:'Severus Rogue',uni:'Harry Potter',uk:'hp',em:'🧪',em2:'🖤',color:'#566573',gc:'#717d7e',desc:'Professeur de Potions, Severus Rogue est le personnage le plus ambigu de Poudlard. Son double jeu d\'espion pour Dumbledore l\'a rendu haïssable aux yeux de Harry pendant des années. Amoureux secret de Lily Potter depuis l\'enfance, son sacrifice ultime reste le plus poignant de la saga.',r:'épique',p:230},
{id:'hp07',name:'Rubeus Hagrid',uni:'Harry Potter',uk:'hp',em:'🐉',em2:'🌲',color:'#795548',gc:'#a0522d',desc:'Gardien des Clés de Poudlard, Hagrid est le premier à révéler à Harry sa véritable identité de sorcier. D\'une taille gigantesque, fils d\'un géant, il est aussi doux que son apparence est imposante. Passionné des créatures magiques, il élève dragons et hippogriffes avec un amour sans bornes.',r:'rare',p:150},
{id:'hp08',name:'Drago Malefoy',uni:'Harry Potter',uk:'hp',em:'🐍',em2:'🪄',color:'#7f8c8d',gc:'#95a5a6',desc:'Fils de Lucius Malefoy, Drago est le rival de Harry à Poudlard et fier membre de Serpentard. Ses cheveux platine et son sourire arrogant le rendent antipathique. Pourtant, il est tiraillé entre la peur de son père et ses propres convictions, et refusera finalement de commettre l\'irréparable.',r:'rare',p:150},
{id:'hp09',name:'Sirius Black',uni:'Harry Potter',uk:'hp',em:'⭐',em2:'🐺',color:'#2c3e50',gc:'#3498db',desc:'Parrain de Harry et meilleur ami de James Potter, Sirius est un Animagus se transformant en grand chien noir. Injustement emprisonné à Azkaban pendant douze ans, il en est le premier évadé de l\'histoire. Rebelle et courageux, sa mort dans le Département des Mystères brisera le coeur de Harry.',r:'épique',p:230},
{id:'hp10',name:'Dobby',uni:'Harry Potter',uk:'hp',em:'🧦',em2:'👂',color:'#e67e22',gc:'#f39c12',desc:'Elfe de maison libre, Dobby est l\'une des créatures les plus aimées de tout l\'univers Harry Potter. Affranchi par Harry grâce à une chaussette, ses grands yeux verts et ses oreilles de chauve-souris le rendent irrésistible. Il mourra en sauvant Harry et ses amis. Dobby est libre !',r:'commun',p:90},
{id:'hp11',name:'Luna Lovegood',uni:'Harry Potter',uk:'hp',em:'🌙',em2:'🦋',color:'#f8e71c',gc:'#f9e34b',desc:'Surnommée la Cinglée, Luna est l\'élève la plus originale de Serdaigle. Ses grands yeux rêveurs et son collier de bouchons voient le monde d\'une façon unique. Membre fondatrice de l\'Armée de Dumbledore, sa loyauté envers Harry et sa sérénité face au danger en font une alliée précieuse.',r:'rare',p:150},
{id:'hp12',name:'Bellatrix Lestrange',uni:'Harry Potter',uk:'hp',em:'🌀',em2:'🖤',color:'#6c0000',gc:'#c0392b',desc:'La plus fanatique des Mangemorts, Bellatrix voue une dévotion absolue à Voldemort. Emprisonnée à Azkaban pendant quatorze ans, elle s\'en échappe pour reprendre sa place. Ses cheveux noirs sauvages et son regard fou expriment une folie meurtrière. Elle tuera Sirius Black lors de la Bataille du Département des Mystères.',r:'épique',p:230},
{id:'sw01',name:'Luke Skywalker',uni:'Star Wars',uk:'sw',em:'💙',em2:'⚔️',color:'#3498db',gc:'#5dade2',desc:'Fils d\'Anakin Skywalker, élevé sur Tatooine, Luke est le Jedi qui vaincra l\'Empire Galactique. Formé par Maître Yoda sur Dagobah, il manie son sabre laser vert avec maîtrise. Son amour filial et sa foi en la rédemption de son père permettront la chute de l\'Empereur Palpatine.',r:'épique',p:230},
{id:'sw02',name:'Dark Vador',uni:'Star Wars',uk:'sw',em:'😤',em2:'🔴',color:'#c0392b',gc:'#e74c3c',desc:'Autrefois Anakin Skywalker, chevalier Jedi prometteur, il bascule dans le Côté Obscur. Son armure noire, son masque respiratoire et son sabre laser rouge sont les symboles absolus du mal intergalactique. Sa respiration est l\'un des sons les plus reconnaissables du cinéma. Il choisira finalement la lumière pour sauver Luke.',r:'légendaire',p:350},
{id:'sw03',name:'Maître Yoda',uni:'Star Wars',uk:'sw',em:'🧘',em2:'💚',color:'#27ae60',gc:'#2ecc71',desc:'Grand Maître Jedi depuis 800 ans, Yoda est l\'être le plus sage dans la Force de toute la galaxie. Petit être vert de 900 ans, il parle en inversant sa syntaxe. Même à l\'article de la mort, il peut soulever un X-Wing par la Force. Sa connexion à la Force dépasse tout ce qu\'un humain peut concevoir.',r:'légendaire',p:350},
{id:'sw04',name:'Princesse Leia',uni:'Star Wars',uk:'sw',em:'👸',em2:'⭐',color:'#ecf0f1',gc:'#bdc3c7',desc:'Princesse d\'Alderaan, sénatrice et Générale de la Rébellion. Ses deux chignons en macarons sont devenus iconiques. Soeur jumelle de Luke Skywalker et fille secrète de Dark Vador, elle dirige la Résistance avec courage et stratégie. Forte sensible à la Force, elle aurait pu devenir Jedi.',r:'épique',p:230},
{id:'sw05',name:'Han Solo',uni:'Star Wars',uk:'sw',em:'🎲',em2:'🔫',color:'#795548',gc:'#a0522d',desc:'Contrebandier légendaire, capitaine du Faucon Millenium. Cynique et individualiste au départ, il devient un héros majeur de la Rébellion. Son Blaster DL-44 ne quitte jamais sa hanche. Son amitié avec Chewbacca est indéfectible depuis des décennies de voyages dans le vaisseau le plus rapide de la galaxie.',r:'rare',p:150},
{id:'sw06',name:'Chewbacca',uni:'Star Wars',uk:'sw',em:'🐻',em2:'🔫',color:'#795548',gc:'#a0522d',desc:'Wookiee de Kashyyyk, copilote loyal de Han Solo depuis des décennies. Son cri inimitable exprime une gamme d\'émotions surprenante. Fort comme dix hommes et mécanicien hors pair, sa bandoulière et son arbalète laser sont ses seuls accessoires. Sa loyauté wookiee envers ses amis est absolue et indéfectible.',r:'rare',p:150},
{id:'sw07',name:'R2-D2',uni:'Star Wars',uk:'sw',em:'🤖',em2:'🔵',color:'#3498db',gc:'#5dade2',desc:'Droïde astromec, R2-D2 transporte les plans de l\'Étoile de la Mort dans sa mémoire. Son dôme bleu et blanc, ses sifflements et bips expressifs communiquent avec une clarté absolue. Courageux et débrouillard, il sauve la mise dans chaque situation critique grâce à ses nombreux outils cachés.',r:'rare',p:150},
{id:'sw08',name:'C-3PO',uni:'Star Wars',uk:'sw',em:'🤖',em2:'🟡',color:'#f39c12',gc:'#f9c12d',desc:'Droïde de protocole qui parle plus de six millions de formes de communication. Son corps doré et ses yeux lumineux rouges sont immédiatement reconnaissables. Pessimiste chronique, il calcule les probabilités de survie avec une précision désespérante mais s\'en sort toujours. Son amitié avec R2-D2 traverse toute la saga.',r:'rare',p:150},
{id:'sw09',name:'Grogu',uni:'Star Wars',uk:'sw',em:'💚',em2:'✋',color:'#27ae60',gc:'#00e676',desc:'Surnommé Bébé Yoda, Grogu est un mystérieux enfant de 50 ans de la même espèce que Yoda. Ses énormes oreilles vertes et ses grands yeux marron attendrissants en font la créature la plus adorable de la galaxie. Doté d\'un puissant lien avec la Force, le Mandalorien le protège au péril de sa vie.',r:'légendaire',p:350},
{id:'sw10',name:'Le Mandalorien',uni:'Star Wars',uk:'sw',em:'🪖',em2:'🚀',color:'#7f8c8d',gc:'#aab7b8',desc:'Guerrier de Mandalore suivant le Code de la Voie avec une rigueur absolue. Son armure en Beskar, métal quasi-indestructible, le protège de tout. Chasseur de primes redouté, il devient le protecteur inattendu du petit Grogu, créant un lien père-fils unique. C\'est la Voie.',r:'légendaire',p:350},
{id:'sw11',name:'Obi-Wan Kenobi',uni:'Star Wars',uk:'sw',em:'🧔',em2:'💙',color:'#3498db',gc:'#74b9ff',desc:'Maître Jedi exemplaire, Obi-Wan Kenobi forma Anakin Skywalker avant de le voir sombrer. Exilé sur Tatooine pour surveiller Luke, il se sacrifie face à Dark Vador et devient un avec la Force. Sa sagesse et son calme olympien en font l\'archétype du chevalier Jedi idéal.',r:'épique',p:230},
{id:'sw12',name:'Stormtrooper',uni:'Star Wars',uk:'sw',em:'🪖',em2:'⚪',color:'#ecf0f1',gc:'#aab7b8',desc:'Soldat impérial standard de l\'Empire Galactique. Son armure blanche en plastoid est aussi reconnaissable que sa précision de tir... discutable. Anonyme dans la foule, il représente la force brute du régime de l\'Empereur. Issu du programme de clonage de Jango Fett, puis recruté parmi la population.',r:'commun',p:90},
{id:'sw13',name:'Boba Fett',uni:'Star Wars',uk:'sw',em:'🎯',em2:'🪖',color:'#27ae60',gc:'#2ecc71',desc:'Chasseur de primes légendaire portant l\'armure mandalorienne de son père Jango. Peu disert, totalement efficace, il traque ses cibles avec patience redoutable. Sa jetpack et ses câbles de capture font de lui une machine de guerre mobile. Ayant survécu au Sarlacc de Tatooine, il règne finalement comme Daimyo.',r:'légendaire',p:350},
{id:'sw14',name:'Rey',uni:'Star Wars',uk:'sw',em:'☀️',em2:'⚔️',color:'#f1c40f',gc:'#f4d03f',desc:'Solitaire de Jakku, Rey découvre ses pouvoirs en affrontant Kylo Ren. Mécanicienne de génie, elle pilote le Faucon Millenium parfaitement sans jamais l\'avoir piloté avant. Ses trois chignons caractéristiques sont sa marque de fabrique. Dernière des Skywalker par choix, elle enterre les sabres de Luke et Leia sur Tatooine.',r:'épique',p:230},
{id:'sw15',name:'Kylo Ren',uni:'Star Wars',uk:'sw',em:'⚔️',em2:'🖤',color:'#8e44ad',gc:'#c0392b',desc:'Ben Solo, fils de Han et de Leia, trahit l\'Ordre Jedi pour le Premier Ordre. Son sabre laser rouge à garde croisée instable est aussi imprévisible que son caractère. Déchiré entre Lumière et Obscurité, il vénère le masque fondu de Dark Vador. Sa rédemption finale lors de la Bataille d\'Exégol est inoubliable.',r:'épique',p:230},
{id:'sw16',name:'Empereur Palpatine',uni:'Star Wars',uk:'sw',em:'⚡',em2:'💀',color:'#7f0000',gc:'#c0392b',desc:'Dark Sidious, Maître Sith ayant orchestré la chute de la République et l\'Ordre 66. Sa capuche noire dissimule son visage corrompu par le côté obscur. Ses éclairs de Force cuisent ses ennemis. Manipulateur ultime, il a régné en secret depuis des décennies. Son rire glaçant résonne dans toute la galaxie.',r:'légendaire',p:350},
{id:'sw17',name:'Dark Maul',uni:'Star Wars',uk:'sw',em:'😈',em2:'⚔️',color:'#c0392b',gc:'#e74c3c',desc:'Apprenti Sith de Dark Sidious, Maul est un Zabrak au visage tatoué de noir et rouge couronné de cornes. Son sabre laser à double lame rouge fait de lui un combattant redoutable et acrobatique. Tué par Obi-Wan sur Naboo, il survivra miraculeusement avec des jambes mécaniques pour traquer sa vengeance.',r:'légendaire',p:350},
{id:'nj01',name:'Lloyd – Ninja Vert',uni:'Ninjago',uk:'nj',em:'💚',em2:'⚔️',color:'#27ae60',gc:'#00e676',desc:'Fils de Lord Garmadon et petit-fils du Grand Maître Wu, Lloyd est le Ninja Vert Ultime prédestiné. Maître de l\'Énergie et du Spinjitzu, il libère un tourbillon vert dévastateur. Son amour pour son père et sa foi en la rédemption font de lui le coeur battant de toute l\'équipe des Ninja.',r:'légendaire',p:350},
{id:'nj02',name:'Kai – Maître du Feu',uni:'Ninjago',uk:'nj',em:'🔥',em2:'⚔️',color:'#e74c3c',gc:'#ff5252',desc:'Forgeron impulsif devenu Ninja du Feu, Kai est le combattant le plus offensif de l\'équipe. Protecteur de sa soeur Nya, sa colère se transforme en flammes purificatrices au combat. Son bandeau rouge et ses épées enflammées sont ses marques de fabrique emblématiques de tout Ninjago.',r:'épique',p:230},
{id:'nj03',name:'Zane le Nindroid',uni:'Ninjago',uk:'nj',em:'❄️',em2:'🤖',color:'#bdc3c7',gc:'#ecf0f1',desc:'Robot ninja à l\'apparence humaine, Zane est le Ninja de la Glace créé par le Dr Julien. Logique, calme et précis, ses techniques figent les ennemis en une fraction de seconde. Sa capacité à ignorer la douleur et sa dévotion absolue envers ses amis en font un pilier essentiel de l\'équipe.',r:'épique',p:230},
{id:'nj04',name:'Cole – Maître de la Terre',uni:'Ninjago',uk:'nj',em:'🪨',em2:'⚫',color:'#566573',gc:'#717d7e',desc:'Fils d\'un maître de danse, Cole cache sous son sérieux un talent pour la danse et la cuisine. Ninja de la Terre le plus fort physiquement, ses poings brisent des rochers entiers. Sa loyauté tranquille envers ses frères ninja, jamais spectaculaire mais toujours présente, est le fondement de l\'équipe.',r:'rare',p:150},
{id:'nj05',name:'Jay – Maître de la Foudre',uni:'Ninjago',uk:'nj',em:'⚡',em2:'💙',color:'#3498db',gc:'#5dade2',desc:'Le plus bavard et le plus drôle des ninja est aussi l\'un des plus ingénieux. Maître de la Foudre, il peut appeler des éclairs dévastateurs. Amoureux de Nya depuis le début, inventeur dans l\'âme, il améliore constamment les véhicules. Sous l\'humour se cache un guerrier capable de tout sacrifier.',r:'rare',p:150},
{id:'nj06',name:'Nya – Maîtresse de l\'Eau',uni:'Ninjago',uk:'nj',em:'💧',em2:'🌊',color:'#00bcd4',gc:'#00e5ff',desc:'Soeur de Kai, d\'abord la mystérieuse Samouraï X avant de découvrir ses pouvoirs aquatiques. Maîtresse de l\'Eau, elle contrôle les océans et crée des vagues titanesques. Son sacrifice final, fusionnant avec l\'océan pour sauver Ninjago, reste l\'un des moments les plus émouvants de la série.',r:'épique',p:230},
{id:'nj07',name:'Maître Wu',uni:'Ninjago',uk:'nj',em:'🎋',em2:'☯️',color:'#f1c40f',gc:'#f4d03f',desc:'Grand Maître de Ninjago, fils du Premier Spinjitzu Maître, Wu a formé toutes les générations de Ninja. Son chapeau conique blanc, son bâton et sa longue barbe blanche sont ses signes distinctifs absolus. Ses conseils semblent absurdes mais s\'avèrent toujours précieux. Le thé résout tout.',r:'légendaire',p:350},
{id:'nj08',name:'Seigneur Garmadon',uni:'Ninjago',uk:'nj',em:'💀',em2:'🖤',color:'#6c0000',gc:'#c0392b',desc:'Frère de Wu corrompu par le venin du Grand Serpent Anacondraï, Garmadon est le Seigneur des Ténèbres. Dans sa forme ultime à quatre bras, il manie quatre armes simultanément. Père aimant malgré tout, son amour pour Lloyd l\'amènera finalement vers la rédemption et le bien.',r:'légendaire',p:350},
{id:'nj09',name:'Garmadon Quatre Bras',uni:'Ninjago',uk:'nj',em:'👹',em2:'💥',color:'#4a0080',gc:'#9b59b6',desc:'La forme ultime de Lord Garmadon, dotée de quatre bras maniant les quatre armes des Ninja d\'Or simultanément. Résultat du venin corrupteur de tous les grands serpents de Ninjago. Tenue violette et rouge, yeux rouges brillants : la manifestation physique du mal absolu dans Ninjago.',r:'mythique',p:500},
{id:'nj10',name:'Pythor',uni:'Ninjago',uk:'nj',em:'🐍',em2:'💜',color:'#9b59b6',gc:'#bb8fce',desc:'Dernier survivant de la tribu Anacondraï, Pythor est le roi des serpents de Ninjago. Silencieux et rusé comme un cobra, il tisse ses intrigues dans l\'ombre depuis des siècles. Sa capacité à se rendre invisible lui permet de frapper sans être vu. Blanc aux yeux jaunes en fente, il incarne la trahison.',r:'épique',p:230},
{id:'nj11',name:'Morro',uni:'Ninjago',uk:'nj',em:'👻',em2:'💨',color:'#27ae60',gc:'#69f0ae',desc:'Ancien élève favori de Maître Wu, Morro croyait être l\'Élu Ninja Vert. Quand Lloyd fut choisi, il en mourut de honte et devint le Fantôme du Vent. Ses pouvoirs sur le vent et sa capacité à posséder les corps en font un ennemi redoutable. Son arc narratif donne une profondeur émotionnelle rare.',r:'épique',p:230},
{id:'nj12',name:'Skylor',uni:'Ninjago',uk:'nj',em:'🟠',em2:'🎯',color:'#e67e22',gc:'#f39c12',desc:'Fille du Maître Chen, Skylor est une Maîtresse de l\'Ambre au pouvoir unique : copier les pouvoirs élémentaires de tous ceux qu\'elle touche. D\'abord agent de son père, elle choisit le bien par amour pour Kai. Ses cheveux orange et sa tenue assortie la rendent immédiatement reconnaissable.',r:'rare',p:150},
{id:'nj13',name:'Ronin',uni:'Ninjago',uk:'nj',em:'⚔️',em2:'🎭',color:'#7f8c8d',gc:'#95a5a6',desc:'Mercenaire mystérieux aux motivations floues, Ronin vit selon ses propres règles. Ni ami, ni ennemi, il aide les Ninja quand ses intérêts l\'y poussent. Son apparence usée et sa cicatrice racontent une longue vie de batailles. Malgré sa façade mercenaire, il possède un code d\'honneur bien à lui.',r:'rare',p:150},
{id:'fr01',name:'Elsa',uni:'Reine des Neiges',uk:'fr',em:'❄️',em2:'💙',color:'#74b9ff',gc:'#a8d8ff',desc:'Reine d\'Arendelle dotée du pouvoir de créer glace et neige, Elsa vécut longtemps dans la peur de sa propre magie. Libérée, délivrée est son hymne à la liberté. Sa tresse blonde et sa robe de glace bleue en font la princesse Disney la plus iconique de sa génération. Seul l\'amour d\'Anna peut faire fondre la glace.',r:'légendaire',p:350},
{id:'fr02',name:'Anna',uni:'Reine des Neiges',uk:'fr',em:'🌸',em2:'💚',color:'#27ae60',gc:'#69f0ae',desc:'Princesse d\'Arendelle et soeur cadette d\'Elsa, Anna est la définition de l\'optimisme et de la générosité. Ses taches de rousseur, ses deux nattes rousses et son énergie inépuisable en font un personnage adorable. Son sacrifice ultime, s\'interposer entre Elsa et l\'épée de Hans, constitue l\'acte d\'amour véritable.',r:'rare',p:150},
{id:'fr03',name:'Olaf',uni:'Reine des Neiges',uk:'fr',em:'⛄',em2:'☀️',color:'#74b9ff',gc:'#d0e8ff',desc:'Bonhomme de neige créé par la magie d\'Elsa, Olaf est l\'innocence pure faite de neige et de rêves. Ses bras en brindilles, sa carotte-nez et ses dents irrégulières le rendent attendrissant. Il rêve de voir l\'été sans réaliser que cela le ferait fondre. Philosophe candide, ses répliques sur l\'amour sont inoubliables.',r:'commun',p:90},
{id:'fr04',name:'Kristoff',uni:'Reine des Neiges',uk:'fr',em:'⛏️',em2:'🦌',color:'#8B5E3C',gc:'#c49a50',desc:'Vendeur de glace et montagnard solitaire élevé par les trolls de cristal, Kristoff est bourru mais au coeur d\'or. Son meilleur ami est son renne Sven, à qui il prête une voix dans des conversations imaginaires. Amoureux maladroit d\'Anna, il lui offre un amour sincère, patient et inconditionnel.',r:'rare',p:150},
{id:'fr05',name:'Sven',uni:'Reine des Neiges',uk:'fr',em:'🦌',em2:'🥕',color:'#8B5E3C',gc:'#d4a870',desc:'Renne fidèle et loyal de Kristoff, Sven est l\'ami animal le plus attachant de tout Disney. Ses grands yeux expressifs et son immense nez rouge le font ressembler davantage à un chien. Il comprend chaque mot de Kristoff et partage ses carottes avec lui. Sa bravoure face aux loups est touchante.',r:'commun',p:90},
{id:'fr06',name:'Marshmallow',uni:'Reine des Neiges',uk:'fr',em:'🧊',em2:'❄️',color:'#74b9ff',gc:'#cce8ff',desc:'Géant de glace créé par Elsa pour garder son palais, Marshmallow est une masse terrifiante aux pointes acérées. Docile tant qu\'on ne l\'agace pas, il devient incontrôlable en mode rage. Son nom attendrissant contraste totalement avec son apparence. Il finit par se proclamer roi du palais de glace.',r:'épique',p:230},
{id:'fr07',name:'Hans',uni:'Reine des Neiges',uk:'fr',em:'🤴',em2:'⚔️',color:'#8B0000',gc:'#d4a017',desc:'Prince de la Sothène Méridionale, Hans cache sous son charme une ambition froide et calculatrice. Treizième fils de sa famille royale, il cherche un trône à tout prix. Sa trahison d\'Anna au moment le plus critique reste l\'un des moments les plus choquants de tout l\'univers Disney.',r:'rare',p:150},
{id:'mk01',name:'Mickey Mouse',uni:'Mickey & Amis',uk:'mk',em:'🐭',em2:'⭐',color:'#1a1a1a',gc:'#e8c88a',desc:'Créé par Walt Disney en 1928, Mickey Mouse est la star la plus célèbre du monde de l\'animation. Ses grandes oreilles rondes noires, son museau blanc et ses gants blancs sont reconnaissables partout dans le monde. Curieux, courageux et optimiste, Mickey incarne l\'esprit pionnier de Disney depuis près d\'un siècle.',r:'légendaire',p:350},
{id:'mk02',name:'Minnie Mouse',uni:'Mickey & Amis',uk:'mk',em:'🎀',em2:'💕',color:'#c0392b',gc:'#ff69b4',desc:'Petite amie de Mickey depuis leurs débuts en 1928, Minnie est la plus élégante des personnages Disney. Son grand noeud à pois rouges et blancs et sa robe assortie en font une icône de mode intemporelle. Douce, espiègle et passionnée, elle a son étoile sur le Hollywood Walk of Fame depuis 2018.',r:'légendaire',p:350},
{id:'mk03',name:'Donald Duck',uni:'Mickey & Amis',uk:'mk',em:'🦆',em2:'⚓',color:'#1a3a6a',gc:'#3498db',desc:'Canard au costume marin et au caractère explosif, Donald Duck est le roi de la comédie Disney. Son bec aplati, sa voix nasillarde et sa colère légendaire en font un personnage absolument unique. Malgré ses sautes d\'humeur, Donald est profondément loyal et amoureux éperdu de Daisy. Oscar en 1943.',r:'épique',p:230},
{id:'mk04',name:'Daisy Duck',uni:'Mickey & Amis',uk:'mk',em:'💐',em2:'💜',color:'#e91e8c',gc:'#ff69b4',desc:'Petite amie de Donald Duck et meilleure amie de Minnie, Daisy est la coquette des personnages Disney. Son grand noeud violet et son élégance naturelle contrastent avec le tempérament volcanique de Donald. Autonome et sophistiquée, elle brille dans ses propres aventures avec un caractère fort et affirmé.',r:'épique',p:230},
{id:'mk05',name:'Dingo',uni:'Mickey & Amis',uk:'mk',em:'🐶',em2:'🎩',color:'#1a6a1a',gc:'#2ecc71',desc:'Grand nigaud au coeur d\'or, Dingo est l\'ami le plus loyal et le plus maladroit de Mickey depuis les années 30. Son grand chapeau vert et sa gaucherie légendaire lui valent autant de rires que d\'affection. Père touchant de Max dans Dingo et Max, il produit les courts-métrages sportifs les plus hilarants de Disney.',r:'rare',p:150},
{id:'mk06',name:'Pluto',uni:'Mickey & Amis',uk:'mk',em:'🐕',em2:'🦴',color:'#d4a030',gc:'#f1c40f',desc:'Chien fidèle et affectueux de Mickey Mouse, Pluto est l\'un des rares personnages Disney à se comporter comme un vrai animal. Contrairement aux autres qui parlent, Pluto exprime tout par ses mimiques et aboiements. Son pelage jaune vif et sa queue remuante expriment une joie de vivre communicative.',r:'commun',p:90},
{id:'mk07',name:'Tic et Tac',uni:'Mickey & Amis',uk:'mk',em:'🐿️',em2:'🌰',color:'#8B5E3C',gc:'#d4a870',desc:'Duo légendaire d\'écureuils créé par Disney en 1943. Tic se reconnaît à son nez rouge arrondi et Tac à son nez noir. Brun-roux avec leur ventre crème, ils enchaînent les chamailleries et collaborent comme détectives privés dans leur série Tic et Tac, les rangers du risque. Leur amitié indéfectible cache mille petites disputes irrésistibles.',r:'rare',p:150},
{id:'mk08',name:'Pat Hibulaire',uni:'Mickey & Amis',uk:'mk',em:'🐺',em2:'😈',color:'#1a1a1a',gc:'#7f8c8d',desc:'Némesis classique de Mickey Mouse depuis 1925, Pat Hibulaire est l\'un des plus anciens méchants Disney encore actifs. Grand, costaud, avec son chapeau melon noir et son embonpoint caractéristique, il enchaîne les coups fourrés sans jamais réussir à vaincre Mickey. Plus comique que vraiment dangereux, il est l\'antagoniste idéal des aventures.',r:'rare',p:150},
{id:'mv01',name:'Spider-Man',uni:'Marvel',uk:'mv',em:'🕷️',em2:'🕸️',color:'#c0392b',gc:'#e74c3c',desc:'Lycéen new-yorkais mordu par une araignée radioactive, Peter Parker devient Spider-Man. Sa combinaison rouge et bleue est l\'une des plus reconnaissables de la culture pop mondiale. Il peut tisser des toiles, grimper aux murs, et son sens araignée le prévient du danger. Un grand pouvoir implique de grandes responsabilités.',r:'légendaire',p:350},
{id:'mv02',name:'Iron Man',uni:'Marvel',uk:'mv',em:'🦾',em2:'💥',color:'#c0392b',gc:'#f39c12',desc:'Tony Stark, génie milliardaire, crée sa première armure dans une grotte afghane. Son Arc Réacteur alimente ses armures successives de plus en plus perfectionnées. Je suis Iron Man, dit-il avant le claquement de doigts qui sacrifice sa vie pour l\'humanité. Son héritage : Pepper, Morgan, et un univers sauvé de Thanos.',r:'légendaire',p:350},
{id:'mv03',name:'Capitaine América',uni:'Marvel',uk:'mv',em:'🛡️',em2:'🇺🇸',color:'#1a3a8a',gc:'#3498db',desc:'Steve Rogers, frêle jeune homme du Brooklyn des années 40, reçoit le sérum du super-soldat. Son bouclier en vibranium rouge, blanc et bleu est arme et protection absolue. Leader moral des Avengers, il vit finalement la vie méritée avec Peggy Carter après un voyage dans le temps.',r:'légendaire',p:350},
{id:'mv04',name:'Thor',uni:'Marvel',uk:'mv',em:'⚡',em2:'🔨',color:'#1a2a4a',gc:'#f1c40f',desc:'Dieu du Tonnerre d\'Asgard, fils d\'Odin. Son marteau Mjolnir ne peut être manié que par celui qui en est digne. Maîtrisant la foudre, il découvre que sa vraie force était en lui depuis toujours. Son Stormbreaker, hache forgée du bois de Groot, peut blesser même Thanos armé de toutes les Pierres.',r:'légendaire',p:350},
{id:'mv05',name:'Hulk',uni:'Marvel',uk:'mv',em:'💚',em2:'💥',color:'#1a7a1a',gc:'#27ae60',desc:'Dr Bruce Banner exposé aux rayons gamma se transforme en Hulk dès qu\'il est en colère. Plus il est en colère, plus il est fort. Vert, massif et au pantalon violet déchiré, Hulk est la force brute des Avengers. HULK SMASH ! Dans Endgame, il unifie enfin cerveau de Banner et force de Hulk.',r:'épique',p:230},
{id:'mv06',name:'Veuve Noire',uni:'Marvel',uk:'mv',em:'🕸️',em2:'🔴',color:'#0d0d0d',gc:'#c0392b',desc:'Natasha Romanoff, formée dans le programme secret Salle Rouge, est la meilleure espionne du monde. Sans super-pouvoirs, elle égale les Avengers par sa formation et sa ruse. Ses cheveux roux et sa combinaison noire sont ses marques. Son sacrifice sur Vormir pour la Pierre de l\'Âme est déchirant.',r:'épique',p:230},
{id:'mv07',name:'Thanos',uni:'Marvel',uk:'mv',em:'💜',em2:'🪙',color:'#4a2070',gc:'#9b59b6',desc:'Seigneur de guerre né sur Titan, convaincu que l\'univers surpeuplé court à sa perte. Il rassemble les six Pierres d\'Infinité dans son Gant doré pour effacer la moitié de toute vie d\'un simple claquement de doigts. Violet et massif, il est à la fois terrifiant et, de son point de vue, presque logique.',r:'mythique',p:500},
{id:'mv08',name:'Panthère Noire',uni:'Marvel',uk:'mv',em:'🐾',em2:'👑',color:'#0d0d14',gc:'#d4a017',desc:'T\'Challa, roi de Wakanda, nation africaine la plus avancée grâce au vibranium. Sa combinaison en vibranium absorbe l\'énergie des coups pour la relâcher brutalement. Guerrier, diplomate, scientifique et roi, il représente l\'excellence africaine au plus haut niveau. Wakanda Forever !',r:'épique',p:230},
{id:'mv09',name:'Wolverine',uni:'Marvel',uk:'mv',em:'🔪',em2:'⚡',color:'#f39c12',gc:'#f1c40f',desc:'Logan, mutant du XIXe siècle aux os recouverts d\'adamantium par un programme gouvernemental secret. Ses trois griffes rétractables par main sont ses armes légendaires. Sa guérison accélérée le rend quasiment immortel. Je suis le meilleur dans ce que je fais. Sa combinaison jaune et noire est son uniforme iconique.',r:'épique',p:230},
{id:'mv10',name:'Docteur Strange',uni:'Marvel',uk:'mv',em:'✨',em2:'🔮',color:'#1a2060',gc:'#9b59b6',desc:'Dr Stephen Strange, neurochirurgien arrogant, découvre les arts mystiques après un accident. Gardien de l\'Oeil d\'Agamotto et Maître Sorcier Suprême. Sa Cape d\'Élévation animée le transporte partout. Analysant 14 millions de futurs, il trouve l\'unique chemin vers la victoire contre Thanos.',r:'légendaire',p:350},
{id:'mv11',name:'Sorcière Rouge',uni:'Marvel',uk:'mv',em:'🔮',em2:'💗',color:'#8B0000',gc:'#c0392b',desc:'Wanda Maximoff possède des pouvoirs de télékinésie et manipulation de la réalité amplifiés par une Pierre d\'Infinité. En Sorcière Rouge, elle est la force magique la plus puissante du MCU. Sa douleur après la perte de Vision est immense. Sa puissance sans limite la rend terrifiante.',r:'mythique',p:500},
{id:'mv12',name:'Loki',uni:'Marvel',uk:'mv',em:'🐍',em2:'💚',color:'#0d2d0d',gc:'#2ecc71',desc:'Dieu de la Ruse et frère adoptif de Thor, Loki est le personnage le plus nuancé du MCU. Tour à tour antagoniste et allié, traître et héros, il finit par se sacrifier pour Thor. Sa cape verte et ses cornes dorées sont immédiatement reconnaissables. Sa série Disney+ lui offre sa rédemption complète.',r:'épique',p:230},
{id:'mv13',name:'War Machine',uni:'Marvel',uk:'mv',em:'🤖',em2:'🔫',color:'#7f8c8d',gc:'#95a5a6',desc:'James Rhodes, alias War Machine, est le meilleur ami d\'Iron Man et son équivalent militaire. Son armure grise massive est équipée de gros canons mitrailleurs sur les épaules. Lieutenant-colonel de l\'US Air Force, sa rigueur militaire complète parfaitement le génie chaotique de Tony Stark. Soldat avant d\'être super-héros.',r:'épique',p:230},
{id:'mv14',name:'Venom',uni:'Marvel',uk:'mv',em:'🖤',em2:'👅',color:'#1a1a1a',gc:'#3d3d3d',desc:'Symbiote extraterrestre fusionné avec Eddie Brock, Venom est un anti-héros aussi terrifiant qu\'attachant. Sa peau noire luisante, sa langue serpentine et ses crocs blancs en font une créature cauchemardesque. Ancien ennemi de Spider-Man, il devient un protecteur des innocents à sa manière brutale. Nous sommes Venom.',r:'légendaire',p:350},
{id:'mv15',name:'Vision',uni:'Marvel',uk:'mv',em:'💎',em2:'🟥',color:'#c0392b',gc:'#e74c3c',desc:'Androïde synthétique créé par Tony Stark et Ultron, Vision possède la Pierre de l\'Esprit incrustée sur le front. Sa peau pourpre et son cape jaune le rendent unique. Capable de modifier sa densité et de voler, sa relation avec la Sorcière Rouge est l\'une des plus touchantes de l\'univers Marvel.',r:'légendaire',p:350},
{id:'mv16',name:'Captain Marvel',uni:'Marvel',uk:'mv',em:'⭐',em2:'💫',color:'#f1c40f',gc:'#3498db',desc:'Carol Danvers, alias Captain Marvel, est l\'une des super-héroïnes les plus puissantes de Marvel. Son uniforme rouge, bleu et or et sa coupe courte blonde caractéristique ne laissent personne indifférent. Capable de voler à la vitesse de la lumière, ses pouvoirs énergétiques sont d\'origine Kree. Plus haut, plus loin, plus vite.',r:'légendaire',p:350},
{id:'mv17',name:'Hawkeye',uni:'Marvel',uk:'mv',em:'🏹',em2:'🎯',color:'#7d3c98',gc:'#9b59b6',desc:'Clint Barton, alias Hawkeye, est l\'archer parfait des Avengers. Son uniforme violet noir, son arc et son carquois rempli de flèches techniques en font le tireur ultime. Mortel à n\'importe quelle distance, son humour pince-sans-rire et son humanité parmi des dieux et monstres en font un héros relatable et attachant.',r:'épique',p:230},
{id:'mv18',name:'Ant-Man',uni:'Marvel',uk:'mv',em:'🐜',em2:'🔴',color:'#c0392b',gc:'#1a1a1a',desc:'Scott Lang, alias Ant-Man, peut rétrécir à la taille d\'une fourmi tout en gardant la force d\'un homme. Son costume rouge et noir avec son casque rond aux antennes de scarabée est emblématique. Ancien voleur reconverti en super-héros, sa relation avec sa fille Cassie est le cœur de tous ses arcs narratifs.',r:'épique',p:230},
{id:'mv19',name:'La Guêpe',uni:'Marvel',uk:'mv',em:'🐝',em2:'⚡',color:'#f1c40f',gc:'#1a1a1a',desc:'Hope Van Dyne, alias La Guêpe, partenaire d\'Ant-Man avec qui elle partage la technologie Pym. Son uniforme jaune et noir avec ses ailes mécaniques et ses canons à plasma sur les poignets en font une combattante redoutable. Plus structurée et expérimentée que Scott Lang, elle est l\'élément stratégique du duo.',r:'épique',p:230},
{id:'mv20',name:'Miss Marvel',uni:'Marvel',uk:'mv',em:'💪',em2:'🌙',color:'#c0392b',gc:'#3498db',desc:'Kamala Khan, alias Miss Marvel, est la première super-héroïne musulmane américaine de Marvel. Son uniforme rouge bleu et or, inspiré de Captain Marvel son idole, est porté avec fierté. Capable d\'allonger ses membres et de se transformer, ses origines pakistanaises et ses pouvoirs Inhumans en font une héroïne moderne et inspirante.',r:'rare',p:150},
{id:'mv21',name:'Docteur Octopus',uni:'Marvel',uk:'mv',em:'🐙',em2:'🦾',color:'#27ae60',gc:'#2ecc71',desc:'Otto Octavius, brillant scientifique nucléaire devenu fou après un accident l\'a fusionné à quatre tentacules métalliques. Ses bras robotiques télescopiques avec pinces sont contrôlés par sa pensée. Lunettes rondes et coupe en bol caractéristiques, il reste l\'un des ennemis les plus iconiques de Spider-Man dans toutes les versions.',r:'épique',p:230},
{id:'mv22',name:'Homme sable',uni:'Marvel',uk:'mv',em:'🏖️',em2:'💨',color:'#d4a017',gc:'#f4d03f',desc:'Flint Marko, alias Sandman, peut transformer son corps en sable et adopter n\'importe quelle forme. Sa silhouette sableuse jaune dorée le rend insaisissable. Tantôt ennemi de Spider-Man, tantôt anti-héros, il est avant tout un père aimant qui veut financer le traitement de sa fille malade. Sa tragédie le rend humain.',r:'rare',p:150},
{id:'mv23',name:'Rhino',uni:'Marvel',uk:'mv',em:'🦏',em2:'💪',color:'#7f8c8d',gc:'#95a5a6',desc:'Aleksei Sytsevich, alias Rhino, est un colosse russe enfermé dans une combinaison cuirasse en kevlar imitant la peau d\'un rhinocéros, avec corne sur le front. Force surhumaine, vitesse de charge dévastatrice : aucun mur ne lui résiste. Plus brutal que stratège, il est l\'une des menaces physiques les plus impressionnantes de Spider-Man.',r:'rare',p:150},
{id:'mv24',name:'Electro',uni:'Marvel',uk:'mv',em:'⚡',em2:'💡',color:'#f1c40f',gc:'#74b9ff',desc:'Maxwell Dillon, alias Electro, peut générer et contrôler l\'électricité après un accident électrique. Son corps émet des éclairs jaunes éclatants. Son masque vert et jaune en forme d\'étoile à six branches est immédiatement reconnaissable. Capable d\'absorber l\'énergie des centrales électriques, il devient surpuissant en milieu urbain.',r:'rare',p:150},
{id:'mv25',name:'Bouffon vert',uni:'Marvel',uk:'mv',em:'🎃',em2:'💀',color:'#27ae60',gc:'#9b59b6',desc:'Norman Osborn, alias Bouffon vert, est l\'arch-ennemi de Spider-Man. Sa combinaison verte fluo, son chapeau pointu violet et son rire dément glacent le sang. Volant sur sa planeur en forme de chauve-souris, il lance des bombes citrouilles explosives. Père d\'Harry Osborn, sa folie schizophrène en fait l\'un des ennemis les plus complexes de Marvel.',r:'légendaire',p:350},
{id:'mv26',name:'Lézard',uni:'Marvel',uk:'mv',em:'🦎',em2:'💚',color:'#27ae60',gc:'#2ecc71',desc:'Curt Connors, brillant biologiste qui voulait régénérer son bras amputé en s\'injectant du sérum reptilien. Résultat : il se transforme en énorme lézard humanoïde aux écailles vertes et à la queue puissante. Sa tragédie : alterner entre l\'homme rationnel et la bête primitive. Mentor avant ennemi de Spider-Man.',r:'rare',p:150},
{id:'mv27',name:'Vautour',uni:'Marvel',uk:'mv',em:'🦅',em2:'⚙️',color:'#27ae60',gc:'#9b59b6',desc:'Adrian Toomes, alias Vautour, est un ingénieur aigri qui a créé un harnais à ailes mécaniques verts pour voler comme un rapace. Vieil homme chauve aux serres acérées, il pille les sommets des gratte-ciels avec sa précision aérienne. Plus pragmatique que les autres méchants, son réalisme en fait un adversaire redoutable.',r:'rare',p:150},
{id:'mv28',name:'Nick Fury',uni:'Marvel',uk:'mv',em:'👁️',em2:'🕴️',color:'#1a1a1a',gc:'#7f8c8d',desc:'Nicholas Fury, directeur du SHIELD, est l\'architecte derrière l\'initiative Avengers. Son cache-œil noir sur l\'œil gauche et son long manteau de cuir noir en font une figure iconique. Ancien colonel des forces spéciales, son intelligence stratégique a sauvé la planète plus d\'une fois. Il rassemble les héros quand le monde en a besoin.',r:'épique',p:230},
{id:'mv29',name:'Peter Quill',uni:'Marvel',uk:'mv',em:'🚀',em2:'🎵',color:'#c0392b',gc:'#f1c40f',desc:'Star-Lord, leader autoproclamé des Gardiens de la Galaxie. Son masque rouge cyclopéen et son blaster quadruple le rendent menaçant... jusqu\'à ce qu\'il danse sur de la musique des années 80. Half humain half céleste, élevé par des pirates de l\'espace, son charme rebelle et sa playlist culte font tout son charisme.',r:'épique',p:230},
{id:'mv30',name:'Drax',uni:'Marvel',uk:'mv',em:'🪓',em2:'💪',color:'#27ae60',gc:'#c0392b',desc:'Drax le Destructeur, guerrier au corps recouvert de tatouages tribaux rouges sur peau verte. Ses muscles surhumains et ses deux poignards rituels en font une machine de guerre. Comprenant tout au sens littéral, il provoque les fous rires des Gardiens de la Galaxie. Sa quête de vengeance contre Thanos est sa raison d\'être.',r:'rare',p:150},
{id:'mv31',name:'Gamora',uni:'Marvel',uk:'mv',em:'🗡️',em2:'💚',color:'#27ae60',gc:'#c0392b',desc:'Gamora, fille adoptive de Thanos, est la femme la plus dangereuse de la galaxie. Sa peau verte, ses cheveux longs noirs et roux, et ses doubles épées Godslayer en font une assassin redoutable. Trahissant son père génocidaire, elle rejoint les Gardiens de la Galaxie. Son amour pour Star-Lord adoucit sa carapace de tueuse.',r:'épique',p:230},
{id:'mv32',name:'Rocket Raccoon',uni:'Marvel',uk:'mv',em:'🦝',em2:'🔫',color:'#8B5E3C',gc:'#d4a870',desc:'Raton-laveur génétiquement modifié et augmenté cybernétiquement, Rocket est le génie technique des Gardiens de la Galaxie. Petit, hargneux et toujours armé jusqu\'aux dents avec ses canons disproportionnés. Sous son sale caractère se cache un être torturé qui n\'a jamais demandé à devenir ce qu\'il est. Son lien avec Groot est inestimable.',r:'épique',p:230},
{id:'mv33',name:'Groot',uni:'Marvel',uk:'mv',em:'🌳',em2:'💚',color:'#27ae60',gc:'#8B5E3C',desc:'Géant arboricole extraterrestre de la planète X, Groot ne sait dire qu\'une seule phrase : Je s\'appelle Groot. Sa branchure expressive, ses yeux verts brillants et son écorce épaisse en font un être unique. Capable de régénération infinie depuis une simple bouture, il est l\'âme la plus pure des Gardiens. We are Groot.',r:'légendaire',p:350},
{id:'pk01',name:'Pikachu',uni:'Pokémon',uk:'pk',em:'⚡',em2:'🐭',color:'#f1c40f',gc:'#f4d03f',desc:'Mascotte officielle de l\'univers Pokémon depuis 1996, Pikachu est la créature la plus célèbre du monde. Souris électrique jaune aux joues rouges et à la queue en éclair noir et brun, son cri kawaï a conquis la planète. Compagnon inséparable de Sacha, il refuse d\'évoluer en Raichu pour rester fidèle à son dresseur.',r:'légendaire',p:350},
{id:'pk02',name:'Raichu',uni:'Pokémon',uk:'pk',em:'⚡',em2:'🟧',color:'#e67e22',gc:'#f39c12',desc:'Évolution de Pikachu après exposition à une Pierre Foudre, Raichu est un Pokémon Souris orange et crème plus puissant. Sa queue se termine par un éclair plus large, ses joues blanches stockent l\'électricité. Plus rapide et plus puissant que Pikachu, il est un combattant redoutable apprécié des dresseurs expérimentés.',r:'épique',p:230},
{id:'pk03',name:'Salamèche',uni:'Pokémon',uk:'pk',em:'🦎',em2:'🔥',color:'#e74c3c',gc:'#f39c12',desc:'Pokémon de départ de type Feu de Kanto, Salamèche est un petit lézard orange à la flamme éternelle au bout de la queue. Si la flamme s\'éteint, il meurt. Ses grands yeux innocents et son tempérament joueur en font un favori. Premier choix de millions de joueurs depuis 1996.',r:'rare',p:150},
{id:'pk04',name:'Reptincel',uni:'Pokémon',uk:'pk',em:'🦎',em2:'🔥',color:'#e74c3c',gc:'#c0392b',desc:'Évolution de Salamèche au niveau 16, Reptincel est plus grand, plus agressif et son orange tire vers le rouge. Sa flamme caudale est plus intense, ses griffes plus acérées. Caractère impatient et fougueux, il prépare le terrain pour la majestueuse évolution finale en Dracaufeu.',r:'rare',p:150},
{id:'pk05',name:'Dracaufeu',uni:'Pokémon',uk:'pk',em:'🐉',em2:'🔥',color:'#e67e22',gc:'#f39c12',desc:'Évolution finale de Salamèche, Dracaufeu est l\'un des Pokémon les plus iconiques de la franchise. Dragon orange aux ailes bleues, sa queue enflammée et ses crocs acérés en font une bête redoutable. Capable de cracher des flammes assez chaudes pour faire fondre des rochers, son fierté n\'a d\'égal que sa puissance.',r:'légendaire',p:350},
{id:'pk06',name:'Bulbizarre',uni:'Pokémon',uk:'pk',em:'🌱',em2:'💚',color:'#27ae60',gc:'#a8e6cf',desc:'Pokémon de départ de type Plante/Poison de Kanto, Bulbizarre est une créature reptilienne bleu-vert au bulbe sur le dos. Ses grands yeux rouges et son tempérament docile en font un compagnon adorable. Le bulbe absorbe l\'énergie solaire pour grandir et préparer son éclosion en plante.',r:'rare',p:150},
{id:'pk07',name:'Herbizarre',uni:'Pokémon',uk:'pk',em:'🌿',em2:'💚',color:'#27ae60',gc:'#16a085',desc:'Évolution de Bulbizarre au niveau 16, Herbizarre voit son bulbe s\'ouvrir en bouton de fleur. Plus grand et plus agile que sa forme précédente, il maîtrise mieux ses pouvoirs végétaux. Ses lianes sont plus efficaces et il commence à utiliser des techniques basées sur la photosynthèse.',r:'rare',p:150},
{id:'pk08',name:'Florizarre',uni:'Pokémon',uk:'pk',em:'🌸',em2:'💚',color:'#27ae60',gc:'#e91e63',desc:'Évolution finale de Bulbizarre, Florizarre porte sur son dos une énorme fleur rose éclose pleinement. Son corps massif et puissant en fait un combattant tank impressionnant. Capable de libérer du pollen toxique paralysant et d\'absorber l\'énergie solaire à grande échelle pour des attaques dévastatrices.',r:'légendaire',p:350},
{id:'pk09',name:'Mew',uni:'Pokémon',uk:'pk',em:'🌸',em2:'💗',color:'#ff69b4',gc:'#ffc0cb',desc:'Pokémon mythique extrêmement rare, Mew est une créature féline rose pâle avec une longue queue fine. Capable d\'apprendre toutes les attaques existantes, Mew est considéré comme l\'ancêtre de tous les Pokémon. Joueur et facétieux, il flotte gracieusement et n\'est visible que pour ceux qui ont le cœur pur.',r:'mythique',p:500},
{id:'pk10',name:'Mewtwo',uni:'Pokémon',uk:'pk',em:'🧠',em2:'💜',color:'#9b59b6',gc:'#bb8fce',desc:'Pokémon génétiquement créé à partir de l\'ADN de Mew par des scientifiques, Mewtwo est le Pokémon Psy le plus puissant. Sa silhouette violette élancée, sa queue épaisse et son regard glacial inspirent la crainte. Doté d\'une intelligence supérieure et d\'une force psychique dévastatrice, il questionne le sens de son existence.',r:'légendaire',p:350},
{id:'pk11',name:'Carapuce',uni:'Pokémon',uk:'pk',em:'🐢',em2:'💧',color:'#3498db',gc:'#74b9ff',desc:'Pokémon de départ de type Eau de Kanto, Carapuce est une petite tortue bleu pâle au ventre crème. Sa queue spiralée et ses grands yeux innocents en font un favori absolu. Capable de se rétracter dans sa carapace brune et de jeter des jets d\'eau, son tempérament timide masque un cœur courageux.',r:'rare',p:150},
{id:'pk12',name:'Carabaffe',uni:'Pokémon',uk:'pk',em:'🐢',em2:'💧',color:'#3498db',gc:'#5dade2',desc:'Évolution de Carapuce au niveau 16, Carabaffe est plus grand et plus expressif. Ses oreilles longues et duveteuses ressemblent à de la fourrure, sa queue est plus spiralée. Plus agile et plus puissant, il peut générer des jets d\'eau à très haute pression depuis sa bouche pour des attaques précises.',r:'rare',p:150},
{id:'pk13',name:'Tortank',uni:'Pokémon',uk:'pk',em:'🐢',em2:'💦',color:'#3498db',gc:'#1e3799',desc:'Évolution finale de Carapuce, Tortank est une tortue géante bleu marine avec deux canons d\'eau sortant de sa carapace. Sa carapace est presque indestructible, sa puissance hydraulique est dévastatrice. Capable de tirer des jets d\'eau capables de transpercer le métal, c\'est un tank défensif et offensif redoutable.',r:'légendaire',p:350},
{id:'pk14',name:'Miaouss',uni:'Pokémon',uk:'pk',em:'🐱',em2:'🪙',color:'#f1c40f',gc:'#f4d03f',desc:'Pokémon Chat Griffe au pelage crème et à la grande pièce d\'or sur le front, Miaouss est l\'un des seuls Pokémon capables de parler comme un humain. Membre de la Team Rocket, il forme avec Jessie et James un trio comique inoubliable. Son obsession pour l\'or et son sarcasme permanent en font un personnage iconique.',r:'épique',p:230},
{id:'pk15',name:'Évoli',uni:'Pokémon',uk:'pk',em:'🦊',em2:'✨',color:'#d4a017',gc:'#f1c40f',desc:'Pokémon Évolution unique, Évoli peut évoluer en huit formes différentes selon les conditions. Petit renard brun beige avec une collerette crème duveteuse, ses grands yeux noirs et ses oreilles pointues en font un favori absolu. Sa génétique instable et adaptable le rend fascinant pour les chercheurs Pokémon.',r:'légendaire',p:350},
{id:'pk16',name:'Psykokwak',uni:'Pokémon',uk:'pk',em:'🦆',em2:'🤕',color:'#f1c40f',gc:'#f4d03f',desc:'Pokémon Canard jaune à l\'air toujours migraineux, Psykokwak souffre de violents maux de tête qui déclenchent des pouvoirs psychiques incontrôlables. Ses mains sur la tête sont sa pose iconique. Quand son mal de tête atteint son apogée, il devient l\'un des Pokémon Psy les plus puissants malgré lui.',r:'rare',p:150},
{id:'pk17',name:'Rondoudou',uni:'Pokémon',uk:'pk',em:'🎵',em2:'💗',color:'#ff69b4',gc:'#ffc0cb',desc:'Pokémon Ballon rose mignonissime, Rondoudou est célèbre pour son chant qui endort tous ceux qui l\'écoutent. Ses grands yeux turquoise, ses oreilles courtes et son corps rebondi en font une boule d\'amour. Quand on s\'endort sans l\'écouter jusqu\'au bout, il dessine sur les visages avec colère.',r:'rare',p:150},
{id:'pk18',name:'Fantominus',uni:'Pokémon',uk:'pk',em:'👻',em2:'💜',color:'#7d3c98',gc:'#9b59b6',desc:'Pokémon Spectre violet en forme de boule de gaz toxique, Fantominus flotte dans les cimetières et grottes obscures. Son sourire malicieux à dents pointues et ses yeux rouges glacent le sang. Capable de léviter et de devenir intangible, ses attaques fantômes sont redoutables contre les Pokémon Psy.',r:'rare',p:150},
{id:'pk19',name:'Ectoplasma',uni:'Pokémon',uk:'pk',em:'👻',em2:'😈',color:'#7d3c98',gc:'#9b59b6',desc:'Évolution finale de Fantominus, Ectoplasma est un Pokémon Spectre violet sombre au sourire diabolique permanent. Ses petits yeux rouges malveillants et ses dents serrées en font un être terrifiant. Capable de se cacher dans les ombres et de drainer l\'énergie vitale des humains, c\'est l\'un des Pokémon les plus craints.',r:'épique',p:230},
{id:'pk20',name:'Lucario',uni:'Pokémon',uk:'pk',em:'🥋',em2:'⚡',color:'#3498db',gc:'#1a3a8a',desc:'Pokémon Aura de type Combat/Acier, Lucario est un combattant maître de l\'art de l\'aura. Sa silhouette canine élancée bleue et noire, ses yeux rouges intenses et ses pointes acérées sur les pattes en font un guerrier élégant. Capable de détecter et de manipuler l\'aura des autres êtres, c\'est un combattant légendaire et noble.',r:'légendaire',p:350},
{id:'pk21',name:'Ronflex',uni:'Pokémon',uk:'pk',em:'😴',em2:'🍔',color:'#1a3a6a',gc:'#3498db',desc:'Pokémon Endormi gigantesque, Ronflex passe sa vie à manger et dormir. Son corps massif bleu marine et crème, son ventre énorme et sa face perpétuellement endormie en font un classique. Capable de manger 400 kg de nourriture par jour, il bloque souvent les routes en dormant et il faut une flûte spéciale pour le réveiller.',r:'épique',p:230},
{id:'pk22',name:'Sacha',uni:'Pokémon',uk:'pk',em:'🧢',em2:'🎒',color:'#c0392b',gc:'#3498db',desc:'Sacha Ketchum, le héros principal de l\'anime Pokémon depuis 1997. Sa casquette rouge à logo Pokéball, son t-shirt noir et bleu, et son gilet bleu sont mondialement reconnaissables. Sa quête éternelle : devenir Maître Pokémon. Toujours accompagné de Pikachu, son optimisme et sa détermination ont inspiré des générations.',r:'légendaire',p:350},
{id:'pk23',name:'Ondine',uni:'Pokémon',uk:'pk',em:'💧',em2:'👧',color:'#3498db',gc:'#74b9ff',desc:'Misty, championne d\'arène de Bourg Palette spécialisée dans les Pokémon Eau. Ses cheveux roux orange noués en queue de cheval latérale, son débardeur jaune et son short en jean en font une figure inoubliable. Caractère explosif mais cœur tendre, elle accompagne Sacha durant les premières saisons. Son maillet est légendaire.',r:'épique',p:230},
{id:'pk24',name:'Pierre',uni:'Pokémon',uk:'pk',em:'🪨',em2:'😍',color:'#7f8c8d',gc:'#bdc3c7',desc:'Brock, champion d\'arène d\'Argenta spécialisé dans les Pokémon Roche. Ses yeux toujours fermés sont devenus son trait iconique, sa peau brune et ses cheveux marron pic le rendent reconnaissable. Cuisinier hors pair de la troupe, il craque pour toutes les jolies infirmières et officières Joëlle qu\'il croise.',r:'épique',p:230},
{id:'pk25',name:'Jessie',uni:'Pokémon',uk:'pk',em:'🌹',em2:'💄',color:'#c0392b',gc:'#e74c3c',desc:'Membre féminin de la Team Rocket, Jessie est reconnaissable à ses longs cheveux magenta volumineux et son uniforme blanc à R rouge. Vaniteuse, ambitieuse et théâtrale, elle rêve de gloire. Avec James et Miaouss, leur trio comique poursuit Pikachu sans jamais l\'attraper. Son désespoir face à leurs échecs est culte.',r:'rare',p:150},
{id:'pk26',name:'James',uni:'Pokémon',uk:'pk',em:'🌹',em2:'💜',color:'#7d3c98',gc:'#9b59b6',desc:'Acolyte masculin de Jessie dans la Team Rocket, James a les cheveux courts mauves et le même uniforme blanc à R rouge. Plus sensible et lâche que Jessie, il vient d\'une famille noble qu\'il a fuie. Doux avec ses Pokémon (Smogogo, Carnivine), son humour et ses larmes faciles en font un méchant attachant.',r:'rare',p:150},
{id:'pk27',name:'Giovanni',uni:'Pokémon',uk:'pk',em:'👔',em2:'😈',color:'#1a1a1a',gc:'#c0392b',desc:'Giovanni, le mystérieux Boss de la Team Rocket et champion d\'arène d\'Azuria. Costume orange et chemise noire impeccables, sa main caressant un Persian sur ses genoux est devenue iconique. Stratège implacable, sa quête : capturer les Pokémon les plus puissants pour conquérir le monde. Mewtwo fut sa plus grande création.',r:'légendaire',p:350},
{id:'mr01',name:'Mario',uni:'Mario Bros',uk:'mr',em:'🍄',em2:'⭐',color:'#c0392b',gc:'#f1c40f',desc:'Super plombier moustachu, Mario est le héros le plus vendu de l\'histoire du jeu vidéo avec 800 millions de copies. Sa casquette rouge avec le M blanc et sa salopette bleue en font le personnage le plus reconnaissable au monde. Depuis 1985, il saute sur des Goombas et sauve la Princesse Peach.',r:'légendaire',p:350},
{id:'mr02',name:'Luigi',uni:'Mario Bros',uk:'mr',em:'🟢',em2:'👻',color:'#27ae60',gc:'#2ecc71',desc:'Grand frère vert de Mario, souvent dans son ombre mais tout aussi courageux à sa façon unique. Sa casquette verte avec le L et sa moustache plus fine le différencient de son frère. Peureux mais déterminé, il brave les manoirs hantés dans Luigi\'s Mansion. Son cri Mamma mia retentit avec la même fierté que Mario.',r:'légendaire',p:350},
{id:'mr03',name:'Princesse Peach',uni:'Mario Bros',uk:'mr',em:'👑',em2:'💗',color:'#e91e8c',gc:'#ff69b4',desc:'Souveraine du Royaume Champignon, Peach est bien plus qu\'une princesse en détresse. Sa couronne dorée et son parasol rose sont ses accessoires signature. Dans le film 2023, elle mène l\'armée champignon face à Bowser avec une détermination absolue. Sa résistance intérieure et sa diplomatie font d\'elle une reine accomplie.',r:'légendaire',p:350},
{id:'mr04',name:'Bowser',uni:'Mario Bros',uk:'mr',em:'👹',em2:'🔥',color:'#27ae60',gc:'#f1c40f',desc:'Roi des Koopas et ennemi juré de Mario depuis 1985, l\'un des grands méchants les plus iconiques du jeu vidéo. Sa carapace verte hérissée, sa fourrure rouge et ses flammes dévastatrices en font un adversaire terrifiant. Père aimant de Bowser Jr., dans Mario Kart il devient même un allié attachant.',r:'mythique',p:500},
{id:'mr05',name:'Yoshi',uni:'Mario Bros',uk:'mr',em:'🦎',em2:'🥚',color:'#27ae60',gc:'#2ecc71',desc:'Dinosaure vert fidèle et compagnon de Mario depuis Super Mario World sur SNES. Sa langue longue attrape ennemis et objets, ses yeux globuleux et sa coquille colorée en font un personnage unique. Il peut avaler n\'importe quel ennemi et cracher des oeufs. Dans Yoshi\'s Island, il porte bébé Mario à travers des mondes magnifiques.',r:'épique',p:230},
{id:'mr06',name:'Toad',uni:'Mario Bros',uk:'mr',em:'🍄',em2:'💙',color:'#c0392b',gc:'#3498db',desc:'Serviteur dévoué de la Princesse Peach reconnaissable à son chapeau blanc à gros pois rouges. Petit mais rapide, il possède la meilleure vitesse dans Super Mario Bros 2. Ses grands yeux bleus expressifs et sa voix aiguë le rendent immédiatement attachant. Captain Toad explore le monde avec sa lampe frontale.',r:'commun',p:90},
{id:'mr07',name:'Wario',uni:'Mario Bros',uk:'mr',em:'💛',em2:'💜',color:'#f1c40f',gc:'#f4d03f',desc:'Rival corrompu et glouton de Mario, sa version opposée en tout. Sa casquette jaune avec le W inversé et sa salopette violette le définissent visuellement. PDG de WarioWare Inc., il fabrique des mini-jeux absurdes pour s\'enrichir. Son rire tonitruant et sa recherche obsessionnelle de trésors le rendent irrésistiblement drôle.',r:'épique',p:230},
{id:'mr08',name:'Waluigi',uni:'Mario Bros',uk:'mr',em:'🍆',em2:'😈',color:'#7d3c98',gc:'#9b59b6',desc:'Némesis comique de Luigi, Waluigi est apparu dans Mario Tennis en 2000. Grand, mince et tout en violet, son L renversé en W témoigne de sa nature de jumeau maléfique. Sa moustache pointue et son rire machiavélique le rendent inoubliable. Toujours en colère et jaloux, il est devenu un mème internet adoré.',r:'épique',p:230},
{id:'gd01',name:'Actarus',uni:'Goldorak',uk:'gd',em:'🤖',em2:'⭐',color:'#1a3a7a',gc:'#4a7af0',desc:"Duc Freed de la planète Vega, Actarus est le pilote de Goldorak. Après la destruction de Vega par le Roi Véga, il se réfugie sur Terre. Ses yeux bleus déterminés et ses cheveux noirs en bataille le rendent reconnaissable.",r:'légendaire',p:350},
{id:'gd02',name:'Alcor',uni:'Goldorak',uk:'gd',em:'🤖',em2:'💚',color:'#2a4a2a',gc:'#4af04a',desc:"Meilleur ami d'Actarus, Alcor pilote le Cybord X7. Ses cheveux blonds et son enthousiasme en font le complément parfait du sérieux d'Actarus.",r:'rare',p:150},
{id:'gd03',name:'Vénusia',uni:'Goldorak',uk:'gd',em:'🤖',em2:'💗',color:'#c0006c',gc:'#f48fb1',desc:"Pilote aux longs cheveux rouges et aux grands yeux expressifs. Son courage égale celui de ses compagnons masculins. Son style de combat agile en fait une guerrière redoutable.",r:'rare',p:150},
{id:'gd04',name:'Phénicia',uni:'Goldorak',uk:'gd',em:'🤖',em2:'🔭',color:'#2c3e50',gc:'#bdc3c7',desc:"Scientifique et stratège aux cheveux argentés. Son intelligence hors du commun est la clé des victoires contre les armées de Véga.",r:'rare',p:150},
{id:'gd05',name:'Grand Stratéguerre',uni:'Goldorak',uk:'gd',em:'🤖',em2:'👿',color:'#2c1a4a',gc:'#9b59b6',desc:"Roi de la planète Véga et ennemi juré. Ses épaulettes argentées hérissées et son armure pourpre aux yeux maléfiques en font l'antagoniste le plus imposant de l'anime des années 70.",r:'mythique',p:500},
{id:'gd06',name:'Minas',uni:'Goldorak',uk:'gd',em:'🤖',em2:'⚔️',color:'#1a4a1a',gc:'#2ecc71',desc:"Général aux teintes verdâtres. Stratège et guerrier impitoyable, il commande les Végans avec une discipline de fer.",r:'épique',p:230},
{id:'gd07',name:'Hydargos',uni:'Goldorak',uk:'gd',em:'🤖',em2:'🐊',color:'#006080',gc:'#00c0d0',desc:"Général reptilien aux écailles bleu-vert. Ses yeux jaunes en fente et la crête sur son crâne en font une créature extra-terrestre conçue pour la guerre.",r:'épique',p:230},
{id:'gd08',name:'Horos',uni:'Goldorak',uk:'gd',em:'🤖',em2:'💀',color:'#8B0000',gc:'#ff4444',desc:"Guerrier balafré aux yeux rouges luisant comme des braises. Ses cicatrices témoignent de dizaines de batailles. Le combattant le plus redouté des armées véganes.",r:'épique',p:230},
{id:'gd09',name:'Rigel',uni:'Goldorak',uk:'gd',em:'🤖',em2:'🌟',color:'#1a3a7a',gc:'#3a6abf',desc:"Soldat végane loyal en uniforme bleu. Sa peau bleu-gris trahit son origine extra-terrestre. Déterminé à servir son roi.",r:'commun',p:90},
{id:'gd10',name:'Goldorak',uni:'Goldorak',uk:'gd',em:'🤖',em2:'⚡',color:'#2c3e50',gc:'#74b9ff',desc:"Le robot géant ! Goldorak est piloté par Actarus. Ses deux cornes en V, son visor orange et sa gemme rouge frontale sont ses marques iconiques. GOLDRAAAKE !",r:'mythique',p:500},
{id:'gd11',name:'Goldorak & Soucoupe',uni:'Goldorak',uk:'gd',em:'🤖',em2:'🛸',color:'#1a2a3a',gc:'#74b9ff',desc:"Goldorak combiné avec son vaisseau soucoupe Grendizer ! Cette combinaison représente la puissance ultime contre Véga.",r:'mythique',p:500},
{id:'mc01',name:'Esteban',uni:'Cités d\'Or',uk:'mc',em:'☀️',em2:'🌟',color:'#f1c40f',gc:'#f4d03f',desc:'Né d\'un père mystérieux et de la civilisation solaire, Esteban est l\'Enfant du Soleil prédestiné à retrouver les Mystérieuses Cités d\'Or. Sa médaille solaire dorée lui confère un lien unique avec les puissances de la cité. Courageux et curieux, son innocence le guide là où les adultes échouent.',r:'légendaire',p:350},
{id:'mc02',name:'Zia',uni:'Cités d\'Or',uk:'mc',em:'🌺',em2:'☀️',color:'#c0392b',gc:'#e74c3c',desc:'Jeune fille Inca dotée d\'un savoir ancestral précieux sur les Cités d\'Or, Zia accompagne Esteban dans son odyssée. Ses nattes noires et son disque solaire frontal révèlent son origine mystique. Calme et sage, elle déchiffre les inscriptions anciennes et garde la mémoire de son peuple disparu.',r:'épique',p:230},
{id:'mc03',name:'Tao',uni:'Cités d\'Or',uk:'mc',em:'⚓',em2:'🗺️',color:'#3498db',gc:'#5dade2',desc:'Descendant de la civilisation disparue de Mu, Tao voyage depuis l\'Orient pour retrouver Esteban. Ses connaissances en navigation et en histoire ancienne sont inestimables. Mystérieux et élégant dans ses habits bleus et or, il possède un savoir cartographique exceptionnel sur les Cités d\'Or.',r:'épique',p:230},
{id:'mc04',name:'Mendoza',uni:'Cités d\'Or',uk:'mc',em:'⚔️',em2:'🏴‍☠️',color:'#7f8c8d',gc:'#95a5a6',desc:'Conquistador ambitieux et rusé, Mendoza part en quête des Cités d\'Or pour leur or légendaire. Sous ses airs de mercenaire calculateur se cache un homme d\'honneur qui protégera les enfants envers et contre tout. Sa barbe noire et son chapeau de conquistador sont ses marques distinctives.',r:'rare',p:150},
{id:'mc05',name:'Pedro',uni:'Cités d\'Or',uk:'mc',em:'🎩',em2:'😄',color:'#e74c3c',gc:'#e74c3c',desc:'Compagnon jovial et généreux de Mendoza, Pedro est l\'homme de main loyal et chaleureux. Sa bedaine ronde, sa casquette rouge et son sourire communicatif en font le comic relief attachant de l\'équipe. Toujours prêt à rire ou à manger, son courage surprend ceux qui le sous-estiment.',r:'commun',p:90},
{id:'mc06',name:'Sancho',uni:'Cités d\'Or',uk:'mc',em:'💙',em2:'😅',color:'#2980b9',gc:'#3498db',desc:'Deuxième acolyte de Mendoza, Sancho est le pendant maladroit mais sincère de Pedro. Sa silhouette élancée, son chapeau bleu et ses répliques cocasses apportent la légèreté nécessaire aux moments de tension. Fidèle jusqu\'au bout, il ne quitterait Mendoza pour rien au monde.',r:'commun',p:90},
{id:'mc07',name:'Pichu',uni:'Cités d\'Or',uk:'mc',em:'🦜',em2:'🌈',color:'#27ae60',gc:'#f1c40f',desc:'Perroquet exotique aux plumes multicolores, Pichu est la mascotte attachante de l\'expédition. Son plumage flamboyant vert, jaune et rouge attire l\'œil. Bavard et espiègle, il imite parfaitement les voix humaines. Compagnon fidèle d\'Esteban, il survole les jungles d\'Amérique du Sud et alerte la troupe en cas de danger imminent.',r:'commun',p:90},
{id:'mc08',name:'Gaspard',uni:'Cités d\'Or',uk:'mc',em:'⚔️',em2:'🇪🇸',color:'#7f8c8d',gc:'#95a5a6',desc:'Espagnol apparaissant dès la saison 1 des Cités d\'Or, Gaspard est d\'abord adversaire récurrent de nos héros aux côtés d\'autres antagonistes. Sa barbe taillée et son pourpoint sombre marquent son rang. Au fil des saisons, il finira par rejoindre les héros à la fin de la saison 4, prouvant que la rédemption est possible même pour les conquistadors.',r:'rare',p:150},
{id:'mc09',name:'Laguerra',uni:'Cités d\'Or',uk:'mc',em:'🌹',em2:'🗡️',color:'#c0392b',gc:'#e74c3c',desc:'Isabella Laguerra, plus souvent appelée Laguerra, apparaît dans les saisons 3 et 4. Femme manipulatrice aux cheveux noirs et au regard pénétrant, elle mène un double jeu auprès de Mendoza et d\'Ambrosius, cachant à l\'un son allégeance envers l\'autre. Ses véritables intentions ne se révèleront qu\'à la toute fin de l\'aventure.',r:'épique',p:230},
{id:'mc10',name:'Ambrosius',uni:'Cités d\'Or',uk:'mc',em:'🎩',em2:'🇫🇷',color:'#3498db',gc:'#5dade2',desc:'Ambroise de Sarle, plus généralement appelé Ambrosius, est un aventurier français apparaissant à partir de la saison 2. Allié de nos héros durant ses premières apparitions, ses motivations se révèleront plus complexes au fil des aventures. Son élégance française et ses bonnes manières contrastent avec la rudesse des autres aventuriers.',r:'épique',p:230},
{id:'mc11',name:'Zarès',uni:'Cités d\'Or',uk:'mc',em:'🩸',em2:'🦾',color:'#7f0000',gc:'#c0392b',desc:'Ennemi implacable de nos héros, Zarès - l\'homme sans visage à la voix rauque - est un personnage mystérieux dissimulé sous une grande tunique rouge. Apparemment sous les ordres de Charles Quint, à qui il promet que la puissance des Cités d\'Or dépassera l\'imagination. Révélation finale : il s\'agit en fait d\'Ambrosius équipé d\'un exosquelette mécanique.',r:'légendaire',p:350},
{id:'cz01',name:'Seiya de Pégase',uni:'Chevaliers du Zodiaque',uk:'cz',em:'🦅',em2:'💥',color:'#74b9ff',gc:'#a8d8ff',desc:'Orphelin élevé pour devenir le Chevalier de Pégase, Seiya combat pour protéger Saori, réincarnation d\'Athéna. Sa Météore de Pégase — une bourrasque de coups portés à la vitesse de la lumière — détruit tout adversaire. Impulsif et loyal, son amitié pour ses frères Chevaliers est sa plus grande force.',r:'légendaire',p:350},
{id:'cz02',name:'Shiryu du Dragon',uni:'Chevaliers du Zodiaque',uk:'cz',em:'🐉',em2:'💪',color:'#3498db',gc:'#5dade2',desc:'Chevalier de l\'Armure du Dragon, Shiryu est le guerrier le plus stoïque et honorable des Bronze. Son bouclier du Dragon et son Rozan Sho Ryu Ha invoquent un dragon d\'énergie dévastateur. Sa force intérieure dépasse celle de tout autre chevalier de bronze.',r:'légendaire',p:350},
{id:'cz03',name:'Hyoga du Cygne',uni:'Chevaliers du Zodiaque',uk:'cz',em:'❄️',em2:'🌊',color:'#74b9ff',gc:'#c8e8ff',desc:'Maître des glaces de Sibérie, Hyoga porte l\'armure du Cygne. Son Aurore Exécution et son Diamond Dust congèlent l\'adversaire au zéro absolu. Fils d\'une mère reposant sous les glaces, sa tristesse et sa détermination en font un héros émouvant.',r:'épique',p:230},
{id:'cz04',name:'Shun d\'Andromède',uni:'Chevaliers du Zodiaque',uk:'cz',em:'⛓️',em2:'🌺',color:'#e91e8c',gc:'#ff69b4',desc:'Le plus pacifique des Chevaliers de Bronze, Shun combat avec ses chaînes nébula d\'Andromède, défensives comme offensives. Sa sensibilité et son refus de tuer le rendent unique. Frère d\'Ikki, sa pureté d\'âme le destine à un rôle capital.',r:'épique',p:230},
{id:'cz05',name:'Ikki du Phénix',uni:'Chevaliers du Zodiaque',uk:'cz',em:'🔥',em2:'👊',color:'#9b59b6',gc:'#c880e0',desc:'Solitaire et fougueux, Ikki est le Chevalier du Phénix qui renaît plus fort après chaque défaite. Sa Griffe du Phénix plonge l\'adversaire dans des illusions cauchemardesques. Frère aîné de Shun, il cache un amour fraternel indéfectible.',r:'légendaire',p:350},
{id:'cz06',name:'Saori / Athéna',uni:'Chevaliers du Zodiaque',uk:'cz',em:'⚜️',em2:'🕊️',color:'#f1c40f',gc:'#f4d03f',desc:'Réincarnation de la déesse Athéna, Saori Kido est la raison pour laquelle les Chevaliers se battent. Son sceptre et son bouclier divin protègent la Terre. Sa compassion la pousse parfois au sacrifice, inspirant ses chevaliers à des exploits impossibles.',r:'légendaire',p:350},
{id:'cz07',name:'Mû du Bélier',uni:'Chevaliers du Zodiaque',uk:'cz',em:'♈',em2:'🔮',color:'#ff69b4',gc:'#ffb3c8',desc:'Gold Saint du Bélier, Mû est le seul à réparer les armures divines. Télépathe au mur de cristal invincible, sa Stardust Revolution est dévastatrice. Gardien du Premier Temple, il est aussi le plus sage des Chevaliers d\'Or.',r:'épique',p:230},
{id:'cz08',name:'Aldébaran du Taureau',uni:'Chevaliers du Zodiaque',uk:'cz',em:'♉',em2:'💪',color:'#e74c3c',gc:'#ff6b6b',desc:'Gold Saint du Taureau, guerrier le plus imposant du Sanctuaire. Son Great Horn brise n\'importe quelle technique d\'un seul coup. Loyal et droit, Aldébaran ne frappe jamais par traîtrise. Sa force brute dépasse l\'entendement.',r:'épique',p:230},
{id:'cz09',name:'Saga des Gémeaux',uni:'Chevaliers du Zodiaque',uk:'cz',em:'♊',em2:'😈',color:'#3498db',gc:'#74b9ff',desc:'Gold Saint des Gémeaux, le personnage le plus tragique de la série. Capable d\'imiter la voix du Pape, il usurpa le Sanctuaire des années. Son Galaxian Explosion est absolument dévastateur. Déchiré entre bien et mal, il choisit la lumière au prix de sa vie.',r:'mythique',p:500},
{id:'cz10',name:'Masque de mort du Cancer',uni:'Chevaliers du Zodiaque',uk:'cz',em:'♋',em2:'💀',color:'#7f0000',gc:'#c0392b',desc:'Gold Saint du Cancer, le plus cruel des Chevaliers d\'Or. Sa technique Sekishiki Meikai Ha envoie les âmes au royaume des morts. Son temple est tapissé des visages de ses victimes. Le mal incarné parmi l\'élite dorée du Sanctuaire.',r:'épique',p:230},
{id:'cz11',name:'Aioria du Lion',uni:'Chevaliers du Zodiaque',uk:'cz',em:'♌',em2:'⚡',color:'#f1c40f',gc:'#f4d03f',desc:'Gold Saint du Lion, frère cadet d\'Aiolos, guerrier fougueux au regard perçant. Son Lightning Plasma — explosion de foudre à la vitesse de la lumière — est l\'une des techniques les plus rapides du Sanctuaire. Longtemps manipulé, il découvre enfin la vérité.',r:'épique',p:230},
{id:'cz12',name:'Shaka de la Vierge',uni:'Chevaliers du Zodiaque',uk:'cz',em:'♍',em2:'☸️',color:'#ecf0f1',gc:'#ffffff',desc:'Considéré comme le Gold Saint le plus proche des dieux, Shaka médite les yeux fermés pour canaliser une puissance divine. Son Trésor du Ciel prive l\'adversaire de ses cinq sens. Pur à l\'extrême, il est dit la réincarnation de Bouddha.',r:'mythique',p:500},
{id:'cz13',name:'Dohko de la Balance',uni:'Chevaliers du Zodiaque',uk:'cz',em:'♎',em2:'⚖️',color:'#27ae60',gc:'#2ecc71',desc:'Gold Saint de la Balance, Dohko veille depuis 243 ans sur le sceau d\'Hadès depuis les Cinq Pics. Son armure de la Balance offre douze armes légendaires. Maître de Shiryu, sa sagesse et sa puissance traversent les siècles.',r:'légendaire',p:350},
{id:'cz14',name:'Milo du Scorpion',uni:'Chevaliers du Zodiaque',uk:'cz',em:'♏',em2:'🦂',color:'#c0392b',gc:'#e74c3c',desc:'Gold Saint du Scorpion, guerrier fier et impitoyable. Sa Restriction Écarlate frappe en quinze coups d\'aiguille empoisonnée jusqu\'au coup de grâce Antarès. Loyal au Sanctuaire mais juste, il respecte le courage de ses adversaires.',r:'épique',p:230},
{id:'cz15',name:'Aiolos du Sagittaire',uni:'Chevaliers du Zodiaque',uk:'cz',em:'♐',em2:'🏹',color:'#f39c12',gc:'#f9c12d',desc:'Gold Saint du Sagittaire, le chevalier le plus loyal à Athéna. Il mourut en sauvant bébé Saori du complot du Pape. Ses Golden Arrows transcendent l\'espace et le temps. Son armure protège Seiya dans les moments critiques.',r:'légendaire',p:350},
{id:'cz16',name:'Shura du Capricorne',uni:'Chevaliers du Zodiaque',uk:'cz',em:'♑',em2:'🗡️',color:'#7f8c8d',gc:'#bdc3c7',desc:'Gold Saint du Capricorne, maître de l\'épée absolue. Son bras devient Excalibur, capable de trancher n\'importe quoi. Fanatiquement loyal au Sanctuaire, il rachète ses fautes en offrant Excalibur à Shiryu dans un ultime sacrifice.',r:'épique',p:230},
{id:'cz17',name:'Camus du Verseau',uni:'Chevaliers du Zodiaque',uk:'cz',em:'♒',em2:'❄️',color:'#00bcd4',gc:'#00e5ff',desc:'Gold Saint du Verseau et maître d\'Hyoga, incarnation de la rigueur. Son Aurora Execution atteint le zéro absolu. Loyal aux lois du Sanctuaire par-dessus tout, son combat contre son propre disciple est l\'un des plus bouleversants.',r:'épique',p:230},
{id:'cz18',name:'Aphrodite des Poissons',uni:'Chevaliers du Zodiaque',uk:'cz',em:'♓',em2:'🌹',color:'#e91e8c',gc:'#ff69b4',desc:'Gold Saint des Poissons, le plus beau des Chevaliers d\'Or. Ses Roses Diaboliques Royales — Piranha Rose — dissolvent tout avec une élégance mortelle. Sa beauté cache une cruauté absolue dans le Douzième Temple.',r:'épique',p:230},
{id:'cz19',name:'Marine de l\'Aigle',uni:'Chevaliers du Zodiaque',uk:'cz',em:'🦅',em2:'🎯',color:'#e67e22',gc:'#f0a050',desc:'Chevalier d\'Argent de l\'Aigle et maîtresse de Seiya, Marine cache son visage derrière un masque comme toutes les femmes chevaliers. Son Meteor Wing déchaîne une pluie de coups. Mystérieuse, on la dit liée au passé de Seiya.',r:'rare',p:150},
{id:'cz20',name:'Shaina du Serpentaire',uni:'Chevaliers du Zodiaque',uk:'cz',em:'🐍',em2:'💢',color:'#9b59b6',gc:'#c880e0',desc:'Chevalier d\'Argent du Serpentaire, fière et redoutable guerrière. Sa Thunder Claw frappe comme la morsure d\'un cobra. D\'abord ennemie de Seiya, son orgueil blessé se mue peu à peu en sentiment plus tendre.',r:'rare',p:150},
{id:'cz21',name:'Kiki',uni:'Chevaliers du Zodiaque',uk:'cz',em:'🛐',em2:'✨',color:'#ff69b4',gc:'#ffb3c8',desc:'Jeune apprenti de Mû du Bélier, Kiki partage les pouvoirs de téléportation et de télékinésie de son maître. Espiègle et courageux malgré son jeune âge, il assiste les Chevaliers de Bronze en réparant et apportant les armures.',r:'commun',p:90},
{id:'cz22',name:'Jabu de la Licorne',uni:'Chevaliers du Zodiaque',uk:'cz',em:'🦄',em2:'👊',color:'#3498db',gc:'#74b9ff',desc:'Chevalier de Bronze de la Licorne, l\'un des orphelins du Manoir Kido. Sa technique Galop de la Licorne charge l\'adversaire avec la fougue d\'un cheval sauvage. Rival de Seiya, son courage n\'a d\'égal que sa fidélité à Athéna.',r:'commun',p:90},
{id:'cz23',name:'Cassios',uni:'Chevaliers du Zodiaque',uk:'cz',em:'💪',em2:'🐂',color:'#7f8c8d',gc:'#95a5a6',desc:'Gigantesque apprenti chevalier, rival acharné de Seiya pour l\'armure de Pégase. Brutal mais non dénué d\'honneur, Cassios sacrifie finalement sa vie pour sauver Shaina, révélant la noblesse cachée sous sa rudesse.',r:'commun',p:90},
{id:'cz24',name:'Docrate',uni:'Chevaliers du Zodiaque',uk:'cz',em:'⛰️',em2:'💥',color:'#7f0000',gc:'#c0392b',desc:'Colosse géant au service du Sanctuaire, Docrate barre la route des Bronze Saints vers le Sanctuaire. Sa force titanesque et sa résistance en font un obstacle redoutable, premier mur dressé sur le chemin de Seiya.',r:'commun',p:90},
{id:'cz25',name:'Misty du Lézard',uni:'Chevaliers du Zodiaque',uk:'cz',em:'🦎',em2:'💎',color:'#16a085',gc:'#48c9b0',desc:'Chevalier d\'Argent du Lézard, vaniteux à l\'extrême, obsédé par sa propre beauté. Sa Marble Tripper soulève l\'adversaire avant de l\'écraser. Premier Chevalier d\'Argent affronté par Seiya sur l\'île de la mort.',r:'rare',p:150},
{id:'cz26',name:'Dohko / Vieux Maître',uni:'Chevaliers du Zodiaque',uk:'cz',em:'🐯',em2:'☯️',color:'#27ae60',gc:'#2ecc71',desc:'Sous l\'apparence d\'un vieillard minuscule des Cinq Pics se cache le Gold Saint de la Balance. Maître vénéré de Shiryu, il transmet sagesse millénaire et techniques ancestrales depuis son rocher de Rozan.',r:'légendaire',p:350},
{id:'cz27',name:'Guilty',uni:'Chevaliers du Zodiaque',uk:'cz',em:'💀',em2:'🔥',color:'#7f0000',gc:'#c0392b',desc:'Maître impitoyable d\'Ikki sur l\'Île de la Reine de la Mort. Sa cruauté forgea le caractère du Phénix dans la douleur et le feu. Figure sombre et tyrannique, il incarne l\'épreuve la plus brutale de la formation d\'un chevalier.',r:'épique',p:230},
{id:'cz28',name:'Chevalier de Cristal',uni:'Chevaliers du Zodiaque',uk:'cz',em:'❄️',em2:'💠',color:'#74b9ff',gc:'#c8e8ff',desc:'Chevalier d\'Argent maître d\'Hyoga avant Camus, le Chevalier de Cristal manie le froid avec une noblesse de cœur rare. Son Diamond Dust gèle l\'adversaire. Mentor bienveillant, il guide Hyoga sur la voie de la glace.',r:'rare',p:150},
{id:'cz29',name:'Albior de Céphée',uni:'Chevaliers du Zodiaque',uk:'cz',em:'🌟',em2:'⛓️',color:'#9b59b6',gc:'#c880e0',desc:'Chevalier d\'Argent de Céphée et maître de Shun sur l\'île d\'Andromède. Honorable et juste, il enseigna l\'art des chaînes nébula. Sa droiture force le respect, même de ses ennemis du Sanctuaire.',r:'rare',p:150},
{id:'cz30',name:'Argol de Persée',uni:'Chevaliers du Zodiaque',uk:'cz',em:'🛡️',em2:'👁️',color:'#7f8c8d',gc:'#bdc3c7',desc:'Chevalier d\'Argent de Persée, porteur du Bouclier de Méduse qui pétrifie quiconque le regarde. Arrogant et redoutable, il transforma Shiryu en pierre avant que le Dragon ne triomphe au prix de sa propre vue.',r:'rare',p:150},
{id:'cz31',name:'Grand Pope',uni:'Chevaliers du Zodiaque',uk:'cz',em:'👑',em2:'⚜️',color:'#f1c40f',gc:'#f4d03f',desc:'Chef suprême du Sanctuaire et représentant d\'Athéna sur Terre. Sous le masque se cache Saga des Gémeaux, ayant usurpé le pouvoir. Son autorité écrasante et ses ordres scellent le destin de tous les Chevaliers.',r:'mythique',p:500},
// ── TM / BM / TN / AX},
{id:'tm01',name:"D'Artagnan",uni:'3 Mousquetaires',uk:'tm',em:'⚔️',em2:'🐕',color:'#3498db',gc:'#74b9ff',desc:"Jeune Gascon aux poils dorés, D'Artagnan monte à Paris pour rejoindre les Mousquetaires du Roi avec un cheval maigre et un rêve immense. Impulsif et courageux, son épée aussi rapide que son esprit lui vaut l'amitié d'Athos, Porthos et Aramis. Tous pour un, un pour tous — il vit cette devise de toute son âme.",r:'légendaire',p:350},
{id:'tm02',name:'Athos',uni:'3 Mousquetaires',uk:'tm',em:'🍷',em2:'🐕',color:'#7f8c8d',gc:'#95a5a6',desc:"Le plus noble et le plus mélancolique des Mousquetaires, Athos cache une blessure secrète sous son stoïcisme de grand seigneur. Chien gris aux yeux profonds, sa noblesse de caractère transparaît dans chaque geste. Le meilleur duelliste du groupe, il noie parfois ses peines dans le vin... mais jamais dans le déshonneur.",r:'épique',p:230},
{id:'tm03',name:'Porthos',uni:'3 Mousquetaires',uk:'tm',em:'💪',em2:'🐕',color:'#e67e22',gc:'#f39c12',desc:"Le plus grand, le plus fort et le plus vaniteux des Mousquetaires, Porthos compense sa naïveté par une force physique extraordinaire. Son chien roux imposant adore les beaux habits, les bons repas et les combats où il peut démontrer sa puissance. Son coeur généreux et son rire tonitruant illuminent toute l'équipe.",r:'rare',p:150},
{id:'tm04',name:'Aramis',uni:'3 Mousquetaires',uk:'tm',em:'✝️',em2:'🐕',color:'#27ae60',gc:'#2ecc71',desc:"L'abbé manqué des Mousquetaires, Aramis mêle dévotion et bravoure avec une élégance raffnée. Ce chien brun cultivé jongle entre les prières et les duels, rêvant toujours d'abandonner l'épée pour la soutane. Diplomate, discret et perspicace, ses machinations cachées dépassent souvent celles de Richelieu lui-même.",r:'rare',p:150},
{id:'tm05',name:'Cardinal Richelieu',uni:'3 Mousquetaires',uk:'tm',em:'🔴',em2:'⛪',color:'#c0392b',gc:'#e74c3c',desc:"L'ennemi juré des Mousquetaires, le Cardinal Richelieu est l'homme le plus puissant de France après le Roi. Ce chien machiavélique en robes rouges tisse ses intrigues avec une patience et une intelligence redoutables. Jamais vraiment méchant, jamais tout à fait juste, il incarne la raison d'État au détriment de l'humanité.",r:'épique',p:230},
{id:'tm06',name:'Milady',uni:'3 Mousquetaires',uk:'tm',em:'💋',em2:'🐕',color:'#9b59b6',gc:'#bb8fce',desc:"La femme la plus dangereuse de France, Milady de Winter est une espionne au service de Richelieu dont la beauté mortelle cache une âme froide et calculatrice. Chienne blanche à la robe noire, la fleur de lys sur son épaule révèle un passé obscur. Ennemie jurée de D'Artagnan, elle représente la menace la plus letale du roman.",r:'légendaire',p:350},
{id:'tm07',name:'Constance',uni:'3 Mousquetaires',uk:'tm',em:'🌸',em2:'🐕',color:'#e67e22',gc:'#f39c12',desc:"Mercière du roi et amour de D'Artagnan, Constance Bonacieux est une chienne douce et courageuse prise dans des intrigues qui la dépassent. Sa fidélité à la reine d'Autriche et son amour pour D'Artagnan la mènent à des actes de bravoure remarquables. Son destin tragique reste l'une des pages les plus émouvantes du roman.",r:'commun',p:90},
{id:'tm08',name:'Rochefort',uni:'3 Mousquetaires',uk:'tm',em:'🏴',em2:'🐕',color:'#2c3e50',gc:'#4a6a8a',desc:"L'homme de main du Cardinal, Rochefort est reconnaissable à son cache-oeil noir et son regard perçant. Ce chien sombre et redoutable croise D'Artagnan à de multiples reprises dans des duels et des filatures. Adversaire loyal à sa manière, son respect finit par grandir envers le jeune Gascon qui le bat chaque fois.",r:'rare',p:150},
{id:'tm09',name:'Le Roi Louis XIII',uni:'3 Mousquetaires',uk:'tm',em:'👑',em2:'🐕',color:'#f1c40f',gc:'#f4d03f',desc:"Roi de France aux poils crème et beige, Louis XIII règne avec plus de faiblesse que d'autorité, souvent manipulé par le Cardinal Richelieu qu'il a pourtant lui-même nommé. Sa couronne d'or et ses habits royaux témoignent d'un faste qui cache une personnalité hésitante. Ses Mousquetaires sont sa vraie fierté.",r:'épique',p:230},
{id:'tm10',name:'Jussac',uni:'3 Mousquetaires',uk:'tm',em:'⚔️',em2:'🎩',color:'#7f0000',gc:'#c0392b',desc:'Capitaine des Gardes du Cardinal Richelieu, Jussac est le bras armé du pouvoir religieux face aux Mousquetaires du Roi. Élégant dans son uniforme rouge et noir, plume blanche au chapeau, fine moustache et regard hautain. Maître d\'escrime redoutable, il croisera le fer plus d\'une fois avec d\'Artagnan et les trois inséparables, perdant souvent par excès de confiance.',r:'rare',p:150},
{id:'tn01',name:'Tintin',uni:'Tintin',uk:'tn',em:'🔍',em2:'📰',color:'#3498db',gc:'#74b9ff',desc:"Reporter belge au célèbre houppette blonde, Tintin parcourt le monde au gré de ses enquêtes avec son fidèle fox-terrier Milou. Courageux, honnête et curieux, il déjoue les complots des trafiquants et des dictateurs sur tous les continents. Créé par Hergé, son style Ligne Claire est une révolution visuelle de la BD mondiale.",r:'légendaire',p:350},
{id:'tn02',name:'Capitaine Haddock',uni:'Tintin',uk:'tn',em:'⚓',em2:'🍶',color:'#2c3e50',gc:'#74b9ff',desc:"Marin bourru au grand coeur, Archibald Haddock est le meilleur ami de Tintin. Sa barbe noire, son bonnet de marin et ses jurons colorés — Mille millions de mille sabords ! — le rendent inoubliable. Descendant du chevalier de Hadoque, il héritera du château de Moulinsart. Courageux quand il le faut, il préfère souvent le whisky.",r:'légendaire',p:350},
{id:'tn03',name:'Milou',uni:'Tintin',uk:'tn',em:'🐕',em2:'🦴',color:'#ecf0f1',gc:'#f1c40f',desc:"Fox-terrier blanc et fidèle compagnon de Tintin, Milou commente avec esprit les aventures de son maître dans ses pensées. Courageux à sa manière malgré ses nombreuses frayeurs, son instinct et son courage ont souvent sauvé Tintin dans des situations désespérées. Sa relation avec un os à ronger ou un bon repas est aussi immuable que le soleil.",r:'commun',p:90},
{id:'tn04',name:'Professeur Tournesol',uni:'Tintin',uk:'tn',em:'🔭',em2:'🧪',color:'#27ae60',gc:'#2ecc71',desc:"Cuthbert Tournesol, génie scientifique presque complètement sourd, invente à jet continu des technologies révolutionnaires. Ses lunettes épaisses, son chapeau melon noir et son appareil acoustique dorés en font un personnage unique. Distrait à l'extrême, il n'entend que ce qui l'arrange et ses mauvaises interprétations créent des situations hilarantes.",r:'épique',p:230},
{id:'tn05',name:'Dupond et Dupont',uni:'Tintin',uk:'tn',em:'🎩',em2:'🕵️',color:'#2c3e50',gc:'#7f8c8d',desc:"Duo de détectives identiques mais non apparentés, Dupond et Dupont se distinguent seulement par leur moustache légèrement différente. Leur incompétence chronique, leurs enquêtes ratées et leurs déguisements désastreux sont compensés par leur conviction absolue d'être excellents policiers. Leurs répliques en écho sont immédiatement reconnaissables.",r:'rare',p:150},
{id:'tn06',name:'La Castafiore',uni:'Tintin',uk:'tn',em:'🎵',em2:'💎',color:'#8e44ad',gc:'#bb8fce',desc:"La Diva de Milan, Bianca Castafiore est la cantatrice la plus célèbre — et la plus intrusive — de l'univers de Tintin. Sa voix fracasse les vitres, sa présence envahit Moulinsart et ses bijoux constituent son trésor le plus précieux. Malgré ses airs de grande dame et ses caprices de star, elle possède un coeur sincèrement généreux.",r:'épique',p:230},
{id:'tn07',name:'Rastapopoulos',uni:'Tintin',uk:'tn',em:'🎬',em2:'💰',color:'#7f0000',gc:'#c0392b',desc:'Ennemi juré de Tintin, Roberto Rastapopoulos est un milliardaire mégalomane et magnat du cinéma qui dissimule ses trafics criminels derrière une façade respectable. Cruel et rusé, il est le cerveau de nombreux complots à travers le monde.',r:'épique',p:230},
{id:'tn08',name:'Boris Jorgen',uni:'Tintin',uk:'tn',em:'🎖️',em2:'🔫',color:'#2c3e50',gc:'#7f8c8d',desc:'Colonel Boris Jorgen, espion et homme de main impitoyable. D\'abord aide de camp félon en Syldavie, il réapparaît au service de Rastapopoulos. Froid et méthodique, il incarne la menace militaire récurrente des aventures de Tintin.',r:'rare',p:150},
{id:'ax01',name:'Astérix',uni:'Astérix',uk:'ax',em:'🏺',em2:'💊',color:'#3498db',gc:'#74b9ff',desc:"Petit Gaulois aux grandes idées, Astérix défend son village irréductible contre les légions romaines grâce à la potion magique de Panoramix. Sa casque ailé, sa moustache blonde tombante et son esprit vif en font le héros parfait. Courageux, loyal et d'une intelligence redoutable, il incarne la résistance joyeuse face à l'oppresseur.",r:'légendaire',p:350},
{id:'ax02',name:'Obélix',uni:'Astérix',uk:'ax',em:'🗿',em2:'🐗',color:'#e74c3c',gc:'#f39c12',desc:"Transporteur de menhirs et meilleur ami d'Astérix, Obélix est tombé dans la potion magique étant petit — sa force surhumaine est donc permanente. Ses tresses oranges, son pantalon rayé et son amour immodéré pour les sangliers rôtis le rendent immédiatement reconnaissable. Sa naïveté touchante contraste avec sa force terrifiante.",r:'légendaire',p:350},
{id:'ax03',name:'Idéfix',uni:'Astérix',uk:'ax',em:'🌸',em2:'🐩',color:'#27ae60',gc:'#69f0ae',desc:"Petit chien blanc d'une sensibilité absolue à la nature, Idéfix pleure à chaque arbre abattu. Compagnon fidèle d'Obélix qui le suit partout, ce terrier minuscule possède un courage inversement proportionnel à sa taille. Les fleurs poussent sur son passage et les animaux le comprennent. Son amour pour Obélix est le plus pur du village.",r:'commun',p:90},
{id:'ax04',name:'Panoramix',uni:'Astérix',uk:'ax',em:'🌿',em2:'⚗️',color:'#ecf0f1',gc:'#f1c40f',desc:"Druide du village gaulois, Panoramix prépare la fameuse potion magique qui donne une force surhumaine. Vieil homme sage à longue barbe blanche et robe blanche immaculée, il récolte le gui avec sa faucille en or. Respecté de tous y compris des Romains, sa sagesse millénaire guide le village dans les moments difficiles.",r:'épique',p:230},
{id:'ax05',name:'Assurancetourix',uni:'Astérix',uk:'ax',em:'🎵',em2:'🎻',color:'#9b59b6',gc:'#bb8fce',desc:"Barde du village, Assurancetourix est convaincu d'être un musicien de génie. La réalité est tout autre — ses chants provoquent de la pluie, font fuir les sangliers et rendent les Romains amnésiques. Généralement bâillonné pendant les banquets, il accepte son sort avec philosophie. Quand il peut jouer, tout le village souffre.",r:'commun',p:90},
{id:'ax06',name:'Jules César',uni:'Astérix',uk:'ax',em:'🏛️',em2:'👑',color:'#f1c40f',gc:'#f4d03f',desc:"L'Imperator de Rome, Jules César conquiert le monde entier... sauf un petit village gaulois irréductible. Sa couronne de laurier, sa toge blanche à liseré pourpre et son sceptre d'or en font l'incarnation du pouvoir romain. Respecté même par Astérix pour sa grandeur d'âme, il avoue parfois avec élégance la résistance incoercible des Gaulois.",r:'épique',p:230},
{id:'ax07',name:'Légionnaire romain',uni:'Astérix',uk:'ax',em:'🛡️',em2:'⚔️',color:'#c0392b',gc:'#e74c3c',desc:"Soldat des légions de César, le Légionnaire romain est la chair à canon enthousiaste des aventures d'Astérix. Son casque à panache rouge, son bouclier rectangulaire et sa cuirasse de métal doré ne le protègent jamais des uppercuts gaulois. Son cri de douleur — Aïe ! ou Kaboum ! — ponctue chaque pagaille avec un humour visuel irrésistible.",r:'commun',p:90},
{id:'ax08',name:'Abraracourcix',uni:'Astérix',uk:'ax',em:'🛡️',em2:'👑',color:'#e74c3c',gc:'#ff6b6b',desc:'Chef du village gaulois, Abraracourcix dirige ses irréductibles avec fierté, porté sur son pavois par deux fidèles porteurs (dont il tombe régulièrement). Bon vivant, courageux et un brin susceptible, il ne craint qu\'une chose : que le ciel lui tombe sur la tête.',r:'rare',p:150},
{id:'ax09',name:'Barbe-Rouge',uni:'Astérix',uk:'ax',em:'🏴‍☠️',em2:'⚓',color:'#c0392b',gc:'#e74c3c',desc:'Capitaine des pirates qui croisent sans cesse la route des Gaulois. À chaque rencontre, son navire finit invariablement coulé par Astérix et Obélix. Malgré ses malheurs répétés, Barbe-Rouge garde panache et dignité — c\'est devenu un gag culte de la série.',r:'rare',p:150},
// ── MI / PJ / OT / CO / AL},
{id:'mi01',name:'Marinette / Ladybug',uni:'Miraculous',uk:'mi',em:'🐞',em2:'✨',color:'#e91e8c',gc:'#ff69b4',desc:'Collégienne parisienne en apparence ordinaire, Marinette Dupain-Cheng devient Ladybug grâce au kwami Tikki et son miraculous en forme de boucle d\'oreille. Sa transformation spectaculaire révèle une heroïne en combinaison rouge à pois noirs. Son lucky charm et son cataclysme inversé sauvent Paris chaque jour. Alerte, Miraculous !',r:'légendaire',p:350},
{id:'mi02',name:'Adrien / Chat Noir',uni:'Miraculous',uk:'mi',em:'🐱',em2:'⚡',color:'#27ae60',gc:'#69f0ae',desc:'Mannequin fils du styliste Gabriel Agreste, Adrien cache dans son kwami Plagg le pouvoir de Chat Noir. Sa combinaison noire, ses oreilles de chat et son bâton extensible font de lui le partenaire inséparable de Ladybug. Son Cataclysme détruit tout ce qu\'il touche. Chat Noir, à tes ordres, My Lady !',r:'légendaire',p:350},
{id:'mi03',name:'Gabriel / Papillon',uni:'Miraculous',uk:'mi',em:'🦋',em2:'😈',color:'#9b59b6',gc:'#bb8fce',desc:'Styliste de renom et père d\'Adrien, Gabriel Agreste est en réalité Papillon — le super-vilain qui crée des Akumas pour s\'emparer des miraculous de Ladybug et Chat Noir. Son pouvoir d\'akumatisation transforme les personnes fragilisées en supervilains. Son obsession : ressusciter sa femme Émilie coûte que coûte.',r:'mythique',p:500},
{id:'mi04',name:'Alya Césaire',uni:'Miraculous',uk:'mi',em:'📱',em2:'🦊',color:'#e67e22',gc:'#f39c12',desc:'Meilleure amie de Marinette et journaliste en herbe passionnée, Alya tient le blog Ladyblog consacré aux exploits de Ladybug. Fonceuse et courageuse, elle ne recule devant rien pour filmer l\'héroïne. Alya deviendra occasionnellement Rena Rouge, le super-héros Renard, maniante le pouvoir des illusions.',r:'rare',p:150},
{id:'mi05',name:'Plagg',uni:'Miraculous',uk:'mi',em:'🐱',em2:'🧀',color:'#27ae60',gc:'#1a1a1a',desc:'Kwami de la Destruction lié à l\'anneau miraculeux, Plagg est un petit chat noir aux yeux verts qui vit caché dans le miraculous d\'Adrien. Gourmand et fainéant, son obsession pour le camembert est légendaire. Derrière sa nonchalance, Plagg est l\'une des créatures magiques les plus puissantes de l\'univers miraculous.',r:'rare',p:150},
{id:'mi06',name:'Tikki',uni:'Miraculous',uk:'mi',em:'🐞',em2:'💕',color:'#e91e8c',gc:'#ff69b4',desc:'Kwami de la Création, Tikki est la petite créature rouge à pois noirs qui vit dans les boucles d\'oreilles miraculous de Marinette. Douce, sage et affectueuse, elle guide son hôte avec bienveillance. Existant depuis la nuit des temps, sa sagesse millénaire contraste avec sa taille minuscule mais son énergie rayonnante.',r:'rare',p:150},
{id:'pj01',name:'Gluglu / Gekko',uni:'Pyjamasques',uk:'pj',em:'🦎',em2:'💚',color:'#27ae60',gc:'#2ecc71',desc:'Greg se transforme en Gekko lorsqu\'il enfile son pyjama de gecko vert à la nuit tombée. Ses superpouvoirs incluent l\'adhérence aux murs, une force surhumaine et la capacité de se camoufler. Ses grands yeux jaunes de lézard lui offrent une vision nocturne parfaite. Il protège sa ville avec ses deux amis Catboy et Owlette.',r:'épique',p:230},
{id:'pj02',name:'Yoyo / Catboy',uni:'Pyjamasques',uk:'pj',em:'🐱',em2:'💙',color:'#3498db',gc:'#74b9ff',desc:'Connor devient Catboy dans son pyjama bleu de chat. Le plus rapide des trois héros, il peut courir à la vitesse de l\'éclair, sauter très haut et possède une ouïe surnaturelle. Ses oreilles de chat captent les sons les plus infimes. Le leader naturel de l\'équipe, il affronte Roméo, Sorceline et les Farfeloups avec détermination.',r:'épique',p:230},
{id:'pj03',name:'Bibou / Owlette',uni:'Pyjamasques',uk:'pj',em:'🦉',em2:'❤️',color:'#e74c3c',gc:'#ff6b6b',desc:'Amaya devient Owlette dans sa tenue rouge de chouette. Elle peut voler grâce à ses ailes, voit dans la nuit avec une vision nocturne exceptionnelle et utilise ses disques-plumes comme armes. La plus stratégique du trio, sa détermination et son sang-froid en font la tête pensante de l\'équipe des Pyjamasques.',r:'épique',p:230},
{id:'pj04',name:'Sorceline',uni:'Pyjamasques',uk:'pj',em:'🧙‍♀️',em2:'💜',color:'#9b59b6',gc:'#bb8fce',desc:'Apprentie sorcière et adversaire principale des Pyjamasques, Sorceline jette des sorts depuis son livre de magie et utilise une baguette magique. Capricieuse et imprévisible, ses plans échouent toujours face aux trois héros mais elle ne s\'avoue jamais vaincue. Ses cheveux courts et sa cape sont ses marques distinctives.',r:'rare',p:150},
{id:'pj05',name:'Roméo',uni:'Pyjamasques',uk:'pj',em:'🔧',em2:'🤖',color:'#3498db',gc:'#74b9ff',desc:'Génie inventeur et super-vilain, Roméo fabrique des robots et des gadgets technologiques pour semer le chaos nocturne. Ses lunettes, son labo mobile et ses créations mécaniques en font le cerveau scientifique des méchants. Convaincu de sa supériorité intellectuelle, il est régulièrement déjoué par l\'ingéniosité des Pyjamasques.',r:'rare',p:150},
{id:'pj06',name:'Les Farfeloups',uni:'Pyjamasques',uk:'pj',em:'🐺',em2:'🌕',color:'#e67e22',gc:'#f39c12',desc:'Trio de jeunes loups-garous frères — Loup, Kevin et Ricky — les Farfeloups sèment la pagaille nocturne avec leur énergie débordante. Transformés chaque nuit, ils obéissent à des humeurs capricieuses et leur dynamique de meute rend leurs plans imprévisibles. Leurs yeux jaunes brillent dans la nuit comme des lanternes.',r:'rare',p:150},
{id:'pj07',name:'Tatouro\'Tom / Night Ninja',uni:'Pyjamasques',uk:'pj',em:'🥷',em2:'🌑',color:'#9b59b6',gc:'#bb8fce',desc:'Mystérieux maître ninja des ombres, Tatouro\'Tom commande une armée de Ninjalinos — ses fidèles sbires en combinaison violette. Ses sticky splats collent ses ennemis aux murs tandis qu\'il disparaît dans les ombres. Arrogant et vaniteux, il se considère le meilleur des super-vilains nocturnes de la ville.',r:'épique',p:230},
{id:'ot01',name:'Olivier Atton',uni:'Olive & Tom',uk:'ot',em:'⚽',em2:'🇯🇵',color:'#3498db',gc:'#74b9ff',desc:'Olivier Atton (Tsubasa Ozora en VO), le héros principal du dessin animé Captain Tsubasa. Ses cheveux noirs hirsutes, son maillot bleu et son ballon toujours collé au pied en font une légende. Capitaine surdoué, son rêve : devenir le meilleur footballeur du monde et conduire le Japon à la Coupe du Monde. Le ballon est mon ami.',r:'légendaire',p:350},
{id:'ot02',name:'Thomas Price',uni:'Olive & Tom',uk:'ot',em:'🧤',em2:'🇯🇵',color:'#27ae60',gc:'#2ecc71',desc:'Thomas Price (Genzô Wakabayashi en VO), gardien de but légendaire et ami d\'Olivier. Ses cheveux courts blonds, ses gants de gardien et sa cape verte derrière le but en font une figure marquante. Surnommé Le Gardien Saint, ses arrêts spectaculaires défient les lois de la physique. Sa rivalité-amitié avec Olivier est l\'un des piliers de la série.',r:'épique',p:230},
{id:'ot03',name:'Mark Landers',uni:'Olive & Tom',uk:'ot',em:'⚡',em2:'🇯🇵',color:'#1a3a8a',gc:'#3498db',desc:'Mark Landers (Kojiro Hyuga en VO), avant-centre redoutable de l\'équipe Toho. Ses cheveux noirs hérissés, son visage déterminé et son tir du tigre légendaire en font le rival ultime d\'Olivier. Issu d\'un milieu modeste, son agressivité offensive est légendaire. Quand il attaque, tout tremble. Tigre solitaire au cœur tendre malgré sa façade.',r:'épique',p:230},
{id:'ot04',name:'Ben Becker',uni:'Olive & Tom',uk:'ot',em:'⚽',em2:'🇯🇵',color:'#3498db',gc:'#74b9ff',desc:'Ben Becker (Taro Misaki en VO), meilleur ami d\'Olivier et duo offensif inoubliable. Ses cheveux marron mi-longs et son tempérament calme contrastent avec la fougue d\'Olivier. Maître du caviar et des passes décisives, leur duo Olivier-Ben est l\'un des plus iconiques du sport animé. Fils errant qui voyage de ville en ville à cause du métier de son père.',r:'épique',p:230},
{id:'ot05',name:'Bruce Harper',uni:'Olive & Tom',uk:'ot',em:'⚽',em2:'🇯🇵',color:'#7f8c8d',gc:'#bdc3c7',desc:'Bruce Harper (Ryo Ishizaki en VO), milieu de terrain valeureux mais moins talentueux. Petit, dodu et déterminé, il représente l\'effort et la persévérance face aux talents naturels. Toujours présent pour soutenir ses amis, son courage rachète son manque de talent inné. Le héros que tout le monde peut comprendre, le supporter qui se bat sur le terrain.',r:'rare',p:150},
{id:'ot06',name:'Ed Warner',uni:'Olive & Tom',uk:'ot',em:'🧤',em2:'🇯🇵',color:'#7d3c98',gc:'#9b59b6',desc:'Ed Warner (Ken Wakashimazu en VO), gardien de l\'équipe Toho et rival amical de Thomas Price. Ses cheveux longs blonds attachés en queue de cheval, sa cicatrice et son aura de samouraï le rendent unique. Pratique le karaté et adore mêler arts martiaux et football, faisant de lui un gardien hors-norme. Son cri de guerre est terrifiant.',r:'rare',p:150},
{id:'ot07',name:'Frères Derrick',uni:'Olive & Tom',uk:'ot',em:'👯',em2:'⚽',color:'#27ae60',gc:'#2ecc71',desc:'Les frères Derrick (Kazuo et Masao Tachibana en VO), duo acrobatique inséparable. Cheveux verts identiques, ils maîtrisent des techniques de saut et de tir aérien spectaculaires. Leur Tir Skylab et leurs combinaisons gymniques font d\'eux des attaquants imprévisibles. Toujours synchronisés, leur lien fraternel transcende le terrain.',r:'rare',p:150},
{id:'ot08',name:'Julian Ross',uni:'Olive & Tom',uk:'ot',em:'⚽',em2:'🇯🇵',color:'#74b9ff',gc:'#a8d8ff',desc:'Julian Ross (Jun Misugi en VO), milieu offensif au talent immense mais à la santé fragile. Ses cheveux blonds courts et son visage doux cachent une cardiopathie qui menace ses moments sur le terrain. Surnommé Le Prince du Terrain, son talent égale celui d\'Olivier. Sa fragilité physique mêlée à son courage en fait un personnage poignant et inoubliable.',r:'épique',p:230},
{id:'ot09',name:'Phillip Callahan',uni:'Olive & Tom',uk:'ot',em:'🦅',em2:'🇯🇵',color:'#c0392b',gc:'#e74c3c',desc:'Phillip Callahan (Hikaru Matsuyama en VO), capitaine de l\'équipe Furano dans les montagnes du Hokkaido. Ses cheveux noirs et son tempérament rude inspiré de la nature font de lui un chef respecté. Stratège du jeu en altitude et des conditions difficiles, son équipe joue avec la fierté du nord. Loyal et puissant, c\'est un leader d\'exception.',r:'rare',p:150},
{id:'ot10',name:'Danny Mellow',uni:'Olive & Tom',uk:'ot',em:'⚽',em2:'🇯🇵',color:'#f1c40f',gc:'#f4d03f',desc:'Danny Mellow (Takeshi Sawada en VO), petit attaquant doté d\'un tir extraordinaire pour sa taille. Cheveux blonds courts et silhouette frêle, il ne paie pas de mine mais sa Catapulte Sawada (tir bondissant) déjoue tous les gardiens. Dynamique et opiniâtre, il prouve que la taille n\'a aucune importance dans le sport quand on a la technique.',r:'rare',p:150},
{id:'ot11',name:'Clifford Hume',uni:'Olive & Tom',uk:'ot',em:'⚽',em2:'🇯🇵',color:'#7f8c8d',gc:'#95a5a6',desc:'Clifford Hume (Hiroshi Jito en VO), milieu défensif solide et fiable. Cheveux brun foncé et carrure imposante, il est le mur défensif que les attaquants détestent affronter. Tacles puissants et lecture du jeu impeccable, il représente la défense de l\'équipe nationale junior. Un coéquipier indispensable et discret.',r:'rare',p:150},
{id:'ot12',name:'Sandy Winter',uni:'Olive & Tom',uk:'ot',em:'⚽',em2:'❄️',color:'#74b9ff',gc:'#a8d8ff',desc:'Sandy Winter (Mitsuru Sano en VO), milieu de terrain rapide originaire des régions enneigées. Cheveux gris clair et silhouette agile, il maîtrise la course et les déplacements glissants comme s\'il était sur la glace. Son tir surprise depuis la course est sa marque de fabrique. Un pion stratégique parfait pour les contre-attaques rapides.',r:'commun',p:90},
{id:'ot13',name:'Ralph Peterson',uni:'Olive & Tom',uk:'ot',em:'⚽',em2:'🇯🇵',color:'#bd6f00',gc:'#d4a017',desc:'Ralph Peterson (Makoto Soda en VO), défenseur central robuste et fidèle. Cheveux courts marron, expression toujours sérieuse, il forme avec ses partenaires défensifs un mur infranchissable. Sa technique de tacle glissé est redoutable. Loyal envers son capitaine et toujours prêt à se sacrifier pour bloquer le ballon, c\'est un défenseur exemplaire.',r:'commun',p:90},
{id:'ot14',name:'Karl Heinz Schneider',uni:'Olive & Tom',uk:'ot',em:'⚡',em2:'🇩🇪',color:'#1a1a1a',gc:'#f1c40f',desc:'Karl Heinz Schneider, l\'Empereur du football allemand et capitaine de l\'équipe d\'Allemagne junior. Ses cheveux blonds courts coiffés en arrière, son aura royale et son tir foudroyant Feuerschuss en font le grand rival international d\'Olivier. Stratège génial, sa noblesse et sa prestance le rendent fascinant. L\'antagoniste le plus charismatique de la série.',r:'légendaire',p:350},
{id:'ot15',name:'Deuter Muller',uni:'Olive & Tom',uk:'ot',em:'🛡️',em2:'🇩🇪',color:'#7f8c8d',gc:'#95a5a6',desc:'Deuter Muller, géant défensif allemand, complément parfait de Schneider. Cheveux courts blonds et carrure de colosse, ses tacles dévastateurs et sa présence physique en font un mur infranchissable. Surnommé Le Kaiser, sa rigueur germanique et son intransigeance défensive sont légendaires. Capable de bloquer même les tirs les plus puissants.',r:'rare',p:150},
{id:'ot16',name:'Elcide Pierre',uni:'Olive & Tom',uk:'ot',em:'⚽',em2:'🇫🇷',color:'#3498db',gc:'#74b9ff',desc:'Elcide Pierre, attaquant français au talent éclatant. Cheveux mi-longs blonds vénitiens et silhouette élancée, sa technique tout en finesse contraste avec la puissance brute des autres attaquants. Maître des dribbles élégants et des feintes subtiles, il représente le football champagne à la française. Charismatique et imprévisible.',r:'rare',p:150},
{id:'ot17',name:'Louis Napoleon',uni:'Olive & Tom',uk:'ot',em:'👑',em2:'🇫🇷',color:'#1a3a8a',gc:'#3498db',desc:'Louis Napoleon, capitaine de l\'équipe de France junior. Cheveux longs noirs en arrière et regard noble, il dirige son équipe avec une prestance d\'aristocrate. Stratège génial et joueur complet, il combine élégance et efficacité. Surnommé Le Petit Empereur, son leadership inspire ses coéquipiers à se dépasser à chaque match.',r:'épique',p:230},
{id:'ot18',name:'Zino Hernandez',uni:'Olive & Tom',uk:'ot',em:'⚽',em2:'🇮🇹',color:'#27ae60',gc:'#c0392b',desc:'Zino Hernandez, attaquant italien à la technique étincelante. Cheveux noirs ondulés et regard ardent, son toucher de balle italien et ses passements de jambes redoutables font des défenseurs des spectateurs. Membre de la Squadra Azzurra junior, son tempérament méditerranéen et sa fougue offensive en font un attaquant délicieux à voir jouer.',r:'rare',p:150},
{id:'ot19',name:'Salvatore Gentile',uni:'Olive & Tom',uk:'ot',em:'🛡️',em2:'🇮🇹',color:'#7f8c8d',gc:'#bdc3c7',desc:'Salvatore Gentile, défenseur italien légendaire au catenaccio impeccable. Cheveux courts noirs et regard sévère, il incarne la défense italienne implacable. Précis, dur et stratégique, il marque l\'attaquant adverse comme une ombre. Sa rigueur tactique transalpine est l\'âme de la Squadra Azzurra junior.',r:'commun',p:90},
{id:'ot20',name:'Natureza',uni:'Olive & Tom',uk:'ot',em:'⚡',em2:'🇧🇷',color:'#f1c40f',gc:'#27ae60',desc:'Natureza, attaquant prodige brésilien aux cheveux longs noirs sauvages. Surnommé Le Phénomène, sa créativité technique et sa capacité d\'invention ballon au pied font de lui un magicien du football. Originaire des favelas, son samba football enchanteresse rappelle les plus grands joueurs brésiliens. Imprévisible et irrésistible.',r:'épique',p:230},
{id:'ot21',name:'Juan Diaz',uni:'Olive & Tom',uk:'ot',em:'⚽',em2:'🇦🇷',color:'#74b9ff',gc:'#a8d8ff',desc:'Juan Diaz, capitaine génial de l\'équipe d\'Argentine junior. Cheveux noirs bouclés courts et silhouette ramassée typiquement argentine, sa technique de dribble en fait un magicien. Surnommé La Pulga, sa vision du jeu et sa technique exceptionnelle évoquent les plus grands joueurs argentins. Petit physiquement, immense techniquement.',r:'rare',p:150},
{id:'ot22',name:'Patty',uni:'Olive & Tom',uk:'ot',em:'❤️',em2:'🇯🇵',color:'#e91e8c',gc:'#ff69b4',desc:'Patty (Sanae Nakazawa en VO), amie d\'enfance et premier amour d\'Olivier. Cheveux courts marron, son sourire radieux et son optimisme inébranlable encouragent l\'équipe en supportrice loyale. Capitaine de l\'équipe féminine, c\'est aussi une joueuse talentueuse. Future femme d\'Olivier dans Captain Tsubasa World Youth, son amour est l\'un des piliers émotionnels de la série.',r:'rare',p:150},
{id:'ot23',name:'Roberto Sedinho',uni:'Olive & Tom',uk:'ot',em:'⚽',em2:'🇧🇷',color:'#f1c40f',gc:'#27ae60',desc:'Roberto Sedinho (Roberto Hongo en VO), légende brésilienne et mentor d\'Olivier. Cheveux courts noirs et expérience marquée sur son visage, c\'est lui qui a appris à Olivier que le ballon est ton ami. Star mondiale du football brésilien, sa vision du jeu et sa philosophie du beau football ont façonné le héros que devient Olivier. Maître ultime.',r:'légendaire',p:350},
{id:'co01',name:'Cobra',uni:'Cobra',uk:'co',em:'🔫',em2:'🌌',color:'#e74c3c',gc:'#ff6b6b',desc:'Pirate de l\'espace légendaire de la BD de Buichi Terasawa, Cobra cache son identité sous un déguisement ordinaire. Son arme unique — le psychogun intégré dans son bras gauche — tire des rayons psychiques dévastateurs. Flambeur, séducteur et courageux, avec son cigare éternel et sa veste rouge, Cobra est l\'aventurier le plus cool de la galaxie.',r:'mythique',p:500},
{id:'co02',name:'Armanoïde',uni:'Cobra',uk:'co',em:'🤖',em2:'💙',color:'#ecf0f1',gc:'#74b9ff',desc:'Fidèle androïde de compagnie, Armanoïde est un robot féminin aux capacités de combat redoutables. Son apparence humaine masque une technologie avancée — capteurs, armes intégrées et force surhumaine. Sa loyauté absolue envers Cobra et sa façon unique de percevoir l\'humanité en font un personnage touchant et fascinant.',r:'épique',p:230},
{id:'co03',name:'Jane',uni:'Cobra',uk:'co',em:'🌹',em2:'🔴',color:'#27ae60',gc:'#2ecc71',desc:'Alliée aux cheveux roux flamboyants, Jane est une combattante intrépide qui évolue dans l\'univers impitoyable des pirates de l\'espace. Sa loyauté envers Cobra et sa vaillance au combat font d\'elle une partenaire précieuse. Derrière sa beauté éclatante se cache une guerrière capable de tenir tête aux créatures les plus dangereuses de la galaxie.',r:'rare',p:150},
{id:'co04',name:'L\'homme de cristal',uni:'Cobra',uk:'co',em:'💎',em2:'❄️',color:'#74b9ff',gc:'#a8d8ff',desc:'Villain mystérieux dont le corps entier est constitué de cristaux translucides, L\'homme de cristal est l\'un des adversaires les plus intimidants de Cobra. Ses facettes réfractent la lumière de façon hypnotique tandis que ses pouvoirs cristallins peuvent pétrifier ses ennemis. Son origine demeure mystérieuse même pour les Archives galactiques.',r:'épique',p:230},
{id:'co05',name:'Salamandar',uni:'Cobra',uk:'co',em:'🦎',em2:'🔥',color:'#27ae60',gc:'#2ecc71',desc:'Redoutable bras droit de Crystal Boy, Salamandar est un guerrier reptilien capable de cracher des flammes dévastatrices. Sa peau écailleuse résiste aux tirs du Psychogun et son sang-froid en combat en fait l\'un des adversaires les plus coriaces que Cobra ait affrontés.',r:'épique',p:230},
{id:'co06',name:'Tarbeige',uni:'Cobra',uk:'co',em:'❄️',em2:'💎',color:'#74b9ff',gc:'#a8d8ff',desc:'Guerrière de glace au service du Pirate Guild, Tarbeige manie le froid absolu pour figer ses ennemis. Élégante et impitoyable, sa beauté glaciale dissimule une cruauté sans limite. Elle pousse Cobra dans ses derniers retranchements.',r:'rare',p:150},
{id:'co07',name:'Pirate de l\'espace',uni:'Cobra',uk:'co',em:'🏴‍☠️',em2:'🔫',color:'#2c3e50',gc:'#7f8c8d',desc:'Membre du redoutable Pirate Guild qui traque Cobra à travers la galaxie. Armé jusqu\'aux dents et sans pitié, ce pirate de l\'espace incarne la menace constante qui pèse sur le hors-la-loi le plus recherché de l\'univers.',r:'commun',p:90},
{id:'co08',name:'Cobra Rugball',uni:'Cobra',uk:'co',em:'🏉',em2:'💥',color:'#e67e22',gc:'#f0a050',desc:'Cobra sous l\'identité de Joe Gillian, champion du Rugball — sport spatial le plus violent de la galaxie. Sous ce déguisement sportif, le pirate dissimule son Psychogun et son passé légendaire, prouvant qu\'il excelle dans tous les domaines.',r:'épique',p:230},
{id:'al01',name:'Albator',uni:'Albator',uk:'al',em:'☠️',em2:'🚀',color:'#c0392b',gc:'#e74c3c',desc:'Capitaine Harlock en France, Albator est le pirate de l\'espace le plus légendaire de la galaxie. Sa cape noire, sa cicatrice sur l\'oeil gauche et l\'emblème tête de mort sur son vaisseau l\'Atlantis le rendent immédiatement reconnaissable. Rebelle libre qui refuse la soumission face à l\'envahisseur Mazone, il combat pour la liberté de l\'humanité.',r:'mythique',p:500},
{id:'al02',name:'Alfred',uni:'Albator',uk:'al',em:'💪',em2:'🤝',color:'#7f8c8d',gc:'#95a5a6',desc:'L\'homme de confiance d\'Albator, Alfred est un compagnon de route massif et loyal qui partage les aventures du pirate stellaire depuis des années. Sa force physique imposante et son dévouement sans failles font de lui le pilier de l\'équipage de l\'Atlantis. Derrière sa façade bourrue se cache un coeur d\'une générosité absolue.',r:'rare',p:150},
{id:'al03',name:'Nausicaa',uni:'Albator',uk:'al',em:'🌹',em2:'💙',color:'#3498db',gc:'#74b9ff',desc:'Membre de l\'équipage de l\'Atlantis, Nausicaa est une guerrière spatiale au caractère affirmé qui a choisi la voie de la liberté aux côtés d\'Albator. Sa détermination et ses compétences en combat rapproché en font une alliée indispensable. Son regard bleu acier reflète la vastitude des espaces interstellaires qu\'elle parcourt.',r:'rare',p:150},
{id:'al04',name:'Tochirô',uni:'Albator',uk:'al',em:'🗡️',em2:'🍶',color:'#e67e22',gc:'#f39c12',desc:'Meilleur ami d\'Albator et concepteur de l\'Atlantis, Tochirô est un forgeron de génie malgré sa petite stature. D\'origine japonaise, sa maîtrise du sabre est absolue et sa sagesse nippone guide l\'équipage dans les moments sombres. Son lien spirituel avec l\'Atlantis transcende la mort — son âme vit dans les circuits du vaisseau.',r:'épique',p:230},
{id:'al05',name:'Esmeralda',uni:'Albator',uk:'al',em:'✨',em2:'🌸',color:'#9b59b6',gc:'#bb8fce',desc:'Mystérieuse femme liée à Albator par un passé complexe, Esmeralda est un personnage central de la saga. Sa présence magnétique et ses yeux violets profonds cachent des secrets qui touchent au destin même du capitaine. Courageuse jusqu\'à l\'abnégation, son sacrifice résonnera dans toute la galaxie comme un chant de liberté.',r:'épique',p:230},
{id:'al06',name:'L\'Atlantis',uni:'Albator',uk:'al',em:'🛸',em2:'☠️',color:'#e74c3c',gc:'#c0392b',desc:'Vaisseau spatial légendaire d\'Albator, l\'Atlantis porte la tête de mort emblématique qui fait trembler les flottes Mazone. Conçu par le génie de Tochirô, ce croiseur stellaire abrite l\'âme de son créateur dans ses circuits. Invincible et fidèle, l\'Atlantis est plus qu\'un navire — c\'est le symbole vivant de la résistance à l\'oppression.',r:'légendaire',p:350},
{id:'al07',name:'Mima',uni:'Albator',uk:'al',em:'🎵',em2:'👽',color:'#9b59b6',gc:'#c880e0',desc:'Mystérieuse extra-terrestre et amie fidèle d\'Albator, Mima est la dernière survivante d\'un peuple disparu. Elle joue d\'un instrument céleste et veille en silence sur l\'équipage de l\'Atlantis. Sa présence éthérée apporte sérénité et sagesse au navire.',r:'épique',p:230},
{id:'al08',name:'Professeur Zon',uni:'Albator',uk:'al',em:'🔬',em2:'⚗️',color:'#16a085',gc:'#48c9b0',desc:'Savant énigmatique gravitant autour des aventures d\'Albator. Le Professeur Zon met son génie scientifique au service de causes troubles, devenant tantôt allié de circonstance, tantôt obstacle pour le pirate de l\'espace.',r:'rare',p:150},
// ── TU / SM / SP / BL / DR},
{id:'tu01',name:'Leonardo',uni:'Tortues Ninja',uk:'tu',em:'💙',em2:'⚔️',color:'#3498db',gc:'#74b9ff',desc:'Chef des Tortues Ninja au bandeau bleu, Leonardo est le guerrier le plus discipliné du groupe. Ses deux katanas tranchent l\'air avec une précision chirurgicale héritée de l\'enseignement de Splinter. Loyal, courageux et dévoué à la justice, il porte le poids du leadership avec sérieux. Après l\'honneur vient la victoire.',r:'légendaire',p:350},
{id:'tu02',name:'Raphael',uni:'Tortues Ninja',uk:'tu',em:'❤️',em2:'🔱',color:'#e74c3c',gc:'#ff6b6b',desc:'La tortue au bandeau rouge et aux deux saïs acérés, Raphael est le combattant le plus féroce du groupe. Son tempérament bouillant et son ego surdimensionné cachent une loyauté absolue envers ses frères. Ses coups puissants et son style de combat agressif font de lui le guerrier le plus redouté dans une rixe.',r:'épique',p:230},
{id:'tu03',name:'Donatello',uni:'Tortues Ninja',uk:'tu',em:'💜',em2:'🔧',color:'#9b59b6',gc:'#bb8fce',desc:'Génie technologique du groupe au bandeau violet, Donatello manie son bâton bo avec une précision remarquable. Cerveau des Tortues, il conçoit tous les gadgets et véhicules — de la Tortue-mobile aux systèmes de surveillance des égouts. Philosophe et pacifiste, il préfère souvent la solution inventive à la confrontation directe.',r:'épique',p:230},
{id:'tu04',name:'Michelangelo',uni:'Tortues Ninja',uk:'tu',em:'🍕',em2:'🟠',color:'#e67e22',gc:'#f39c12',desc:'La tortue au bandeau orange et aux nunchakus tourbillonnants, Michelangelo est l\'esprit de l\'équipe. Gourmand de pizza et amateur de surf, sa bonne humeur permanente apporte une légèreté indispensable. Derrière sa façade décontractée se cache un combattant exceptionnellement agile. Cowabunga, dude !',r:'épique',p:230},
{id:'tu05',name:'Splinter',uni:'Tortues Ninja',uk:'tu',em:'🐭',em2:'🎋',color:'#9a9a9a',gc:'#ecf0f1',desc:'Maître rat sensei des Tortues Ninja, Splinter était autrefois le rat de compagnie du maître ninja Hamato Yoshi. Exposé aux mêmes déchets mutagènes que les tortues, il devient un rat humanoïde sage et redoutable. Son enseignement du ninjutsu mêle discipline physique et philosophie orientale. Son amour paternel est inconditionnel.',r:'légendaire',p:350},
{id:'tu06',name:'April O\'Neil',uni:'Tortues Ninja',uk:'tu',em:'📹',em2:'💛',color:'#f1c40f',gc:'#f4d03f',desc:'Journaliste en combinaison jaune et meilleure amie humaine des Tortues, April O\'Neil est la passerelle entre les héros des égouts et le monde des humains. Courageuse et déterminée, elle n\'hésite jamais à plonger dans l\'action avec son micro pour rapporter la vérité. Sa solidarité avec les Tortues est totale.',r:'rare',p:150},
{id:'tu07',name:'Shredder',uni:'Tortues Ninja',uk:'tu',em:'⚡',em2:'💀',color:'#95a5a6',gc:'#ecf0f1',desc:'Oroku Saki alias le Shredder est le grand ennemi des Tortues Ninja. Chef du Clan du Pied, son armure hérissée de lames tranchantes en fait l\'adversaire le plus redouté de New York. Ancien rival de Hamato Yoshi au Japon, sa haine pour Splinter et ses élèves est viscérale et implacable.',r:'mythique',p:500},
{id:'sm01',name:'Sailor Moon',uni:'Sailor Moon',uk:'sm',em:'🌙',em2:'💖',color:'#3498db',gc:'#ff69b4',desc:'Usagi Tsukino, lycéenne maladroite et rêveuse, devient Sailor Moon — la guerrière de la justice. Ses odangos blonds caractéristiques et son uniforme bleu et blanc sont iconiques. Pleureuse et gourmande en temps normal, elle révèle une force intérieure extraordinaire au combat. Moon Prism Power, Make Up !',r:'légendaire',p:350},
{id:'sm02',name:'Sailor Mars',uni:'Sailor Moon',uk:'sm',em:'🔥',em2:'⛩️',color:'#c0392b',gc:'#e74c3c',desc:'Rei Hino, miko du sanctuaire Hikawa, est Sailor Mars. Ses longs cheveux noirs et ses yeux violets en font une beauté intimidante. Psychique et directe, sa technique Mars Flame Sniper est dévastatrice. Fière et parfois acerbe avec Usagi, elle est pourtant l\'une de ses alliées les plus loyales dans les moments critiques.',r:'épique',p:230},
{id:'sm03',name:'Sailor Venus',uni:'Sailor Moon',uk:'sm',em:'💛',em2:'💕',color:'#e67e22',gc:'#f1c40f',desc:'Minako Aino est Sailor Venus, la première Sailor Scout à avoir été éveillée. Sa longue chevelure blonde retenue par un noeud orange est sa marque. Énergique et extravertie, rêvant de devenir idole, elle manie le Venus Love-Me Chain avec élégance. Elle est aussi Sailor V, ancienne protectrice de justice de Londres.',r:'épique',p:230},
{id:'sm04',name:'Sailor Mercury',uni:'Sailor Moon',uk:'sm',em:'💙',em2:'📊',color:'#3498db',gc:'#74b9ff',desc:'Ami Mizuno, génie scolaire avec un QI de 300, est Sailor Mercury. Ses courts cheveux bleus et sa timidité naturelle cachent une combattante redoutable. Son ordinateur Mercury lui donne une vue analytique de chaque situation. Mercury Aqua Rhapsody gèle et noie ses adversaires dans une vague de mercure.',r:'épique',p:230},
{id:'sm05',name:'Sailor Jupiter',uni:'Sailor Moon',uk:'sm',em:'⚡',em2:'🌹',color:'#27ae60',gc:'#2ecc71',desc:'Makoto Kino, la plus grande et la plus forte des Sailor Scouts, est Sailor Jupiter. Rousse en queue de cheval, elle allie force physique et arts martiaux à ses pouvoirs d\'éclair et de fleurs. Excellente cuisinière nostalgique de son premier amour, ses coups Jupiter Oak Evolution font trembler les Ennemis de la Lune.',r:'épique',p:230},
{id:'sp01',name:'Clover',uni:'Totally Spies',uk:'sp',em:'🩷',em2:'💄',color:'#e91e8c',gc:'#ff69b4',desc:'Blonde fashionista de Beverly Hills, Clover est la plus coquette des trois espionnes du WOOHP. Sa combinaison rose et son compucat au poignet n\'effacent pas sa passion pour la mode, les garçons et le shopping. Derrière ses airs superficiels se cache une agente d\'élite dont les réflexes et l\'instinct surprennent toujours.',r:'épique',p:230},
{id:'sp02',name:'Sam',uni:'Totally Spies',uk:'sp',em:'💚',em2:'🧠',color:'#27ae60',gc:'#2ecc71',desc:'Rouquine brillante et leader intellectuelle du trio, Sam est la stratège du groupe. Sa combinaison verte et son sens tactique exceptionnel font d\'elle la plus fiable en mission. Sérieuse et responsable, elle compense les impulsions de Clover et la maladresse d\'Alex avec une analyse froide et une adaptabilité sans failles.',r:'épique',p:230},
{id:'sp03',name:'Alex',uni:'Totally Spies',uk:'sp',em:'💛',em2:'🐾',color:'#f1c40f',gc:'#f4d03f',desc:'Athlétique et sportive, Alex est la plus instinctive des trois espionnes. Sa combinaison jaune et son amour des animaux la rendent unique. Maladroite dans la vie quotidienne mais d\'une agilité parfaite en combat, elle compense son manque de méthode par un courage inné. Son enthousiasme communicatif booste toujours l\'équipe.',r:'épique',p:230},
{id:'sp04',name:'Jerry',uni:'Totally Spies',uk:'sp',em:'🕴️',em2:'🏢',color:'#2c3e50',gc:'#74b9ff',desc:'Jerry Lewis, directeur de la WOOHP — World Organization Of Human Protection — est le patron hilarant des trois espionnes. Sa moustache grise impeccable et son noeud papillon rouge en font un personnage reconnaissable. Toujours équipé des gadgets les plus sophistiqués à distribuer, il appelle les filles depuis les endroits les plus improbables.',r:'rare',p:150},
{id:'sp05',name:'Mandy',uni:'Totally Spies',uk:'sp',em:'👑',em2:'💜',color:'#9b59b6',gc:'#bb8fce',desc:'Rivale jalouse et snob des trois espionnes à Beverly Hills High School, Mandy est la nemesis sociale du trio. Toujours en compétition avec Clover, Sam et Alex dans la vie civile, elle ne sait pas qu\'elles sont des espionnes. Son arrogance et ses plans pour les humilier échouent systématiquement de la façon la plus cocasse.',r:'commun',p:90},
{id:'bl01',name:'Bluey',uni:'Bluey',uk:'bl',em:'🐕',em2:'💙',color:'#3498db',gc:'#74b9ff',desc:'Chiot bleu-gris de six ans de la famille Heeler, Bluey est une petite chienne australienne à l\'imagination débordante. Ses jeux inventifs entraînent toute la famille dans des aventures extraordinaires. Curieuse, créative et espiègle, elle apprend à naviguer la vie avec ses parents Bandit et Chilly. Champion des jeux de faire-semblant !',r:'légendaire',p:350},
{id:'bl02',name:'Bingo',uni:'Bluey',uk:'bl',em:'🧡',em2:'🐕',color:'#e67e22',gc:'#f39c12',desc:'Petite soeur d\'Bluey, Bingo est un chiot orange de quatre ans plus sensible et réservée que sa grande soeur. Sa douceur naturelle et son empathie touchante en font un personnage particulièrement attachant. Ses émotions intenses et sa façon de traiter les obstacles de la vie avec maturité surprennent régulièrement ses parents.',r:'épique',p:230},
{id:'bl03',name:'Bandit',uni:'Bluey',uk:'bl',em:'🐕',em2:'👨',color:'#2c3e50',gc:'#3498db',desc:'Papa d\'Bluey et Bingo, Bandit Heeler est un archéologue aux airs de grand enfant qui participe avec enthousiasme aux jeux de ses filles. Son humour, sa tendresse et sa volonté de toujours être présent en font l\'un des meilleurs pères de la fiction animée. Sa patience et ses leçons de vie discrètes sont infiniment touchantes.',r:'légendaire',p:350},
{id:'bl04',name:'Chilly',uni:'Bluey',uk:'bl',em:'🐕',em2:'👩',color:'#e91e8c',gc:'#ff69b4',desc:'Maman d\'Bluey et Bingo, Chilly Heeler jongle avec sa carrière de physiothérapeute et ses responsabilités familiales avec une grâce remarquable. Aimante, drôle et parfois dépassée par ses gamines, elle montre aux enfants que les adultes ne sont pas parfaits. Ses conseils bienveillants et sa présence apaisante rayonnent dans chaque épisode.',r:'épique',p:230},
{id:'bl05',name:'Rusty',uni:'Bluey',uk:'bl',em:'🐕',em2:'🔴',color:'#c0392b',gc:'#e74c3c',desc:'Chiot rouge ami de Bluey, Rusty est le fils d\'un soldat souvent absent pour le travail. Sa bravoure tranquille et son imagination militaire colorent ses jeux avec Bluey. Garçon sérieux mais joueur, sa relation avec Bluey illustre magnifiquement l\'amitié simple et sincère entre enfants de milieux différents.',r:'commun',p:90},
{id:'bl06',name:'Honey',uni:'Bluey',uk:'bl',em:'🐕',em2:'💛',color:'#f1c40f',gc:'#f4d03f',desc:'Chiot doré amie d\'Bluey, Honey est une petite chienne douce aux grandes oreilles tombantes. Sa curiosité naturelle et ses réactions expressives face aux situations de la vie quotidienne en font une compagne de jeu parfaite pour Bluey. Son innocence touchante rappelle la pureté de l\'enfance dans toute sa splendeur.',r:'commun',p:90},
{id:'dr01',name:'Harold',uni:'Dragons',uk:'dr',em:'🛡️',em2:'⚙️',color:'#5d4a2a',gc:'#8B6914',desc:'Hiccup Horrendous Haddock III — Harold en France — est le fils du chef viking Stoïck. Chétif et inventif dans un monde de brutes, il renverse l\'ordre établi en deviant le meilleur ami d\'un dragon Furie Nocturne. Son intelligence mécanique et sa prothèse de jambe qu\'il conçoit lui-même le rendent unique. C\'est lui le héros.',r:'légendaire',p:350},
{id:'dr02',name:'Krokmou',uni:'Dragons',uk:'dr',em:'🐉',em2:'🖤',color:'#111',gc:'#2ecc71',desc:'Furie Nocturne noire aux yeux vert émeraude, Krokmou est le dragon le plus rare et le plus puissant de l\'archipel. Son lien avec Harold est la relation inter-espèces la plus touchante de tout le cinéma d\'animation. Joueur comme un chat, loyal comme un chien, redoutable comme un dragon. Son sourire à dents rétractables est culte.',r:'mythique',p:500},
{id:'dr03',name:'Astrid',uni:'Dragons',uk:'dr',em:'⚔️',em2:'💛',color:'#3498db',gc:'#f1c40f',desc:'Meilleure guerrière de la bande des jeunes vikings, Astrid Hofferson ne pardonne jamais une faiblesse — sauf à Harold qu\'elle finit par aimer. Ses longues tresses blondes, sa hache redoutable et son dragon Tempête en font la combattante la plus impressionnante de Beurk. Son instinct protecteur est aussi fort que son coup de poing.',r:'légendaire',p:350},
{id:'dr04',name:'Stoïck',uni:'Dragons',uk:'dr',em:'👑',em2:'🔥',color:'#5d4a2a',gc:'#e67e22',desc:'Grand chef du village de Beurk, Stoïck l\'Immense est une montagne de muscles surmontée d\'une barbe rousse flamboyante. Père aimant mais maladroit avec Harold, il comprend progressivement la valeur de son fils. Sa transformation d\'ennemi juré des dragons en allié est l\'un des arcs les plus émouvants de la trilogie.',r:'épique',p:230},
{id:'dr05',name:'Rustik',uni:'Dragons',uk:'dr',em:'⚡',em2:'🟤',color:'#8B6914',gc:'#c8a030',desc:'L\'une des jumelles Thorston, Rustik est la plus agressive des deux. Elle monte la tête de Barf du dragon bicéphale Barf & Belch avec son frère Crochefer. Sa personnalité explosive et ses plans toujours ratés avec son jumeau créent les situations les plus comiques de toute la série Beurk. Chamailleries garanties.',r:'rare',p:150},
{id:'dr06',name:'Kognedur',uni:'Dragons',uk:'dr',em:'🔥',em2:'🔴',color:'#c0392b',gc:'#e74c3c',desc:'Terrible Terreur Monstrueuse, le dragon de Varek. Dragon Nightmare Monstrueux au plumage rouge enflammé, Kognedur est aussi têtu et impulsif que son dresseur Varek. Sa flamme produit un gel inflammable qui s\'enflamme au contact de l\'oxygène, permettant des attaques dévastatrices en plusieurs vagues. Redoutable mais indompté.',r:'rare',p:150},
{id:'dr07',name:'Kranedur',uni:'Dragons',uk:'dr',em:'💨',em2:'🟢',color:'#27ae60',gc:'#2ecc71',desc:'Dragon bicéphale Barf & Belch monté par les jumeaux Thorston, Kranedur possède deux têtes avec des personnalités distinctes. Une tête crache du gaz, l\'autre l\'enflamme — créant des explosions dévastatrices. Cette coordination douteuse reflète parfaitement l\'incapacité des jumeaux à s\'entendre. Chaotique et involontairement comique.',r:'épique',p:230},
{id:'dr08',name:'Gueulfor',uni:'Dragons',uk:'dr',em:'🪨',em2:'💚',color:'#8B6914',gc:'#c8a030',desc:'Dragon Gronckle bedonnant de Fishlegs, Gueulfor est la définition du dragon peu conventionnel. Rebondi, lent et ronfleur, il compense sa lenteur par une carapace indestructible et une capacité à manger des roches pour cracher de la lave. Aussi affectueux que son dresseur, il dément tous les clichés du dragon impressionnant.',r:'rare',p:150},
{id:'dr09',name:'Varek',uni:'Dragons',uk:'dr',em:'💪',em2:'🔥',color:'#8B4513',gc:'#e67e22',desc:'Varek Jorgenson, cousin de Stoïck et rival autoproclamé d\'Harold. Trapu, arrogant et obsédé par sa propre gloire, Varek se présente comme le meilleur dresseur de dragons avant d\'être systématiquement dépassé par Harold. Son dragon Kognedur le jette régulièrement. Son ego inversement proportionnel à ses compétences est hilarant.',r:'rare',p:150},
{id:'dr10',name:'Tempête',uni:'Dragons',uk:'dr',em:'🌊',em2:'💙',color:'#3498db',gc:'#74b9ff',desc:'Piqueur Mortel bleu d\'Astrid, Tempête est l\'une des dragons les plus gracieuses et fidèles de Beurk. Ses épines dorsales rotatives lui permettent des déplacements d\'une agilité stupéfiante. Sa complicité avec Astrid reflète la relation maîtresse-dragonnet la plus élégante de la saga. Rapide comme l\'éclair, loyale comme le roc.',r:'épique',p:230},
{id:'dr11',name:'Bouledogre',uni:'Dragons',uk:'dr',em:'🪨',em2:'💛',color:'#6d4c00',gc:'#c8a030',desc:'Gronckle doré de Fishlegs, Bouledogre est le dragon le plus improbable de Beurk — bedonnant, lent et ronflement assourdissant. Pourtant sa carapace indestructible et sa capacité à cracher de la lave volcanique en font une arme redoutable. Fishlegs l\'aime pour sa vraie valeur, démontrant que chaque dragon a sa place.',r:'rare',p:150},
{id:'dr12',name:'Pète et Prout',uni:'Dragons',uk:'dr',em:'🌀',em2:'👥',color:'#8B6914',gc:'#f1c40f',desc:'Les jumeaux Thorston — Rustik et Crochefer — sont les membres les plus chaotiques et comiques de la bande d\'Harold. Incapables de s\'entendre mais inséparables, ils pilotent ensemble leur dragon bicéphale Kranedur. Leurs disputes constantes, leurs plans foireux et leur rivalité fraternelle apportent l\'humour indispensable à chaque épisode.',r:'rare',p:150},
{id:'dr13',name:'Crochefer',uni:'Dragons',uk:'dr',em:'🦅',em2:'💜',color:'#9b59b6',gc:'#bb8fce',desc:'Dragon à quatre ailes de type Stormcutter, Crochefer est l\'un des dragons les plus rares et majestueux de l\'archipel. Ses quatre ailes lui permettent des manoeuvres aériennes impossibles pour les autres espèces. Indépendant et farouche, son intelligence dépasse celle de la plupart de ses congénères. Magnifique et imprévisible.',r:'épique',p:230},
// ═══════════════════════════════════════════════════════
// FIGURINES EXCLUSIVES — Chantier 2.2 (boss saisonniers et anniversaires)
// Non-achetables (p:0) — uniquement obtenues en battant le boss correspondant
// ═══════════════════════════════════════════════════════
{id:'dc01',name:'Batman',uni:'DC Comics',uk:'dc',em:'🦇',em2:'🌃',color:'#1a1a1a',gc:'#7f8c8d',desc:'Bruce Wayne, milliardaire de Gotham City, devient Batman pour venger ses parents assassinés. Cape noire imposante, masque pointu et bat-symbol jaune sur la poitrine en font le justicier ultime. Sans super-pouvoirs, sa fortune, son intelligence et son entraînement martial intensif le hissent au niveau des plus grands héros. Le Chevalier Noir veille sur Gotham la nuit.',r:'légendaire',p:350},
{id:'dc02',name:'Robin',uni:'DC Comics',uk:'dc',em:'🐦',em2:'🟢',color:'#27ae60',gc:'#e74c3c',desc:'Dick Grayson, jeune acrobate orphelin recueilli par Bruce Wayne, devient le premier Robin. Costume vert et rouge éclatant, masque noir, il accompagne Batman dans ses missions à Gotham. Saut et arts martiaux dans le sang, son énergie juvénile contraste avec la noirceur de son mentor. Plus tard, il deviendra Nightwing pour voler de ses propres ailes.',r:'rare',p:150},
{id:'dc03',name:'Le Joker',uni:'DC Comics',uk:'dc',em:'🃏',em2:'😈',color:'#7d3c98',gc:'#27ae60',desc:'Le clown criminel le plus dangereux de Gotham, Le Joker est la nemesis éternelle de Batman. Peau blanche cadavérique, cheveux verts, sourire écarlate permanent et costume violet, il sème le chaos par pur amusement. Son rire glaçant résonne dans les rues. Imprévisible, intelligent, sadique : le pire cauchemar du Chevalier Noir incarné en folie pure.',r:'légendaire',p:350},
{id:'dc04',name:'Le Pingouin',uni:'DC Comics',uk:'dc',em:'🐧',em2:'☂️',color:'#1a1a1a',gc:'#9b59b6',desc:'Oswald Cobblepot, le Pingouin, est un mafieux raffiné aux manières aristocratiques. Petit, gros, nez crochu, monocle et chapeau haut-de-forme, son parapluie cache une multitude de gadgets armés. Contrôle l\'Iceberg Lounge, son repaire mondain. Plus stratège que combattant, sa pègre rivalise avec celle des plus grands criminels de Gotham.',r:'rare',p:150},
{id:'dc05',name:'Double-Face',uni:'DC Comics',uk:'dc',em:'🪙',em2:'🎭',color:'#c0392b',gc:'#7f8c8d',desc:'Harvey Dent, ancien procureur de Gotham défiguré par de l\'acide, devient Double-Face. Sa pièce à deux têtes (l\'une vierge, l\'autre rayée) décide de chacune de ses actions. Visage moitié bel homme, moitié monstre carbonisé, sa dualité psychique reflète sa difformité physique. Ami brisé de Bruce Wayne, sa tragédie est l\'une des plus poignantes de l\'univers Batman.',r:'rare',p:150},
{id:'dc06',name:'Catwoman',uni:'DC Comics',uk:'dc',em:'🐱',em2:'💋',color:'#1a1a1a',gc:'#9b59b6',desc:'Selina Kyle, voleuse féline insaisissable, est à la fois ennemie et amante de Batman. Combinaison cuir noir moulante, oreilles de chat et fouet, elle se déplace avec grâce et félinité. Plus chapardeuse que méchante, son code d\'honneur la fait souvent pencher du bon côté. Sa relation ambiguë avec le Chevalier Noir est l\'une des plus iconiques.',r:'épique',p:230},
{id:'dc07',name:'Poison Ivy',uni:'DC Comics',uk:'dc',em:'🌿',em2:'💋',color:'#27ae60',gc:'#e74c3c',desc:'Pamela Isley, botaniste devenue éco-terroriste, contrôle toutes les plantes. Peau verdâtre, longs cheveux roux, costume de feuilles et de lierre, elle séduit les hommes avec ses phéromones puis les empoisonne. Voix douce mais cœur impitoyable, elle protège la nature au prix de vies humaines. Amante occasionnelle de Catwoman et ennemie de Batman.',r:'rare',p:150},
{id:'dc08',name:'L\'Homme-Mystère',uni:'DC Comics',uk:'dc',em:'❓',em2:'🎩',color:'#27ae60',gc:'#9b59b6',desc:'Edward Nigma, alias l\'Homme-Mystère (Riddler), est un génie criminel obsédé par les énigmes. Costume vert à points d\'interrogation, melon et canne assortie, il laisse toujours des indices sous forme d\'énigmes complexes. Plus égotique que dangereux, il veut prouver son intelligence supérieure à tous. Son défi : surpasser Batman en jeu d\'esprit.',r:'rare',p:150},
{id:'dc09',name:'L\'Épouvantail',uni:'DC Comics',uk:'dc',em:'🌾',em2:'😱',color:'#bd6f00',gc:'#8B4513',desc:'Dr Jonathan Crane, ancien psychologue, utilise une toxine de peur pour terroriser ses victimes. Masque rugueux d\'épouvantail en toile de jute, chapeau pointu et silhouette filiforme, il incarne la phobie pure. Capable de faire vivre à ses ennemis leurs pires cauchemars éveillés, il est devenu son propre psychologue de l\'horreur.',r:'rare',p:150},
{id:'dc10',name:'Mister Freeze',uni:'DC Comics',uk:'dc',em:'❄️',em2:'🧊',color:'#74b9ff',gc:'#0984e3',desc:'Dr Victor Fries, savant transformé par un accident cryogénique en créature ne pouvant survivre qu\'au froid. Combinaison ciré bleu, casque transparent et arme à congeler. Sa quête : guérir sa femme Nora plongée en cryostase. Plus tragique que méchant, son cœur est aussi froid que son corps, mais bat encore pour son amour perdu.',r:'rare',p:150},
{id:'dc11',name:'Alfred Pennyworth',uni:'DC Comics',uk:'dc',em:'🤵',em2:'👴',color:'#7f8c8d',gc:'#bdc3c7',desc:'Le fidèle majordome britannique de Wayne Manor, Alfred a élevé Bruce Wayne après la mort de ses parents. Costume impeccable, cheveux blancs, moustache distinguée, son flegme british est légendaire. Plus qu\'un domestique, c\'est un père de substitution, confident, et indispensable allié de Batman. Sa sagesse et son humour pince-sans-rire en font un personnage adoré.',r:'épique',p:230},
{id:'dc12',name:'Superman',uni:'DC Comics',uk:'dc',em:'🦸',em2:'⭐',color:'#1a3a8a',gc:'#c0392b',desc:'Kal-El, dernier survivant de Krypton, élevé sur Terre par les Kent. Costume bleu, cape rouge flottante, S jaune-rouge sur la poitrine, c\'est le super-héros ultime. Force surhumaine, vol, vision laser, ouïe et vue télescopiques, indestructibilité (sauf kryptonite). Plus qu\'un héros, c\'est un symbole d\'espoir pour l\'humanité. L\'Homme d\'Acier veille sur Metropolis.',r:'légendaire',p:350},
{id:'dc13',name:'Supergirl',uni:'DC Comics',uk:'dc',em:'👧',em2:'⭐',color:'#3498db',gc:'#c0392b',desc:'Kara Zor-El, cousine de Superman, est une héroïne kryptonienne aussi puissante que lui. Cheveux blonds longs, costume bleu et rouge avec mini-jupe, ses pouvoirs sont identiques à ceux de son célèbre cousin. Plus jeune et impulsive, elle apprend encore à maîtriser sa force. Sa relation familiale avec Clark Kent ajoute une dimension émotionnelle à ses aventures.',r:'épique',p:230},
{id:'dc14',name:'Wonder Woman',uni:'DC Comics',uk:'dc',em:'⚡',em2:'👸',color:'#c0392b',gc:'#f1c40f',desc:'Diana, princesse amazone de Themyscira, fille de la reine Hippolyta. Costume bleu et rouge à étoiles, tiare dorée, lasso de vérité doré et bracelets indestructibles. Force surhumaine, vitesse, vol et combat divin, c\'est l\'égale de Superman et Batman dans la Trinité DC. Diplomate et guerrière, elle incarne l\'amour et la justice. Sa puissance est divine.',r:'légendaire',p:350},
{id:'dc15',name:'Green Lantern',uni:'DC Comics',uk:'dc',em:'💚',em2:'💍',color:'#27ae60',gc:'#2ecc71',desc:'Hal Jordan, pilote d\'essai américain, devient Green Lantern grâce à un anneau de pouvoir extraterrestre. Costume noir et vert, sa volonté façonne tout ce qu\'il imagine en énergie verte solide : épées, marteaux, vaisseaux. Membre du Corps des Green Lanterns, force de police intergalactique, sa devise : Une seule volonté, une seule lumière, en lumière verte je serai !',r:'épique',p:230},
{id:'dc16',name:'The Flash',uni:'DC Comics',uk:'dc',em:'⚡',em2:'🏃',color:'#c0392b',gc:'#f1c40f',desc:'Barry Allen, scientifique frappé par la foudre et trempé dans des produits chimiques, devient l\'homme le plus rapide du monde. Costume rouge moulant à éclairs jaunes, masque épousant la tête, il court à vitesse supraluminique. Capable de traverser le temps et l\'espace en Speed Force. Membre fondateur de la Justice League, son optimisme illumine ses aventures.',r:'épique',p:230},
{id:'dc17',name:'Hawkgirl',uni:'DC Comics',uk:'dc',em:'🦅',em2:'⚒️',color:'#bd6f00',gc:'#d4a017',desc:'Kendra Saunders, alias Hawkgirl, est une guerrière ailée venue de Thanagar. Ailes massives jaune-orange, casque de faucon, harnais doré et masse Nth Metal qui la rend invincible aux blessures. Son immortalité par réincarnation et sa férocité au combat en font une combattante redoutable. Sa romance éternelle avec Hawkman traverse les âges.',r:'rare',p:150},
{id:'dc18',name:'Martian Manhunter',uni:'DC Comics',uk:'dc',em:'👽',em2:'🔴',color:'#27ae60',gc:'#1a1a1a',desc:'J\'onn J\'onzz, dernier survivant de Mars, est l\'un des héros les plus puissants de l\'univers DC. Peau verte, cape rouge, X croisé sur la poitrine et regard pénétrant. Capable de télépathie, télékinésie, intangibilité, métamorphose, force et vol surhumains. Sa solitude et sa sagesse en font le cœur émotionnel de la Justice League. Adore les biscuits Oreo.',r:'légendaire',p:350},
{id:'dc19',name:'Shazam',uni:'DC Comics',uk:'dc',em:'⚡',em2:'👦',color:'#c0392b',gc:'#f1c40f',desc:'Billy Batson, jeune orphelin, prononce le mot SHAZAM et se transforme en adulte super-héros. Costume rouge à éclair jaune sur la poitrine, cape blanche, force d\'Hercule, vitesse de Mercure, sagesse de Salomon. Sous l\'apparence d\'un adulte sublime, c\'est un cœur d\'enfant innocent qui bat. Ses aventures mêlent émerveillement et magie pure.',r:'épique',p:230},
{id:'dc20',name:'Green Arrow',uni:'DC Comics',uk:'dc',em:'🏹',em2:'💚',color:'#27ae60',gc:'#1a3a2a',desc:'Oliver Queen, milliardaire devenu archer justicier après naufrage sur une île déserte. Costume vert avec capuche, masque, barbe blonde et arc précis, ses flèches spéciales (boxe, explosive, cordée) résolvent toutes situations. Style Robin des Bois moderne, c\'est le défenseur des opprimés de Star City. Son humour cynique cache un héros au grand cœur.',r:'rare',p:150},
{id:'dc21',name:'Aquaman',uni:'DC Comics',uk:'dc',em:'🔱',em2:'🌊',color:'#f1c40f',gc:'#27ae60',desc:'Arthur Curry, demi-Atlante demi-humain, est le roi d\'Atlantide et l\'un des héros les plus puissants. Cheveux longs blonds, barbe, armure dorée et écaillée, trident magique légendaire. Force surhumaine décuplée dans l\'eau, communication avec les créatures marines, vitesse de nage prodigieuse. Bien plus qu\'un héros aquatique, c\'est un roi guerrier.',r:'épique',p:230},
{id:'dc22',name:'Power Girl',uni:'DC Comics',uk:'dc',em:'💪',em2:'⭐',color:'#3498db',gc:'#c0392b',desc:'Karen Starr, version alternative de Supergirl venue d\'une Terre parallèle. Costume blanc à cape bleue, cheveux blonds courts, sa puissance est identique à celle de Superman : force, vol, vision laser, indestructibilité. Plus expérimentée et confiante que Supergirl, elle est aussi entrepreneur sous son identité civile. Une héroïne moderne assumée.',r:'rare',p:150},
{id:'dc23',name:'Black Adam',uni:'DC Comics',uk:'dc',em:'⚡',em2:'🌑',color:'#1a1a1a',gc:'#f1c40f',desc:'Teth-Adam, ancien champion de l\'Égypte antique corrompu par le pouvoir, version sombre de Shazam. Costume noir et or à éclair jaune, regard impitoyable, force et puissance équivalentes. Anti-héros ou méchant selon les histoires, sa morale brutale (tuer les coupables) le sépare de la ligne des héros traditionnels. Pouvoir immense, jugement sans appel.',r:'épique',p:230},
{id:'dc24',name:'Captain Atom',uni:'DC Comics',uk:'dc',em:'⚛️',em2:'🔵',color:'#74b9ff',gc:'#3498db',desc:'Nathaniel Adam, soldat américain transformé en être d\'énergie quantique. Corps métallique chromé bleu argenté, costume rouge et blanc avec symbole atomique, il maîtrise l\'énergie nucléaire et peut voler à vitesse supersonique. Force et puissance énergétique surhumaines. Sa nature radioactive en fait un héros isolé, conscient du danger qu\'il représente.',r:'rare',p:150},
{id:'dc25',name:'Cyborg',uni:'DC Comics',uk:'dc',em:'🤖',em2:'💪',color:'#7f8c8d',gc:'#3498db',desc:'Victor Stone, joueur de football américain transformé en cyborg après un accident catastrophique. Corps moitié humain noir, moitié machine argentée et bleue, technologie alien implantée. Capable de scanner, hacker, voler, et générer des armes plasma. Membre des Teen Titans puis Justice League, sa lutte intérieure entre humanité et machine touche profondément.',r:'épique',p:230},
{id:'dc26',name:'Doomsday',uni:'DC Comics',uk:'dc',em:'💀',em2:'⚡',color:'#1a1a1a',gc:'#7f8c8d',desc:'Créature kryptonienne génétiquement modifiée pour évoluer après chaque mort, Doomsday est la machine à tuer ultime. Peau grise rocailleuse couverte d\'épines osseuses blanches, taille immense, force titanesque. Capable de tuer Superman lui-même lors de leur duel légendaire. Force pure sans intelligence, sans pitié, sans fin : la mort incarnée.',r:'légendaire',p:350},
{id:'dc27',name:'Brainiac',uni:'DC Comics',uk:'dc',em:'🧠',em2:'🛸',color:'#27ae60',gc:'#1a3a2a',desc:'Coluan extraterrestre à l\'intelligence superhumaine, Brainiac collectionne des cités entières en les miniaturisant dans des bouteilles. Peau verte, crâne lisse à trois électrodes connectées, super-vaisseau en forme de tête. Responsable destruction Krypton, c\'est l\'un des plus grands ennemis de Superman. Son intelligence dépasse toute mesure humaine.',r:'légendaire',p:350},
{id:'dc28',name:'Darkseid',uni:'DC Comics',uk:'dc',em:'👹',em2:'🌑',color:'#7f0000',gc:'#1a1a1a',desc:'Souverain absolu d\'Apokolips, Darkseid est le grand méchant cosmique de DC. Peau grise crevassée comme la pierre volcanique, armure noire et bleue, regard mortel des Omega Beams qui poursuivent leurs cibles à travers l\'espace-temps. Force divine, immortalité, intelligence sans limite. Ennemi ultime de toute la Justice League réunie. Le mal incarné à l\'échelle galactique.',r:'légendaire',p:350},
{id:'sx_epiphanie',  name:'Roi de la Galette',    uni:'Saisonnier',uk:'sx',em:'👑',em2:'🥧',color:'#f39c12',gc:'#ffd700',desc:'Le souverain au sourire malicieux, vainqueur de l\'Épiphanie. Sa couronne dorée brille des reflets d\'une fève magique. Il n\'apparaît qu\'une fois par an, le 6 janvier.',r:'exclusif',p:0},
{id:'sx_valentin',   name:'Cœur Piégé',           uni:'Saisonnier',uk:'sx',em:'💘',em2:'🏹',color:'#e84393',gc:'#ff79c6',desc:'L\'archer rose qui décoche ses flèches mathématiques le 14 février. Son cœur palpitant cache des équations d\'amour. Souvenir d\'une victoire à la Saint-Valentin.',r:'exclusif',p:0},
{id:'sx_printemps',  name:'Esprit du Printemps',  uni:'Saisonnier',uk:'sx',em:'🌸',em2:'🌷',color:'#27ae60',gc:'#7bed9f',desc:'L\'âme verdoyante qui éveille la nature à l\'équinoxe de mars. Ses pétales tombent en cascade pour célébrer ta victoire. Trophée du renouveau printanier.',r:'exclusif',p:0},
{id:'sx_avril1',     name:'Poisson d\'Avril',     uni:'Saisonnier',uk:'sx',em:'🐟',em2:'🤡',color:'#3498db',gc:'#48dbfb',desc:'Le farceur écailleux qui te disait que tes calculs étaient faux… alors qu\'ils étaient bons ! Vaincu le 1er avril, il garde son sourire moqueur pour l\'éternité.',r:'exclusif',p:0},
{id:'sx_paques',     name:'Lapin de l\'Ombre',    uni:'Saisonnier',uk:'sx',em:'🐰',em2:'🥚',color:'#f1c40f',gc:'#ffeaa7',desc:'Le lapin malicieux qui cachait ses œufs piégés dans tes additions. Sa fourrure dorée scintille des couleurs des œufs de Pâques. Souvenir d\'une chasse réussie.',r:'exclusif',p:0},
{id:'sx_mardigras',  name:'Masque Trompeur',      uni:'Saisonnier',uk:'sx',em:'🎭',em2:'🎉',color:'#9b59b6',gc:'#a29bfe',desc:'Le bouffon multicolore du carnaval, dont tu as percé le mystère. Son masque cache mille visages, mille équations. Trophée du Mardi Gras.',r:'exclusif',p:0},
{id:'sx_cny',        name:'Dragon de Jade',       uni:'Saisonnier',uk:'sx',em:'🐲',em2:'🧧',color:'#c0392b',gc:'#ff7675',desc:'L\'ancien dragon écarlate du Nouvel An chinois. Ses écailles porte-bonheur t\'ont conféré la fortune mathématique. Que la prospérité numérique t\'accompagne !',r:'exclusif',p:0},
{id:'sx_ete',        name:'Soleil de Feu',        uni:'Saisonnier',uk:'sx',em:'☀️',em2:'🔥',color:'#e67e22',gc:'#fab1a0',desc:'L\'astre brûlant du solstice d\'été, dompté par tes calculs glacés. Ses rayons or et orangés rayonnent encore à travers ta vitrine de figurines.',r:'exclusif',p:0},
{id:'sx_14juillet',  name:'Fureur Tricolore',     uni:'Saisonnier',uk:'sx',em:'🎆',em2:'🇫🇷',color:'#e74c3c',gc:'#ff7675',desc:'Le feu d\'artifice républicain de la Fête Nationale, éclatant en bleu, blanc et rouge. Son explosion patriotique célèbre tes mathématiques libres, égales, fraternelles.',r:'exclusif',p:0},
{id:'sx_rentree',    name:'Cancre Insolent',      uni:'Saisonnier',uk:'sx',em:'🎒',em2:'📚',color:'#8e44ad',gc:'#a29bfe',desc:'L\'écolier rebelle de la rentrée, qui prétendait n\'avoir jamais fait ses devoirs. Tu lui as appris que les maths, c\'est sérieux ! Souvenir du 1er septembre.',r:'exclusif',p:0},
{id:'sx_automne',    name:'Esprit d\'Automne',    uni:'Saisonnier',uk:'sx',em:'🍂',em2:'🍄',color:'#d35400',gc:'#fab1a0',desc:'L\'âme rousse de l\'équinoxe d\'automne. Ses feuilles flamboyantes décorent ton trophée. Souvenir d\'une victoire entre les couleurs de septembre.',r:'exclusif',p:0},
{id:'sx_halloween',  name:'Citrouille Maudite',   uni:'Saisonnier',uk:'sx',em:'🎃',em2:'👻',color:'#d35400',gc:'#ff7f00',desc:'La citrouille hantée d\'Halloween, dont les calculs effrayants n\'ont pas suffi à te terroriser. Sa lueur orange illumine désormais ta collection. BOUUUUH !',r:'exclusif',p:0},
{id:'sx_hiver',      name:'Esprit d\'Hiver',      uni:'Saisonnier',uk:'sx',em:'❄️',em2:'⛄',color:'#3498db',gc:'#74b9ff',desc:'L\'âme glacée du solstice d\'hiver, qui voulait geler tes neurones. Tes calculs brûlants l\'ont fait fondre. Trophée cristallin des nuits les plus longues.',r:'exclusif',p:0},
{id:'sx_noel',       name:'Père Fouettard',       uni:'Saisonnier',uk:'sx',em:'🎄',em2:'🎁',color:'#27ae60',gc:'#7bed9f',desc:'Le rival sombre du Père Noël, vaincu pour que les enfants reçoivent leurs cadeaux. Sa cape verte scintille de neige éternelle. Souvenir du 25 décembre.',r:'exclusif',p:0},
{id:'sx_nouvelan',   name:'Horloge Infernale',    uni:'Saisonnier',uk:'sx',em:'🥂',em2:'⏰',color:'#f1c40f',gc:'#ffeaa7',desc:'L\'horloge dorée de la Saint-Sylvestre, dont les aiguilles ont sonné minuit avant qu\'elle ne te terrasse. Trophée du Nouvel An, premier jour de tous les défis.',r:'exclusif',p:0},
{id:'sx_anniv_soren',name:'Gâteau de Soren',      uni:'Saisonnier',uk:'sx',em:'🎂',em2:'🎈',color:'#e84393',gc:'#ff79c6',desc:'Le gâteau légendaire qui apparaît chaque 1er août, le jour de Soren. Ses bougies brillent d\'une lumière magique. Souvenir d\'un anniversaire mémorable.',r:'exclusif',p:0},
{id:'sx_anniv_peyo', name:'Gâteau de Peyo',       uni:'Saisonnier',uk:'sx',em:'🎂',em2:'🎈',color:'#3498db',gc:'#74b9ff',desc:'Le gâteau bleu cobalt qui célèbre Peyo chaque 7 juillet. Ses 7 bougies scintillent d\'une joie pure. Trophée du jour le plus spécial.',r:'exclusif',p:0},
{id:'sx_anniv_tomi', name:'Gâteau de Tomi',       uni:'Saisonnier',uk:'sx',em:'🎂',em2:'🎈',color:'#9b59b6',gc:'#a29bfe',desc:'Le gâteau violet enchanté qui apparaît le 13 mars pour Tomi. Sa crème aux mathématiques magiques porte-bonheur garantit une année excellente.',r:'exclusif',p:0},
{id:'sx_anniv_papa', name:'Gâteau de Papa',       uni:'Saisonnier',uk:'sx',em:'🎂',em2:'🎈',color:'#27ae60',gc:'#7bed9f',desc:'Le gâteau d\'émeraude offert à Papa chaque 28 avril. Ses bougies dorées éclairent le foyer toute la journée. Trophée familial unique.',r:'exclusif',p:0},
{id:'sx_anniv_maman',name:'Gâteau de Maman',      uni:'Saisonnier',uk:'sx',em:'🎂',em2:'🎈',color:'#e67e22',gc:'#fab1a0',desc:'Le gâteau ambré offert à Maman chaque 11 avril. Sa lumière chaleureuse illumine toute la famille. Souvenir précieux d\'une journée d\'amour.',r:'exclusif',p:0}
];

// ═══════════════════════════════════════════════════════
// v10.3.0 — FICHES DÉTAILLÉES (dos de carte), multi-pages.
// Fusionnées dans FIGURINES.pages au chargement. Une figurine sans entrée ici
// garde son ancien `desc` (affiché sur une seule page). Textes factuels rédigés
// en propres mots (notices encyclopédiques), pensés aussi pour la lecture vocale.
// ─── LOT RÉFÉRENCE : Dragon Ball ───
// ═══════════════════════════════════════════════════════
const FIG_PAGES = {
 db01: [
  "Son Goku est un Saiyan né sous le nom de Kakarot sur la planète Vegeta. Bébé, il est envoyé sur Terre juste avant la destruction de son monde. Une chute sur la tête efface ses instincts guerriers : recueilli par le vieux Son Gohan, il grandit le cœur pur, curieux et insatiable de progrès.",
  "Élevé dans les montagnes, il devient le plus grand artiste martial de la Terre et son protecteur. De Piccolo à Freezer, de Cell à Majin Buu, il affronte les menaces les plus terribles. Son attaque emblématique, le Kaméhaméha, concentre l'énergie entre les paumes en un rayon bleu.",
  "Goku ne cherche pas la gloire, mais le dépassement de soi : il se relève toujours plus fort. Ses transformations en Super Saiyan, aux cheveux dorés, marquent des paliers de puissance légendaires. Généreux et bon vivant, il incarne la joie de devenir meilleur jour après jour.",
 ],
 db02: [
  "Végéta est le prince des Saiyans, héritier d'un peuple de guerriers presque entièrement disparu. Fier, orgueilleux et obsédé par sa lignée royale, il débarque sur Terre en ennemi redoutable, déterminé à prouver sa supériorité sur tous, et d'abord sur Goku.",
  "Au fil de ses combats, il choisit peu à peu le camp du bien sans jamais renier sa fierté. Il fonde une famille avec Bulma et devient le père de Trunks. Son Final Flash, déflagration d'énergie concentrée, est l'une de ses attaques les plus dévastatrices.",
  "Rival éternel de Goku, tour à tour adversaire et allié, Végéta est l'un des personnages les plus complexes de la saga : un guerrier d'élite qui apprend, à force d'épreuves, la valeur de la loyauté et de l'amour des siens.",
 ],
 db03: [
  "Gohan est le fils aîné de Goku et de Chi-Chi. Plus studieux que guerrier, il rêve d'études plus que de combats — mais il abrite un potentiel qui dépasse celui de son père, prêt à se libérer dans les moments de grand danger.",
  "Enfant, il atteint le stade de Super Saiyan de niveau 2, parcouru d'éclairs, et terrasse Cell lors des Cell Games. Doux et réfléchi au quotidien, il devient terrible lorsqu'on menace ceux qu'il aime. Il représente l'espoir d'une nouvelle génération de défenseurs de la Terre.",
 ],
 db04: [
  "Piccolo est un guerrier de l'espèce Namek. Né de l'héritage du Roi Démon Piccolo, il commence en ennemi juré de Goku, froid et solitaire, avant de devenir le mentor le plus dévoué du jeune Gohan.",
  "Il peut étirer ses membres, régénérer son corps et lire les intentions de l'adversaire. Son Special Beam Cannon, rayon perforant en spirale, exige une longue concentration mais traverse presque tout. Sage et profondément honorable, Piccolo incarne la rédemption par l'amitié et le sacrifice.",
 ],
 db05: [
  "Freezer est un tyran galactique qui régna par la terreur sur d'innombrables planètes. C'est lui qui détruisit la planète Vegeta, redoutant la légende du Super Saiyan. Élégant, raffiné et d'une cruauté absolue, il se croit le plus puissant de l'univers.",
  "Capable de plusieurs transformations, il dévoile dans sa forme finale, étonnamment sobre, une puissance terrifiante. Son Death Beam transperce ses cibles avec une précision chirurgicale. Vaincu sur Namek, il reviendra plus fort encore, symbole du mal orgueilleux qui refuse de disparaître.",
 ],
 db06: [
  "Cell est un être bio-mécanique conçu à partir des cellules des plus grands combattants, fruit des recherches du Dr Gero. Venu d'un futur alternatif, il a pour but d'atteindre la « perfection » absolue.",
  "En absorbant les cyborgs C-17 et C-18, il accède à sa forme parfaite et peut alors utiliser les techniques de tous les guerriers dont il porte l'héritage. Il organise les Cell Games, un tournoi pour défier la Terre — avant d'être finalement vaincu par Gohan.",
 ],
 db07: [
  "Majin Buu est une créature magique très ancienne, réveillée par les sorciers Bibidi puis Babidi. Le « M » sur son front trahit cette magie. D'abord enfantin et joueur sous sa forme rose et potelée, il peut changer ses ennemis en bonbons.",
  "Sa nature cache une puissance de destruction colossale. Sa forme la plus dangereuse, Kid Buu, est une entité de chaos pur, dotée d'une régénération quasi sans limite. Il faudra l'union des plus grands guerriers pour en venir à bout.",
 ],
 db08: [
  "Trunks du futur est le fils de Végéta et de Bulma, venu d'un avenir ravagé par les cyborgs. Dans son époque, la Terre est en ruines ; il remonte le temps pour avertir les héros et changer le cours de l'histoire.",
  "Combattant solitaire et mélancolique, il manie l'épée avec une maîtrise rare et n'hésite pas à se sacrifier pour les siens. Courageux et déterminé, il incarne l'espoir d'un futur que l'on peut encore sauver.",
 ],
 db09: [
  "Krilin est le meilleur ami de Goku depuis l'enfance, formé avec lui auprès du maître Tortue Géniale. Petit, chauve, marqué de six points sur le front et dépourvu de nez, il est l'être humain le plus fort du monde de Dragon Ball.",
  "Son Kienzan, disque d'énergie tranchant comme un rasoir, peut découper presque n'importe quoi. Courageux malgré ses limites, il épouse C-18 et fonde une famille. Krilin prouve que le cœur et l'amitié comptent autant que la puissance brute.",
 ],
 db10: [
  "C-18 est une cyborg créée par le Dr Gero à partir d'une jeune femme. Dotée d'une force surhumaine et d'une énergie inépuisable, elle apparaît d'abord froide et insaisissable, aux côtés de son frère jumeau C-17.",
  "Au fil du temps, elle se rapproche des défenseurs de la Terre, épouse Krilin et devient une mère aimante, sans rien perdre de son calme ni de sa redoutable efficacité au combat. Élégante et indépendante, elle est l'une des combattantes les plus marquantes de la saga.",
 ],
};
// ─── LOT : Marvel ───
Object.assign(FIG_PAGES, {
 mv01: [
  "Spider-Man est le héros de Peter Parker, un adolescent de New York mordu par une araignée modifiée lors d'une démonstration scientifique. Il acquiert une force et une agilité hors normes, la faculté de grimper aux murs et un « sens d'araignée » qui le prévient du danger.",
  "Brillant en sciences, il met au point des lance-toiles qu'il porte aux poignets pour se balancer entre les gratte-ciel. Après la mort de son oncle Ben, il comprend qu'une grande puissance s'accompagne d'un grand devoir, et choisit de protéger les innocents.",
  "Tiraillé entre sa vie de lycéen et ses responsabilités de héros, il affronte de nombreux ennemis dans les rues de New York. Courageux et plein d'humour, Spider-Man est l'un des super-héros les plus populaires au monde.",
 ],
 mv02: [
  "Iron Man est l'armure de Tony Stark, génial inventeur et milliardaire à la tête d'une grande entreprise de technologie. Grièvement blessé et retenu captif, il conçoit une première armure pour s'échapper, alimentée par un réacteur qui maintient aussi son cœur en vie.",
  "De retour libre, il perfectionne sans cesse ses armures : vol supersonique, rayons répulseurs, intelligence artificielle embarquée. Membre fondateur des Avengers, Tony Stark met son génie au service de la défense de la Terre, avec panache et ironie.",
 ],
 mv03: [
  "Captain America est Steve Rogers, un jeune homme frêle mais courageux, refusé par l'armée pendant la Seconde Guerre mondiale. Volontaire pour une expérience, il reçoit un sérum de super-soldat qui décuple sa force, sa vitesse et son endurance.",
  "Il combat avec un bouclier en vibranium, métal quasi indestructible qu'il lance et rattrape. Pris dans les glaces durant des décennies puis ranimé à notre époque, il devient le chef moral des Avengers, symbole de loyauté, de justice et de don de soi.",
 ],
 mv04: [
  "Thor est le dieu du tonnerre d'Asgard, fils du roi Odin. Guerrier puissant, il maîtrise la foudre et les tempêtes et vit parmi les héros d'une cité céleste reliée à la Terre par un pont arc-en-ciel.",
  "Il manie Mjolnir, un marteau enchanté que seuls les êtres « dignes » peuvent soulever et qui revient toujours dans sa main. D'abord orgueilleux, Thor apprend l'humilité et défend la Terre aux côtés des Avengers, souvent face aux ruses de son frère adoptif Loki.",
 ],
 mv05: [
  "Hulk est l'autre visage de Bruce Banner, un scientifique spécialiste des rayons gamma. Exposé à une dose massive de radiations lors d'un accident, il se transforme, sous l'effet de la colère, en un colosse vert à la force démesurée.",
  "Plus Hulk s'énerve, plus il devient puissant : il peut soulever des immeubles et bondir sur des kilomètres. Banner cherche sans cesse à maîtriser cette part de lui-même, partagé entre l'intelligence du savant et la rage du géant.",
 ],
 mv06: [
  "La Veuve Noire est Natasha Romanoff, espionne d'élite formée dès l'enfance dans un programme secret. Sans super-pouvoirs, elle compte sur un entraînement extrême au combat rapproché, à l'acrobatie et à l'infiltration.",
  "Agente du S.H.I.E.L.D. puis membre des Avengers, elle manie aussi bien les armes que la ruse. Déterminée à racheter son passé, elle se révèle l'une des combattantes les plus efficaces et loyales de l'équipe.",
 ],
 mv07: [
  "Thanos est un seigneur de guerre venu du monde de Titan, doté d'une force colossale et d'une intelligence redoutable. Convaincu que l'univers manque de ressources, il poursuit un projet terrifiant : rééquilibrer la vie à sa façon.",
  "Pour cela, il cherche à réunir les Pierres d'Infinité, gemmes d'une puissance cosmique, qu'il sertit dans un gantelet. Patient et impitoyable, Thanos est l'un des adversaires les plus dangereux que les héros aient jamais affrontés.",
 ],
 mv08: [
  "La Panthère Noire est T'Challa, roi du Wakanda, une nation africaine secrète bien plus avancée que le reste du monde grâce au vibranium qu'elle protège. Le titre de Panthère se transmet aux souverains du pays.",
  "Une herbe sacrée renforce ses sens, sa force et ses réflexes ; sa combinaison en vibranium absorbe les chocs. À la fois roi sage et guerrier agile, T'Challa veille sur son peuple tout en aidant les héros de la Terre.",
 ],
 mv09: [
  "Wolverine est Logan, un mutant au tempérament solitaire et bourru. Son pouvoir principal est un facteur de guérison qui referme ses blessures presque instantanément et ralentit son vieillissement, lui donnant une vie très longue.",
  "Des griffes rétractables jaillissent du dos de ses mains ; son squelette est recouvert d'adamantium, un métal indestructible. Membre des X-Men, Wolverine cache, derrière sa rudesse, un sens profond de la loyauté et de la protection.",
 ],
 mv10: [
  "Le Docteur Strange est Stephen Strange, un chirurgien brillant mais arrogant dont les mains sont abîmées dans un accident. En quête de guérison, il découvre les arts mystiques auprès d'un maître et change radicalement de voie.",
  "Devenu Sorcier Suprême, il protège notre dimension des menaces magiques. Il s'appuie sur des sortilèges, une cape de lévitation et l'Œil d'Agamotto. Son savoir des forces occultes en fait l'un des défenseurs les plus singuliers de la Terre.",
 ],
 mv11: [
  "La Sorcière Rouge est Wanda Maximoff, dotée d'une magie parmi les plus puissantes de l'univers Marvel. Elle peut altérer la réalité, projeter des ondes d'énergie et manipuler la matière par la seule force de sa volonté.",
  "Marquée par un passé douloureux, elle apprend à maîtriser un don aussi prodigieux que dangereux. Tantôt alliée des Avengers, tantôt débordée par sa propre puissance, Wanda est un personnage intense et profondément humain.",
 ],
 mv12: [
  "Loki est le dieu de la malice d'Asgard, fils adoptif d'Odin et frère de Thor. Maître de l'illusion et du changement d'apparence, il avance toujours par la ruse plutôt que par la force brute.",
  "Tour à tour ennemi et allié ambigu, il rêve de reconnaissance et de pouvoir. Manipulateur charmeur, Loki reste imprévisible : on ne sait jamais vraiment de quel côté il penchera, ce qui en fait l'un des personnages les plus fascinants de la saga.",
 ],
 mv13: [
  "War Machine est l'armure de James « Rhodey » Rhodes, officier de l'armée et ami fidèle de Tony Stark. Sa version de l'armure Iron Man est plus massive et surtout hérissée d'armement lourd : mitrailleuses, missiles et canons.",
  "Discipliné et loyal, Rhodey allie la rigueur militaire à la haute technologie de Stark. Il combat aux côtés des Avengers, fiable comme un roc dans les situations les plus périlleuses.",
 ],
 mv14: [
  "Venom naît de l'union d'un symbiote, une créature extraterrestre vivante, et d'un hôte humain, le plus souvent Eddie Brock. Le symbiote enveloppe son porteur d'une matière noire qui décuple sa force et lui donne des crocs et des tentacules.",
  "À la fois ennemi et parfois allié de Spider-Man, Venom oscille entre instinct prédateur et désir de protéger les innocents. Cette double nature, monstrueuse et touchante, en fait un antihéros à part.",
 ],
 mv15: [
  "Vision est un être synthétique, un androïde animé par une intelligence avancée et par la puissance d'une Pierre d'Infinité sertie sur son front. Il peut voler, traverser la matière et modifier sa densité pour devenir intangible ou dur comme le diamant.",
  "Doté d'une logique implacable mais aussi d'une grande sensibilité, Vision s'interroge sur sa propre nature et sur la valeur de la vie. Allié précieux des Avengers, il incarne la rencontre entre la machine et la conscience.",
 ],
 mv16: [
  "Captain Marvel est Carol Danvers, ancienne pilote de chasse devenue l'une des héroïnes les plus puissantes de l'univers. Après avoir été exposée à une énergie cosmique, elle gagne le vol, une force colossale et la capacité de projeter de l'énergie.",
  "Capable de voyager dans l'espace et de résister à des chocs énormes, elle veille sur la Terre comme sur des mondes lointains. Courageuse et déterminée, Carol ne renonce jamais, quelles que soient les épreuves.",
 ],
 mv17: [
  "Hawkeye est Clint Barton, archer de génie sans le moindre super-pouvoir. Sa force réside dans une précision presque infaillible et un sang-froid à toute épreuve.",
  "Son carquois regorge de flèches spéciales : explosives, électriques, à grappin ou à filet. Agent et membre des Avengers, Hawkeye prouve qu'un humain entraîné et courageux a toute sa place parmi les plus grands héros.",
 ],
 mv18: [
  "Ant-Man est Scott Lang, un ancien cambrioleur repenti qui hérite d'une combinaison scientifique exceptionnelle. Grâce à des particules spéciales, il peut rétrécir jusqu'à la taille d'une fourmi tout en gardant sa force, ou au contraire devenir géant.",
  "Un casque lui permet de commander de véritables armées de fourmis. Maladroit mais plein de cœur, Scott met ses talents au service du bien et devient un allié inattendu mais précieux des héros.",
 ],
 mv19: [
  "La Guêpe porte une combinaison cousine de celle d'Ant-Man : elle peut rétrécir à volonté, mais aussi déployer des ailes pour voler et lancer de petites décharges d'énergie, ses « dards ».",
  "Vive, agile et redoutable en vol, elle frappe là où l'adversaire ne l'attend pas. Aux côtés d'Ant-Man, la Guêpe forme un duo complémentaire, mêlant finesse, courage et technologie de pointe.",
 ],
 mv20: [
  "Miss Marvel est Kamala Khan, une adolescente passionnée de super-héros qui découvre un jour ses propres pouvoirs. Elle peut étirer et agrandir son corps, allonger ses membres ou grossir son poing pour frapper.",
  "Enthousiaste et pleine d'idéaux, elle apprend à concilier sa vie de collégienne, sa famille et ses responsabilités de justicière. Kamala incarne une nouvelle génération de héros, proche des jeunes lecteurs.",
 ],
 mv21: [
  "Le Docteur Octopus est Otto Octavius, un savant de haut vol dont les expériences tournent au drame. Quatre bras mécaniques surpuissants, conçus pour son travail, se retrouvent soudés à son corps et à son esprit.",
  "Avec ces tentacules d'acier qu'il commande par la pensée, il grimpe, frappe et manipule tout objet. Génie devenu dangereux, « Doc Ock » est l'un des adversaires les plus redoutables de Spider-Man.",
 ],
 mv22: [
  "L'Homme-Sable est Flint Marko, un malfrat transformé après un accident en une créature de sable vivant. Il peut changer tout ou partie de son corps en sable et reprendre forme à volonté.",
  "Poing géant, mur de sable, silhouette qui se disperse pour éviter les coups : ses pouvoirs le rendent très difficile à arrêter. Ennemi récurrent de Spider-Man, il n'est pas toujours méchant jusqu'au bout, et cherche parfois à se racheter.",
 ],
 mv23: [
  "Rhino est un colosse engoncé dans une armure ultra-résistante imitant la peau d'un rhinocéros, dont il porte aussi la corne. Cette carapace lui confère une force brute et une endurance impressionnantes.",
  "Sa tactique favorite est la charge : il fonce tête baissée et renverse tout sur son passage. Peu subtil mais d'une puissance redoutable, Rhino est un adversaire de poids pour Spider-Man.",
 ],
 mv24: [
  "Electro est Max Dillon, un homme transformé par un accident électrique en une créature capable de produire et de commander l'électricité. Il emmagasine d'énormes charges et les libère en éclairs dévastateurs.",
  "Il peut surcharger les machines, voler porté par des arcs électriques et frapper à distance. Lumineux et imprévisible, Electro compte parmi les ennemis les plus spectaculaires de Spider-Man.",
 ],
 mv25: [
  "Le Bouffon vert est Norman Osborn, riche industriel rendu fou par un sérum expérimental qui décuple sa force au prix de sa raison. Il se déplace sur un planeur et lance des bombes en forme de citrouille.",
  "Rusé, cruel et personnel dans sa haine, il est considéré comme l'ennemi juré de Spider-Man. Derrière son rire et son masque grimaçant se cache l'un des adversaires les plus dangereux du héros.",
 ],
 mv26: [
  "Le Lézard est le docteur Curt Connors, un scientifique amputé d'un bras qui met au point un sérum inspiré de la capacité des reptiles à régénérer leurs membres. L'expérience le métamorphose en un énorme homme-lézard.",
  "Doté d'une force animale, d'une queue puissante et d'un instinct sauvage, il lutte pour ne pas perdre son humanité. Tragique plus que cruel, le Lézard est un ennemi que Spider-Man cherche autant à arrêter qu'à sauver.",
 ],
 mv27: [
  "Le Vautour est Adrian Toomes, un ingénieur âgé mais ingénieux qui se fabrique un harnais ailé lui permettant de voler avec aisance. Le vol lui confère aussi une force étonnante pour son apparence.",
  "Piquant du ciel comme un rapace, il fond sur ses cibles avant qu'elles ne l'aient vu venir. Rusé et expérimenté, le Vautour est l'un des plus anciens adversaires de Spider-Man.",
 ],
 mv28: [
  "Nick Fury est un maître-espion et le directeur du S.H.I.E.L.D., une agence mondiale de renseignement et de défense. Reconnaissable à son bandeau sur l'œil, il a passé sa vie dans l'ombre à déjouer les plus grandes menaces.",
  "Stratège hors pair, c'est lui qui a l'idée de rassembler des héros aux pouvoirs extraordinaires pour former les Avengers. Méfiant par métier mais profondément loyal, Fury tire les ficelles dans les coulisses.",
 ],
 mv29: [
  "Star-Lord est Peter Quill, un Terrien enlevé enfant et élevé dans l'espace parmi des pillards. Sans super-pouvoir majeur, il s'appuie sur son audace, ses blasters et son équipement high-tech.",
  "Charmeur et débrouillard, il prend la tête des Gardiens de la Galaxie, une bande d'aventuriers hauts en couleur. Sous ses airs désinvoltes, Quill cache un grand cœur et un sens du sacrifice.",
 ],
 mv30: [
  "Drax est un guerrier d'une force immense, animé par une quête de vengeance après la perte de sa famille. Sa peau couverte de marques et sa carrure imposante en font un combattant redoutable au corps à corps.",
  "D'une franchise désarmante, il prend tout au pied de la lettre, ce qui donne lieu à des situations comiques. Loyal envers les Gardiens de la Galaxie, Drax est un allié aussi fidèle que brutal.",
 ],
 mv31: [
  "Gamora est une combattante d'élite, élevée de force par Thanos qui en a fait une assassine parmi les plus dangereuses de la galaxie. Agile et entraînée au maniement des lames, elle est d'une efficacité redoutable.",
  "Refusant le destin que son tortionnaire lui imposait, elle se range du côté des héros et rejoint les Gardiens de la Galaxie. Courageuse et tourmentée, Gamora se bat pour racheter le passé qu'on lui a imposé.",
 ],
 mv32: [
  "Rocket Raccoon est le fruit d'expériences qui ont transformé un raton laveur en un être intelligent, qui parle et marche debout. Petit mais explosif, c'est un génie de la mécanique et des armes lourdes.",
  "Pilote casse-cou et stratège imprévisible, il compense sa taille par un sacré caractère. Au sein des Gardiens de la Galaxie, Rocket est inséparable de son ami Groot, qu'il protège à sa manière bourrue.",
 ],
 mv33: [
  "Groot est une créature végétale, semblable à un arbre vivant, doté d'une force colossale. Il peut allonger ses branches, durcir son écorce et faire pousser son corps à volonté.",
  "Même réduit à un simple éclat de bois, il est capable de repousser entièrement, ce qui le rend presque impossible à détruire. Doux et profondément loyal, Groot veille sur ses compagnons Gardiens, en particulier Rocket.",
 ],
});
// ─── LOT : Chevaliers du Zodiaque ───
Object.assign(FIG_PAGES, {
 cz01: [
  "Seiya est le Chevalier de bronze de Pégase, héros principal de la saga. Orphelin, il s'entraîne durement en Grèce pour conquérir son armure et revenir au Japon retrouver sa sœur disparue.",
  "Fidèle à la déesse Athéna, il se bat pour protéger la Terre et la justice. Sa technique emblématique enchaîne une rafale de coups à la vitesse de la lumière. Têtu et généreux, Seiya se relève toujours, porté par sa volonté de protéger ses amis.",
 ],
 cz02: [
  "Shiryu est le Chevalier de bronze du Dragon, formé en Chine au pied des Cinq Pics auprès d'un vieux maître. Calme, réfléchi et profondément loyal, il incarne l'honneur du groupe.",
  "Son armure protège son bras d'un bouclier presque indestructible et arme son poing d'une force capable de fendre la roche. Prêt à tout sacrifier pour ses compagnons, Shiryu est l'un des chevaliers les plus courageux et les plus sages.",
 ],
 cz03: [
  "Hyoga est le Chevalier de bronze du Cygne, originaire de Sibérie. Hanté par le souvenir de sa mère reposant au fond des eaux glacées, il maîtrise le froid et la glace.",
  "Ses attaques gèlent l'adversaire et brisent ses mouvements ; il peut abaisser la température jusqu'au zéro absolu. Mélancolique mais fidèle, Hyoga apprend à dompter ses émotions pour devenir un combattant redoutable.",
 ],
 cz04: [
  "Shun est le Chevalier de bronze d'Andromède, le plus doux et le plus pacifique du groupe. Il déteste la violence et ne se bat que lorsqu'il y est contraint, pour défendre les autres.",
  "Son arme est une longue chaîne qu'il manie avec une précision étonnante, autant pour attaquer que pour se protéger. Frère cadet d'Ikki, Shun cache, sous sa gentillesse, un cœur d'une bravoure exceptionnelle.",
 ],
 cz05: [
  "Ikki est le Chevalier de bronze du Phénix, frère aîné de Shun. Endurci par un entraînement terrible sur une île hostile, c'est un combattant solitaire et imprévisible.",
  "À l'image de l'oiseau légendaire, il renaît toujours de ses cendres, plus fort après chaque défaite. Sa technique plonge l'adversaire dans de puissantes illusions. Distant en apparence, Ikki veille pourtant sur son frère et ses compagnons.",
 ],
 cz06: [
  "Saori Kido est la réincarnation d'Athéna, déesse de la sagesse et de la guerre juste. D'abord jeune fille gâtée, elle prend conscience de sa mission : protéger la Terre et l'humanité.",
  "Elle guide les Chevaliers de bronze dans leurs combats et n'hésite pas à risquer sa propre vie pour les sauver. Bienveillante et courageuse, Athéna est le cœur autour duquel se rassemblent tous les héros.",
 ],
 cz07: [
  "Mû est le Chevalier d'or du Bélier, gardien du premier temple du Sanctuaire. Maître des armures, il sait réparer les protections les plus endommagées grâce à un savoir rare.",
  "Doté de pouvoirs psychiques, il déplace les objets par la pensée et dresse des murs d'énergie. Calme et profondément sage, Mû observe longtemps avant d'agir, mais sa puissance est à la hauteur de sa réputation.",
 ],
 cz08: [
  "Aldébaran est le Chevalier d'or du Taureau, gardien du deuxième temple. Géant au grand cœur, il impressionne par sa carrure et sa force colossale.",
  "Sa charge, semblable à celle d'un taureau lancé au galop, balaie tout sur son passage. Loyal et chaleureux malgré son allure imposante, Aldébaran est un protecteur fidèle du Sanctuaire.",
 ],
 cz09: [
  "Saga est le Chevalier d'or des Gémeaux, l'un des plus puissants de tous. Mais il est partagé entre deux personnalités opposées, l'une noble et juste, l'autre dévorée par l'ambition.",
  "Sa part sombre le pousse à s'emparer du Sanctuaire en se dissimulant derrière le masque du Grand Pope. Capable d'attaques d'une force cosmique dévastatrice, Saga est un adversaire aussi tragique que redoutable.",
 ],
 cz10: [
  "Le Masque de Mort est le Chevalier d'or du Cancer, gardien du quatrième temple. Cruel et sans pitié, il se distingue des autres chevaliers d'or par son mépris de la vie.",
  "Sa technique projette l'âme de ses victimes vers le royaume des morts. Arrogant et violent, il a tourné le dos aux valeurs de justice que les Chevaliers sont censés défendre.",
 ],
 cz11: [
  "Aioria est le Chevalier d'or du Lion, gardien du cinquième temple. Fier et ardent, il est le frère cadet d'Aiolos, longtemps considéré injustement comme un traître.",
  "Sa technique fulgurante frappe l'adversaire d'une nuée d'éclairs à la vitesse de la lumière. Loyal envers Athéna, Aioria cherche à laver l'honneur de sa famille et se révèle l'un des combattants les plus puissants du Sanctuaire.",
 ],
 cz12: [
  "Shaka est le Chevalier d'or de la Vierge, réputé être « l'homme le plus proche des dieux ». Maître de méditation, il combat le plus souvent les yeux fermés pour mieux concentrer sa puissance.",
  "Il peut priver son adversaire de ses cinq sens, un à un. D'une sérénité et d'une force spirituelle exceptionnelles, Shaka est considéré comme le plus puissant des Chevaliers d'or.",
 ],
 cz13: [
  "Dohko est le Chevalier d'or de la Balance, gardien du septième temple. Vétéran d'une grande guerre sainte d'autrefois, il a vécu plus de deux siècles pour veiller sur le monde.",
  "Son armure de la Balance renferme un arsenal complet, fait pour armer ceux qui en ont besoin. Sage parmi les sages, Dohko unit l'expérience des anciens à la puissance des chevaliers d'or.",
 ],
 cz14: [
  "Milo est le Chevalier d'or du Scorpion, gardien du huitième temple. Fier et droit, il applique sans faiblir les règles du Sanctuaire, quitte à se montrer impitoyable.",
  "Son attaque frappe en une série de piqûres aussi précises que le dard d'un scorpion, chacune affaiblissant un peu plus l'adversaire. Sous sa rigueur se cache un profond sens de l'honneur.",
 ],
 cz15: [
  "Aiolos est le Chevalier d'or du Sagittaire. Il y a des années, il a sauvé la déesse Athéna nouveau-née d'un complot, au prix de sa propre vie, et fut injustement accusé de trahison.",
  "Son geste héroïque a protégé l'avenir du monde. Symbole de loyauté et de sacrifice, Aiolos demeure une figure exemplaire dont l'armure d'or continue de veiller sur les héros.",
 ],
 cz16: [
  "Shura est le Chevalier d'or du Capricorne, gardien du dixième temple, dévoué corps et âme à Athéna. On dit que son bras tranche comme la plus légendaire des épées.",
  "Capable de couper presque n'importe quelle matière d'un seul geste, il est l'un des chevaliers les plus dangereux au combat rapproché. Sa fidélité, d'abord mal dirigée, le conduit finalement à se racheter.",
 ],
 cz17: [
  "Camus est le Chevalier d'or du Verseau, maître absolu de la glace et du froid. Calme, distant et rigoureux, il fut le mentor de Hyoga, à qui il a transmis l'art de geler ses adversaires.",
  "Ses attaques peuvent atteindre le zéro absolu, immobilisant toute chose. Derrière sa froideur apparente, Camus est un enseignant exigeant qui veut pousser ses élèves vers le dépassement de soi.",
 ],
 cz18: [
  "Aphrodite est le Chevalier d'or des Poissons, gardien du douzième et dernier temple. Obsédé par la beauté, il combat à l'aide de roses aussi splendides que mortelles.",
  "Ses fleurs empoisonnées et tranchantes désorientent l'adversaire avant de frapper. Élégant mais sans pitié, Aphrodite est le dernier rempart à franchir avant le palais du Grand Pope.",
 ],
 cz19: [
  "Marine est un Chevalier d'argent de l'Aigle et l'instructrice de Seiya. Le visage masqué, comme le veut la règle des femmes chevaliers, elle lui a transmis discipline et technique.",
  "Habile et bienveillante, elle veille sur son élève de loin tout au long de ses combats. Marine cache aussi sa propre quête personnelle, qui la lie au destin des héros.",
 ],
 cz20: [
  "Shaina est un Chevalier d'argent du Serpentaire, fière et redoutable guerrière. D'abord adversaire des Chevaliers de bronze, elle se montre aussi impitoyable que déterminée.",
  "Son masque dissimule son visage, selon la loi des femmes chevaliers. Au fil des combats, son hostilité envers Seiya laisse place à des sentiments plus complexes, et elle finit par défendre la cause d'Athéna.",
 ],
 cz21: [
  "Kiki est le jeune disciple de Mû, le Chevalier d'or du Bélier. Encore enfant, il possède déjà des pouvoirs psychiques et peut déplacer les objets par la pensée.",
  "Espiègle et curieux, il accompagne et aide les Chevaliers de bronze, transportant parfois leurs armures. Kiki représente la relève, la promesse des chevaliers de demain.",
 ],
 cz22: [
  "Jabu est le Chevalier de bronze de la Licorne, l'un des jeunes guerriers formés en même temps que Seiya. Fier et un brin orgueilleux, il rêve de prouver sa valeur.",
  "Sa technique s'appuie sur la puissance de ses coups de pied, à l'image de la ruade d'une monture. Malgré ses rivalités, Jabu se range aux côtés des héros pour défendre Athéna.",
 ],
 cz23: [
  "Cassios est un colosse au service du Sanctuaire, rival acharné de Seiya durant leur entraînement en Grèce. Sa force physique brute en fait un adversaire impressionnant.",
  "Leur affrontement pour conquérir l'armure de Pégase fut féroce. Brutal en apparence, Cassios révèle pourtant, à sa manière, un véritable sens du courage et du sacrifice.",
 ],
 cz24: [
  "Docrate est un puissant guerrier ennemi que les Chevaliers de bronze affrontent au début de leur quête. De grande taille et d'une force peu commune, il cherche à s'emparer d'une armure d'or.",
  "Son gabarit et sa résistance en font un obstacle redoutable pour les jeunes héros encore inexpérimentés. Il met à l'épreuve leur solidarité naissante.",
 ],
 cz25: [
  "Misty est un Chevalier d'argent du Lézard, élégant et terriblement vaniteux, persuadé d'être d'une beauté parfaite. Il fait partie des chevaliers envoyés pour récupérer une armure d'or.",
  "Rapide et précis, il sous-estime toutefois la détermination de Seiya. Son orgueil démesuré finit par le desservir face à un adversaire qui refuse d'abandonner.",
 ],
 cz26: [
  "Sous les traits du Vieux Maître des Cinq Pics se cache en réalité Dohko de la Balance, qui a traversé les siècles pour surveiller le scellement d'anciens ennemis.",
  "Maître de Shiryu, il lui enseigne la voie du Dragon et la sagesse du combat. Patient et énigmatique, il observe le monde depuis sa cascade, prêt à reprendre sa pleine puissance le jour venu.",
 ],
 cz27: [
  "Guilty fut l'impitoyable maître d'Ikki sur une île hostile où l'entraînement tournait à l'épreuve de survie. Sa dureté extrême a forgé le caractère solitaire et indomptable du Phénix.",
  "Cette éducation brutale a fait d'Ikki un guerrier capable de renaître de ses souffrances. La figure de Guilty hante longtemps le parcours du Chevalier du Phénix.",
 ],
 cz28: [
  "Le Chevalier de Cristal est le maître qui a initié Hyoga à l'art de la glace, dans le grand froid de Sibérie. Calme et lumineux, il lui a transmis les bases de ses techniques glaciales.",
  "Sous son influence, Hyoga apprend à canaliser le froid pour en faire une arme. Le lien entre le disciple et son mentor marque profondément le parcours du Chevalier du Cygne.",
 ],
 cz29: [
  "Albior est le maître qui a formé Shun sur l'île d'Andromède. Sage et bienveillant, il a enseigné au jeune garçon la maîtrise de la chaîne et le respect de la vie.",
  "Chevalier expérimenté, il incarne la transmission et la droiture. Son enseignement a façonné la douceur courageuse qui caractérise Shun.",
 ],
 cz30: [
  "Argol est un Chevalier d'argent de Persée. Son arme la plus redoutable est un bouclier orné d'un visage terrifiant, capable de pétrifier quiconque ose le regarder.",
  "Face à ce pouvoir, les héros doivent ruser et combattre les yeux fermés. Argol représente l'un des premiers grands défis des Chevaliers de bronze sur le chemin du Sanctuaire.",
 ],
 cz31: [
  "Le Grand Pope est la plus haute autorité du Sanctuaire, censé diriger les Chevaliers au nom d'Athéna. Le visage caché sous un masque, il commande depuis le palais qui domine les douze temples.",
  "Mais le siège a été usurpé, et derrière le masque se dissimule une volonté de pouvoir qui trahit la déesse. Démasquer l'imposteur est l'ultime enjeu de la quête des Chevaliers de bronze.",
 ],
});
// ─── LOT : DC Comics ───
Object.assign(FIG_PAGES, {
 dc01: [
  "Batman est le justicier de Gotham City, sous le masque se cache Bruce Wayne, milliardaire orphelin. Enfant, il a vu ses parents assassinés sous ses yeux et a juré de combattre le crime.",
  "Sans le moindre super-pouvoir, il s'appuie sur une intelligence hors norme, un entraînement physique extrême et un arsenal de gadgets. Détective de génie et stratège, Batman protège sa ville dans l'ombre, par la peur qu'il inspire aux criminels.",
 ],
 dc02: [
  "Robin est le jeune partenaire de Batman, son fidèle acolyte dans la lutte contre le crime à Gotham. Acrobate accompli, il combine agilité, courage et sens de la repartie.",
  "Formé par le Chevalier Noir, il apprend les arts du combat et de l'enquête. Robin apporte une énergie plus lumineuse au duo, et plusieurs jeunes héros ont porté ce nom au fil du temps.",
 ],
 dc03: [
  "Le Joker est l'ennemi juré de Batman, criminel au visage blafard et au rictus permanent. Imprévisible et profondément chaotique, il sème la terreur sans logique apparente.",
  "Armé de gadgets piégés et d'un humour macabre, il représente le pur désordre face à l'ordre que défend Batman. Son affrontement sans fin avec le Chevalier Noir est l'un des plus célèbres de la bande dessinée.",
 ],
 dc04: [
  "Le Pingouin est Oswald Cobblepot, parrain du crime à Gotham, reconnaissable à son haut-de-forme, son monocle et son embonpoint. Rusé et cupide, il dirige ses affaires depuis les bas-fonds.",
  "Ses parapluies dissimulent toutes sortes de gadgets : armes, lames ou hélices pour s'envoler. Plus manipulateur que combattant, le Pingouin est un adversaire retors de Batman.",
 ],
 dc05: [
  "Double-Face est Harvey Dent, autrefois procureur intègre de Gotham, dont la moitié du visage a été défigurée. Le drame a brisé son esprit et fait surgir une seconde personnalité, criminelle.",
  "Obsédé par la dualité, il confie chacune de ses décisions au lancer d'une pièce abîmée d'un côté. Tragique plus que purement mauvais, il symbolise la frontière fragile entre le bien et le mal.",
 ],
 dc06: [
  "Catwoman est Selina Kyle, cambrioleuse insaisissable de Gotham, aussi agile qu'un chat. Vêtue de cuir et armée d'un fouet, elle se faufile là où personne ne l'attend.",
  "Tantôt adversaire, tantôt alliée de Batman, elle suit son propre code et brouille la limite entre voleuse et héroïne. Indépendante et maligne, Catwoman est l'une des figures les plus ambiguës de Gotham.",
 ],
 dc07: [
  "Poison Ivy est Pamela Isley, scientifique transformée en une femme au pouvoir sur les plantes. Elle commande la végétation, manie des poisons et des toxines, et résiste aux substances les plus dangereuses.",
  "Convaincue que la nature passe avant l'humanité, elle mène un combat extrême pour la défendre. Séduisante et redoutable, Poison Ivy est l'une des adversaires les plus singulières de Batman.",
 ],
 dc08: [
  "L'Homme-Mystère est Edward Nigma, criminel obsédé par les énigmes et les casse-tête. Reconnaissable à son costume vert parsemé de points d'interrogation, il laisse toujours des indices à résoudre.",
  "Persuadé d'être plus intelligent que tout le monde, il défie Batman sur le terrain de la réflexion. Son orgueil le pousse à semer des devinettes qui finissent par trahir ses propres plans.",
 ],
 dc09: [
  "L'Épouvantail est Jonathan Crane, un ancien spécialiste de la psychologie devenu maître de la peur. Il a mis au point un gaz qui plonge ses victimes dans leurs pires cauchemars.",
  "Vêtu comme un épouvantail effrayant, il étudie froidement la terreur qu'il provoque. Pour le vaincre, Batman doit affronter non seulement le criminel, mais aussi ses propres angoisses.",
 ],
 dc10: [
  "Mister Freeze est Victor Fries, un savant condamné à vivre dans le froid après un accident de laboratoire. Sans une combinaison réfrigérée, il ne peut plus survivre à température normale.",
  "Son canon glaçant fige instantanément ce qu'il touche. Derrière le criminel se cache un drame : il cherche désespérément à sauver son épouse malade, ce qui rend ce personnage profondément tragique.",
 ],
 dc11: [
  "Alfred Pennyworth est le majordome dévoué de la famille Wayne et le plus fidèle allié de Batman. Bien plus qu'un domestique, il est un confident, un soutien et une figure paternelle pour Bruce.",
  "Fort d'un passé au service et de connaissances en médecine, il soigne les blessures du héros et veille sur la Bat-Cave. Sans le calme et la loyauté d'Alfred, Batman ne pourrait pas mener son combat.",
 ],
 dc12: [
  "Superman est l'un des plus grands héros du monde, né Kal-El sur la planète Krypton et envoyé sur Terre avant la destruction de son monde. Élevé par une famille de fermiers, il grandit avec des valeurs de bonté et de justice.",
  "Sous le soleil de notre planète, il acquiert le vol, une force colossale, une vision capable de percer la matière et un souffle glacial. Sa seule grande faiblesse est la kryptonite. Sous l'identité de Clark Kent, il mène une vie discrète de journaliste.",
 ],
 dc13: [
  "Supergirl est Kara Zor-El, cousine de Superman et elle aussi originaire de Krypton. Arrivée sur Terre plus tard, elle partage les mêmes pouvoirs extraordinaires : vol, force surhumaine et vision puissante.",
  "Plus jeune et impétueuse, elle apprend à maîtriser ses capacités tout en trouvant sa propre voie de héroïne. Courageuse et déterminée, Supergirl défend la Terre avec la même générosité que son célèbre cousin.",
 ],
 dc14: [
  "Wonder Woman est la princesse Diana, guerrière issue d'un peuple d'Amazones vivant sur une île protégée. Dotée d'une force et d'une agilité exceptionnelles, elle quitte son monde pour défendre la paix parmi les humains.",
  "Elle manie un lasso magique qui contraint à dire la vérité et des bracelets capables de dévier les attaques. Ambassadrice de la justice et de la compassion, Wonder Woman est l'une des plus grandes héroïnes de tous les temps.",
 ],
 dc15: [
  "Green Lantern est Hal Jordan, pilote d'essai choisi pour porter un anneau de pouvoir d'une grande corporation de gardiens de l'univers. Cet anneau matérialise tout ce que son porteur imagine.",
  "Alimenté par la volonté et le courage, il crée des boucliers, des armes ou des outils de pure énergie verte. Membre d'un corps de héros qui veille sur l'espace, Green Lantern protège la Terre comme des galaxies entières.",
 ],
 dc16: [
  "Flash est Barry Allen, un scientifique de la police devenu l'homme le plus rapide du monde après un accident. Il puise sa vitesse dans une mystérieuse force qui l'entoure.",
  "Il court plus vite que l'éclair, traverse les murs en faisant vibrer son corps et réagit en une fraction de seconde. Sous ses allures de héros bon vivant, Flash protège sa ville avec un sens aigu du devoir.",
 ],
 dc17: [
  "Hawkgirl est une héroïne ailée, capable de voler grâce à de grandes ailes et à un métal extraordinaire qui défie la gravité. Elle combat à l'aide d'une masse d'armes redoutable.",
  "Combative et directe, elle fonce au cœur de l'action sans hésiter. Son histoire est liée à d'anciennes vies et à un lointain héritage guerrier, qui font d'elle une combattante hors du commun.",
 ],
 dc18: [
  "Martian Manhunter est J'onn J'onzz, le dernier survivant de Mars. Doté de pouvoirs immenses, il peut changer de forme, lire les pensées, devenir invisible et voler avec une grande force.",
  "Solitaire et mélancolique, il se mêle aux humains pour mieux les comprendre et les protéger. Sa principale faiblesse est le feu. Sage et puissant, il est l'un des piliers les plus discrets des grands héros.",
 ],
 dc19: [
  "Shazam est Billy Batson, un jeune garçon au grand cœur choisi par un ancien magicien. En prononçant un mot magique, il se transforme en un héros adulte doté de la puissance de plusieurs dieux.",
  "La foudre lui donne force, vitesse et résistance hors du commun. Derrière le héros demeure pourtant un enfant, ce qui rend Shazam aussi attachant que puissant.",
 ],
 dc20: [
  "Green Arrow est Oliver Queen, un milliardaire devenu archer justicier après avoir été abandonné sur une île déserte. Sans super-pouvoir, il s'appuie sur une adresse au tir quasi infaillible.",
  "Son carquois regorge de flèches truquées : explosives, à grappin ou à filet. À la manière d'un héros au grand cœur qui défend les plus faibles, Green Arrow met sa fortune et ses talents au service de la justice.",
 ],
 dc21: [
  "Aquaman est Arthur Curry, roi des mers et souverain du royaume englouti d'Atlantide. Né d'un humain et d'une reine des océans, il évolue aussi bien sur terre que dans les profondeurs.",
  "Il nage à très grande vitesse, possède une force surhumaine et communique par la pensée avec les créatures marines. Armé de son trident, Aquaman protège à la fois la surface et les mystères des océans.",
 ],
 dc22: [
  "Power Girl est une héroïne aux origines kryptoniennes, cousine d'un grand héros venu d'un autre monde. Elle partage des pouvoirs comparables : vol, force colossale et grande résistance.",
  "Assurée et au fort caractère, elle ne se laisse jamais intimider. Power Girl met sa puissance au service du bien avec une indépendance et une énergie qui la rendent unique.",
 ],
 dc23: [
  "Black Adam est un champion de l'Antiquité, doté des mêmes pouvoirs divins que Shazam, mais avec une vision bien plus impitoyable de la justice. La foudre lui confère une force et une puissance immenses.",
  "Ni tout à fait héros, ni simple vilain, il applique ses propres règles, parfois cruelles. Cet antihéros au passé tragique est l'un des personnages les plus puissants et les plus ambigus de l'univers DC.",
 ],
 dc24: [
  "Captain Atom est un héros dont le corps est enveloppé d'une enveloppe métallique née d'un accident lié à une énergie nucléaire. Il manipule d'énormes quantités d'énergie qu'il projette ou utilise pour voler.",
  "Capable de relâcher une puissance dévastatrice, il doit aussi apprendre à la contrôler pour ne pas devenir un danger. Soldat dans l'âme, Captain Atom mêle discipline militaire et pouvoirs quasi illimités.",
 ],
 dc25: [
  "Cyborg est Victor Stone, un jeune homme grièvement blessé puis reconstruit avec des prothèses technologiques avancées. Mi-humain, mi-machine, il porte en lui une puissance de calcul et d'armement impressionnante.",
  "Il se connecte aux ordinateurs et aux réseaux, déploie des canons d'énergie et encaisse des coups énormes. Au-delà de ses circuits, Cyborg lutte pour préserver son humanité, ce qui fait de lui un héros profondément touchant.",
 ],
 dc26: [
  "Doomsday est une créature monstrueuse d'une force destructrice presque sans limite, née pour détruire. Sa peau est hérissée de pointes osseuses et son corps résiste aux assauts les plus violents.",
  "Sa particularité la plus redoutable : après chaque défaite, il revient plus résistant, immunisé contre ce qui l'a abattu. Doomsday est l'un des rares adversaires à avoir poussé Superman dans ses derniers retranchements.",
 ],
 dc27: [
  "Brainiac est une intelligence extraterrestre, à la fois machine et esprit, obsédée par l'accumulation de tout le savoir de l'univers. Reconnaissable à sa peau verdâtre, il est d'une froideur implacable.",
  "Il miniaturise et emprisonne des villes entières pour les collectionner, effaçant des civilisations au passage. Génie sans pitié, Brainiac compte parmi les ennemis les plus dangereux de Superman.",
 ],
 dc28: [
  "Darkseid est un tyran cosmique, seigneur d'un monde sombre et hostile, qui rêve d'asservir l'univers tout entier. Sa puissance est telle qu'il est considéré comme l'un des êtres les plus redoutables de l'univers DC.",
  "De ses yeux jaillissent des rayons capables de poursuivre leur cible sans jamais la manquer. Implacable et calculateur, Darkseid cherche une formule qui lui donnerait le contrôle sur toute volonté vivante.",
 ],
});
// ─── LOT : Dragon Ball (suite db11-db36) ───
Object.assign(FIG_PAGES, {
 db11: [
  "Broly est un Saiyan d'une puissance hors du commun, surnommé le Super Saiyan légendaire. Sa force semble ne connaître aucune limite et augmente sans cesse au fil du combat.",
  "Longtemps incontrôlable, emporté par une rage dévastatrice, il est capable de tenir tête à plusieurs guerriers d'élite à la fois. Broly incarne la puissance brute des Saiyans poussée à son paroxysme.",
 ],
 db12: [
  "L'Ultra Instinct est l'un des états les plus avancés que Goku ait atteints. Dans cette forme, son corps réagit et esquive tout seul, sans réflexion, libéré de l'hésitation.",
  "Sa chevelure et son aura prennent une teinte argentée. Cette maîtrise extrême, longtemps réservée à des divinités, représente l'aboutissement de toute une vie d'entraînement et de dépassement de soi.",
 ],
 db13: [
  "Hercule, aussi appelé Mr Satan, est le « champion du monde » autoproclamé des arts martiaux. En réalité dépourvu de véritables pouvoirs, il doit surtout sa gloire à sa mise en scène et à un immense coup de chance.",
  "Vantard et froussard, il s'est attribué la victoire contre de redoutables ennemis vaincus en secret par les vrais héros. Pourtant, derrière le bluff, Hercule a parfois un courage et une bonté sincères. C'est le père de Videl.",
 ],
 db14: [
  "C-17 est un cyborg créé par le Dr Gero, frère jumeau de C-18. Doté d'une énergie inépuisable, il n'a pas besoin de se reposer et peut combattre sans fin.",
  "D'abord froid et insouciant, il choisit plus tard une vie paisible de garde forestier, protecteur de la nature et des animaux. Calme et indépendant, C-17 cache une puissance considérable.",
 ],
 db15: [
  "La Tortue Géniale, ou Maître Roshi, est un vieux maître d'arts martiaux à la longévité extraordinaire. C'est lui qui a formé Goku et Krilin et inventé la célèbre vague d'énergie qu'ils utilisent.",
  "Souvent comique et farfelu, il cache derrière son grand âge une sagesse réelle et une puissance qui peut encore surprendre. La Tortue Géniale est l'un des piliers de la formation des héros.",
 ],
 db16: [
  "Chichi est l'épouse de Goku et la fille du Roi Gyumao. Élevée comme une jeune combattante, elle est devenue une mère exigeante qui rêve d'un avenir brillant pour ses fils.",
  "Elle insiste pour que Gohan et Goten étudient autant qu'ils s'entraînent. Au caractère bien trempé, Chichi veille farouchement sur sa famille et ne se laisse jamais marcher sur les pieds.",
 ],
 db17: [
  "Son Goten est le second fils de Goku, qu'il n'a longtemps pas connu. Son visage et sa coiffure rappellent étonnamment ceux de son père enfant.",
  "Très doué malgré son jeune âge, il accède très tôt à la transformation en Super Saiyan. Avec son meilleur ami Trunks, il apprend une technique de fusion qui combine leurs forces en un seul guerrier surpuissant.",
 ],
 db18: [
  "Trunks enfant est le fils de Végéta et de Bulma, espiègle et plein d'énergie. Fier comme son père, il rivalise volontiers avec son ami Goten.",
  "Très tôt capable de devenir Super Saiyan, il forme avec Goten un duo inséparable. Ensemble, grâce à une danse de fusion, ils donnent naissance à un combattant fusionné d'une puissance impressionnante.",
 ],
 db19: [
  "Bulma est une scientifique de génie, héritière de la firme Capsule Corp, célèbre pour ses inventions qui rangent des objets entiers dans de minuscules capsules. C'est elle qui, au tout début, entraîne Goku à la recherche des Dragon Balls.",
  "Curieuse, débrouillarde et au sacré caractère, elle conçoit véhicules, radars et machines en tout genre. Amie de toujours des héros et épouse de Végéta, Bulma est le cerveau technique du groupe.",
 ],
 db20: [
  "Videl est la fille d'Hercule, une jeune fille intrépide qui aide à faire régner l'ordre dans sa ville. Décidée à progresser, elle apprend les arts martiaux puis, auprès de Gohan, la technique du vol.",
  "Courageuse et franche, elle s'attache à Gohan et finit par fonder une famille avec lui. Videl montre qu'avec de la volonté, on peut s'élever bien au-delà de ses débuts.",
 ],
 db21: [
  "Yamcha est un ancien bandit du désert devenu l'un des compagnons fidèles de Goku. Reconverti, il devient aussi un joueur de baseball réputé.",
  "Son style de combat imite les assauts vifs d'un loup. S'il n'est pas le plus puissant du groupe, Yamcha reste un allié courageux, présent dans les grandes batailles aux côtés des héros.",
 ],
 db22: [
  "Tenshinhan est un artiste martial reconnaissable à son troisième œil. D'abord adversaire de Goku, il devient un allié discipliné et droit, attaché au dépassement de soi.",
  "Sa technique la plus redoutable concentre toute son énergie en un tir dévastateur, au prix d'un grand effort. Sérieux et loyal, Tenshinhan est l'un des plus solides combattants humains.",
 ],
 db23: [
  "Chaozu est un petit guerrier au teint pâle, doté de pouvoirs psychiques. Il peut immobiliser ses adversaires par la pensée et déplacer des objets à distance.",
  "Inséparable de son ami Tenshinhan, il fait preuve d'une loyauté absolue, prêt à tous les sacrifices pour les siens. Malgré sa petite taille, Chaozu ne manque pas de courage.",
 ],
 db24: [
  "Yajirobé est un combattant bourru qui manie le sabre, plus malin que téméraire. Souvent peureux, il rend pourtant de grands services aux héros aux moments décisifs.",
  "C'est notamment lui qui apporte les haricots magiques capables de soigner instantanément les blessures. Derrière son apparente lâcheté, Yajirobé se révèle parfois étonnamment utile et courageux.",
 ],
 db25: [
  "C-16 est un cyborg de grande taille créé par le Dr Gero. Contrairement à ses semblables, c'est un être profondément doux, qui aime la nature et déteste la violence.",
  "Malgré une force colossale, il refuse de se battre sans raison et protège les animaux. Pacifiste au grand cœur, C-16 émeut par le contraste entre sa puissance et sa bonté.",
 ],
 db26: [
  "Mr Popo est le gardien mystérieux du Palais céleste, qui veille sur les lieux depuis des temps immémoriaux. Calme et énigmatique, il assiste le Tout-Puissant qui protège la Terre.",
  "Il aide aussi les héros à s'entraîner et à progresser, leur ouvrant l'accès à des épreuves particulières. Discret mais essentiel, Mr Popo est une figure tutélaire de l'univers de Dragon Ball.",
 ],
 db27: [
  "Kaio Shin est une divinité chargée de veiller sur l'univers et l'équilibre du monde. Bien plus sage que puissant au combat, il guide les héros face aux plus grandes menaces.",
  "C'est lui qui les met en garde contre le réveil d'un être de destruction redoutable. Son rôle est de préserver la vie et de transmettre le savoir des dieux aux défenseurs de la Terre.",
 ],
 db28: [
  "Shenron est le dragon sacré qui apparaît lorsque les sept Dragon Balls sont réunies. Immense, serpentin et majestueux, il s'élève dans le ciel pour exaucer un vœu.",
  "Il peut accomplir des prodiges, jusqu'à ramener des êtres à la vie, selon des règles précises. Une fois le souhait réalisé, les boules de cristal se dispersent à travers le monde, et la quête peut recommencer.",
 ],
 db29: [
  "Le Guerrier intergalactique est un combattant venu d'au-delà des étoiles, comme on en croise dans les grands tournois d'arts martiaux qui rassemblent des champions de tout l'univers.",
  "Mesurant sa force à celle des héros de la Terre, il représente les innombrables adversaires que Goku et ses amis affrontent pour progresser. Ces duels sont l'occasion de repousser sans cesse leurs limites.",
 ],
 db30: [
  "Bardock est un Saiyan de basse caste, soldat aguerri, et le père biologique de Goku. Au sein de son monde guerrier, il combat au service d'un maître tyrannique avant de se dresser contre lui.",
  "Frappé de visions de l'avenir, il pressent le destin tragique de son peuple. Courageux jusqu'au bout, Bardock incarne la fierté et la combativité saiyanes dont héritera son fils.",
 ],
 db31: [
  "Tao Pai Pai est un assassin redouté, tueur à gages aussi arrogant que dangereux. Sûr de lui à l'excès, il méprise ses adversaires qu'il croit largement inférieurs.",
  "Vaincu une première fois, il revient transformé en partie en cyborg, avide de vengeance. Cruel et vaniteux, Tao Pai Pai est l'un des premiers grands ennemis croisés par Goku.",
 ],
 db32: [
  "Les Saibaman sont de petites créatures verdâtres que les Saiyans font pousser à partir de graines spéciales. Utilisés comme combattants jetables, ils surgissent en groupe pour submerger l'ennemi.",
  "Vifs et imprévisibles, ils peuvent se cramponner à leur cible et se sacrifier dans une explosion. Faibles individuellement, ils deviennent dangereux par le nombre et la surprise.",
 ],
 db33: [
  "Nappa est un Saiyan massif et brutal, compagnon d'armes de Végéta lors de leur invasion de la Terre. Sa force physique et sa résistance en font un adversaire écrasant pour les héros.",
  "Sans pitié et imbu de sa puissance, il sous-estime toutefois la détermination de ses ennemis. Nappa marque l'une des premières grandes épreuves affrontées par les défenseurs de la Terre.",
 ],
 db34: [
  "Le Capitaine Ginyu est le chef du commando d'élite au service du tyran Freezer. Son pouvoir le plus déroutant lui permet d'échanger son corps avec celui d'un adversaire.",
  "Avec son équipe, il a pour habitude d'enchaîner des poses théâtrales avant le combat. Rusé et puissant, Ginyu compte sur sa technique d'échange de corps pour s'approprier la force de plus fort que lui.",
 ],
 db35: [
  "Dabra est un roi des démons d'une grande puissance, serviteur dévoué d'un sorcier maléfique. Son apparence imposante et ses pouvoirs en font un ennemi de premier plan.",
  "Sa capacité la plus redoutable transforme en pierre quiconque est touché par son crachat. Fier et impitoyable, Dabra est l'un des derniers remparts avant le réveil d'une menace encore plus terrible.",
 ],
 db36: [
  "Freezer Doré est l'évolution ultime du tyran Freezer, une forme éclatante obtenue à force d'entraînement, lui qui comptait jusque-là uniquement sur son talent naturel.",
  "Dans cet état doré, sa puissance dépasse de loin tout ce qu'il avait montré auparavant. Toujours aussi cruel et orgueilleux, un Freezer enfin discipliné devient une menace d'une dangerosité inédite.",
 ],
});
// ─── LOT : Star Wars ───
Object.assign(FIG_PAGES, {
 sw01: [
  "Luke Skywalker est un jeune fermier d'une planète désertique qui rêve d'aventure. En découvrant qu'il est sensible à la Force, cette énergie mystérieuse qui relie toute chose, il s'engage dans la lutte contre un empire tyrannique.",
  "Formé par de grands maîtres, il apprend à manier le sabre laser et devient un chevalier Jedi. Courageux et plein d'espoir, Luke joue un rôle décisif dans la chute de l'Empire et la restauration de la paix.",
 ],
 sw02: [
  "Dark Vador est l'un des plus célèbres méchants de la saga, vêtu d'une armure noire et au souffle reconnaissable entre tous. Autrefois un Jedi prometteur, il a basculé du côté obscur de la Force.",
  "Devenu le bras armé de l'Empire, il inspire la terreur dans toute la galaxie. Pourtant, une étincelle de bonté subsiste en lui : au terme de son histoire, il retrouve la lumière dans un ultime geste de rédemption.",
 ],
 sw03: [
  "Maître Yoda est un Jedi minuscule mais d'une sagesse et d'une puissance immenses, âgé de plusieurs siècles. Sa manière de parler, en inversant ses phrases, est aussi célèbre que ses enseignements.",
  "Maître parmi les maîtres, il guide des générations de Jedi et perçoit la Force comme peu d'êtres en sont capables. Malgré sa petite taille, Yoda est un combattant et un mentor redoutable.",
 ],
 sw04: [
  "La princesse Leia est une dirigeante courageuse de la rébellion contre l'Empire. Diplomate habile et combattante déterminée, elle n'hésite jamais à monter au front pour défendre la liberté.",
  "Forte et lucide, elle est aussi la sœur jumelle de Luke, elle aussi sensible à la Force. Leia incarne le commandement, l'espoir et la résistance face à l'oppression.",
 ],
 sw05: [
  "Han Solo est un contrebandier débrouillard, pilote d'un vaisseau légendaire, le Faucon Millenium. Roublard et indépendant, il ne pense d'abord qu'à ses propres affaires.",
  "Mais au contact des héros, il met son talent de pilote et son courage au service de la rébellion. Sous ses airs cyniques, Han cache un cœur fidèle et un sens de l'amitié à toute épreuve.",
 ],
 sw06: [
  "Chewbacca est un Wookiee, une grande créature au pelage fourni, fidèle compagnon et copilote de Han Solo. Sa force est colossale et sa loyauté sans faille.",
  "Il s'exprime par des grognements que ses amis comprennent parfaitement. Malgré son allure impressionnante, Chewbacca est un cœur tendre, toujours prêt à protéger les siens.",
 ],
 sw07: [
  "R2-D2 est un petit droïde astromécano, infatigable et plein de ressources. Capable de réparer les vaisseaux et de pirater les systèmes, il s'exprime par une série de sifflements et de bips.",
  "Brave et malin, il transporte souvent des informations cruciales pour la rébellion. Compagnon inséparable de C-3PO, R2-D2 sauve la mise aux héros plus souvent qu'à son tour.",
 ],
 sw08: [
  "C-3PO est un droïde de protocole doré, conçu pour la communication et la traduction de millions de langues. Maniéré et anxieux, il s'inquiète à la moindre difficulté.",
  "Toujours accompagné de R2-D2, il forme avec lui un duo comique et attachant. Sous ses airs craintifs, C-3PO se rend précieux en aidant les héros à se comprendre à travers la galaxie.",
 ],
 sw09: [
  "Grogu est un petit être de la même espèce mystérieuse que le maître Yoda, sensible à la Force malgré son très jeune âge. Ses grands yeux et son air innocent l'ont rendu immédiatement célèbre.",
  "Curieux et attachant, il manifeste déjà des pouvoirs étonnants. Recueilli et protégé par un guerrier solitaire, Grogu est au cœur d'une histoire d'adoption et de tendresse.",
 ],
 sw10: [
  "Le Mandalorien est un chasseur de primes solitaire, protégé par une armure de métal précieux. Fidèle à un code d'honneur strict, il ne retire jamais son casque devant les autres.",
  "D'abord intéressé par les récompenses, il change de vie en prenant sous son aile le petit Grogu. Taciturne mais loyal, le Mandalorien devient un protecteur prêt à tout pour son jeune compagnon.",
 ],
 sw11: [
  "Obi-Wan Kenobi est un maître Jedi sage et mesuré, célèbre pour son talent au sabre laser et sa maîtrise de la Force. Il a formé plusieurs élèves au fil de sa vie.",
  "Mentor de Luke à ses débuts, il lui transmet les premiers secrets des Jedi. Gardien des valeurs de l'Ordre, Obi-Wan demeure une figure de droiture et de courage face à la montée du côté obscur.",
 ],
 sw12: [
  "Les Stormtroopers sont les soldats de l'Empire, vêtus d'une armure blanche reconnaissable entre toutes. Déployés en grand nombre, ils maintiennent l'ordre par la force et la peur.",
  "Armés de blasters, ils interviennent en rangs serrés sur tous les fronts de la galaxie. Anonymes sous leur casque, ils symbolisent la puissance écrasante mais impersonnelle de l'Empire.",
 ],
 sw13: [
  "Boba Fett est l'un des chasseurs de primes les plus redoutés de la galaxie, vêtu d'une armure mandalorienne usée par les combats. Son équipement comprend un jet-pack et tout un arsenal.",
  "Silencieux et efficace, il traque ses cibles avec une froide détermination. Sa réputation de traqueur implacable en fait une légende parmi les hors-la-loi.",
 ],
 sw14: [
  "Rey est une jeune femme débrouillarde, livrée à elle-même sur une planète reculée, qui découvre peu à peu sa puissante sensibilité à la Force. Son destin la propulse au cœur d'un grand conflit.",
  "Formée aux voies des Jedi, elle apprend à manier le sabre laser et à maîtriser ses dons. Courageuse et indépendante, Rey représente une nouvelle génération de héros porteurs d'espoir.",
 ],
 sw15: [
  "Kylo Ren est un guerrier du côté obscur, au tempérament tourmenté, reconnaissable à son masque et à son sabre laser à la garde en forme de croix. Il est habité par un conflit intérieur permanent.",
  "Tiraillé entre l'attrait des ténèbres et l'appel de la lumière, il lutte contre son propre héritage. Cette dualité fait de Kylo Ren l'un des personnages les plus complexes de la saga récente.",
 ],
 sw16: [
  "L'Empereur Palpatine est le maître caché de l'Empire, un seigneur du côté obscur d'une ruse redoutable. Pendant des années, il manipule la galaxie dans l'ombre avant de saisir le pouvoir absolu.",
  "Il foudroie ses ennemis d'éclairs jaillissant de ses mains et corrompt les âmes par la tentation. Patient et impitoyable, Palpatine est l'incarnation même du mal qui ronge la galaxie.",
 ],
 sw17: [
  "Dark Maul est un apprenti du côté obscur, au visage rouge et noir orné de cornes, à l'allure aussi inquiétante que spectaculaire. Acrobate et combattant féroce, il se déplace avec une agilité bestiale.",
  "Son arme distinctive est un sabre laser à double lame, qu'il fait tournoyer pour frapper de tous les côtés. Silencieux et brutal, Dark Maul est l'un des adversaires les plus impressionnants des Jedi.",
 ],
});
// ─── LOT : Pokémon ───
Object.assign(FIG_PAGES, {
 pk01: [
  "Pikachu est sans doute le Pokémon le plus célèbre au monde. Petit rongeur jaune aux longues oreilles pointues et à la queue en forme d'éclair, il stocke de l'électricité dans les poches rouges de ses joues.",
  "De type Électrik, il libère des décharges plus ou moins puissantes selon son humeur. Vif, attachant et fidèle, Pikachu est le partenaire inséparable du dresseur Sacha dans ses aventures.",
 ],
 pk02: [
  "Raichu est l'évolution de Pikachu, obtenue grâce à une Pierre Foudre. Plus grand et plus robuste, il dégage une électricité bien plus intense.",
  "Sa longue queue se termine par une pointe qui lui sert à se décharger dans le sol pour ne pas être paralysé par sa propre énergie. Raichu est un Pokémon Électrik puissant et impressionnant.",
 ],
 pk03: [
  "Salamèche est un petit Pokémon de type Feu, semblable à un lézard, reconnaissable à la flamme qui brûle au bout de sa queue. Cette flamme reflète sa santé et son humeur.",
  "Si elle vacille, c'est que Salamèche est fatigué ; si elle flambe haut, c'est qu'il est en pleine forme. Curieux et joueur, c'est l'un des tout premiers compagnons que choisissent de nombreux dresseurs.",
 ],
 pk04: [
  "Reptincel est l'évolution de Salamèche. Plus grand, plus sûr de lui et plus combatif, il se montre nettement plus agressif au combat.",
  "La flamme de sa queue brûle plus fort, signe de sa puissance grandissante. Reptincel est une étape vers une évolution finale spectaculaire.",
 ],
 pk05: [
  "Dracaufeu est l'évolution finale de Salamèche, un Pokémon majestueux ressemblant à un dragon ailé, de type Feu et Vol. Il peut s'élever très haut dans le ciel.",
  "Ses flammes atteignent des températures extrêmes, capables de faire fondre presque n'importe quoi. Fier et puissant, Dracaufeu est l'un des Pokémon les plus appréciés des dresseurs.",
 ],
 pk06: [
  "Bulbizarre est un Pokémon de type Plante et Poison, qui porte sur son dos un bulbe végétal. Ce bulbe puise l'énergie du soleil pour grandir avec lui.",
  "Docile et facile à élever, c'est l'un des premiers Pokémon que choisissent les nouveaux dresseurs. Bulbizarre se sert de lianes et de spores pour combattre.",
 ],
 pk07: [
  "Herbizarre est l'évolution de Bulbizarre. Le bulbe de son dos s'est transformé en un bouton de fleur prêt à éclore.",
  "Plus il prend le soleil, plus ce bouton se développe. Herbizarre gagne en force et en assurance, annonçant une évolution finale florissante.",
 ],
 pk08: [
  "Florizarre est l'évolution finale de Bulbizarre : une grande fleur épanouie s'ouvre désormais sur son dos. De type Plante et Poison, c'est un Pokémon robuste et imposant.",
  "Sa fleur dégage un parfum apaisant et capte la lumière du soleil pour lui donner de l'énergie. Florizarre est un combattant solide et endurant.",
 ],
 pk09: [
  "Mew est un Pokémon mythique extrêmement rare, de petite taille et de couleur rose. On raconte qu'il renferme le patrimoine génétique de tous les Pokémon.",
  "Joueur et insaisissable, il maîtrise des pouvoirs psychiques et peut apprendre une grande variété de techniques. Sa simple existence relève presque de la légende.",
 ],
 pk10: [
  "Mewtwo est un Pokémon de type Psy né d'expériences scientifiques menées à partir du patrimoine de Mew. Doté d'une intelligence et d'une puissance hors du commun, il est l'un des Pokémon les plus redoutables.",
  "Ses pouvoirs psychiques lui permettent de soulever des objets, de créer des barrières et de frapper à distance. Marqué par ses origines, Mewtwo s'interroge sur sa propre existence.",
 ],
 pk11: [
  "Carapuce est un petit Pokémon de type Eau, semblable à une tortue, qui se réfugie dans sa carapace en cas de danger. Il projette de l'eau par la bouche avec précision.",
  "Sympathique et facile à dresser, c'est l'un des Pokémon de départ les plus populaires. Carapuce est le premier maillon d'une évolution puissante.",
 ],
 pk12: [
  "Carabaffe est l'évolution de Carapuce. Sa queue touffue et ses oreilles fournies lui donnent une allure plus mûre et plus solide.",
  "Bon nageur, il se déplace avec aisance dans l'eau et gagne en puissance. Carabaffe annonce une évolution finale particulièrement impressionnante.",
 ],
 pk13: [
  "Tortank est l'évolution finale de Carapuce. Cette grande tortue de type Eau porte sur sa carapace deux puissants canons capables de projeter de l'eau à très grande force.",
  "Ces jets sont assez précis et puissants pour transpercer des obstacles. Massif et résistant, Tortank est un défenseur redoutable.",
 ],
 pk14: [
  "Miaouss est un Pokémon de type Normal ressemblant à un chat, reconnaissable à la pièce dorée incrustée sur son front. Il est attiré par tout ce qui brille.",
  "Dans les aventures de Sacha, un Miaouss particulier a la capacité rare de parler comme un humain. Malin et farceur, il accompagne une célèbre équipe de malfaiteurs.",
 ],
 pk15: [
  "Évoli est un petit Pokémon de type Normal au pelage brun et à la collerette duveteuse. Sa particularité unique est de pouvoir évoluer de nombreuses façons différentes.",
  "Selon les circonstances, il peut se transformer en un Pokémon d'eau, de feu, de foudre et bien d'autres encore. Adorable et adaptable, Évoli est très apprécié des dresseurs.",
 ],
 pk16: [
  "Psykokwak est un Pokémon de type Eau ressemblant à un canard, qui se tient souvent la tête, accablé par un mal de crâne permanent.",
  "Curieusement, c'est lorsque cette migraine devient insupportable qu'il déclenche, sans le vouloir, de puissants pouvoirs psychiques. Maladroit et déroutant, Psykokwak surprend par ses capacités cachées.",
 ],
 pk17: [
  "Rondoudou est un Pokémon tout rond, rose et duveteux, de type Normal et Fée. Son grand talent est le chant.",
  "Lorsqu'il entonne sa berceuse, tous ceux qui l'entendent s'endorment irrésistiblement. Vexé que son public s'assoupisse, il a l'habitude de gribouiller sur le visage des dormeurs.",
 ],
 pk18: [
  "Fantominus est un Pokémon de type Spectre et Poison, fait presque entièrement de gaz. Il flotte dans l'obscurité et peut envelopper ses proies d'un nuage toxique.",
  "Difficile à toucher car immatériel, il aime surgir là où on ne l'attend pas. Fantominus est le premier maillon d'une évolution spectrale.",
 ],
 pk19: [
  "Ectoplasma est l'évolution finale de Fantominus, un Pokémon de type Spectre et Poison au sourire moqueur. Il se cache dans les ombres pour surprendre ses adversaires.",
  "Farceur et inquiétant, il aime jouer des tours en se fondant dans l'obscurité. Ectoplasma compte parmi les Pokémon fantômes les plus connus.",
 ],
 pk20: [
  "Lucario est un Pokémon de type Combat et Acier à l'allure de canidé dressé sur ses pattes. Sa faculté la plus remarquable est de percevoir l'aura, l'énergie qui émane de tous les êtres vivants.",
  "Grâce à elle, il devine les émotions et anticipe les mouvements de son adversaire. Noble et discipliné, Lucario est un combattant respecté et puissant.",
 ],
 pk21: [
  "Ronflex est un Pokémon de type Normal d'une taille et d'un poids impressionnants. Il passe l'essentiel de son temps à manger et à dormir.",
  "Si paisible soit-il, son corps massif peut bloquer une route entière, et il faut souvent un moyen particulier pour le réveiller. Sous sa nonchalance se cache une force considérable.",
 ],
 pk22: [
  "Sacha est un jeune dresseur passionné qui rêve de devenir un grand Maître Pokémon. Plein d'enthousiasme et de détermination, il parcourt les régions pour relever les défis des arènes.",
  "Son compagnon de toujours est Pikachu, avec qui il partage une amitié inébranlable. Généreux et obstiné, Sacha n'abandonne jamais, même face aux plus grands obstacles.",
 ],
 pk23: [
  "Ondine est une dresseuse spécialisée dans les Pokémon de type Eau et l'une des responsables d'une arène. Au caractère bien trempé, elle accompagne Sacha dans une partie de ses voyages.",
  "Courageuse et franche, elle n'hésite pas à dire ce qu'elle pense. Son lien avec ses Pokémon aquatiques et son énergie en font une compagne précieuse.",
 ],
 pk24: [
  "Pierre est un dresseur expert des Pokémon de type Roche et l'un des responsables d'une arène. Calme et posé, il voyage longtemps aux côtés de Sacha.",
  "Véritable cuisinier et soigneur du groupe, il veille sur ses compagnons humains comme sur les Pokémon. Fiable et bienveillant, Pierre est le pilier tranquille de l'équipe.",
 ],
 pk25: [
  "Jessie est un membre d'une célèbre équipe de malfaiteurs qui cherche sans cesse à s'emparer des Pokémon des autres, et surtout du Pikachu de Sacha.",
  "Avec ses complices, elle multiplie les plans farfelus qui échouent presque toujours. Théâtrale et orgueilleuse, Jessie apporte une touche comique récurrente aux aventures.",
 ],
 pk26: [
  "James fait équipe avec Jessie au sein de la même bande de malfaiteurs maladroits. Sous ses airs sûrs de lui, c'est un personnage sensible et un brin froussard.",
  "Leurs tentatives pour voler Pikachu se soldent immanquablement par un échec spectaculaire. James est l'un des trublions récurrents de la série.",
 ],
 pk27: [
  "Giovanni est le chef de la puissante organisation criminelle qui sème le trouble dans la série. Élégant et impitoyable, il dirige ses troupes d'une main de fer.",
  "Également responsable d'une arène, c'est un adversaire calculateur, bien plus dangereux que ses sous-fifres maladroits. Giovanni incarne la véritable menace qui plane sur le monde des Pokémon.",
 ],
});
// ─── LOT : Olive & Tom ───
Object.assign(FIG_PAGES, {
 ot01: [
  "Olivier Atton est le héros de la série, un jeune footballeur d'un talent exceptionnel qui adore le ballon plus que tout. Milieu offensif créatif, il dribble, passe et frappe avec une aisance déconcertante.",
  "Animé par un rêve immense — devenir champion et briller sur la scène mondiale —, il ne renonce jamais. Travailleur acharné et fin technicien, Olivier entraîne toute son équipe vers les sommets.",
 ],
 ot02: [
  "Thomas Price est un gardien de but au talent rare, à la fois agile, puissant et d'un sang-froid impressionnant dans les cages. Il fut d'abord un rival d'Olivier avant de devenir un allié.",
  "Capable d'arrêts spectaculaires, il décourage les attaquants les plus redoutables. Sérieux et exigeant, Thomas est l'un des meilleurs gardiens de tout l'univers de la série.",
 ],
 ot03: [
  "Mark Landers est un attaquant surpuissant, grand rival d'Olivier, à la frappe d'une violence redoutable. Fier et combatif, il s'entraîne avec une intensité hors du commun.",
  "Sa puissance de tir fait trembler les défenses et les gardiens adverses. Sous sa rivalité acharnée avec Olivier se cache un profond respect, qui les pousse tous deux à se dépasser.",
 ],
 ot04: [
  "Ben Becker est un gardien de but au style très particulier, qui s'inspire des arts martiaux pour ses arrêts spectaculaires. Souple et explosif, il bondit dans tous les coins de sa cage.",
  "Coéquipier de Mark Landers, il défend les buts avec une énergie débordante. Ben fait partie des gardiens les plus marquants de la série.",
 ],
 ot05: [
  "Bruce Harper est un joueur courageux et infatigable, prêt à tous les sacrifices pour son équipe. Plus volontaire que techniquement brillant, il compense par un cœur énorme.",
  "Souvent comique, il se jette dans les duels sans jamais reculer. Bruce incarne l'esprit d'équipe et la combativité.",
 ],
 ot06: [
  "Ed Warner est un milieu de terrain élégant, doté d'une technique remarquable et d'une grande vision du jeu. Sa complicité avec Olivier est légendaire.",
  "Ensemble, ils forment un duo si complémentaire qu'on les surnomme les partenaires en or. Discret mais décisif, Ed est l'un des joueurs les plus raffinés de la série.",
 ],
 ot07: [
  "Les frères Derrick sont des jumeaux acrobates au style de jeu aérien et spectaculaire. Inséparables, ils enchaînent sauts et combinaisons synchronisées qui déstabilisent les défenses.",
  "Leur entente parfaite leur permet d'inventer des actions impossibles à un seul joueur. Les frères Derrick apportent fantaisie et acrobatie au sein de l'équipe.",
 ],
 ot08: [
  "Julian Ross est un joueur d'un immense talent, à la technique presque parfaite. Mais une santé fragile, liée à son cœur, l'oblige à de grandes précautions.",
  "Sa passion pour le football est telle qu'il continue de jouer malgré les risques. Courageux et déterminé, Julian touche par sa fragilité autant qu'il impressionne par son don.",
 ],
 ot09: [
  "Phillip Callahan est un footballeur talentueux de l'univers d'Olive & Tom, qui croise la route du héros sur les terrains. Appliqué et combatif, il défend fièrement les couleurs de son équipe.",
  "Comme tous les jeunes joueurs de la série, il met un point d'honneur à se dépasser match après match, porté par l'amour du jeu et l'envie de gagner.",
 ],
 ot10: [
  "Danny Mellow est l'un des coéquipiers sur lesquels Olivier peut compter. Joueur sérieux et appliqué, il apporte sa pierre à l'édifice collectif.",
  "Toujours prêt à se battre pour l'équipe, il incarne l'esprit de solidarité qui anime les héros de la série tout au long de leurs rencontres.",
 ],
 ot11: [
  "Clifford Hume est un défenseur solide de l'univers d'Olive & Tom, qui veille à protéger ses buts avec rigueur. Robuste dans les duels, il s'oppose aux attaquants adverses.",
  "Sa combativité et son sens du placement en font un rempart fiable pour son équipe lors des grandes confrontations.",
 ],
 ot12: [
  "Sandy Winter est un joueur dynamique qui apporte de l'énergie et de la vitesse à son équipe. Endurant, il multiplie les courses pour soutenir l'attaque comme la défense.",
  "Au sein de la série, il fait partie de ces footballeurs déterminés qui se donnent à fond pour atteindre la victoire.",
 ],
 ot13: [
  "Ralph Peterson est un footballeur de l'univers d'Olive & Tom, engagé et travailleur. Sur le terrain, il met sa volonté au service du collectif.",
  "Comme ses camarades, il rêve de progresser et de remporter de grands tournois, dans la pure tradition sportive de la série.",
 ],
 ot14: [
  "Karl Heinz Schneider est l'un des plus grands attaquants de la série, un buteur d'origine allemande au tir d'une puissance phénoménale. On le surnomme parfois l'« empereur » du terrain.",
  "Star incontestée de son équipe nationale, il représente l'un des adversaires les plus redoutables qu'Olivier ait affrontés sur la scène internationale. Sa rivalité avec le héros est l'une des plus marquantes.",
 ],
 ot15: [
  "Deuter Muller est un défenseur allemand de grande qualité, partenaire de Karl Heinz Schneider. Solide, intelligent et déterminé, il verrouille l'arrière de son équipe.",
  "Rigoureux dans les duels, il sait aussi se projeter vers l'avant pour soutenir les attaques. Deuter est l'un des piliers de l'une des meilleures équipes de la série.",
 ],
 ot16: [
  "Elcide Pierre est un footballeur français élégant, à la technique fine et au jeu intelligent. Il défend les couleurs de son pays sur la scène internationale.",
  "Sa classe balle au pied et son sens du jeu en font un joueur respecté. Pierre incarne le style raffiné du football français dans l'univers de la série.",
 ],
 ot17: [
  "Louis Napoleon est un joueur français de l'univers d'Olive & Tom, déterminé à briller aux côtés de ses compatriotes. Volontaire et appliqué, il se bat sur chaque ballon.",
  "Aux grands tournois internationaux, il défend fièrement son équipe et cherche à se mesurer aux meilleurs, dont Olivier.",
 ],
 ot18: [
  "Zino Hernandez est un footballeur talentueux que l'on rencontre dans les compétitions internationales de la série. Habile et combatif, il représente une nation rivale sur le terrain.",
  "Son adresse et sa détermination en font un adversaire à ne pas sous-estimer pour Olivier et ses coéquipiers.",
 ],
 ot19: [
  "Salvatore Gentile est un joueur italien réputé pour sa rigueur et son intelligence tactique. Fidèle à la tradition défensive de son pays, il excelle dans l'art de neutraliser les attaquants.",
  "Discipliné et tenace, il offre une résistance farouche aux meilleurs buteurs. Salvatore incarne le football italien dans l'univers de la série.",
 ],
 ot20: [
  "Natureza est un attaquant brésilien d'un talent prodigieux, considéré comme l'un des plus grands espoirs du football mondial dans la série. Son jeu allie technique, créativité et puissance.",
  "Vif et imprévisible, il enchaîne les gestes spectaculaires balle au pied. Natureza représente la magie du football brésilien et un défi de taille pour Olivier.",
 ],
 ot21: [
  "Juan Diaz est un attaquant argentin redoutable, rapide et opportuniste devant le but. Sûr de ses qualités, il porte haut les couleurs de son équipe nationale.",
  "Sa rivalité avec les grands attaquants de la série donne lieu à des affrontements intenses. Juan est l'un des adversaires marquants des compétitions internationales.",
 ],
 ot22: [
  "Patty est une fervente supportrice et une amie proche d'Olivier, toujours présente pour encourager l'équipe. Son soutien indéfectible compte autant que les exploits sur le terrain.",
  "Attentive et bienveillante, elle suit avec passion le parcours des héros. Patty incarne le rôle essentiel de ceux qui, en dehors du jeu, portent les joueurs vers la victoire.",
 ],
 ot23: [
  "Roberto Sedinho est un ancien grand footballeur brésilien devenu le mentor d'Olivier. C'est lui qui transmet au jeune héros les secrets du jeu et l'amour du beau football.",
  "Bienveillant et expérimenté, il croit en Olivier et l'aide à révéler tout son potentiel. Roberto joue un rôle décisif dans la formation du héros.",
 ],
});
// ─── LOT : Harry Potter ───
Object.assign(FIG_PAGES, {
 hp01: [
  "Harry Potter est un jeune sorcier célèbre dans tout le monde magique pour avoir survivé, bébé, à l'attaque d'un puissant mage noir, ce qui lui a laissé une cicatrice en forme d'éclair sur le front.",
  "Élevé sans rien savoir de ses origines, il découvre à onze ans qu'il est sorcier et entre dans une grande école de magie. Courageux, loyal et obstiné, Harry y vit d'extraordinaires aventures aux côtés de ses amis.",
 ],
 hp02: [
  "Hermione Granger est une sorcière d'une intelligence remarquable, première de sa classe et passionnée de lecture. Issue d'une famille non magique, elle compense par un travail acharné.",
  "Toujours prête à aider ses amis, elle résout d'innombrables énigmes grâce à son savoir. Brillante, courageuse et fidèle, Hermione est l'une des meilleures amies de Harry.",
 ],
 hp03: [
  "Ron Weasley est le meilleur ami de Harry, issu d'une grande famille de sorciers au cœur d'or mais aux moyens modestes. Drôle et chaleureux, il est d'une loyauté à toute épreuve.",
  "Malgré ses doutes et sa tendance à se sous-estimer, il fait preuve d'un vrai courage dans les moments décisifs. Ron est aussi un redoutable joueur d'échecs version sorciers.",
 ],
 hp04: [
  "Albus Dumbledore est le directeur de la grande école de magie, considéré comme l'un des sorciers les plus puissants et les plus sages de son temps. Sa longue barbe blanche et son regard bienveillant sont célèbres.",
  "Protecteur de Harry, il guide les jeunes sorciers avec calme et profondeur. Derrière sa douceur se cache une volonté inflexible de défendre le bien.",
 ],
 hp05: [
  "Voldemort est le plus redouté des mages noirs, un sorcier qui a sacrifié son humanité dans sa quête d'immortalité et de pouvoir absolu. Son visage pâle, dépourvu de nez, inspire la terreur.",
  "Beaucoup craignent même de prononcer son nom. Cruel et impitoyable, il est l'ennemi juré de Harry, lié à lui par un destin tragique remontant à l'enfance du héros.",
 ],
 hp06: [
  "Severus Rogue est un professeur sévère et énigmatique, maître dans l'art des potions. Froid et cassant, il semble nourrir une antipathie tenace envers Harry.",
  "Mais ses véritables intentions restent longtemps mystérieuses, oscillant entre menace et protection. Rogue est l'un des personnages les plus complexes et les plus ambigus de l'histoire.",
 ],
 hp07: [
  "Rubeus Hagrid est le garde-chasse de l'école de magie, un demi-géant au cœur immense. Sa taille impressionnante contraste avec sa grande douceur.",
  "Passionné par les créatures magiques, même les plus dangereuses, il les défend avec tendresse. Ami fidèle de Harry, Hagrid est l'un des premiers à lui ouvrir les portes du monde des sorciers.",
 ],
 hp08: [
  "Drago Malefoy est un élève issu d'une riche famille de sorciers, arrogant et méprisant. Rival déclaré de Harry, il appartient à la maison réputée pour son ambition.",
  "Hautain et provocateur, il cherche sans cesse à humilier le héros et ses amis. Derrière sa morgue se devine pourtant un jeune homme tiraillé par les choix de sa famille.",
 ],
 hp09: [
  "Sirius Black est le parrain de Harry, un sorcier injustement emprisonné pour un crime qu'il n'avait pas commis. Après son évasion, il devient un allié précieux du héros.",
  "Doté d'un pouvoir rare, il peut se transformer à volonté en un grand chien noir. Courageux et profondément attaché à Harry, Sirius représente pour lui la figure d'une famille retrouvée.",
 ],
 hp10: [
  "Dobby est un elfe de maison, petite créature dévouée au service des sorciers. Contrairement à beaucoup des siens, il rêve de liberté et n'hésite pas à désobéir pour protéger Harry.",
  "Maladroit mais d'une fidélité touchante, il se met souvent en danger pour aider le héros. Dobby est l'un des personnages les plus émouvants de l'histoire.",
 ],
 hp11: [
  "Luna Lovegood est une jeune sorcière rêveuse et excentrique, au regard décalé sur le monde. Souvent moquée pour son étrangeté, elle assume sans complexe sa différence.",
  "Derrière ses idées farfelues se cachent une grande sagesse et une vraie gentillesse. Loyale et courageuse, Luna devient une amie précieuse et originale de Harry.",
 ],
 hp12: [
  "Bellatrix Lestrange est une sorcière redoutable, fanatiquement dévouée au mage noir Voldemort. Cruelle et imprévisible, elle prend un plaisir glaçant à semer le chaos.",
  "Maîtresse de la magie noire, elle compte parmi les ennemies les plus dangereuses du héros et de ses amis. Bellatrix incarne la folie au service des ténèbres.",
 ],
});
// ─── LOT : Ninjago ───
Object.assign(FIG_PAGES, {
 nj01: [
  "Lloyd est le Ninja Vert, le héros central de Ninjago. Désigné par une ancienne prophétie comme l'élu appelé à affronter les plus grandes menaces, il porte sur ses épaules un destin hors du commun.",
  "Fils d'un puissant seigneur du mal qu'il devra parfois combattre, Lloyd grandit en maîtrisant une énergie verte unique. Courageux et déterminé, il devient le chef de l'équipe des ninjas et un symbole d'espoir.",
 ],
 nj02: [
  "Kai est le ninja du Feu, fougueux et impétueux comme l'élément qu'il maîtrise. Ancien forgeron, il rejoint l'équipe pour protéger les siens et notamment sa sœur Nya.",
  "Vif et téméraire, il fonce parfois tête baissée mais ne manque jamais de courage. Le feu qu'il commande en fait un combattant ardent et redoutable au sein des ninjas.",
 ],
 nj03: [
  "Zane est le ninja de la Glace, mais il cache un secret : c'est en réalité un être mécanique, un Nindroid doté d'une intelligence et d'un cœur. Logique et calme, il analyse chaque situation.",
  "Sa maîtrise du froid et sa résistance en font un allié précieux. Derrière sa nature de machine, Zane développe de vraies émotions et un sens de l'amitié profond qui touchent toute l'équipe.",
 ],
 nj04: [
  "Cole est le ninja de la Terre, le plus solide et le plus posé du groupe. Sa force physique et son sens des responsabilités en font un pilier de l'équipe.",
  "Maître de l'élément Terre, il peut faire trembler le sol et soulever d'énormes charges. Fiable et déterminé, Cole est aussi connu pour sa gourmandise, en particulier pour le gâteau.",
 ],
 nj05: [
  "Jay est le ninja de la Foudre, blagueur et inventif. Toujours prêt à plaisanter, il détend l'atmosphère même dans les moments les plus tendus.",
  "Rapide comme l'éclair, il manie l'électricité avec une énergie débordante. Bricoleur de génie, Jay imagine toutes sortes de gadgets, et son cœur bat pour Nya.",
 ],
 nj06: [
  "Nya est la maîtresse de l'Eau, sœur de Kai et combattante accomplie. Longtemps guerrière sans pouvoir élémentaire, sous le nom de Samouraï, elle révèle ensuite sa maîtrise de l'élément aquatique.",
  "Habile, intelligente et indépendante, elle n'a rien à envier aux autres ninjas. Nya prouve qu'elle a toute sa place parmi les héros, par son courage autant que par ses talents.",
 ],
 nj07: [
  "Maître Wu est le sage qui a formé les ninjas et les guide dans leur quête. Vieux maître à la longue barbe blanche, il enseigne autant la sagesse que les arts martiaux.",
  "Frère d'un puissant seigneur du mal, il veille à maintenir l'équilibre du monde de Ninjago. Patient et profond, Wu transmet à ses élèves les valeurs de courage, de discipline et d'unité.",
 ],
 nj08: [
  "Le Seigneur Garmadon est longtemps le grand adversaire des ninjas. Frère de Maître Wu et père de Lloyd, il a été corrompu par une force maléfique qui a empoisonné son cœur.",
  "Avide de pouvoir, il cherche à dominer Ninjago. Mais son histoire est aussi celle d'une rédemption possible : le lien avec son fils Lloyd finira par rappeler à la lumière une part de lui-même.",
 ],
 nj09: [
  "Garmadon Quatre Bras est la forme la plus puissante du seigneur du mal, dotée de quatre bras qui décuplent sa force au combat. Sous cette apparence, il devient un adversaire particulièrement redoutable.",
  "Capable de manier plusieurs armes à la fois, il met les ninjas à rude épreuve. Cette version de Garmadon incarne le sommet de sa puissance maléfique.",
 ],
 nj10: [
  "Pythor est un rusé chef d'un peuple de serpents, ennemi récurrent des ninjas. À la longue silhouette violette, il avance par la ruse et la manipulation plutôt que par la force brute.",
  "Malin et opportuniste, il échafaude des plans pour réveiller d'anciennes menaces. Pythor compte parmi les adversaires les plus retors que les ninjas aient affrontés.",
 ],
 nj11: [
  "Morro est le maître du Vent, ancien élève de Maître Wu devenu un esprit vengeur. Persuadé d'avoir été le véritable Ninja Vert, il en veut au destin qui l'a écarté.",
  "Sous forme de fantôme, il commande les bourrasques et cherche à se venger. Morro est un adversaire tragique, rongé par l'amertume d'un rêve brisé.",
 ],
 nj12: [
  "Skylor possède un pouvoir rare : l'Ambre, qui lui permet d'absorber et de reproduire les capacités des autres maîtres élémentaires. Cela en fait une combattante imprévisible.",
  "Fille d'un dangereux adversaire, elle choisit pourtant sa propre voie et se lie d'amitié avec les ninjas, en particulier avec Kai. Skylor est une alliée aussi précieuse que surprenante.",
 ],
 nj13: [
  "Ronin est un mercenaire et un voleur habile, prêt à travailler pour qui le paie le mieux. Opportuniste, il navigue entre les camps au gré de ses intérêts.",
  "Fin combattant et débrouillard, il dispose de nombreux gadgets. Malgré son côté intéressé, Ronin se range parfois du côté des ninjas, ce qui en fait un personnage ambigu et imprévisible.",
 ],
});
// ─── LOT : Dragons ───
Object.assign(FIG_PAGES, {
 dr01: [
  "Harold est un jeune Viking malingre mais ingénieux, qui préfère réfléchir et inventer plutôt que combattre par la force. Dans un village où l'on chasse les dragons, il choisit une autre voie.",
  "En se liant d'amitié avec un dragon redouté, il change le regard de tout son peuple sur ces créatures. Courageux et bon, Harold devient un meneur respecté et un trait d'union entre les Vikings et les dragons.",
 ],
 dr02: [
  "Krokmou est un dragon rare et puissant, au corps noir et aux grands yeux expressifs. Blessé à la queue, il ne peut plus voler seul : c'est l'ingéniosité de Harold qui lui rend les airs grâce à une prothèse.",
  "Entre eux naît une amitié inséparable, faite de confiance et de complicité. Capable de tirs d'énergie dévastateurs, Krokmou est aussi joueur et affectueux qu'un grand chat.",
 ],
 dr03: [
  "Astrid est une jeune Viking déterminée et redoutable au combat, parmi les plus douées de son âge. Courageuse et exigeante, elle ne recule devant aucun défi.",
  "Aux côtés de Harold, elle apprend à monter les dragons et chevauche fidèlement sa Tempête. Forte et loyale, Astrid est une combattante d'exception et une alliée précieuse.",
 ],
 dr04: [
  "Stoïck est le chef du village viking et le père de Harold. Colosse à la force impressionnante, il incarne d'abord la tradition guerrière qui voit les dragons comme des ennemis.",
  "Fier et inquiet pour son fils si différent de lui, il finit par comprendre et soutenir sa vision. Stoïck est un chef respecté, au cœur plus tendre que ne le laisse paraître sa carrure.",
 ],
 dr05: [
  "Rustik est un jeune Viking vantard et sûr de lui, toujours prompt à se mettre en avant. Sous ses fanfaronnades se cache un combattant qui veut prouver sa valeur.",
  "Il chevauche un dragon au caractère bien trempé, le bouillant Crochefer. Malgré son arrogance, Rustik finit par jouer son rôle au sein de la bande des dragonniers.",
 ],
 dr06: [
  "Kognedur est l'une des jumelles turbulentes du groupe, inséparable de son frère Kranedur. Farceuse et casse-cou, elle adore le chaos et les bagarres.",
  "Avec son frère, elle partage la garde d'un dragon à deux têtes, ce qui donne lieu à des disputes aussi comiques que spectaculaires. Kognedur apporte fantaisie et désordre à l'équipe.",
 ],
 dr07: [
  "Kranedur est le frère jumeau de Kognedur, aussi turbulent et farceur qu'elle. Les deux passent leur temps à se chamailler, pour le plus grand amusement de tous.",
  "Ensemble, ils dirigent tant bien que mal leur dragon à deux têtes, chacun commandant une tête. Maladroit mais attachant, Kranedur ne manque jamais une occasion de faire des bêtises.",
 ],
 dr08: [
  "Gueulfor est le forgeron du village et le vieil ami de Stoïck. Ayant perdu une main et une jambe lors d'anciens combats, il les remplace par divers outils astucieux.",
  "Bon vivant et plein d'humour, il forme les jeunes Vikings et fabrique armes et prothèses. Gueulfor est un mentor chaleureux, à la fois bricoleur et conteur des légendes du village.",
 ],
 dr09: [
  "Varek est un jeune Viking doux et un peu froussard, mais véritable encyclopédie vivante sur les dragons. Il connaît leurs espèces, leurs forces et leurs faiblesses sur le bout des doigts.",
  "Son savoir rend de grands services à l'équipe. Il chevauche un dragon placide et affectueux, Bouledogre. Gentil et fidèle, Varek prouve que la connaissance vaut autant que la bravoure.",
 ],
 dr10: [
  "Tempête est le dragon d'Astrid, une créature élégante et rapide hérissée de pointes. Vive et fière, elle file dans les airs avec agilité.",
  "Elle peut projeter les piquants acérés de sa queue comme autant de projectiles. Loyale envers Astrid, Tempête forme avec elle un duo aussi gracieux qu'efficace.",
 ],
 dr11: [
  "Bouledogre est le dragon de Varek, un compagnon trapu et pataud au grand cœur. Plus lent que les autres, il compense par sa robustesse et sa tendresse.",
  "Il crache des boulets de lave brûlante et adore les câlins de son dresseur. Affectueux et placide, Bouledogre est l'un des dragons les plus attachants de la bande.",
 ],
 dr12: [
  "Pète et Prout est un dragon singulier à deux têtes, confié aux jumeaux turbulents. L'une des têtes répand un gaz inflammable, l'autre produit l'étincelle qui l'enflamme.",
  "Pour fonctionner, les deux têtes doivent coopérer, à l'image des jumeaux qui les commandent. Ce dragon comique et explosif est aussi imprévisible que ses deux dresseurs.",
 ],
 dr13: [
  "Crochefer est le dragon de Rustik, une créature fière et au tempérament de feu. Capable d'embraser son propre corps, il devient une véritable torche vivante au combat.",
  "Têtu et indépendant, il n'obéit qu'à contrecœur, ce qui donne lieu à de nombreuses prises de bec avec son cavalier. Sous ses airs rebelles, Crochefer reste un allié redoutable.",
 ],
});
// ─── LOT : Goldorak ───
Object.assign(FIG_PAGES, {
 gd01: [
  "Actarus est le héros de Goldorak, un prince venu de la planète Euphor, détruite par un empire conquérant. Réfugié sur Terre, il y mène une vie discrète dans un ranch, sous une fausse identité.",
  "Lorsque la menace surgit, il pilote le puissant robot Goldorak pour défendre sa terre d'accueil. Noble et courageux, Actarus porte en lui la douleur de son monde perdu et la volonté de protéger le nôtre.",
 ],
 gd02: [
  "Alcor est un jeune pilote intrépide et fidèle ami d'Actarus. Au tempérament bouillant, il fonce souvent au combat à bord de sa soucoupe sans craindre le danger.",
  "Toujours prêt à prêter main-forte, il appuie Goldorak dans ses batailles contre les envahisseurs. Loyal et énergique, Alcor est un compagnon d'armes indispensable.",
 ],
 gd03: [
  "Vénusia est une jeune femme courageuse, fille du propriétaire du ranch qui a recueilli Actarus. Attachée à lui, elle s'inquiète pour ce héros mystérieux dont elle ignore d'abord le secret.",
  "Pleine de cœur et de bravoure, elle n'hésite pas à se rendre utile face au danger. Vénusia incarne l'attachement à la Terre et aux êtres que les héros défendent.",
 ],
 gd04: [
  "Phénicia est la sœur d'Actarus, elle aussi rescapée de la planète Euphor. Longtemps séparée de lui, elle le retrouve pour combattre à ses côtés.",
  "Guerrière déterminée, elle partage le devoir de protéger la Terre contre l'envahisseur. Phénicia apporte à Actarus le réconfort d'un lien familial retrouvé et le renfort d'une alliée vaillante.",
 ],
 gd05: [
  "Le Grand Stratéguerre est le maître tyrannique de l'empire ennemi, responsable de la destruction d'Euphor. Depuis son trône, il ordonne l'invasion de la Terre.",
  "Impitoyable et avide de conquête, il envoie sans relâche ses redoutables engins de guerre contre Goldorak. Le Grand Stratéguerre incarne la menace implacable qui pèse sur le monde.",
 ],
 gd06: [
  "Minas est l'un des commandants au service de l'empire ennemi, chargé de mener l'assaut contre la Terre. Orgueilleux et cruel, il rivalise avec les autres généraux pour s'attirer les faveurs de son maître.",
  "Il lance contre Goldorak des monstres mécaniques toujours plus dangereux. Minas fait partie des adversaires acharnés qu'Actarus doit affronter bataille après bataille.",
 ],
 gd07: [
  "Hydargos est un général de l'empire envahisseur, redouté pour sa férocité. À la tête des forces ennemies, il conçoit des plans pour détruire Goldorak et soumettre la Terre.",
  "Impitoyable, il n'hésite devant aucune ruse ni aucune cruauté pour parvenir à ses fins. Hydargos est l'un des chefs de guerre les plus menaçants de la série.",
 ],
 gd08: [
  "Horos est un autre commandant au service du tyran, lui aussi lancé à la conquête de la Terre. Stratège ambitieux, il dirige les attaques contre les défenseurs de notre planète.",
  "Il déploie d'effrayantes machines de guerre pour tenter de venir à bout de Goldorak. Horos incarne la pression constante que l'empire fait peser sur Actarus et ses alliés.",
 ],
 gd09: [
  "Rigel est le bon propriétaire du ranch qui a accueilli Actarus et lui a offert un refuge sur Terre. Chaleureux et bourru, il dirige son domaine avec énergie.",
  "Père de Vénusia, il ignore longtemps la véritable nature de son employé devenu héros. Rigel représente l'humanité simple et généreuse que Goldorak protège.",
 ],
 gd10: [
  "Goldorak est le gigantesque robot piloté par Actarus, fleuron technologique de la planète Euphor. Doté d'une armure puissante et d'un arsenal impressionnant, il est le rempart de la Terre.",
  "Ses armes spectaculaires lui permettent d'affronter les monstres mécaniques de l'empire ennemi. Symbole de courage et de résistance, Goldorak est l'un des robots géants les plus célèbres de l'histoire de l'animation.",
 ],
 gd11: [
  "Pour rejoindre le combat, Goldorak s'unit à une soucoupe volante qui décuple sa mobilité dans les airs comme dans l'espace. Ensemble, ils forment un ensemble redoutable.",
  "Cette combinaison permet au robot de surgir là où on l'attend le moins et de surprendre l'ennemi. La soucoupe est le fidèle vaisseau qui porte Goldorak au cœur de la bataille.",
 ],
});
// ─── LOT : Les Mystérieuses Cités d'Or ───
Object.assign(FIG_PAGES, {
 mc01: [
  "Esteban est un jeune garçon élevé dans un monastère, surnommé l'« enfant du soleil » car la légende dit qu'il peut faire apparaître l'astre du jour. Il porte un mystérieux médaillon d'or, seul indice de ses origines.",
  "Parti à la recherche de son père et des fabuleuses Cités d'Or, il traverse l'océan jusqu'au Nouveau Monde. Courageux et généreux, Esteban est le cœur de cette grande aventure de découverte.",
 ],
 mc02: [
  "Zia est une jeune fille d'origine inca, élevée loin de son peuple, qui possède elle aussi un médaillon d'or semblable à celui d'Esteban. Douce et déterminée, elle connaît des secrets sur les anciennes civilisations.",
  "Son médaillon est l'une des clés permettant d'ouvrir le chemin des Cités d'Or. Aux côtés d'Esteban et de Tao, Zia partage les dangers et les merveilles du voyage.",
 ],
 mc03: [
  "Tao est le dernier descendant d'une civilisation disparue, engloutie sous les flots. Petit savant accompagné de son perroquet, il détient un précieux savoir scientifique hérité de son peuple.",
  "Malin et débrouillard, il aide ses amis à résoudre les énigmes du voyage grâce à ses inventions et à ses connaissances anciennes. Tao apporte au trio l'intelligence et la mémoire des temps oubliés.",
 ],
 mc04: [
  "Mendoza est un navigateur espagnol rusé et ambitieux, attiré par l'or des Cités légendaires. Aventurier sans scrupules apparents, il accompagne les enfants en pensant d'abord à son propre intérêt.",
  "Mais au fil du périple, un véritable attachement le lie à Esteban et à ses compagnons. Mendoza est un personnage ambigu, à la fois opportuniste et protecteur.",
 ],
 mc05: [
  "Pedro est l'un des deux marins qui accompagnent Mendoza dans ses aventures. Peureux et un brin profiteur, il rêve surtout de richesse et de tranquillité.",
  "Avec son compère Sancho, il forme un duo comique dont les maladresses détendent les moments les plus tendus. Pedro apporte une touche d'humour au long voyage.",
 ],
 mc06: [
  "Sancho est le second marin du tandem au service de Mendoza, inséparable de Pedro. Gourmand et fanfaron, il se retrouve souvent embarqué dans des situations cocasses.",
  "Lui aussi attiré par l'or, il n'est pas le plus courageux, mais reste fidèle au groupe. Sancho et Pedro sont les trublions sympathiques de l'expédition.",
 ],
 mc07: [
  "Pichu est un jeune garçon rencontré au cours du voyage, qui se joint aux héros dans leur quête. Vif et plein d'entrain, il apporte sa connaissance du pays et de ses dangers.",
  "Courageux malgré son jeune âge, il devient un compagnon précieux pour Esteban, Zia et Tao. Pichu illustre les amitiés nouées tout au long de la grande aventure.",
 ],
 mc08: [
  "Gaspard est un soldat lancé aux trousses des enfants, au service de ceux qui convoitent l'or des Cités. Rude et tenace, il représente la menace qui plane sur le voyage des héros.",
  "Déterminé à accomplir sa mission, il poursuit le trio à travers les terres du Nouveau Monde. Gaspard fait partie des adversaires que les enfants doivent sans cesse déjouer.",
 ],
 mc09: [
  "Laguerra est une adversaire redoutable, prête à tout pour mettre la main sur les trésors des Cités d'Or. Habile et impitoyable, elle suit la trace des enfants et de leurs médaillons.",
  "Son ambition et sa ruse en font une ennemie dangereuse pour Esteban et ses compagnons. Laguerra incarne la cupidité qui menace la quête des héros.",
 ],
 mc10: [
  "Ambrosius est un personnage inquiétant et calculateur, attiré par les secrets et les richesses des anciennes civilisations. Manœuvrier de l'ombre, il complote pour s'emparer du pouvoir des Cités.",
  "Sa soif de connaissance et d'or le rend particulièrement dangereux. Ambrosius compte parmi les figures menaçantes qui se dressent sur la route des enfants.",
 ],
 mc11: [
  "Zarès est un adversaire au service des ennemis des héros, chargé de les traquer et de contrecarrer leur quête. Déterminé et sans pitié, il met les enfants à rude épreuve.",
  "Rouage des complots qui visent les Cités d'Or, il représente un obstacle de plus sur leur long chemin. Zarès illustre les périls qui jalonnent cette aventure légendaire.",
 ],
});
// ─── LOT : Les Trois Mousquetaires ───
Object.assign(FIG_PAGES, {
 tm01: [
  "D'Artagnan est un jeune Gascon fougueux qui monte à Paris avec le rêve de devenir mousquetaire du roi. Brave, fier et redoutable à l'épée, il se fait vite remarquer par son audace.",
  "Il se lie d'amitié avec trois mousquetaires aguerris et partage leurs aventures au service du roi. Loyal et téméraire, D'Artagnan incarne le courage et l'esprit chevaleresque.",
 ],
 tm02: [
  "Athos est le plus noble et le plus mystérieux des trois mousquetaires. Distingué et mélancolique, il cache un passé douloureux derrière son allure digne et réservée.",
  "Fin bretteur et homme d'honneur, il guide souvent ses compagnons par sa sagesse. Athos est l'âme grave et respectée du célèbre trio.",
 ],
 tm03: [
  "Porthos est un mousquetaire colossal, fort comme un bœuf et amateur de bonne chère, de beaux habits et de belles paroles. Vantard mais généreux, il aime se mettre en avant.",
  "Sa force et son entrain en font un compagnon précieux dans les bagarres. Jovial et haut en couleur, Porthos apporte sa truculence au groupe des mousquetaires.",
 ],
 tm04: [
  "Aramis est le plus raffiné et le plus subtil des mousquetaires. Élégant et galant, il hésite entre la carrière des armes et la vocation religieuse.",
  "Habile à l'épée comme en diplomatie, il manie aussi bien la lame que les belles manières. Aramis ajoute finesse et mystère au quatuor de héros.",
 ],
 tm05: [
  "Le Cardinal de Richelieu est le puissant ministre du roi, fin stratège et maître de l'intrigue. Habile politique, il tisse sa toile pour servir, à sa manière, les intérêts du royaume.",
  "Souvent opposé aux mousquetaires, il dispose de ses propres gardes et d'agents secrets. Calculateur redoutable, Richelieu est l'adversaire le plus rusé de D'Artagnan et de ses amis.",
 ],
 tm06: [
  "Milady est une espionne aussi belle que dangereuse, au service des intérêts du Cardinal. Manipulatrice hors pair, elle use de son charme et de sa ruse pour parvenir à ses fins.",
  "Insaisissable et impitoyable, elle se révèle l'une des adversaires les plus marquantes de l'histoire. Milady incarne la séduction au service du complot.",
 ],
 tm07: [
  "Constance est une jeune femme de confiance au service de la reine, douce et courageuse. Elle joue un rôle clé dans les intrigues de la cour.",
  "Éprise de D'Artagnan, elle l'aide dans ses missions au péril de sa propre sécurité. Constance incarne la fidélité et le dévouement au cœur des aventures des mousquetaires.",
 ],
 tm08: [
  "Rochefort est un agent au service du Cardinal, ennemi déclaré de D'Artagnan dès leur première rencontre. Froid et déterminé, il exécute les missions les plus délicates.",
  "Redoutable bretteur, il croise le fer à plusieurs reprises avec le jeune Gascon. Rochefort est l'un des adversaires récurrents qui pimentent les aventures des héros.",
 ],
 tm09: [
  "Le roi Louis XIII règne sur la France à l'époque des mousquetaires. Soucieux de son autorité, il s'appuie sur ses fidèles soldats tout en composant avec son puissant ministre.",
  "Les mousquetaires servent fièrement sa couronne et défendent son honneur. Le roi est la figure autour de laquelle se nouent les loyautés et les intrigues du récit.",
 ],
 tm10: [
  "Jussac est l'un des gardes du Cardinal, fine lame au service du ministre. Adversaire des mousquetaires, il se mesure à eux dans plusieurs affrontements à l'épée.",
  "Habile et combatif, il représente l'opposition entre les hommes du roi et ceux du Cardinal. Jussac est un duelliste de valeur que D'Artagnan et ses amis doivent affronter.",
 ],
});
// ─── LOT : Astérix ───
Object.assign(FIG_PAGES, {
 ax01: [
  "Astérix est un petit guerrier gaulois rusé et intrépide, le héros d'un village qui résiste encore et toujours à l'envahisseur romain. Sa malice est sa plus grande arme.",
  "Grâce à une potion magique préparée par le druide, il obtient une force surhumaine le temps de quelques bagarres mémorables. Astérix, futé et courageux, mène la résistance de son village avec panache.",
 ],
 ax02: [
  "Obélix est le meilleur ami d'Astérix, un colosse au grand cœur qui livre des menhirs pour gagner sa vie. Tombé dans la marmite de potion magique lorsqu'il était bébé, il possède une force prodigieuse en permanence.",
  "Gourmand et susceptible — surtout si on le traite de gros —, il raffole des sangliers rôtis. Naïf mais d'une fidélité sans faille, Obélix accompagne Astérix dans toutes ses aventures.",
 ],
 ax03: [
  "Idéfix est le petit chien d'Obélix, fidèle compagnon au flair infaillible. Minuscule mais courageux, il suit son maître partout.",
  "Très attaché à la nature, il ne supporte pas de voir un arbre abattu et le fait savoir bruyamment. Idéfix est la mascotte attendrissante des aventures gauloises.",
 ],
 ax04: [
  "Panoramix est le druide du village, vénérable sage à la longue barbe blanche. Il détient le secret de la fameuse potion magique qui donne une force surhumaine.",
  "Cueilleur de gui et gardien des traditions, il veille sur les siens grâce à son savoir. Panoramix est le pilier discret mais essentiel de la résistance gauloise.",
 ],
 ax05: [
  "Assurancetourix est le barde du village, persuadé d'avoir un immense talent de chanteur. Hélas, sa voix est si épouvantable que tous redoutent ses prestations.",
  "À chaque banquet, on l'attache et on le bâillonne pour qu'il se taise, ce qui ne le décourage jamais. Assurancetourix apporte une bonne dose de comique au village.",
 ],
 ax06: [
  "Jules César est le puissant chef des armées romaines, ambitieux et sûr de lui. Maître d'un immense empire, il enrage de ne pouvoir soumettre un seul petit village gaulois.",
  "Fin politique et grand stratège, il est pourtant régulièrement déjoué par la ruse d'Astérix. Jules César est l'adversaire récurrent et grandiose des irréductibles Gaulois.",
 ],
 ax07: [
  "Le légionnaire romain est le soldat de base de l'immense armée de César, casque sur la tête et bouclier au bras. Discipliné mais souvent peu motivé, il redoute par-dessus tout les Gaulois.",
  "Envoyé contre le village rebelle, il finit presque toujours par voler dans les airs après un bon coup de poing dopé à la potion magique. Le légionnaire est la victime comique récurrente des aventures.",
 ],
 ax08: [
  "Abraracourcix est le chef du village gaulois, fier et autoritaire. Toujours porté sur un bouclier par deux solides porteurs, il commande ses guerriers avec assurance.",
  "Courageux mais un peu soupe au lait, il ne craint qu'une chose : que le ciel lui tombe sur la tête. Abraracourcix incarne avec fierté l'esprit indomptable de son village.",
 ],
 ax09: [
  "Barbe-Rouge est le capitaine d'un équipage de pirates qui croise régulièrement la route d'Astérix et Obélix. À chaque rencontre, son navire connaît un sort funeste.",
  "Malgré sa malchance légendaire, il reprend la mer encore et encore. Barbe-Rouge et ses pirates sont l'une des grandes sources de gags des aventures gauloises.",
 ],
});
// ─── LOT : Tintin ───
Object.assign(FIG_PAGES, {
 tn01: [
  "Tintin est un jeune reporter au courage et à la curiosité sans limites. Toujours accompagné de son fidèle chien, il parcourt le monde pour résoudre des mystères et défendre la justice.",
  "Débrouillard, honnête et plein de sang-froid, il se sort des situations les plus périlleuses par son intelligence. Tintin est l'un des héros d'aventure les plus célèbres de la bande dessinée.",
 ],
 tn02: [
  "Le Capitaine Haddock est un vieux loup de mer au caractère bien trempé, devenu l'ami le plus fidèle de Tintin. Bourru et soupe au lait, il est célèbre pour ses colères et ses jurons hauts en couleur.",
  "Sous ses grognements se cache un cœur d'or et un courage à toute épreuve. Le capitaine accompagne Tintin dans ses aventures, pour le meilleur et pour le pire.",
 ],
 tn03: [
  "Milou est le petit chien blanc de Tintin, intelligent et courageux. Fidèle entre tous, il suit son maître partout et lui sauve souvent la mise.",
  "Vif et débrouillard, il a son petit caractère et n'hésite pas à donner son avis. Milou est le compagnon inséparable et attendrissant du jeune reporter.",
 ],
 tn04: [
  "Le Professeur Tournesol est un savant génial mais très dur d'oreille, ce qui provoque d'innombrables quiproquos. Distrait et obstiné, il invente des machines extraordinaires.",
  "Derrière ses airs lunaires se cache un esprit brillant dont les inventions jouent un grand rôle dans les aventures. Tournesol apporte science et comique au groupe des héros.",
 ],
 tn05: [
  "Dupond et Dupont sont deux détectives presque identiques, reconnaissables à leur chapeau melon et à leur canne. Maladroits et un peu balourds, ils enchaînent les gaffes avec un sérieux imperturbable.",
  "Persuadés de leur efficacité, ils se trompent pourtant à tout bout de champ. Ce duo comique apporte de nombreux fous rires aux aventures de Tintin.",
 ],
 tn06: [
  "La Castafiore est une célèbre cantatrice à la voix puissante et au tempérament exubérant. Sa présence tonitruante et ses vocalises mettent à rude épreuve les oreilles du Capitaine Haddock.",
  "Charmante mais envahissante, elle confond sans cesse le nom du capitaine. La Castafiore est l'une des figures les plus pittoresques et drôles de la série.",
 ],
 tn07: [
  "Rastapopoulos est l'un des ennemis les plus retors de Tintin, un homme d'affaires véreux à la tête de sombres trafics. Manipulateur et sans scrupules, il complote dans l'ombre.",
  "Il revient à plusieurs reprises pour contrarier les plans du jeune reporter. Rastapopoulos est le grand adversaire récurrent des aventures de Tintin.",
 ],
 tn08: [
  "Boris Jorgen est un personnage menaçant et déterminé, mêlé à de dangereux complots qui croisent la route de Tintin. Froid et résolu, il sert des intérêts hostiles.",
  "Adversaire coriace, il met le reporter et ses amis en difficulté. Boris Jorgen fait partie des ennemis que Tintin doit déjouer au fil de ses aventures.",
 ],
});
// ─── LOT : Mickey & Amis ───
Object.assign(FIG_PAGES, {
 mk01: [
  "Mickey Mouse est la célèbre petite souris au grand cœur, optimiste et débrouillarde. Toujours de bonne humeur, il entraîne ses amis dans mille aventures.",
  "Reconnaissable à ses grandes oreilles rondes et à son sourire, il est l'un des personnages les plus connus au monde. Courageux et bienveillant, Mickey ne se laisse jamais abattre.",
 ],
 mk02: [
  "Minnie Mouse est la douce et élégante amoureuse de Mickey, reconnaissable à son joli nœud sur la tête. Gentille et pleine d'entrain, elle partage ses aventures.",
  "Coquette et déterminée, elle a son caractère et sait ce qu'elle veut. Minnie est une figure incontournable et attachante de la grande famille de Mickey.",
 ],
 mk03: [
  "Donald Duck est un canard au caractère explosif, célèbre pour ses colères et son langage difficile à comprendre. Malchanceux et susceptible, il se met sans cesse dans des situations cocasses.",
  "Malgré son fichu caractère, il reste attachant et plein de bonne volonté. Donald, en marin grognon, est l'un des personnages les plus drôles de l'univers de Mickey.",
 ],
 mk04: [
  "Daisy Duck est l'élégante et charmante amoureuse de Donald. Raffinée et au tempérament affirmé, elle ne se laisse pas faire face au caractère bouillant de son canard préféré.",
  "Coquette et pleine d'esprit, elle apporte douceur et fantaisie. Daisy est l'amie fidèle de Minnie et une figure pétillante de la bande.",
 ],
 mk05: [
  "Dingo est un grand personnage longiligne, maladroit et terriblement gentil. Toujours de bonne humeur, il enchaîne les bêtises avec une insouciance désarmante.",
  "Sa naïveté et sa bonne volonté provoquent une foule de situations comiques. Ami fidèle de Mickey, Dingo est l'incarnation de la gaffe joyeuse et bon enfant.",
 ],
 mk06: [
  "Pluto est le chien fidèle de Mickey, joueur et plein d'énergie. Contrairement à d'autres personnages, il se comporte comme un véritable animal de compagnie.",
  "Curieux et affectueux, il suit Mickey dans ses aventures et lui témoigne un attachement sans faille. Pluto est le compagnon à quatre pattes le plus dévoué de la bande.",
 ],
 mk07: [
  "Tic et Tac sont deux petits écureuils espiègles et inséparables, reconnaissables à leur vivacité et à leurs facéties. Malins et bricoleurs, ils ont plus d'un tour dans leur sac.",
  "Ensemble, ils provoquent de joyeuses pagailles, souvent aux dépens de Donald. Tic et Tac forment un duo comique adoré des petits comme des grands.",
 ],
 mk08: [
  "Pat Hibulaire est le grand méchant récurrent de l'univers de Mickey, une force de la nature à l'allure de gros matou. Brutal et roublard, il cherche toujours à nuire aux héros.",
  "Malgré sa taille et sa ruse, ses mauvais plans finissent souvent par échouer face à l'ingéniosité de Mickey. Pat Hibulaire est l'adversaire classique de la joyeuse bande.",
 ],
});
// ─── LOT : Mario Bros ───
Object.assign(FIG_PAGES, {
 mr01: [
  "Mario est un plombier moustachu en salopette, devenu le héros le plus célèbre du jeu vidéo. Toujours coiffé de sa casquette rouge marquée d'un M, il enchaîne les sauts avec une énergie inépuisable.",
  "Au Royaume Champignon, il part sans cesse au secours de la Princesse Peach, enlevée par le terrible Bowser. Courageux et bondissant, Mario triomphe des pièges grâce à son agilité et à quelques champignons magiques.",
 ],
 mr02: [
  "Luigi est le grand frère élancé de Mario, vêtu de vert. Plus timide et un brin peureux, il n'en est pas moins courageux quand il s'agit d'aider son frère.",
  "Il saute encore plus haut que Mario et se distingue dans ses propres aventures, parfois face aux fantômes. Fidèle et attachant, Luigi est l'inséparable complice du plombier rouge.",
 ],
 mr03: [
  "La Princesse Peach règne avec douceur sur le Royaume Champignon. Reconnaissable à sa longue robe rose et à sa couronne, elle est régulièrement enlevée par Bowser.",
  "Mais elle n'est pas qu'une princesse à secourir : elle se montre parfois courageuse et débrouillarde, prenant elle-même part à l'aventure. Peach incarne la grâce et la bienveillance du royaume.",
 ],
 mr04: [
  "Bowser est le roi des Koopas, une énorme tortue à carapace hérissée de pics, capable de cracher du feu. C'est le grand ennemi de Mario.",
  "Sans cesse, il enlève la Princesse Peach et dresse des pièges pour empêcher le plombier de la délivrer. Puissant et obstiné, Bowser finit pourtant toujours par être vaincu par l'agilité de Mario.",
 ],
 mr05: [
  "Yoshi est un adorable petit dinosaure au grand cœur, fidèle monture de Mario. Avec sa longue langue, il gobe les ennemis et peut les recracher ou les transformer en œufs.",
  "Rapide et sympathique, il aide le plombier à franchir les passages les plus périlleux. Yoshi est l'un des compagnons les plus appréciés de l'univers de Mario.",
 ],
 mr06: [
  "Toad est un petit habitant du Royaume Champignon, coiffé d'un grand chapeau en forme de champignon. Serviteur loyal de la Princesse Peach, il est toujours prêt à rendre service.",
  "Vif et courageux malgré sa petite taille, il guide souvent Mario dans ses quêtes. Toad est la mascotte joyeuse et fidèle du royaume.",
 ],
 mr07: [
  "Wario est le double grossier et cupide de Mario, vêtu de jaune et de violet, avec une moustache en zigzag. Avide d'or et de richesses, il ne pense qu'à son propre intérêt.",
  "Doté d'une grande force, il n'hésite pas à tricher pour parvenir à ses fins. Wario est un rival turbulent et comique du célèbre plombier.",
 ],
 mr08: [
  "Waluigi est le complice de Wario, grand et maigre, rival déclaré de Luigi. Sournois et un brin cabotin, il aime semer la pagaille.",
  "On le retrouve surtout dans les compétitions sportives et les jeux de fête, où il joue volontiers les trouble-fête. Waluigi forme avec Wario un duo de chenapans hauts en couleur.",
 ],
});
// ─── LOT : Cobra ───
Object.assign(FIG_PAGES, {
 co01: [
  "Cobra est un aventurier de l'espace au sourire éternel, ancien pirate au grand cœur. Sous son bras gauche se cache une arme redoutable, un canon à énergie psychique, le célèbre Psychogun.",
  "Insouciant, blagueur et invincible, il parcourt la galaxie en quête de liberté et de trésors, traqué par une puissante guilde de pirates. Cobra mêle bravoure, humour et panache à chaque aventure.",
 ],
 co02: [
  "Armanoïde est une androïde au corps métallique brillant, fidèle alliée et garde du corps de Cobra. D'une loyauté absolue, elle veille sur lui en toutes circonstances.",
  "Capable de transformer son corps en armes ou en boucliers, elle est aussi élégante que redoutable. Armanoïde est la compagne de route indispensable du héros à travers l'espace.",
 ],
 co03: [
  "Jane est une belle et intrépide aventurière dont le destin se mêle à celui de Cobra. Courageuse et déterminée, elle n'a pas froid aux yeux face au danger.",
  "Elle porte un mystérieux tatouage qui, réuni à ceux de ses sœurs, dessine la carte d'un fabuleux trésor. Jane est une alliée précieuse et un personnage clé des aventures de Cobra.",
 ],
 co04: [
  "L'Homme de Cristal est un redoutable ennemi de Cobra, au corps fait d'une matière proche du miroir. Cette particularité lui permet de renvoyer les tirs qu'on lui adresse.",
  "Lieutenant de la guilde des pirates, froid et impitoyable, il représente un adversaire particulièrement coriace. Pour le vaincre, Cobra doit redoubler de ruse.",
 ],
 co05: [
  "Salamandar est le chef redouté de la guilde des pirates de l'espace, le grand ennemi de Cobra. Cruel et puissant, il règne par la terreur sur les bas-fonds de la galaxie.",
  "Obsédé par l'idée d'éliminer Cobra, il lance contre lui ses meilleurs tueurs. Salamandar incarne la menace suprême qui plane sur le héros.",
 ],
 co06: [
  "Tarbeige est l'un des dangereux adversaires que Cobra croise dans ses pérégrinations spatiales. Au service des forces hostiles, il complique les plans du héros.",
  "Comme tous les ennemis de la guilde, il sous-estime la débrouillardise et la chance insolente de Cobra. Tarbeige fait partie des obstacles que l'aventurier doit déjouer.",
 ],
 co07: [
  "Le Pirate de l'espace est un membre de la redoutable guilde qui écume la galaxie. Armé et sans scrupules, il traque les aventuriers et les trésors.",
  "Au service de chefs impitoyables, il représente la menace constante qui pèse sur Cobra. Ces pirates anonymes pimentent les aventures du héros à chaque coin de l'espace.",
 ],
 co08: [
  "Sous le nom de Cobra Rugball, le héros se distingue dans un sport spatial aussi spectaculaire que violent. Sur le terrain, il fait preuve de la même audace que dans ses aventures.",
  "Rapide, malin et imprévisible, il déjoue les pièges de ses adversaires avec panache. Cette facette montre Cobra en champion intrépide d'un jeu où tous les coups sont permis.",
 ],
});
// ─── LOT : Albator ───
Object.assign(FIG_PAGES, {
 al01: [
  "Albator est un célèbre pirate de l'espace, reconnaissable à son cache-œil, sa longue cape noire et la cicatrice qui barre son visage. À bord de son vaisseau, il sillonne les étoiles en homme libre.",
  "Refusant la tyrannie et l'indifférence des puissants, il combat les envahisseurs pour défendre la Terre et la liberté. Noble et mélancolique, Albator est une figure légendaire du pirate au grand cœur.",
 ],
 al02: [
  "Alfred est un jeune garçon que le destin conduit à bord du vaisseau d'Albator. Plein d'admiration pour le pirate, il découvre à ses côtés la vie d'aventurier des étoiles.",
  "Courageux malgré son jeune âge, il trouve une place au sein de l'équipage. Alfred porte le regard de l'innocence et de l'apprentissage dans l'univers d'Albator.",
 ],
 al03: [
  "Nausicaa est une figure féminine forte de l'équipage d'Albator, dévouée à la cause du pirate. Loyale et déterminée, elle partage les dangers de la vie à bord.",
  "Aux côtés d'Albator, elle affronte les ennemis qui menacent la liberté. Nausicaa incarne le courage et la fidélité de ceux qui suivent le célèbre pirate.",
 ],
 al04: [
  "Tochirô est le meilleur ami d'Albator, un génie de la mécanique qui a conçu son extraordinaire vaisseau. Leur amitié indéfectible est au cœur de la légende du pirate.",
  "On dit que l'âme de Tochirô veille encore sur le navire et son capitaine. Discret mais essentiel, Tochirô est le compagnon de toujours d'Albator.",
 ],
 al05: [
  "Esmeralda est une fière pirate de l'espace qui sillonne les étoiles à bord de son propre vaisseau. Indépendante et redoutable, elle partage avec Albator l'amour de la liberté.",
  "Alliée du célèbre pirate, elle se montre aussi courageuse que mystérieuse. Esmeralda est l'une des grandes figures féminines de l'univers d'Albator.",
 ],
 al06: [
  "L'Atlantis est le légendaire vaisseau pirate d'Albator, orné d'une tête de mort, qui file à travers l'espace. Puissant et insaisissable, il est le refuge et la forteresse du capitaine et de son équipage.",
  "Conçu par le génie de Tochirô, il semble presque vivant tant il est lié à son maître. L'Atlantis est le symbole même de la liberté que défend Albator.",
 ],
 al07: [
  "Mima est une mystérieuse passagère du vaisseau d'Albator, venue d'un peuple des étoiles. Discrète et énigmatique, elle accompagne souvent les moments de calme de sa musique envoûtante.",
  "Amie fidèle de l'équipage, elle apporte douceur et sérénité au cœur des batailles. Mima est une présence apaisante et poétique aux côtés du pirate.",
 ],
 al08: [
  "Le Professeur Zon est un personnage savant de l'univers d'Albator, dont les connaissances jouent un rôle dans les péripéties du pirate. Esprit cultivé, il est mêlé aux enjeux qui agitent l'espace.",
  "Tour à tour utile ou inquiétant, il illustre la part de science et de mystère qui traverse les aventures. Le Professeur Zon enrichit le monde foisonnant d'Albator.",
 ],
});
// ─── LOT : Tortues Ninja ───
Object.assign(FIG_PAGES, {
 tu01: [
  "Leonardo est le chef des Tortues Ninja, reconnaissable à son bandeau bleu. Discipliné et réfléchi, il manie deux sabres katanas avec une grande maîtrise.",
  "Sérieux et loyal, il veille sur ses frères et fait régner l'ordre dans l'équipe. Leonardo incarne le sens du devoir et le respect des enseignements de leur maître.",
 ],
 tu02: [
  "Raphael est la tortue au bandeau rouge, la plus impétueuse et la plus bagarreuse de l'équipe. Son arme de prédilection est une paire de saïs.",
  "Au caractère explosif, il fonce parfois sans réfléchir, mais son courage et sa force sont sans égal. Sous sa carapace bourrue, Raphael cache un grand attachement à ses frères.",
 ],
 tu03: [
  "Donatello est la tortue au bandeau violet, le cerveau scientifique de l'équipe. Génie de la mécanique et de l'informatique, il invente gadgets et machines en tout genre.",
  "Il combat à l'aide d'un long bâton, le bô. Calme et ingénieux, Donatello résout les problèmes les plus complexes et arme ses frères de ses inventions.",
 ],
 tu04: [
  "Michelangelo est la tortue au bandeau orange, la plus joyeuse et la plus farceuse du groupe. Toujours de bonne humeur, il adore plaisanter et se régaler de pizzas.",
  "Il manie avec agilité une paire de nunchakus. Drôle et bondissant, Michelangelo apporte légèreté et bonne humeur à l'équipe des Tortues Ninja.",
 ],
 tu05: [
  "Splinter est le maître et le père adoptif des Tortues Ninja, un rat mutant devenu sage et expert en arts martiaux. C'est lui qui leur a tout appris.",
  "Patient et profond, il transmet à ses élèves la discipline, l'honneur et l'esprit du ninjutsu. Splinter est le guide vénéré qui veille sur ses quatre fils.",
 ],
 tu06: [
  "April O'Neil est une journaliste courageuse et la fidèle amie humaine des Tortues Ninja. Curieuse et débrouillarde, elle les aide dans leurs enquêtes et leurs combats.",
  "Toujours prête à se rendre utile, elle fait le lien entre les tortues et le monde de la surface. April est une alliée précieuse et une amie loyale.",
 ],
 tu07: [
  "Shredder est l'ennemi juré des Tortues Ninja, un terrible chef de clan vêtu d'une armure hérissée de lames. Cruel et ambitieux, il rêve de pouvoir et de domination.",
  "À la tête d'une armée de ninjas, il traque sans relâche les tortues et leur maître. Shredder est l'adversaire le plus dangereux et le plus redouté de la série.",
 ],
});
// ─── LOT : La Reine des Neiges ───
Object.assign(FIG_PAGES, {
 fr01: [
  "Elsa est une princesse devenue reine, dotée d'un pouvoir extraordinaire : elle peut créer la glace et la neige d'un simple geste. Longtemps, elle a caché ce don de peur de blesser ceux qu'elle aime.",
  "Au fil de son histoire, elle apprend à accepter sa magie et à la maîtriser, transformant sa peur en force et en liberté. Elsa incarne le courage de devenir soi-même.",
 ],
 fr02: [
  "Anna est la sœur cadette d'Elsa, pleine d'optimisme, d'énergie et d'amour. Intrépide et chaleureuse, elle ne recule devant rien pour retrouver et protéger sa sœur.",
  "Son cœur généreux et sa détermination la mènent à travers de grandes aventures. Anna incarne la force de l'amour fraternel et la joie de vivre.",
 ],
 fr03: [
  "Olaf est un adorable bonhomme de neige plein de vie, né de la magie d'Elsa. Naïf et joyeux, il rêve paradoxalement de connaître la chaleur de l'été.",
  "Toujours de bonne humeur, il apporte rire et tendresse à ses amis. Olaf est le compagnon comique et attachant des sœurs dans leurs aventures.",
 ],
 fr04: [
  "Kristoff est un solide montagnard qui récolte la glace pour vivre, accompagné de son fidèle renne. Bourru au premier abord, il cache un cœur généreux.",
  "Il aide Anna dans sa quête à travers les montagnes enneigées. Honnête et courageux, Kristoff devient un compagnon précieux et un véritable ami.",
 ],
 fr05: [
  "Sven est le renne fidèle de Kristoff, un compagnon robuste et affectueux. Bien qu'il ne parle pas, il se comporte presque comme un véritable ami.",
  "Toujours prêt à aider, il transporte ses amis à travers la neige et les défend en cas de danger. Sven est une présence tendre et fidèle de l'aventure.",
 ],
 fr06: [
  "Marshmallow est un gigantesque bonhomme de neige créé par Elsa pour protéger sa solitude. Impressionnant et puissant, il monte la garde devant son palais de glace.",
  "Sous son apparence redoutable, il n'est au fond qu'un gardien attaché à sa créatrice. Marshmallow veille sur Elsa avec une fidélité de colosse.",
 ],
 fr07: [
  "Hans est un prince à l'allure charmante et aux belles manières, qui dissimule de sombres intentions. Derrière son sourire avenant se cache un cœur calculateur.",
  "Sa trahison surprend Anna et Elsa, qui l'avaient cru sincère. Hans est l'antagoniste séduisant mais perfide de l'histoire.",
 ],
});
// ─── LOT : Pyjamasques ───
Object.assign(FIG_PAGES, {
 pj01: [
  "Gluglu, alias Gekko, est l'un des trois Pyjamasques, le héros vert aux pouvoirs du gecko. Capable de coller aux murs et de se camoufler, il fait aussi preuve d'une grande force.",
  "Un peu timide mais très courageux, il aide ses amis à déjouer les plans des méchants la nuit venue. Gluglu est le pilier discret et solide de l'équipe.",
 ],
 pj02: [
  "Yoyo, alias Catboy, est le héros bleu des Pyjamasques, doté des pouvoirs du chat. Rapide, agile et bondissant, il possède aussi une ouïe très fine.",
  "Souvent le meneur du trio, il fonce parfois un peu vite mais ne manque jamais de bravoure. Yoyo entraîne ses amis dans leurs missions nocturnes.",
 ],
 pj03: [
  "Bibou, alias Owlette, est l'héroïne rouge des Pyjamasques, aux pouvoirs de la chouette. Elle peut voler et possède un regard perçant qui voit au loin.",
  "Réfléchie et attentionnée, elle apporte sagesse et hauteur de vue à l'équipe. Bibou veille sur ses amis depuis les airs lors de leurs aventures.",
 ],
 pj04: [
  "Sorceline est une espiègle adversaire des Pyjamasques, qui commande de petits papillons grâce à un aimant lunaire. La nuit, elle aime semer la pagaille.",
  "Maligne et capricieuse, elle cherche surtout à s'amuser à leurs dépens. Sorceline est l'une des trublionnes récurrentes des nuits des héros.",
 ],
 pj05: [
  "Roméo est un jeune savant farfelu et fanfaron, accompagné de son robot. Rêvant de dominer la ville pendant que tout le monde dort, il invente des machines biscornues.",
  "Heureusement, ses plans échouent toujours face à l'ingéniosité des Pyjamasques. Roméo est l'un des grands méchants comiques de la série.",
 ],
 pj06: [
  "Les Farfeloups sont un groupe de petits trublions facétieux qui aiment jouer des tours et provoquer le désordre. En bande, ils donnent du fil à retordre aux Pyjamasques.",
  "Turbulents et imprévisibles, ils transforment chaque nuit en joyeuse pagaille. Les Farfeloups apportent action et rebondissements aux aventures des héros.",
 ],
 pj07: [
  "Tatouro'Tom, alias Night Ninja, est un adversaire furtif des Pyjamasques, vêtu comme un ninja. Il lance de petites projections collantes et commande une bande de petits acolytes.",
  "Discret et rusé, il tend des pièges aux héros au cœur de la nuit. Night Ninja est l'un des antagonistes les plus malins de la série.",
 ],
});
// ─── LOT : Miraculous ───
Object.assign(FIG_PAGES, {
 mi01: [
  "Marinette est une lycéenne créative et maladroite qui rêve de devenir styliste. Grâce à un bijou magique, ses boucles d'oreilles, elle se transforme en la super-héroïne Ladybug.",
  "Vêtue de rouge à pois noirs, elle manie un yo-yo et fait appel à un pouvoir porte-bonheur pour déjouer les plans des méchants. Courageuse et déterminée, Ladybug protège Paris.",
 ],
 mi02: [
  "Adrien est un lycéen et mannequin au grand cœur, qui mène une vie un peu solitaire. Grâce à une bague magique, il devient le super-héros Chat Noir.",
  "Agile et plein d'humour, il manie un bâton et possède un pouvoir de destruction, le Cataclysme. Aux côtés de Ladybug, dont il ignore l'identité, il défend la ville.",
 ],
 mi03: [
  "Gabriel est un grand couturier au caractère froid et distant, qui cache un terrible secret : c'est lui le Papillon, l'ennemi de Ladybug et Chat Noir.",
  "Grâce à un bijou maléfique, il transforme les personnes accablées par leurs émotions en super-vilains. Manipulateur et déterminé, le Papillon est l'antagoniste principal de la série.",
 ],
 mi04: [
  "Alya Césaire est la meilleure amie de Marinette, journaliste en herbe pleine d'énergie. Passionnée par les super-héros, elle anime un blog consacré à Ladybug.",
  "Curieuse et intrépide, elle se retrouve souvent au cœur de l'action. Alya est une amie fidèle et une alliée précieuse des héros.",
 ],
 mi05: [
  "Plagg est le kwami de Chat Noir, une minuscule créature magique noire qui lui confère ses pouvoirs. Gourmand et farceur, il raffole par-dessus tout du fromage.",
  "Paresseux en apparence, il reste un compagnon essentiel et plein d'esprit pour Adrien. Plagg apporte une bonne dose d'humour à la série.",
 ],
 mi06: [
  "Tikki est le kwami de Ladybug, une petite créature magique rouge à pois qui lui donne ses pouvoirs. Sage et bienveillante, elle guide et rassure Marinette.",
  "Douce et pleine de sagesse, elle est une amie et une conseillère précieuse pour l'héroïne. Tikki veille avec tendresse sur sa porteuse.",
 ],
});
// ─── LOT : Bluey ───
Object.assign(FIG_PAGES, {
 bl01: [
  "Bluey est une petite chienne pleine d'imagination et d'énergie, héroïne de joyeuses aventures du quotidien. Avec son pelage bleu, elle adore inventer des jeux et entraîner toute sa famille.",
  "Curieuse et débordante d'idées, elle transforme la moindre journée en grande aventure. Bluey incarne la magie du jeu et de l'enfance.",
 ],
 bl02: [
  "Bingo est la petite sœur de Bluey, plus douce et un peu plus réservée. Tout aussi imaginative, elle participe avec joie aux jeux inventés par sa grande sœur.",
  "Tendre et attachante, elle apprend à s'affirmer au fil des aventures. Bingo apporte douceur et sensibilité à la joyeuse famille.",
 ],
 bl03: [
  "Bandit est le papa de Bluey et Bingo, un père joueur et plein d'énergie. Toujours partant pour entrer dans les jeux de ses filles, il se prête à toutes leurs inventions.",
  "Patient et complice, il sait aussi transmettre de jolies leçons en s'amusant. Bandit est le papa rêvé pour de grandes aventures imaginaires.",
 ],
 bl04: [
  "Chilly est la maman de Bluey et Bingo, attentionnée et pleine de tendresse. Elle veille sur sa famille avec douceur tout en partageant volontiers les jeux.",
  "Bienveillante et patiente, elle apporte équilibre et chaleur au foyer. Chilly est une maman aimante au cœur des aventures de la famille.",
 ],
 bl05: [
  "Rusty est l'un des meilleurs amis de Bluey, un chiot énergique et sportif. Toujours prêt à courir et à jouer, il déborde d'enthousiasme.",
  "Imaginatif et bon camarade, il participe avec entrain aux jeux du groupe. Rusty est un compagnon de jeu fidèle et plein de vie.",
 ],
 bl06: [
  "Honey est une amie de Bluey, une petite chienne douce et un peu timide. Gentille et discrète, elle prend part avec plaisir aux aventures de la bande.",
  "Sa douceur en fait une camarade attachante et appréciée. Honey illustre la tendresse de l'amitié entre les enfants.",
 ],
});
// ─── LOT : Totally Spies ───
Object.assign(FIG_PAGES, {
 sp01: [
  "Clover est l'une des trois espionnes de la série, passionnée de mode et de shopping. Sous ses airs frivoles, c'est une agente courageuse et débrouillarde.",
  "En mission, elle fait équipe avec ses amies pour déjouer les plans des méchants. Pétillante et déterminée, Clover prouve qu'on peut être à la fois coquette et héroïne.",
 ],
 sp02: [
  "Sam est l'espionne la plus réfléchie et la plus posée du trio, souvent à la tête des plans. Intelligente et organisée, elle garde la tête froide dans les situations les plus tendues.",
  "Sa logique et son sang-froid sont précieux lors des missions. Sam est le cerveau de l'équipe des trois espionnes.",
 ],
 sp03: [
  "Alex est la plus sportive et la plus spontanée des trois espionnes. Pleine d'énergie et de bonne humeur, elle se distingue par son agilité et son cœur généreux.",
  "Toujours prête à passer à l'action, elle apporte dynamisme et chaleur au groupe. Alex est l'amie fidèle et énergique du trio.",
 ],
 sp04: [
  "Jerry est le directeur de l'agence secrète qui envoie les trois espionnes en mission. Élégant et British, il les équipe de gadgets ingénieux et les guide depuis son quartier général.",
  "Mentor exigeant mais bienveillant, il veille sur ses agentes. Jerry est la figure tutélaire qui orchestre les aventures des espionnes.",
 ],
 sp05: [
  "Mandy est la camarade de classe capricieuse et prétentieuse des espionnes, qui adore se mettre en avant. Vaniteuse et rivale, elle cherche sans cesse à les rabaisser.",
  "Sans savoir qu'elles sont espionnes, elle leur complique surtout la vie au quotidien. Mandy est la peste récurrente et comique de la série.",
 ],
});
// ─── LOT : Sailor Moon ───
Object.assign(FIG_PAGES, {
 sm01: [
  "Sailor Moon est l'héroïne d'une jeune fille maladroite mais au cœur immense, qui se transforme en guerrière au nom de la Lune. Désignée pour protéger la Terre, elle mène un groupe de combattantes magiques.",
  "Grâce à ses pouvoirs lunaires, elle affronte les forces du mal pour défendre l'amour et la justice. Derrière ses larmes et ses doutes, Sailor Moon révèle un courage hors du commun.",
 ],
 sm02: [
  "Sailor Mars est une guerrière au tempérament de feu, à la fois fière et déterminée. Elle puise sa puissance dans l'élément du feu, qu'elle déchaîne contre ses ennemis.",
  "Dotée d'un sens spirituel développé, elle perçoit parfois le danger avant les autres. Sailor Mars est une combattante ardente et loyale du groupe.",
 ],
 sm03: [
  "Sailor Venus est la guerrière de l'amour, énergique et pleine d'assurance. Première des combattantes à se révéler, elle joue un rôle de meneuse au sein de l'équipe.",
  "Ses attaques s'inspirent de la lumière et de la force du sentiment. Sailor Venus apporte dynamisme et confiance au groupe des guerrières.",
 ],
 sm04: [
  "Sailor Mercury est la plus brillante et la plus posée des guerrières, première de la classe et fine stratège. Elle maîtrise les pouvoirs de l'eau et de la glace.",
  "Calme et réfléchie, elle analyse les situations pour aider ses amies à triompher. Sailor Mercury est l'intelligence tranquille de l'équipe.",
 ],
 sm05: [
  "Sailor Jupiter est la plus grande et la plus robuste des guerrières, à la force physique impressionnante. Elle commande la foudre et la nature pour foudroyer ses adversaires.",
  "Au grand cœur sous ses airs de dure, elle protège ses amies avec une loyauté sans faille. Sailor Jupiter est la combattante courageuse et protectrice du groupe.",
 ],
});
// ═══════════════════════════════════════════════════════
// ─── LOT : Saisonnier (figurines thématiques originales du projet) ───
// ═══════════════════════════════════════════════════════
Object.assign(FIG_PAGES, {
 sx_epiphanie: [
  "Le Roi de la Galette est la figurine de l'Épiphanie, la fête où l'on partage la fameuse galette des rois. Couronné d'or, il règne le temps d'une journée sur les gourmands.",
  "Celui qui trouve la fève cachée dans sa part devient roi ou reine à son tour. Joyeux et bon vivant, le Roi de la Galette célèbre le plaisir de partager en famille.",
 ],
 sx_valentin: [
  "Le Cœur Piégé est la figurine de la Saint-Valentin, la fête des amoureux. Ce cœur espiègle, traversé de flèches, joue à faire battre les cœurs.",
  "Mi-tendre, mi-malicieux, il rappelle avec humour que l'amour réserve parfois quelques surprises. Le Cœur Piégé est le clin d'œil rieur de la fête des amoureux.",
 ],
 sx_printemps: [
  "L'Esprit du Printemps est la figurine de la belle saison qui voit la nature renaître. Couronné de fleurs, il réveille les bourgeons et fait éclore les couleurs.",
  "Léger et joyeux, il apporte avec lui le retour des oiseaux et la douceur des beaux jours. L'Esprit du Printemps célèbre le renouveau de la vie.",
 ],
 sx_avril1: [
  "Le Poisson d'Avril est la figurine farceuse du 1er avril, jour des blagues et des canulars. Malicieux à souhait, il adore accrocher discrètement son fameux poisson de papier dans le dos des distraits.",
  "Roi des facéties, il transforme la journée en concours de bonnes blagues. Le Poisson d'Avril est l'esprit espiègle de la fête des farces.",
 ],
 sx_paques: [
  "Le Lapin de l'Ombre est la figurine mystérieuse de Pâques. La nuit, il file en secret cacher des œufs colorés dans les jardins et les recoins de la maison.",
  "Discret et rapide, il met les enfants au défi de retrouver ses cachettes au petit matin. Le Lapin de l'Ombre est le farceur gourmand de la chasse aux œufs.",
 ],
 sx_mardigras: [
  "Le Masque Trompeur est la figurine de Mardi Gras et du carnaval. Derrière son masque coloré, on ne sait jamais qui se cache, ce qui fait tout le sel de la fête.",
  "Costumes, confettis et déguisements sont à l'honneur. Le Masque Trompeur incarne la joie et le mystère du carnaval, où chacun devient quelqu'un d'autre.",
 ],
 sx_cny: [
  "Le Dragon de Jade est la figurine du Nouvel An chinois. Long, ondulant et majestueux, il danse dans les rues au son des tambours pour chasser la malchance.",
  "Symbole de force et de prospérité, il apporte bonheur et bonne fortune pour l'année qui commence. Le Dragon de Jade est l'éclat de cette grande fête colorée.",
 ],
 sx_ete: [
  "Le Soleil de Feu est la figurine de l'été, saison de la chaleur et des vacances. Rayonnant et éclatant, il fait briller les longues journées ensoleillées.",
  "Plages, baignades et jeux en plein air sont à l'honneur sous son regard ardent. Le Soleil de Feu incarne l'énergie et la joie de la belle saison.",
 ],
 sx_14juillet: [
  "La Fureur Tricolore est la figurine du 14 juillet, la fête nationale française. Parée de bleu, de blanc et de rouge, elle illumine le ciel de mille feux d'artifice.",
  "Défilés, lampions et bals populaires rythment cette journée festive. La Fureur Tricolore célèbre dans la joie et les couleurs cette grande fête de l'été.",
 ],
 sx_rentree: [
  "Le Cancre Insolent est la figurine espiègle de la rentrée des classes. Cartable de travers et air malicieux, il préférerait nettement prolonger les vacances.",
  "Derrière ses pitreries, il rappelle avec humour le retour à l'école, aux cahiers et aux nouveaux copains. Le Cancre Insolent est le clin d'œil rieur de la rentrée.",
 ],
 sx_automne: [
  "L'Esprit d'Automne est la figurine de la saison des feuilles qui tombent. Vêtu de roux et d'or, il fait virevolter les feuilles et mûrir les fruits de saison.",
  "Avec lui viennent les balades croquantes sous les arbres et la douceur des journées plus fraîches. L'Esprit d'Automne célèbre la beauté flamboyante de la saison.",
 ],
 sx_halloween: [
  "La Citrouille Maudite est la figurine d'Halloween, la nuit des frissons et des bonbons. Avec son sourire grimaçant éclairé de l'intérieur, elle veille sur les rues costumées.",
  "Déguisements, maisons hantées et chasses aux friandises sont au programme. La Citrouille Maudite incarne, pour rire, le côté délicieusement effrayant de la fête.",
 ],
 sx_hiver: [
  "L'Esprit d'Hiver est la figurine de la saison froide, maître du givre et de la neige. D'un souffle, il couvre le paysage d'un blanc manteau scintillant.",
  "Avec lui viennent les batailles de boules de neige, les bonshommes de neige et les chocolats chauds. L'Esprit d'Hiver célèbre la magie feutrée de la saison froide.",
 ],
 sx_noel: [
  "Le Père Fouettard est une figurine issue des traditions de Noël. Dans le folklore, il accompagne le distributeur de cadeaux et rappelle aux enfants l'importance d'être sages.",
  "Personnage espiègle plus que méchant, il fait partie du décor des fêtes de fin d'année. Le Père Fouettard ajoute une note malicieuse à la magie de Noël.",
 ],
 sx_nouvelan: [
  "L'Horloge Infernale est la figurine du Nouvel An, qui égrène les dernières secondes avant minuit. Quand ses aiguilles se rejoignent, une nouvelle année commence dans la joie.",
  "Compte à rebours, vœux et feux d'artifice marquent ce passage. L'Horloge Infernale symbolise l'excitation du moment où tout recommence.",
 ],
 sx_anniv_soren: [
  "Le Gâteau de Soren est une figurine spéciale d'anniversaire, créée pour fêter Soren. Couronné de bougies, il célèbre une année de plus et tous les vœux à souffler.",
  "Cadeaux, surprises et bonne humeur sont au rendez-vous. Le Gâteau de Soren est un clin d'œil tendre pour un jour pas comme les autres.",
 ],
 sx_anniv_peyo: [
  "Le Gâteau de Peyo est une figurine d'anniversaire dédiée à Peyo. Avec ses bougies allumées, il marque la fête d'un jour bien particulier.",
  "Entre rires, cadeaux et part de gâteau, c'est la joie de souffler une bougie de plus. Le Gâteau de Peyo célèbre ce moment unique avec tendresse.",
 ],
 sx_anniv_tomi: [
  "Le Gâteau de Tomi est une figurine d'anniversaire à l'effigie de la fête de Tomi. Surmonté de ses bougies, il invite à faire un vœu et à le garder secret.",
  "Famille réunie, surprises et gourmandises sont au programme. Le Gâteau de Tomi est un joli clin d'œil pour célébrer ce jour spécial.",
 ],
 sx_anniv_papa: [
  "Le Gâteau de Papa est une figurine d'anniversaire pour fêter Papa. Garni de bougies, il célèbre dans la bonne humeur le jour de son anniversaire.",
  "C'est l'occasion de lui dire combien on l'aime, entre câlins et cadeaux. Le Gâteau de Papa est un hommage tendre et festif.",
 ],
 sx_anniv_maman: [
  "Le Gâteau de Maman est une figurine d'anniversaire pour célébrer Maman. Couronné de bougies scintillantes, il marque sa journée spéciale.",
  "Entre tendresse, surprises et gourmandises, c'est un moment de bonheur partagé. Le Gâteau de Maman est un clin d'œil plein d'amour.",
 ],
});
try{
 if(typeof FIGURINES !== 'undefined' && Array.isArray(FIGURINES)){
  FIGURINES.forEach(f => { if(FIG_PAGES[f.id]) f.pages = FIG_PAGES[f.id]; });
 }
}catch(e){ console.warn('FIG_PAGES merge', e); }


// ── Boutique figurines ──────────────────────────────────
// Lazy-load par défaut : 'none' = aucune licence sélectionnée → pas de grille
let _figFilter='none';
// Shop state
let _shopSearch='';
