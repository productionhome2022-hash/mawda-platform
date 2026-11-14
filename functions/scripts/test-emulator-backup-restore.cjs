const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const projectId = "demo-mawda-backup-restore";
const bucket = `${projectId}.appspot.com`;
const marker = `mawdda-restore-${Date.now()}`;
const documentId = `restore_${Date.now()}`;
const objectName = `restore-smoke/${documentId}.txt`;
const exportDir = fs.mkdtempSync(path.join(os.tmpdir(), "mawdda-emulator-export-"));

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function startEmulators(extraArgs = []) {
  const args = [
    "emulators:start",
    "--only", "firestore,storage",
    "--project", projectId,
    "--config", "../firebase.json",
    ...extraArgs,
  ];
  const child = spawn(process.env.FIREBASE_CLI || "firebase", args, {
    cwd: process.cwd(),
    env: { ...process.env, GCLOUD_PROJECT: projectId },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  const ready = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("FIREBASE_EMULATORS_START_TIMEOUT\n" + output)), 120_000);
    const consume = (chunk) => {
      output += chunk.toString();
      if (/All emulators ready/i.test(output)) {
        clearTimeout(timeout);
        resolve();
      }
    };
    child.stdout.on("data", consume);
    child.stderr.on("data", consume);
    child.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once("exit", (code, signal) => {
      clearTimeout(timeout);
      reject(new Error(`FIREBASE_EMULATORS_EXITED_EARLY:${code ?? signal}\n${output}`));
    });
  });
  return { child, ready, getOutput: () => output };
}

async function stopEmulators(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = new Promise((resolve) => child.once("exit", resolve));
  child.kill("SIGINT");
  await Promise.race([exited, delay(45_000).then(() => {
    if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
  })]);
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: "Bearer owner",
      ...(options.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`EMULATOR_HTTP_${response.status}: ${url}\n${body.slice(0, 1200)}`);
  }
  return response;
}

async function seedData() {
  const firestoreUrl = `http://127.0.0.1:8080/v1/projects/${projectId}/databases/(default)/documents/restoreSmokeTests/${documentId}`;
  await request(firestoreUrl, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: { marker: { stringValue: marker } } }),
  });

  const storageUrl = `http://127.0.0.1:9199/v0/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(objectName)}`;
  await request(storageUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: marker,
  });
}

async function verifyData() {
  const firestoreUrl = `http://127.0.0.1:8080/v1/projects/${projectId}/databases/(default)/documents/restoreSmokeTests/${documentId}`;
  const firestoreResponse = await request(firestoreUrl);
  const firestoreDoc = await firestoreResponse.json();
  if (firestoreDoc.fields?.marker?.stringValue !== marker) {
    throw new Error("FIRESTORE_EMULATOR_RESTORE_MISMATCH");
  }

  const storageUrl = `http://127.0.0.1:9199/v0/b/${bucket}/o/${encodeURIComponent(objectName)}?alt=media`;
  const storageResponse = await request(storageUrl);
  const restoredObject = await storageResponse.text();
  if (restoredObject !== marker) {
    throw new Error("STORAGE_EMULATOR_RESTORE_MISMATCH");
  }
}

(async () => {
  let first;
  let second;
  try {
    first = startEmulators(["--export-on-exit", exportDir]);
    await first.ready;
    await seedData();
    await stopEmulators(first.child);
    first = null;
    if (!fs.existsSync(exportDir) || fs.readdirSync(exportDir).length === 0) {
      throw new Error("FIREBASE_EMULATOR_EXPORT_MISSING");
    }

    second = startEmulators(["--import", exportDir]);
    await second.ready;
    await verifyData();
    await stopEmulators(second.child);
    second = null;
    process.stdout.write("Firestore and Storage emulator export/import restore smoke test passed.\n");
  } catch (error) {
    process.stderr.write(String(error?.stack ?? error) + "\n");
    process.exitCode = 1;
  } finally {
    if (first) await stopEmulators(first.child).catch(() => undefined);
    if (second) await stopEmulators(second.child).catch(() => undefined);
    fs.rmSync(exportDir, { recursive: true, force: true });
  }
})();
