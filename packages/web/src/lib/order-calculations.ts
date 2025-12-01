// 구매대행 수수료 계산
export const calculateServiceFee = (originalCostYuan: number): number => {
  if (originalCostYuan < 500) {
    return 30
  } else if (originalCostYuan < 1000) {
    return 50
  } else {
    return originalCostYuan * 0.05
  }
}

// 포장비 계산
export const calculatePackagingFee = (quantity: number, unitsPerPackage: number): number => {
  return (quantity / unitsPerPackage) * 0.3
}

// 검품비 계산
export const calculateInspectionFee = (originalCostYuan: number): number => {
  return originalCostYuan * 0.02
}

// 해외 배송비 계산 (무게 기반)
export const calculateInternationalShipping = (totalWeightKg: number): number => {
  if (totalWeightKg <= 1) {
    return 6000
  } else {
    return 6000 + Math.ceil((totalWeightKg - 1) * 1600)
  }
}

// 과세가격 계산
export const calculateTaxableAmount = (totalProductPriceKrw: number): number => {
  return Math.round(totalProductPriceKrw)
}

// 관세 계산
export const calculateDuty = (taxableAmountKrw: number): number => {
  return Math.round(taxableAmountKrw * 0.08)
}

// 부가세 계산
export const calculateVAT = (taxableAmountKrw: number, dutyKrw: number): number => {
  return Math.round((taxableAmountKrw + dutyKrw) * 0.10)
}

// 아이템 총 원가 계산 (원화)
export const calculateItemTotalCostKrw = (
  originalCostYuan: number,
  serviceFeeYuan: number,
  inspectionFeeYuan: number,
  packagingFeeYuan: number,
  domesticShippingFeeYuan: number,
  exchangeRate: number
): number => {
  const originalCostKrw = originalCostYuan * exchangeRate
  const serviceFeeKrw = serviceFeeYuan * exchangeRate
  const inspectionFeeKrw = inspectionFeeYuan * exchangeRate
  const packagingFeeKrw = packagingFeeYuan * exchangeRate
  const domesticShippingKrw = domesticShippingFeeYuan * exchangeRate
  
  return Math.round(
    originalCostKrw + serviceFeeKrw + inspectionFeeKrw + 
    packagingFeeKrw + domesticShippingKrw
  )
}

// 개당 원가 계산
export const calculateUnitCost = (itemTotalCostKrw: number, quantity: number): number => {
  return quantity > 0 ? Math.round(itemTotalCostKrw / quantity) : 0
}
