import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { orderService, productService } from '@/services'
import { CreateOrderDto, Product } from '@/types'
import { calculateStorageFee, StorageFeeOutput } from '@/lib/storage-fee-calculator'

const OrderFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditMode = !!id

  // 제품 목록 조회
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: productService.getAll
  })

  // 수정 모드일 때 기존 발주 정보 조회
  const { data: existingOrder } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getById(Number(id)),
    enabled: isEditMode
  })

  const [formData, setFormData] = useState<CreateOrderDto>({
    productId: 0,
    quantity: 0,
    originalCostYuan: 0,
    exchangeRate: 180,
    serviceFeeYuan: 0,
    inspectionFeeYuan: 0,
    packagingFeeYuan: 0,
    domesticShippingFeeYuan: 0,
    internationalShippingFeeKrw: 0,
    shippingFeeKrw: 0,
    miscellaneousFeeKrw: 0,
    customsFeeKrw: 22000,
    taxableAmountKrw: 0,
    dutyKrw: 0,
    vatKrw: 0,
    totalCostKrw: 0,
    marginRate: 30,
    orderDate: new Date().toISOString().split('T')[0]
  })

  // 판매가격 입력을 위한 별도 상태
  const [manualSellingPrice, setManualSellingPrice] = useState<number | null>(null)

  // 보관료 계산을 위한 상태
  const [storageFeeInputs, setStorageFeeInputs] = useState({
    maxDays: 365,
    dailySales: 10
  })
  const [storageFeeResult, setStorageFeeResult] = useState<StorageFeeOutput | null>(null)

  // 기존 데이터 로드
  useEffect(() => {
    if (existingOrder) {
      setFormData({
        productId: existingOrder.productId,
        quantity: existingOrder.quantity,
        originalCostYuan: existingOrder.originalCostYuan,
        exchangeRate: existingOrder.exchangeRate,
        serviceFeeYuan: existingOrder.serviceFeeYuan,
        inspectionFeeYuan: existingOrder.inspectionFeeYuan,
        packagingFeeYuan: existingOrder.packagingFeeYuan,
        domesticShippingFeeYuan: existingOrder.domesticShippingFeeYuan || 0,
        internationalShippingFeeKrw: existingOrder.internationalShippingFeeKrw || 0,
        shippingFeeKrw: existingOrder.shippingFeeKrw,
        miscellaneousFeeKrw: existingOrder.miscellaneousFeeKrw || 0,
        customsFeeKrw: existingOrder.customsFeeKrw,
        taxableAmountKrw: existingOrder.taxableAmountKrw,
        dutyKrw: existingOrder.dutyKrw,
        vatKrw: existingOrder.vatKrw,
        totalCostKrw: existingOrder.totalCostKrw,
        marginRate: existingOrder.marginRate,
        roas: existingOrder.roas || 2,
        actualShippingFeeKrw: existingOrder.actualShippingFeeKrw || 3000,
        marketplaceCommissionRate: existingOrder.marketplaceCommissionRate || 10,
        orderDate: existingOrder.orderDate
      })
    }
  }, [existingOrder])

  // 발주 생성 mutation
  const createOrderMutation = useMutation({
    mutationFn: (newOrder: CreateOrderDto) => orderService.create({
      ...newOrder,
      sellingPriceKrw: sellingPrice // 계산된 판매가격 포함
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      navigate('/orders')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || '발주 등록 중 오류가 발생했습니다.'
      alert(errorMessage)
    }
  })

  // 발주 수정 mutation
  const updateOrderMutation = useMutation({
    mutationFn: (updatedOrder: CreateOrderDto) => orderService.update(Number(id), {
      ...updatedOrder,
      sellingPriceKrw: sellingPrice // 계산된 판매가격 포함
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', id] })
      navigate('/orders')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || '발주 수정 중 오류가 발생했습니다.'
      alert(errorMessage)
    }
  })

  // 발주 삭제 mutation
  const deleteOrderMutation = useMutation({
    mutationFn: () => orderService.delete(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      navigate('/orders')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || '발주 삭제 중 오류가 발생했습니다.'
      alert(errorMessage)
    }
  })

  // 보관료 자동 계산
  useEffect(() => {
    if (formData.productId && formData.quantity) {
      const selectedProduct = products.find(p => p.id === formData.productId)
      if (selectedProduct && selectedProduct.cbmPerUnit > 0) {
        const result = calculateStorageFee({
          maxDays: storageFeeInputs.maxDays,
          initialQty: formData.quantity,
          cbmPerUnit: selectedProduct.cbmPerUnit,
          dailySales: storageFeeInputs.dailySales
        })
        setStorageFeeResult(result)
        
        // 보관료를 원화로 변환하여 formData 업데이트
        // 보관료는 위안화 기준이므로 환율 적용 필요 (기준표가 원화인지 위안화인지 확인 필요)
        // 스펙상 "1,000원/CBM/일" 이므로 원화 기준임. 환율 적용 불필요.
        const storageFee = Math.round(result.totalCost)
        
        if (storageFee !== formData.storageFeeKrw) {
          setFormData(prev => ({
            ...prev,
            storageFeeKrw: storageFee
          }))
        }
      } else {
        setStorageFeeResult(null)
        if (formData.storageFeeKrw !== 0) {
          setFormData(prev => ({
            ...prev,
            storageFeeKrw: 0
          }))
        }
      }
    }
  }, [formData.productId, formData.quantity, storageFeeInputs, products])

  // 제품 선택 시 원가, 구매대행 수수료, 포장비, 해외배송비 자동 계산
  useEffect(() => {
    if (formData.productId && formData.quantity) {
      const selectedProduct = products.find(p => p.id === formData.productId)
      if (selectedProduct) {
        const originalCost = selectedProduct.pricePerUnitYuan * formData.quantity
        
        // 구매대행 수수료 계산
        // 총 구매금액(원가 * 수량)이 500위안 미만이면 30위안, 500~999면 50위안, 1000위안 이상은 5%
        let serviceFee = 0
        if (originalCost < 500) {
          serviceFee = 30
        } else if (originalCost < 1000) {
          serviceFee = 50
        } else {
          serviceFee = originalCost * 0.05
        }
        
        // 포장비 계산: (구매수량 / 판매단위) * 0.3위안
        const unitsPerPackage = selectedProduct.unitsPerPackage || 1
        const packagingFee = (formData.quantity / unitsPerPackage) * 0.3
        
        // 해외배송비 계산: 개당 무게(g) * 구매수량 / 1000 = kg
        // 1kg까지 6000원, 이후 kg당 1600원
        const totalWeightKg = (selectedProduct.weightPerUnit * formData.quantity) / 1000
        let internationalShipping = 0
        if (totalWeightKg <= 1) {
          internationalShipping = 6000
        } else {
          internationalShipping = 6000 + Math.ceil((totalWeightKg - 1) * 1600)
        }
        
        // 값이 실제로 변경되었을 때만 업데이트 (무한 루프 방지)
        if (originalCost !== formData.originalCostYuan || 
            serviceFee !== formData.serviceFeeYuan ||
            packagingFee !== formData.packagingFeeYuan ||
            internationalShipping !== formData.internationalShippingFeeKrw) {
          setFormData(prev => ({
            ...prev,
            originalCostYuan: originalCost,
            serviceFeeYuan: serviceFee,
            inspectionFeeYuan: originalCost * 0.02, // 검품비 2%
            packagingFeeYuan: packagingFee,
            internationalShippingFeeKrw: internationalShipping
          }))
        }
      }
    }
  }, [formData.productId, formData.quantity, products])

  // 총 배송비 계산 (중국내 + 해외)
  useEffect(() => {
    const domesticShippingKrw = (formData.domesticShippingFeeYuan || 0) * formData.exchangeRate
    const totalShipping = Math.round(domesticShippingKrw + (formData.internationalShippingFeeKrw || 0))
    
    if (totalShipping !== formData.shippingFeeKrw) {
      setFormData(prev => ({
        ...prev,
        shippingFeeKrw: totalShipping
      }))
    }
  }, [formData.domesticShippingFeeYuan, formData.internationalShippingFeeKrw, formData.exchangeRate])

  // 과세가격, 관세, 부가세 자동 계산
  useEffect(() => {
    // 과세 가격 = 상품 가격 X 관세청 고시환율 (배송비 제외)
    const productPriceKrw = formData.originalCostYuan * formData.exchangeRate
    const taxableAmount = Math.round(productPriceKrw)
    
    // 관세 = 과세가격 X 8%
    const duty = Math.round(taxableAmount * 0.08)
    
    // 부가세 = (과세가격 + 관세) X 10%
    const vat = Math.round((taxableAmount + duty) * 0.10)
    
    // 값이 변경되었을 때만 업데이트
    if (taxableAmount !== formData.taxableAmountKrw || 
        duty !== formData.dutyKrw || 
        vat !== formData.vatKrw) {
      setFormData(prev => ({
        ...prev,
        taxableAmountKrw: taxableAmount,
        dutyKrw: duty,
        vatKrw: vat
      }))
    }
  }, [formData.originalCostYuan, formData.exchangeRate])

  // 총 원가 자동 계산
  useEffect(() => {
    const originalCostKrw = formData.originalCostYuan * formData.exchangeRate
    const serviceFeeKrw = formData.serviceFeeYuan * formData.exchangeRate
    const inspectionFeeKrw = formData.inspectionFeeYuan * formData.exchangeRate
    const packagingFeeKrw = formData.packagingFeeYuan * formData.exchangeRate
    
    const totalCost = originalCostKrw + serviceFeeKrw + inspectionFeeKrw + packagingFeeKrw +
                      (formData.shippingFeeKrw || 0) + (formData.miscellaneousFeeKrw || 0) +
                      (formData.storageFeeKrw || 0) + // 보관료 추가
                      formData.customsFeeKrw + formData.dutyKrw + formData.vatKrw
    
    const roundedTotalCost = Math.round(totalCost)

    if (roundedTotalCost !== formData.totalCostKrw) {
      setFormData(prev => ({
        ...prev,
        totalCostKrw: roundedTotalCost
      }))
    }
  }, [
    formData.originalCostYuan,
    formData.exchangeRate,
    formData.serviceFeeYuan,
    formData.inspectionFeeYuan,
    formData.packagingFeeYuan,
    formData.shippingFeeKrw,
    formData.miscellaneousFeeKrw,
    formData.storageFeeKrw, // 의존성 추가
    formData.customsFeeKrw,
    formData.dutyKrw,
    formData.vatKrw
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditMode) {
      updateOrderMutation.mutate(formData)
    } else {
      createOrderMutation.mutate(formData)
    }
  }

  const handleDelete = () => {
    if (window.confirm('정말로 이 발주를 삭제하시겠습니까?')) {
      deleteOrderMutation.mutate()
    }
  }

  // 판매가격 변경 시 마진율 역계산
  const handleSellingPriceChange = (sellingPrice: number) => {
    setManualSellingPrice(sellingPrice)
    
    const selectedProduct = products.find(p => p.id === formData.productId)
    const unitsPerPackage = selectedProduct?.unitsPerPackage || 1
    const packageCount = formData.quantity / unitsPerPackage
    const costPerPackage = packageCount > 0 ? formData.totalCostKrw / packageCount : 0
    
    if (costPerPackage === 0) return
    
    const roasMultiplier = (formData.roas || 0) > 0 ? (1 / (formData.roas || 1)) : 0
    const commissionDecimal = (formData.marketplaceCommissionRate || 0) / 100
    
    // 역산: sellingPrice = (costPerPackage + shipping) / (1 - margin - commission - roasMultiplier)
    // sellingPrice * (1 - margin - commission - roasMultiplier) = costPerPackage + shipping
    // sellingPrice * (1 - commission - roasMultiplier) - sellingPrice * margin = costPerPackage + shipping
    // sellingPrice * margin = sellingPrice * (1 - commission - roasMultiplier) - costPerPackage - shipping
    // margin = (sellingPrice * (1 - commission - roasMultiplier) - costPerPackage - shipping) / sellingPrice
    
    const profit = sellingPrice * (1 - commissionDecimal - roasMultiplier) - costPerPackage - (formData.actualShippingFeeKrw || 0)
    const marginRate = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0
    
    setFormData(prev => ({ ...prev, marginRate: Math.max(0, marginRate) }))
  }

  // 마진율 변경 시 수동 판매가격 초기화
  const handleMarginRateChange = (marginRate: number) => {
    setManualSellingPrice(null)
    setFormData(prev => ({ ...prev, marginRate }))
  }

  // 렌더링을 위한 판매가 및 이익 계산
  const selectedProduct = products.find(p => p.id === formData.productId)
  const unitsPerPackage = selectedProduct?.unitsPerPackage || 1
  const packageCount = formData.quantity / unitsPerPackage
  const costPerPackage = packageCount > 0 ? formData.totalCostKrw / packageCount : 0
  const marginDecimal = (formData.marginRate || 0) / 100
  const roasMultiplier = (formData.roas || 0) > 0 ? (1 / (formData.roas || 1)) : 0
  const commissionDecimal = (formData.marketplaceCommissionRate || 0) / 100
  
  const numerator = costPerPackage + (formData.actualShippingFeeKrw || 0)
  const denominator = 1 - marginDecimal - commissionDecimal - roasMultiplier
  
  const calculatedSellingPrice = denominator > 0 ? Math.round(numerator / denominator) : 0
  const sellingPrice = manualSellingPrice || calculatedSellingPrice
  
  const adCost = sellingPrice * roasMultiplier
  const commission = sellingPrice * commissionDecimal
  const profit = sellingPrice - costPerPackage - (formData.actualShippingFeeKrw || 0) - adCost - commission

  const isPending = createOrderMutation.isPending || updateOrderMutation.isPending

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{isEditMode ? '발주 수정' : '새 발주 등록'}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/orders')}>
            목록으로 돌아가기
          </Button>
          {isEditMode && (
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteOrderMutation.isPending}
            >
              {deleteOrderMutation.isPending ? '삭제 중...' : '삭제'}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? '발주 정보 수정' : '발주 정보 입력'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 기본 정보 섹션 */}
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="font-semibold text-lg">기본 정보</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="productId">제품</Label>
                  <select
                    id="productId"
                    className="w-full border border-input rounded-md h-10 px-3"
                    value={formData.productId}
                    onChange={(e) => setFormData(prev => ({ ...prev, productId: Number(e.target.value) }))}
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
                  <Label htmlFor="quantity">수량</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderDate">발주일</Label>
                  <Input
                    id="orderDate"
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* 환율 및 원가 섹션 */}
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="font-semibold text-lg">비용 및 환율</h3>

                <div className="space-y-2">
                  <Label htmlFor="exchangeRate">환율 (1위안 = x원)</Label>
                  <Input
                    id="exchangeRate"
                    type="number"
                    step="0.01"
                    value={formData.exchangeRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, exchangeRate: Number(e.target.value) }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>원가 (위안) - 자동계산</Label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                    {formData.originalCostYuan.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* 보관료 섹션 */}
            <div className="border p-4 rounded-md bg-orange-50/50">
              <h3 className="font-semibold text-lg mb-4">보관료 시뮬레이션</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dailySales">하루 판매 속도 (개/일)</Label>
                    <Input
                      id="dailySales"
                      type="number"
                      min="1"
                      value={storageFeeInputs.dailySales}
                      onChange={(e) => setStorageFeeInputs(prev => ({ ...prev, dailySales: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxDays">최대 보관 기간 (일)</Label>
                    <Input
                      id="maxDays"
                      type="number"
                      min="1"
                      value={storageFeeInputs.maxDays}
                      onChange={(e) => setStorageFeeInputs(prev => ({ ...prev, maxDays: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="bg-white p-4 rounded border shadow-sm">
                  <h4 className="font-medium mb-2">계산 결과</h4>
                  {storageFeeResult ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">총 보관료:</span>
                        <span className="font-bold text-orange-600">{storageFeeResult.totalCost.toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">재고 소진일:</span>
                        <span className="font-bold">{storageFeeResult.daysToSellout}일</span>
                      </div>
                      <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                        * 제품 CBM: {products.find(p => p.id === formData.productId)?.cbmPerUnit || 0}
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm py-4 text-center">
                      제품을 선택하고 CBM 정보가 있어야 계산됩니다.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 상세 비용 섹션 */}
            <div className="border p-4 rounded-md">
              <h3 className="font-semibold text-lg mb-4">상세 비용 (원화/위안)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>구매대행 수수료 (위안) - 자동계산</Label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                    {formData.serviceFeeYuan.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    500위안 미만: 30위안 | 500-999위안: 50위안 | 1000위안 이상: 5%
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inspectionFeeYuan">검품비 (위안)</Label>
                  <Input
                    id="inspectionFeeYuan"
                    type="number"
                    step="0.01"
                    value={formData.inspectionFeeYuan}
                    onChange={(e) => setFormData(prev => ({ ...prev, inspectionFeeYuan: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>포장비 (위안) - 자동계산</Label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                    {formData.packagingFeeYuan.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(() => {
                      const selectedProduct = products.find(p => p.id === formData.productId)
                      const unitsPerPackage = selectedProduct?.unitsPerPackage || 1
                      return `(수량 ${formData.quantity} / 판매단위 ${unitsPerPackage}) × 0.3위안`
                    })()}
                  </p>
                  <p className="text-xs font-semibold">
                    = {(formData.packagingFeeYuan * formData.exchangeRate).toLocaleString()}원
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="domesticShippingFeeYuan">중국내 배송비 (위안)</Label>
                  <Input
                    id="domesticShippingFeeYuan"
                    type="number"
                    step="0.01"
                    value={formData.domesticShippingFeeYuan || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, domesticShippingFeeYuan: Number(e.target.value) }))}
                  />
                  <p className="text-xs font-semibold">
                    = {((formData.domesticShippingFeeYuan || 0) * formData.exchangeRate).toLocaleString()}원
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="internationalShippingFeeKrw">해외 배송비 (원) - 자동계산/수정가능</Label>
                  <Input
                    id="internationalShippingFeeKrw"
                    type="number"
                    value={formData.internationalShippingFeeKrw || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, internationalShippingFeeKrw: Number(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {(() => {
                      const selectedProduct = products.find(p => p.id === formData.productId)
                      const totalWeightG = (selectedProduct?.weightPerUnit || 0) * formData.quantity
                      const totalWeightKg = totalWeightG / 1000
                      return `총 무게: ${totalWeightG.toLocaleString()}g (${totalWeightKg.toFixed(2)}kg) | 1kg까지 6000원, 이후 kg당 1600원`
                    })()}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>총 배송비 (원) - 자동계산</Label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-semibold">
                    {(formData.shippingFeeKrw || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    중국내 + 해외 배송비
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="miscellaneousFeeKrw">기타 비용 (원)</Label>
                  <Input
                    id="miscellaneousFeeKrw"
                    type="number"
                    value={formData.miscellaneousFeeKrw || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, miscellaneousFeeKrw: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>과세가격 (원) - 자동계산</Label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                    {formData.taxableAmountKrw.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    상품가격 × 환율
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customsFeeKrw">통관비 (원)</Label>
                  <Input
                    id="customsFeeKrw"
                    type="number"
                    value={formData.customsFeeKrw}
                    onChange={(e) => setFormData(prev => ({ ...prev, customsFeeKrw: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>관세 (원) - 자동계산</Label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                    {formData.dutyKrw.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    과세가격 × 8%
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>부가세 (원) - 자동계산</Label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                    {formData.vatKrw.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    (과세가격 + 관세) × 10%
                  </p>
                </div>
              </div>
            </div>

            {/* 비용 상세 내역 섹션 */}
            <div className="border p-4 rounded-md bg-blue-50/50 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">비용 상세 내역 (총 원가 구성)</h3>
                <div className="bg-blue-600 text-white px-4 py-2 rounded-md font-bold shadow-sm">
                  총 원가: {formData.totalCostKrw.toLocaleString()}원
                </div>
              </div>

              {/* 1차 결제 */}
              <div className="bg-white/50 p-3 rounded-md border border-blue-100">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold border border-blue-200">1차 결제</span>
                  <span className="text-sm">상품 매입 및 중국 내 이동</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded border shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">원가 (위안)</p>
                    <p className="font-semibold">{formData.originalCostYuan.toLocaleString()} 위안</p>
                    <p className="text-sm text-blue-600">= {(formData.originalCostYuan * formData.exchangeRate).toLocaleString()}원</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded border shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">구매대행 수수료 (위안)</p>
                    <p className="font-semibold">{formData.serviceFeeYuan.toLocaleString()} 위안</p>
                    <p className="text-sm text-blue-600">= {(formData.serviceFeeYuan * formData.exchangeRate).toLocaleString()}원</p>
                  </div>

                  <div className="bg-white p-3 rounded border shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">중국내 배송비 (위안)</p>
                    <p className="font-semibold">{(formData.domesticShippingFeeYuan || 0).toLocaleString()} 위안</p>
                    <p className="text-sm text-blue-600">= {((formData.domesticShippingFeeYuan || 0) * formData.exchangeRate).toLocaleString()}원</p>
                  </div>
                </div>
              </div>

              {/* 2차 결제 */}
              <div className="bg-white/50 p-3 rounded-md border border-blue-100">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold border border-blue-200">2차 결제</span>
                  <span className="text-sm">국제 배송 및 기타</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded border shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">검품비 (위안)</p>
                    <p className="font-semibold">{formData.inspectionFeeYuan.toLocaleString()} 위안</p>
                    <p className="text-sm text-blue-600">= {(formData.inspectionFeeYuan * formData.exchangeRate).toLocaleString()}원</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded border shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">포장비 (위안)</p>
                    <p className="font-semibold">{formData.packagingFeeYuan.toFixed(2)} 위안</p>
                    <p className="text-sm text-blue-600">= {(formData.packagingFeeYuan * formData.exchangeRate).toLocaleString()}원</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded border shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">해외 배송비</p>
                    <p className="font-semibold text-blue-600">{(formData.internationalShippingFeeKrw || 0).toLocaleString()}원</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded border shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">기타 비용</p>
                    <p className="font-semibold text-blue-600">{(formData.miscellaneousFeeKrw || 0).toLocaleString()}원</p>
                  </div>

                  <div className="bg-white p-3 rounded border shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">보관료 (예상)</p>
                    <p className="font-semibold text-orange-600">{(formData.storageFeeKrw || 0).toLocaleString()}원</p>
                  </div>
                </div>
              </div>

              {/* 3차 결제 */}
              <div className="bg-white/50 p-3 rounded-md border border-blue-100">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold border border-blue-200">3차 결제</span>
                  <span className="text-sm">통관 및 세금</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded border shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">통관비</p>
                    <p className="font-semibold text-blue-600">{formData.customsFeeKrw.toLocaleString()}원</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded border shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">관세</p>
                    <p className="font-semibold text-blue-600">{formData.dutyKrw.toLocaleString()}원</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded border shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">부가세</p>
                    <p className="font-semibold text-blue-600">{formData.vatKrw.toLocaleString()}원</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 결과 섹션 */}

            <div className="border p-4 rounded-md bg-muted/20">
              <h3 className="font-semibold text-lg mb-4">판매 가격 계산</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>총 원가 (원)</Label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-semibold">
                    {formData.totalCostKrw.toLocaleString()}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marginRate">마진율 (%)</Label>
                  <Input
                    id="marginRate"
                    type="number"
                    step="0.1"
                    value={formData.marginRate}
                    onChange={(e) => handleMarginRateChange(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {manualSellingPrice ? '⚠️ 판매가격 직접 입력 중' : '✓ 마진율로 계산'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manualSellingPrice">판매가격 직접 입력 (원)</Label>
                  <Input
                    id="manualSellingPrice"
                    type="number"
                    placeholder="마진율로 자동 계산됨"
                    value={manualSellingPrice ?? calculatedSellingPrice}
                    onChange={(e) => {
                      const value = e.target.value ? Number(e.target.value) : null
                      if (value !== null) handleSellingPriceChange(value)
                      else setManualSellingPrice(null)
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    판매가격 입력 시 마진율 자동 계산
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roas">ROAS (배수)</Label>
                  <Input
                    id="roas"
                    type="number"
                    step="0.1"
                    value={formData.roas}
                    onChange={(e) => setFormData(prev => ({ ...prev, roas: Number(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    예: 2 = 2배 (광고비는 판매가의 1/2)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actualShippingFeeKrw">실제 배송비 (원)</Label>
                  <Input
                    id="actualShippingFeeKrw"
                    type="number"
                    value={formData.actualShippingFeeKrw || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, actualShippingFeeKrw: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marketplaceCommissionRate">판매점 수수료율 (%)</Label>
                  <Input
                    id="marketplaceCommissionRate"
                    type="number"
                    step="0.1"
                    value={formData.marketplaceCommissionRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, marketplaceCommissionRate: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>

            {/* 판매가격 계산 상세 */}
            <div className="border-2 border-primary/20 p-6 rounded-md bg-gradient-to-br from-blue-50 to-indigo-50">
              <h3 className="font-bold text-xl mb-4 text-primary">📊 판매가격 계산 상세</h3>
              <div className="space-y-4">
                    {/* 기본 정보 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-white p-3 rounded border">
                        <p className="text-xs text-muted-foreground mb-1">묶음 판매 단위</p>
                        <p className="font-semibold text-lg">{unitsPerPackage}개</p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-xs text-muted-foreground mb-1">총 묶음 수량</p>
                        <p className="font-semibold text-lg">{packageCount.toLocaleString()}묶음</p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-xs text-muted-foreground mb-1">묶음당 원가</p>
                        <p className="font-semibold text-lg text-blue-600">{costPerPackage.toLocaleString()}원</p>
                      </div>
                    </div>

                    {/* 계산 과정 */}
                    {/* 계산 과정 */}
                    <div className="bg-white p-4 rounded border-2 border-blue-200">
                      <h4 className="font-semibold mb-3 text-blue-900">
                        {manualSellingPrice ? '💡 마진율 역산 공식 (판매가 대비)' : '💡 판매가 계산 공식 (판매가 기준 마진)'}
                      </h4>
                      <div className="space-y-2 text-sm">
                        {manualSellingPrice ? (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="font-mono bg-blue-100 px-2 py-1 rounded">마진율</span>
                              <span>=</span>
                              <span className="font-mono bg-blue-100 px-2 py-1 rounded">((판매가 - 각종 비용) / 판매가) * 100</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>=</span>
                              <span>(({sellingPrice.toLocaleString()} - {(costPerPackage + (formData.actualShippingFeeKrw || 0) + adCost + commission).toLocaleString()}) / {sellingPrice.toLocaleString()}) * 100</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>=</span>
                              <span>({profit.toLocaleString()} / {sellingPrice.toLocaleString()}) * 100</span>
                              <span>=</span>
                              <span className="font-bold text-blue-600">{sellingPrice > 0 ? ((profit / sellingPrice) * 100).toFixed(2) : 0}%</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="font-mono bg-blue-100 px-2 py-1 rounded">판매가</span>
                              <span>=</span>
                              <span className="font-mono bg-blue-100 px-2 py-1 rounded">(묶음당 원가 + 배송비)</span>
                              <span>/</span>
                              <span className="font-mono bg-blue-100 px-2 py-1 rounded">(1 - 마진율 - 수수료율 - 1/ROAS)</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>=</span>
                              <span>({costPerPackage.toLocaleString()} + {(formData.actualShippingFeeKrw || 0).toLocaleString()})</span>
                              <span>/</span>
                              <span>(1 - {marginDecimal.toFixed(2)} - {commissionDecimal.toFixed(2)} - {roasMultiplier.toFixed(2)})</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>=</span>
                              <span>{numerator.toLocaleString()}</span>
                              <span>/</span>
                              <span>{denominator.toFixed(3)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 최종 결과 */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-lg text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90 mb-1">최종 판매가격 (묶음당)</p>
                          <p className="text-4xl font-bold">{sellingPrice.toLocaleString()}원</p>
                          <p className="text-xs opacity-75 mt-1">
                            {unitsPerPackage > 1 ? `${unitsPerPackage}개 묶음 기준` : '개당 가격'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm opacity-90 mb-1">예상 순이익</p>
                          <p className="text-2xl font-bold text-green-300">{profit.toLocaleString()}원</p>
                          <p className="text-xs opacity-75 mt-1">
                            마진율: {sellingPrice > 0 ? ((profit / sellingPrice) * 100).toFixed(2) : 0}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 비용 분해 */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <p className="text-xs text-muted-foreground mb-1">묶음당 원가</p>
                        <p className="font-semibold text-blue-600">{costPerPackage.toLocaleString()}원</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <p className="text-xs text-muted-foreground mb-1">배송비</p>
                        <p className="font-semibold text-orange-600">{(formData.actualShippingFeeKrw || 0).toLocaleString()}원</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <p className="text-xs text-muted-foreground mb-1">광고비</p>
                        <p className="font-semibold text-purple-600">{Math.round(adCost).toLocaleString()}원</p>
                        <p className="text-xs text-muted-foreground">({(roasMultiplier * 100).toFixed(1)}%)</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <p className="text-xs text-muted-foreground mb-1">판매 수수료</p>
                        <p className="font-semibold text-red-600">{Math.round(commission).toLocaleString()}원</p>
                        <p className="text-xs text-muted-foreground">({formData.marketplaceCommissionRate}%)</p>
                      </div>
                      <div className="bg-white p-3 rounded border-2 border-green-300">
                        <p className="text-xs text-muted-foreground mb-1">순이익</p>
                        <p className="font-bold text-green-600">{Math.round(profit).toLocaleString()}원</p>
                        <p className="text-xs text-muted-foreground">({sellingPrice > 0 ? ((profit / sellingPrice) * 100).toFixed(2) : 0}%)</p>
                      </div>
                    </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/orders')}>
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? '저장 중...' : (isEditMode ? '수정 완료' : '발주 등록')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default OrderFormPage
