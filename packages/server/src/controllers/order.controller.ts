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
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/order/create-order.dto';
import { UpdateOrderDto } from '../dto/order/update-order.dto';
import { Order } from '../entities/order.entity';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: '새 발주 등록' })
  @ApiResponse({ status: 201, description: '발주가 성공적으로 등록됨', type: Order })
  create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: '모든 발주 조회' })
  @ApiResponse({ status: 200, description: '모든 발주 목록', type: [Order] })
  findAll(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  @Get('product/:productId')
  @ApiOperation({ summary: '제품별 발주 조회' })
  @ApiResponse({ status: 200, description: '제품별 발주 목록', type: [Order] })
  findByProduct(@Param('productId', ParseIntPipe) productId: number): Promise<Order[]> {
    return this.orderService.findByProduct(productId);
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 발주 조회' })
  @ApiResponse({ status: 200, description: '특정 발주 정보', type: Order })
  @ApiResponse({ status: 404, description: '발주를 찾을 수 없음' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.orderService.findOne(id);
  }

  @Get(':id/selling-price')
  @ApiOperation({ summary: '발주의 판매가격 정보 조회' })
  @ApiResponse({
    status: 200,
    description: '판매가격 정보',
    schema: {
      properties: {
        orderId: { type: 'number' },
        totalCostKrw: { type: 'number' },
        marginRate: { type: 'number' },
        sellingPriceKrw: { type: 'number' },
        profitKrw: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 404, description: '발주를 찾을 수 없음' })
  getSellingPriceInfo(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.getSellingPriceInfo(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '발주 정보 수정' })
  @ApiResponse({ status: 200, description: '수정된 발주 정보', type: Order })
  @ApiResponse({ status: 404, description: '발주를 찾을 수 없음' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '발주 삭제' })
  @ApiResponse({ status: 204, description: '발주가 성공적으로 삭제됨' })
  @ApiResponse({ status: 404, description: '발주를 찾을 수 없음' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.orderService.remove(id);
  }
}
