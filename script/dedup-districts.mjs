// dedup-districts.mjs
import { readFile } from 'node:fs/promises';
import Papa from 'papaparse';

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: node dedup-districts.mjs <path-to-csv>');
    process.exit(1);
  }

  const text = await readFile(csvPath, 'utf8');
  const { data, errors } = Papa.parse(text, { header: true, skipEmptyLines: true });

  if (errors.length > 0) {
    console.error('CSV parsing errors:', errors);
    process.exit(1);
  }

  if (!data.length) return console.log('[]');

  // Find the district/name column
  const headers = Object.keys(data[0]);
  const districtColumn = headers.find((h) => /district|name/i.test(h));

  if (!districtColumn) {
    console.error('No district or name column found');
    process.exit(1);
  }

  // Deduplicate districts (case-insensitive)
  const seen = new Set();
  const unique = [];

  for (const row of data) {
    const val = (row[districtColumn] ?? '').trim();
    if (!val) continue;
    const key = val.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(val);
  }

  console.log(JSON.stringify(unique, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});