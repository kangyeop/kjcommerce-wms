import axios from 'axios';
import { Pricing, CreatePricingDto } from '../types';

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || '/api';

export const pricingService = {
  // 판매가격 정보 생성/수정
  create: async (pricing: CreatePricingDto): Promise<Pricing> => {
    const response = await axios.post(`${API_BASE_URL}/pricings`, pricing);
    return response.data;
  },

  // 특정 발주의 모든 판매가격 정보 조회
  findByOrder: async (orderId: number): Promise<Pricing[]> => {
    const response = await axios.get(`${API_BASE_URL}/pricings/order/${orderId}`);
    return response.data;
  },

  // 특정 판매가격 정보 조회
  findOne: async (id: number): Promise<Pricing> => {
    const response = await axios.get(`${API_BASE_URL}/pricings/${id}`);
    return response.data;
  },

  // 판매가격 정보 삭제
  remove: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/pricings/${id}`);
  }
};

export default pricingService;
