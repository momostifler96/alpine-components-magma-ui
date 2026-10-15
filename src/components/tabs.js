import { emit } from '../emit.js';

/**
 * Onglets (filtres de graphique, bascules de période, navigation locale).
 *
 * Événements émis :
 *   - `magma-tabs:change` { tab }
 */
export function createTabs(config = {}) {
    return {
        current: config.current ?? null,

        select(tab) {
            this.current = tab;
            emit(this, 'magma-tabs:change', { tab });
        },

        is(tab) {
            return this.current === tab;
        },
    };
}
