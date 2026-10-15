import { emit } from '../emit.js';

/**
 * Champ de recherche : temporisation et événement de soumission.
 *
 * Événements émis :
 *   - `magma-search` { term }   (après la temporisation, si `live` est actif)
 *   - `magma-search:submit` { term }
 */
export function createSearch(config = {}) {
    return {
        term: config.term ?? '',
        busy: false,
        live: config.live ?? false,
        debounce: config.debounce ?? 300,

        clear() {
            this.term = '';

            if (this.live) {
                emit(this, 'magma-search', { term: '' });
            }
        },

        submit() {
            this.busy = true;
            emit(this, 'magma-search:submit', { term: this.term });

            window.setTimeout(() => {
                this.busy = false;
            }, config.busyDuration ?? 500);
        },

        onInput() {
            if (!this.live) {
                return;
            }

            window.clearTimeout(this.timer);
            this.timer = window.setTimeout(() => emit(this, 'magma-search', { term: this.term }), this.debounce);
        },
    };
}
