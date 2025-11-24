import apiClient from './api';
import { Order, CreateOrderDto, UpdateOrderDto, SellingPriceInfo } from '../types';

// 발주 서비스
const orderService = {
  // 모든 발주 조회
  getAll: async (): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>('/orders');
    return response.data;
  },

  // 특정 발주 조회
  getById: async (id: number): Promise<Order> => {
    const response = await apiClient.get<Order>(`/orders/${id}`);
    return response.data;
  },

  // 제품별 발주 내역 조회
  getByProduct: async (productId: number): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>(`/orders/product/${productId}`);
    return response.data;
  },

  // 판매가격 정보 조회
  getSellingPriceInfo: async (id: number): Promise<SellingPriceInfo> => {
    const response = await apiClient.get<SellingPriceInfo>(`/orders/${id}/selling-price`);
    return response.data;
  },

  // 발주 생성
  create: async (order: CreateOrderDto): Promise<Order> => {
    const response = await apiClient.post<Order>('/orders', order);
    return response.data;
  },

  // 발주 수정
  update: async (id: number, order: UpdateOrderDto): Promise<Order> => {
    const response = await apiClient.put<Order>(`/orders/${id}`, order);
    return response.data;
  },

  // 발주 삭제
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/orders/${id}`);
  }
};

export default orderService;
