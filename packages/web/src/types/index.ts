// 제품 타입 정의
export interface Product {
  id: number;
  name: string;
  pricePerUnitYuan: number;
  weightPerUnit: number;
  productUrl?: string;
  options?: string;
  unitsPerPackage?: number;
  createdAt: string;
  updatedAt: string;
}

// 환율 타입 정의
export interface ExchangeRate {
  id: number;
  currencyCode: string;
  rate: number;
  effectiveDate: string;
  createdAt: string;
}

// 발주 타입 정의
export interface Order {
  id: number;
  productId: number;
  product?: Product;
  quantity: number;
  originalCostYuan: number;
  exchangeRate: number;
  serviceFeeYuan: number;
  inspectionFeeYuan: number;
  packagingFeeYuan: number;
  domesticShippingFeeYuan: number;
  internationalShippingFeeKrw: number;
  shippingFeeKrw: number;
  miscellaneousFeeKrw: number;
  customsFeeKrw: number;
  taxableAmountKrw: number;
  dutyKrw: number;
  vatKrw: number;
  totalCostKrw: number;
  marginRate: number;
  roas: number;
  actualShippingFeeKrw: number;
  marketplaceCommissionRate: number;
  sellingPriceKrw: number;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
}

// 판매가격 정보 타입
export interface SellingPriceInfo {
  orderId: number;
  totalCostKrw: number;
  marginRate: number;
  sellingPriceKrw: number;
  profitKrw: number;
}

// 발주 생성 DTO
export interface CreateOrderDto {
  productId: number;
  quantity: number;
  originalCostYuan: number;
  exchangeRate: number;
  serviceFeeYuan: number;
  inspectionFeeYuan: number;
  packagingFeeYuan: number;
  domesticShippingFeeYuan?: number;
  internationalShippingFeeKrw?: number;
  shippingFeeKrw?: number;
  miscellaneousFeeKrw?: number;
  customsFeeKrw: number;
  taxableAmountKrw: number;
  dutyKrw: number;
  vatKrw: number;
  totalCostKrw: number;
  marginRate?: number;
  roas?: number;
  actualShippingFeeKrw?: number;
  marketplaceCommissionRate?: number;
  orderDate: string;
}

// 발주 수정 DTO
export type UpdateOrderDto = Partial<CreateOrderDto>;

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}