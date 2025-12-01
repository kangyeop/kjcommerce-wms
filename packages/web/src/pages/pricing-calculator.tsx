import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { orderService, pricingService } from '@/services'
import { Order, Pricing, CreatePricingDto } from '@/types'
import { calculateStorageFee } from '@/lib/storage-fee-calculator'

const PricingCalculatorPage = () => {
  const queryClient = useQueryClient()
  
  // 선택된 발주 ID
  const [selectedOrderId, setSelectedOrderId] = useState<string>('')
  
  // 선택된 발주 아이템 ID
  const [selectedOrderItemId, setSelectedOrderItemId] = useState<string>('')

  // 발주 목록 조회
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: orderService.getAll
  })

  // 선택된 발주 상세 조회
  const { data: selectedOrder } = useQuery({
    queryKey: ['order', selectedOrderId],
    queryFn: () => orderService.getById(Number(selectedOrderId)),
    enabled: !!selectedOrderId
  })

  // 해당 발주의 기존 가격 정보 조회
  const { data: existingPricings = [] } = useQuery<Pricing[]>({
    queryKey: ['pricings', selectedOrderId],
    queryFn: () => pricingService.findByOrder(Number(selectedOrderId)),
    enabled: !!selectedOrderId
  })

  // 입력 폼 상태
  const [formData, setFormData] = useState({
    marginRate: 30,
    roas: 2,
    actualShippingFeeKrw: 3000,
    marketplaceCommissionRate: 10,
    adCostKrw: 0,
    storageFeeInputs: {
      maxDays: 365,
      dailySales: 10
    }
  })

  // 계산 결과 상태
  const [calculationResult, setCalculationResult] = useState<{
    sellingPrice: number;
    profit: number;
    storageFee: number;
    adCost: number;
  } | null>(null)

  // 선택된 아이템
  const selectedItem = selectedOrder?.items.find(item => item.id === Number(selectedOrderItemId))

  // 기존 가격 정보가 있으면 폼에 로드
  useEffect(() => {
    if (selectedOrderItemId && existingPricings.length > 0) {
      const pricing = existingPricings.find(p => p.orderItemId === Number(selectedOrderItemId))
      if (pricing) {
        setFormData(prev => ({
          ...prev,
          marginRate: pricing.marginRate,
          roas: pricing.roas,
          actualShippingFeeKrw: pricing.actualShippingFeeKrw,
          marketplaceCommissionRate: pricing.marketplaceCommissionRate,
          adCostKrw: pricing.adCostKrw,
        }))
        // 결과 미리 계산
        setCalculationResult({
          sellingPrice: pricing.sellingPriceKrw,
          profit: pricing.profitKrw,
          storageFee: pricing.storageFeeKrw,
          adCost: pricing.adCostKrw
        })
      }
    }
  }, [selectedOrderItemId, existingPricings])

  // 가격 계산 로직
  const calculatePrice = () => {
    if (!selectedItem) return

    // 쿠팡 배송비 (상품에 설정된 값 사용)
    const coupangShippingFee = selectedItem.product?.coupangShippingFee || 0

    // 1. 판매가 계산 (원가 + 배송비를 기준으로 마진과 수수료를 고려)
    // 판매가 = (원가 + 배송비) / (1 - 마진율 - 수수료율)
    const costBase = selectedItem.unitCostKrw + coupangShippingFee
    const marginRateDecimal = formData.marginRate / 100
    const commissionRateDecimal = formData.marketplaceCommissionRate / 100

    const denominator = 1 - marginRateDecimal - commissionRateDecimal
    
    if (denominator <= 0) {
      alert('마진율과 수수료율의 합이 100% 이상이어서 계산할 수 없습니다.')
      return
    }

    const sellingPrice = Math.ceil(costBase / denominator / 100) * 100 // 100원 단위 반올림

    // 2. 마진 계산
    const commission = Math.round(sellingPrice * commissionRateDecimal)
    const totalMargin = sellingPrice - selectedItem.unitCostKrw - coupangShippingFee - commission

    // 3. 보관료 계산
    const cbm = selectedItem.product?.cbmPerUnit || 0
    const storageFee = calculateStorageFee({
      cbmPerUnit: cbm,
      maxDays: formData.storageFeeInputs.maxDays,
      dailySales: formData.storageFeeInputs.dailySales
    })

    // 4. 광고비 계산 (ROAS 기준)
    const adCost = Math.round(sellingPrice / formData.roas)

    // 5. 순이익 = 마진 - 보관료 - 광고비
    const profit = totalMargin - storageFee.totalFeePerUnit - adCost

    setCalculationResult({
      sellingPrice,
      profit,
      storageFee: storageFee.totalFeePerUnit,
      adCost
    })
  }

  // 가격 정보 저장 mutation
  const savePricingMutation = useMutation({
    mutationFn: (data: CreatePricingDto) => pricingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricings', selectedOrderId] })
      alert('가격 정보가 저장되었습니다.')
    },
    onError: () => {
      alert('저장 중 오류가 발생했습니다.')
    }
  })

  const handleSave = () => {
    if (!selectedOrderId || !selectedOrderItemId || !calculationResult) return

    savePricingMutation.mutate({
      orderId: Number(selectedOrderId),
      orderItemId: Number(selectedOrderItemId),
      storageFeeKrw: calculationResult.storageFee,
      marginRate: formData.marginRate,
      roas: formData.roas,
      actualShippingFeeKrw: formData.actualShippingFeeKrw,
      marketplaceCommissionRate: formData.marketplaceCommissionRate,
      sellingPriceKrw: calculationResult.sellingPrice,
      adCostKrw: calculationResult.adCost,
      profitKrw: calculationResult.profit
    })
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">판매가격 계산기</h1>

      <Card>
        <CardHeader>
          <CardTitle>발주 및 상품 선택</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>발주 선택</Label>
              <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                <SelectTrigger>
                  <SelectValue placeholder="발주를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map(order => (
                    <SelectItem key={order.id} value={order.id.toString()}>
                      #{order.id} - {order.orderDate} (총 {order.totalCostKrw.toLocaleString()}원)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>상품 선택</Label>
              <Select 
                value={selectedOrderItemId} 
                onValueChange={setSelectedOrderItemId}
                disabled={!selectedOrderId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="상품을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {selectedOrder?.items.map(item => (
                    <SelectItem key={item.id} value={item.id!.toString()}>
                      {item.product?.name} (개당 원가: {item.unitCostKrw.toLocaleString()}원)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedItem && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>가격 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>목표 마진율 (%)</Label>
                <Input 
                  type="number" 
                  value={formData.marginRate}
                  onChange={e => setFormData(prev => ({ ...prev, marginRate: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>목표 ROAS (배수)</Label>
                <Input 
                  type="number" 
                  value={formData.roas}
                  onChange={e => setFormData(prev => ({ ...prev, roas: Number(e.target.value) }))}
                />
                <p className="text-xs text-muted-foreground">
                  광고비 = 판매가 / ROAS
                </p>
              </div>
              <div className="space-y-2">
                <Label>마켓 수수료율 (%)</Label>
                <Input 
                  type="number" 
                  value={formData.marketplaceCommissionRate}
                  onChange={e => setFormData(prev => ({ ...prev, marketplaceCommissionRate: Number(e.target.value) }))}
                />
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">보관료 설정</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>최대 보관일</Label>
                    <Input 
                      type="number" 
                      value={formData.storageFeeInputs.maxDays}
                      onChange={e => setFormData(prev => ({ 
                        ...prev, 
                        storageFeeInputs: { ...prev.storageFeeInputs, maxDays: Number(e.target.value) } 
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>일일 판매량</Label>
                    <Input 
                      type="number" 
                      value={formData.storageFeeInputs.dailySales}
                      onChange={e => setFormData(prev => ({ 
                        ...prev, 
                        storageFeeInputs: { ...prev.storageFeeInputs, dailySales: Number(e.target.value) } 
                      }))}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  CBM: {selectedItem.product?.cbmPerUnit.toFixed(4) || 0} / 쿠팡 배송비: {selectedItem.product?.coupangShippingFee.toLocaleString() || 0}원
                </p>
              </div>

              <Button className="w-full mt-4" onClick={calculatePrice}>
                계산하기
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>계산 결과</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {calculationResult ? (
                <>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                      <span className="font-semibold">개당 원가</span>
                      <span>{selectedItem.unitCostKrw.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                      <span className="font-semibold">쿠팡 배송비</span>
                      <span>{(selectedItem.product?.coupangShippingFee || 0).toLocaleString()}원</span>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-bold">권장 판매가</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {calculationResult.sellingPrice.toLocaleString()}원
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded space-y-2">
                      <h4 className="font-semibold text-blue-900">마진 분석</h4>
                      <div className="flex justify-between items-center text-sm">
                        <span>총 마진</span>
                        <span className="font-semibold">
                          {(calculationResult.sellingPrice - selectedItem.unitCostKrw - (selectedItem.product?.coupangShippingFee || 0) - Math.round(calculationResult.sellingPrice * formData.marketplaceCommissionRate / 100)).toLocaleString()}원
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-red-600">
                        <span>- 예상 보관료</span>
                        <span>{calculationResult.storageFee.toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-red-600">
                        <span>- 예상 광고비 (ROAS {formData.roas})</span>
                        <span>{calculationResult.adCost.toLocaleString()}원</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between items-center">
                        <span className="font-semibold text-green-600">= 순이익</span>
                        <span className="text-xl font-bold text-green-600">
                          {calculationResult.profit.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    variant="default"
                    onClick={handleSave}
                    disabled={savePricingMutation.isPending}
                  >
                    {savePricingMutation.isPending ? '저장 중...' : '가격 정보 저장'}
                  </Button>
                </>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  설정을 입력하고 계산하기 버튼을 눌러주세요.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default PricingCalculatorPage
