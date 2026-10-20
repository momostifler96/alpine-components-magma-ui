/**
 * Verrouillage du défilement partagé par les surfaces superposées.
 *
 * Plusieurs couches peuvent être ouvertes en même temps (modale, tiroir,
 * feuille). Un simple `overflow: hidden` posé par chacune puis retiré par la
 * première fermée rendrait la page défilante alors qu'une autre couche est
 * encore ouverte. Le compteur ne restaure donc le défilement qu'à la dernière
 * fermeture, et rend la valeur qui était en place avant la première ouverture.
 */

let locks = 0;
let previousOverflow = '';

export function lockDocumentScroll() {
    if (typeof document === 'undefined') {
        return;
    }

    if (locks === 0) {
        previousOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = 'hidden';
    }

    locks += 1;
}

export function unlockDocumentScroll() {
    if (typeof document === 'undefined' || locks === 0) {
        return;
    }

    locks -= 1;

    if (locks === 0) {
        document.documentElement.style.overflow = previousOverflow;
        previousOverflow = '';
    }
}
