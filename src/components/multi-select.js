import { createRemoteState } from '../remote.js';
import { floatingMenu, menuPositionStyle, menuWidthStyle } from '../menu.js';
import { emit } from '../emit.js';

/**
 * Liste déroulante à sélection multiple.
 *
 * Comme `magmaSelect`, elle accepte une liste locale ou distante. Le champ
 * `values` reste la source de vérité ; l'événement `magma-multiselect:change`
 * transporte la sélection complète.
 */
export function createMultiSelect(config = {}) {
    const state = createRemoteState(config);

    return {
        ...state,

        open: false,
        values: config.values ?? [],
        searchTerm: '',
        activeIndex: 0,
        searchable: config.searchable ?? true,
        placeholder: config.placeholder ?? '',

        /** Largeur du panneau : voir `menuWidthStyle` dans menu.js. */
        menuWidth: config.menuWidth ?? null,

        // `floating` sort le panneau de la portée de ses ancêtres : sans
        // cela, un parent en overflow le rogne (modale, carte, tableau).
        ...floatingMenu.options(config),

        get menuStyle() {
            return `${menuWidthStyle(this.menuWidth)} ${menuPositionStyle(this.anchor, this.menuWidth)}`.trim();
        },
        emptyLabel: config.emptyLabel ?? 'Aucun résultat',
        allLabel: config.allLabel ?? 'Tout sélectionner',
        loadingLabel: config.loadingLabel ?? 'Chargement…',
        loadMoreLabel: state.loadMoreLabel,
        errorLabel: config.errorLabel ?? 'Le chargement a échoué',

        get visibleOptions() {
            if (this.remote || this.searchTerm.trim() === '') {
                return this.options;
            }

            const needle = this.searchTerm.trim().toLowerCase();

            return this.options.filter((option) => String(option.label).toLowerCase().includes(needle));
        },

        get isEmpty() {
            return !this.loading && this.visibleOptions.length === 0;
        },

        get allSelected() {
            return this.options.length > 0 && this.values.length === this.options.length;
        },

        get label() {
            if (this.values.length === 0) {
                return this.placeholder;
            }

            if (this.values.length === 1) {
                const match = this.options.find((option) => String(option.value) === String(this.values[0]));

                return match ? match.label : this.placeholder;
            }

            return `${this.values.length} ${config.selectedLabel ?? 'sélectionnés'}`;
        },

        isSelected(value) {
            return this.values.some((item) => String(item) === String(value));
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
                return;
            }

            window.clearTimeout(this.debounceTimer);
            this.debounceTimer = window.setTimeout(() => this.load(true), this.debounce);
        },

        choose(option) {
            this.values = this.isSelected(option.value)
                ? this.values.filter((item) => String(item) !== String(option.value))
                : [...this.values, option.value];

            emit(this, 'magma-multiselect:change', { values: this.values });
        },

        toggleAll() {
            this.values = this.allSelected ? [] : this.options.map((option) => option.value);
            emit(this, 'magma-multiselect:change', { values: this.values });
        },

        clear() {
            this.values = [];
            emit(this, 'magma-multiselect:change', { values: [] });
        },
    };
}
