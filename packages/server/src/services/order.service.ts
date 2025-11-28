import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { CreateOrderDto } from '../dto/order/create-order.dto';
import { UpdateOrderDto } from '../dto/order/update-order.dto';
import { Order } from '../entities/order.entity';

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepository.create({
      ...createOrderDto,
      marginRate: createOrderDto.marginRate || 0,
    });

    // 판매가격 계산 (DTO에 있으면 사용, 없으면 계산 시도)
    if (createOrderDto.sellingPriceKrw) {
      order.sellingPriceKrw = createOrderDto.sellingPriceKrw;
    } else {
      // Product 정보가 없어서 정확한 계산이 어려울 수 있음. 
      // 필요하다면 여기서 Product를 조회해야 함.
      // 일단은 기존 방식(Markup)으로 임시 계산하거나 0으로 설정
      const margin = order.totalCostKrw * (order.marginRate / 100);
      order.sellingPriceKrw = Math.round(order.totalCostKrw + margin);
    }

    return this.orderRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['product'],
      order: { orderDate: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOneWithProduct(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findByProduct(productId: number): Promise<Order[]> {
    return this.orderRepository.findByProduct(productId);
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    Object.assign(order, updateOrderDto);

    // 판매가격이 DTO에 있으면 사용
    if (updateOrderDto.sellingPriceKrw !== undefined) {
      order.sellingPriceKrw = updateOrderDto.sellingPriceKrw;
    } 
    // 아니면 재계산 (Product 정보가 필요하므로 findOne에서 로딩된 product 사용)
    else if (order.product) {
      order.sellingPriceKrw = this.calculateSellingPrice(order);
    }

    return this.orderRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }

  /**
   * 판매가격 계산 (Gross Margin)
   * 판매가 = (원가 + 배송비) / (1 - 마진율 - 수수료율 - 1/ROAS)
   */
  calculateSellingPrice(order: Order): number {
    if (!order.product) return order.sellingPriceKrw || 0;

    const unitsPerPackage = order.product.unitsPerPackage || 1;
    const packageCount = order.quantity / unitsPerPackage;
    const costPerPackage = packageCount > 0 ? order.totalCostKrw / packageCount : 0;
    
    const marginDecimal = (order.marginRate || 0) / 100;
    const roasMultiplier = (order.roas || 0) > 0 ? (1 / (order.roas || 1)) : 0;
    const commissionDecimal = (order.marketplaceCommissionRate || 0) / 100;

    const numerator = costPerPackage + (order.actualShippingFeeKrw || 0);
    const denominator = 1 - marginDecimal - commissionDecimal - roasMultiplier;

    if (denominator <= 0) return 0;

    return Math.round(numerator / denominator);
  }

  /**
   * 특정 발주의 판매가격 정보 조회
   * @param id 발주 ID
   * @returns 판매가격 정보
   */
  async getSellingPriceInfo(id: number): Promise<{
    orderId: number;
    totalCostKrw: number;
    marginRate: number;
    sellingPriceKrw: number;
    profitKrw: number;
  }> {
    const order = await this.findOne(id);
    const profitKrw = order.sellingPriceKrw - order.totalCostKrw;

    return {
      orderId: order.id,
      totalCostKrw: order.totalCostKrw,
      marginRate: order.marginRate,
      sellingPriceKrw: order.sellingPriceKrw,
      profitKrw,
    };
  }
}
