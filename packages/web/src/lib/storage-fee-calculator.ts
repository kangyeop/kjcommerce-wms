export interface StorageFeeInput {
  maxDays: number;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  dailySales: number;
}

export interface StorageFeeOutput {
  totalFeePerUnit: number;
  daysToSellout: number;
}

const getRate = (day: number): number => {
  if (day <= 30) return 1000;
  if (day <= 45) return 2000;
  if (day <= 60) return 2000;
  if (day <= 120) return 2500;
  if (day <= 180) return 3500;
  return 5000;
};

export const calculateStorageFee = ({
  maxDays,
  widthCm,
  depthCm,
  heightCm,
  dailySales,
}: StorageFeeInput): StorageFeeOutput => {
  // Calculate CBM from dimensions: width × depth × height / 1,000,000
  const cbmPerUnit = (widthCm * depthCm * heightCm) / 1000000
  
  // 1개 판매될 때마다 재고가 줄어드는 속도
  // 예: 하루 10개 판매, 1개당 CBM 0.01
  // 1개 판매 시 발생하는 보관료 = (판매될 때까지 걸리는 일수) 동안의 보관료 합계 / 판매량?
  // 더 단순하게: 1개가 판매되기까지 평균적으로 며칠이 걸리는지 계산하고, 그 기간 동안의 CBM * Rate를 계산?
  
  // 시뮬레이션 방식:
  // 재고 100개 가정 (임의의 충분한 수량)
  const initialQty = 100;
  let totalCost = 0;
  let remainingQty = initialQty;
  let day = 1;
  
  // 재고가 다 팔릴 때까지 시뮬레이션
  while (remainingQty > 0 && day <= maxDays) {
    const currentCbm = remainingQty * cbmPerUnit;
    const rate = getRate(day);
    const dailyCost = currentCbm * rate;
    
    totalCost += dailyCost;
    
    remainingQty -= dailySales;
    day++;
  }
  
  const daysToSellout = day - 1;
  
  // 총 보관료를 초기 수량으로 나누어 개당 평균 보관료 계산
  const totalFeePerUnit = Math.ceil(totalCost / initialQty);

  return {
    totalFeePerUnit,
    daysToSellout,
  };
};
