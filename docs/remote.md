# Chargement distant et « charger plus »

Mécanique partagée par `magmaSelect`, `magmaMultiSelect` et `magmaPhonePrefix`.
Elle est également exportable seule (`createRemoteState`) pour l'intégrer à un
composant maison.

## Principe

Un composant devient distant dès qu'on lui passe une `url`. La mécanique gère :

1. la **première page** à l'ouverture (`loadOnOpen`) ;
2. la **recherche serveur** après temporisation (`debounce`) et à partir d'un
   nombre minimal de caractères (`minChars`) ;
3. la **page suivante** au défilement (`onListScroll`), au clic (`loadMore`) ou
   automatiquement si la liste ne remplit pas le panneau (`checkOverflow`) ;
4. la **déduplication** des pages : chaque réponse est concaténée à la précédente,
   sauf en cas de rechargement (`reset`).

## Requête émise

```
GET /api/countries?page=2&q=sen&active=1
```

- `page` : nommé par `pageParam` ;
- `q` : nommé par `searchParam`, envoyé seulement si la saisie atteint `minChars` ;
- les clés de `params` sont ajoutées telles quelles (les valeurs vides sont ignorées).

Les en-têtes par défaut sont `Accept: application/json`. Ajoutez les vôtres par
`fetchOptions` :

```js
x-data="magmaSelect({
    url: '/api/countries',
    fetchOptions: { headers: { 'X-Team': 'ops' }, signal: controller.signal },
    credentials: 'include',
})"
```

## Contrat de réponse

```jsonc
// 1. Tableau simple — « plein » ⇒ il reste des pages, « incomplet » ⇒ fin de liste
[{ "value": "ci", "label": "Côte d'Ivoire" }]

// 2. Pagination explicite
{ "data": [ … ], "hasMore": true }

// 3. Pagination Laravel
{ "data": [ … ], "current_page": 1, "last_page": 4 }

// 4. Pagination par total
{ "data": [ … ], "total": 150, "current_page": 1 }
```

Autre format :

```js
mapResponse: (payload) => ({
    items: payload.results,
    hasMore: payload.next !== null,
}),
```

## Renommage des entrées

```js
x-data="magmaSelect({
    url: '/api/countries',
    valueKey: 'code',
    labelKey: 'name',
})"
```

Ou, pour un format vraiment différent :

```js
mapOption: (entry) => ({ value: entry.id, label: entry.attributes.name, extra: entry })
```

Les propriétés supplémentaires survivent dans l'objet d'option, donc
`option.extra` reste accessible dans le `template`.

## Options complètes

| Option | Défaut | Rôle |
| --- | --- | --- |
| `url` | `null` | Endpoint. Absent, le composant reste local. |
| `perPage` | `25` | Taille de page, utilisée pour déduire `hasMore` d'un tableau. |
| `pageParam` | `'page'` | Nom du paramètre de page. |
| `searchParam` | `'search'` | Nom du paramètre de recherche. |
| `debounce` | `250` | Temporisation de recherche (ms). |
| `minChars` | `0` | Longueur minimale de la recherche envoyée. |
| `params` | `{}` ou `() => ({})` | Paramètres additionnels. |
| `fetchOptions` | `{}` | Fusionné dans `fetch`. |
| `credentials` | `'same-origin'` | Cookies. |
| `headers` | `{}` | En-têtes additionnels. |
| `mapResponse` | – | `(payload) => ({ items, hasMore })`. |
| `mapOption` | – | `(entry) => ({ value, label, … })`. |
| `valueKey` / `labelKey` | `'value'` / `'label'` | Clés par défaut. |
| `loadOnOpen` | `true` | Charge à l'ouverture. |
| `onError` | `console.error` | Rappel d'échec : `(error, scope)`. |

## État et méthodes

| Membre | Rôle |
| --- | --- |
| `loading` | Requête en cours. |
| `error` | Message d'erreur, ou `null`. |
| `hasMore` | Reste-t-il une page ? |
| `loaded` | Au moins une page a été chargée. |
| `page` | Page courante. |
| `load(reset = false)` | Charge la page courante, ou repart de 1 si `reset`. |
| `loadMore()` | Incrémente `page` puis charge. |
| `onListScroll(event)` | À brancher sur `@scroll` de la liste. |
| `checkOverflow()` | Enchaîne les pages si la liste est trop courte. |

## Avec Livewire

Le composant n'impose rien côté serveur : exposez une route JSON qui renvoie l'un
des formats ci-dessus.

```php
Route::get('/api/countries', function (Request $request) {
    $countries = Country::query()
        ->when($request->filled('q'), fn ($query) => $query->where('name', 'like', $request->q . '%'))
        ->orderBy('name')
        ->paginate(25);

    return response()->json([
        'data' => $countries->items(),
        'current_page' => $countries->currentPage(),
        'last_page' => $countries->lastPage(),
    ]);
});
```

Pour rafraîchir la liste depuis un composant Livewire :

```php
$this->dispatch('magma-select-reset');   // écouté côté client si vous le branchez
```

Le plus simple reste de changer la valeur de `url` ou de forcer un rechargement
avec `$dispatch('magma-select:reload')` sur un écouteur dédié à votre application.
