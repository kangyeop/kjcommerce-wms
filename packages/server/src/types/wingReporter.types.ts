export interface WingCredentials {
  username: string;
  password: string;
}

export interface ReportRequest {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export enum ReportType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

// ============================================
// 3-Level Data Hierarchy
// ============================================

/**
 * 키워드 레벨 성과 데이터
 */
export interface KeywordPerformance {
  // 키워드 정보
  keyword: string;              // 키워드 텍스트
  status: string;               // 승인/거부/대기
  appliedProducts: string;      // 키워드 적용 상품
  keywordType: string;          // 스마트 타겟팅/수동
  bid: string | number;         // 입찰가 (자동/수동)
  
  // 성과 지표
  impressions: number;          // 노출수
  clicks: number;               // 클릭수
  ctr: number;                  // 클릭률 (%)
}

/**
 * 상품 레벨 성과 데이터
 */
export interface ProductPerformance {
  // 상품 정보
  productName: string;          // 상품명 + 옵션
  productId: string;            // 쿠팡 상품 ID
  productUrl: string;           // 쿠팡 상품 페이지 URL
  isActive: boolean;            // ON/OFF
  status: string;               // 운영 중/중지
  salesMethod: string;          // 로켓그로스 등
  
  // 성과 지표
  impressions: number;          // 노출수
  clicks: number;               // 클릭수
  ctr: number;                  // 클릭률 (%)
  sales: number;                // 광고 전환 판매수
  revenue?: number;             // 광고 전환 매출 (원)
  roas?: number;                // 광고수익률 (%)
  conversionRate?: number;      // 전환율 (%)
  cpc?: number;                 // 클릭당 비용 (원)
  
  // 키워드 데이터 (중첩)
  keywords: KeywordPerformance[];
}

/**
 * 캠페인 레벨 성과 데이터
 */
export interface CampaignPerformance {
  // 메타데이터
  collectedAt: Date;
  dateRange: {
    startDate: string;          // YYYY-MM-DD
    endDate: string;            // YYYY-MM-DD
  };
  
  // 캠페인 정보
  campaignName: string;         // 캠페인명
  isActive: boolean;            // ON/OFF
  status: string;               // 운영 중/중지
  mission?: string;             // 캠페인 성장 미션
  startDate: string;            // 시작 날짜
  
  // 예산 정보
  budget: number;               // 예산 (원)
  budgetScore?: number;         // 주간 예산 점수
  todaySpend: number;           // 오늘 누적광고비 (원)
  totalSpend: number;           // 집행 광고비 (원)
  
  // 성과 지표
  impressions: number;          // 노출수
  clicks: number;               // 클릭수
  ctr: number;                  // 클릭률 (%)
  cpc: number;                  // 클릭당 비용 (원)
  
  // 전환 지표
  conversions: number;          // 광고 전환 주문수
  conversionRate: number;       // 전환율 (%)
  sales: number;                // 광고 전환 판매수
  revenue: number;              // 광고 전환 매출 (원)
  
  // ROI 지표
  roas: number;                 // 광고수익률 (%)
  
  // 상품 데이터 (중첩)
  products: ProductPerformance[];
}

/**
 * 전체 보고서 응답
 */
export interface WingReport {
  campaigns: CampaignPerformance[];
  metadata: {
    startDate: string;
    endDate: string;
    generatedAt: string;
    totalCampaigns: number;
    totalProducts: number;
    totalKeywords: number;
  };
}
