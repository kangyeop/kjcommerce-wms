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
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/product/create-product.dto';
import { UpdateProductDto } from '../dto/product/update-product.dto';
import { Product } from '../entities/product.entity';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: '새 제품 등록' })
  @ApiResponse({ status: 201, description: '제품이 성공적으로 생성됨', type: Product })
  create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: '모든 제품 조회' })
  @ApiResponse({ status: 200, description: '모든 제품 목록', type: [Product] })
  findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 제품 조회' })
  @ApiResponse({ status: 200, description: '특정 제품 정보', type: Product })
  @ApiResponse({ status: 404, description: '제품을 찾을 수 없음' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '제품 정보 수정' })
  @ApiResponse({ status: 200, description: '수정된 제품 정보', type: Product })
  @ApiResponse({ status: 404, description: '제품을 찾을 수 없음' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '제품 삭제' })
  @ApiResponse({ status: 204, description: '제품이 성공적으로 삭제됨' })
  @ApiResponse({ status: 404, description: '제품을 찾을 수 없음' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.productService.remove(id);
  }
}