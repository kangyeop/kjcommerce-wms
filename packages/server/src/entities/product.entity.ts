import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Order } from './order.entity';

@Entity({ name: 'products' })
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: 'price_per_unit_yuan', type: 'decimal', precision: 10, scale: 2 })
  pricePerUnitYuan: number;

  @Column({ name: 'weight_per_unit', type: 'decimal', precision: 10, scale: 3 })
  weightPerUnit: number;

  // Relationships
  @OneToMany(() => Order, (order) => order.product)
  orders: Order[];
}