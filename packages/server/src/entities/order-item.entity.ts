import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Order } from './order.entity';
import { Product } from './product.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'order_items' })
export class OrderItem extends BaseEntity {
  @ApiProperty({ description: '발주 ID' })
  @Column({ name: 'order_id' })
  orderId: number;

  @ApiProperty({ description: '제품 ID' })
  @Column({ name: 'product_id' })
  productId: number;

  @ApiProperty({ description: '수량' })
  @Column()
  quantity: number;

  @ApiProperty({ description: '단위당 원가 (위안)', example: 10.50 })
  @Column({ name: 'original_cost_yuan', type: 'float' })
  originalCostYuan: number;

  @ApiProperty({ description: '서비스 수수료 (위안)', example: 5.00 })
  @Column({ name: 'service_fee_yuan', type: 'float' })
  serviceFeeYuan: number;

  @ApiProperty({ description: '검수 수수료 (위안)', example: 2.00 })
  @Column({ name: 'inspection_fee_yuan', type: 'float' })
  inspectionFeeYuan: number;

  @ApiProperty({ description: '포장 수수료 (위안)', example: 1.50 })
  @Column({ name: 'packaging_fee_yuan', type: 'float' })
  packagingFeeYuan: number;

  @ApiProperty({ description: '중국내 배송비 (위안)', example: 10.0 })
  @Column({ name: 'domestic_shipping_fee_yuan', type: 'float', default: 0 })
  domesticShippingFeeYuan: number;

  @ApiProperty({ description: '보관료 (원화)', example: 10000 })
  @Column({ name: 'storage_fee_krw', type: 'float', default: 0 })
  storageFeeKrw: number;

  @ApiProperty({ description: '아이템 총 원가 (원화)', example: 50000 })
  @Column({ name: 'item_total_cost_krw', type: 'float' })
  itemTotalCostKrw: number;

  // Relationships
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orders)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
