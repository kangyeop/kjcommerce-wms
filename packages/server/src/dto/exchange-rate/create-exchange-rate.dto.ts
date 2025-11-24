import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateExchangeRateDto {
  @ApiProperty({ description: '통화 코드', example: 'CNY' })
  @IsNotEmpty()
  @IsString()
  currencyCode: string;

  @ApiProperty({ description: '환율' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  rate: number;

  @ApiProperty({ description: '적용 날짜', example: '2025-09-28' })
  @IsNotEmpty()
  @IsDateString()
  effectiveDate: string;
}