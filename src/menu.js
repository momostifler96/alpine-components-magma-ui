/**
 * Positionnement des panneaux déroulants.
 *
 * Un panneau en `position: absolute` reste tributaire de ses ancêtres : dès
 * qu'un parent porte `overflow: hidden` ou `auto` — une modale, une carte, une
 * cellule de tableau — le menu est rogné. Le positionnement flottant calcule
 * donc ses coordonnées dans le repère de la fenêtre et le pose en
 * `position: fixed`, hors de portée de tout rognage.
 *
 * Le panneau suit son déclencheur au défilement et au redimensionnement, et
 * bascule au-dessus du champ lorsqu'il n'y a pas la place en dessous.
 */

/** Écart entre le champ et le panneau, en pixels. */
/**
 * Largeur des panneaux déroulants.
 *
 * La variable `--magma-menu-width` porte la largeur ; le composant se contente
 * de la poser, ce qui laisse la feuille de style maîtresse de la valeur par
 * défaut.
 *
 * Valeurs acceptées pour l'option `menuWidth` :
 *
 *   'field'      le panneau prend exactement la largeur du champ
 *   'auto'       le panneau s'ajuste à son contenu, sans jamais être plus étroit
 *                que le champ
 *   320          une largeur explicite en pixels
 *   '20rem'      toute valeur acceptée par `width` — attention en mode flottant,
 *                un pourcentage se résoudrait contre la fenêtre
 *   null         laisse la valeur par défaut de la feuille de style
 *
 * @param {boolean|number|string|null|undefined} value
 * @returns {string} déclaration CSS à poser sur l'élément du panneau
 */
export function menuWidthStyle(value) {
    if (value === undefined || value === null || value === false) {
        return '';
    }

    if (value === true || value === 'field') {
        return '--magma-menu-width: 100%;';
    }

    if (value === 'auto' || value === 'content') {
        return '--magma-menu-width: max-content; --magma-menu-min-width: 100%;';
    }

    if (typeof value === 'number') {
        return `--magma-menu-width: ${value}px;`;
    }

    return `--magma-menu-width: ${value};`;
}

/**
 * Classe de largeur correspondante, pour un usage sans JavaScript.
 *
 * @param {boolean|number|string|null|undefined} value
 * @returns {string|null}
 */
export function menuWidthClass(value) {
    if (value === true || value === 'field') {
        return 'magma-select__menu--field';
    }

    if (value === 'auto' || value === 'content') {
        return 'magma-select__menu--auto';
    }

    return null;
}

export const MENU_GAP = 8;

/** Marge minimale conservée avec les bords de la fenêtre. */
const VIEWPORT_MARGIN = 12;

/**
 * Calcule la position d'un panneau par rapport à son déclencheur.
 *
 * @param {HTMLElement} trigger
 * @param {HTMLElement|null} menu
 * @returns {{ top: number, left: number, width: number, placement: 'top'|'bottom' }}
 */
export function computeMenuPosition(trigger, menu = null) {
    const rect = trigger.getBoundingClientRect();
    const height = menu?.offsetHeight ?? 0;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const roomBelow = viewportHeight - rect.bottom - MENU_GAP - VIEWPORT_MARGIN;
    const roomAbove = rect.top - MENU_GAP - VIEWPORT_MARGIN;

    // On bascule au-dessus seulement si le dessous manque de place et que le
    // dessus en offre davantage.
    const placement = height > roomBelow && roomAbove > roomBelow ? 'top' : 'bottom';

    const top = placement === 'top' ? rect.top - MENU_GAP - height : rect.bottom + MENU_GAP;

    // Le panneau ne déborde jamais latéralement de la fenêtre.
    const width = rect.width;
    const left = Math.min(Math.max(rect.left, VIEWPORT_MARGIN), viewportWidth - width - VIEWPORT_MARGIN);

    return { top, left, width, placement };
}

/**
 * Traduit une position en déclarations CSS.
 *
 * La largeur est reprise ici car un élément en `position: fixed` résout ses
 * pourcentages contre la fenêtre : `width: 100%` couvrirait l'écran au lieu du
 * champ. On fige donc la largeur du déclencheur, selon le mode demandé.
 *
 * @param {object|null} position
 * @param {boolean|number|string|null} [menuWidth]
 * @returns {string}
 */
export function menuPositionStyle(position, menuWidth = null) {
    if (!position) {
        return '';
    }

    const parts = [
        'position: fixed',
        `top: ${Math.round(position.top)}px`,
        `left: ${Math.round(position.left)}px`,
        'bottom: auto',
    ];

    const fieldWidth = Math.round(position.width);

    if (menuWidth === undefined || menuWidth === null || menuWidth === false) {
        // Mode par défaut de la feuille de style, mais jamais plus étroit que le champ.
        parts.push(`min-width: ${fieldWidth}px`);
    } else if (menuWidth === true || menuWidth === 'field') {
        parts.push(`width: ${fieldWidth}px`);
    } else if (menuWidth === 'auto' || menuWidth === 'content') {
        parts.push(`min-width: ${fieldWidth}px`, 'width: max-content');
    }

    return parts.join('; ') + ';';
}

/**
 * Comportement partagé par les composants à panneau flottant.
 *
 * `options()` renvoie à la fois l'état (`floating`, `anchor`) et les méthodes,
 * de sorte qu'un simple `...floatingMenu.options(config)` suffit : le composant
 * expose ensuite `this.placeMenu()`, `this.startTracking()` et
 * `this.stopTracking()`.
 */
export const floatingMenu = {
    /**
     * @param {object} config
     * @param {boolean} [config.floating=true] Positionner le panneau dans la fenêtre.
     */
    options(config = {}) {
        return {
            floating: config.floating ?? true,
            anchor: null,

            /** Recalcule l'ancrage du panneau ouvert. */
            placeMenu() {
                if (!this.floating || !this.open) {
                    return;
                }

                const trigger = this.$refs?.trigger;

                if (!trigger) {
                    return;
                }

                this.anchor = computeMenuPosition(trigger, this.$refs?.menu ?? null);
            },

            /**
             * Positionne maintenant puis au tour suivant : la première mesure
             * peut précéder la stabilisation de la mise en page (barre de
             * défilement qui apparaît ou disparaît dans un parent).
             */
            placeMenuSoon() {
                this.placeMenu();
                window.clearTimeout(this.anchorTimer);
                this.anchorTimer = window.setTimeout(() => this.placeMenu(), 0);
            },

            /** Suit le déclencheur au défilement et au redimensionnement. */
            startTracking() {
                if (!this.floating || this.track) {
                    return;
                }

                this.track = () => this.placeMenu();

                // `capture` : le défilement d'un ancêtre (modale, panneau) doit
                // aussi déclencher le repositionnement.
                window.addEventListener('scroll', this.track, true);
                window.addEventListener('resize', this.track);

                // Le déclencheur peut changer de largeur sans défilement : une
                // barre de défilement qui apparaît dans la modale, une fenêtre
                // redimensionnée, une colonne qui se réorganise.
                if (typeof ResizeObserver !== 'undefined' && this.$refs?.trigger) {
                    this.observer = new ResizeObserver(() => this.placeMenu());
                    this.observer.observe(this.$refs.trigger);
                }
            },

            /** Retire les écouteurs. */
            stopTracking() {
                if (this.track) {
                    window.removeEventListener('scroll', this.track, true);
                    window.removeEventListener('resize', this.track);
                    this.track = null;
                }

                this.observer?.disconnect();
                this.observer = null;
            },
        };
    },
};
