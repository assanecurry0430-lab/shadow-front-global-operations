import { mkdir, appendFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const logDir = path.join(root, "logs");
const logFile = path.join(logDir, "diablo.jsonl");

async function log(event, details = {}) {
  await mkdir(logDir, { recursive: true });

  const entry = {
    timestamp: new Date().toISOString(),
    event,
    details
  };

  await appendFile(logFile, JSON.stringify(entry) + "\n", "utf8");
  console.log(JSON.stringify(entry, null, 2));
}

await log("orchestrator_started", {
  project: "SHADOW FRONT: GLOBAL OPERATIONS",
  mode: "initialization_only",
  autonomousTasksEnabled: false
});

console.log("Diablo est initialisé. Aucune modification de SFO n'a été effectuée.");
