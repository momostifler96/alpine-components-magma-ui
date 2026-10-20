import Alpine from 'alpinejs';
import { install } from '@momoledev/alpine-magma-ui-component';
import '@momoledev/alpine-magma-ui-component/css';

/* Journal des événements magma-* pour le banc d'essai. */
window.__magmaEvents = [];
window.__pageErrors = [];

window.addEventListener('error', (event) => {
    window.__pageErrors.push(event.message);
});

window.addEventListener('unhandledrejection', (event) => {
    window.__pageErrors.push(String(event.reason));
});

const EVENTS = [
    'magma-select:change', 'magma-select:loaded', 'magma-select:error',
    'magma-multiselect:change', 'magma-phone:change',
    'magma-modal:opened', 'magma-modal:closed',
    'magma-drawer:opened', 'magma-drawer:closed',
    'magma-sheet:opened', 'magma-sheet:closed',
    'magma-dropdown:change', 'magma-accordion:change', 'magma-tabs:change',
    'magma-page:change', 'magma-switch:change',
    'magma-refresh:start', 'magma-refresh:done',
    'magma-search', 'magma-search:submit', 'magma-copy:done',
];

EVENTS.forEach((name) => {
    document.addEventListener(name, (event) => {
        window.__magmaEvents.push({ name, detail: event.detail });
        const log = document.querySelector('[data-testid="event-log"]');

        if (log) {
            log.textContent = window.__magmaEvents
                .map((entry) => `${entry.name} ${JSON.stringify(entry.detail ?? {})}`)
                .join('\n');
        }
    });
});

/* Drapeaux fournis par l'application, comme dans l'exemple d'origine. */
const FLAGS = {
    ci: { mode: 'v', colors: ['#F77F00', '#FFFFFF', '#009E60'] },
    sn: { mode: 'v', colors: ['#00853F', '#FDEF42', '#E31B23'] },
    ke: { mode: 'h', colors: ['#000000', '#FFFFFF', '#BB0000', '#FFFFFF', '#006600'] },
    ml: { mode: 'v', colors: ['#14B53A', '#FCD116', '#CE1126'] },
    fr: { mode: 'v', colors: ['#0055A4', '#FFFFFF', '#EF4135'] },
};

window.flagSvg = (code, size = 22) => {
    const flag = FLAGS[code];

    if (!flag) {
        return '';
    }

    const height = Math.round(size * 0.68);
    const length = (flag.mode === 'v' ? size : height) / flag.colors.length;
    const bands = flag.colors.map((color, index) => (flag.mode === 'v'
        ? `<rect x="${(index * length).toFixed(2)}" y="0" width="${length.toFixed(2)}" height="${height}" fill="${color}"/>`
        : `<rect x="0" y="${(index * length).toFixed(2)}" width="${size}" height="${length.toFixed(2)}" fill="${color}"/>`));

    return `<svg width="${size}" height="${height}" viewBox="0 0 ${size} ${height}">${bands.join('')}</svg>`;
};

/* Installation documentée : install() avant Alpine.start(). */
install({
    globals: true,
    api: true,
});

window.Alpine = Alpine;
Alpine.start();

window.__alpineReady = true;
