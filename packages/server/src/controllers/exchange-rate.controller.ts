import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExchangeRateService } from '../services/exchange-rate.service';
import { CreateExchangeRateDto } from '../dto/exchange-rate/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from '../dto/exchange-rate/update-exchange-rate.dto';
import { ExchangeRate } from '../entities/exchange-rate.entity';

@ApiTags('exchange-rates')
@Controller('exchange-rates')
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Post()
  @ApiOperation({ summary: '새 환율 정보 등록' })
  @ApiResponse({ status: 201, description: '환율 정보가 성공적으로 등록됨', type: ExchangeRate })
  create(@Body() createExchangeRateDto: CreateExchangeRateDto): Promise<ExchangeRate> {
    return this.exchangeRateService.create(createExchangeRateDto);
  }

  @Get()
  @ApiOperation({ summary: '모든 환율 정보 조회' })
  @ApiResponse({ status: 200, description: '모든 환율 정보 목록', type: [ExchangeRate] })
  findAll(): Promise<ExchangeRate[]> {
    return this.exchangeRateService.findAll();
  }

  @Get('currency/:currencyCode')
  @ApiOperation({ summary: '특정 통화의 환율 정보 조회' })
  @ApiResponse({ status: 200, description: '특정 통화의 환율 정보 목록', type: [ExchangeRate] })
  findByCurrency(@Param('currencyCode') currencyCode: string): Promise<ExchangeRate[]> {
    return this.exchangeRateService.findByCurrency(currencyCode);
  }

  @Get('latest/:currencyCode')
  @ApiOperation({ summary: '특정 통화의 최신 환율 정보 조회' })
  @ApiResponse({ status: 200, description: '특정 통화의 최신 환율 정보', type: ExchangeRate })
  @ApiResponse({ status: 404, description: '환율 정보를 찾을 수 없음' })
  findLatest(@Param('currencyCode') currencyCode: string): Promise<ExchangeRate> {
    return this.exchangeRateService.findLatest(currencyCode);
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 환율 정보 조회' })
  @ApiResponse({ status: 200, description: '특정 환율 정보', type: ExchangeRate })
  @ApiResponse({ status: 404, description: '환율 정보를 찾을 수 없음' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ExchangeRate> {
    return this.exchangeRateService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '환율 정보 수정' })
  @ApiResponse({ status: 200, description: '수정된 환율 정보', type: ExchangeRate })
  @ApiResponse({ status: 404, description: '환율 정보를 찾을 수 없음' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExchangeRateDto: UpdateExchangeRateDto,
  ): Promise<ExchangeRate> {
    return this.exchangeRateService.update(id, updateExchangeRateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '환율 정보 삭제' })
  @ApiResponse({ status: 204, description: '환율 정보가 성공적으로 삭제됨' })
  @ApiResponse({ status: 404, description: '환율 정보를 찾을 수 없음' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.exchangeRateService.remove(id);
  }
}