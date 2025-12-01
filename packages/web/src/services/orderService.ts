import axios from 'axios';
import { Order, CreateOrderDto } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export const orderService = {
  async getAll(): Promise<Order[]> {
    const response = await axios.get(`${API_BASE_URL}/orders`);
    return response.data;
  },

  async getById(id: number): Promise<Order> {
    const response = await axios.get(`${API_BASE_URL}/orders/${id}`);
    return response.data;
  },

  async getByProduct(productId: number): Promise<Order[]> {
    const response = await axios.get(`${API_BASE_URL}/orders/product/${productId}`);
    return response.data;
  },

  async create(order: CreateOrderDto): Promise<Order> {
    const response = await axios.post(`${API_BASE_URL}/orders`, order);
    return response.data;
  },

  async update(id: number, order: Partial<CreateOrderDto>): Promise<Order> {
    const response = await axios.put(`${API_BASE_URL}/orders/${id}`, order);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/orders/${id}`);
  }
};

export default orderService;
