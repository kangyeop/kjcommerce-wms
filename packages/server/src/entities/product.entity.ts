import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { OrderItem } from './order-item.entity';

@Entity({ name: 'products' })
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: 'price_per_unit_yuan', type: 'float' })
  pricePerUnitYuan: number;

  @Column({ name: 'weight_per_unit', type: 'float' })
  weightPerUnit: number;

  @Column({ name: 'width_cm', type: 'float', default: 0 })
  widthCm: number;

  @Column({ name: 'depth_cm', type: 'float', default: 0 })
  depthCm: number;

  @Column({ name: 'height_cm', type: 'float', default: 0 })
  heightCm: number;

  @Column({ name: 'product_url', type: 'text', nullable: true })
  productUrl: string;

  @Column({ type: 'text', nullable: true })
  options: string;

  @Column({ name: 'units_per_package', type: 'int', default: 1 })
  unitsPerPackage: number;

  @Column({ name: 'coupang_shipping_fee', type: 'int', default: 0 })
  coupangShippingFee: number;

  @Column({ name: 'selling_price_krw', type: 'float', nullable: true })
  sellingPriceKrw: number;

  // Relationships
  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orders: OrderItem[];
}