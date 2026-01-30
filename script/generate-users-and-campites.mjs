// generate-users-and-campites.mjs
// Usage: node script/generate-users-and-campites.mjs <users.csv> <camp_reg_.csv> [out-users.json] [out-campites.json]
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import Papa from "papaparse";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadJson(relativePath) {
  const p = path.join(__dirname, relativePath);
  const txt = await readFile(p, "utf8");
  return JSON.parse(txt);
}

function parseCsv(filePath) {
  return readFile(filePath, "utf8").then((text) => {
    const { data, errors } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });
    if (errors.length) {
      const preview = errors.slice(0, 5);
      throw new Error(
        `Failed parsing ${filePath}: ${JSON.stringify(preview, null, 2)}`,
      );
    }
    return data;
  });
}

function toIsoOrNow(value) {
  if (!value) return null;
  const iso = new Date(value).toISOString();
  return iso;
}

async function main() {
  const campRegCsvPath = process.argv[2];
  const outCampitesPath = process.argv[3]
    ? path.resolve(process.argv[3])
    : path.join(process.cwd(), "out", "campites-import.json");

  if (!campRegCsvPath) {
    console.error(
      "Usage: node script/generate-users-and-campites.mjs <camp_reg_.csv> [out-campites.json]",
    );
    process.exit(1);
  }

  // Load reference data (existing users/camps/districts)
  const [users, camps, districts] = await Promise.all([
    loadJson("./out/user.json"),
    loadJson("./out/camps.json"),
    loadJson("./out/districts.json"),
  ]);

  const groupedUsersByid = new Map();
  for (const u of users) {
    groupedUsersByid.set(u.old_id, u);
  }

  const groupedUsersByEmail = new Map();
  for (const u of users) {
    groupedUsersByEmail.set(u.email, u);
  }

  const groupedDistrictsByid = new Map();
  for (const d of districts) {
    groupedDistrictsByid.set(d.name, d);
  }

  const campRaw = await parseCsv(campRegCsvPath);

  const nowIso = new Date().toISOString();

  const campites = [];
  const skippedMissingUser = [];
  const newUsers = new Map();

  for (const row of campRaw) {
    const email = (row.email || "").trim();
    const firstname = (row.firstname || "").trim() || "Unknown";
    const lastname = (row.lastname || "").trim() || "Unknown";
    const phone = (row.phone || "").trim() || null;

    let user =
      groupedUsersByid.get(String(row.user_id)) ??
      groupedUsersByEmail.get(email);
    if (!user) {
      if (!row.email) {
        skippedMissingUser.push({
          reason: `user_id ${row.user_id} not in users.csv`,
          row,
        });
        continue; // cannot create user without email
      }

      if (newUsers.has(email)) {
        user = newUsers.get(email);
      } else {
        user = {
          id: randomUUID(),
          firstname,
          lastname,
          email,
          phone,
          role: "user",
          created_at: toIsoOrNow(row.date_created),
          updated_at: toIsoOrNow(row.date_created),
        };
        newUsers.set(user.email, user);
      }
    }

    if (user.old_id) {
      delete user.old_id;
      newUsers.set(user.email, user);
    }

    const userId = user.id;

    let campId = (row.camp_id || row.campId || "").toString().trim();
    const camp = camps[Number(campId) - 1];
    campId = camp ? camp.id : null;
    const campAmount = camp ? parseInt(camp.fee) : null;

    const typeRaw = (row.reg_type || "").trim().toLowerCase();
    const type = typeRaw === "premium" ? "premium" : "regular";
    const createdAt = toIsoOrNow(row.date_created);
    const paymentRef = (row.ref || row.tx_ref || "").trim() || null;

    const districtId = groupedDistrictsByid.get(row.district || "")?.id;
    const checkinAt = toIsoOrNow(row.arrival);

    campites.push({
      id: randomUUID(),
      firstname,
      lastname,
      email,
      phone,
      age_group:
        (row.age_group || "").replace(" years", "").trim() || "Unknown",
      gender: (row.gender || "").trim() || "Unknown",
      camp_id: campId,
      user_id: userId,
      district_id: districtId,
      payment_ref: paymentRef,
      type,
      amount: type === "premium" ? null : campAmount,
      allocated_items: "",
      checkin_at: checkinAt,
      created_at: createdAt ?? user.created_at,
      updated_at: createdAt ?? user.updated_at,
      deleted_at: null,
    });
  }

  await writeFile(outCampitesPath, JSON.stringify(campites, null, 2));
  await writeFile(
    path.join(process.cwd(), "out", "new_users.json"),
    JSON.stringify(Array.from(newUsers.values()), null, 2),
  );

  console.log(`Campites written: ${campites.length} -> ${outCampitesPath}`);
  if (skippedMissingUser.length) {
    console.warn(
      `Campite rows skipped due to missing user/camp_id: ${skippedMissingUser.length}`,
    );
    // console.log(JSON.stringify(skippedMissingUser, null, 2));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
