import { emit } from '../emit.js';

/**
 * Copie dans le presse-papiers, avec repli pour les contextes non sécurisés.
 *
 * Événements émis :
 *   - `magma-copy:done` { value }
 */
export function createCopy(config = {}) {
    return {
        copied: false,
        value: config.value ?? '',
        feedbackDuration: config.feedbackDuration ?? 1600,

        async copy(value) {
            const text = value ?? this.value ?? '';

            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                } else {
                    this.legacyCopy(text);
                }
            } catch (error) {
                this.legacyCopy(text);
            }

            this.copied = true;
            emit(this, 'magma-copy:done', { value: text });

            window.setTimeout(() => {
                this.copied = false;
            }, this.feedbackDuration);
        },

        legacyCopy(text) {
            const helper = document.createElement('textarea');

            helper.value = text;
            helper.setAttribute('readonly', '');
            helper.style.position = 'absolute';
            helper.style.left = '-9999px';

            document.body.appendChild(helper);
            helper.select();

            try {
                document.execCommand('copy');
            } catch (error) {
                console.warn('[magma-ui] copie impossible', error);
            }

            document.body.removeChild(helper);
        },
    };
}
