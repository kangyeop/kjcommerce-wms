import apiClient from './api';
import { InventoryResponse, OrdersResponse } from '../types/marketplace.types';

export const marketplaceService = {
  async getStatus() {
    const response = await apiClient.get(`/marketplace/status`);
    return response.data;
  },

  async getInventory(): Promise<InventoryResponse> {
    const response = await apiClient.get(`/marketplace/inventory`);
    return response.data;
  },

  async getSalesOrders(startDate?: string, endDate?: string): Promise<OrdersResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get(`/marketplace/sales-orders?${params.toString()}`);
    return response.data;
  },
};
