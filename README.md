# backup-to-drive

Node.js CLI tool that zips a local directory and uploads it to Google Drive using OAuth2.
If a file with the same name already exists, it updates the file instead of creating a new one.

---

## Features

- Zip a local directory
- Upload to Google Drive via OAuth2
- Update existing file if the same name already exists

---

## Tech Stack

- Node.js (ESM)
- Google Drive API
- OAuth2
- Archiver

---

## Project Structure
.
├── zip_and_upload_oauth.mjs
├── package.json
├── package-lock.json
├── secrets/ # OAuth credentials (gitignored)
├── .env # environment variables (gitignored)
└── node_modules/ # dependencies (gitignored)

---

## Installation

npm install

---

## Environment Variables

DRIVE_FOLDER_ID=YOUR_DRIVE_FOLDER_ID
ZIP_NAME=backup.zip

---

## Google OAuth Setup

1. Enable **Google Drive API** in Google Cloud Console  
2. Download OAuth credentials  
3. Save the file as:
./secrets/credentials.json

---

## Usage

node zip_and_upload_oauth.mjs <DIR_TO_ZIP>

