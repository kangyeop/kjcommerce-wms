# KJ Commerce WMS Server

KJ Commerce WMS(Warehouse Management System) 서버는 NestJS 프레임워크를 사용하여 구현된 RESTful API 서버입니다.

## 기술 스택

- **NestJS**: 효율적이고 확장 가능한 Node.js 서버 프레임워크
- **TypeORM**: 객체 관계 매핑(ORM) 라이브러리
- **MySQL**: 데이터베이스
- **TypeScript**: 정적 타입 언어
- **Swagger**: API 문서화

## 프로젝트 구조

```
src/
├── common/                  # 공통 기능
│   ├── entities/            # 공통 엔티티 (BaseEntity)
│   ├── exceptions/          # 예외 처리
│   ├── filters/             # 전역 예외 필터
│   └── interceptors/        # 전역 인터셉터
├── modules/                 # 기능별 모듈
│   ├── database.module.ts   # 데이터베이스 모듈
│   ├── product.module.ts    # 제품 모듈
│   ├── exchange-rate.module.ts  # 환율 모듈
│   └── order.module.ts      # 발주 모듈
├── controllers/             # 컨트롤러
│   ├── product.controller.ts
│   ├── exchange-rate.controller.ts
│   └── order.controller.ts
├── services/                # 서비스
│   ├── product.service.ts
│   ├── exchange-rate.service.ts
│   └── order.service.ts
├── repositories/            # 리포지토리
│   ├── product.repository.ts
│   ├── exchange-rate.repository.ts
│   └── order.repository.ts
├── entities/                # 엔티티
│   ├── product.entity.ts
│   ├── exchange-rate.entity.ts
│   └── order.entity.ts
├── dto/                     # DTO
│   ├── product/
│   ├── exchange-rate/
│   └── order/
├── app.module.ts            # 앱 모듈
└── main.ts                  # 메인 애플리케이션 파일
```

## 기능 구성

### 제품 관리 (Product)
- 제품 목록 조회
- 제품 상세 정보 조회
- 새 제품 등록
- 제품 정보 수정
- 제품 삭제

### 환율 관리 (Exchange Rate)
- 환율 목록 조회
- 최신 환율 조회
- 통화별 환율 조회
- 새 환율 등록
- 환율 정보 수정

### 발주 관리 (Order)
- 발주 목록 조회
- 제품별 발주 조회
- 발주 상세 정보 조회
- 새 발주 등록
- 발주 정보 수정
- 발주 삭제
- 판매가격 계산 및 조회

**발주 프로세스:**
1. 제품 등록
2. 등록된 제품으로부터 발주 추가
3. 발주 정보를 기반으로 판매가격 자동 계산
   - 총 원가 + (총 원가 × 마진율) = 판매가격

## 설치 및 실행

1. 의존성 패키지 설치
   ```bash
   pnpm install
   ```

2. 환경 설정 (.env 파일 생성)
   ```
   PORT=5000
   CORS_ORIGIN=http://localhost:5173
   
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=kjcommerce
   DB_USER=kjuser
   DB_PASSWORD=kjpassword
   DB_SYNCHRONIZE=false
   ```

3. 개발 모드 실행
   ```bash
   pnpm start:dev
   ```

4. 빌드
   ```bash
   pnpm build
   ```

5. 프로덕션 모드 실행
   ```bash
   pnpm start
   ```

## API 문서

애플리케이션이 실행되면 Swagger UI를 통해 API 문서에 접근할 수 있습니다.
- 접속 URL: http://localhost:5000/api/docs

## 마이그레이션 정보

### Express에서 NestJS로 마이그레이션

1. **아키텍처 변경**
   - Express 기반 구조에서 NestJS의 모듈식 아키텍처로 변경
   - 컨트롤러, 서비스, 모듈 분리를 통한 관심사 분리

2. **ORM 변경**
   - Sequelize에서 TypeORM으로 마이그레이션
   - 엔티티 기반의 모델 정의 방식으로 변경

3. **유효성 검증**
   - Joi 기반 검증에서 class-validator와 class-transformer 사용으로 변경
   - DTO(Data Transfer Object) 패턴 도입

4. **API 문서화**
   - Swagger를 통한 자동화된 API 문서 제공

5. **종속성 주입(DI) 활용**
   - NestJS의 종속성 주입 시스템을 통한 컴포넌트 관리