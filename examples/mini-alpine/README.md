# Mini projet Alpine — Magma UI

Banc d'essai autonome des 15 composants du paquet, avec Vite et une API paginée
locale. Le paquet est installé depuis le dépôt (`file:../..`) et importé comme
n'importe quelle dépendance npm.

## Lancer

```bash
cd examples/mini-alpine
npm install
npm run dev
```

Ouvrir <http://127.0.0.1:5173/>.

L'API de démonstration est servie par Vite : `/api/countries?page=1&per_page=8&q=…`.
Aucun service externe n'est nécessaire.

## Ce qui est vérifié

| Composant | Scénario |
| --- | --- |
| `magmaSelect` local | ouverture, recherche « séné », sélection au clavier (`Entrée`), fermeture |
| `magmaSelect` distant | chargement de la page 1, « charger plus », recherche serveur, sélection |
| `magmaMultiSelect` | ajout cumulatif, « tout sélectionner » limité au filtre, recherche réinitialisée, navigation clavier, `Échap` |
| `magmaPhonePrefix` | recherche par pays, choix de l'indicatif, effacement du numéro |
| `magmaModal` | ouverture par `magma-open`, verrouillage du défilement, `Échap`, confirmation + notification |
| `magmaDrawer` | ouverture depuis le bord droit, voile, focus, `Échap`, transition latérale |
| `magmaSheet` | ouverture depuis le bas, glisser-fermer, retour élastique, transitions |
| `magmaDropdown` | ouverture, positionnement `fixed`, fermeture au clic extérieur |
| `magmaAccordion` | une seule section ouverte, `aria-expanded`, animation de disclosure sans greffon |
| `magmaTabs` | changement d'onglet, `aria-selected` |
| `magmaPagination` | page suivante, saut direct à la page 10, compteur |
| `magmaToasts` | notification via `MagmaUI.notify()` et via événement |
| `magmaRefresh` | état `spinning`, bouton désactivé, notification de fin |
| `magmaSearch` | temporisation, soumission `Entrée`, effacement |
| `magmaCopy` | copie, retour « Copié ! », événement `magma-copy:done` |
| `magmaSwitch` | bascule, `aria-checked`, état visuel `is-on` |

Le journal en bas de page affiche tous les événements `magma-*` émis. La console
doit rester vide (erreurs et avertissements compris).

## Installation utilisée

```js
import Alpine from 'alpinejs';
import { install } from '@momoledev/alpine-magma-ui-component';
import '@momoledev/alpine-magma-ui-component/css';

install();
window.Alpine = Alpine;
Alpine.start();
```

`install()` s'enregistre sur `alpine:init` lorsque Alpine n'a pas encore démarré.
Le paquet expose les 13 fabriques sur `window` et `window.MagmaUI`.

## Notes de test

- Le paquet a aussi été vérifié via `npm pack` puis installé dans un projet
  vierge : les bundles `dist/` et les 15 composants sont présents.
- Défauts corrigés pendant la mise en place de ce banc d'essai :
  - `magmaMultiSelect` manquait dans le registre des composants ;
  - le multi-select n'avait ni navigation clavier ni réinitialisation de la
    recherche, et « tout sélectionner » ignorait le filtre ;
  - `.magma-select__menu` n'était pas une colonne flex, ce qui faisait défiler
    toute la recherche et enchaînait toutes les pages distantes ;
  - l'état `is-on` de `magmaSwitch` n'avait aucun style ;
  - les disclosures n'avaient pas d'animation sans `x-collapse`.
