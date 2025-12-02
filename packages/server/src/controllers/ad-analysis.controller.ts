import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdAnalysisService } from '../services/ad-analysis.service';

@Controller('api/ad-analysis')
export class AdAnalysisController {
  constructor(private readonly adAnalysisService: AdAnalysisService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'))
  async analyzeAdReport(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    try {
      const campaigns = this.adAnalysisService.parseExcelFile(file.buffer);
      const results = await this.adAnalysisService.analyzeCampaigns(campaigns);

      return {
        success: true,
        data: results,
      };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to analyze ad report',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
