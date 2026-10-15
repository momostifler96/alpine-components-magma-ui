# `magmaDropdown` — panneau déroulant

Base commune des menus de barre supérieure : notifications, sélecteur de compte,
sélecteur de langue.

## Aperçu

```html
<div class="magma-dropdown" x-data="magmaDropdown()" @click.outside="close()">
    <button type="button" class="magma-btn magma-btn--ghost" x-ref="trigger" @click="toggle()" :aria-expanded="open">
        Mon compte
    </button>

    <div class="magma-menu" x-ref="menu" :style="menuStyle" x-show="open" x-cloak role="menu"
         x-transition:enter="magma-fade-enter" x-transition:enter-start="magma-fade-enter-start"
         x-transition:leave="magma-fade-leave" x-transition:leave-end="magma-fade-leave-end">
        <a href="/profil" class="magma-menu__item">Mon profil</a>
        <div class="magma-menu__sep"></div>
        <button type="button" class="magma-menu__item" @click="close()">Se déconnecter</button>
    </div>
</div>
```


> **Deux références sont nécessaires** pour le positionnement flottant :
> `x-ref="trigger"` sur le bouton et `x-ref="menu"` sur le panneau. Sans elles,
> le panneau retombe sur le positionnement absolu de la feuille de style.

## Options et méthodes

| Membre | Défaut | Rôle |
| --- | --- | --- |
| `open` | `false` | État du panneau. |
| `toggle()` | – | Bascule et émet l'événement. |
| `show()` / `close()` | – | Ouverture et fermeture explicites. |
| `menuWidth` | `null` | Largeur du tiroir : `'field'`, `'auto'`, un nombre de pixels ou une valeur CSS. |
| `floating` | `true` | Pose le panneau dans le repère de la fenêtre (`position: fixed`) : il échappe ainsi aux `overflow` de ses ancêtres — modale, carte, cellule de tableau. |

## Événements

| Événement | Détail |
| --- | --- |
| `magma-dropdown:change` | `{ open }` |

## Classes

| Classe | Rôle |
| --- | --- |
| `magma-menu` | Panneau aligné à droite du déclencheur. |
| `magma-menu--left` | Alignement à gauche. |
| `magma-menu__item` | Ligne cliquable. |
| `magma-menu__item.is-active` | Ligne courante. |
| `magma-menu__sep` | Séparateur. |

## Notes

- Pensez toujours à `@click.outside="close()"` sur le conteneur.
- Plusieurs panneaux peuvent cohabiter : chacun a sa propre portée Alpine.
