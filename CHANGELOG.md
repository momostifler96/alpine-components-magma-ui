# Journal des versions

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le
versionnage suit [SemVer](https://semver.org/lang/fr/).

## 1.0.0 — 2026-10-15

Première version publiée sous le nom `@momoledev/alpine-magma-ui-component`.

### Composants

- `magmaSelect` — liste déroulante à sélection unique, locale ou distante, avec
  recherche, pagination et « charger plus ».
- `magmaMultiSelect` — sélection multiple, sélection globale, compteur.
- `magmaPhonePrefix` — indicatif téléphonique, recherche par pays, indicatif ou
  région, effacement du numéro.
- `magmaModal` — modale avec verrouillage du défilement, fermeture par `Échap` et
  par clic sur le fond, ouverture à distance par `magma-open`.
- `magmaDropdown` — panneau déroulant, base des menus de barre supérieure.
- `magmaAccordion` — accordéon à ouverture unique.
- `magmaTabs` — onglets locaux.
- `magmaPagination` — compteur, saut direct, numéros calculés.
- `magmaToasts` — pile de notifications pilotée par l'événement global
  `magma-notify`.
- `magmaRefresh` — bouton d'actualisation avec état d'exécution.
- `magmaSearch` — recherche avec temporisation et événements de soumission.
- `magmaCopy` — copie dans le presse-papiers avec repli `execCommand`.
- `magmaSwitch` — interrupteur accessible.

### Mécanique partagée

- `createRemoteState` — chargement AJAX, recherche serveur temporisée, pagination
  et « charger plus » au défilement.
- `normalizeResponse` — prise en charge des tableaux simples, de `hasMore`, de la
  pagination Laravel et de la pagination par total.
- `emit` — émission d'événements tolérante à l'absence d'Alpine (tests, Node).

### Thème

- Palette complète de variables CSS : accent, états, gris, surfaces, contrastes,
  typographie, rayons, élévations, mouvement et largeur des panneaux. **Aucune
  couleur en dur** ne subsiste dans la feuille de style.
- `--magma-focus` est calculé à partir de `--magma-focus-ring`.
- Exemple de thème sombre et référence complète dans `docs/theming.md`.

### Largeur des panneaux

- Nouvelle option `menuWidth` sur `magmaSelect`, `magmaMultiSelect`,
  `magmaPhonePrefix` et `magmaDropdown` : `'field'` (largeur du champ), `'auto'`
  (largeur du contenu, jamais plus étroit que le champ), un nombre de pixels ou
  toute valeur CSS.
- Les getters `menuStyle` et les classes `magma-select__menu--field` /
  `--auto` couvrent les usages avec et sans JavaScript.

### Corrections

- **Modale** : le panneau est désormais une colonne à trois zones — en-tête et
  pied fixes, corps seul défilant. Le titre ne part plus avec le contenu.
- **Menus déroulants** : positionnement flottant (`floating`, actif par défaut).
  Le panneau est posé dans le repère de la fenêtre et suit son déclencheur au
  défilement, au redimensionnement et au changement de taille. Il n'est plus
  rogné par les `overflow` d'une modale, d'une carte ou d'une cellule, et bascule
  au-dessus du champ quand la place manque en dessous.


- Les notifications s'animent de nouveau : l'entrée et la sortie sont des
  animations CSS pilotées par l'état (`is-leaving`), car Alpine n'applique pas
  les directives `x-transition` portées par les enfants d'un `x-for`. La
  documentation ne recommandait plus ce motif.

### Points notables

- Aucune dépendance d'exécution ; Alpine est une `peerDependency` optionnelle.
- Enregistrement compatible avec Alpine seul **et** avec Alpine embarqué par
  Livewire, quel que soit l'ordre de chargement.
- Feuille de style autonome, pilotée par variables CSS, préfixe `magma-`.
- Le panneau des sélecteurs sépare la recherche, la liste et le pied : la
  recherche reste visible pendant que seule la liste défile.
