# 유아 학습 웹 애플리케이션 (프론트엔드)

이 프로젝트는 Vue 3, TypeScript, Vite를 기반으로 한 유아 학습 웹 애플리케이션의 프론트엔드입니다.

## 주요 스크립트
- `npm run dev` : 개발 서버 실행 (기본 포트: 5173)
- `npm run build` : 프로덕션 빌드 생성
- `npm run preview` : 빌드 결과물 미리보기
- `npm run api` : 백엔드 서버 실행 (server/index.js)

## 폴더 구조
- `src/` : 소스 코드
  - `components/` : 공통 컴포넌트
  - `views/` : 페이지 단위 뷰
  - `router/` : 라우터 설정
  - `stores/` : Pinia 상태 관리
  - `assets/` : 이미지, 스타일 등 정적 자원
- `public/` : 정적 파일
- `server/` : 백엔드 서버 코드

## 개발 환경
- Node.js 18 이상 권장
- 의존성 설치: `npm install`
- 개발 서버 실행: `npm run dev`
- 백엔드 서버 실행: `npm run api`

## 기타
- 프론트엔드 개발 시, 백엔드 서버(`server/index.js`)도 함께 실행해야 API 연동이 가능합니다.
- 환경 변수 설정은 `.env` 파일을 참고하세요.
