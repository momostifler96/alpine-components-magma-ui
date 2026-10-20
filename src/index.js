/**
 * Magma UI — petite bibliothèque de composants Alpine.
 *
 * Aucune dépendance d'exécution : Alpine est fourni par l'application hôte
 * (`peerDependency`), exactement comme pour les greffons officiels d'Alpine.
 *
 * Utilisation, quelle que soit l'ordre de chargement :
 *
 *   import { install } from '@momoledev/alpine-magma-ui-component';
 *   install();                       // attend `alpine:init` si besoin
 *
 * Avec Alpine déjà présent (Livewire, par exemple) :
 *
 *   import { registerComponents, exposeGlobals } from '@momoledev/alpine-magma-ui-component';
 *   registerComponents(window.Alpine);
 *   exposeGlobals();
 *
 * Sans bundler :
 *
 *   <script src="magma-ui.global.js" defer></script>
 *   <script src="alpine.js" defer></script>
 */
import { components, exposeGlobals, registerComponents } from './registry.js';

export { components, exposeGlobals, registerComponents };
export { createSelect } from './components/select.js';
export { createMultiSelect } from './components/multi-select.js';
export { createPhonePrefix } from './components/phone-prefix.js';
export { createDropdown } from './components/dropdown.js';
export { createModal } from './components/modal.js';
export { createDrawer } from './components/drawer.js';
export { createSheet } from './components/sheet.js';
export { createAccordion } from './components/accordion.js';
export { createTabs } from './components/tabs.js';
export { createPagination } from './components/pagination.js';
export { createToasts } from './components/toasts.js';
export { createRefresh } from './components/refresh.js';
export { createSearch } from './components/search.js';
export { createCopy } from './components/copy.js';
export { createSwitch } from './components/switch.js';
export { createRemoteState, normalizeResponse, mapOption } from './remote.js';
export { emit } from './emit.js';
export { MENU_GAP, computeMenuPosition, floatingMenu, menuPositionStyle, menuWidthStyle, menuWidthClass } from './menu.js';

/**
 * Notifie la pile de notifications, où qu'elle soit dans la page.
 *
 * @param {{ type?: string, title?: string, message?: string, duration?: number }} payload
 */
export function notify(payload) {
    globalThis.dispatchEvent(new CustomEvent('magma-notify', { detail: payload, bubbles: false }));
}

/**
 * Installe la bibliothèque sur l'instance Alpine de l'application.
 *
 * Si Alpine n'est pas encore là, on attend `alpine:init` — ce qui couvre les
 * deux cas de figure : page Alpine classique et page Livewire (qui embarque son
 * propre Alpine).
 *
 * @param {object} [options]
 * @param {object} [options.Alpine]        Instance Alpine explicite.
 * @param {boolean} [options.globals=true] Exposer les fabriques sur `globalThis`.
 * @param {boolean} [options.api=true]     Exposer `globalThis.MagmaUI`.
 * @returns {{ registered: boolean, pending: boolean }}
 */
export function install(options = {}) {
    const useGlobals = options.globals ?? true;
    const useApi = options.api ?? true;

    if (useGlobals) {
        exposeGlobals(globalThis);
    }

    if (useApi) {
        globalThis.MagmaUI = globalThis.MagmaUI ?? {};
        globalThis.MagmaUI.notify = notify;
        globalThis.MagmaUI.components = components;
        globalThis.MagmaUI.install = install;
    }

    const bind = (Alpine) => {
        if (useApi) {
            globalThis.MagmaUI.Alpine = Alpine;
        }

        return registerComponents(Alpine, options);
    };

    // Cas 1 : Alpine est déjà démarré (Livewire inclus).
    if (options.Alpine) {
        return { registered: bind(options.Alpine), pending: false };
    }

    if (globalThis.Alpine) {
        return { registered: bind(globalThis.Alpine), pending: false };
    }

    // Cas 2 : la bibliothèque arrive avant Alpine — on s'enregistre à son démarrage.
    document.addEventListener('alpine:init', () => bind(globalThis.Alpine), { once: true });

    return { registered: false, pending: true };
}

export default { install, notify, components };
