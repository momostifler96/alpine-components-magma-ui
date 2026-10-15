# `magmaToasts` — notifications flottantes

Pile de messages éphémères, pilotée par un événement global : n'importe quelle
partie de l'application peut notifier sans connaître la pile.

## Aperçu

```html
<div class="magma-toasts" x-data="magmaToasts({ duration: 5000 })"
     @magma-notify.window="push($event.detail)"
     aria-live="polite" aria-atomic="false">

    <template x-for="toast in items" :key="toast.id">
        <!-- `toast.leaving` déclenche l'animation de sortie ; la notification
             est retirée du tableau une fois l'animation jouée. -->
        <div class="magma-toast" :class="[`magma-toast--${toast.type}`, toast.leaving ? 'is-leaving' : '']">
            <span class="magma-toast__icon">!</span>
            <span style="min-width:0">
                <span class="magma-toast__title" x-text="toast.title"></span>
                <span class="magma-toast__text" x-text="toast.message"></span>
            </span>
            <button type="button" class="magma-modal__close" @click="remove(toast.id)" aria-label="Fermer">×</button>
        </div>
    </template>
</div>
```

## Déclenchement

| Depuis | Code |
| --- | --- |
| Alpine | `$dispatch('magma-notify', { type: 'success', title: 'Enregistré' })` |
| Livewire | `$this->dispatch('magma-notify', type: 'success', title: 'Enregistré');` |
| JavaScript | `import { notify } from '@momoledev/alpine-magma-ui-component'; notify({ … })` |
| Sans bundler | `window.MagmaUI.notify({ … })` |

## Charge utile

| Champ | Défaut | Rôle |
| --- | --- | --- |
| `type` | `info` | `success`, `error`, `warning` ou `info`. |
| `title` | `''` | Titre en gras. |
| `message` | `''` | Texte secondaire. |
| `duration` | valeur de l'option | Durée d'affichage en ms ; `0` pour un message permanent. |

## Options et méthodes

| Membre | Défaut | Rôle |
| --- | --- | --- |
| `duration` | `5000` | Durée d'affichage par défaut, en millisecondes. |
| `leaveDuration` | `200` | Délai avant retrait effectif, aligné sur l'animation de sortie. |
| `push(payload)` | – | Ajoute une notification et renvoie son identifiant. |
| `remove(id)` | – | Retire une notification. |
| `clear()` | – | Vide la pile. |

## Animation

L'entrée et la sortie sont des **animations CSS**, pas des transitions Alpine :

- `.magma-toast` joue `magma-toast-in` (260 ms) à l'insertion ;
- `remove()` marque la notification `leaving` — ce qui applique `.is-leaving` et
  joue `magma-toast-out` (200 ms) — puis la retire du tableau.

Ce détour est nécessaire : Alpine n'applique pas les directives `x-transition`
portées par les enfants d'un `x-for` (les clones sont insérés et retirés sans
passer par le moteur de transition). L'option `leaveDuration` (200 ms par défaut)
doit rester alignée sur la durée de l'animation de sortie.

## Accessibilité

- `aria-live="polite"` : les messages sont annoncés sans interrompre la lecture.
- Le bouton de fermeture porte un `aria-label`.
- `prefers-reduced-motion` neutralise l'animation d'entrée.
