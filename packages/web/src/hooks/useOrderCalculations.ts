import { useMemo } from 'react';
import { Product } from '@/types';
import {
  calculateServiceFee,
  calculatePackagingFee,
  calculateInternationalShipping,
  calculateTaxableAmount,
  calculateDuty,
  calculateVAT,
  calculateItemTotalCostKrw,
  calculateUnitCost,
} from '@/lib/order-calculations';

export interface OrderItemInput {
  productId: number;
  quantity: number;
  inspectionFeeYuan: number;
  domesticShippingFeeYuan: number;
}

export interface OrderGlobalInput {
  exchangeRate: number;
  internationalShippingFeeKrw: number;
  miscellaneousFeeKrw: number;
  customsFeeKrw: number;
}

export const useOrderCalculations = (
  items: OrderItemInput[],
  products: Product[],
  globalParams: OrderGlobalInput
) => {
  const enrichedItems = useMemo(() => {
    return items.map((item) => {
      const product = products.find((p) => p.id === item.productId);

      // Default values if product not selected
      let originalCostYuan = 0;
      let serviceFeeYuan = 0;
      let packagingFeeYuan = 0;

      if (product && item.quantity > 0) {
        originalCostYuan = product.pricePerUnitYuan * item.quantity;
        serviceFeeYuan = calculateServiceFee(originalCostYuan);
        // Note: inspectionFee is manual input
        packagingFeeYuan = calculatePackagingFee(item.quantity, product.unitsPerPackage || 1);
      }

      const itemTotalCostKrw = calculateItemTotalCostKrw(
        originalCostYuan,
        serviceFeeYuan,
        item.inspectionFeeYuan,
        packagingFeeYuan,
        item.domesticShippingFeeYuan,
        globalParams.exchangeRate
      );

      const unitCostKrw = calculateUnitCost(itemTotalCostKrw, item.quantity);

      return {
        ...item,
        originalCostYuan,
        serviceFeeYuan,
        packagingFeeYuan,
        itemTotalCostKrw,
        unitCostKrw,
        // Helper for weight calc
        weightPerUnit: product?.weightPerUnit || 0,
      };
    });
  }, [items, products, globalParams.exchangeRate]);

  const totals = useMemo(() => {
    // 1. Total Weight
    const totalWeightG = enrichedItems.reduce((sum, item) => {
      return sum + item.weightPerUnit * item.quantity;
    }, 0);
    const totalWeightKg = totalWeightG / 1000;

    // 2. Calculated International Shipping (Reference only, actual used is in globalParams)
    const calculatedInternationalShippingFee = calculateInternationalShipping(totalWeightKg);

    // 3. Tax Calculations
    const totalProductPriceYuan = enrichedItems.reduce(
      (sum, item) => sum + item.originalCostYuan,
      0
    );
    const productPriceKrw = totalProductPriceYuan * globalParams.exchangeRate;

    // Note: The original code calculated taxable amount based on product price KRW
    // But usually taxable amount includes shipping?
    // Checking original code:
    // const taxableAmount = calculateTaxableAmount(productPriceKrw)
    // It seems it just takes product price. Let's stick to original logic.
    const taxableAmountKrw = calculateTaxableAmount(productPriceKrw);
    const dutyKrw = calculateDuty(taxableAmountKrw);
    const vatKrw = calculateVAT(taxableAmountKrw, dutyKrw);

    // 4. Total Cost
    const itemsTotalKrw = enrichedItems.reduce((sum, item) => sum + item.itemTotalCostKrw, 0);
    const totalCostKrw =
      itemsTotalKrw +
      globalParams.internationalShippingFeeKrw +
      globalParams.miscellaneousFeeKrw +
      globalParams.customsFeeKrw +
      dutyKrw +
      vatKrw;

    return {
      totalWeightKg,
      calculatedInternationalShippingFee,
      taxableAmountKrw,
      dutyKrw,
      vatKrw,
      totalCostKrw,
      itemsTotalKrw,
    };
  }, [enrichedItems, globalParams]);

  return {
    enrichedItems,
    totals,
  };
};
