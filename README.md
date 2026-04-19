# L'Odyssée des Chiffres — V6.2 (édition modulaire, PWA, validée)

Jeu de calcul mental pour enfants du CP au CM2 : duels contre monstres, boss, combos, figurines à collectionner, mode combat multijoueur, vue parentale, sauvegarde locale.

Cette version est issue d'un travail de refactoring du fichier monolithique original (810 ko, 4961 lignes) en projet propre :

- **Découpé** en 11 modules JS thématiques + CSS séparé + HTML allégé
- **PWA installable** et fonctionnelle hors-ligne (manifest + service worker)
- **Portraits SVG externalisés** dans un sprite (≈420 ko sortis du bundle JS)
- **Profil validé et versionné** : tout profil corrompu ou bidouillé est assaini
- **Outils dev** : ESLint, Prettier, 15 tests Vitest qui passent ✅
- **Audit XSS** : tous les noms utilisateur dans `innerHTML` sont échappés via `esc()`

Le comportement de jeu est strictement identique à l'original.

---

## 🚀 Lancement rapide

Le projet est composé de fichiers HTML/CSS/JS statiques — **aucune compilation requise**. En revanche, il est désormais découpé en plusieurs fichiers `<script src="…">`, donc les navigateurs **bloquent l'ouverture directe** par double-clic (`file://`) pour des raisons de sécurité (CORS). Il faut servir le dossier via un serveur HTTP local.

### Option 1 : Python (déjà installé partout)

```bash
cd odyssee
python3 -m http.server 8000
```

Puis ouvrir [http://localhost:8000](http://localhost:8000).

### Option 2 : Node.js

```bash
cd odyssee
npm start              # = npx serve -l 8000 .
```

### Option 3 : extension VS Code

Installer **Live Server** (Ritwick Dey), clic droit sur `index.html` → *Open with Live Server*.

---

## 📦 Migration de votre sauvegarde V6 d'origine

Vos profils sont stockés dans le `localStorage` du **domaine** d'où vous chargez le jeu. Comme vous passez de `file://...html` à `http://localhost:8000`, c'est techniquement un nouveau domaine — vos sauvegardes ne suivent **pas** automatiquement.

**Procédure** (à faire une seule fois) :

1. Ouvrez l'**ancien** fichier monolithique dans un onglet
2. F12 → onglet *Console*, tapez :
   ```js
   copy(JSON.stringify(localStorage))
   ```
3. Ouvrez la nouvelle version sur `http://localhost:8000`
4. F12 → *Console*, tapez :
   ```js
   Object.entries(JSON.parse(`COLLEZ_ICI`)).forEach(([k,v]) => localStorage.setItem(k,v))
   ```
   (remplacez `COLLEZ_ICI` par Ctrl+V — gardez les backticks)
5. Rechargez la page. Tous les profils sont restaurés.

> 💡 Le jeu propose aussi un **export/import cloud** intégré dans la *Vue Parent* (un code à 6 chiffres) : c'est plus pratique si vous changez d'appareil.

> 🔒 À la première lecture, la nouvelle version va **valider et nettoyer** votre profil (bornes XP/étoiles/skills, types corrigés). Si une donnée est aberrante (par ex. XP négatif suite à un bug), elle est ramenée à 0. Les données légitimes ne sont pas modifiées.

---

## 📂 Structure du projet

```
odyssee/
├── index.html                  ← page principale (allégée, +meta PWA)
├── manifest.webmanifest        ← manifest PWA (installation)
├── sw.js                       ← service worker (cache hors-ligne)
├── package.json                ← scripts npm + devDependencies
├── README.md                   ← ce fichier
│
├── .eslintrc.json              ← config ESLint
├── .prettierrc.json            ← config Prettier
├── .prettierignore             ← fichiers exclus du formatage
├── vitest.config.js            ← config des tests
│
├── css/
│   └── styles.css              ← toutes les règles de style (37 ko)
│
├── assets/
│   ├── portraits.svg           ← sprite des 232 portraits (414 ko)
│   ├── icon.svg                ← icône vectorielle
│   ├── icon-192.png            ← icône PWA 192×192
│   ├── icon-512.png            ← icône PWA 512×512
│   ├── icon-maskable.png       ← icône Android adaptive
│   ├── apple-touch-icon.png    ← icône iOS
│   └── favicon-32.png          ← favicon
│
├── js/                         ← 11 modules, chargés dans l'ordre
│   ├── 01-core.js              ← état global, $, beep, helpers monstres
│   ├── 02-data.js              ← niveaux, zones, skins, sons, badges, quêtes
│   ├── 03-figurines-data.js    ← 232 figurines + loader portraits (100 ko)
│   ├── 04-questions.js         ← générateurs de questions par niveau
│   ├── 05-profile.js           ← load/save profil + XP + validation + migration
│   ├── 06-time-block.js        ← blocage horaire + filtres opérations
│   ├── 07-game.js              ← flux jeu : audio, particules, combat, timers
│   ├── 08-ui.js                ← dashboard, avatars, historique, multi-tables
│   ├── 09-parent.js            ← vue parentale, cloud, export PDF
│   ├── 10-figurines.js         ← viewer 3D + animations + 29 sons (SOUND_MAP)
│   └── 11-init.js              ← window.onload
│
└── tests/
    ├── setup.js                ← stubs DOM/AudioContext globaux
    ├── loadGame.js             ← helper qui charge tous les modules dans une sandbox
    └── game.test.js            ← 15 tests pivots
```

---

## 🛠 Commandes disponibles

```bash
npm start            # serveur de dev (npx serve sur le port 8000)
npm test             # lance les 15 tests Vitest
npm run test:watch   # tests en mode surveillance
npm run lint         # vérifie le code avec ESLint
npm run lint:fix     # corrige automatiquement ce qui peut l'être
npm run format       # reformate avec Prettier
npm run format:check # vérifie le formatage sans modifier
```

À l'installation initiale :

```bash
npm install
```

---

## 🧪 Tests pivots

Les 15 tests couvrent les 5 mécaniques critiques du jeu :

| Test | Ce qui est vérifié |
|---|---|
| **XP & niveaux** | `xpForLevel(1)=0`, croissance stricte, réciprocité avec `levelFromXP`, plafond à 50 |
| **Étoiles de fin** | `computeStars(score, won)` — règles 0/1/2/3 étoiles selon score |
| **Génération CP** | `genQ_CP` produit des questions valides, bornes respectées, pool boss varié |
| **Validation profil** | Profils bidouillés (XSS, valeurs aberrantes, types invalides) sont assainis |
| **Anti-répétition boss** | `_nextBossType` ne renvoie jamais 2× le même type d'affilée, distribution équitable |

Pour ajouter vos propres tests : créez `tests/mon-test.test.js` :

```js
import { describe, it, expect, beforeAll } from 'vitest';
import { loadGame } from './loadGame.js';

let game;
beforeAll(() => { game = loadGame(); });

describe('Ma feature', () => {
  it('fait quelque chose', () => {
    expect(game.maFonction(42)).toBe(84);
  });
});
```

---

## 📱 PWA — Installation sur appareil

Une fois le jeu chargé via HTTPS (ou `localhost`), il devient installable :

- **Chrome/Edge desktop** : icône d'installation dans la barre d'URL
- **Android Chrome** : menu ⋮ → "Installer l'application" / "Ajouter à l'écran d'accueil"
- **iOS Safari** : bouton Partager → "Sur l'écran d'accueil"

Une fois installé :
- L'app se lance en plein écran (sans barre d'URL)
- Elle fonctionne **hors-ligne** (le service worker met tout en cache)
- Elle apparaît dans le lanceur d'apps comme une vraie application

> ⚠️ Pour que l'installation fonctionne en production, le site doit être servi en **HTTPS** (ou `localhost` en dev). Sinon le navigateur refuse d'enregistrer le service worker.

### Mettre à jour l'app installée

Quand vous modifiez le code, incrémentez `CACHE_VERSION` dans `sw.js` (par exemple `'v6.2.0'` → `'v6.2.1'`). Au prochain chargement, le service worker détecte la nouvelle version et nettoie l'ancien cache.

---

## 🔒 Versioning et validation des profils

Le format de sauvegarde est désormais **versionné** via le champ `_v` (actuellement `SAVE_VERSION = 6`). Si vous changez la structure du profil dans le futur, ajoutez une fonction de migration dans `js/05-profile.js` :

```js
const _MIGRATIONS = {
  7: (raw) => {
    // V6 → V7 : exemple — renommage d'un champ
    raw.newName = raw.oldName;
    delete raw.oldName;
    return raw;
  },
};
```

À la lecture, le système chaîne automatiquement les migrations nécessaires.

La fonction `validateProfile()` impose des bornes strictes :
- `stars` ∈ [0, 999 999]
- `xp` ∈ [0, 9 999 999]
- `skills.shield/sword/clock` ∈ [0, 3]
- `inventory.potion/bomb` ∈ [0, 99]
- `prefs.level` ∈ {`CP`, `CE1`, `CE2`, `CM1`, `CM2`}
- `prefs.mode` ∈ {`keyboard`, `qcm`}
- `prefs.theme` ∈ {`standard`, `espace`, `foret`, `volcan`}
- `name`, `avatar`, etc. : tronqués si trop longs
- Tableaux : limités en taille (history 50, errors 60, ownedFigurines 500)
- Champs inconnus : ignorés

Conséquence : un enfant débrouillard qui tape `localStorage.setItem('user_X', '{stars:99999999}')` dans la console verra ses étoiles ramenées à la borne max (999 999) au prochain rechargement.

---

## 🛠 Pour modifier le code

| Vous voulez modifier… | Ouvrez… |
|---|---|
| L'apparence (couleurs, polices, animations CSS) | `css/styles.css` |
| Une nouvelle figurine ou son portrait SVG | `js/03-figurines-data.js` + `assets/portraits.svg` |
| La difficulté des questions ou un nouveau type | `js/04-questions.js` |
| Un nouveau monstre (nom, animation, couleur) | `js/01-core.js` (constante `MONSTER_ROSTER`) |
| La récompense d'un badge ou d'une quête | `js/02-data.js` |
| Un son de figurine (`SOUND_MAP[d.sp]`) | `js/10-figurines.js` |
| L'export PDF parent | `js/09-parent.js` |
| Le format de sauvegarde | `js/05-profile.js` (incrémenter `SAVE_VERSION`, ajouter une migration) |
| Le HTML d'un écran (menu, dashboard, etc.) | `index.html` |
| Les fichiers mis en cache hors-ligne | `sw.js` (constante `PRECACHE_URLS`) |

### Cycle de développement type

```bash
# 1. Lancer le serveur (terminal A)
npm start

# 2. Lancer les tests en watch (terminal B)
npm run test:watch

# 3. Modifier du code dans votre éditeur
# 4. Avant de commiter :
npm run lint          # vérifie qu'il n'y a pas d'erreurs
npm run format        # reformate
npm test              # 15 tests doivent passer
```

### Conseil debug

Une fois `npm start` lancé, ouvrez les **DevTools** (F12) :
- Onglet *Network* : cocher *Disable cache* pour que F5 recharge tout
- Onglet *Application* → *Service Workers* : cliquer *Update* pour forcer la nouvelle version
- Onglet *Application* → *Local Storage* : voir/éditer les profils en direct

---

## ⚠️ Points d'attention

- **`localStorage` lié au port** : `localhost:8000` ≠ `localhost:3000`. Restez sur le même port.
- **Pas de transpilation** : ES2020+ requis (`?.`, `??`). Tous les navigateurs depuis 2020 sont OK.
- **Polices Google + GIFs Giphy externes** : encore présents. Pour un déploiement RGPD-friendly ou hors-ligne complet, télécharger les `.woff2` localement et remplacer les GIFs par des SVG/MP4 hébergés.
- **Le sprite `portraits.svg`** est chargé en arrière-plan au démarrage. Si l'utilisateur ouvre la boutique avant la fin du téléchargement (rare), il voit des emojis fallback pendant ~200 ms.

---

## 🔄 Reconstituer le fichier monolithique (au cas où)

```bash
cd odyssee
{
  echo '<!DOCTYPE html><html lang="fr"><head>'
  echo '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">'
  echo '<title>L'\''Odyssée des Chiffres</title>'
  echo '<style>'; cat css/styles.css; echo '</style>'
  echo '</head>'
  awk '/<body/,/<!--.*SCRIPTS/' index.html | head -n -1
  echo '<script>'
  cat js/01-core.js js/02-data.js js/03-figurines-data.js js/04-questions.js \
      js/05-profile.js js/06-time-block.js js/07-game.js js/08-ui.js \
      js/09-parent.js js/10-figurines.js js/11-init.js
  echo '</script></body></html>'
} > odyssee-monolithe.html
```

⚠️ Ce fichier monolithique ne contiendra **pas** les portraits SVG (ils restent dans `assets/portraits.svg`). Pour avoir un vrai monolithe autonome, il faudrait aussi inliner le sprite — mais on perd alors tous les bénéfices d'avoir externalisé.

---

## 📋 Pistes d'amélioration suivantes

Pour V7, on pourrait s'attaquer à :

1. **Difficulté adaptative** : `opStats` est déjà collecté — l'utiliser pour faire piocher plus souvent dans les opérations ratées.
2. **Composants Web** : passer en `<script type="module">` + `import`/`export` pour un vrai isolement entre fichiers.
3. **Export profil JSON** : un bouton dans la vue parent qui télécharge un `.json` (plus simple que le code à 6 chiffres pour les transferts).
4. **Mode "duo en ligne"** : via WebRTC pour que deux enfants jouent depuis deux appareils.
5. **`prefers-reduced-motion`** : respecter le réglage système d'accessibilité (animations désactivables).
6. **Self-hébergement des polices** : retirer la dépendance Google Fonts (RGPD).

Bon développement ! 🎮
