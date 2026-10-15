import { createAccordion } from './components/accordion.js';
import { createCopy } from './components/copy.js';
import { createDropdown } from './components/dropdown.js';
import { createModal } from './components/modal.js';
import { createPagination } from './components/pagination.js';
import { createPhonePrefix } from './components/phone-prefix.js';
import { createRefresh } from './components/refresh.js';
import { createSearch } from './components/search.js';
import { createSelect } from './components/select.js';
import { createSwitch } from './components/switch.js';
import { createTabs } from './components/tabs.js';
import { createToasts } from './components/toasts.js';

/**
 * Fabriques exposées par la bibliothèque.
 *
 * Chaque entrée est utilisable de deux façons :
 *   - `x-data="magmaSelect({ … })"` après enregistrement auprès d'Alpine ;
 *   - `x-data="magmaSelect({ … })"` via la fonction globale du même nom, ce qui
 *     couvre le cas où la bibliothèque est chargée après le démarrage d'Alpine.
 */
export const components = {
    magmaSelect: createSelect,
    magmaPhonePrefix: createPhonePrefix,
    magmaDropdown: createDropdown,
    magmaModal: createModal,
    magmaAccordion: createAccordion,
    magmaTabs: createTabs,
    magmaPagination: createPagination,
    magmaToasts: createToasts,
    magmaRefresh: createRefresh,
    magmaSearch: createSearch,
    magmaCopy: createCopy,
    magmaSwitch: createSwitch,
};

/**
 * Enregistre les composants auprès d'une instance Alpine.
 *
 * @param {object} Alpine  L'instance Alpine (celle fournie par Livewire fait l'affaire).
 * @param {object} [options]
 * @param {boolean} [options.globals=true]  Exposer aussi les fabriques sur `window`.
 */
export function registerComponents(Alpine, options = {}) {
    if (!Alpine || typeof Alpine.data !== 'function') {
        return false;
    }

    Object.entries(components).forEach(([name, factory]) => {
        Alpine.data(name, factory);
    });

    return true;
}

/**
 * Expose les fabriques en global, pour que `x-data="magmaSelect({…})"` fonctionne
 * même lorsque Alpine a déjà démarré (cas Livewire qui monte du HTML tardivement).
 */
export function exposeGlobals(target = window) {
    Object.entries(components).forEach(([name, factory]) => {
        if (typeof target[name] === 'undefined') {
            target[name] = factory;
        }
    });
}
