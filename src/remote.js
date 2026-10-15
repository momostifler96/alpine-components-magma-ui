import { emit } from './emit.js';

/**
 * Chargement distant et pagination « charger plus ».
 *
 * Ce module ne dépend de rien : la récupération passe par `fetch`, et le
 * résultat peut être fourni par n'importe quelle source — API REST, endpoint
 * Livewire, ou tableau local. Les composants qui en ont besoin composent leur
 * état avec `createRemoteState()`.
 *
 * Contrat de réponse accepté :
 *   - un tableau : les données, sans pagination connue ;
 *   - { data: [...], hasMore: bool } ;
 *   - { data: [...], lastPage: n, currentPage: n } ;
 *   - toute autre forme via l'option `mapResponse`.
 */

/**
 * Normalise une réponse serveur en { items, hasMore }.
 */
export function normalizeResponse(payload, config = {}) {
    if (typeof config.mapResponse === 'function') {
        const mapped = config.mapResponse(payload);

        return {
            items: Array.isArray(mapped?.items) ? mapped.items : [],
            hasMore: Boolean(mapped?.hasMore),
        };
    }

    if (Array.isArray(payload)) {
        // Un tableau plein laisse supposer qu'il reste des pages ; un tableau
        // incomplet signifie qu'on est au bout.
        const perPage = config.perPage ?? payload.length;

        return { items: payload, hasMore: payload.length >= perPage && payload.length > 0 };
    }

    const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.items) ? payload.items : [];

    let hasMore = false;

    if (typeof payload?.hasMore === 'boolean') {
        hasMore = payload.hasMore;
    } else if (typeof payload?.last_page === 'number' && typeof payload?.current_page === 'number') {
        hasMore = payload.current_page < payload.last_page;
    } else if (typeof payload?.lastPage === 'number' && typeof payload?.currentPage === 'number') {
        hasMore = payload.currentPage < payload.lastPage;
    } else if (typeof payload?.total === 'number') {
        hasMore = items.length > 0 && (payload.current_page ?? 1) * (config.perPage ?? items.length) < payload.total;
    }

    return { items, hasMore };
}

/**
 * Extrait la valeur et le libellé d'une entrée, quel que soit le nom des clés.
 */
export function mapOption(entry, config = {}) {
    if (typeof config.mapOption === 'function') {
        return config.mapOption(entry);
    }

    if (entry === null || typeof entry !== 'object') {
        return { value: entry, label: String(entry) };
    }

    // Les champs d'origine sont conservés : les vues s'en servent pour afficher
    // un drapeau, un indicateur ou toute donnée annexe renvoyée par l'API.
    return {
        ...entry,
        value: entry[config.valueKey ?? 'value'],
        label: entry[config.labelKey ?? 'label'],
    };
}

/**
 * État et méthodes de chargement distant.
 *
 * @param {object} config
 * @param {string|null} config.url          Endpoint (facultatif : sans URL, les options restent locales).
 * @param {number}      config.perPage
 * @param {string}      config.pageParam
 * @param {string}      config.searchParam
 * @param {number}      config.debounce     Délai avant de relancer une recherche (ms).
 * @param {number}      config.minChars     Nombre de caractères avant de filtrer côté serveur.
 * @param {object}      config.fetchOptions Options passées à `fetch` (en-têtes, credentials…).
 * @param {Function}    config.mapResponse  Réécrit la réponse serveur.
 * @param {Function}    config.mapOption    Réécrit chaque entrée.
 * @param {Function}    config.onError      Appelé avec l'erreur de chargement.
 */
export function createRemoteState(config = {}) {
    return {
        /* Configuration exposée sur l'instance. */
        url: config.url ?? null,
        perPage: config.perPage ?? 25,
        pageParam: config.pageParam ?? 'page',
        perPageParam: config.perPageParam ?? 'per_page',
        searchParam: config.searchParam ?? 'search',
        debounce: config.debounce ?? 250,
        minChars: config.minChars ?? 0,
        loadMoreLabel: config.loadMoreLabel ?? 'Charger plus',
        fetchOptions: config.fetchOptions ?? {},
        loadOnOpen: config.loadOnOpen ?? true,
        remote: Boolean(config.url),

        /* État. */
        options: config.options ?? [],
        page: 1,
        hasMore: false,
        loading: false,
        error: null,
        loaded: false,

        /** Paramètres additionnels envoyés à chaque requête. */
        params() {
            return typeof config.params === 'function' ? config.params() : (config.params ?? {});
        },

        /** Lance (ou relance) le chargement. `reset` repart de la première page. */
        async load(reset = false) {
            if (!this.remote || this.loading) {
                return;
            }

            if (reset) {
                this.page = 1;
                this.hasMore = false;
            }

            this.loading = true;
            this.error = null;

            try {
                const url = new URL(this.url, window.location.origin);

                url.searchParams.set(this.pageParam, String(this.page));
                url.searchParams.set(this.perPageParam, String(this.perPage));

                // `query` est alimenté par le composant appelant (champ de recherche).
                const search = typeof this.searchTerm === 'string' ? this.searchTerm.trim() : '';

                if (search !== '' && search.length >= this.minChars) {
                    url.searchParams.set(this.searchParam, search);
                }

                Object.entries(this.params()).forEach(([key, value]) => {
                    if (value !== null && value !== undefined && value !== '') {
                        url.searchParams.set(key, String(value));
                    }
                });

                const response = await fetch(url.toString(), {
                    headers: { Accept: 'application/json', ...(config.headers ?? {}) },
                    credentials: config.credentials ?? 'same-origin',
                    ...this.fetchOptions,
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const { items, hasMore } = normalizeResponse(await response.json(), {
                    perPage: this.perPage,
                    mapResponse: config.mapResponse,
                });

                const mapped = items.map((entry) => mapOption(entry, config));

                this.options = this.page === 1 ? mapped : [...this.options, ...mapped];
                this.hasMore = hasMore;
                this.loaded = true;

                if (this.page === 1) {
                    this.onLoaded?.(this.options);
                }

                emit(this, 'magma-select:loaded', { page: this.page, count: mapped.length, hasMore });
            } catch (error) {
                this.error = error instanceof Error ? error.message : String(error);

                if (typeof config.onError === 'function') {
                    config.onError(error, this);
                } else {
                    console.error('[magma-ui] échec du chargement distant', error);
                }

                emit(this, 'magma-select:error', { message: this.error });
            } finally {
                this.loading = false;
                this.$nextTick?.(() => this.checkOverflow?.());
            }
        },

        /** Charge la page suivante. */
        loadMore() {
            if (!this.remote || this.loading || !this.hasMore) {
                return;
            }

            this.page += 1;
            this.load();
        },

        /**
         * Si la liste n'occupe pas toute la hauteur disponible, on enchaîne les
         * pages pour éviter un « charger plus » collé en haut de la liste.
         */
        checkOverflow() {
            const list = this.$refs?.list;

            if (!list || !this.hasMore || this.loading) {
                return;
            }

            // Panneau masqué : scrollHeight et clientHeight valent 0, la mesure
            // n'a aucun sens et enchaînerait toutes les pages d'un coup.
            if (list.clientHeight === 0) {
                return;
            }

            if (list.scrollHeight <= list.clientHeight + 4) {
                this.loadMore();
            }
        },

        /** Déclenche la pagination quand la fin de liste approche. */
        onListScroll(event) {
            const el = event.target;

            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48) {
                this.loadMore();
            }
        },
    };
}
