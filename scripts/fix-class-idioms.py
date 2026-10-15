"""Réécrit `cond && 'classe'` en `cond ? 'classe' : ''` dans les attributs :class.

Alpine 3.17 (et au-delà) écrit la valeur booléenne telle quelle dans l'attribut
`class` : un `&&` qui vaut `false` produit une classe parasite « false ».
Le ternaire renvoie une chaîne vide dans les deux versions d'Alpine.

Usage : python scripts/fix-class-idioms.py <fichier...>
"""

import re
import sys
from pathlib import Path

IDIOME = re.compile(r"&&\s*'([A-Za-z0-9_-]+)'")
ATTRIBUT = re.compile(r'(:class|x-bind:class)="([^"]*)"', re.S)


def remplacer(match: "re.Match[str]") -> str:
    return f"? '{match.group(1)}' : ''"


def corriger(chemin: Path) -> int:
    # newline='' : les fins de ligne d'origine (LF ou CRLF) sont conservées telles quelles.
    with chemin.open("r", encoding="utf-8", newline="") as fichier:
        texte = fichier.read()

    total = 0

    def traiter(attribut: "re.Match[str]") -> str:
        nonlocal total
        corps, nombre = IDIOME.subn(remplacer, attribut.group(2))
        total += nombre
        return f'{attribut.group(1)}="{corps}"'

    resultat = ATTRIBUT.sub(traiter, texte)

    if total:
        with chemin.open("w", encoding="utf-8", newline="") as fichier:
            fichier.write(resultat)

    return total


def main() -> int:
    if len(sys.argv) < 2:
        print("usage : fix-class-idioms.py <fichier...>", file=sys.stderr)
        return 2

    for argument in sys.argv[1:]:
        chemin = Path(argument)
        print(f"{chemin} : {corriger(chemin)} remplacement(s)")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
