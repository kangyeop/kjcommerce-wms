import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsDateString, IsPositive, Min, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @ApiProperty({ description: '발주 아이템 목록', type: [CreateOrderItemDto] })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty({ description: '환율', example: 180.50 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  exchangeRate: number;

  @ApiProperty({ description: '해외 배송비 (원화)', example: 6000, required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  internationalShippingFeeKrw?: number;

  @ApiProperty({ description: '기타 비용 (원화)', example: 5000, required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  miscellaneousFeeKrw?: number;

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

  @ApiProperty({ description: '발주일', example: '2024-01-15' })
  @IsNotEmpty()
  @IsDateString()
  orderDate: string;
}
