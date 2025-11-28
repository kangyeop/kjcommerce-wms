export interface StorageFeeInput {
  maxDays: number;
  initialQty: number;
  cbmPerUnit: number;
  dailySales: number;
}

export interface DailyBreakdown {
  day: number;
  remainingQty: number;
  currentCbm: number;
  rate: number;
  dailyCost: number;
}

export interface StorageFeeOutput {
  totalCost: number;
  daysToSellout: number;
  dailyBreakdown: DailyBreakdown[];
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
  initialQty,
  cbmPerUnit,
  dailySales,
}: StorageFeeInput): StorageFeeOutput => {
  let totalCost = 0;
  const dailyBreakdown: DailyBreakdown[] = [];
  let daysToSellout = 0;

  for (let day = 1; day <= maxDays; day++) {
    const remainingQty = initialQty - dailySales * (day - 1);

    if (remainingQty <= 0) {
      daysToSellout = day - 1;
      break;
    }

    const currentCbm = remainingQty * cbmPerUnit;
    const rate = getRate(day);
    const dailyCost = currentCbm * rate;

    totalCost += dailyCost;
    dailyBreakdown.push({
      day,
      remainingQty,
      currentCbm,
      rate,
      dailyCost,
    });

    // If we reach the last day and still have stock, set daysToSellout to maxDays
    if (day === maxDays) {
      daysToSellout = maxDays;
    }
  }

  return {
    totalCost,
    daysToSellout,
    dailyBreakdown,
  };
};
