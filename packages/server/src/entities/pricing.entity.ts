import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from './product.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'pricings' })
export class Pricing extends BaseEntity {
  @ApiProperty({ description: '발주 ID', required: false })
  @Column({ name: 'order_id', nullable: true })
  orderId?: number;

  @ApiProperty({ description: '발주 아이템 ID', required: false })
  @Column({ name: 'order_item_id', nullable: true })
  orderItemId?: number;

  @ApiProperty({ description: '제품 ID', required: false })
  @Column({ name: 'product_id', nullable: true })
  productId?: number;

  @ApiProperty({ description: '보관료 (원화)', example: 10000 })
  @Column({ name: 'storage_fee_krw', type: 'float', default: 0 })
  storageFeeKrw: number;

  @ApiProperty({ description: '마진율 (%)', example: 30 })
  @Column({ name: 'margin_rate', type: 'float', default: 30 })
  marginRate: number;

  @ApiProperty({ description: 'ROAS (배수)', example: 2 })
  @Column({ type: 'float', default: 2 })
  roas: number;

  @ApiProperty({ description: '실제 배송비 (원화)', example: 3000 })
  @Column({ name: 'actual_shipping_fee_krw', type: 'float', default: 0 })
  actualShippingFeeKrw: number;

  @ApiProperty({ description: '온라인 판매점 수수료율 (%)', example: 10 })
  @Column({ name: 'marketplace_commission_rate', type: 'float', default: 10 })
  marketplaceCommissionRate: number;

  @ApiProperty({ description: '판매가격 (원화)', example: 15000 })
  @Column({ name: 'selling_price_krw', type: 'float' })
  sellingPriceKrw: number;

  @ApiProperty({ description: '광고비 (원화)', example: 7500 })
  @Column({ name: 'ad_cost_krw', type: 'float', default: 0 })
  adCostKrw: number;

  @ApiProperty({ description: '순이익 (원화)', example: 3000 })
  @Column({ name: 'profit_krw', type: 'float', default: 0 })
  profitKrw: number;

  // Relationships
  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => OrderItem)
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
