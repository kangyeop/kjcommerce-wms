import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WingBrowserService } from './wingBrowser.service';
import { WingReport } from '../types/wingReporter.types';

export interface WingReportRequest {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reportType: 'daily' | 'weekly' | 'monthly';
}

@Injectable()
export class WingReporterService {
  private readonly logger = new Logger(WingReporterService.name);
  private readonly username: string;
  private readonly password: string;

  constructor(
    private configService: ConfigService,
    private wingBrowserService: WingBrowserService,
  ) {
    this.username = this.configService.get<string>('WING_USERNAME') || '';
    this.password = this.configService.get<string>('WING_PASSWORD') || '';
  }

  /**
   * 브라우저 자동화를 통해 쿠팡 윙 광고 보고서 데이터를 가져옴
   */
  async getAdReport(reportRequest: WingReportRequest): Promise<WingReport> {
    if (!this.isConfigured()) {
      throw new Error('Wing Reporter 설정이 되어있지 않습니다. WING_USERNAME, WING_PASSWORD 환경 변수를 확인해주세요.');
    }

    try {
      this.logger.log(`Getting Wing Ad Report for period: ${reportRequest.startDate} to ${reportRequest.endDate}`);

      const report = await this.wingBrowserService.scrapeReportData(
        {
          username: this.username,
          password: this.password,
        },
        {
          startDate: reportRequest.startDate,
          endDate: reportRequest.endDate,
        }
      );

      this.logger.log('Successfully retrieved Wing Ad Report');
      return report;
    } catch (error: any) {
      this.logger.error(`Failed to get Wing Ad Report: ${error.message}`, error.stack);
      throw new Error(`Wing Reporter 오류: ${error.message}`);
    }
  }

  /**
   * 필수 설정값이 있는지 확인
   */
  isConfigured(): boolean {
    return !!(this.username && this.password);
  }
}