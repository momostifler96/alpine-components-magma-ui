import { emit } from '../emit.js';
import { lockDocumentScroll, unlockDocumentScroll } from '../overlay.js';

/**
 * Feuille (bottom sheet) : panneau ancré en bas, avec glisser-fermer.
 *
 * La feuille glisse depuis le bas à l'ouverture et repart vers le bas à la
 * fermeture. La poignée permet de la tirer vers le bas : au-delà d'un seuil (ou
 * avec une vitesse suffisante), elle se ferme ; sinon elle revient en place avec
 * la transition de la feuille de style.
 *
 * Événements émis :
 *   - `magma-sheet:opened` { name }
 *   - `magma-sheet:closed` { name }
 *
 * Commandes écoutées dans le balisage :
 *   - `magma-sheet:open`  { name }
 *   - `magma-sheet:close` { name }
 */
export function createSheet(config = {}) {
    return {
        open: config.open ?? false,
        name: config.name ?? null,
        lockScroll: config.lockScroll ?? true,
        closeOnBackdrop: config.closeOnBackdrop ?? true,
        swipeToClose: config.swipeToClose ?? true,
        maxHeight: config.maxHeight ?? null,
        locked: false,

        dragging: false,
        dismissing: false,
        dragOffset: 0,
        previousFocus: null,
        velocity: 0,
        dragStartY: 0,
        lastY: 0,
        lastTime: 0,
        resetTimer: null,

        init() {
            this._onPointerMove = (event) => this.onDragMove(event);
            this._onPointerEnd = () => this.onDragEnd();

            if (this.open) {
                this.previousFocus = document.activeElement;
                this.lock();
                this.$nextTick(() => this.$refs.panel?.focus({ preventScroll: true }));
            }

            this.$watch('open', (value) => {
                value ? this.lock() : this.unlock();
            });
        },

        destroy() {
            this.detachDrag();
            window.clearTimeout(this.resetTimer);
            this.unlock();
        },

        get panelStyle() {
            const parts = [];

            if (this.maxHeight !== null && this.maxHeight !== undefined && this.maxHeight !== '') {
                const value = typeof this.maxHeight === 'number' ? `${this.maxHeight}px` : this.maxHeight;
                parts.push(`--magma-sheet-max-height: ${value}`);
            }

            if (this.dragging || this.dismissing) {
                parts.push(`transform: translateY(${Math.round(this.dragOffset)}px)`);
            }

            return parts.join('; ');
        },

        show() {
            if (this.open) {
                return;
            }

            window.clearTimeout(this.resetTimer);
            this.previousFocus = document.activeElement;
            this.resetDrag();
            this.open = true;
            emit(this, 'magma-sheet:opened', { name: this.name });
            this.$nextTick(() => this.$refs.panel?.focus({ preventScroll: true }));
        },

        hide(options = {}) {
            if (!this.open) {
                return;
            }

            this.detachDrag();
            this.open = false;

            if (options?.keepTransform) {
                // La feuille est déjà hors écran : on garde la transformation
                // le temps que la transition de sortie se termine.
                this.resetTimer = window.setTimeout(() => this.resetDrag(), 300);
            } else {
                this.resetDrag();
            }

            emit(this, 'magma-sheet:closed', { name: this.name });

            this.$nextTick(() => {
                this.previousFocus?.focus?.({ preventScroll: true });
                this.previousFocus = null;
            });
        },

        toggle() {
            this.open ? this.hide() : this.show();
        },

        onBackdrop() {
            if (this.closeOnBackdrop) {
                this.hide();
            }
        },

        startDrag(event) {
            if (!this.swipeToClose || !this.open || this.dismissing || event.button > 0) {
                return;
            }

            event.preventDefault();
            this.dragging = true;
            this.dismissing = false;
            this.dragOffset = 0;
            this.velocity = 0;
            this.dragStartY = event.clientY;
            this.lastY = event.clientY;
            this.lastTime = performance.now();

            try {
                this.$refs.panel?.setPointerCapture?.(event.pointerId);
            } catch {
                // Certains environnements (événements synthétiques, navigateurs
                // anciens) refusent la capture ; le glissement reste fonctionnel.
            }

            window.addEventListener('pointermove', this._onPointerMove, { passive: false });
            window.addEventListener('pointerup', this._onPointerEnd, { once: true });
            window.addEventListener('pointercancel', this._onPointerEnd, { once: true });
        },

        onDragMove(event) {
            if (!this.dragging) {
                return;
            }

            if (event.cancelable) {
                event.preventDefault();
            }

            const now = performance.now();
            const elapsed = Math.max(1, now - this.lastTime);

            this.velocity = (event.clientY - this.lastY) / elapsed;
            this.lastY = event.clientY;
            this.lastTime = now;
            this.dragOffset = Math.max(0, event.clientY - this.dragStartY);
        },

        onDragEnd() {
            if (!this.dragging) {
                return;
            }

            this.detachDrag();

            const height = this.$refs.panel?.offsetHeight ?? 420;
            const threshold = Math.min(160, height * 0.3);

            // Une pause avant de relâcher annule le « flick » : sans cela, un
            // geste rapide suivi d'un temps d'arrêt fermerait quand même.
            if (performance.now() - this.lastTime > 100) {
                this.velocity = 0;
            }

            const flickDistance = Math.max(48, height * 0.2);
            const shouldClose = this.dragOffset > threshold
                || (this.dragOffset > flickDistance && this.velocity > 0.65);

            this.dragging = false;

            if (!shouldClose) {
                this.dragOffset = 0;
                return;
            }

            this.dismissing = true;
            this.dragOffset = height;

            window.setTimeout(() => {
                this.hide({ keepTransform: true });
            }, 220);
        },

        detachDrag() {
            window.removeEventListener('pointermove', this._onPointerMove);
            window.removeEventListener('pointerup', this._onPointerEnd);
            window.removeEventListener('pointercancel', this._onPointerEnd);
        },

        resetDrag() {
            this.dragging = false;
            this.dismissing = false;
            this.dragOffset = 0;
            this.velocity = 0;
        },

        lock() {
            if (this.lockScroll && !this.locked) {
                lockDocumentScroll();
                this.locked = true;
            }
        },

        unlock() {
            if (this.lockScroll && this.locked) {
                unlockDocumentScroll();
                this.locked = false;
            }
        },
    };
}
