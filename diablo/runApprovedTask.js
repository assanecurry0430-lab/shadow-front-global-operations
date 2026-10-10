import { readFile, appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url));
const taskId = process.argv[2];
if (!taskId) { console.error("Identifiant de tâche obligatoire."); process.exit(1); }
const tasks = JSON.parse(await readFile(path.join(root, "tasks", "tasks.json"), "utf8"));
const task = tasks.find(t => t.id === taskId);
if (!task || task.status !== "approved") { console.error("Refus : tâche introuvable ou non approuvée."); process.exit(1); }
if (task.title !== "Analyser les données du monde SFO") { console.error("Refus : type de tâche non autorisé."); process.exit(1); }
const report = JSON.parse(await readFile(path.join(root, "logs", "world-validation.json"), "utf8"));
if (report.status !== "PASS" || report.countries_found !== 50 || report.regions_calculated !== 773 || report.errors.length !== 0) { console.error("Refus : rapport invalide."); process.exit(1); }
const result = { timestamp: new Date().toISOString(), taskId, status: "success", countries: 50, regions: 773, filesModified: [] };
const logDir = path.join(root, "logs");
await mkdir(logDir, { recursive: true });
await appendFile(path.join(logDir, "task-execution.jsonl"), JSON.stringify(result) + "\n", "utf8");
console.log("EXÉCUTION RÉUSSIE");
console.log(JSON.stringify(result, null, 2));
