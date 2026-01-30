// generate-users-from-csv.mjs
// Usage: node script/generate-users-from-csv.mjs <path-to-csv> [output-json-path]
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import Papa from "papaparse";

async function main() {
  const csvPath = process.argv[2];
  const defaultOut = path.join(process.cwd(), "out", "user.json");
  const outPath = process.argv[3] ? path.resolve(process.argv[3]) : defaultOut;

  if (!csvPath) {
    console.error(
      "Usage: node script/generate-users-from-csv.mjs <path-to-csv> [output-json-path]",
    );
    process.exit(1);
  }

  const csvText = await readFile(csvPath, "utf8");
  const { data, errors } = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (errors.length) {
    console.error("CSV parsing errors:", errors);
    process.exit(1);
  }

  const nowIso = new Date().toISOString();
  const seen = new Set();
  const users = [];

  for (const row of data) {
    const emailRaw = (row.email || row.Email || "").trim();
    if (!emailRaw) continue; // skip rows without email
    const emailKey = emailRaw.toLowerCase();
    if (seen.has(emailKey)) continue; // skip duplicate emails
    seen.add(emailKey);

    const firstname = (row.firstname || "").trim() || "Unknown";
    const lastname = (row.lastname || "").trim() || "Unknown";
    const phone = (row.phone || "").trim() || null;
    const created_at = new Date(row.joined_on.trim()).toISOString() || nowIso;

    users.push({
      id: randomUUID(),
      old_id: row.id,
      firstname,
      lastname,
      email: emailRaw,
      phone,
      role: "user",
      created_at,
      updated_at: created_at,
    });
  }

  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(users, null, 2));
  console.log(`Wrote ${users.length} users to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
