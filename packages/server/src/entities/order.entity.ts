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

  @ApiProperty({ description: '발주일', example: '2024-01-15' })
  @Column({ name: 'order_date', type: 'date' })
  orderDate: Date;

  // Relationships
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true, eager: true })
  items: OrderItem[];
}
