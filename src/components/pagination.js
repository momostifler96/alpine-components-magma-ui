import { emit } from '../emit.js';

/**
 * Pagination : compteur, saut direct et pages voisines.
 *
 * Événements émis :
 *   - `magma-page:change` { page }
 */
export function createPagination(config = {}) {
    return {
        page: config.page ?? 1,
        perPage: config.perPage ?? 25,
        total: config.total ?? 0,

        get lastPage() {
            return Math.max(1, Math.ceil(this.total / this.perPage));
        },

        get from() {
            return this.total === 0 ? 0 : (this.page - 1) * this.perPage + 1;
        },

        get to() {
            return Math.min(this.page * this.perPage, this.total);
        },

        /** Numéros affichés : première, voisines, dernière. */
        get pages() {
            const last = this.lastPage;
            const window = config.window ?? 1;
            const set = new Set([1, last]);

            for (let i = this.page - window; i <= this.page + window; i += 1) {
                if (i >= 1 && i <= last) {
                    set.add(i);
                }
            }

            return [...set].sort((a, b) => a - b);
        },

        goTo(page) {
            const target = Math.min(this.lastPage, Math.max(1, Number(page) || 1));

            if (target === this.page) {
                return;
            }

            this.page = target;
            emit(this, 'magma-page:change', { page: this.page });
        },

        next() {
            this.goTo(this.page + 1);
        },

        previous() {
            this.goTo(this.page - 1);
        },
    };
}
