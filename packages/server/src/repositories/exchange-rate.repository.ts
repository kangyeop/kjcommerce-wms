import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRate } from '../entities/exchange-rate.entity';

@Injectable()
export class ExchangeRateRepository {
  constructor(
    @InjectRepository(ExchangeRate)
    private readonly repository: Repository<ExchangeRate>,
  ) {}

  async create(exchangeRate: Partial<ExchangeRate>): Promise<ExchangeRate> {
    const newRate = this.repository.create(exchangeRate);
    return await this.repository.save(newRate);
  }

  async findAll(): Promise<ExchangeRate[]> {
    return await this.repository.find({
      order: {
        currencyCode: 'ASC',
        effectiveDate: 'DESC',
      },
    });
  }

  async findOneById(id: number): Promise<ExchangeRate | null> {
    return await this.repository.findOne({
      where: { id },
    });
  }

  async findByCurrency(currencyCode: string): Promise<ExchangeRate[]> {
    return await this.repository.find({
      where: { currencyCode },
      order: { effectiveDate: 'DESC' },
    });
  }

  async findLatestByCurrency(currencyCode: string): Promise<ExchangeRate | null> {
    return await this.repository.findOne({
      where: { currencyCode },
      order: { effectiveDate: 'DESC' },
    });
  }

  async update(id: number, exchangeRateData: Partial<ExchangeRate>): Promise<ExchangeRate> {
    await this.repository.update(id, exchangeRateData);
    const exchangeRate = await this.findOneById(id);
    if (!exchangeRate) {
      throw new Error(`ExchangeRate with ID ${id} not found`);
    }
    return exchangeRate;
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}