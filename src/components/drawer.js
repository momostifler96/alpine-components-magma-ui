import { emit } from '../emit.js';
import { lockDocumentScroll, unlockDocumentScroll } from '../overlay.js';

const SIDES = ['right', 'left', 'top', 'bottom'];

/**
 * Tiroir latéral (filtres, navigation, détail).
 *
 * Le panneau est transitionné par la feuille de style : les classes
 * `magma-drawer-enter` / `magma-drawer-leave` lisent la classe de côté
 * (`magma-drawer--right`, `--left`, `--top`, `--bottom`) pour glisser depuis le
 * bon bord. Le composant gère l'état, le verrouillage du défilement, le focus et
 * les commandes d'ouverture/fermeture à distance.
 *
 * Événements émis :
 *   - `magma-drawer:opened` { name, side }
 *   - `magma-drawer:closed` { name, side }
 *
 * Commandes écoutées dans le balisage :
 *   - `magma-drawer:open`  { name }
 *   - `magma-drawer:close` { name }
 */
export function createDrawer(config = {}) {
    return {
        open: config.open ?? false,
        name: config.name ?? null,
        side: SIDES.includes(config.side) ? config.side : 'right',
        size: config.size ?? null,
        lockScroll: config.lockScroll ?? true,
        closeOnBackdrop: config.closeOnBackdrop ?? true,
        locked: false,
        previousFocus: null,

        init() {
            if (this.open) {
                this.previousFocus = document.activeElement;
                this.lock();
                this.$nextTick(() => this.$refs.panel?.focus({ preventScroll: true }));
            }

            this.$watch('open', (value) => {
                value ? this.lock() : this.unlock();
            });
        },

        destroy() {
            this.unlock();
        },

        get panelStyle() {
            const size = this.size;

            if (size === null || size === undefined || size === '') {
                return '';
            }

            return `--magma-drawer-size: ${typeof size === 'number' ? `${size}px` : size};`;
        },

        show() {
            if (this.open) {
                return;
            }

            this.previousFocus = document.activeElement;
            this.open = true;
            emit(this, 'magma-drawer:opened', { name: this.name, side: this.side });
            this.$nextTick(() => this.$refs.panel?.focus({ preventScroll: true }));
        },

        hide() {
            if (!this.open) {
                return;
            }

            this.open = false;
            emit(this, 'magma-drawer:closed', { name: this.name, side: this.side });

            this.$nextTick(() => {
                this.previousFocus?.focus?.({ preventScroll: true });
                this.previousFocus = null;
            });
        },

        toggle() {
            this.open ? this.hide() : this.show();
        },

        onBackdrop() {
            if (this.closeOnBackdrop) {
                this.hide();
            }
        },

        lock() {
            if (this.lockScroll && !this.locked) {
                lockDocumentScroll();
                this.locked = true;
            }
        },

        unlock() {
            if (this.lockScroll && this.locked) {
                unlockDocumentScroll();
                this.locked = false;
            }
        },
    };
}
