import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'exchange_rates' })
@Index(['currencyCode', 'effectiveDate'], { unique: true })
export class ExchangeRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'currency_code', length: 10 })
  currencyCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  rate: number;

  @Column({ name: 'effective_date', type: 'date' })
  effectiveDate: Date;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}