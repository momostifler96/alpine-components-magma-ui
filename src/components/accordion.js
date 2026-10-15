import { emit } from '../emit.js';

/**
 * Accordéon : une seule section ouverte à la fois.
 *
 * Événements émis :
 *   - `magma-accordion:change` { key, open }
 */
export function createAccordion(config = {}) {
    return {
        open: config.open ?? null,

        isOpen(key) {
            return this.open === key;
        },

        toggle(key) {
            this.open = this.isOpen(key) ? null : key;
            emit(this, 'magma-accordion:change', { key, open: this.isOpen(key) });
        },

        close() {
            this.open = null;
            emit(this, 'magma-accordion:change', { key: null, open: false });
        },
    };
}
