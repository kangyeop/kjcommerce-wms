import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database.module';
import { ProductModule } from './modules/product.module';
import { OrderModule } from './modules/order.module';
import { ExchangeRateModule } from './modules/exchange-rate.module';
import { AppController } from './app.controller';
import { PricingController } from './controllers/pricing.controller';
import { PricingService } from './services/pricing.service';

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
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}