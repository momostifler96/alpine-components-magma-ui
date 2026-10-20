import { defineConfig } from 'vite';

/**
 * Petite API paginée pour tester le chargement distant sans service externe.
 * Le sélecteur appelle `/api/countries?page=1&per_page=8&q=…`.
 */
const COUNTRIES = [
    'Côte d’Ivoire', 'Sénégal', 'Bénin', 'Burkina Faso', 'Mali', 'Niger', 'Togo',
    'Guinée', 'Nigeria', 'Ghana', 'Cameroun', 'Kenya', 'Tanzanie', 'Ouganda',
    'Rwanda', 'Éthiopie', 'France', 'Belgique', 'États-Unis', 'Maroc', 'Tunisie',
    'Algérie', 'Égypte', 'Afrique du Sud', 'Portugal', 'Espagne', 'Italie',
    'Allemagne', 'Canada', 'Brésil', 'Mexique', 'Japon', 'Inde', 'Chine',
    'Australie', 'Nouvelle-Zélande',
].map((name, index) => ({ value: `P${index}`, label: name }));

function countriesApi() {
    return {
        name: 'magma-countries-api',
        configureServer(server) {
            server.middlewares.use('/api/countries', (req, res) => {
                const url = new URL(req.url ?? '/', 'http://localhost');
                const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
                const perPage = Math.max(1, Number(url.searchParams.get('per_page') ?? 8));
                const q = (url.searchParams.get('q') ?? '').toLowerCase();

                const filtered = COUNTRIES.filter((country) => country.label.toLowerCase().includes(q));
                const start = (page - 1) * perPage;
                const data = filtered.slice(start, start + perPage);

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({
                    data,
                    hasMore: start + perPage < filtered.length,
                }));
            });
        },
    };
}

export default defineConfig({
    plugins: [countriesApi()],
});
