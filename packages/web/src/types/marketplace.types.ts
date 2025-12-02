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

export interface OrderItem {
  vendorItemId: number;
  productName: string;
  salesQuantity: number;
  unitSalesPrice: string;
  currency: string;
}

export type InventoryResponse = InventoryItem[];
export type OrdersResponse = {
  paidAt: string;
  orderItems: OrderItem[];
}[];
