import { Module } from '@nestjs/common';
import { AdAnalysisService } from '../services/ad-analysis.service';
import { AdAnalysisController } from '../controllers/ad-analysis.controller';
import { WingReporterModule } from './wing-reporter.module';

@Module({
  imports: [WingReporterModule],
  controllers: [AdAnalysisController],
  providers: [AdAnalysisService],
  exports: [AdAnalysisService],
})
export class AdAnalysisModule {}
