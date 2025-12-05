import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WingReporterService } from '../services/wing-reporter.service';
import { WingReporterController } from '../controllers/wing-reporter.controller';

@Module({
  imports: [ConfigModule],
  controllers: [WingReporterController],
  providers: [WingReporterService],
  exports: [WingReporterService],
})
export class WingReporterModule {}