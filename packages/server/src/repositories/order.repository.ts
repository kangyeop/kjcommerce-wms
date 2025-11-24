import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Order } from '../entities/order.entity';

@Injectable()
export class OrderRepository extends Repository<Order> {
  constructor(private dataSource: DataSource) {
    super(Order, dataSource.createEntityManager());
  }

  async findByProduct(productId: number): Promise<Order[]> {
    return this.find({
      where: { productId },
      relations: ['product'],
      order: { orderDate: 'DESC' },
    });
  }

  async findOneWithProduct(id: number): Promise<Order | null> {
    return this.findOne({
      where: { id },
      relations: ['product'],
    });
  }
}
