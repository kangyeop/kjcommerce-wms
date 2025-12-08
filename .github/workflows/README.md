# GitHub Actions 배포 설정 가이드

## 개요
이 프로젝트는 GitHub Actions를 사용하여 자동으로 빌드하고 특정 서버로 배포합니다.

## 워크플로우

### 1. `deploy-web.yml` - 프론트엔드 배포
- **트리거**: `packages/web/` 변경 시 또는 수동 실행
- **동작**: Web 패키지 빌드 후 dist 폴더만 서버로 전송

### 2. `deploy-server.yml` - 백엔드 배포
- **트리거**: `packages/server/` 변경 시 또는 수동 실행
- **동작**: Server 패키지 빌드 후 dist 폴더만 서버로 전송 및 PM2 재시작

## GitHub Secrets 설정

GitHub 저장소에서 다음 Secrets를 설정해야 합니다:

### 필수 Secrets

1. **SERVER_HOST**: 배포 대상 서버의 IP 주소 또는 도메인
   ```
   예: 192.168.1.100 또는 example.com
   ```

2. **SERVER_USERNAME**: SSH 접속 사용자명
   ```
   예: ubuntu, ec2-user, root 등
   ```

3. **SERVER_PASSWORD**: SSH 비밀번호
   ```
   서버 접속 비밀번호
   ```

4. **WEB_DEPLOY_PATH**: 웹 dist 파일을 배포할 서버 경로
   ```
   예: /var/www/html
   예: /home/ubuntu/app/web
   ```

5. **SERVER_DEPLOY_PATH**: 서버 dist 파일을 배포할 서버 경로
   ```
   예: /home/ubuntu/app/server
   예: /opt/kjcommerce-wms
   ```

### 선택 Secrets

6. **SERVER_PORT**: SSH 포트 (기본값: 22)
   ```
   예: 22, 2222 등
   ```

## Secrets 설정 방법

1. GitHub 저장소 페이지로 이동
2. `Settings` → `Secrets and variables` → `Actions` 클릭
3. `New repository secret` 버튼 클릭
4. Name과 Value 입력 후 저장

## 데이터베이스 파일 관리

### SQLite 데이터베이스 처리 방식

이 프로젝트는 SQLite를 사용하며, `database.sqlite` 파일은 다음과 같이 관리됩니다:

- **첫 배포 시**: 서버에 `database.sqlite` 파일이 없으면 빈 파일을 생성합니다.
- **이후 배포 시**: 기존 `database.sqlite` 파일을 **보존**합니다. (프로덕션 데이터 유지)
- **배포 내용**: `dist` 폴더, `ecosystem.config.js`, `package.json`만 전송됩니다.

### 데이터베이스 백업 (권장)

프로덕션 환경에서는 정기적으로 데이터베이스를 백업하는 것이 좋습니다:

```bash
# 서버에서 실행
cd /your/deploy/path
cp database.sqlite database.sqlite.backup-$(date +%Y%m%d-%H%M%S)
```

### 데이터베이스 초기화가 필요한 경우

데이터베이스를 완전히 초기화하려면 서버에서 직접 파일을 삭제하세요:

```bash
# 서버에서 실행 (주의: 모든 데이터가 삭제됩니다!)
cd /your/deploy/path
rm database.sqlite
# 다음 배포 시 새로운 빈 데이터베이스가 생성됩니다
```



## 수동 배포 실행

1. GitHub 저장소의 `Actions` 탭으로 이동
2. 좌측에서 원하는 워크플로우 선택 (Deploy Web 또는 Deploy Server)
3. `Run workflow` 버튼 클릭
4. 브랜치 선택 후 `Run workflow` 확인

## 배포 확인

### 로그 확인
- GitHub Actions 탭에서 실행 중인 워크플로우 클릭
- 각 단계별 로그 확인 가능

### 서버에서 확인
```bash
# 웹 배포 확인
ls -la /var/www/html  # WEB_DEPLOY_PATH

# 서버 배포 확인
ls -la /home/ubuntu/app/server  # SERVER_DEPLOY_PATH

# PM2 프로세스 확인
pm2 list
pm2 logs
```

## 트러블슈팅

### SSH 연결 실패
- SERVER_HOST, SERVER_USERNAME, SERVER_PASSWORD 확인
- 서버에서 비밀번호 인증이 허용되어 있는지 확인 (`/etc/ssh/sshd_config`에서 `PasswordAuthentication yes`)

### 빌드 실패
- Node.js 버전 확인
- pnpm 버전 확인
- 로컬에서 `pnpm build` 또는 `pnpm build:server` 테스트

### 배포 경로 오류
- WEB_DEPLOY_PATH, SERVER_DEPLOY_PATH 확인
- 서버에 해당 디렉토리가 존재하고 쓰기 권한이 있는지 확인

### PM2 재시작 실패
- ecosystem.config.js 파일이 배포 경로에 있는지 확인
- PM2가 서버에 설치되어 있는지 확인 (`pm2 --version`)

## 참고사항

- `strip_components: 3`은 `packages/web/dist` 또는 `packages/server/dist` 경로를 제거하고 dist 내부 파일만 전송합니다.
- `rm: true` 옵션은 기존 파일을 삭제하고 새로 업로드합니다.
- 각 패키지 변경 시에만 해당 워크플로우가 실행됩니다 (`paths` 필터).
