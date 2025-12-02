import axios from 'axios'

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'

export const marketplaceService = {
  async getStatus() {
    const response = await axios.get(`${API_BASE_URL}/api/marketplace/status`)
    return response.data
  },

  async getInventory() {
    const response = await axios.get(`${API_BASE_URL}/api/marketplace/inventory`)
    return response.data
  },

  async getSalesOrders(startDate?: string, endDate?: string) {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    const response = await axios.get(
      `${API_BASE_URL}/api/marketplace/sales-orders?${params.toString()}`
    )
    return response.data
  },
}
