# Thème et variables

Toute l'apparence passe par des variables CSS. Aucune couleur n'est écrite en
dur dans la feuille de style : redéfinir ces jetons suffit à créer un thème
complet, sans toucher au JavaScript.

```css
/* Sur :root pour toute la page, ou sur un conteneur pour un thème local. */
.mon-theme {
    --magma-orange: #0a7d55;
    --magma-orange-hover: #086345;
    --magma-orange-soft: #e6f5ef;
    --magma-orange-tint: #c9e9dd;
    --magma-orange-ghost: #f1faf6;
    --magma-font: "Inter", system-ui, sans-serif;
}
```

## Accent

| Variable | Défaut | Usage |
| --- | --- | --- |
| `--magma-orange` | `#ff6602` | Couleur d'accent : boutons pleins, onglet actif, cases cochées, puces. |
| `--magma-orange-hover` | `#e85c00` | Survol de l'accent. |
| `--magma-orange-active` | `#cc5200` | Appui. |
| `--magma-orange-soft` | `#ffece0` | Fond des boutons secondaires, ligne sélectionnée. |
| `--magma-orange-tint` | `#ffdbc4` | Survol des fonds doux. |
| `--magma-orange-ghost` | `#fff0e8` | Page courante de la pagination. |

## États

| Variable | Défaut | Usage |
| --- | --- | --- |
| `--magma-yellow` | `#ffde54` | Bouton jaune, graphique « Payin ». |
| `--magma-yellow-soft` | `#fff0b2` | Fond des actions douces jaunes. |
| `--magma-yellow-badge` | `#ffff99` | Badge « en cours » ou « en attente ». |
| `--magma-yellow-badge-ink` | `#666600` | Texte de ce badge. |
| `--magma-yellow-ink` | `#332900` | Texte sur jaune. |
| `--magma-green` | `#12b312` | Badge « succès », graphique « BaaS ». |
| `--magma-green-ink` | `#0a7a0a` | Texte vert sur fond clair. |
| `--magma-green-soft` | `#e0efe0` | Fond vert clair. |
| `--magma-green-tint` | `#edfff7` | Pastille « Test ». |
| `--magma-green-dot` | `#00bf6f` | Point animé de la pastille. |
| `--magma-blue` | `#3d3dff` | Badge « actif », icône de notification. |
| `--magma-blue-soft` | `#ebebff` | Fond bleu clair. |
| `--magma-blue-mid` | `#ccccff` | Badge de rôle « développeur ». |
| `--magma-pink` | `#ffccd3` | Badge d'échec ou d'ouverture. |
| `--magma-pink-ink` | `#cc001b` | Texte sur rose. |
| `--magma-red` | `#e60023` | Compteur de notifications. |

## Gris et texte

| Variable | Défaut | Usage |
| --- | --- | --- |
| `--magma-gray-soft` | `#e6e6e6` | Badge « expiré ». |
| `--magma-gray-ink` | `#999999` | Texte de ce badge. |
| `--magma-ink` | `#000000` | Texte principal. |
| `--magma-title` | `#1a1a1a` | Titres. |
| `--magma-body` | `#404040` | Texte courant. |
| `--magma-muted` | `#808080` | Texte secondaire. |
| `--magma-placeholder` | `#bcbcbc` | Texte indicatif des champs. |

## Surfaces et contrastes

| Variable | Défaut | Usage |
| --- | --- | --- |
| `--magma-surface` | `#ffffff` | Fond des cartes, panneaux et champs. |
| `--magma-page` | `#fafafa` | Fond de page. |
| `--magma-line` | `#e6e6e6` | Bordures. |
| `--magma-line-soft` | `#f2f2f2` | Séparateurs discrets, survols. |
| `--magma-on-accent` | `#ffffff` | Texte posé sur l'accent. |
| `--magma-on-dark` | `#ffffff` | Texte posé sur fond sombre. |
| `--magma-overlay` | `rgba(26,26,26,.45)` | Voile derrière une modale. |
| `--magma-scrollbar` | `#d7d7d7` | Curseur de défilement des listes. |
| `--magma-focus-ring` | `rgba(255,102,2,.18)` | Couleur de l'anneau de focus. |
| `--magma-focus` | `0 0 0 3px var(--magma-focus-ring)` | Anneau complet, composé à partir de la ligne précédente. |
| `--magma-accent-glow` | `rgba(255,102,2,.28)` | Ombre portée d'un bouton plein au survol. |
| `--magma-accent-halo` | `rgba(255,102,2,.12)` | Ombre légère sous un champ actif. |

Si vous changez `--magma-orange`, pensez à ajuster `--magma-focus-ring`, `--magma-accent-glow` et `--magma-accent-halo` : ce sont des `rgba()` indépendants, ils ne se recalculent pas tout seuls.

## Typographie et formes

| Variable | Défaut |
| --- | --- |
| `--magma-font` | `"Montserrat", system-ui, …` |
| `--magma-font-mono` | `ui-monospace, …` |
| `--magma-r-sm` · `--magma-r-md` · `--magma-r-lg` · `--magma-r-xl` | `8px` · `12px` · `16px` · `20px` |
| `--magma-r-pill` | `999px` |

## Élévations et mouvement

| Variable | Défaut |
| --- | --- |
| `--magma-shadow-sm` · `--magma-shadow-md` · `--magma-shadow-lg` | ombres croissantes |
| `--magma-fast` · `--magma-base` · `--magma-slow` | `140ms` · `220ms` · `420ms` |
| `--magma-ease` · `--magma-ease-out` | courbes d'animation |

## Largeur des panneaux

| Variable | Défaut | Usage |
| --- | --- | --- |
| `--magma-menu-width` | `min(324px, calc(100vw - 48px))` | Largeur d'un panneau déroulant. Posée automatiquement par l'option `menuWidth`, ou à la main. |
| `--magma-menu-min-width` | `240px` · `0` | Largeur minimale du tiroir d'une part, des menus de sélecteur d'autre part. |
| `--magma-menu-min-width` | `240px` | Largeur minimale du tiroir (`magmaDropdown`). |

## Menus flottants

Les panneaux de sélecteur sont posés en `position: fixed` (`floating: true` par
défaut) pour échapper aux `overflow` de leurs ancêtres. Conséquence à connaître :
dans ce mode, **un pourcentage de largeur se résout contre la fenêtre**, pas
contre le champ. Le composant fige donc la largeur du déclencheur en pixels.
Si vous fournissez vous-même une largeur (`menuWidth: '50%'`), elle sera
interprétée comme un pourcentage de la fenêtre.

## Exemple : thème sombre

```css
[data-theme="dark"] {
    --magma-surface: #16181d;
    --magma-page: #0e1013;
    --magma-line: #2a2e36;
    --magma-line-soft: #1e2127;

    --magma-ink: #f5f6f8;
    --magma-title: #f5f6f8;
    --magma-body: #c9ccd2;
    --magma-muted: #8b9099;
    --magma-placeholder: #6b7078;

    --magma-overlay: rgba(0, 0, 0, 0.65);
    --magma-scrollbar: #363b44;

    /* L'accent reste vif sur fond sombre. */
    --magma-orange-soft: #33241a;
    --magma-orange-tint: #4a3423;
    --magma-orange-ghost: #2a1d14;

    --magma-blue-soft: #1e2140;
    --magma-green-soft: #14281a;
    --magma-pink: #401c22;
    --magma-pink-ink: #ff8b9c;
    --magma-gray-soft: #2a2e36;
}
```

```html
<html data-theme="dark">
    <body class="magma-root">
        <!-- tous les composants suivent -->
    </body>
</html>
```

## Bonnes pratiques

- Posez `magma-root` sur un conteneur : la mise à zéro locale (police, couleur,
  `box-sizing`) s'applique alors sans toucher au reste de la page.
- Un thème peut être limité à une sous-arborescence : déclarez les variables sur
  n'importe quel ancêtre des composants à thémer.
- Les variables sont toutes préfixées `magma-` : aucun risque de collision avec
  votre propre système de jetons.
- `prefers-reduced-motion` neutralise animations et transitions ; inutile de le
  gérer vous-même.
