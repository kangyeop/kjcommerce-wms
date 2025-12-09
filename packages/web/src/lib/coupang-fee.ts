export enum RocketGrowthSizeType {
  None = 0,
  ExtraSmall = 1, // 극소형
  Small = 2,      // 소형
  Medium = 3,     // 중형
  Large1 = 4,     // 대형 1
  Large2 = 5,     // 대형 2
  ExtraLarge = 6, // 특대형
}

export const getRocketGrowthSizeType = (
  widthCm: number,
  depthCm: number,
  heightCm: number,
  weightKg: number
): RocketGrowthSizeType => {
  const sumDim = widthCm + depthCm + heightCm;

  // 치수 기준 등급
  let dimLevel = RocketGrowthSizeType.ExtraLarge;
  if (sumDim <= 80) dimLevel = RocketGrowthSizeType.ExtraSmall;
  else if (sumDim <= 100) dimLevel = RocketGrowthSizeType.Small;
  else if (sumDim <= 120) dimLevel = RocketGrowthSizeType.Medium;
  else if (sumDim <= 140) dimLevel = RocketGrowthSizeType.Large1;
  else if (sumDim <= 160) dimLevel = RocketGrowthSizeType.Large2;

  // 무게 기준 등급
  let weightLevel = RocketGrowthSizeType.ExtraLarge;
  if (weightKg <= 2) weightLevel = RocketGrowthSizeType.ExtraSmall;
  else if (weightKg <= 5) weightLevel = RocketGrowthSizeType.Small;
  else if (weightKg <= 10) weightLevel = RocketGrowthSizeType.Medium;
  else if (weightKg <= 15) weightLevel = RocketGrowthSizeType.Large1;
  else if (weightKg <= 20) weightLevel = RocketGrowthSizeType.Large2;

  // 둘 중 큰 등급 선택
  return Math.max(dimLevel, weightLevel);
};

export const calculateCoupangFee = (
  widthCm: number,
  depthCm: number,
  heightCm: number,
  weightKg: number,
  sellingPrice: number = 0
): number => {
  const sizeType = getRocketGrowthSizeType(widthCm, depthCm, heightCm, weightKg);

  // 2025년 프로모션 요금표 (판매가 구간별 요금)
  // [가격 상한(미만), [XS, S, M, L1, L2, XL]]
  // 마지막 항목은 상한 없음 (Infinity)
  const feeTable: [number, number[]][] = [
    [5000,   [2050, 3250, 4050, 4350, 6325, 7825]],
    [10000,  [2150, 3275, 4050, 4500, 6600, 8100]],
    [15000,  [2800, 3275, 4050, 4500, 6600, 8100]],
    [20000,  [2925, 3325, 4050, 4500, 6600, 8100]],
    [30000,  [3075, 3325, 4050, 4500, 6600, 8100]],
    [40000,  [3600, 3625, 4425, 5300, 6600, 8100]],
    [50000,  [3850, 4150, 4825, 5600, 6600, 8100]],
    [60000,  [3850, 4150, 4825, 5975, 6975, 8475]],
    [80000,  [3850, 4150, 4825, 5975, 7050, 8550]],
    [100000, [3850, 4150, 4825, 6200, 7050, 8550]],
    [Infinity, [3850, 4150, 4825, 6200, 7050, 8550]],
  ];

  // 해당되는 가격 구간 찾기
  const row = feeTable.find(([limit]) => sellingPrice < limit);
  const fees = row ? row[1] : feeTable[feeTable.length - 1][1];

  // SizeType Enum 값(1~6)을 배열 인덱스(0~5)로 변환
  // RocketGrowthSizeType: None=0, XS=1, S=2, M=3, L1=4, L2=5, XL=6
  const sizeIndex = sizeType - 1;

  if (sizeIndex < 0 || sizeIndex >= fees.length) {
    // 사이즈가 없거나 범위를 벗어난 경우 (기본값: XL 요금)
    return Math.floor(fees[5] * 1.1);
  }

  return Math.floor(fees[sizeIndex] * 1.1);
};
