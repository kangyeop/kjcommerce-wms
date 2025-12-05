# Chrome Lambda Layer 설정 가이드

이 문서는 AWS Lambda에서 Playwright와 함께 사용할 Chrome 브라우저를 Layer로 설정하는 방법을 설명합니다.

## Chrome AWS Lambda Layer 생성

### 1. 필요 파일 다운로드

AWS Lambda에서 Chrome을 실행하기 위해서는 특별히 패키징된 Chrome 바이너리가 필요합니다. 다음 GitHub 저장소에서 제공하는 패키지를 사용할 수 있습니다:

- [Chrome AWS Lambda](https://github.com/shelfio/chrome-aws-lambda-layer)

또는 직접 Layer를 구성할 수 있습니다:

```bash
mkdir -p layer/nodejs
cd layer/nodejs

# 필요한 패키지 설치
npm init -y
npm i chrome-aws-lambda@latest

# Lambda Layer에 필요한 디렉토리 구조 생성
mkdir -p bin
cd bin

# Chrome 바이너리 다운로드 (플랫폼에 맞게 선택)
wget https://github.com/alixaxel/chrome-aws-lambda/releases/latest/download/chrome-aws-lambda-layer.zip
unzip chrome-aws-lambda-layer.zip

cd ../../..
```

### 2. 레이어 패키징

```bash
zip -r chrome-aws-lambda.zip layer/
mv chrome-aws-lambda.zip layers/
```

### 3. AWS Console에서 레이어 생성

1. AWS Lambda 콘솔에서 "Layers" 메뉴 선택
2. "Create layer" 클릭
3. 다음 정보 입력:
   - Name: chrome-aws-lambda
   - Description: Chrome binary for Playwright
   - Upload: zip 파일 업로드
   - Compatible runtimes: Node.js 18.x, Node.js 20.x

### 4. Serverless Framework으로 레이어 배포

serverless.yml 파일에 다음과 같이 레이어 정의:

```yaml
layers:
  chrome:
    name: chrome-aws-lambda
    description: Chrome binary for Playwright
    compatibleRuntimes:
      - nodejs20.x
    package:
      artifact: layers/chrome-aws-lambda.zip
```

## Lambda 함수에서 Chrome Layer 사용

Lambda 함수에 Chrome Layer를 연결하려면 다음과 같이 설정합니다:

```yaml
functions:
  reporter:
    handler: dist/handler.handler
    events:
      - http:
          path: report
          method: post
          cors: true
    layers:
      - { Ref: ChromeAwsLambdaLayer }
    environment:
      CHROME_PATH: /opt/chrome/chrome
```

## 주의사항

1. Lambda 함수의 메모리는 최소 1024MB 이상으로 설정해야 합니다.
2. 타임아웃은 최소 30초 이상으로 설정하는 것이 좋습니다.
3. Node.js 18.x 이상 런타임을 사용해야 합니다.
4. Lambda의 /tmp 디렉토리를 사용하여 다운로드 및 임시 파일을 저장합니다.
5. 최신 버전의 chrome-aws-lambda를 사용하는 것이 좋습니다.