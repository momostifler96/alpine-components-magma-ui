# `magmaModal` — fenêtre modale

Verrouille le défilement du document, se ferme avec `Échap` ou au clic sur le
fond. Peut être ouverte à distance par événement.

## Aperçu

```html
<div class="magma-modal" x-data="magmaModal({ name: 'edition' })"
     x-show="open" x-cloak
     @magma-open.window="if ($event.detail.name === name) show()"
     @keydown.escape.window="hide()"
     role="dialog" aria-modal="true" aria-label="Modifier la fiche">

    <div class="magma-modal__backdrop" x-show="open"
         x-transition:enter="magma-fade-enter" x-transition:enter-start="magma-fade-enter-start"
         x-transition:leave="magma-fade-leave" x-transition:leave-end="magma-fade-leave-end"
         @click="hide()"></div>

    <div class="magma-modal__panel" x-show="open"
         x-transition:enter="magma-zoom-enter" x-transition:enter-start="magma-zoom-enter-start"
         x-transition:leave="magma-zoom-leave" x-transition:leave-end="magma-zoom-leave-end">

        <header class="magma-modal__head">
            <div>
                <h2 class="magma-modal__title">Modifier la fiche</h2>
                <p class="magma-modal__subtitle">Les champs marqués sont obligatoires.</p>
            </div>
            <button type="button" class="magma-modal__close" @click="hide()" aria-label="Fermer">×</button>
        </header>

        <div class="magma-modal__body">
            <!-- contenu -->
        </div>

        <footer class="magma-modal__foot">
            <button type="button" class="magma-btn magma-btn--neutral" @click="hide()">Annuler</button>
            <button type="button" class="magma-btn magma-btn--primary" @click="hide()">Enregistrer</button>
        </footer>
    </div>
</div>
```

## Ouverture

| Depuis | Code |
| --- | --- |
| Un bouton de la page | `@click="$dispatch('magma-open', { name: 'edition' })"` |
| Une autre portée Alpine | `$dispatch('magma-open', { name: 'edition' })` |
| Livewire | `$this->dispatch('magma-open', name: 'edition');` |

## Options

| Option | Défaut | Rôle |
| --- | --- | --- |
| `open` | `false` | État initial. |
| `name` | `null` | Identifiant, comparé à `$event.detail.name`. |
| `lockScroll` | `true` | Fige le défilement du document pendant l'ouverture. |

## Méthodes

| Méthode | Effet |
| --- | --- |
| `show()` | Ouvre et verrouille le défilement. |
| `hide()` | Ferme et rend le défilement. |
| `toggle()` | Bascule. |

## Événements

| Événement | Détail |
| --- | --- |
| `magma-modal:opened` | `{ name }` |
| `magma-modal:closed` | `{ name }` |

## Classes de taille

| Classe | Largeur maximale |
| --- | --- |
| *(défaut)* | 620 px |
| `magma-modal__panel--sm` | 460 px |
| `magma-modal__panel--lg` | 860 px |

## Structure du panneau

Le panneau est une colonne à **trois zones** :

| Zone | Défilement |
| --- | --- |
| `.magma-modal__head` | fixe — le titre reste visible pendant la lecture |
| `.magma-modal__body` | **seule zone défilante** |
| `.magma-modal__foot` | fixe — les actions restent accessibles |

Le panneau lui-même porte `overflow: hidden` : c'est le corps qui défile. Un
panneau qui défile en entier emporterait son titre avec le contenu, et le titre
passerait sous le premier champ.

### Menus déroulants dans une modale

Un menu en `position: absolute` serait rogné par le corps défilant. Les
sélecteurs règlent le problème par défaut : ils posent leur panneau en
`position: fixed` et le repositionnent au défilement (`floating`, actif par
défaut). Aucune configuration n'est nécessaire.

## Accessibilité

- `role="dialog"` et `aria-modal="true"` sur le conteneur.
- `aria-label` ou `aria-labelledby` doit décrire la fenêtre.
- `Échap` ferme ; le clic sur le fond ferme.
- Le défilement du document est restauré à la fermeture, même si la fenêtre est
  fermée par un autre chemin.

## Notes

- Le conteneur est monté en permanence dans le DOM (`x-show`), ce qui préserve
  l'état des champs entre deux ouvertures. Pour repartir d'un formulaire vierge,
  réinitialisez les champs dans un `@magma-modal:closed.window`.
- Plusieurs modales peuvent cohabiter : `name` les distingue.
