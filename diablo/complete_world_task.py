import json
from pathlib import Path
from datetime import datetime, timezone

root = Path(__file__).resolve().parent.parent
tasks_file = root / "diablo" / "tasks" / "tasks.json"
report_file = root / "diablo" / "logs" / "world-validation.json"
result_file = root / "diablo" / "logs" / "world-task-result.json"

if not tasks_file.exists() or not report_file.exists():
    raise SystemExit("ERREUR : fichier de tâches ou rapport introuvable.")

tasks = json.loads(tasks_file.read_text(encoding="utf-8"))
report = json.loads(report_file.read_text(encoding="utf-8"))

task_id = "9d3585f1-fbf3-4406-8564-abe9646c3db4"
task = next((item for item in tasks if item.get("id") == task_id), None)

if task is None:
    raise SystemExit("ERREUR : tâche d'analyse du monde introuvable.")

if report.get("status") != "PASS" or report.get("errors"):
    raise SystemExit("REFUS : le rapport de validation contient des erreurs.")

if report.get("countries_found") != 50:
    raise SystemExit("REFUS : le nombre de pays ne correspond pas.")

if report.get("regions_calculated") != 773:
    raise SystemExit("REFUS : le nombre de régions ne correspond pas.")

result = {
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "task_id": task_id,
    "task_title": task["title"],
    "validation_status": report["status"],
    "countries": report["countries_found"],
    "regions": report["regions_calculated"],
    "errors": report["errors"],
    "result": "validation_confirmed",
    "note": "Rapport vérifié. La tâche reste en attente d'approbation."
}

result_file.parent.mkdir(parents=True, exist_ok=True)
result_file.write_text(
    json.dumps(result, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8"
)

print("=== RÉSULTAT DE LA TÂCHE ===")
print(json.dumps(result, ensure_ascii=False, indent=2))
print("Le statut de la tâche reste inchangé.")
