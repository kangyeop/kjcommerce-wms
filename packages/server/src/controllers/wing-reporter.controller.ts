import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Query
} from '@nestjs/common';
import { WingReporterService, WingReportRequest } from '../services/wing-reporter.service';

@Controller('api/wing-reporter')
export class WingReporterController {
  constructor(private readonly wingReporterService: WingReporterService) {}

  @Get('status')
  getStatus() {
    return {
      configured: this.wingReporterService.isConfigured(),
      message: this.wingReporterService.isConfigured()
        ? '쿠팡 윙 광고 리포터 설정이 완료되었습니다.'
        : '쿠팡 윙 광고 리포터 설정이 필요합니다. WING_REPORTER_LAMBDA_URL, WING_USERNAME, WING_PASSWORD를 .env 파일에 설정해주세요.'
    };
  }

  @Post('report')
  async getAdReport(@Body() reportRequest: WingReportRequest) {
    try {
      const data = await this.wingReporterService.getAdReport(reportRequest);
      return {
        success: true,
        data
      };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: error.message || '광고 보고서 데이터를 가져오는데 실패했습니다.'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('report')
  async getAdReportGet(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('reportType') reportType: 'daily' | 'weekly' | 'monthly' = 'daily'
  ) {
    if (!startDate || !endDate) {
      throw new HttpException(
        {
          success: false,
          message: 'startDate와 endDate는 필수 파라미터입니다. (형식: YYYY-MM-DD)'
        },
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const data = await this.wingReporterService.getAdReport({
        startDate,
        endDate,
        reportType
      });

      return {
        success: true,
        data
      };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: error.message || '광고 보고서 데이터를 가져오는데 실패했습니다.'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}