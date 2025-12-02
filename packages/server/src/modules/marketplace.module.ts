import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MarketplaceApiService } from '../services/marketplace-api.service';
import { MarketplaceController } from '../controllers/marketplace.controller';

@Module({
  imports: [ConfigModule],
  controllers: [MarketplaceController],
  providers: [MarketplaceApiService],
  exports: [MarketplaceApiService],
})
export class MarketplaceModule {}
