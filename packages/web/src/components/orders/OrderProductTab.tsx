import { FC } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Product } from '@/types'
import { OrderItemInput } from '@/hooks/useOrderCalculations'

interface EnrichedOrderItem extends OrderItemInput {
  originalCostYuan: number
  serviceFeeYuan: number
  packagingFeeYuan: number
  itemTotalCostKrw: number
  unitCostKrw: number
}

interface OrderProductTabProps {
  item: EnrichedOrderItem
  products: Product[]
  index: number
  onUpdate: (updates: Partial<OrderItemInput>) => void
}

export const OrderProductTab: FC<OrderProductTabProps> = ({
  item,
  products,
  index,
  onUpdate
}) => {
  return (
    <div className="p-4 space-y-4 bg-white rounded-b-md rounded-tr-md border-2 border-blue-500">
      <div className="flex gap-2 items-center mb-4">
        <span className="px-3 py-1 text-sm font-bold text-blue-700 bg-blue-100 rounded border border-blue-200">
          1차 결제
        </span>
        <span className="text-sm text-gray-600">상품 매입 및 중국 내 이동 (상품별)</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`product-${index}`}>제품</Label>
          <select
            id={`product-${index}`}
            className="px-3 w-full h-10 rounded-md border border-input"
            value={item.productId}
            onChange={(e) => onUpdate({ productId: Number(e.target.value) })}
            required
          >
            <option value={0}>제품 선택</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} - {product.pricePerUnitYuan.toLocaleString()}위안
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`quantity-${index}`}>수량</Label>
          <Input
            id={`quantity-${index}`}
            type="number"
            min="1"
            value={item.quantity || ''}
            onChange={(e) => onUpdate({ quantity: Number(e.target.value) })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>원가 (위안) - 자동계산</Label>
          <div className="flex px-3 py-2 w-full h-10 text-sm rounded-md border border-input bg-muted">
            {item.originalCostYuan.toLocaleString()}
          </div>
        </div>

        <div className="space-y-2">
          <Label>구매대행 수수료 (위안) - 자동계산</Label>
          <div className="flex px-3 py-2 w-full h-10 text-sm rounded-md border border-input bg-muted">
            {item.serviceFeeYuan.toLocaleString()}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`inspection-${index}`}>검품비 (위안)</Label>
          <Input
            id={`inspection-${index}`}
            type="number"
            step="0.01"
            value={item.inspectionFeeYuan}
            onChange={(e) => onUpdate({ inspectionFeeYuan: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label>포장비 (위안) - 자동계산</Label>
          <div className="flex px-3 py-2 w-full h-10 text-sm rounded-md border border-input bg-muted">
            {item.packagingFeeYuan.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`domestic-shipping-${index}`}>중국내 배송비 (위안)</Label>
          <Input
            id={`domestic-shipping-${index}`}
            type="number"
            step="0.01"
            value={item.domesticShippingFeeYuan || ''}
            onChange={(e) => onUpdate({ domesticShippingFeeYuan: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="p-3 mt-4 bg-blue-50 rounded border">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold">이 상품의 총 원가:</span>
            <span className="text-xl font-bold text-blue-600">
              {item.itemTotalCostKrw.toLocaleString()}원
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">개당 원가:</span>
            <span className="text-xl font-bold text-green-600">
              {item.unitCostKrw.toLocaleString()}원
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
