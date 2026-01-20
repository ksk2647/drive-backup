# backup-to-drive

로컬 디렉토리를 압축(zip) 한 뒤
OAuth 인증을 통해 Google Drive에 업로드하는
Node.js 기반 백업 스크립트입니다.


## 🛠️ 기술스택

* Node.js (ESM)
* OAuth 2.0
* zip / file system API


## 📁 프로젝트 구조

.
├── zip_and_upload_oauth.mjs   # 메인 실행 스크립트
├── package.json
├── package-lock.json
├── secrets/                  # OAuth 인증 정보 (gitignore)
├── .env                      # 환경변수 (gitignore)
└── node_modules/             # 의존성 (gitignore)


## ⚙️  설치

npm install



## 🔐 환경 변수 설정

DRIVE_FOLDER_ID=DRIVE_FOLDER_ID
ZIP_NAME=ZIPFILE_NAME.zip



## 🔐 Google 인증파일 다운로드

Google drive api 설정 및 인증파일을 다운로드 하여
./secrets/credential.json 에 저장합니다.



## ▶️ 실행 방법

node zip_and_upload_oauth.mjs $ZIP_AND_UPLOAD_FILE_PATH
