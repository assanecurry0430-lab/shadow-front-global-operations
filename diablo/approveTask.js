import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const tasksDir = path.join(root, "tasks");
const tasksFile = path.join(tasksDir, "tasks.json");

async function ensureTasksFile() {
  await mkdir(tasksDir, { recursive: true });

  try {
    await readFile(tasksFile, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await writeFile(tasksFile, "[]\n", "utf8");
  }
}

export async function approveTask(taskId) {
  if (typeof taskId !== "string" || !taskId.trim()) {
    throw new Error("Un identifiant de tâche est obligatoire.");
  }

  await ensureTasksFile();

  const tasks = JSON.parse(await readFile(tasksFile, "utf8"));
  const index = tasks.findIndex(task => task.id === taskId);

  if (index === -1) {
    throw new Error("Tâche introuvable.");
  }

  if (tasks[index].status !== "pending") {
    throw new Error(
      `La tâche ne peut pas être approuvée : statut actuel ${tasks[index].status}.`
    );
  }

  tasks[index] = {
    ...tasks[index],
    status: "approved",
    approvedAt: new Date().toISOString(),
    approvalRequired: true
  };

  await writeFile(tasksFile, JSON.stringify(tasks, null, 2) + "\n", "utf8");

  return tasks[index];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const taskId = process.argv[2];

  if (!taskId) {
    console.error("Utilisation : node diablo/approveTask.js <identifiant>");
    process.exit(1);
  }

  try {
    const task = await approveTask(taskId);
    console.log("Tâche approuvée :");
    console.log(JSON.stringify(task, null, 2));
  } catch (error) {
    console.error("Approbation refusée :", error.message);
    process.exit(1);
  }
}
