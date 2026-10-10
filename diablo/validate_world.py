import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORLD_FILE = ROOT / "data" / "world.json"
REPORT_DIR = ROOT / "diablo" / "logs"

EXPECTED_COUNTRIES = 50
EXPECTED_CONTINENTS = {
    "Vardessia": 17,
    "Kaelthara": 17,
    "Ormethys": 16,
}

errors = []
warnings = []

def fail(message):
    errors.append(message)

try:
    with WORLD_FILE.open("r", encoding="utf-8") as file:
        world = json.load(file)
except (OSError, json.JSONDecodeError) as exc:
    print(f"ERREUR : impossible de lire le monde SFO : {exc}")
    sys.exit(1)

countries = world.get("countries")
continents = world.get("continents")

if not isinstance(countries, list):
    fail("'countries' doit être une liste.")
    countries = []

if not isinstance(continents, list):
    fail("'continents' doit être une liste.")
    continents = []

country_names = [
    country.get("name")
    for country in countries
    if isinstance(country, dict)
]

if len(countries) != EXPECTED_COUNTRIES:
    fail(f"{EXPECTED_COUNTRIES} pays attendus, {len(countries)} trouvés.")

if world.get("country_count") != len(countries):
    fail("Le nombre de pays déclaré ne correspond pas au nombre réel.")

if len(country_names) != len(set(country_names)):
    fail("Des noms de pays sont dupliqués.")

actual_continents = {
    continent.get("name"): continent.get("country_count")
    for continent in continents
    if isinstance(continent, dict)
}

if actual_continents != EXPECTED_CONTINENTS:
    fail("Les continents ou leurs nombres de pays ne correspondent pas aux attentes.")

region_total = 0

for country in countries:
    if not isinstance(country, dict):
        fail("Une entrée de pays n'est pas un objet JSON.")
        continue

    name = country.get("name", "<sans nom>")
    regions = country.get("regions")

    if not isinstance(regions, list):
        fail(f"{name} : 'regions' doit être une liste.")
        continue

    count = len(regions)
    region_total += count

    if not 14 <= count <= 17:
        fail(f"{name} : {count} régions ; 14 à 17 attendues.")

if world.get("region_count") != region_total:
    fail(
        f"Total déclaré : {world.get('region_count')}, "
        f"total calculé : {region_total}."
    )

report = {
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "project": "SHADOW FRONT: GLOBAL OPERATIONS",
    "world_file": str(WORLD_FILE.relative_to(ROOT)),
    "countries_expected": EXPECTED_COUNTRIES,
    "countries_found": len(countries),
    "continents": actual_continents,
    "regions_declared": world.get("region_count"),
    "regions_calculated": region_total,
    "errors": errors,
    "warnings": warnings,
    "status": "PASS" if not errors else "FAIL",
}

REPORT_DIR.mkdir(parents=True, exist_ok=True)
report_file = REPORT_DIR / "world-validation.json"
report_file.write_text(
    json.dumps(report, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)

print("=== VALIDATION AUTOMATIQUE DU MONDE SFO ===")
print(f"Pays : {len(countries)}/{EXPECTED_COUNTRIES}")
print(f"Régions : {region_total}")
print(f"Erreurs : {len(errors)}")
print(f"Statut : {report['status']}")
print(f"Rapport : {report_file.relative_to(ROOT)}")

for error in errors:
    print(f"ERREUR : {error}")

sys.exit(0 if not errors else 1)
