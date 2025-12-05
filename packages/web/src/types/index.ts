// 제품 타입 정의
export interface Product {
  id: number;
  name: string;
  pricePerUnitYuan: number;
  weightPerUnit: number;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  productUrl?: string;
  options?: string;
  unitsPerPackage: number;
  coupangShippingFee: number;
  sellingPriceKrw?: number;
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

// 발주 아이템 타입
export interface OrderItem {
  id?: number;
  orderId?: number;
  productId: number;
  product?: Product;
  quantity: number;
  originalCostYuan: number;
  serviceFeeYuan: number;
  inspectionFeeYuan: number;
  packagingFeeYuan: number;
  domesticShippingFeeYuan: number;
  itemTotalCostKrw: number;
  unitCostKrw: number;
}

// 발주 타입 정의
export interface Order {
  id: number;
  items: OrderItem[];
  exchangeRate: number;
  internationalShippingFeeKrw: number;
  miscellaneousFeeKrw: number;
  customsFeeKrw: number;
  taxableAmountKrw: number;
  dutyKrw: number;
  vatKrw: number;
  totalCostKrw: number;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
}

// 판매가격 정보 타입
export interface Pricing {
  id: number;
  orderId: number;
  orderItemId: number;
  storageFeeKrw: number;
  marginRate: number;
  roas: number;
  actualShippingFeeKrw: number;
  marketplaceCommissionRate: number;
  sellingPriceKrw: number;
  adCostKrw: number;
  profitKrw: number;
  createdAt: string;
  updatedAt: string;
}

// 발주 아이템 생성 DTO
export interface CreateOrderItemDto {
  productId: number;
  quantity: number;
  originalCostYuan: number;
  serviceFeeYuan: number;
  inspectionFeeYuan: number;
  packagingFeeYuan: number;
  domesticShippingFeeYuan?: number;
  itemTotalCostKrw: number;
  unitCostKrw?: number;
}

// 발주 생성 DTO
export interface CreateOrderDto {
  items: CreateOrderItemDto[];
  exchangeRate: number;
  internationalShippingFeeKrw?: number;
  miscellaneousFeeKrw?: number;
  customsFeeKrw: number;
  taxableAmountKrw: number;
  dutyKrw: number;
  vatKrw: number;
  totalCostKrw: number;
  orderDate: string;
}

// 판매가격 생성 DTO
export interface CreatePricingDto {
  orderId: number;
  orderItemId: number;
  storageFeeKrw?: number;
  marginRate?: number;
  roas?: number;
  actualShippingFeeKrw?: number;
  marketplaceCommissionRate?: number;
  sellingPriceKrw: number;
  adCostKrw?: number;
  profitKrw?: number;
}

// 제품 생성 DTO
export interface CreateProductDto {
  name: string;
  pricePerUnitYuan: number;
  weightPerUnit: number;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  productUrl?: string;
  options?: string;
  unitsPerPackage: number;
  coupangShippingFee: number;
  sellingPriceKrw?: number;
}