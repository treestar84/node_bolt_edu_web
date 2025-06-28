# 유아 학습 앱 백엔드 서버

이 디렉토리는 Express.js 기반의 유아 학습 앱 백엔드 서버입니다.

## 개요
- 주요 기능: 단어/책 관리, 파일 업로드, 관리자 인증, API 키 관리 등

## 실행 방법
1. 의존성 설치(루트에서):
   ```
   npm install
   ```
2. 서버 실행:
   ```
   npm run api
   ```
   또는
   ```
   node server/index.js
   ```

## 주요 의존성
- express
- cors
- helmet
- express-rate-limit
- multer
- jsonwebtoken
- bcryptjs
- uuid

## 폴더 구조
- `routes/` : API 라우트 (auth, words, books, upload, apiKeys)
- `data/` : JSON 파일 기반 데이터 저장소
- `uploads/` : 업로드된 이미지/오디오 파일 저장 폴더
- `middleware/` : 미들웨어

## 데이터 저장
- `data/words.json` : 단어 데이터
- `data/books.json` : 책 데이터
- `data/apiKeys.json` : API 키 데이터

## 주요 API
- 인증: `/api/auth/*`
- 단어: `/api/words/*`
- 책: `/api/books/*`
- 파일 업로드: `/api/upload/*`
- API 키: `/api/keys/*`
- 헬스 체크: `/health`
- API 문서: `/api/docs` (엔드포인트 및 인증 방식 안내)

## 환경 변수
- `PORT` : 서버 포트 (기본값 3001)
- `NODE_ENV` : 환경 구분 (production/development)

## 기타
- 모든 데이터는 JSON 파일로 저장됩니다(별도 DB 불필요).
- 업로드 폴더(`uploads/`)는 서버 실행 시 자동 생성됩니다.
- 관리자 인증 및 API 키 인증 필요. 