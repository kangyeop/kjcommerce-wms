import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PricingService } from '../services/pricing.service';
import { CreatePricingDto } from '../dto/pricing/create-pricing.dto';
import { UpdatePricingDto } from '../dto/pricing/update-pricing.dto';
import { Pricing } from '../entities/pricing.entity';

@ApiTags('pricings')
@Controller('pricings')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post()
  @ApiOperation({ summary: '판매가격 정보 등록/수정' })
  @ApiResponse({ status: 201, description: '판매가격 정보가 성공적으로 등록됨', type: Pricing })
  create(@Body() createPricingDto: CreatePricingDto): Promise<Pricing> {
    return this.pricingService.create(createPricingDto);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: '특정 발주의 모든 판매가격 정보 조회' })
  @ApiResponse({ status: 200, description: '발주의 판매가격 목록', type: [Pricing] })
  findByOrder(@Param('orderId', ParseIntPipe) orderId: number): Promise<Pricing[]> {
    return this.pricingService.findByOrder(orderId);
  }

  @Get()
  @ApiOperation({ summary: '모든 판매가격 정보 조회' })
  @ApiResponse({ status: 200, description: '판매가격 목록', type: [Pricing] })
  findAll(): Promise<Pricing[]> {
    return this.pricingService.findAll();
  }

  @Get('product/:productId')
  @ApiOperation({ summary: '특정 제품의 모든 판매가격 정보 조회' })
  @ApiResponse({ status: 200, description: '제품의 판매가격 목록', type: [Pricing] })
  findByProduct(@Param('productId', ParseIntPipe) productId: number): Promise<Pricing[]> {
    return this.pricingService.findByProduct(productId);
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 판매가격 정보 조회' })
  @ApiResponse({ status: 200, description: '판매가격 정보', type: Pricing })
  @ApiResponse({ status: 404, description: '정보를 찾을 수 없음' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Pricing> {
    return this.pricingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '판매가격 정보 수정' })
  @ApiResponse({ status: 200, description: '성공적으로 수정됨', type: Pricing })
  @ApiResponse({ status: 404, description: '정보를 찾을 수 없음' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePricingDto: UpdatePricingDto,
  ): Promise<Pricing> {
    return this.pricingService.update(id, updatePricingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '판매가격 정보 삭제' })
  @ApiResponse({ status: 204, description: '성공적으로 삭제됨' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.pricingService.remove(id);
  }
}
