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
      exchangeRate: createOrderDto.exchangeRate,
      internationalShippingFeeKrw: createOrderDto.internationalShippingFeeKrw || 0,
      miscellaneousFeeKrw: createOrderDto.miscellaneousFeeKrw || 0,
      customsFeeKrw: createOrderDto.customsFeeKrw,
      taxableAmountKrw: createOrderDto.taxableAmountKrw,
      dutyKrw: createOrderDto.dutyKrw,
      vatKrw: createOrderDto.vatKrw,
      totalCostKrw: createOrderDto.totalCostKrw,
      marginRate: createOrderDto.marginRate || 0,
      roas: createOrderDto.roas || 0,
      actualShippingFeeKrw: createOrderDto.actualShippingFeeKrw || 0,
      marketplaceCommissionRate: createOrderDto.marketplaceCommissionRate || 10,
      orderDate: createOrderDto.orderDate,
      sellingPriceKrw: createOrderDto.sellingPriceKrw,
      items: createOrderDto.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        originalCostYuan: item.originalCostYuan,
        serviceFeeYuan: item.serviceFeeYuan,
        inspectionFeeYuan: item.inspectionFeeYuan,
        packagingFeeYuan: item.packagingFeeYuan,
        domesticShippingFeeYuan: item.domesticShippingFeeYuan || 0,
        storageFeeKrw: item.storageFeeKrw || 0,
        itemTotalCostKrw: item.itemTotalCostKrw,
      })),
    });

    return this.orderRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['items', 'items.product'],
      order: { orderDate: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findByProduct(productId: number): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['items', 'items.product'],
      where: {
        items: {
          productId,
        },
      },
    });
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    // Update order-level fields
    Object.assign(order, {
      exchangeRate: updateOrderDto.exchangeRate ?? order.exchangeRate,
      internationalShippingFeeKrw: updateOrderDto.internationalShippingFeeKrw ?? order.internationalShippingFeeKrw,
      miscellaneousFeeKrw: updateOrderDto.miscellaneousFeeKrw ?? order.miscellaneousFeeKrw,
      customsFeeKrw: updateOrderDto.customsFeeKrw ?? order.customsFeeKrw,
      taxableAmountKrw: updateOrderDto.taxableAmountKrw ?? order.taxableAmountKrw,
      dutyKrw: updateOrderDto.dutyKrw ?? order.dutyKrw,
      vatKrw: updateOrderDto.vatKrw ?? order.vatKrw,
      totalCostKrw: updateOrderDto.totalCostKrw ?? order.totalCostKrw,
      marginRate: updateOrderDto.marginRate ?? order.marginRate,
      roas: updateOrderDto.roas ?? order.roas,
      actualShippingFeeKrw: updateOrderDto.actualShippingFeeKrw ?? order.actualShippingFeeKrw,
      marketplaceCommissionRate: updateOrderDto.marketplaceCommissionRate ?? order.marketplaceCommissionRate,
      orderDate: updateOrderDto.orderDate ?? order.orderDate,
      sellingPriceKrw: updateOrderDto.sellingPriceKrw ?? order.sellingPriceKrw,
    });

    // Update items if provided
    if (updateOrderDto.items) {
      order.items = updateOrderDto.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        originalCostYuan: item.originalCostYuan,
        serviceFeeYuan: item.serviceFeeYuan,
        inspectionFeeYuan: item.inspectionFeeYuan,
        packagingFeeYuan: item.packagingFeeYuan,
        domesticShippingFeeYuan: item.domesticShippingFeeYuan || 0,
        storageFeeKrw: item.storageFeeKrw || 0,
        itemTotalCostKrw: item.itemTotalCostKrw,
      })) as any;
    }

    return this.orderRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
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
