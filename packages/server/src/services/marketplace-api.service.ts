import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class MarketplaceApiService {
  private readonly logger = new Logger(MarketplaceApiService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly vendorId: string;
  private readonly baseUrl = 'https://api-gateway.coupang.com';

  constructor(private configService: ConfigService) {
    this.accessKey = this.configService.get<string>('MARKETPLACE_ACCESS_KEY') || '';
    this.secretKey = this.configService.get<string>('MARKETPLACE_SECRET_KEY') || '';
    this.vendorId = this.configService.get<string>('MARKETPLACE_VENDOR_ID') || '';

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
    });
  }

  /**
   * Generate HMAC signature for Marketplace API authentication
   * Format: yyMMddTHHmmssZ (e.g., 231202T123045Z)
   */
  private generateHmacSignature(
    method: string,
    path: string,
    query: string = '',
  ): string {
    // Generate timestamp in Coupang's required format: yyMMddTHHmmssZ
    const now = new Date();
    const year = now.getUTCFullYear().toString().slice(-2);
    const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = now.getUTCDate().toString().padStart(2, '0');
    const hours = now.getUTCHours().toString().padStart(2, '0');
    const minutes = now.getUTCMinutes().toString().padStart(2, '0');
    const seconds = now.getUTCSeconds().toString().padStart(2, '0');
    const timestamp = `${year}${month}${day}T${hours}${minutes}${seconds}Z`;

    // Message format: datetime + method + path + query
    const message = `${timestamp}${method}${path}${query}`;

    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(message)
      .digest('hex');

    return `CEA algorithm=HmacSHA256, access-key=${this.accessKey}, signed-date=${timestamp}, signature=${signature}`;
  }

  /**
   * Make authenticated request to Marketplace API
   */
  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT',
    path: string,
    query: string = '',
    data?: any,
  ): Promise<T> {
    const authorization = this.generateHmacSignature(method, path, query);

    try {
      const response = await this.axiosInstance.request<T>({
        method,
        url: path + query,
        headers: {
          Authorization: authorization,
          'Content-Type': 'application/json;charset=UTF-8',
        },
        data,
      });

      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Marketplace API request failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get Rocket Growth inventory status
   */
  async getInventory(): Promise<any> {
    if (!this.accessKey || !this.secretKey) {
      throw new Error('Marketplace API credentials not configured');
    }

    const path = `/v2/providers/openapi/apis/api/v4/vendors/${this.vendorId}/inventories`;

    try {
      const result = await this.makeRequest('GET', path);
      this.logger.log('Successfully fetched inventory data');
      return result;
    } catch (error) {
      this.logger.error('Failed to fetch inventory', error);
      throw error;
    }
  }

  /**
   * Get orders within date range
   */
  async getOrders(startDate: string, endDate: string): Promise<any> {
    if (!this.accessKey || !this.secretKey) {
      throw new Error('Marketplace API credentials not configured');
    }

    const query = `?createdAtFrom=${startDate}&createdAtTo=${endDate}`;
    const path = `/v2/providers/openapi/apis/api/v4/vendors/${this.vendorId}/ordersheets`;

    try {
      const result = await this.makeRequest('GET', path, query);
      this.logger.log(
        `Successfully fetched orders from ${startDate} to ${endDate}`,
      );
      return result;
    } catch (error) {
      this.logger.error('Failed to fetch orders', error);
      throw error;
    }
  }

  /**
   * Check if API is configured
   */
  isConfigured(): boolean {
    return !!(this.accessKey && this.secretKey && this.vendorId);
  }
}
