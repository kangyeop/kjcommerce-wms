# Wing Ad Reporter Lambda

쿠팡 윙 광고센터에서 광고 보고서 데이터를 자동으로 수집하고 처리하는 AWS Lambda 함수입니다.

## 개요

이 패키지는 쿠팡 윙 광고센터에 접속하여 광고 보고서 데이터를 자동으로 스크래핑하여 JSON 형식으로 변환하는 Lambda 함수를 제공합니다.

## 구성 요소

- `browser.ts`: Playwright를 사용한 브라우저 자동화 및 데이터 스크래핑 코드
- `handler.ts`: AWS Lambda 핸들러 함수
- `types.ts`: 타입 정의

## 필요 환경

- Node.js 18.x 이상
- AWS 계정
- Lambda Layer: Chrome AWS Lambda Layer
- pnpm (패키지 매니저)

## 설치 방법

1. 패키지 설치:
```bash
pnpm install
```

2. 빌드:
```bash
pnpm build
```

3. Lambda 함수 패키징:
```bash
pnpm package
```

## 배포 방법

### 1. Chrome AWS Lambda Layer 준비

Lambda에서 Playwright가 Chrome을 사용할 수 있도록 Layer를 준비합니다:

```bash
# packages/lambda-wing-reporter 디렉토리에서
mkdir -p layers
# GitHub에서 최신 Chrome Lambda Layer 다운로드
curl -L https://github.com/shelfio/chrome-aws-lambda-layer/releases/latest/download/chrome-aws-lambda-layer-nodejs18x.zip -o layers/chrome-aws-lambda.zip
```

### 2. Serverless Framework 설치 및 배포

```bash
# 전역으로 설치 (아직 설치되지 않은 경우)
pnpm add -g serverless

# 필요한 플러그인 설치
pnpm add -D serverless-dotenv-plugin

# 환경 변수 설정 (.env 파일)
echo "WING_USERNAME=your_username" > .env
echo "WING_PASSWORD=your_password" >> .env

# 배포
pnpm build
serverless deploy
```

배포가 완료되면 다음과 같은 출력이 표시됩니다:
```
endpoints:
  POST - https://abcd1234.execute-api.ap-northeast-2.amazonaws.com/dev/report
```

### 3. 서버 환경 변수 설정

Lambda 함수 URL을 서버의 환경 변수에 설정합니다:

```bash
# 프로젝트 루트 디렉토리의 .env 파일에 추가
echo "WING_REPORTER_LAMBDA_URL=https://your-lambda-url.execute-api.ap-northeast-2.amazonaws.com/dev/report" >> .env
echo "WING_USERNAME=your_wing_username" >> .env
echo "WING_PASSWORD=your_wing_password" >> .env
```

## API 사용 방법

### 요청 형식

```json
{
  "username": "your_wing_username",
  "password": "your_wing_password",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "reportType": "daily"
}
```

### 응답 형식

```json
{
  "data": [
    {
      "date": "2025-01-01",
      "campaignName": "캠페인명",
      "impressions": 1000,
      "clicks": 100,
      "ctr": 10.0,
      "cost": 50000,
      "sales": 150000,
      "roas": 300.0,
      "conversionRate": 3.0
    }
  ],
  "metadata": {
    "reportType": "daily",
    "startDate": "2025-01-01",
    "endDate": "2025-01-31",
    "generatedAt": "2025-01-31T12:00:00.000Z"
  }
}
```

## 변경사항

- **2025-12-04**: 엑셀 다운로드 대신 웹페이지에서 직접 데이터 스크래핑 방식으로 변경

## 주의사항

- `EXECUTABLE_PATH` 환경 변수는 Lambda에서 Playwright가 사용할 Chrome 브라우저의 실행 파일 경로입니다. 기본값은 `/opt/chrome/chrome`으로 설정되어 있으며, Chrome AWS Lambda Layer의 Chrome 위치와 일치해야 합니다.
- Lambda 함수는 최소 1024MB 메모리와 5분 타임아웃으로 설정하는 것이 좋습니다.
- 쿠팡 윙 광고센터의 UI가 변경될 경우, `browser.ts` 파일의 선택자들을 업데이트해야 할 수 있습니다.
- 실제 사용 전 쿠팡 윙 광고센터의 실제 UI에 맞게 `selectDateInCalendar`, `selectReportType`, `extractTableData` 메서드의 선택자들을 조정해야 합니다.