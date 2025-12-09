# Wing Reporter 데이터 구조

Wing Reporter는 쿠팡 윙 광고센터에서 **3단계 계층 구조**로 데이터를 수집합니다.

## 📊 데이터 계층 구조

```
WingReport
└── campaigns[] (캠페인 레벨)
    └── products[] (상품 레벨)
        └── keywords[] (키워드 레벨)
```

---

## 1️⃣ 캠페인 레벨 (`CampaignPerformance`)

### 캠페인 기본 정보
| 필드 | 타입 | 설명 |
|------|------|------|
| `campaignName` | `string` | 캠페인명 |
| `isActive` | `boolean` | ON/OFF 상태 |
| `status` | `string` | 운영 중/중지 |
| `mission` | `string?` | 캠페인 성장 미션 |
| `startDate` | `string` | 시작 날짜 (YYYY-MM-DD) |

### 예산 정보
| 필드 | 타입 | 설명 |
|------|------|------|
| `budget` | `number` | 예산 (원) |
| `budgetScore` | `number?` | 주간 예산 점수 |
| `todaySpend` | `number` | 오늘 누적광고비 (원) |
| `totalSpend` | `number` | **집행 광고비 (원)** ⭐ |

### 성과 지표
| 필드 | 타입 | 설명 |
|------|------|------|
| `impressions` | `number` | 노출수 |
| `clicks` | `number` | 클릭수 |
| `ctr` | `number` | 클릭률 (%) |
| `cpc` | `number` | 클릭당 비용 (원) |

### 전환 지표
| 필드 | 타입 | 설명 |
|------|------|------|
| `conversions` | `number` | 광고 전환 주문수 |
| `conversionRate` | `number` | 전환율 (%) |
| `sales` | `number` | **광고 전환 판매수** ⭐ |
| `revenue` | `number` | 광고 전환 매출 (원) |
| `roas` | `number` | **광고수익률 (%)** ⭐ |

### 중첩 데이터
| 필드 | 타입 | 설명 |
|------|------|------|
| `products` | `ProductPerformance[]` | 해당 캠페인의 상품 목록 |

---

## 2️⃣ 상품 레벨 (`ProductPerformance`)

### 상품 정보
| 필드 | 타입 | 설명 |
|------|------|------|
| `productName` | `string` | 상품명 + 옵션 |
| `productId` | `string` | 쿠팡 상품 ID |
| `productUrl` | `string` | 쿠팡 상품 페이지 URL |
| `isActive` | `boolean` | ON/OFF |
| `status` | `string` | 운영 중/중지 |
| `salesMethod` | `string` | 로켓그로스 등 |

### 성과 지표
| 필드 | 타입 | 설명 |
|------|------|------|
| `impressions` | `number` | 노출수 |
| `clicks` | `number` | 클릭수 |
| `ctr` | `number` | 클릭률 (%) |
| `sales` | `number` | 광고 전환 판매수 |
| `revenue` | `number?` | 광고 전환 매출 (원) |
| `roas` | `number?` | 광고수익률 (%) |
| `conversionRate` | `number?` | 전환율 (%) |
| `cpc` | `number?` | 클릭당 비용 (원) |

### 중첩 데이터
| 필드 | 타입 | 설명 |
|------|------|------|
| `keywords` | `KeywordPerformance[]` | 해당 상품의 키워드 목록 |

---

## 3️⃣ 키워드 레벨 (`KeywordPerformance`)

### 키워드 정보
| 필드 | 타입 | 설명 |
|------|------|------|
| `keyword` | `string` | 키워드 텍스트 |
| `status` | `string` | 승인/거부/대기 |
| `appliedProducts` | `string` | 키워드 적용 상품 |
| `keywordType` | `string` | 스마트 타겟팅/수동 |
| `bid` | `string \| number` | 입찰가 (자동/수동) |

### 성과 지표
| 필드 | 타입 | 설명 |
|------|------|------|
| `impressions` | `number` | 노출수 |
| `clicks` | `number` | 클릭수 |
| `ctr` | `number` | 클릭률 (%) |

---

## 📦 전체 보고서 구조 (`WingReport`)

```typescript
interface WingReport {
  campaigns: CampaignPerformance[];
  metadata: {
    startDate: string;        // 조회 시작일 (YYYY-MM-DD)
    endDate: string;          // 조회 종료일 (YYYY-MM-DD)
    generatedAt: string;      // 생성 시각 (ISO 8601)
    totalCampaigns: number;   // 총 캠페인 수
    totalProducts: number;    // 총 상품 수
    totalKeywords: number;    // 총 키워드 수
  };
}
```

---

## 🎯 현재 Ad Analysis에서 사용 중인 데이터

현재 `ad-analysis.service.ts`에서는 **캠페인 레벨 데이터만** 사용합니다:

```typescript
const campaigns: AdCampaign[] = report.campaigns.map((c) => ({
  campaignName: c.campaignName,    // 캠페인명
  spend: c.totalSpend,             // 집행 광고비 (원)
  sales: c.sales,                  // 광고 전환 판매수
  roas: c.roas,                    // 광고수익률 (%)
}));
```

### 현재 분석 로직
- **ROAS < 200%**: 입찰가 10% 하향 조정 권장
- **ROAS > 400%**: 입찰가 10% 상향 조정 권장
- **200% ≤ ROAS ≤ 400%**: 현재 유지

---

## 💡 활용 가능한 추가 데이터

Wing Reporter에서 수집하지만 아직 활용하지 않는 데이터:

### 1. 상품별 성과 분석
- 각 캠페인 내에서 어떤 상품이 가장 효율적인지 분석
- 저성과 상품 식별 및 제외 권장

### 2. 키워드별 성과 분석
- 고성과 키워드 식별 및 입찰가 상향 권장
- 저성과 키워드 식별 및 입찰가 하향/제외 권장

### 3. 예산 소진율 분석
- `budget` vs `totalSpend` 비교
- 예산 조기 소진 또는 미달 캠페인 식별

### 4. 클릭/전환 퍼널 분석
- `impressions` → `clicks` → `conversions` 퍼널 분석
- CTR, 전환율 개선 포인트 식별

### 5. CPC 최적화
- 클릭당 비용 대비 전환율 분석
- 비용 효율적인 입찰가 제안

---

## 🔧 데이터 수집 방법

Wing Reporter는 Playwright를 사용하여 쿠팡 윙 광고센터에 자동으로 로그인하고 데이터를 스크래핑합니다:

1. **로그인**: 쿠팡 마켓플레이스 판매자 계정으로 로그인
2. **날짜 범위 설정**: 사용자가 지정한 기간으로 필터링
3. **캠페인 데이터 수집**: AG Grid에서 캠페인 레벨 데이터 추출
4. **상품 데이터 수집**: 각 캠페인을 클릭하여 상품 레벨 데이터 추출
5. **키워드 데이터 수집**: 각 상품의 "키워드 보기" 모달에서 키워드 데이터 추출

### 환경 변수 설정 필요
```env
WING_USERNAME=your_coupang_username
WING_PASSWORD=your_coupang_password
CHROME_PATH=/path/to/chrome  # Playwright용 Chrome 경로
```

---

## 📝 참고 파일

- **타입 정의**: `/packages/server/src/types/wingReporter.types.ts`
- **데이터 수집**: `/packages/server/src/services/wingBrowser.service.ts`
- **서비스 로직**: `/packages/server/src/services/wing-reporter.service.ts`
- **분석 로직**: `/packages/server/src/services/ad-analysis.service.ts`
