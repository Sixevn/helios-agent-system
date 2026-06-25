import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./pool.js";

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, "..", "..", "migrations");

async function run() {
  const files = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
  for (const f of files) {
    const sql = readFileSync(join(migrationsDir, f), "utf8");
    process.stdout.write(`applying ${f} ... `);
    await pool.query(sql);
    console.log("ok");
  }
  await pool.end();
  console.log("migrations complete");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
