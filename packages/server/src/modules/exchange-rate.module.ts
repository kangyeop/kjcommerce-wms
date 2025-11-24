import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeRateController } from '../controllers/exchange-rate.controller';
import { ExchangeRateService } from '../services/exchange-rate.service';
import { ExchangeRateRepository } from '../repositories/exchange-rate.repository';
import { ExchangeRate } from '../entities/exchange-rate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExchangeRate])],
  controllers: [ExchangeRateController],
  providers: [ExchangeRateService, ExchangeRateRepository],
  exports: [ExchangeRateService, ExchangeRateRepository],
})
export class ExchangeRateModule {}