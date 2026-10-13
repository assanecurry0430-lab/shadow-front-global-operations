import { mkdir, appendFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { listMessages } from "./communication/messageStore.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const logDir = path.join(root, "logs");
const logFile = path.join(logDir, "diablo.jsonl");
const configFile = path.join(root, "config", "project.json");

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

let config;

try {
  config = JSON.parse(await readFile(configFile, "utf8"));
} catch (error) {
  console.error("Impossible de charger la configuration de Diablo :", error.message);
  process.exit(1);
}

if (
  config.project?.name !== "SHADOW FRONT: GLOBAL OPERATIONS" ||
  config.engine?.target !== "Roblox Studio" ||
  !config.engine?.excludedTargets?.includes("Unreal Engine 5") ||
  config.delivery?.archiveName !== "SFO_FINAL.zip" ||
  config.safety?.humanApprovalForImportantChanges !== true
) {
  console.error("Configuration de Diablo invalide ou incomplète.");
  process.exit(1);
}

await log("orchestrator_started", {
  project: config.project.name,
  engineTarget: config.engine.target,
  excludedTargets: config.engine.excludedTargets,
  finalArchive: config.delivery.archiveName,
  integrationPhase: config.engine.integrationPhase,
  aiCoordination: config.aiCoordination,
  autonomousTasksEnabled: false,
  humanApprovalRequired: config.safety.humanApprovalForImportantChanges
});

console.log("Diablo a chargé et vérifié sa configuration.");
console.log("Moteur cible : Roblox Studio.");
const messages = await listMessages();
const queuedMessages = messages.filter((message) => message.status === "queued");

await log("message_store_checked", {
  totalMessages: messages.length,
  queuedMessages: queuedMessages.length,
  messagesExecuted: false
});

console.log(`Boîte de messages : ${messages.length} message(s).`);
console.log(`Messages en attente : ${queuedMessages.length}.`);
console.log("Les messages ne sont pas exécutés automatiquement.");
console.log("La connexion aux IA externes reste à configurer.");
console.log("Aucune tâche autonome n'a été exécutée.");
