"""Régénère `src/styles/magma-ui.css` depuis `resources/css/new-design.css`.

La feuille de l'application est la référence (maquettes) : les composants du
paquet en sont l'exacte transposition. Le générateur :

  1. reprend le bloc `:root` de l'app et renomme `--nd-*` en `--magma-*` ;
  2. écrit la base de la bibliothèque (typographie + remises à zéro) ;
  3. transcrit les règles de composants de l'app (classes, variables et noms
     d'animation renommés), via la table des composants renommés ;
  4. conserve telles quelles les règles propres à la bibliothèque (composants
     absents de l'app : copie, rafraîchissement, interrupteur, multi-sélection) ;
  5. n'émet que les `@keyframes` réellement utilisés.

Usage :
    python packages/magma-ui/scripts/generate-styles.py && npm run build
"""

import io
import re
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parents[3]
SOURCE = RACINE / "resources/css/new-design.css"
CIBLE = RACINE / "packages/magma-ui/src/styles/magma-ui.css"

# Composants de l'app dont le nom diffère dans la bibliothèque.
CORRESPONDANCE = [
    ("nd-chart__tabs", "magma-tabs"),
    ("nd-chart__tab", "magma-tab"),
    ("nd-faq__q", "magma-accordion__trigger"),
    ("nd-faq__a", "magma-accordion__panel"),
    ("nd-faq", "magma-accordion"),
]

# Composants et atomes repris dans le paquet. Le nom d'un composant suffit :
# ses modificateurs (`__element`, `--variante`) suivent.
GARDER = (
    "magma-btn", "magma-input", "magma-field", "magma-select", "magma-phone",
    "magma-menu", "magma-modal", "magma-accordion", "magma-tab", "magma-pagination",
    "magma-toast", "magma-search", "magma-badge", "magma-chip", "magma-scroll",
    "magma-animate", "magma-stagger", "magma-fade", "magma-zoom", "magma-collapse",
    "magma-spin", "magma-rise", "magma-pulse", "magma-progress", "magma-shimmer",
)

# Références fautives des règles écrites à la main : la variable n'existe nulle
# part sous ce nom, la déclaration était donc ignorée par le navigateur.
REPARATIONS = {
    "--magma-focus": "--magma-focus-ring",
}

# Jetons que seul le positionneur renseigne (en style en ligne), ou défauts que
# la bibliothèque doit fournir.
JETONS_BIBLIOTHEQUE = {
    "--magma-menu-min-width": "0px",
}

# Base écrite par le générateur : typographie puis remises à zéro. La portée
# vise tout élément portant une classe `magma-` : les composants restent justes
# sans conteneur, exactement comme dans l'application. `:where()` garde une
# spécificité nulle, donc les classes de composants reprennent toujours la main.
BASE = """/* Typographie héritée par les composants. */
[class^="magma-"],
[class*=" magma-"] {
    font-family: var(--magma-font);
    color: var(--magma-body);
    font-size: 15px;
    line-height: 1.45;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* Conteneur facultatif : il fixe le contexte typographique d'un groupe. */
.magma-root,
[data-magma] {
    font-family: var(--magma-font);
    color: var(--magma-body);
    font-size: 15px;
    line-height: 1.45;
    -webkit-font-smoothing: antialiased;
}

/*
 * Remises à zéro locales : l'application hôte n'a rien à neutraliser avant
 * d'utiliser un composant. Chaque sélecteur vise l'élément lui-même quand il
 * porte la classe (`<button class="magma-btn">`) autant que ses descendants,
 * et `:where()` le laisse à spécificité nulle.
 */
:where(h1[class^="magma-"], h1[class*=" magma-"], h2[class^="magma-"], h2[class*=" magma-"],
       h3[class^="magma-"], h3[class*=" magma-"], h4[class^="magma-"], h4[class*=" magma-"],
       h5[class^="magma-"], h5[class*=" magma-"], p[class^="magma-"], p[class*=" magma-"],
       figure[class^="magma-"], figure[class*=" magma-"],
       [class^="magma-"] h1, [class*=" magma-"] h1, [class^="magma-"] h2, [class*=" magma-"] h2,
       [class^="magma-"] h3, [class*=" magma-"] h3, [class^="magma-"] h4, [class*=" magma-"] h4,
       [class^="magma-"] h5, [class*=" magma-"] h5, [class^="magma-"] p, [class*=" magma-"] p,
       [class^="magma-"] figure, [class*=" magma-"] figure) {
    margin: 0;
}

:where(button[class^="magma-"], button[class*=" magma-"],
       [class^="magma-"] button, [class*=" magma-"] button) {
    font: inherit;
    color: inherit;
    border: 0;
    background: none;
    cursor: pointer;
}

:where(input[class^="magma-"], input[class*=" magma-"], select[class^="magma-"], select[class*=" magma-"],
       textarea[class^="magma-"], textarea[class*=" magma-"],
       [class^="magma-"] input, [class*=" magma-"] input,
       [class^="magma-"] select, [class*=" magma-"] select,
       [class^="magma-"] textarea, [class*=" magma-"] textarea) {
    font: inherit;
    color: inherit;
}

:where(img[class^="magma-"], img[class*=" magma-"], [class^="magma-"] img, [class*=" magma-"] img) {
    display: block;
    max-width: 100%;
}

:where(svg[class^="magma-"], svg[class*=" magma-"], [class^="magma-"] svg, [class*=" magma-"] svg) {
    display: block;
    flex: none;
}

:where([x-cloak][class^="magma-"], [x-cloak][class*=" magma-"],
       [class^="magma-"] [x-cloak], [class*=" magma-"] [x-cloak]) {
    display: none !important;
}

/*
 * Calcul de largeur : les panneaux flottants se positionnent au pixel à partir
 * de `border-box`. Un padding hérité en `content-box` les décalerait.
 */
[class^="magma-"],
[class*=" magma-"] {
    box-sizing: border-box;
}

/* Éléments décoratifs ------------------------------------------------------ */
.magma-icon {
    display: block;
    flex: none;
}

.magma-flag {
    display: block;
    flex: none;
    border-radius: 3px;
    overflow: hidden;
}

.magma-sr {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
}
"""


def parser(texte):
    """Règles dans l'ordre du fichier : {type, media, selecteur, corps}."""
    texte = re.sub(r"/\*.*?\*/", "", texte, flags=re.S)
    regles = []
    media = []
    position = 0

    while position < len(texte):
        ouverture = texte.find("{", position)
        fermeture = texte.find("}", position)

        if ouverture == -1 and fermeture == -1:
            break

        if ouverture != -1 and (fermeture == -1 or ouverture < fermeture):
            selecteur = " ".join(texte[position:ouverture].split())

            if selecteur.startswith("@keyframes"):
                fin = fin_du_bloc(texte, ouverture)
                regles.append({
                    "type": "keyframes",
                    "media": "",
                    "selecteur": selecteur,
                    "corps": texte[ouverture + 1:fin].strip(),
                })
                position = fin + 1
                continue

            if selecteur.startswith("@"):
                media.append(selecteur)
                position = ouverture + 1
                continue

            fin = texte.find("}", ouverture)
            regles.append({
                "type": "regle",
                "media": media[0] if media else "",
                "selecteur": selecteur,
                "corps": texte[ouverture + 1:fin].strip(),
            })
            position = fin + 1
            continue

        if media:
            media.pop()

        position = fermeture + 1

    return regles


def fin_du_bloc(texte, ouverture):
    """Index de l'accolade fermante correspondant à celle ouverte en `ouverture`."""
    profondeur = 0
    for index in range(ouverture, len(texte)):
        if texte[index] == "{":
            profondeur += 1
        elif texte[index] == "}":
            profondeur -= 1
            if profondeur == 0:
                return index

    return len(texte) - 1


def renommer(selecteur):
    for avant, apres in CORRESPONDANCE:
        selecteur = selecteur.replace(avant, apres)

    return re.sub(r"\bnd-", "magma-", selecteur)


def renommer_valeurs(corps):
    """Renomme les variables ET les noms d'animation (`nd-spin` -> `magma-spin`)."""
    corps = re.sub(r"--nd-", "--magma-", corps)

    return re.sub(r"(?<![\w.-])nd-", "magma-", corps)


def renommer_jeton(nom):
    return re.sub(r"^--nd-", "--magma-", nom)


def tokens(regles):
    jetons = {}
    for regle in regles:
        if regle["selecteur"] not in (":root", "html"):
            continue
        for morceau in regle["corps"].split(";"):
            if morceau.strip().startswith("--") and ":" in morceau:
                nom, valeur = morceau.split(":", 1)
                jetons[renommer_jeton(nom.strip())] = " ".join(valeur.split())
    return jetons


def classes(selecteur):
    return re.findall(r"\.([A-Za-z0-9_-]+)", selecteur)


def bloc(selecteur, corps, media="", indentation=1):
    prefixe = "    " * indentation
    lignes = []
    for ligne in corps.splitlines():
        if ligne.strip():
            lignes.append(prefixe + ligne.strip() if indentation == 1 else prefixe + ligne.strip())
    regle = f"{selecteur} {{\n" + "\n".join(lignes) + "\n}"

    return f"{media} {{\n{regle}\n}}\n" if media else regle + "\n"


def main():
    app = parser(io.open(SOURCE, encoding="utf-8").read())
    biblio_actuelle = parser(io.open(CIBLE, encoding="utf-8").read())

    app_classes = set()
    for regle in app:
        app_classes.update(classes(renommer(regle["selecteur"])))

    # --- Jetons -------------------------------------------------------------
    jetons_app = tokens(app)
    jetons_propres = {n: v for n, v in tokens(biblio_actuelle).items() if n not in jetons_app}
    jetons_propres.update(JETONS_BIBLIOTHEQUE)

    # --- Règles de composants reprises de l'app -----------------------------
    portees = []
    for regle in app:
        if regle["type"] != "regle":
            continue
        selecteur = renommer(regle["selecteur"])
        if not any(prefixe in selecteur for prefixe in GARDER):
            continue
        portees.append({
            "media": regle["media"],
            "selecteur": selecteur,
            "corps": renommer_valeurs(regle["corps"]),
        })

    # --- Règles propres à la bibliothèque ----------------------------------
    propres = []
    for regle in biblio_actuelle:
        if regle["type"] != "regle":
            continue
        noms = classes(regle["selecteur"])
        if not noms or regle["selecteur"] in (":root", "html"):
            continue
        if any(nom in app_classes for nom in noms):
            continue
        if "magma-root" in regle["selecteur"] or "data-magma" in regle["selecteur"]:
            continue
        propres.append({
            "media": regle["media"],
            "selecteur": regle["selecteur"],
            "corps": renommer_valeurs(regle["corps"]),
        })

    # --- Assemblage ---------------------------------------------------------
    morceaux = [
        "/* --------------------------------------------------------------------------",
        "   Magma UI — styles des composants",
        "",
        "   Fichier GÉNÉRÉ par packages/magma-ui/scripts/generate-styles.py à partir de",
        "   resources/css/new-design.css : l'application est la référence, la",
        "   bibliothèque en est la transposition exacte sous les noms `magma-`.",
        "",
        "   Corriger un style dans l'application, puis :",
        "       python packages/magma-ui/scripts/generate-styles.py && npm run build",
        "   -------------------------------------------------------------------------- */",
        "",
        "/* --------------------------------------------------------------------------",
        "   1. Jetons",
        "   -------------------------------------------------------------------------- */",
        ":root {",
    ]

    for nom, valeur in jetons_app.items():
        morceaux.append(f"    {nom}: {valeur};")

    if jetons_propres:
        morceaux.append("")
        morceaux.append("    /* Ajouts propres à la bibliothèque. */")
        for nom, valeur in jetons_propres.items():
            morceaux.append(f"    {nom}: {valeur};")

    morceaux.append("}")
    morceaux.append("")

    morceaux.append("/* --------------------------------------------------------------------------")
    morceaux.append("   2. Base : typographie et remises à zéro")
    morceaux.append("   -------------------------------------------------------------------------- */")
    morceaux.append(BASE.rstrip())
    morceaux.append("")

    morceaux.append("/* --------------------------------------------------------------------------")
    morceaux.append("   3. Composants — transposition des styles de l'application")
    morceaux.append("   -------------------------------------------------------------------------- */")

    for regle in portees:
        morceaux.append(bloc(regle["selecteur"], regle["corps"], regle["media"]).rstrip())

    morceaux.append("")
    morceaux.append("/* --------------------------------------------------------------------------")
    morceaux.append("   4. Composants propres à la bibliothèque")
    morceaux.append("   -------------------------------------------------------------------------- */")

    for regle in propres:
        morceaux.append(bloc(regle["selecteur"], regle["corps"], regle["media"]).rstrip())

    corps_principal = "\n".join(morceaux)

    # --- Animations : uniquement celles réellement utilisées ----------------
    utilisees = set()
    for declaration in re.findall(r"animation(?:-name)?\s*:\s*([^;]+)", corps_principal):
        for animation in declaration.split(","):
            premier = animation.strip().split()
            if premier and re.fullmatch(r"[a-zA-Z-]+", premier[0]):
                utilisees.add(premier[0])

    animations = []
    for regle in app + biblio_actuelle:
        if regle["type"] != "keyframes":
            continue
        nom = renommer(regle["selecteur"]).split()[-1]
        if nom in utilisees:
            animations.append((nom, regle["corps"]))

    vues = set()
    morceaux.append("")
    morceaux.append("/* --------------------------------------------------------------------------")
    morceaux.append("   5. Animations")
    morceaux.append("   -------------------------------------------------------------------------- */")

    for nom, corps in animations:
        if nom in vues:
            continue
        vues.add(nom)
        morceaux.append(f"@keyframes {nom} {{")
        niveau = 1
        for ligne in corps.splitlines():
            if not ligne.strip():
                continue
            if ligne.strip().startswith("}"):
                niveau = max(1, niveau - 1)
            morceaux.append("    " * niveau + ligne.strip())
            if ligne.strip().endswith("{"):
                niveau += 1
        morceaux.append("}")
        morceaux.append("")
        morceaux.append("")

    texte = "\n".join(morceaux).rstrip() + "\n"

    for avant, apres in REPARATIONS.items():
        texte = re.sub(re.escape(avant) + r"\b(?!-)", apres, texte)

    # Contrôle : toute variable appelée doit être définie quelque part.
    definis = set(re.findall(r"(--[A-Za-z0-9_-]+)\s*:", texte))
    utilises = set(re.findall(r"var\(\s*(--[A-Za-z0-9_-]+)", texte))
    manquants = sorted(v for v in utilises if v not in definis)

    io.open(CIBLE, "w", encoding="utf-8", newline="\n").write(texte)

    print(f"jetons : {len(jetons_app)} de l'app + {len(jetons_propres)} propres")
    print(f"règles portées depuis l'app : {len(portees)}")
    print(f"règles propres à la bibliothèque : {len(propres)}")
    print(f"animations retenues : {', '.join(sorted(vues)) or 'aucune'}")
    print(f"-> {CIBLE.relative_to(RACINE)} : {len(texte.splitlines())} lignes")

    if manquants:
        print("\nvariables utilisées mais non définies (à corriger) :")
        for nom in manquants:
            usages = len(re.findall(r"var\(\s*" + re.escape(nom) + r"\b", texte))
            print(f"  {nom} ({usages} usages)")

    return 0


if __name__ == "__main__":
    sys.exit(main())
