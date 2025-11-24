import apiClient from './api';
import { Product } from '../types';

// 제품 서비스
const productService = {
  // 모든 제품 조회
  getAll: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/products');
    return response.data;
  },

  // 특정 제품 조회
  getById: async (id: number): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  // 제품 생성
  create: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const response = await apiClient.post<Product>('/products', product);
    return response.data;
  },

  // 제품 수정
  update: async (id: number, product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const response = await apiClient.put<Product>(`/products/${id}`, product);
    return response.data;
  },

  // 제품 삭제
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  }
};

export default productService;