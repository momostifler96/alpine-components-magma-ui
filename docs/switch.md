# `magmaSwitch` — interrupteur

Bascule binaire : mode test et production, activation d'une option.

## Aperçu

```html
<button type="button" class="magma-switch" x-data="magmaSwitch({ on: true })"
        :class="on ? 'is-on' : ''" @click="toggle()"
        role="switch" :aria-checked="on" aria-label="Mode test">
    <span class="magma-switch__dot"></span>
</button>
```

## Options et méthodes

| Membre | Défaut | Rôle |
| --- | --- | --- |
| `on` | `false` | État. |
| `toggle()` | – | Bascule. |
| `set(value)` | – | Force l'état. |

## Événements

| Événement | Détail |
| --- | --- |
| `magma-switch:change` | `{ value }` |

## Accessibilité

- `role="switch"` et `aria-checked` sur l'élément interactif : le lecteur
  d'écran annonce « activé » ou « désactivé ».
