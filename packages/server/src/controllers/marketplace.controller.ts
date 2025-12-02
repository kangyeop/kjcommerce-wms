import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { MarketplaceApiService } from '../services/marketplace-api.service';
import { InventoryData, InventoryResponse, OrdersData } from '../types/marketplace.types';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceApiService: MarketplaceApiService) {}

  @Get('status')
  getStatus() {
    return {
      configured: this.marketplaceApiService.isConfigured(),
      message: this.marketplaceApiService.isConfigured()
        ? 'Marketplace API is configured'
        : 'Marketplace API credentials not found. Please set MARKETPLACE_ACCESS_KEY, MARKETPLACE_SECRET_KEY, and MARKETPLACE_VENDOR_ID in .env file.',
    };
  }

  @Get('inventory')
  async getInventory(): Promise<InventoryData> {
    try {
      const data = await this.marketplaceApiService.getInventory();
      return data;
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch inventory',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('sales-orders')
  async getSalesOrders(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<OrdersData> {
    // Default to last 7 days if not provided
    const end = startDate || '20251120';
    const start = endDate || '20251113';

    try {
      const data = await this.marketplaceApiService.getOrders(start, end);
      return data;
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to fetch sales orders',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
