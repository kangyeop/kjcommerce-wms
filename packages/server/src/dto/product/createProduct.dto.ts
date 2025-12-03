import { IsNotEmpty, IsNumber, IsString, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ description: '제품 이름' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: '단위당 가격 (위안화)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pricePerUnitYuan: number;

  @ApiProperty({ description: '단위당 무게 (kg)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  weightPerUnit: number;

  @ApiProperty({ description: '단위당 부피 (CBM)', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  cbmPerUnit?: number;

  @ApiProperty({ description: '상품 URL', required: false })
  @IsOptional()
  @IsString()
  productUrl?: string;

  @ApiProperty({ description: '옵션 정보', required: false })
  @IsOptional()
  @IsString()
  options?: string;

  @ApiProperty({ description: '묶음 판매 수량', example: 1, default: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  unitsPerPackage: number;

  @ApiProperty({ description: '쿠팡 배송비 (원)', example: 3000, default: 0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  coupangShippingFee: number;

  @ApiProperty({ description: '판매가격 (원)', example: 15000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  sellingPriceKrw?: number;
}