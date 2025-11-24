import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
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
}