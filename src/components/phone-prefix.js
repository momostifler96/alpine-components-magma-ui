import { createRemoteState } from '../remote.js';
import { floatingMenu, menuPositionStyle, menuWidthStyle } from '../menu.js';
import { emit } from '../emit.js';

/**
 * Sélecteur d'indicatif téléphonique.
 *
 * Repose sur la même mécanique distante que `magmaSelect` : la liste des pays
 * peut être locale ou chargée par AJAX, avec recherche serveur et pagination.
 *
 * Événements émis :
 *   - `magma-phone:change` { dial, code }
 *   - `magma-select:loaded` / `magma-select:error` (mode distant)
 */
export function createPhonePrefix(config = {}) {
    const state = createRemoteState(config);

    return {
        ...state,

        open: false,
        value: config.value ?? '',
        code: config.code ?? '',
        searchTerm: '',
        activeIndex: 0,
        searchable: config.searchable ?? true,

        /** Largeur du panneau : voir `menuWidthStyle` dans menu.js. */
        menuWidth: config.menuWidth ?? null,

        // `floating` sort le panneau de la portée de ses ancêtres : sans
        // cela, un parent en overflow le rogne (modale, carte, tableau).
        ...floatingMenu.options(config),

        get menuStyle() {
            return `${menuWidthStyle(this.menuWidth)} ${menuPositionStyle(this.anchor, this.menuWidth)}`.trim();
        },
        emptyLabel: config.emptyLabel ?? 'Aucun indicatif trouvé',
        loadingLabel: config.loadingLabel ?? 'Chargement…',
        loadMoreLabel: state.loadMoreLabel,
        errorLabel: config.errorLabel ?? 'Le chargement a échoué',
        valueKey: config.valueKey ?? 'dial',
        labelKey: config.labelKey ?? 'name',

        get visibleOptions() {
            if (this.remote || this.searchTerm.trim() === '') {
                return this.options;
            }

            const needle = this.searchTerm.trim().toLowerCase();

            // La recherche locale couvre le libellé, la valeur et les codes pays.
            return this.options.filter((option) =>
                [option.label, option.value, option.code, option.region]
                    .filter(Boolean)
                    .some((field) => String(field).toLowerCase().includes(needle))
            );
        },

        get isEmpty() {
            return !this.loading && this.visibleOptions.length === 0;
        },

        get currentDial() {
            return this.value;
        },

        /**
         * Ligne sélectionnée, avec ses champs propres (`code`, `flag`, `region`…).
         * Pratique pour rendre un drapeau : `flagSvg(currentOption?.code)`.
         */
        get currentOption() {
            return this.options.find((option) => String(option.value) === String(this.value)) ?? null;
        },

        init() {
            this.startTracking();
        },

        destroy() {
            this.stopTracking();
        },

        toggle() {
            this.open ? this.close() : this.show();
        },

        show() {
            this.open = true;
            this.$nextTick(() => this.placeMenuSoon());
            this.activeIndex = 0;
            this.$nextTick(() => {
                this.$refs.search?.focus();

                if (this.remote && !this.loaded) {
                    this.load(true);
                }
            });
        },

        close() {
            this.open = false;

            if (this.remote) {
                this.searchTerm = '';
            }
        },

        onSearchInput() {
            if (!this.remote) {
                this.activeIndex = 0;

                return;
            }

            window.clearTimeout(this.debounceTimer);
            this.debounceTimer = window.setTimeout(() => this.load(true), this.debounce);
        },

        choose(option) {
            this.value = option.value;
            this.code = option.code ?? option.value;
            this.open = false;
            emit(this, 'magma-phone:change', { dial: option.value, code: this.code });
        },

        onKeydown(event) {
            const last = this.visibleOptions.length - 1;

            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    this.activeIndex = Math.min(this.activeIndex + 1, last);
                    this.scrollActiveIntoView();
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    this.activeIndex = Math.max(this.activeIndex - 1, 0);
                    this.scrollActiveIntoView();
                    break;
                case 'Enter':
                    event.preventDefault();

                    if (this.open && this.visibleOptions[this.activeIndex]) {
                        this.choose(this.visibleOptions[this.activeIndex]);
                    } else {
                        this.show();
                    }
                    break;
                case 'Escape':
                    event.preventDefault();
                    this.close();
                    break;
            }
        },

        scrollActiveIntoView() {
            this.$nextTick(() => {
                this.$refs.list?.querySelector(`[data-index="${this.activeIndex}"]`)?.scrollIntoView({ block: 'nearest' });
            });
        },

        /** Vide le numéro sans toucher à l'indicatif. */
        clear() {
            const input = this.$root.querySelector('input[type="tel"]');

            if (input) {
                input.value = '';
                input.focus();
            }
        },
    };
}
