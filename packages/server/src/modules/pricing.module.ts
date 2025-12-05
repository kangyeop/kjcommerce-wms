import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pricing } from '../entities/pricing.entity';
import { OrderItem } from '../entities/order-item.entity';
import { PricingService } from '../services/pricing.service';
import { PricingController } from '../controllers/pricing.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pricing, OrderItem])],
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
