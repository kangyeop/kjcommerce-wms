import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/product/create-product.dto';
import { UpdateProductDto } from '../dto/product/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return await this.productRepository.create(createProductDto);
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.findAll();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOneById(id);
    
    if (!product) {
      throw new NotFoundException(`제품 ID ${id}를 찾을 수 없습니다.`);
    }
    
    return product;
  }

  async findOneWithOrders(id: number): Promise<Product> {
    const product = await this.productRepository.findOneWithOrders(id);
    
    if (!product) {
      throw new NotFoundException(`제품 ID ${id}를 찾을 수 없습니다.`);
    }
    
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    return await this.productRepository.update(id, updateProductDto);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    
    // 이 제품을 사용하는 발주가 있는지 확인
    const orderCount = await this.productRepository.countOrdersByProductId(id);
    if (orderCount > 0) {
      throw new BadRequestException(
        `이 제품은 ${orderCount}개의 발주에서 사용 중이므로 삭제할 수 없습니다.`
      );
    }
    
    await this.productRepository.remove(id);
  }
}