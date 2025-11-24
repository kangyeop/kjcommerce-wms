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

    // 판매가격 계산
    order.sellingPriceKrw = this.calculateSellingPrice(
      order.totalCostKrw,
      order.marginRate,
    );

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

    // 마진율이나 총 원가가 변경되면 판매가격 재계산
    if (updateOrderDto.marginRate !== undefined || updateOrderDto.totalCostKrw !== undefined) {
      order.sellingPriceKrw = this.calculateSellingPrice(
        order.totalCostKrw,
        order.marginRate,
      );
    }

    return this.orderRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }

  /**
   * 판매가격 계산
   * @param totalCostKrw 총 원가 (원화)
   * @param marginRate 마진율 (%)
   * @returns 판매가격 (원화)
   */
  calculateSellingPrice(totalCostKrw: number, marginRate: number): number {
    const margin = totalCostKrw * (marginRate / 100);
    return Math.round(totalCostKrw + margin);
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
