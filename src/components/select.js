import { createRemoteState } from '../remote.js';
import { floatingMenu, menuPositionStyle, menuWidthStyle } from '../menu.js';
import { emit } from '../emit.js';

/**
 * Liste déroulante à sélection unique.
 *
 * Fonctionne sur un tableau local, ou sur un endpoint distant avec recherche
 * serveur, pagination et « charger plus » à l'approche du bas de liste.
 *
 * Événements émis :
 *   - `magma-select:change` { value, option }
 *   - `magma-select:loaded` { page, count, hasMore }   (mode distant)
 *   - `magma-select:error`  { message }                (mode distant)
 */
export function createSelect(config = {}) {
    const state = createRemoteState(config);

    return {
        ...state,

        open: false,
        value: config.value ?? null,
        searchTerm: '',
        activeIndex: 0,
        searchable: config.searchable ?? false,
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
        loadingLabel: config.loadingLabel ?? 'Chargement…',
        loadMoreLabel: state.loadMoreLabel,
        errorLabel: config.errorLabel ?? 'Le chargement a échoué',

        /** Options affichées : filtrées en local, telles quelles en distant. */
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

        /** Libellé courant, utilisé quand la valeur est présélectionnée. */
        get currentLabel() {
            const match = this.options.find((option) => String(option.value) === String(this.value));

            return match ? match.label : this.placeholder;
        },

        init() {
            this.startTracking();

            // En mode distant avec présélection, on amorce la liste pour que le
            // libellé s'affiche sans ouvrir le menu.
            if (this.remote && this.value !== null && this.options.length === 0) {
                this.load(true);
            }
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
            this.$nextTick(() => this.placeMenuSoon());
            this.activeIndex = 0;
            this.$nextTick(() => {
                this.$refs.search?.focus();

                // La recherche est vidée à la fermeture : on recharge la
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

        /** Recherche : locale immédiate, distante après temporisation. */
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
            this.close();
            emit(this, 'magma-select:change', { value: option.value, option: { ...option } });
        },

        /** Navigation clavier : flèches, entrée, échap, début/fin. */
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
                case 'Home':
                    event.preventDefault();
                    this.activeIndex = 0;
                    break;
                case 'End':
                    event.preventDefault();
                    this.activeIndex = last;
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
                const el = this.$refs.list?.querySelector(`[data-index="${this.activeIndex}"]`);

                el?.scrollIntoView({ block: 'nearest' });
            });
        },
    };
}
