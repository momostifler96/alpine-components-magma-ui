import { emit } from '../emit.js';
import { floatingMenu, menuPositionStyle, menuWidthStyle } from '../menu.js';

/**
 * Panneau déroulant (notifications, sélecteur de compte, sélecteur de langue).
 *
 * Événements émis :
 *   - `magma-dropdown:change` { open }
 */
export function createDropdown(config = {}) {
    return {
        open: config.open ?? false,

        /** Largeur du panneau : voir `menuWidthStyle` dans menu.js. */
        menuWidth: config.menuWidth ?? null,

        // `floating` sort le panneau de la portée de ses ancêtres : sans
        // cela, un parent en overflow le rogne (modale, carte, tableau).
        ...floatingMenu.options(config),

        get menuStyle() {
            return `${menuWidthStyle(this.menuWidth)} ${menuPositionStyle(this.anchor, this.menuWidth)}`.trim();
        },

        init() {
            this.startTracking();
        },

        destroy() {
            this.stopTracking();
        },

        toggle() {
            this.open = !this.open;
            this.$nextTick(() => this.placeMenuSoon());
            emit(this, 'magma-dropdown:change', { open: this.open });
        },

        show() {
            this.open = true;
            this.$nextTick(() => this.placeMenuSoon());
            emit(this, 'magma-dropdown:change', { open: true });
        },

        close() {
            if (!this.open) {
                return;
            }

            this.open = false;
            emit(this, 'magma-dropdown:change', { open: false });
        },
    };
}
