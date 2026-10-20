# Magma UI

Petite bibliothèque de composants **Alpine.js**, pensée pour fonctionner aussi bien
avec **Alpine seul** qu'avec **Alpine embarqué par Livewire**. Aucune dépendance
d'exécution : ni framework CSS, ni utilitaires, ni police distante.

- **15 composants** : sélecteurs (local, distant, multiple, indicatif téléphonique),
  modale, tiroir latéral, feuille, panneau déroulant, accordéon, onglets,
  pagination, notifications, recherche, actualisation, copie, interrupteur.
- **Chargement distant** intégré : recherche serveur temporisée, pagination,
  « charger plus » au défilement.
- **Zéro dépendance** : Alpine est une `peerDependency`, exactement comme pour les
  greffons officiels d'Alpine.
- **Accessible** : navigation clavier complète, rôles ARIA, focus visible.
- **Thémable par variables CSS**, préfixe `magma-` unique.

---

## Sommaire

- [Installation](#installation)
- [Démarrage rapide](#démarrage-rapide)
- [Alpine seul ou Alpine + Livewire](#alpine-seul-ou-alpine--livewire)
- [Chargement distant et « charger plus »](#chargement-distant-et-charger-plus)
- [Composants](#composants)
- [Personnalisation](#personnalisation)
- [Accessibilité](#accessibilité)
- [Compatibilité](#compatibilité)
- [Développement](#développement)
- [Licence](#licence)

---

## Installation

```bash
npm install @momoledev/alpine-magma-ui-component
```

Alpine doit être présent dans l'application :

```bash
npm install alpinejs
```

### Sans bundler

```html
<link rel="stylesheet" href="https://unpkg.com/@momoledev/alpine-magma-ui-component/dist/magma-ui.css" />
<script src="https://unpkg.com/@momoledev/alpine-magma-ui-component/dist/magma-ui.global.js" defer></script>
<script src="https://unpkg.com/alpinejs/dist/cdn.min.js" defer></script>
```

Le bundle global expose `window.MagmaUI`, enregistre les composants auprès d'Alpine
et publie chaque fabrique en global (`window.magmaSelect`, `window.magmaModal`, …).
L'ordre des deux balises n'a pas d'importance : si Alpine démarre après la
bibliothèque, l'enregistrement est différé jusqu'à `alpine:init`.

---

## Démarrage rapide

```html
<link rel="stylesheet" href="/node_modules/@momoledev/alpine-magma-ui-component/dist/magma-ui.css" />

<div class="magma-root">
    <div
        class="magma-select"
        x-data="magmaSelect({
            value: 'ci',
            placeholder: 'Choisissez un pays',
            options: [
                { value: 'ci', label: "Côte d'Ivoire" },
                { value: 'sn', label: 'Sénégal' },
            ],
        })"
        @click.outside="close()"
        :class="open && 'is-open'"
    >
        <button type="button" class="magma-select__trigger" x-ref="trigger" @click="toggle()" :aria-expanded="open">
            <span class="magma-select__value" x-text="currentLabel"></span>
            <svg class="magma-select__caret" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m6 9.5 6 6 6-6" /></svg>
        </button>

        <div class="magma-select__menu" x-ref="menu" :style="menuStyle" x-show="open" x-cloak
             x-transition:enter="magma-fade-enter" x-transition:enter-start="magma-fade-enter-start"
             x-transition:leave="magma-fade-leave" x-transition:leave-end="magma-fade-leave-end"
             role="listbox">
            <div class="magma-select__search">
                <input type="text" x-model="searchTerm" @input="onSearchInput()" x-ref="search" placeholder="Rechercher" />
            </div>

            <ul class="magma-select__list" x-ref="list" @scroll="onListScroll($event)">
                <template x-for="(option, index) in visibleOptions" :key="option.value">
                    <li data-index="index">
                        <button type="button" class="magma-select__option"
                                :class="[String(option.value) === String(value) && 'is-selected', index === activeIndex && 'is-active']"
                                @click="choose(option)"
                                role="option"
                                :aria-selected="String(option.value) === String(value)">
                            <span class="magma-select__name" x-text="option.label"></span>
                        </button>
                    </li>
                </template>
            </ul>
        </div>
    </div>
</div>
```

Un exemple complet et autonome, sans build, se trouve dans
[`examples/index.html`](examples/index.html).

---

## Alpine seul ou Alpine + Livewire

La bibliothèque est conçue pour les deux cas de figure.

### Alpine seul

```js
import Alpine from 'alpinejs';
import { install } from '@momoledev/alpine-magma-ui-component';
import '@momoledev/alpine-magma-ui-component/css';

install();                    // attend `alpine:init` si Alpine n'est pas encore là
window.Alpine = Alpine;
Alpine.start();
```

### Alpine embarqué par Livewire

Livewire 3 fournit son propre Alpine. On l'enregistre donc sur l'instance
existante :

```js
import { install } from '@momoledev/alpine-magma-ui-component';
import '@momoledev/alpine-magma-ui-component/css';

// Livewire est chargé par `@livewireScripts` : `window.Alpine` existe déjà
// au moment où ce module s'exécute.
install({ Alpine: window.Alpine });
```

Ou, si l'ordre n'est pas garanti, laissez `install()` faire le travail : elle
détecte `window.Alpine`, sinon s'inscrit sur `alpine:init`.

```js
install();   // couvre les deux cas
```

### Ce que la compatibilité Livewire implique

| Point | Traitement |
| --- | --- |
| Alpine déjà démarré | `install()` enregistre immédiatement, et publie aussi les fabriques en global pour que `x-data="magmaSelect({…})"` fonctionne sur du HTML monté plus tard. |
| `wire:navigate` | Les composants vivent sur l'élément : après une navigation Livewire, Alpine réinitialise l'état depuis `x-data`. Aucun code spécifique n'est requis. |
| Événements | Tous les événements sortants sont préfixés `magma-` et émis via `$dispatch`, donc écoutables avec `Livewire.on('magma-select:change', …)` et `$wire.on(…)`. |
| Entrées | `$wire.dispatch('magma-notify', {…})` ou `window.MagmaUI.notify({…})` alimentent la pile de notifications sans couplage. |
| Rendu serveur | Aucun composant n'exige le DOM au moment de l'évaluation de `x-data` : le chargement distant démarre à l'ouverture ou via `init()`. |
| Animations | Les animations d'entrée/sortie sont des **animations CSS**, jamais des `x-transition` : Alpine n'applique pas ces directives aux enfants d'un `x-for`, ce dont dépendent les notifications. |

---

## Chargement distant et « charger plus »

N'importe quel sélecteur accepte une URL à la place d'un tableau. Le composant
gère alors la recherche serveur temporisée, la pagination et la récupération des
pages suivantes.

```html
<div x-data="magmaSelect({
        url: '/api/countries',
        perPage: 25,
        valueKey: 'code',
        labelKey: 'name',
        searchParam: 'q',
        pageParam: 'page',
        debounce: 250,
        minChars: 2,
        loadMoreLabel: 'Charger plus de pays',
        mapResponse: (payload) => ({ items: payload.results, hasMore: payload.next !== null }),
    })">
```

### Contrat de réponse

Le composant accepte sans configuration :

```jsonc
// Tableau simple
[{ "value": "ci", "label": "Côte d'Ivoire" }]

// Objet avec pagination explicite
{ "data": [ … ], "hasMore": true }

// Pagination Laravel
{ "data": [ … ], "current_page": 1, "last_page": 4 }

// Pagination « total »
{ "data": [ … ], "total": 150, "current_page": 1 }
```

Pour tout autre format, `mapResponse(payload) → { items, hasMore }` prend le relais.

### Options de chargement distant

| Option | Défaut | Rôle |
| --- | --- | --- |
| `url` | `null` | Endpoint. Absent, le composant reste local. |
| `perPage` | `25` | Taille de page annoncée au serveur et utilisée pour déduire `hasMore`. |
| `pageParam` | `'page'` | Nom du paramètre de page. |
| `searchParam` | `'search'` | Nom du paramètre de recherche. |
| `debounce` | `250` | Temporisation avant de relancer une recherche (ms). |
| `minChars` | `0` | Longueur minimale avant d'envoyer la recherche. |
| `params` | `{}` ou `() => ({})` | Paramètres additionnels envoyés à chaque requête. |
| `fetchOptions` | `{}` | Fusionné dans l'appel `fetch` (en-têtes, `signal`, …). |
| `credentials` | `'same-origin'` | Politique de cookies. |
| `mapResponse` | – | Réécrit la réponse serveur. |
| `mapOption` | – | Réécrit chaque entrée. |
| `valueKey` / `labelKey` | `'value'` / `'label'` | Clés des entrées. |
| `loadOnOpen` | `true` | Charge la première page à l'ouverture. |
| `loadMoreLabel` | `'Charger plus'` | Libellé du bouton de pagination. |
| `onError` | `console.error` | Rappel en cas d'échec. |

### Déclencheurs

- **À l'ouverture** : la première page est demandée si `loadOnOpen` est actif.
- **À la saisie** : la recherche repart de la page 1 après `debounce`.
- **Au défilement** : `onListScroll($event)` sur la liste déclenche `loadMore()`
  quand il reste moins de 48 px à parcourir.
- **Au clic** : le bouton `.magma-select__more` appelle `loadMore()`.
- **Automatiquement** : si la première page ne remplit pas la hauteur visible,
  les pages suivantes sont enchaînées pour éviter une liste trop courte.

### Événements

| Événement | Détail |
| --- | --- |
| `magma-select:loaded` | `{ page, count, hasMore }` |
| `magma-select:error` | `{ message }` |
| `magma-select:change` | `{ value, option }` |

```js
document.addEventListener('magma-select:loaded', (event) => {
    console.log(event.detail.page, event.detail.count);
});
```

---

## Composants

Chaque composant dispose de sa propre documentation :

| Composant | Fabrique | Documentation |
| --- | --- | --- |
| Liste déroulante | `magmaSelect` | [docs/select.md](docs/select.md) |
| Sélection multiple | `magmaMultiSelect` | [docs/multi-select.md](docs/multi-select.md) |
| Indicatif téléphonique | `magmaPhonePrefix` | [docs/phone-prefix.md](docs/phone-prefix.md) |
| Fenêtre modale | `magmaModal` | [docs/modal.md](docs/modal.md) |
| Tiroir latéral | `magmaDrawer` | [docs/drawer.md](docs/drawer.md) |
| Feuille (bottom sheet) | `magmaSheet` | [docs/sheet.md](docs/sheet.md) |
| Panneau déroulant | `magmaDropdown` | [docs/dropdown.md](docs/dropdown.md) |
| Accordéon | `magmaAccordion` | [docs/accordion.md](docs/accordion.md) |
| Onglets | `magmaTabs` | [docs/tabs.md](docs/tabs.md) |
| Pagination | `magmaPagination` | [docs/pagination.md](docs/pagination.md) |
| Notifications | `magmaToasts` | [docs/toasts.md](docs/toasts.md) |
| Actualisation | `magmaRefresh` | [docs/refresh.md](docs/refresh.md) |
| Recherche | `magmaSearch` | [docs/search.md](docs/search.md) |
| Copie | `magmaCopy` | [docs/copy.md](docs/copy.md) |
| Interrupteur | `magmaSwitch` | [docs/switch.md](docs/switch.md) |
| Chargement distant | – | [docs/remote.md](docs/remote.md) |
| **Thème et variables CSS** | – | [docs/theming.md](docs/theming.md) |

### API globale

```js
import { notify } from '@momoledev/alpine-magma-ui-component';

notify({ type: 'success', title: 'Enregistré', message: 'Les modifications sont prises en compte.' });
```

`notify()` émet l'événement global `magma-notify`, écouté par le composant
`magmaToasts`. Elle est aussi disponible sous `window.MagmaUI.notify` dans le
bundle global, ce qui permet de l'appeler depuis un composant Livewire sans
importer quoi que ce soit.

---

## Personnalisation

Tout passe par des variables CSS — **aucune couleur n'est écrite en dur** dans la
feuille de style. Redéfinissez les jetons sur `:root`, ou sur n'importe quel
ancêtre des composants à thémer.

```css
.mon-theme {
    --magma-primary: #0a7d55;
    --magma-primary-hover: #086345;
    --magma-primary-soft: #e6f5ef;
    --magma-font: "Inter", system-ui, sans-serif;
    --magma-r-sm: 6px;
}
```

La liste complète des jetons (accent, états, gris, surfaces, contrastes,
typographie, rayons, élévations, mouvement, largeur des panneaux) et un
**exemple de thème sombre** se trouvent dans [docs/theming.md](docs/theming.md).

```html
<html data-theme="dark">
    <body class="magma-root">
        <!-- tous les composants suivent le thème -->
    </body>
</html>
```

Ajoutez la classe `magma-root` sur un conteneur pour bénéficier de la remise à
zéro locale (police, couleur, `box-sizing`) sans toucher au reste de la page.

### Largeur des panneaux déroulants

Les sélecteurs et les tiroirs acceptent une option `menuWidth` :

| Valeur | Effet |
| --- | --- |
| *(absente)* | Largeur par défaut de la feuille de style — `min(324px, calc(100vw - 48px))` pour un sélecteur, 240 px minimum pour un tiroir. |
| `'field'` | Le panneau prend **exactement la largeur du champ**. |
| `'auto'` | Le panneau s'ajuste à son contenu, sans jamais être plus étroit que le champ. |
| `320` | Largeur explicite en pixels. |
| `'20rem'` | Toute valeur acceptée par `width`. |

```html
<div class="magma-select"
     x-data="magmaSelect({ menuWidth: 'field', options: [ … ] })">
    <button class="magma-select__trigger" …></button>

    <!-- `menuStyle` pose la variable --magma-menu-width -->
    <div class="magma-select__menu" :style="menuStyle" x-show="open" …>
        …
    </div>
</div>
```

Sans JavaScript, les mêmes variantes existent en classes :
`magma-select__menu--field` et `magma-select__menu--auto`.

## Accessibilité

- Les déclencheurs sont de vrais `<button>` avec `aria-expanded` et
  `aria-haspopup="listbox"`.
- Les listes portent `role="listbox"` / `role="option"` et `aria-selected`.
- Navigation clavier : `↓` / `↑` déplacent la sélection, `Début` / `Fin` vont aux
  extrémités, `Entrée` valide, `Échap` ferme.
- La modale verrouille le défilement du document et se ferme avec `Échap`.
- `prefers-reduced-motion` neutralise les animations et transitions.
- Le focus est toujours visible (`:focus-visible`) et suit la couleur d'accent.

---

## Compatibilité

| Navigateur | Version |
| --- | --- |
| Chrome / Edge | ≥ 90 |
| Firefox | ≥ 90 |
| Safari | ≥ 15 |

Cibles ES2020. Aucun polyfill n'est nécessaire : `fetch`, `URL`,
`navigator.clipboard` (avec repli `execCommand`) et `CustomEvent` sont natifs sur
ces versions.

### Deux pièges d'Alpine à connaître

**1. Un déclencheur isolé a besoin de son propre `x-data`.** Au chargement,
Alpine n'initialise les directives que dans les portées `x-data`. Un `@click`
posé sur un élément statique qui n'est sous aucun `x-data` n'est jamais branché :
le clic ne fait rien, sans erreur en console. C'est le cas des boutons qui
ouvrent une modale, puisqu'ils sont forcément en dehors de sa portée.

```html
<!-- Le x-data est indispensable -->
<button x-data @click="$dispatch('magma-open', { name: 'edition' })">Modifier</button>
```

Un élément ajouté au DOM après coup (Alpine le voit via son observateur) est
initialisé même hors portée : le piège ne concerne que le HTML présent au
chargement.

**2. Préférez `cond ? 'classe' : ''` à `cond && 'classe'`.** Alpine 3.17 écrit la
valeur booléenne telle quelle dans l'attribut `class`, ce qui produit une classe
parasite `false` sur l'élément (`<div class="magma-toast false">`) absente en
3.15. Le ternaire renvoie une chaîne vide dans toutes les versions :
`scripts/fix-class-idioms.py` réécrit les attributs `:class` d'un fichier.

---

## Développement

```bash
npm run build     # génère dist/magma-ui.esm.js, dist/magma-ui.global.js et dist/magma-ui.css
```

Le générateur n'utilise que les modules natifs de Node : imports relatifs,
regroupement topologique, réécriture des `export`. Aucun transpileur, aucun
minifieur, aucun outil externe.

### Les styles viennent de l'application

`src/styles/magma-ui.css` est **généré** : la feuille de l'application
(`resources/css/new-design.css`, elle-même au pixel des maquettes) fait
référence, la bibliothèque en est la transposition exacte sous les noms
`magma-` (classes, variables et animations renommées ; l'accordéon reprend le
style de la FAQ, les onglets celui des filtres du tableau de bord).

```bash
python packages/magma-ui/scripts/generate-styles.py   # transposition
python packages/magma-ui/scripts/compare-styles.py    # contrôle de parité
npm run build
```

`compare-styles.py` vérifie qu'aucun sélecteur de composant ne manque et
qu'aucune déclaration ne diverge : il doit sortir sans écart. Corrigez toujours
le style dans l'application, jamais dans le fichier généré.

Parcourez [`examples/index.html`](examples/index.html) dans un navigateur pour
voir chaque composant en fonctionnement, y compris le chargement distant simulé.

Un mini projet Vite autonome, qui installe le paquet et sert de banc d'essai aux
15 composants, se trouve dans [`examples/mini-alpine`](examples/mini-alpine)
(`npm install && npm run dev`).

---

## Licence

MIT — voir [LICENSE](LICENSE).
