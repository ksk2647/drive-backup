# backup-to-drive

로컬 디렉토리를 압축한 뒤 Google Drive에 자동 업로드하는 Node.js 기반 CLI 백업 도구입니다.

반복적으로 수동 백업을 수행하는 과정이 번거로워,
하나의 명령으로 압축 → 업로드 → 기존 파일 갱신까지 처리할 수 있도록 만들었습니다.

동일한 이름의 파일이 이미 존재할 경우 새 파일을 생성하지 않고 기존 파일을 업데이트합니다.

---

## 주요 기능

- 로컬 디렉토리 ZIP 압축
- Google Drive 업로드
- OAuth2 기반 인증
- 동일 파일 존재 시 업데이트 처리
- CLI 기반 실행

---

## 기술 스택

- Node.js (ESM)
- Google Drive API
- OAuth2
- Archiver

---

## 프로젝트 구조

```text
.
├── zip_and_upload_oauth.mjs
├── package.json
├── package-lock.json
├── secrets/          # OAuth 인증 정보 (gitignore 처리)
├── .env              # 환경 변수 파일 (gitignore 처리)
└── node_modules/     # 의존성 패키지 (gitignore 처리)
```

---

## 설치

```bash
npm install
```

---

## 환경 변수 설정

```env
DRIVE_FOLDER_ID=YOUR_DRIVE_FOLDER_ID
ZIP_NAME=backup.zip
```

---

## Google OAuth 설정

1. Google Cloud Console에서 Google Drive API를 활성화합니다.
2. OAuth 인증 정보를 다운로드합니다.
3. 다운로드한 파일을 아래 경로에 저장합니다.

```text
./secrets/credentials.json
```

---

## 사용 방법

```bash
node zip_and_upload_oauth.mjs <압축할_디렉토리>
```

---

## 동작 방식

1. 지정한 디렉토리를 ZIP 파일로 압축합니다.
2. Google OAuth2 인증을 수행합니다.
3. Google Drive에 파일을 업로드합니다.
4. 동일한 이름의 파일이 이미 존재할 경우 기존 파일을 업데이트합니다.

---

## 프로젝트 목적

반복적으로 수행하던 로컬 디렉토리 백업 작업을 단순화하기 위해 제작했습니다.

특정 폴더를 주기적으로 압축하고 Google Drive에 업로드하는 과정을 자동화하여,
수동 작업을 줄이고 백업 흐름을 간단하게 만드는 것을 목표로 했습니다.

---

## 한계점

현재는 단일 디렉토리 기준으로 동작하며,
백업 이력 관리나 다중 백업 정책 등은 지원하지 않습니다.

또한 Google Drive API와 OAuth 인증 설정이 필요하기 때문에,
초기 설정 과정이 다소 번거로울 수 있습니다.
