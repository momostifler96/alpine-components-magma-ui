/**
 * Émission d'événements.
 *
 * Les composants passent par ce point unique plutôt que d'appeler `$dispatch`
 * directement : le comportement reste ainsi utilisable hors d'Alpine (tests,
 * rendu serveur, scripts Node) sans planter.
 *
 * @param {object} scope   Le composant (porteur des magics Alpine).
 * @param {string} name    Nom de l'événement, préfixé `magma-`.
 * @param {object} [detail]
 * @returns {object} le détail transmis
 */
export function emit(scope, name, detail = {}) {
    if (scope && typeof scope.$dispatch === 'function') {
        scope.$dispatch(name, detail);
    }

    return detail;
}
