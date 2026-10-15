import { emit } from '../emit.js';

/**
 * Fenêtre modale.
 *
 * Gère le verrouillage du défilement du document, la fermeture par Échap et par
 * clic sur le fond. Le déclenchement à distance se fait par l'événement
 * `magma-open` : `$dispatch('magma-open', { name: 'ma-modale' })`.
 *
 * Événements émis :
 *   - `magma-modal:opened` { name }
 *   - `magma-modal:closed` { name }
 */
export function createModal(config = {}) {
    return {
        open: config.open ?? false,
        name: config.name ?? null,
        lockScroll: config.lockScroll ?? true,

        init() {
            if (this.open) {
                this.lock();
            }

            this.$watch('open', (value) => (value ? this.lock() : this.unlock()));
        },

        show() {
            this.open = true;
            emit(this, 'magma-modal:opened', { name: this.name });
        },

        hide() {
            this.open = false;
            emit(this, 'magma-modal:closed', { name: this.name });
        },

        toggle() {
            this.open ? this.hide() : this.show();
        },

        lock() {
            if (this.lockScroll) {
                document.documentElement.style.overflow = 'hidden';
            }
        },

        unlock() {
            if (this.lockScroll) {
                document.documentElement.style.overflow = '';
            }
        },
    };
}
