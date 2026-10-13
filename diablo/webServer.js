import http from "node:http";
import { timingSafeEqual } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { approveTask, rejectTask } from "./approveTask.js";
import { enqueueMessage, listMessages, receiveMessage, acknowledgeMessage } from "./communication/messageStore.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const tasksFile = path.join(root, "tasks", "tasks.json");
const PORT = 3030;
const HOST = "127.0.0.1";
const authKeyFile = path.join(root, "config", "local-auth.key");
const AUTH_KEY = (await readFile(authKeyFile, "utf8")).trim();
if (AUTH_KEY.length < 32) throw new Error("Clé locale absente ou invalide.");

const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Diablo | SFO</title>
<style>
body{margin:0;background:#10141c;color:#edf2f7;font-family:Arial,sans-serif;padding:20px}
main{max-width:850px;margin:auto}
h1{color:#69b7ff}
.card{background:#1b2432;border:1px solid #354257;border-radius:12px;padding:16px;margin:14px 0}
.status{font-weight:bold;color:#ffd166}
button{border:0;border-radius:7px;padding:11px 15px;margin:8px 8px 0 0;font-weight:bold;cursor:pointer}
input{box-sizing:border-box;max-width:100%;padding:10px;border-radius:7px;border:1px solid #53657d;background:#10141c;color:#edf2f7}
.approve{background:#27ae60;color:white}.reject{background:#e74c3c;color:white}
small{color:#aab7c8;overflow-wrap:anywhere}
#message{padding:10px}
</style>
</head>
<body>
<main>
<h1>DIABLO — SFO</h1>
<p>Tableau de bord des tâches et des décisions.</p>
<p id="message">Chargement des tâches…</p>
<section class="card"><label for="authKey">Clé d’autorisation locale :</label><br><input id="authKey" type="password" autocomplete="off" placeholder="Saisir la clé secrète"><button id="saveKey" type="button">Déverrouiller le tableau de bord</button><p><small>La clé reste uniquement en mémoire jusqu’au rechargement de la page.</small></p></section>
<section id="tasks"></section>
</main>
<script>
let authKey = "";
document.getElementById("saveKey").onclick = async () => {
  const value = document.getElementById("authKey").value.trim();
  if (value.length < 32) { alert("Saisis la clé secrète complète."); return; }
  authKey = value;
  document.getElementById("authKey").value = "";
  document.getElementById("message").textContent = "Clé saisie en mémoire. Vérification…";
  await loadTasks();
};

async function loadTasks(){
  const box=document.getElementById("tasks");
  try{
    const response=await fetch("/api/tasks");
    const tasks=await response.json();
    box.replaceChildren();
    document.getElementById("message").textContent=
      tasks.filter(t=>t.status==="pending").length+" tâche(s) en attente";
    if(!tasks.length){box.textContent="Aucune tâche enregistrée.";return;}
    for(const task of tasks){
      const card=document.createElement("article");
      card.className="card";
      const title=document.createElement("h2");
      title.textContent=task.title;
      const description=document.createElement("p");
      description.textContent=task.description;
      const status=document.createElement("p");
      status.className="status";
      status.textContent="Statut : "+task.status;
      const id=document.createElement("small");
      id.textContent="ID : "+task.id;
      card.append(title,description,status,id);
      if(task.status==="pending"){
        for(const action of ["approve","reject"]){
          const button=document.createElement("button");
          button.className=action;
          button.textContent=action==="approve"?"Approuver":"Refuser";
          button.onclick=async()=>{
            if(action==="reject"&&!confirm("Confirmer le refus de cette tâche ?"))return;
            if(action==="approve"&&!confirm("Confirmer l’approbation de cette tâche ?"))return;
            const result=await fetch("/api/tasks/"+encodeURIComponent(task.id)+"/"+action,{method:"POST",headers:{"x-diablo-auth-key":authKey}});
            const data=await result.json();
            if(!result.ok){alert(data.error||"Opération impossible");return;}
            await loadTasks();
          };
          card.append(button);
        }
      }
      box.append(card);
    }
  }catch(error){
    document.getElementById("message").textContent="Erreur de connexion au serveur.";
  }
}
loadTasks();
</script>
</body>
</html>`;

async function getTasks() {
  return JSON.parse(await readFile(tasksFile, "utf8"));
}

async function sendJSON(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(data));
}


async function readJSONBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;

    if (size > 16384) {
      const error = new Error("Corps JSON trop volumineux.");
      error.statusCode = 413;
      throw error;
    }

    chunks.push(chunk);
  }

  if (size === 0) {
    const error = new Error("Corps JSON requis.");
    error.statusCode = 400;
    throw error;
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("JSON invalide.");
    error.statusCode = 400;
    throw error;
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://" + HOST + ":" + PORT);

    if (req.method === "POST" && url.pathname.startsWith("/api/")) {
      const suppliedKey = req.headers["x-diablo-auth-key"];
      const suppliedBuffer = Buffer.from(typeof suppliedKey === "string" ? suppliedKey : "");
      const expectedBuffer = Buffer.from(AUTH_KEY);
      if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) {
        await sendJSON(res, 401, { error: "Clé d’autorisation absente ou invalide." });
        return;
      }
    }

    if (req.method === "GET" && url.pathname === "/") {
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store"
      });
      res.end(html);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/tasks") {
      await sendJSON(res, 200, await getTasks());
      return;
    }


    if (req.method === "GET" && url.pathname === "/api/messages") {
      await sendJSON(res, 200, await listMessages());
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/messages") {
      try {
        const body = await readJSONBody(req);
        const message = await enqueueMessage(body);
        await sendJSON(res, 201, { success: true, message });
      } catch (error) {
        await sendJSON(res, error.statusCode || 400, {
          error: error.message
        });
      }
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/messages/receive") {
      try {
        const body = await readJSONBody(req);
        const message = await receiveMessage(body.agentId);
        await sendJSON(res, 200, { success: true, message });
      } catch (error) {
        await sendJSON(res, error.statusCode || 400, {
          error: error.message
        });
      }
      return;
    }

    const messageMatch =
      url.pathname.match(/^\/api\/messages\/([^/]+)\/acknowledge$/);

    if (req.method === "POST" && messageMatch) {
      try {
        const body = await readJSONBody(req);
        const messageId = decodeURIComponent(messageMatch[1]);
        const message = await acknowledgeMessage(messageId, body.agentId);
        await sendJSON(res, 200, { success: true, message });
      } catch (error) {
        const text = error.message || "Confirmation impossible.";
        const status = error.statusCode ||
          (text.includes("introuvable") ? 404 :
           text.includes("destiné à un autre agent") ? 403 :
           text.includes("reçu avant confirmation") ? 409 : 400);

        await sendJSON(res, status, { error: text });
      }
      return;
    }

    const match = url.pathname.match(/^\/api\/tasks\/([^/]+)\/(approve|reject)$/);
    if (req.method === "POST" && match) {
      const [, id, action] = match;
      try {
        const task = action === "approve"
          ? await approveTask(id)
          : await rejectTask(id);

        await sendJSON(res, 200, { success: true, task });
      } catch (error) {
        const status = error.message === "Tâche introuvable." ? 404 : 409;
        await sendJSON(res, status, { error: error.message });
      }
      return;
    }

    await sendJSON(res, 404, { error: "Route introuvable." });
  } catch (error) {
    console.error(error);
    await sendJSON(res, 500, { error: "Erreur interne du serveur." });
  }
});

server.listen(PORT, HOST, () => {
  console.log("Tableau de bord Diablo : http://" + HOST + ":" + PORT);
  console.log("Les décisions d’approbation ne lancent pas automatiquement les tâches.");
});
