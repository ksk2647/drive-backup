import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import archiver from "archiver";
import dotenv from "dotenv";
import { google } from "googleapis";
import { authenticate } from "@google-cloud/local-auth";

dotenv.config();

const SCOPES = ["https://www.googleapis.com/auth/drive"]; // 가장 덜 삽질나는 범위
const TOKEN_PATH = path.resolve("./secrets/token.json");
const CREDS_PATH = path.resolve("./secrets/credentials.json");

function env(name, fallback = undefined) {
  return process.env[name] ?? fallback;
}

async function zipDir(srcDir, outZipPath) {
  await fs.promises.mkdir(path.dirname(outZipPath), { recursive: true });

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outZipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    output.on("error", reject);
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(srcDir, false);
    archive.finalize();
  });
}

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.promises.readFile(TOKEN_PATH, "utf8");
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch {
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.promises.readFile(CREDS_PATH, "utf8");
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;

  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.promises.writeFile(TOKEN_PATH, payload, "utf8");
}

async function authorize() {
  const creds = JSON.parse(await fs.promises.readFile(CREDS_PATH, "utf8"));
  const key = creds.installed || creds.web;

  const oAuth2Client = new google.auth.OAuth2(
    key.client_id,
    key.client_secret,
    // Desktop app이면 보통 이 redirect 중 하나가 들어있음
    (key.redirect_uris && key.redirect_uris[0]) || "http://localhost"
  );

  const token = JSON.parse(await fs.promises.readFile(TOKEN_PATH, "utf8"));

  // 핵심: refresh_token을 credentials로 넣어줘야 자동 갱신됨
  oAuth2Client.setCredentials({
    refresh_token: token.refresh_token,
  });

  return oAuth2Client;
}

function escapeDriveQuery(str) {
  return str.replace(/'/g, "\\'");
}

async function findFileByName(drive, name, parentId) {
  const safeName = escapeDriveQuery(name);

  const q = [
    `name='${safeName}'`,
    `'${parentId}' in parents`,
    'trashed=false',
  ].join(' and ');

  const res = await drive.files.list({
    q,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  return res.data.files?.[0] ?? null;
}

async function getDrive() {
  const auth = await authorize();
  return google.drive({ version: "v3", auth });
}

async function createOrUpdateToDrive(zipPath, zipName, folderId) {
  const drive = await getDrive();
  const media = {
    mimeType: 'application/zip',
    body: fs.createReadStream(zipPath),
  };

  const existing = await findFileByName(drive, zipName, folderId);

  if (existing) {
    // 🔁 덮어쓰기
    const res = await drive.files.update({
      fileId: existing.id,
      media,
      fields: 'id, name, modifiedTime, webViewLink',
    });
    return { mode: 'Updated', data: res.data };
  } else {
    // 🆕 새로 생성
    const res = await drive.files.create({
      requestBody: { name: zipName, parents: [folderId] },
      media,
      fields: 'id, name, webViewLink',
      uploadType: 'resumable',
      supportsAllDrives: true,
    });
    return { mode: 'Created', data: res.data };
  }
}

async function main() {
  const SRC_DIR = process.argv[2];
  if (!SRC_DIR) {
    console.error("Usage: node zip_and_upload_oauth.mjs <DIR_TO_ZIP>");
    process.exit(1);
  }

  if (!fs.existsSync(CREDS_PATH)) {
    throw new Error("credentials.json not found in current directory.");
  }

  const folderId = env("DRIVE_FOLDER_ID", "");
  const zipName = env("ZIP_NAME", "backup.zip");

  const tmpName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.zip`;
  const tmpZipPath = path.join(os.tmpdir(), tmpName);

  console.log("Zipping:", SRC_DIR);
  await zipDir(SRC_DIR, tmpZipPath);

  const stat = await fs.promises.stat(tmpZipPath);
  console.log(`Zip created: ${tmpZipPath} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);

  console.log("Uploading to Drive folder:", folderId || "(My Drive root)");
  const { mode, data }  = await createOrUpdateToDrive(tmpZipPath, zipName, folderId || undefined);

  console.log(`✅ ${mode}: `);
  console.log("  id:", data.id);
  console.log("  name:", data.name);
  console.log("  webViewLink:", data.webViewLink);

  await fs.promises.unlink(tmpZipPath);
}

main().catch((err) => {
  console.error("❌ Error:", err?.message || err);
  process.exit(1);
});
