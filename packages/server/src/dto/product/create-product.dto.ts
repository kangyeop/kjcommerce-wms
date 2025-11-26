import { IsNotEmpty, IsNumber, IsString, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: '제품 이름' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: '단위당 가격 (위안화)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  pricePerUnitYuan: number;

  @ApiProperty({ description: '단위당 무게 (kg)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  weightPerUnit: number;

  @ApiProperty({ description: '상품 URL', required: false })
  @IsOptional()
  @IsString()
  productUrl?: string;

  @ApiProperty({ description: '옵션 정보', required: false })
  @IsOptional()
  @IsString()
  options?: string;

  @ApiProperty({ description: '묶음 판매 수량', example: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  unitsPerPackage?: number;
}