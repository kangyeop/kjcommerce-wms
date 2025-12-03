import { useState, useEffect, FC } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { orderService, pricingService, productService } from '@/services'
import { Order, Pricing, CreatePricingDto } from '@/types'
import { calculateStorageFee } from '@/lib/storage-fee-calculator'
import { 
  Calculator, 
  TrendingUp, 
  Package, 
  DollarSign, 
  Save, 
  RefreshCw,
  ArrowRight,
  Box,
  Truck,
  Percent
} from 'lucide-react'

export const PricingCalculatorPage: FC = () => {
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
    sellingPrice: 0, // 판매가 수동 입력을 위한 상태 추가
    roas: 2,
    marketplaceCommissionRate: 10,
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
    grossMargin: number; // 광고/보관료 차감 전 마진
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
          sellingPrice: pricing.sellingPriceKrw,
          roas: pricing.roas,
          marketplaceCommissionRate: pricing.marketplaceCommissionRate,
        }))
        // 결과 미리 계산
        setCalculationResult({
          sellingPrice: pricing.sellingPriceKrw,
          profit: pricing.profitKrw,
          storageFee: pricing.storageFeeKrw,
          adCost: pricing.adCostKrw,
          grossMargin: pricing.sellingPriceKrw - (pricing.sellingPriceKrw * pricing.marketplaceCommissionRate / 100) - pricing.profitKrw // 역산이 필요하지만 단순화를 위해 재계산 권장
        })
        // 저장된 값으로 정확한 grossMargin을 알기 어려우므로 재계산 트리거
        setTimeout(() => calculatePriceFromMargin(pricing.marginRate), 0)
      }
    } else if (selectedItem?.product?.sellingPriceKrw) {
      // 가격 정보가 없지만 상품에 판매가격이 설정되어 있으면 로드
      setFormData(prev => ({ ...prev, sellingPrice: selectedItem.product!.sellingPriceKrw! }))
      calculateMarginFromPrice(selectedItem.product.sellingPriceKrw)
    }
  }, [selectedOrderItemId, existingPricings, selectedItem])

  // 마진율 변경 시 판매가 계산
  const calculatePriceFromMargin = (newMarginRate?: number) => {
    if (!selectedItem) return

    const marginRate = newMarginRate ?? formData.marginRate
    
    // 묶음 판매 개수
    const unitsPerPackage = selectedItem.product?.unitsPerPackage || 1
    
    // 쿠팡 배송비 (상품에 설정된 값 사용)
    const coupangShippingFee = selectedItem.product?.coupangShippingFee || 0

    // 1. 판매가 계산 (묶음당 원가 + 배송비를 기준으로 마진과 수수료를 고려)
    // 묶음당 원가 = 개당 원가 × 묶음 개수
    const bundleCost = selectedItem.unitCostKrw * unitsPerPackage
    const costBase = bundleCost + coupangShippingFee
    const marginRateDecimal = marginRate / 100
    const commissionRateDecimal = formData.marketplaceCommissionRate / 100

    const denominator = 1 - marginRateDecimal - commissionRateDecimal
    
    if (denominator <= 0) {
      // 마진율이 너무 높으면 계산 불가하지만, 입력 중일 수 있으므로 알림은 생략하거나 부드럽게 처리
      return
    }

    const sellingPrice = Math.ceil(costBase / denominator / 10) * 10 // 10원 단위 반올림
    
    setFormData(prev => ({ ...prev, sellingPrice }))
    calculateResult(sellingPrice)
  }

  // 판매가 변경 시 마진율 계산
  const calculateMarginFromPrice = (newSellingPrice: number) => {
    if (!selectedItem || newSellingPrice <= 0) return

    // 묶음 판매 개수
    const unitsPerPackage = selectedItem.product?.unitsPerPackage || 1
    
    // 쿠팡 배송비 (상품에 설정된 값 사용)
    const coupangShippingFee = selectedItem.product?.coupangShippingFee || 0

    const bundleCost = selectedItem.unitCostKrw * unitsPerPackage
    const costBase = bundleCost + coupangShippingFee
    const commissionRateDecimal = formData.marketplaceCommissionRate / 100

    // Margin Rate = 1 - Commission Rate - (Cost Base / Selling Price)
    const marginRateDecimal = 1 - commissionRateDecimal - (costBase / newSellingPrice)
    const marginRate = parseFloat((marginRateDecimal * 100).toFixed(2)) // 소수점 2자리

    setFormData(prev => ({ ...prev, marginRate }))
    calculateResult(newSellingPrice)
  }

  // 공통 결과 계산 로직
  const calculateResult = (sellingPrice: number) => {
    if (!selectedItem) return

    const unitsPerPackage = selectedItem.product?.unitsPerPackage || 1
    const coupangShippingFee = selectedItem.product?.coupangShippingFee || 0
    const bundleCost = selectedItem.unitCostKrw * unitsPerPackage
    const commissionRateDecimal = formData.marketplaceCommissionRate / 100

    // 2. 마진 계산
    const commission = Math.round(sellingPrice * commissionRateDecimal)
    const totalMargin = sellingPrice - bundleCost - coupangShippingFee - commission

    // 3. 보관료 계산 (묶음 전체의 CBM 사용)
    const cbmPerUnit = selectedItem.product?.cbmPerUnit || 0
    const bundleCbm = cbmPerUnit * unitsPerPackage
    const storageFee = calculateStorageFee({
      cbmPerUnit: bundleCbm,
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
      adCost,
      grossMargin: totalMargin
    })
  }

  // 수동 계산 버튼용 (현재 상태 기준 재계산)
  const handleCalculate = () => {
    calculatePriceFromMargin()
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
    if (!selectedOrderId || !selectedOrderItemId || !calculationResult || !selectedItem) return

    // 쿠팡 배송비를 actualShippingFeeKrw로 저장 (하위 호환성)
    const coupangShippingFee = selectedItem.product?.coupangShippingFee || 0

    savePricingMutation.mutate({
      orderId: Number(selectedOrderId),
      orderItemId: Number(selectedOrderItemId),
      storageFeeKrw: calculationResult.storageFee,
      marginRate: formData.marginRate,
      roas: formData.roas,
      actualShippingFeeKrw: coupangShippingFee,
      marketplaceCommissionRate: formData.marketplaceCommissionRate,
      sellingPriceKrw: calculationResult.sellingPrice,
      adCostKrw: calculationResult.adCost,
      profitKrw: calculationResult.profit
    })
  }

  // 상품에 판매가격 저장 mutation
  const saveToProductMutation = useMutation({
    mutationFn: ({ productId, sellingPrice }: { productId: number; sellingPrice: number }) =>
      productService.update(productId, {
        sellingPriceKrw: sellingPrice
      } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['order', selectedOrderId] })
      alert('상품의 판매가격이 업데이트되었습니다.')
    },
    onError: () => {
      alert('상품 업데이트 중 오류가 발생했습니다.')
    }
  })

  const handleSaveToProduct = () => {
    if (!selectedItem?.productId || !calculationResult) return
    
    if (window.confirm('계산된 판매가격을 상품의 기본 판매가격으로 저장하시겠습니까?')) {
      saveToProductMutation.mutate({
        productId: selectedItem.productId,
        sellingPrice: calculationResult.sellingPrice
      })
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6 bg-slate-50/50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <Calculator className="w-10 h-10 text-indigo-600" />
            판매가격 계산기
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            최적의 마진율과 판매가를 시뮬레이션하고 수익을 극대화하세요.
          </p>
        </div>
        {selectedItem && calculationResult && (
          <div className="flex gap-2">
            <Button 
              size="lg"
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 shadow-lg transition-all hover:scale-105"
              onClick={handleSaveToProduct}
              disabled={saveToProductMutation.isPending}
            >
              <Save className="w-5 h-5 mr-2" />
              {saveToProductMutation.isPending ? '저장 중...' : '상품에 저장'}
            </Button>
            <Button 
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all hover:scale-105"
              onClick={handleSave}
              disabled={savePricingMutation.isPending}
            >
              <Save className="w-5 h-5 mr-2" />
              {savePricingMutation.isPending ? '저장 중...' : '가격 정보 저장'}
            </Button>
          </div>
        )}
      </div>

      {/* 1. Selection Section */}
      <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-base font-medium text-slate-700">발주 선택</Label>
              <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                <SelectTrigger className="h-12 text-lg bg-white border-slate-200 focus:ring-indigo-500">
                  <SelectValue placeholder="발주를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map(order => (
                    <SelectItem key={order.id} value={order.id.toString()}>
                      <span className="font-medium">#{order.id}</span> - {order.orderDate} (총 {order.totalCostKrw.toLocaleString()}원)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium text-slate-700">상품 선택</Label>
              <Select 
                value={selectedOrderItemId} 
                onValueChange={setSelectedOrderItemId}
                disabled={!selectedOrderId}
              >
                <SelectTrigger className="h-12 text-lg bg-white border-slate-200 focus:ring-indigo-500">
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          
          {/* 2. Hero Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Selling Price Card */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white overflow-hidden relative group">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <DollarSign className="w-32 h-32" />
              </div>
              <CardContent className="p-6 relative z-10">
                <p className="text-blue-100 font-medium mb-1 flex items-center gap-2">
                  <Package className="w-4 h-4" /> 권장 판매가
                </p>
                <div className="text-4xl font-bold tracking-tight">
                  {calculationResult?.sellingPrice.toLocaleString() ?? 0}
                  <span className="text-2xl font-normal ml-1 opacity-80">원</span>
                </div>
                <p className="text-sm text-blue-100 mt-4 opacity-80">
                  묶음당 ({selectedItem.product?.unitsPerPackage || 1}개) 가격
                </p>
              </CardContent>
            </Card>

            {/* Net Profit Card */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white overflow-hidden relative group">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp className="w-32 h-32" />
              </div>
              <CardContent className="p-6 relative z-10">
                <p className="text-emerald-100 font-medium mb-1 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> 예상 순이익
                </p>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-bold tracking-tight">
                    {calculationResult?.profit.toLocaleString() ?? 0}
                    <span className="text-2xl font-normal ml-1 opacity-80">원</span>
                  </div>
                  {calculationResult && (
                    <div className="text-lg font-semibold bg-white/20 px-2 py-0.5 rounded text-emerald-50">
                      {((calculationResult.profit / calculationResult.sellingPrice) * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
                <p className="text-sm text-emerald-100 mt-4 opacity-80">
                  모든 비용 제외 후 실제 수익
                </p>
              </CardContent>
            </Card>

            {/* Margin Rate Card */}
            <Card className="border-none shadow-lg bg-white text-slate-800 overflow-hidden relative group">
              <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Percent className="w-32 h-32 text-indigo-600" />
              </div>
              <CardContent className="p-6 relative z-10">
                <p className="text-slate-500 font-medium mb-1 flex items-center gap-2">
                  <Percent className="w-4 h-4" /> 목표 마진율
                </p>
                <div className="text-4xl font-bold tracking-tight text-indigo-600">
                  {formData.marginRate}
                  <span className="text-2xl font-normal ml-1 text-slate-400">%</span>
                </div>
                <div className="mt-4">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="1"
                    value={formData.marginRate}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setFormData(prev => ({ ...prev, marginRate: val }))
                      calculatePriceFromMargin(val)
                    }}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Selling Price Indicator */}
            {selectedItem?.product?.sellingPriceKrw && (
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">상품 기본 판매가격</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {selectedItem.product.sellingPriceKrw.toLocaleString()}원
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">이 상품에 저장된 기본 판매가격입니다</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 3. Main Control & Analysis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Controls */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calculator className="w-5 h-5 text-indigo-500" />
                    가격 설정
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-600">목표 마진율 (%)</Label>
                      <div className="relative">
                        <Input 
                          type="number" 
                          className="pl-10 h-12 text-lg font-medium"
                          value={formData.marginRate}
                          onChange={e => {
                            const val = Number(e.target.value)
                            setFormData(prev => ({ ...prev, marginRate: val }))
                            calculatePriceFromMargin(val)
                          }}
                        />
                        <Percent className="w-4 h-4 absolute left-3 top-4 text-slate-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-600">판매가 (원)</Label>
                      <div className="relative">
                        <Input 
                          type="number" 
                          className="pl-10 h-12 text-lg font-medium text-indigo-600"
                          value={formData.sellingPrice}
                          onChange={e => {
                            const val = Number(e.target.value)
                            setFormData(prev => ({ ...prev, sellingPrice: val }))
                            calculateMarginFromPrice(val)
                          }}
                        />
                        <DollarSign className="w-4 h-4 absolute left-3 top-4 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <h4 className="font-medium text-slate-900 flex items-center gap-2">
                      <Box className="w-4 h-4 text-slate-500" /> 추가 설정
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">목표 ROAS (배수)</Label>
                        <Input 
                          type="number" 
                          value={formData.roas}
                          onChange={e => setFormData(prev => ({ ...prev, roas: Number(e.target.value) }))}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">마켓 수수료율 (%)</Label>
                        <Input 
                          type="number" 
                          value={formData.marketplaceCommissionRate}
                          onChange={e => setFormData(prev => ({ ...prev, marketplaceCommissionRate: Number(e.target.value) }))}
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-medium text-slate-600">최대 보관일</Label>
                        <Input 
                          type="number" 
                          value={formData.storageFeeInputs.maxDays}
                          onChange={e => setFormData(prev => ({ 
                            ...prev, 
                            storageFeeInputs: { ...prev.storageFeeInputs, maxDays: Number(e.target.value) } 
                          }))}
                          className="w-20 h-8 text-right"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-medium text-slate-600">일일 판매량</Label>
                        <Input 
                          type="number" 
                          value={formData.storageFeeInputs.dailySales}
                          onChange={e => setFormData(prev => ({ 
                            ...prev, 
                            storageFeeInputs: { ...prev.storageFeeInputs, dailySales: Number(e.target.value) } 
                          }))}
                          className="w-20 h-8 text-right"
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full h-12 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    onClick={handleCalculate}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    현재 설정으로 재계산
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right: Analysis */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-none shadow-md h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    수익 구조 분석
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {calculationResult ? (
                    <>
                      {/* Cost Breakdown Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-slate-500 mb-1">
                          <span>비용 구조 시각화</span>
                          <span>판매가 100% 기준</span>
                        </div>
                        <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden flex text-xs font-bold text-white leading-6 text-center">
                          <div 
                            className="bg-slate-400" 
                            style={{ width: `${((selectedItem.unitCostKrw * (selectedItem.product?.unitsPerPackage || 1)) / calculationResult.sellingPrice * 100)}%` }}
                            title="원가"
                          >
                            원가
                          </div>
                          <div 
                            className="bg-orange-400" 
                            style={{ width: `${(formData.marketplaceCommissionRate)}%` }}
                            title="수수료"
                          >
                            수수료
                          </div>
                          <div 
                            className="bg-red-400" 
                            style={{ width: `${(calculationResult.adCost / calculationResult.sellingPrice * 100)}%` }}
                            title="광고"
                          >
                            광고
                          </div>
                          <div 
                            className="bg-emerald-500 flex-1" 
                            title="순이익"
                          >
                            이익
                          </div>
                        </div>
                      </div>

                      {/* Detailed List */}
                      <div className="space-y-0 divide-y divide-slate-100">
                        <div className="flex justify-between items-center py-3">
                          <span className="text-slate-600 flex items-center gap-2">
                            <Box className="w-4 h-4 text-slate-400" /> 묶음당 원가
                          </span>
                          <span className="font-medium">
                            {(selectedItem.unitCostKrw * (selectedItem.product?.unitsPerPackage || 1)).toLocaleString()}원
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                          <span className="text-slate-600 flex items-center gap-2">
                            <Truck className="w-4 h-4 text-slate-400" /> 쿠팡 배송비
                          </span>
                          <span className="font-medium">
                            {(selectedItem.product?.coupangShippingFee || 0).toLocaleString()}원
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                          <span className="text-orange-600 flex items-center gap-2">
                            <ArrowRight className="w-4 h-4" /> 마켓 수수료 ({formData.marketplaceCommissionRate}%)
                          </span>
                          <span className="font-medium text-orange-600">
                            <span>{Math.round(calculationResult.sellingPrice * formData.marketplaceCommissionRate / 100).toLocaleString()}원</span>
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center py-3 bg-slate-50 px-2 rounded">
                          <span className="text-slate-700 font-semibold flex items-center gap-2">
                            <ArrowRight className="w-4 h-4 text-slate-500" /> 1차 마진 (광고/보관료 전)
                          </span>
                          <span className="font-bold text-slate-700">
                            {calculationResult.grossMargin.toLocaleString()}원
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-3">
                          <span className="text-red-500 flex items-center gap-2">
                            <ArrowRight className="w-4 h-4" /> 예상 광고비 (ROAS {formData.roas})
                          </span>
                          <span className="font-medium text-red-500">
                            -{calculationResult.adCost.toLocaleString()}원
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                          <span className="text-red-500 flex items-center gap-2">
                            <ArrowRight className="w-4 h-4" /> 예상 보관료
                          </span>
                          <span className="font-medium text-red-500">
                            -{calculationResult.storageFee.toLocaleString()}원
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center py-4 mt-2 bg-emerald-50/50 px-4 rounded-lg">
                          <span className="text-emerald-700 font-bold text-lg">최종 순이익</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-extrabold text-emerald-600">
                              {calculationResult.profit.toLocaleString()}원
                            </span>
                            <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                              {((calculationResult.profit / calculationResult.sellingPrice) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                      <Calculator className="w-12 h-12 mb-4 opacity-20" />
                      <p>설정을 입력하면 분석 결과가 표시됩니다.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


