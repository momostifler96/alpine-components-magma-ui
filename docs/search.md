# `magmaSearch` — champ de recherche

Temporisation, effacement et événements de soumission.

## Aperçu

```html
<div class="magma-search" x-data="magmaSearch({ live: true, debounce: 300 })">
    <input type="search" x-model="term" @input="onInput()" @keydown.enter="submit()"
           placeholder="Rechercher" aria-label="Rechercher" />
    <button type="button" class="magma-search__icon" @click="submit()" aria-label="Rechercher">🔍</button>
</div>
```

## Options

| Option | Défaut | Rôle |
| --- | --- | --- |
| `term` | `''` | Valeur initiale. |
| `live` | `false` | Émet `magma-search` après temporisation, à chaque frappe. |
| `debounce` | `300` | Temporisation, en millisecondes. |
| `busyDuration` | `500` | Durée de l'état `busy` après soumission. |

## État et méthodes

| Membre | Rôle |
| --- | --- |
| `term` | Saisie courante. |
| `busy` | Vrai juste après une soumission. |
| `clear()` | Vide le champ, et émet si `live`. |
| `submit()` | Émet `magma-search:submit`. |
| `onInput()` | Programme l'émission différée si `live`. |

## Événements

| Événement | Détail |
| --- | --- |
| `magma-search` | `{ term }` — différé, à chaque frappe. |
| `magma-search:submit` | `{ term }` — immédiat, sur Entrée ou clic. |

## Notes

- Avec Livewire, branchez `@magma-search.debounce.300ms="$wire.set('search', $event.detail.term)"`.
