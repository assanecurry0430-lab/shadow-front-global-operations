import { mkdir, readFile, appendFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const messagesFile = path.join(currentDir, "messages.jsonl");

const allowedTypes = new Set([
  "task_request",
  "task_result",
  "review_request",
  "review_result",
  "error",
  "status_update"
]);

const allowedStatuses = new Set([
  "queued",
  "received",
  "acknowledged",
  "processing",
  "completed",
  "failed",
  "awaiting_approval"
]);

function validateMessageInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Le message doit être un objet.");
  }

  for (const field of ["from", "to", "type", "content"]) {
    if (typeof input[field] !== "string" || !input[field].trim()) {
      throw new Error(`Champ obligatoire invalide : ${field}`);
    }
  }

  if (!allowedTypes.has(input.type)) {
    throw new Error("Type de message non autorisé.");
  }

  if (input.status && !allowedStatuses.has(input.status)) {
    throw new Error("Statut de message non autorisé.");
  }

  if (
    input.taskId !== undefined &&
    input.taskId !== null &&
    typeof input.taskId !== "string"
  ) {
    throw new Error("taskId doit être une chaîne ou null.");
  }
}

export async function listMessages() {
  await mkdir(currentDir, { recursive: true });

  let raw;

  try {
    raw = await readFile(messagesFile, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }

  return raw
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch {
        throw new Error(`Message JSON invalide à la ligne ${index + 1}.`);
      }
    });
}

export async function enqueueMessage(input) {
  validateMessageInput(input);

  const message = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    from: input.from.trim(),
    to: input.to.trim(),
    type: input.type,
    status: input.status ?? "queued",
    taskId: input.taskId ?? null,
    content: input.content.trim()
  };

  await appendFile(
    messagesFile,
    JSON.stringify(message) + "\n",
    { encoding: "utf8", flag: "a" }
  );

  return message;
}

// Reçoit le prochain message en attente destiné à cet agent.
export async function receiveMessage(agentId) {
  if (typeof agentId !== "string" || !agentId.trim()) {
    throw new Error("Identifiant de l'agent obligatoire.");
  }

  const agent = agentId.trim();
  const messages = await listMessages();

  const message = messages.find((item) =>
    item.to === agent &&
    item.status === "queued" &&
    !item.acknowledgedAt &&
    item.deliveryStatus !== "received"
  );

  if (!message) return null;

  const updated = {
    ...message,
    status: "received",
    deliveryStatus: "received",
    receivedAt: new Date().toISOString()
  };

  await writeFile(
    messagesFile,
    messages.map((item) =>
      JSON.stringify(item.id === updated.id ? updated : item)
    ).join("\n") + "\n",
    "utf8"
  );

  return updated;
}

// Confirme la réception uniquement pour le destinataire prévu.
export async function acknowledgeMessage(messageId, agentId) {
  if (typeof messageId !== "string" || !messageId.trim()) {
    throw new Error("Identifiant du message obligatoire.");
  }
  if (typeof agentId !== "string" || !agentId.trim()) {
    throw new Error("Identifiant de l'agent obligatoire.");
  }

  const messages = await listMessages();
  const index = messages.findIndex((item) => item.id === messageId.trim());

  if (index === -1) throw new Error("Message introuvable.");

  const message = messages[index];

  if (message.to !== agentId.trim()) {
    throw new Error("Refus : message destiné à un autre agent.");
  }
  if (message.acknowledgedAt) return message;

  if (message.deliveryStatus !== "received") {
    throw new Error("Le message doit être reçu avant confirmation.");
  }

  const updated = {
    ...message,
    status: "acknowledged",
    acknowledged: true,
    acknowledgedAt: new Date().toISOString()
  };

  await writeFile(
    messagesFile,
    messages.map((item) =>
      JSON.stringify(item.id === updated.id ? updated : item)
    ).join("\n") + "\n",
    "utf8"
  );

  return updated;
}
