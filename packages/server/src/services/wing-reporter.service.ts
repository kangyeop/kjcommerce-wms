import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface WingReportRequest {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reportType: 'daily' | 'weekly' | 'monthly';
}

@Injectable()
export class WingReporterService {
  private readonly logger = new Logger(WingReporterService.name);
  private readonly lambdaUrl: string;
  private readonly username: string;
  private readonly password: string;

  constructor(private configService: ConfigService) {
    this.lambdaUrl = this.configService.get<string>('WING_REPORTER_LAMBDA_URL') || '';
    this.username = this.configService.get<string>('WING_USERNAME') || '';
    this.password = this.configService.get<string>('WING_PASSWORD') || '';
  }

  /**
   * Lambda 함수를 호출하여 쿠팡 윙 광고 보고서 데이터를 가져옴
   */
  async getAdReport(reportRequest: WingReportRequest): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('Wing Reporter API 설정이 되어있지 않습니다. 환경 변수를 확인해주세요.');
    }

    try {
      this.logger.log(`Getting Wing Ad Report for period: ${reportRequest.startDate} to ${reportRequest.endDate}`);

      const response = await axios.post(this.lambdaUrl, {
        username: this.username,
        password: this.password,
        ...reportRequest
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 300000 // 5분 타임아웃
      });

      this.logger.log('Successfully retrieved Wing Ad Report');
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to get Wing Ad Report: ${error.message}`, error.stack);
      
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`Wing Reporter API 오류: ${error.response.data?.error || error.message}`);
      }
      
      throw new Error(`Wing Reporter API 오류: ${error.message}`);
    }
  }

  /**
   * 필수 설정값이 있는지 확인
   */
  isConfigured(): boolean {
    return !!(this.lambdaUrl && this.username && this.password);
  }
}