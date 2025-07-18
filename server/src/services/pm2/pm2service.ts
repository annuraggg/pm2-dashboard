import pm2 from "pm2";
import fs from "fs/promises";
import { exec, spawn } from "child_process";
import stripAnsi from "strip-ansi";

// List all PM2 processes
export async function listPM2Processes(): Promise<any[]> {
  console.log("[PM2] Connecting to PM2 for process list...");
  return new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) {
        console.error("[PM2] Failed to connect for list:", err);
        return reject(err);
      }
      pm2.list((err, procs) => {
        pm2.disconnect();
        if (err) {
          console.error("[PM2] Failed to list processes:", err);
          return reject(err);
        }
        console.log(`[PM2] Retrieved ${procs.length} process(es).`);
        resolve(procs);
      });
    });
  });
}

// Restart a PM2 process by ID or name
export async function restartPM2Process(pm2Id: number | string) {
  console.log(`[PM2] Attempting to restart process: ${pm2Id}`);
  return new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) {
        console.error("[PM2] Failed to connect for restart:", err);
        return reject(err);
      }
      pm2.restart(pm2Id, (err, proc) => {
        pm2.disconnect();
        if (err) {
          console.error(`[PM2] Failed to restart process ${pm2Id}:`, err);
          return reject(err);
        }
        console.log(`[PM2] Successfully restarted process: ${pm2Id}`);
        resolve(proc);
      });
    });
  });
}

// Get logs for a PM2 process (last N lines)
export async function getPM2Logs(
  pm2Id: number | string,
  lines = 100
): Promise<string> {
  console.log(
    `[PM2] Fetching logs for process: ${pm2Id}, lines: ${lines}`
  );

  return new Promise((resolve, reject) => {
    const chunks: string[] = [];

    const child = spawn(
      "pm2",
      ["logs", String(pm2Id), "--lines", String(lines), "--nostream", "--raw"],
      {
        env: {
          ...process.env,
          FORCE_COLOR: "1", // tell pm2 and chalk to output colors
          TERM: "xterm-256color", // emulate terminal
        },
      }
    );

    child.stdout.on("data", (data) => {
      chunks.push(data.toString());
    });

    child.stderr.on("data", (data) => {
      console.error(`[PM2 Logs Error]: ${data}`);
    });

    child.on("error", (err) => {
      reject(err);
    });

    child.on("close", () => {
      resolve(chunks.join(""));
    });
  });
}
