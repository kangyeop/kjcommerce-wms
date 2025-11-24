# KJ Commerce WMS

KJ Commerce 물류 관리 시스템 (WMS)

## 기능

- 물류 등록 정보 관리
  - 한개당 가격
  - 한개당 무게
- 구매를 위한 비용
  - 해외 구매 비용 계산 (원가, 개수, 구매 대행 수수료)
  - 해외 배송 비용 계산 (검품비, 포장비, 해외 배송비)
  - 해외 배송 통관 (통관비, 부가세)
- 판매 가격 도출
  - 판매 단위
  - 구매 비용
  - 판매 수수료
  - 광고비
  - 택배비
  - 마진

## 기술 스택

- 프론트엔드: React, Vite, Tailwind CSS, shadcn/ui
- 백엔드: Node.js, Express
- 패키지 관리: pnpm workspace (모노레포)

## 설치 및 실행

### 설치

```bash
# 패키지 설치
pnpm install
```

### 개발 모드 실행

```bash
# 웹만 실행
pnpm dev

# 서버만 실행
pnpm dev:server

# 웹과 서버 동시 실행
pnpm dev:all
```

### 빌드

```bash
# 웹만 빌드
pnpm build

# 서버만 빌드
pnpm build:server

# 웹과 서버 모두 빌드
pnpm build:all
```

### 프로덕션 실행

```bash
# 웹 프리뷰
pnpm preview

# 서버 실행
pnpm start
```