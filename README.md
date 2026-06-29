# PADO 최종 GitHub 업로드용

파도(PADO) 부산 2030 커뮤니티 웹앱 최종본입니다.

## 포함 기능

- 상단 헤더 로그인 버튼 상시 노출
- 로그인 후 프로필/마이페이지/내 일정/로그아웃 메뉴 전환
- 밋업 만들기 화면 바로 이동
- 오늘의 번개 등록 및 3명 이상 참여 시 정식 밋업 전환
- 내 일정 확인
- 후기 기록하기
- 크루 대시보드
- 공지/명예의 전당/배지 기반 구조
- Netlify 배포용 `dist` 포함

## GitHub 업로드 방법

1. 이 ZIP을 압축 해제합니다.
2. 압축 해제 후 나온 파일과 폴더 전체를 GitHub 저장소에 업로드합니다.
3. GitHub에는 `src`, `dist`, `firebase` 폴더가 보이는 것이 정상입니다.

## Netlify 배포 방법

### 방법 1. GitHub 연결 배포

- Build command: `npm run build`
- Publish directory: `dist`

### 방법 2. 드래그 앤 드롭 배포

- ZIP 안의 `dist` 폴더만 Netlify Deploys 화면에 드래그합니다.

## 주의

GitHub/Vite/React 프로젝트는 `src`, `dist`, `firebase` 같은 폴더 구조가 있어야 정상 작동합니다.
최상위에 프로젝트명을 가진 추가 폴더는 넣지 않았고, ZIP을 열면 바로 `index.html`, `package.json`, `src`, `dist`가 보이도록 만들었습니다.
