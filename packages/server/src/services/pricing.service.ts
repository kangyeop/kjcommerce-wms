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
    const { orderId, orderItemId } = createPricingDto;

    // Check if order item exists
    const orderItem = await this.orderItemRepository.findOne({
      where: { id: orderItemId, orderId: orderId },
    });

    if (!orderItem) {
      throw new NotFoundException(`Order item not found for order ${orderId} and item ${orderItemId}`);
    }

    // Check if pricing already exists for this order item
    let pricing = await this.pricingRepository.findOne({
      where: { orderId, orderItemId },
    });

    if (pricing) {
      // Update existing pricing
      Object.assign(pricing, createPricingDto);
    } else {
      // Create new pricing
      pricing = this.pricingRepository.create(createPricingDto);
    }

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
}
