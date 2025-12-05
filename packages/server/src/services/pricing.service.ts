import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pricing } from '../entities/pricing.entity';
import { CreatePricingDto } from '../dto/pricing/create-pricing.dto';
import { OrderItem } from '../entities/order-item.entity';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(Pricing)
    private readonly pricingRepository: Repository<Pricing>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async create(createPricingDto: CreatePricingDto): Promise<Pricing> {
    const { orderId, orderItemId, productId } = createPricingDto;

    // Validate that at least one reference is provided
    if (!orderId && !orderItemId && !productId) {
      throw new NotFoundException('At least one of orderId, orderItemId, or productId must be provided');
    }

    // If orderItemId is provided, verify it exists
    if (orderItemId) {
      const orderItem = await this.orderItemRepository.findOne({
        where: { id: orderItemId },
      });

      if (!orderItem) {
        throw new NotFoundException(`Order item with ID ${orderItemId} not found`);
      }
    }

    // Create new pricing
    const pricing = this.pricingRepository.create(createPricingDto);
    return this.pricingRepository.save(pricing);
  }

  async findByOrder(orderId: number): Promise<Pricing[]> {
    return this.pricingRepository.find({
      where: { orderId },
      relations: ['orderItem', 'orderItem.product'],
    });
  }

  async findOne(id: number): Promise<Pricing> {
    const pricing = await this.pricingRepository.findOne({
      where: { id },
      relations: ['order', 'orderItem', 'orderItem.product'],
    });

    if (!pricing) {
      throw new NotFoundException(`Pricing with ID ${id} not found`);
    }

    return pricing;
  }

  async remove(id: number): Promise<void> {
    const pricing = await this.findOne(id);
    await this.pricingRepository.remove(pricing);
  }

  async findAll(): Promise<Pricing[]> {
    return this.pricingRepository.find({
      relations: ['product', 'order', 'orderItem'],
    });
  }

  async findByProduct(productId: number): Promise<Pricing[]> {
    return this.pricingRepository.find({
      where: { productId },
      relations: ['product'],
    });
  }

  async update(id: number, updatePricingDto: Partial<CreatePricingDto>): Promise<Pricing> {
    const pricing = await this.findOne(id);
    Object.assign(pricing, updatePricingDto);
    return this.pricingRepository.save(pricing);
  }

  // Helper method to calculate pricing values
  calculatePricing(params: {
    unitCost: number;
    marginRate: number;
    roas: number;
    actualShippingFeeKrw: number;
    marketplaceCommissionRate: number;
  }): { sellingPriceKrw: number; adCostKrw: number; profitKrw: number } {
    const { unitCost, marginRate, roas, actualShippingFeeKrw, marketplaceCommissionRate } = params;

    const roasVal = roas || 0;
    const adCostRate = roasVal > 0 ? 100 / roasVal : 0;

    const denominator = 1 - marginRate / 100 - marketplaceCommissionRate / 100 - adCostRate;

    let sellingPriceKrw = 0;
    if (denominator > 0) {
      sellingPriceKrw = (unitCost + actualShippingFeeKrw) / denominator;
    }

    const adCostKrw = sellingPriceKrw * adCostRate;
    const commission = sellingPriceKrw * (marketplaceCommissionRate / 100);
    const profitKrw = sellingPriceKrw - unitCost - actualShippingFeeKrw - commission - adCostKrw;

    return {
      sellingPriceKrw: Math.round(sellingPriceKrw),
      adCostKrw: Math.round(adCostKrw),
      profitKrw: Math.round(profitKrw),
    };
  }
}
