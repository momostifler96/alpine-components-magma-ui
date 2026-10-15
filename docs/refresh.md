# `magmaRefresh` — bouton d'actualisation

Passe en état « en cours », exécute une action, puis notifie le résultat.

## Aperçu

```html
<button type="button" class="magma-btn magma-btn--ghost"
        x-data="magmaRefresh({ title: 'Mis à jour', message: 'Les taux ont été actualisés.' })"
        @click="run()"
        :disabled="spinning">
    <svg :class="spinning ? 'magma-spin' : ''" width="18" height="18" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
        <path d="M20.5 11.5A8.5 8.5 0 0 0 6.3 6.3L3.5 8.8"/>
        <path d="M3.5 4.5v4.3h4.3"/>
    </svg>
    Actualiser
</button>
```

## Options

| Option | Défaut | Rôle |
| --- | --- | --- |
| `action` | – | Fonction asynchrone exécutée au clic. Sans elle, une temporisation simulée. |
| `duration` | `900` | Durée simulée, en millisecondes. |
| `title` | – | Titre de la notification de fin. Sans titre, aucune notification. |
| `message` | `''` | Texte de la notification. |
| `type` | `'success'` | Type de la notification. |

## État, méthodes et événements

| Membre | Rôle |
| --- | --- |
| `spinning` | Vrai pendant l'exécution. |
| `run()` | Lance l'action. Les appels concurrents sont ignorés. |
| `magma-refresh:start` / `magma-refresh:done` | Bornes de l'exécution. |
