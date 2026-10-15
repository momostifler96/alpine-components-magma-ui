"""Compare les feuilles de style de l'app (nd-) et de la bibliothèque (magma-).

Trois rapports :
  1. les tokens `:root` dont la valeur diffère ;
  2. les composants dont des sélecteurs manquent dans la bibliothèque ;
  3. les sélecteurs communs dont une déclaration diverge.
"""

import io
import re
import sys

APP = "resources/css/new-design.css"
LIB = "packages/magma-ui/src/styles/magma-ui.css"

COMPOSANTS = [
    "btn", "select", "multi", "phone", "modal", "dropdown", "accordion", "tab",
    "switch", "pagination", "toast", "search", "refresh", "copy", "input",
    "field", "label", "badge", "chip", "caret", "menu", "option", "toggle",
]


def declarations(corps):
    resultat = {}
    for morceau in corps.split(";"):
        if ":" not in morceau:
            continue
        propriete, valeur = morceau.split(":", 1)
        resultat[propriete.strip()] = " ".join(valeur.split())
    return resultat


def lire(chemin):
    texte = re.sub(r"/\*.*?\*/", "", io.open(chemin, encoding="utf-8").read(), flags=re.S)

    regles = {}
    media = []
    position = 0

    while position < len(texte):
        ouverture = texte.find("{", position)
        fermeture = texte.find("}", position)

        if ouverture == -1 and fermeture == -1:
            break

        if ouverture != -1 and (fermeture == -1 or ouverture < fermeture):
            selecteur = " ".join(texte[position:ouverture].split())

            if selecteur.startswith("@"):
                media.append(selecteur)
                position = ouverture + 1
                continue

            fin = texte.find("}", ouverture)
            cle = (selecteur, media[0] if media else "")
            regles.setdefault(cle, {}).update(declarations(texte[ouverture + 1:fin]))
            position = fin + 1
            continue

        if media:
            media.pop()

        position = fermeture + 1

    return regles


def normaliser(texte):
    """Aligne les noms : classes, variables et noms d'animation."""
    texte = re.sub(r"--nd-", "--magma-", texte)

    return re.sub(r"(?<![\w.-])nd-", "magma-", texte)


def resoudre(valeur, jetons, profondeur=6):
    """Remplace les `var()` par leur valeur pour comparer le rendu réel."""
    def remplacer(correspondance):
        nom = correspondance.group(1)
        defaut = correspondance.group(2)

        if nom in jetons and profondeur > 0:
            return resoudre(jetons[nom], jetons, profondeur - 1)

        return defaut.strip() if defaut else ""

    return re.sub(r"var\(\s*(--[A-Za-z0-9_-]+)\s*(?:,([^()]*))?\)", remplacer, valeur)


def interessant(selecteur):
    return any(f".magma-{composant}" in selecteur for composant in COMPOSANTS)


def jetons(chemin):
    """Tokens déclarés dans les sélecteurs de base d'un fichier."""
    trouves = {}
    for (selecteur, _), declarations in lire(chemin).items():
        if selecteur not in (":root", "html"):
            continue
        for nom, valeur in declarations.items():
            if nom.startswith("--"):
                trouves[normaliser(nom)] = valeur

    return trouves


def preparer(chemin):
    jetons_locaux = jetons(chemin)
    resultat = {}

    for (selecteur, media), declarations in lire(chemin).items():
        propre = normaliser(selecteur)
        if not selecteur.startswith(".") or not interessant(propre):
            continue

        resultat[(propre, media)] = {
            propriete: resoudre(normaliser(valeur), jetons_locaux)
            for propriete, valeur in declarations.items()
        }

    return resultat


def main():
    app = preparer(APP)
    lib = preparer(LIB)

    manquants = sorted(k for k in app if k not in lib)
    print(f"=== {len(manquants)} sélecteurs de l'app absents de la bibliothèque ===")
    for selecteur, media in manquants:
        print(f"  {selecteur}   {('@' + media[:40]) if media else ''}")

    print()
    print("=== déclarations divergentes sur les sélecteurs communs ===")
    total = 0
    for cle in sorted(app):
        if cle not in lib:
            continue
        for propriete, attendu in app[cle].items():
            obtenu = lib[cle].get(propriete)
            if obtenu != attendu:
                if total < 40:
                    print(f"  {cle[0]} :: {propriete}")
                    print(f"      app    = {attendu}")
                    print(f"      biblio = {obtenu}")
                total += 1

    print(f"  -> {total} déclarations divergentes")
    return 0 if not manquants and total == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
