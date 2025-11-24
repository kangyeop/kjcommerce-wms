import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  async create(product: Partial<Product>): Promise<Product> {
    const newProduct = this.repository.create(product);
    return await this.repository.save(newProduct);
  }

  async findAll(): Promise<Product[]> {
    return await this.repository.find({
      order: { name: 'ASC' },
    });
  }

  async findOneById(id: number): Promise<Product | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['orders'],
    });
  }

  async update(id: number, productData: Partial<Product>): Promise<Product> {
    await this.repository.update(id, productData);
    const product = await this.findOneById(id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }
    return product;
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}