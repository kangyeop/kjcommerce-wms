import { FC } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { OrderGlobalInput } from '@/hooks/useOrderCalculations'

interface OrderSummaryProps {
  formData: OrderGlobalInput
  totals: {
    totalWeightKg: number
    calculatedInternationalShippingFee: number
    taxableAmountKrw: number
    dutyKrw: number
    vatKrw: number
    totalCostKrw: number
    itemsTotalKrw: number
  }
  onUpdate: (updates: Partial<OrderGlobalInput>) => void
}

export const OrderSummary: FC<OrderSummaryProps> = ({
  formData,
  totals,
  onUpdate
}) => {
  return (
    <>
      {/* 2차 결제 - 전체 합산 비용 */}
      <div className="p-4 rounded-md border bg-green-50/50">
        <div className="flex gap-2 items-center mb-4">
          <span className="px-3 py-1 text-sm font-bold text-green-700 bg-green-100 rounded border border-green-200">
            2차 결제
          </span>
          <span className="text-sm text-gray-600">국제 배송 및 통관 (전체 합산)</span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="internationalShipping">해외 배송비 (원) - 자동계산/수정가능</Label>
            <Input
              id="internationalShipping"
              type="number"
              value={formData.internationalShippingFeeKrw || ''}
              onChange={(e) => onUpdate({ internationalShippingFeeKrw: Number(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">
              전체 무게({totals.totalWeightKg.toFixed(2)}kg) 기준 자동 계산: {totals.calculatedInternationalShippingFee.toLocaleString()}원
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="miscellaneous">기타 비용 (원)</Label>
            <Input
              id="miscellaneous"
              type="number"
              value={formData.miscellaneousFeeKrw || ''}
              onChange={(e) => onUpdate({ miscellaneousFeeKrw: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>과세가격 (원) - 자동계산</Label>
            <div className="flex px-3 py-2 w-full h-10 text-sm rounded-md border border-input bg-muted">
              {totals.taxableAmountKrw.toLocaleString()}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customs">통관비 (원)</Label>
            <Input
              id="customs"
              type="number"
              value={formData.customsFeeKrw}
              onChange={(e) => onUpdate({ customsFeeKrw: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>관세 (원) - 자동계산</Label>
            <div className="flex px-3 py-2 w-full h-10 text-sm rounded-md border border-input bg-muted">
              {totals.dutyKrw.toLocaleString()}
            </div>
          </div>

          <div className="space-y-2">
            <Label>부가세 (원) - 자동계산</Label>
            <div className="flex px-3 py-2 w-full h-10 text-sm rounded-md border border-input bg-muted">
              {totals.vatKrw.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 총 원가 표시 */}
      <div className="p-4 bg-blue-50 rounded-md border-2 border-blue-600">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">전체 발주 총 원가</h3>
          <div className="text-3xl font-bold text-blue-600">
            {totals.totalCostKrw.toLocaleString()}원
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          = 모든 상품 원가 ({totals.itemsTotalKrw.toLocaleString()}원) 
          + 2차 결제 ({(formData.internationalShippingFeeKrw + formData.miscellaneousFeeKrw + formData.customsFeeKrw + totals.dutyKrw + totals.vatKrw).toLocaleString()}원)
        </div>
      </div>
    </>
  )
}
