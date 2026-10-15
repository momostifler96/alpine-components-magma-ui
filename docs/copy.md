# `magmaCopy` — copie dans le presse-papiers

Utilise `navigator.clipboard` et retombe sur `execCommand` hors contexte sécurisé.

## Aperçu

```html
<button type="button" class="magma-btn magma-btn--ghost"
        x-data="magmaCopy({ value: 'sk_live_51N8xQ2…' })"
        @click="copy()">
    <span x-text="copied ? 'Copié !' : 'Copier la clé'"></span>
</button>
```

## Options et méthodes

| Membre | Défaut | Rôle |
| --- | --- | --- |
| `value` | `''` | Texte à copier. |
| `copied` | `false` | Vrai pendant le retour visuel. |
| `feedbackDuration` | `1600` | Durée du retour, en millisecondes. |
| `copy(value?)` | – | Copie la valeur fournie, ou `value`. |

## Événements

| Événement | Détail |
| --- | --- |
| `magma-copy:done` | `{ value }` |

## Notes

- `copy('autre texte')` permet de copier une valeur différente de celle affichée.
- Le repli crée un `<textarea>` hors écran, le temps de la copie.
