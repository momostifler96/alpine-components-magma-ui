import { emit } from '../emit.js';

/**
 * Interrupteur (mode test / production, statuts).
 *
 * Événements émis :
 *   - `magma-switch:change` { value }
 */
export function createSwitch(config = {}) {
    return {
        on: config.on ?? false,

        toggle() {
            this.on = !this.on;
            emit(this, 'magma-switch:change', { value: this.on });
        },

        set(value) {
            this.on = Boolean(value);
            emit(this, 'magma-switch:change', { value: this.on });
        },
    };
}
