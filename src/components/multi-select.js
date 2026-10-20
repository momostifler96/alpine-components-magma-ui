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
        values: config.values ? [...config.values] : [],
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

            return this.options.filter((option) =>
                [option.label, option.value].some((field) => String(field ?? '').toLowerCase().includes(needle))
            );
        },

        get isEmpty() {
            return !this.loading && this.visibleOptions.length === 0;
        },

        /** Vrai lorsque toutes les options visibles (filtrées) sont retenues. */
        get allSelected() {
            return this.visibleOptions.length > 0
                && this.visibleOptions.every((option) => this.isSelected(option.value));
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
            window.clearTimeout(this.debounceTimer);
            this.stopTracking();
        },

        toggle() {
            this.open ? this.close() : this.show();
        },

        show() {
            this.open = true;
            this.activeIndex = 0;
            this.$nextTick(() => this.placeMenuSoon());
            this.$nextTick(() => {
                this.$refs.search?.focus();

                // La recherche est vidée à la fermeture ; on repart donc de la
                // première page pour ne pas rouvrir sur un ancien filtre.
                if (this.remote && this.loadOnOpen) {
                    this.load(true);
                }
            });
        },

        close() {
            window.clearTimeout(this.debounceTimer);
            this.open = false;
            this.searchTerm = '';
            this.activeIndex = 0;
        },

        onSearchInput() {
            this.activeIndex = 0;

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

            emit(this, 'magma-multiselect:change', { values: [...this.values] });
        },

        /** Sélectionne ou désélectionne toutes les options actuellement visibles. */
        toggleAll() {
            const visible = this.visibleOptions;

            if (visible.length === 0) {
                return;
            }

            if (this.allSelected) {
                const remove = new Set(visible.map((option) => String(option.value)));
                this.values = this.values.filter((value) => !remove.has(String(value)));
            } else {
                const merged = new Map(this.values.map((value) => [String(value), value]));

                visible.forEach((option) => merged.set(String(option.value), option.value));
                this.values = [...merged.values()];
            }

            emit(this, 'magma-multiselect:change', { values: [...this.values] });
        },

        clear() {
            this.values = [];
            emit(this, 'magma-multiselect:change', { values: [] });
        },

        /** Navigation clavier : flèches, début/fin, Entrée, Échap. */
        onKeydown(event) {
            const last = this.visibleOptions.length - 1;

            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();

                    if (!this.open) {
                        this.show();
                    } else {
                        this.activeIndex = Math.min(this.activeIndex + 1, last);
                        this.scrollActiveIntoView();
                    }
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    this.activeIndex = Math.max(this.activeIndex - 1, 0);
                    this.scrollActiveIntoView();
                    break;
                case 'Home':
                    event.preventDefault();
                    this.activeIndex = 0;
                    this.scrollActiveIntoView();
                    break;
                case 'End':
                    event.preventDefault();
                    this.activeIndex = last;
                    this.scrollActiveIntoView();
                    break;
                case 'Enter':
                    if (!this.open) {
                        event.preventDefault();
                        this.show();
                    } else if (this.visibleOptions[this.activeIndex]) {
                        event.preventDefault();
                        this.choose(this.visibleOptions[this.activeIndex]);
                    }
                    break;
                case 'Escape':
                    if (this.open) {
                        event.preventDefault();
                        this.close();
                    }
                    break;
                case 'Tab':
                    if (this.open) {
                        this.close();
                    }
                    break;
            }
        },

        scrollActiveIntoView() {
            this.$nextTick(() => {
                this.$refs.list?.querySelector(`[data-index="${this.activeIndex}"]`)
                    ?.scrollIntoView({ block: 'nearest' });
            });
        },
    };
}
