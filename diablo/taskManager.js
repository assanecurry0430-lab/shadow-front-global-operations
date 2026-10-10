import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(root, "tasks");
const tasksFile = path.join(dataDir, "tasks.json");

async function ensureStore() {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(tasksFile, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await writeFile(tasksFile, "[]\n", "utf8");
  }
}

export async function listTasks() {
  await ensureStore();
  return JSON.parse(await readFile(tasksFile, "utf8"));
}

export async function createTask(title, description) {
  if (typeof title !== "string" || !title.trim()) {
    throw new Error("Le titre de la tâche est obligatoire.");
  }

  if (typeof description !== "string" || !description.trim()) {
    throw new Error("La description de la tâche est obligatoire.");
  }

  const tasks = await listTasks();

  const task = {
    id: randomUUID(),
    title: title.trim(),
    description: description.trim(),
    status: "pending",
    approvalRequired: true,
    createdAt: new Date().toISOString()
  };

  tasks.push(task);
  await writeFile(tasksFile, JSON.stringify(tasks, null, 2) + "\n", "utf8");

  return task;
}
