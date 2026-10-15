/**
 * Pile de notifications flottantes.
 *
 * Écoute l'événement global `magma-notify` : n'importe quel composant ou appel
 * Livewire peut déclencher un message sans connaître la pile.
 *
 * Depuis Alpine :  $dispatch('magma-notify', { type: 'success', title: '…' })
 * Depuis Livewire : $this->dispatch('magma-notify', ...)
 * Depuis n'importe où : window.MagmaUI.notify({ … })
 */
export function createToasts(config = {}) {
    const duration = config.duration ?? 5000;
    const leaveDuration = config.leaveDuration ?? 200;

    return {
        items: [],

        /** Ajoute une notification et programme sa disparition. */
        push(payload = {}) {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

            this.items.push({
                id,
                type: payload.type ?? 'info',
                title: payload.title ?? '',
                message: payload.message ?? '',
                leaving: false,
            });

            const lifetime = payload.duration ?? duration;

            if (lifetime > 0) {
                window.setTimeout(() => this.remove(id), lifetime);
            }

            return id;
        },

        /**
         * Retire une notification en deux temps : on la marque `leaving` pour
         * déclencher l'animation de sortie, puis on la supprime une fois jouée.
         * Les directives `x-transition` ne s'appliquent pas aux enfants d'un
         * `x-for`, d'où cette classe intermédiaire.
         */
        remove(id) {
            const item = this.items.find((entry) => entry.id === id);

            if (!item || item.leaving) {
                return;
            }

            item.leaving = true;

            window.setTimeout(() => {
                this.items = this.items.filter((entry) => entry.id !== id);
            }, leaveDuration);
        },

        clear() {
            this.items = [];
        },
    };
}
