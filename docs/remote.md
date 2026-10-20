# Remote loading and "load more"

Mechanic shared by `magmaSelect`, `magmaMultiSelect` and `magmaPhonePrefix`. It
can also be exported standalone (`createRemoteState`) to integrate into a custom
component.

## Principle

A component becomes remote as soon as it is given a `url`. The mechanic handles:

1. the **first page** on open (`loadOnOpen`);
2. **server-side search** after debouncing (`debounce`) and from a minimum number
   of characters (`minChars`);
3. the **next page** on scroll (`onListScroll`), on click (`loadMore`) or
   automatically if the list doesn't fill the panel (`checkOverflow`);
4. **page deduplication**: each response is concatenated with the previous one,
   except on reload (`reset`).

## Issued request

```
GET /api/countries?page=2&q=sen&active=1
```

- `page`: named by `pageParam`;
- `q`: named by `searchParam`, sent only if the input reaches `minChars`;
- the `params` keys are added as-is (empty values are ignored).

The default headers are `Accept: application/json`. Add yours via
`fetchOptions`:

```js
x-data="magmaSelect({
    url: '/api/countries',
    fetchOptions: { headers: { 'X-Team': 'ops' }, signal: controller.signal },
    credentials: 'include',
})"
```

## Response contract

```jsonc
// 1. Plain array — "full" ⇒ pages remain, "incomplete" ⇒ end of list
[{ "value": "ci", "label": "Côte d'Ivoire" }]

// 2. Explicit pagination
{ "data": [ … ], "hasMore": true }

// 3. Laravel pagination
{ "data": [ … ], "current_page": 1, "last_page": 4 }

// 4. Pagination by total
{ "data": [ … ], "total": 150, "current_page": 1 }
```

Another format:

```js
mapResponse: (payload) => ({
    items: payload.results,
    hasMore: payload.next !== null,
}),
```

## Renaming entries

```js
x-data="magmaSelect({
    url: '/api/countries',
    valueKey: 'code',
    labelKey: 'name',
})"
```

Or, for a genuinely different format:

```js
mapOption: (entry) => ({ value: entry.id, label: entry.attributes.name, extra: entry })
```

Extra properties survive in the option object, so `option.extra` remains
accessible in the `template`.

## Full options

| Option | Default | Role |
| --- | --- | --- |
| `url` | `null` | Endpoint. When absent, the component stays local. |
| `perPage` | `25` | Page size, used to infer `hasMore` from an array. |
| `pageParam` | `'page'` | Name of the page parameter. |
| `searchParam` | `'search'` | Name of the search parameter. |
| `debounce` | `250` | Search debounce (ms). |
| `minChars` | `0` | Minimum length of the sent search. |
| `params` | `{}` or `() => ({})` | Additional parameters. |
| `fetchOptions` | `{}` | Merged into `fetch`. |
| `credentials` | `'same-origin'` | Cookies. |
| `headers` | `{}` | Additional headers. |
| `mapResponse` | – | `(payload) => ({ items, hasMore })`. |
| `mapOption` | – | `(entry) => ({ value, label, … })`. |
| `valueKey` / `labelKey` | `'value'` / `'label'` | Default keys. |
| `loadOnOpen` | `true` | Loads on open. |
| `onError` | `console.error` | Failure callback: `(error, scope)`. |

## State and methods

| Member | Role |
| --- | --- |
| `loading` | Request in progress. |
| `error` | Error message, or `null`. |
| `hasMore` | Is there another page? |
| `loaded` | At least one page has been loaded. |
| `page` | Current page. |
| `load(reset = false)` | Loads the current page, or restarts from 1 if `reset`. |
| `loadMore()` | Increments `page` then loads. |
| `onListScroll(event)` | To wire onto the list's `@scroll`. |
| `checkOverflow()` | Chains pages if the list is too short. |

## With Livewire

The component imposes nothing on the server side: expose a JSON route that
returns one of the formats above.

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

To refresh the list from a Livewire component:

```php
$this->dispatch('magma-select-reset');   // listened to client-side if you wire it
```

The simplest is to change the `url` value or force a reload with
`$dispatch('magma-select:reload')` on a listener dedicated to your application.
