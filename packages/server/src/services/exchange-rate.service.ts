import { Injectable, NotFoundException } from '@nestjs/common';
import { ExchangeRateRepository } from '../repositories/exchange-rate.repository';
import { ExchangeRate } from '../entities/exchange-rate.entity';
import { CreateExchangeRateDto } from '../dto/exchange-rate/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from '../dto/exchange-rate/update-exchange-rate.dto';

@Injectable()
export class ExchangeRateService {
  constructor(
    private readonly exchangeRateRepository: ExchangeRateRepository,
  ) {}

  async create(createExchangeRateDto: CreateExchangeRateDto): Promise<ExchangeRate> {
    // 효력 날짜를 Date 객체로 변환
    const effectiveDate = new Date(createExchangeRateDto.effectiveDate);
    
    return await this.exchangeRateRepository.create({
      ...createExchangeRateDto,
      effectiveDate,
    });
  }

  async findAll(): Promise<ExchangeRate[]> {
    return await this.exchangeRateRepository.findAll();
  }

  async findByCurrency(currencyCode: string): Promise<ExchangeRate[]> {
    return await this.exchangeRateRepository.findByCurrency(currencyCode);
  }

  async findLatest(currencyCode: string): Promise<ExchangeRate> {
    const latestRate = await this.exchangeRateRepository.findLatestByCurrency(currencyCode);
    
    if (!latestRate) {
      throw new NotFoundException(`${currencyCode}의 환율 정보를 찾을 수 없습니다.`);
    }
    
    return latestRate;
  }

  async findOne(id: number): Promise<ExchangeRate> {
    const exchangeRate = await this.exchangeRateRepository.findOneById(id);
    
    if (!exchangeRate) {
      throw new NotFoundException(`환율 ID ${id}를 찾을 수 없습니다.`);
    }
    
    return exchangeRate;
  }

  async update(id: number, updateExchangeRateDto: UpdateExchangeRateDto): Promise<ExchangeRate> {
    await this.findOne(id); // 존재하는지 확인
    
    // 날짜 정보가 있으면 변환
    const { effectiveDate, ...rest } = updateExchangeRateDto;
    const updateData: Partial<ExchangeRate> = {
      ...rest,
      ...(effectiveDate ? { effectiveDate: new Date(effectiveDate) } : {}),
    };
    
    return await this.exchangeRateRepository.update(id, updateData);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // 존재하는지 확인
    await this.exchangeRateRepository.remove(id);
  }
}