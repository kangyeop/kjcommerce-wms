export interface SalesCountMap {
  SALES_COUNT_LAST_THIRTY_DAYS: number;
}

export interface InventoryDetails {
  totalOrderableQuantity: number;
}

export interface InventoryItem {
  vendorId: string;
  vendorItemId: string;
  externalSkuId: string;
  inventoryDetails: InventoryDetails;
  salesCountMap: SalesCountMap;
}

export interface InventoryResponse {
  code: string; // SUCCESS/ERROR
  message: string;
  data: InventoryData;
  nextToken?: string;
}

export interface OrderItem {
  vendorItemId: number;
  productName: string;
  salesQuantity: number;
  unitSalesPrice: string;
  currency: string;
}

export interface OrdersResponse {
  code: string; // SUCCESS/ERROR
  message: string;
  data: OrdersData;
  nextToken?: string;
}

export type InventoryData = InventoryItem[];
export type OrdersData = {
  paidAt: string;
  orderItems: OrderItem[];
};
