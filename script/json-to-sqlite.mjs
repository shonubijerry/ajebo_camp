// json-to-sqlite.mjs
// Usage: node script/json-to-sqlite.mjs <data.json> <table_name> [out.sql]
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

function escapeString(val) {
  return val.replace(/'/g, "''");
}

function sqlValue(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
  if (typeof v === "boolean") return v ? "1" : "0";
  if (v instanceof Date) return `'${v.toISOString()}'`;
  if (typeof v === "object") return `'${escapeString(JSON.stringify(v))}'`;
  return `'${escapeString(String(v))}'`;
}

async function main() {
  const jsonPath = process.argv[2];
  const table = process.argv[3];
  const outPath = process.argv[4]
    ? path.resolve(process.argv[4])
    : path.join(process.cwd(), "db", `seed_${table || "data"}.sql`);

  if (!jsonPath || !table) {
    console.error("Usage: node script/json-to-sqlite.mjs <data.json> <table_name> [out.sql]");
    process.exit(1);
  }

  const raw = await readFile(jsonPath, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data) || data.length === 0) {
    console.error("JSON must be a non-empty array of objects");
    process.exit(1);
  }

  // Determine columns from first object (preserve order of keys as read)
  const columns = Object.keys(data[0]);
  const colList = columns.map((c) => `"${c}"`).join(", ");

  const valuesSql = data
    .map((row) => {
      const vals = columns.map((col) => sqlValue(row[col]));
      return `(${vals.join(", ")})`;
    })
    .join(",\n");

  const sql = `INSERT INTO "${table}" (${colList}) VALUES\n${valuesSql};\n`;

  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, sql);
  console.log(`Wrote SQL for ${data.length} rows to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
