import apiClient from './api';
import { ExchangeRate } from '../types';

// 환율 서비스
const exchangeRateService = {
  // 최신 환율 조회
  getLatest: async (currencyCode: string = 'CNY'): Promise<ExchangeRate> => {
    const response = await apiClient.get<ExchangeRate>(`/exchange-rates/latest?currency_code=${currencyCode}`);
    return response.data;
  },

  // 모든 환율 조회
  getAll: async (): Promise<ExchangeRate[]> => {
    const response = await apiClient.get<ExchangeRate[]>('/exchange-rates');
    return response.data;
  },

  // 특정 환율 조회
  getById: async (id: number): Promise<ExchangeRate> => {
    const response = await apiClient.get<ExchangeRate>(`/exchange-rates/${id}`);
    return response.data;
  },

  // 환율 생성
  create: async (exchangeRate: Omit<ExchangeRate, 'id' | 'createdAt'>): Promise<ExchangeRate> => {
    const response = await apiClient.post<ExchangeRate>('/exchange-rates', exchangeRate);
    return response.data;
  },

  // 환율 수정
  update: async (id: number, exchangeRate: Omit<ExchangeRate, 'id' | 'createdAt'>): Promise<ExchangeRate> => {
    const response = await apiClient.put<ExchangeRate>(`/exchange-rates/${id}`, exchangeRate);
    return response.data;
  },

  // 환율 삭제
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/exchange-rates/${id}`);
  }
};

export default exchangeRateService;