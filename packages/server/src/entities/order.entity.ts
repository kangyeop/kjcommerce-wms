import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { OrderItem } from './order-item.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'orders' })
export class Order extends BaseEntity {
  @ApiProperty({ description: '환율', example: 180.50 })
  @Column({ name: 'exchange_rate', type: 'float' })
  exchangeRate: number;

  @ApiProperty({ description: '해외 배송비 (원화)', example: 6000 })
  @Column({ name: 'international_shipping_fee_krw', type: 'float', default: 0 })
  internationalShippingFeeKrw: number;

  @ApiProperty({ description: '기타 비용 (원화)', example: 5000 })
  @Column({ name: 'miscellaneous_fee_krw', type: 'float', default: 0 })
  miscellaneousFeeKrw: number;

  @ApiProperty({ description: '통관 수수료 (원화)', example: 10000 })
  @Column({ name: 'customs_fee_krw', type: 'float' })
  customsFeeKrw: number;

  @ApiProperty({ description: '과세 대상 금액 (원화)', example: 100000 })
  @Column({ name: 'taxable_amount_krw', type: 'float' })
  taxableAmountKrw: number;

  @ApiProperty({ description: '관세 (원화)', example: 8000 })
  @Column({ name: 'duty_krw', type: 'float' })
  dutyKrw: number;

  @ApiProperty({ description: '부가세 (원화)', example: 10000 })
  @Column({ name: 'vat_krw', type: 'float' })
  vatKrw: number;

  @ApiProperty({ description: '총 원가 (원화)', example: 200000 })
  @Column({ name: 'total_cost_krw', type: 'float' })
  totalCostKrw: number;

  @ApiProperty({ description: '마진율 (%)', example: 30 })
  @Column({ name: 'margin_rate', type: 'float', default: 0 })
  marginRate: number;

  @ApiProperty({ description: 'ROAS (광고비 비율 %)', example: 20 })
  @Column({ type: 'float', default: 0 })
  roas: number;

  @ApiProperty({ description: '실제 배송비 (원화)', example: 3000 })
  @Column({ name: 'actual_shipping_fee_krw', type: 'float', default: 0 })
  actualShippingFeeKrw: number;

  @ApiProperty({ description: '온라인 판매점 수수료율 (%)', example: 10 })
  @Column({ name: 'marketplace_commission_rate', type: 'float', default: 10 })
  marketplaceCommissionRate: number;

  @ApiProperty({ description: '판매가격 (원화)', example: 260000 })
  @Column({ name: 'selling_price_krw', type: 'float', nullable: true })
  sellingPriceKrw: number;

  @ApiProperty({ description: '발주일', example: '2024-01-15' })
  @Column({ name: 'order_date', type: 'date' })
  orderDate: Date;

  // Relationships
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true, eager: true })
  items: OrderItem[];
}
