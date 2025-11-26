import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsDateString, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty({ description: '제품 ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  productId: number;

  @ApiProperty({ description: '수량', example: 100 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ description: '단위당 원가 (위안)', example: 10.50 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  originalCostYuan: number;

  @ApiProperty({ description: '환율', example: 180.50 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  exchangeRate: number;

  @ApiProperty({ description: '서비스 수수료 (위안)', example: 5.00 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  serviceFeeYuan: number;

  @ApiProperty({ description: '검수 수수료 (위안)', example: 2.00 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  inspectionFeeYuan: number;

  @ApiProperty({ description: '포장 수수료 (위안)', example: 1.50 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  packagingFeeYuan: number;

  @ApiProperty({ description: '배송비 (원화)', example: 50000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  shippingFeeKrw: number;

  @ApiProperty({ description: '통관 수수료 (원화)', example: 10000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  customsFeeKrw: number;

  @ApiProperty({ description: '과세 대상 금액 (원화)', example: 100000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  taxableAmountKrw: number;

  @ApiProperty({ description: '관세 (원화)', example: 8000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  dutyKrw: number;

  @ApiProperty({ description: '부가세 (원화)', example: 10000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  vatKrw: number;

  @ApiProperty({ description: '총 원가 (원화)', example: 200000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalCostKrw: number;

  @ApiProperty({ description: '마진율 (%)', example: 30, required: false, default: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  marginRate?: number;

  @ApiProperty({ description: 'ROAS (광고비 비율 %)', example: 20, required: false, default: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  roas?: number;

  @ApiProperty({ description: '실제 배송비 (원화)', example: 3000, required: false, default: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  actualShippingFeeKrw?: number;

  @ApiProperty({ description: '온라인 판매점 수수료율 (%)', example: 10, required: false, default: 10 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  marketplaceCommissionRate?: number;

  @ApiProperty({ description: '발주일', example: '2024-01-15' })
  @IsNotEmpty()
  @IsDateString()
  orderDate: string;
}
