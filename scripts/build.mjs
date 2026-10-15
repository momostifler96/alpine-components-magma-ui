/**
 * Générateur de paquet — aucun outil externe, uniquement les modules natifs de
 * Node (`fs`, `path`, `url`).
 *
 * Produit dans `dist/` :
 *   - magma-ui.esm.js     bundle ESM (pour les bundlers) ;
 *   - magma-ui.global.js  bundle IIFE (pour une balise <script>) ;
 *   - magma-ui.css        feuille de style autonome.
 *
 * Le regroupement se limite volontairement à ce dont la bibliothèque a besoin :
 * imports relatifs uniquement, ordre topologique, suppression des `import`,
 * réécriture des `export`. Aucune transformation de code.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const entry = join(root, 'src', 'index.js');

const read = (file) => readFileSync(file, 'utf8');
const stripExtension = (file) => file.replace(/\.js$/, '');

/** Résout un import relatif depuis un fichier. */
function resolve(specifier, fromFile) {
    return join(dirname(fromFile), specifier);
}

/** Parcours en profondeur : les dépendances passent avant leur dépendant. */
function collect(file, seen = new Set(), ordered = []) {
    if (seen.has(file)) {
        return ordered;
    }

    seen.add(file);

    const source = read(file);
    // Imports directs ET ré-exports : les deux amènent du code dans le bundle.
    const specifierRe = /(?:^|\n)\s*(?:import\s*\{[^}]+\}\s*from|export\s*\{[^}]+\}\s*from)\s*['"]([^'"]+)['"];?/g;
    let match;

    while ((match = specifierRe.exec(source)) !== null) {
        if (match[1].startsWith('.')) {
            collect(resolve(match[1], file), seen, ordered);
        }
    }

    ordered.push({ file, source });

    return ordered;
}

/** Retire imports, exporte les noms, et normalise les fins de fichier. */
function transform({ file, source }, exported) {
    let code = source
        // Imports relatifs résolus au regroupement.
        .replace(/import\s*\{[^}]+\}\s*from\s*['"][^'"]+['"];?\s*\n?/g, '')
        // `export function foo` / `export const foo` / `export class Foo`
        .replace(/^export\s+(function|const|let|class)\s+([A-Za-z0-9_$]+)/gm, (_, kind, name) => {
            exported.add(name);

            return `${kind} ${name}`;
        });

    // `export { a, b as c };` et `export { a } from './x.js';`
    // Dans les deux cas le nom est déjà déclaré dans le bundle : on ne conserve
    // que la liste des exports.
    code = code.replace(/^export\s*\{([^}]+)\}\s*(?:from\s*['"][^'"]+['"])?;?\s*$/gm, (_, names) => {
        names
            .split(',')
            .map((n) => n.trim().split(/\s+as\s+/)[0].trim())
            .filter(Boolean)
            .forEach((name) => exported.add(name));

        return '';
    });

    // `export default { … }` : conservé côté ESM, ignoré côté global.
    code = code.replace(/^export\s+default\s+/gm, 'const __magmaDefault = ');

    return `/* ── ${relative(join(root, 'src'), file).replace(/\\/g, '/')} ── */\n${code.trim()}\n`;
}

function banner(pkg) {
    return `/*! ${pkg.name} v${pkg.version} — ${pkg.license}\n * ${pkg.description}\n * Aucune dépendance d'exécution. Alpine.js est fourni par l'application hôte.\n */\n`;
}

function build() {
    const pkg = JSON.parse(read(join(root, 'package.json')));
    const exported = new Set();
    const modules = collect(entry);
    const body = modules.map((module) => transform(module, exported)).join('\n');

    // `install`, `notify` et `components` sont exportés nommément par index.js.
    ['install', 'notify'].forEach((name) => exported.add(name));

    const names = [...exported].filter((name) => name !== '__magmaDefault').sort();

    mkdirSync(join(root, 'dist'), { recursive: true });

    /* Bundle ESM ----------------------------------------------------------- */
    writeFileSync(
        join(root, 'dist', 'magma-ui.esm.js'),
        `${banner(pkg)}\n${body}\nexport { ${names.join(', ')} };\nexport default __magmaDefault;\n`
    );

    /* Bundle global -------------------------------------------------------- */
    writeFileSync(
        join(root, 'dist', 'magma-ui.global.js'),
        `${banner(pkg)}
(function (global, factory) {
    var api = factory();

    // Exposé à la fois sous un espace de noms et sous forme de fabriques
    // globales, pour que x-data="magmaSelect({…})" fonctionne sans bundler.
    global.MagmaUI = Object.assign(global.MagmaUI || {}, api);

    Object.keys(api.components || {}).forEach(function (name) {
        if (typeof global[name] === 'undefined') {
            global[name] = api.components[name];
        }
    });

    // Enregistrement automatique, que la balise Alpine soit avant ou après.
    api.install({ api: false });
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {
${body
    .split('\n')
    .map((line) => (line === '' ? line : `    ${line}`))
    .join('\n')}

    return { install: install, notify: notify, components: components };
});
`
    );

    /* Feuille de style ----------------------------------------------------- */
    writeFileSync(join(root, 'dist', 'magma-ui.css'), read(join(root, 'src', 'styles', 'magma-ui.css')));

    const sizes = ['magma-ui.esm.js', 'magma-ui.global.js', 'magma-ui.css']
        .map((file) => {
            const bytes = readFileSync(join(root, 'dist', file)).length;

            return `  ${file.padEnd(22)} ${(bytes / 1024).toFixed(1)} Ko`;
        })
        .join('\n');

    console.log(`\n@momoledev/alpine-magma-ui-component v${pkg.version} — ${names.length} exports\n${sizes}\n`);
}

build();
