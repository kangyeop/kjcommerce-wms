import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePricingDto {
  @ApiProperty({ description: '발주 ID', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  orderId?: number;

  @ApiProperty({ description: '발주 아이템 ID', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  orderItemId?: number;

  @ApiProperty({ description: '제품 ID', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiProperty({ description: '보관료 (원화)', example: 10000, required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  storageFeeKrw?: number;

  @ApiProperty({ description: '마진율 (%)', example: 30, required: false, default: 30 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  marginRate?: number;

  @ApiProperty({ description: 'ROAS (배수)', example: 2, required: false, default: 2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  roas?: number;

  @ApiProperty({ description: '실제 배송비 (원화)', example: 3000, required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  actualShippingFeeKrw?: number;

  @ApiProperty({ description: '온라인 판매점 수수료율 (%)', example: 10, required: false, default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  marketplaceCommissionRate?: number;

  @ApiProperty({ description: '판매가격 (원화)', example: 15000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  sellingPriceKrw: number;

  @ApiProperty({ description: '광고비 (원화)', example: 7500, required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  adCostKrw?: number;

  @ApiProperty({ description: '순이익 (원화)', example: 3000, required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  profitKrw?: number;
}
