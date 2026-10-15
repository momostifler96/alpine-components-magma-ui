# `magmaTabs` — onglets

Bascule locale, sans navigation : filtres de graphique, sélecteur de période,
navigation à l'intérieur d'une même page.

## Aperçu

```html
<div class="magma-tabs" x-data="magmaTabs({ current: 'all' })" role="tablist" aria-label="Filtrer">
    <button type="button" class="magma-tab" role="tab"
            :class="is('all') && 'is-active'"
            :aria-selected="is('all')"
            @click="select('all')">Tout</button>

    <button type="button" class="magma-tab" role="tab"
            :class="is('payout') && 'is-active'"
            :aria-selected="is('payout')"
            @click="select('payout')">Payout</button>
</div>
```

## Options et méthodes

| Membre | Défaut | Rôle |
| --- | --- | --- |
| `current` | `null` | Onglet actif. |
| `select(tab)` | – | Active un onglet et émet l'événement. |
| `is(tab)` | – | Test d'activité. |

## Événements

| Événement | Détail |
| --- | --- |
| `magma-tabs:change` | `{ tab }` |

## Notes

- Pour naviguer entre des URL, utilisez de vrais liens : ces onglets ne changent
  pas l'adresse.
