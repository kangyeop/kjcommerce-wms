import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database.module';
import { ProductModule } from './modules/product.module';
import { OrderModule } from './modules/order.module';
import { ExchangeRateModule } from './modules/exchange-rate.module';
import { MarketplaceModule } from './modules/marketplace.module';
import { AdAnalysisModule } from './modules/ad-analysis.module';
import { WingReporterModule } from './modules/wing-reporter.module';
import { PricingModule } from './modules/pricing.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    // 환경 변수 설정
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // 데이터베이스 연결
    DatabaseModule,
    
    // 비즈니스 모듈
    ProductModule,
    OrderModule,
    ExchangeRateModule,
    MarketplaceModule,
    AdAnalysisModule,
    WingReporterModule,
    PricingModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}