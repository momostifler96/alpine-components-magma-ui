import { emit } from '../emit.js';

/**
 * Bouton d'actualisation : passage en état « en cours », temporisation, puis
 * notification optionnelle.
 *
 * Événements émis :
 *   - `magma-refresh:start`
 *   - `magma-refresh:done`
 */
export function createRefresh(config = {}) {
    return {
        spinning: false,
        duration: config.duration ?? 900,

        async run() {
            if (this.spinning) {
                return;
            }

            this.spinning = true;
            emit(this, 'magma-refresh:start');

            try {
                if (typeof config.action === 'function') {
                    await config.action();
                } else {
                    await new Promise((resolve) => window.setTimeout(resolve, this.duration));
                }

                emit(this, 'magma-refresh:done');

                if (config.title) {
                    emit(this, 'magma-notify', {
                        type: config.type ?? 'success',
                        title: config.title,
                        message: config.message ?? '',
                    });
                }
            } finally {
                this.spinning = false;
            }
        },
    };
}
