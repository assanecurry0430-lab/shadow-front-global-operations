import {
  readFile,
  writeFile,
  appendFile,
  mkdir
} from "node:fs/promises";
import path from "node:path";
import { unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const tasksFile = path.join(root, "tasks", "tasks.json");
const reportFile = path.join(root, "logs", "world-validation.json");
const logDir = path.join(root, "logs");
const executionLog = path.join(logDir, "task-execution.jsonl");

const taskId = process.argv[2];
const allowedTitle = "Analyser les données du monde SFO";

async function saveTasks(tasks) {
  await writeFile(
    tasksFile,
    JSON.stringify(tasks, null, 2) + "\n",
    "utf8"
  );
}

async function logResult(result) {
  await mkdir(logDir, { recursive: true });
  await appendFile(
    executionLog,
    JSON.stringify(result) + "\n",
    "utf8"
  );
}

if (!taskId) {
  console.error("Utilisation : node runApprovedTask.js <identifiant>");
  process.exit(1);
}

const lockFile = path.join(root, "tasks", "execution.lock");

try {
  const { open } = await import("node:fs/promises");
  const lockHandle = await open(lockFile, "wx");
  await lockHandle.close();
} catch (error) {
  if (error.code === "EEXIST") {
    console.error("Refus : une exécution est déjà en cours ou le verrou doit être vérifié manuellement.");
    process.exit(1);
  }
  throw error;
}

process.on("exit", () => {
  try {
    unlinkSync(lockFile);
  } catch {
    // Conserver toute erreur de nettoyage sans masquer le résultat.
  }
});

let tasks;
try {
  tasks = JSON.parse(await readFile(tasksFile, "utf8"));
} catch (error) {
  console.error("Impossible de lire les tâches :", error.message);
  process.exit(1);
}

const index = tasks.findIndex(task => task.id === taskId);

if (index === -1) {
  console.error("Refus : tâche introuvable.");
  process.exit(1);
}

const task = tasks[index];

if (task.status !== "approved") {
  console.error(
    `Refus : la tâche doit être approuvée. Statut actuel : ${task.status}`
  );
  process.exit(1);
}

if (task.title !== allowedTitle) {
  console.error("Refus : type de tâche non autorisé.");
  process.exit(1);
}

tasks[index] = {
  ...task,
  status: "running",
  startedAt: new Date().toISOString()
};

await saveTasks(tasks);

try {
  const report = JSON.parse(await readFile(reportFile, "utf8"));

  if (
    report.status !== "PASS" ||
    report.countries_found !== 50 ||
    report.regions_calculated !== 773 ||
    !Array.isArray(report.errors) ||
    report.errors.length !== 0
  ) {
    throw new Error("Rapport de validation invalide.");
  }

  const result = {
    timestamp: new Date().toISOString(),
    taskId,
    status: "success",
    countries: report.countries_found,
    regions: report.regions_calculated,
    filesModified: [],
    note: "Rapport vérifié ; données du monde non modifiées."
  };

  tasks[index] = {
    ...tasks[index],
    status: "completed",
    completedAt: result.timestamp,
    executionResult: "success"
  };

  await saveTasks(tasks);
  await logResult(result);

  console.log("EXÉCUTION RÉUSSIE");
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  const timestamp = new Date().toISOString();

  tasks[index] = {
    ...tasks[index],
    status: "failed",
    failedAt: timestamp,
    failureReason: error.message
  };

  await saveTasks(tasks);

  await logResult({
    timestamp,
    taskId,
    status: "failed",
    error: error.message
  });

  console.error("ÉCHEC DE LA TÂCHE :", error.message);
  process.exitCode = 1;
}
