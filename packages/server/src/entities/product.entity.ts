import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Order } from './order.entity';

@Entity({ name: 'products' })
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: 'price_per_unit_yuan', type: 'float' })
  pricePerUnitYuan: number;

  @Column({ name: 'weight_per_unit', type: 'float' })
  weightPerUnit: number;

  @Column({ name: 'product_url', type: 'text', nullable: true })
  productUrl: string;

  @Column({ type: 'text', nullable: true })
  options: string;

  @Column({ name: 'units_per_package', type: 'int', default: 1 })
  unitsPerPackage: number;

  // Relationships
  @OneToMany(() => Order, (order) => order.product)
  orders: Order[];
}