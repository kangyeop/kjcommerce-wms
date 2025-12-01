import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
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

  @ApiProperty({ description: '중국내 배송비 (위안)', example: 10.0, required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  domesticShippingFeeYuan?: number;

  @ApiProperty({ description: '아이템 총 원가 (원화)', example: 50000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  itemTotalCostKrw: number;

  @ApiProperty({ description: '개당 원가 (원화)', example: 5000, required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitCostKrw?: number;
}
