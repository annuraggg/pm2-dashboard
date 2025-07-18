import pm2 from "pm2";
import fs from "fs/promises";
import { exec } from "child_process";
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
    `[PM2] Fetching logs using pm2 logs command for process: ${pm2Id}, lines: ${lines}`
  );

  return new Promise((resolve, reject) => {
    exec(
      `pm2 logs ${pm2Id} --lines ${lines} --nostream`,
      { maxBuffer: 1024 * 1024 },
      (err, stdout, stderr) => {
        if (err) {
          console.error(
            `[PM2] pm2 logs command failed for process ${pm2Id}:`,
            stderr || err
          );
          return reject(stderr || err);
        }

        const cleanLogs = stripAnsi(stdout);

        const logsWithTimestamps = cleanLogs
          .split("\n")
          .map((line) => {
            const ts = new Date().toISOString();
            return `[${ts}] ${line}`;
          })
          .join("\n");

        resolve(logsWithTimestamps);
      }
    );
  });
}
