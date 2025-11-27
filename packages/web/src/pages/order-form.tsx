import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { orderService, productService } from '@/services'
import { CreateOrderDto, Product } from '@/types'

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
    mutationFn: orderService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      navigate('/orders')
    }
  })

  // 발주 수정 mutation
  const updateOrderMutation = useMutation({
    mutationFn: (data: CreateOrderDto) => orderService.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', id] })
      navigate('/orders')
    }
  })

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
        
        // 해외배송비 계산: 개당 무게 * 구매수량
        // 1kg까지 6000원, 이후 kg당 800원
        const totalWeight = selectedProduct.weightPerUnit * formData.quantity
        let internationalShipping = 0
        if (totalWeight <= 1) {
          internationalShipping = 6000
        } else {
          internationalShipping = 6000 + Math.ceil((totalWeight - 1) * 800)
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
    // 과세 가격 = (상품 가격 X 관세청 고시환율) + 과세 운임
    // 여기서는 관세청 고시환율을 입력된 환율로 사용하고, 과세 운임은 배송비로 가정
    const productPriceKrw = formData.originalCostYuan * formData.exchangeRate
    const taxableShipping = formData.shippingFeeKrw || 0 // 과세 운임 (배송비 전체를 과세 운임으로 가정)
    const taxableAmount = Math.round(productPriceKrw + taxableShipping)
    
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
  }, [formData.originalCostYuan, formData.exchangeRate, formData.shippingFeeKrw])

  // 총 원가 자동 계산
  useEffect(() => {
    const originalCostKrw = formData.originalCostYuan * formData.exchangeRate
    const serviceFeeKrw = formData.serviceFeeYuan * formData.exchangeRate
    const inspectionFeeKrw = formData.inspectionFeeYuan * formData.exchangeRate
    const packagingFeeKrw = formData.packagingFeeYuan * formData.exchangeRate
    
    const totalCost = originalCostKrw + serviceFeeKrw + inspectionFeeKrw + packagingFeeKrw +
                      (formData.shippingFeeKrw || 0) + (formData.miscellaneousFeeKrw || 0) +
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

  // 판매가격 계산 (묶음 판매 고려)
  const calculateSellingPrice = (
    totalCost: number, 
    marginRate: number, 
    roas: number,
    actualShippingFee: number,
    marketplaceCommissionRate: number,
    unitsPerPackage: number
  ) => {
    // 묶음당 원가 (총 원가 / 묶음 수량)
    const costPerPackage = totalCost / (formData.quantity / unitsPerPackage)
    
    // 원하는 마진
    const desiredMargin = costPerPackage * (marginRate / 100)
    
    // 역산 공식 (ROAS는 배수로 계산):
    // 판매가 = (원가 + 마진 + 광고비 + 배송비) / (1 - 수수료율)
    // 광고비 = 판매가 / ROAS (ROAS가 2배면 광고비는 판매가의 1/2)
    // 수수료 = 판매가 * 수수료율
    
    // 판매가를 x라고 하면:
    // x = (원가 + 마진 + x/ROAS + 배송비) / (1 - 수수료율)
    // x * (1 - 수수료율) = 원가 + 마진 + x/ROAS + 배송비
    // x * (1 - 수수료율 - 1/ROAS) = 원가 + 마진 + 배송비
    // x = (원가 + 마진 + 배송비) / (1 - 수수료율 - 1/ROAS)
    
    const roasMultiplier = roas > 0 ? (1 / roas) : 0
    const commissionDecimal = marketplaceCommissionRate / 100
    
    const numerator = costPerPackage + desiredMargin + actualShippingFee
    const denominator = 1 - commissionDecimal - roasMultiplier
    
    if (denominator <= 0) {
      // 수수료율 + 1/ROAS가 100% 이상이면 판매 불가
      return 0
    }
    
    const sellingPrice = numerator / denominator
    
    return Math.round(sellingPrice)
  }

  const isPending = createOrderMutation.isPending || updateOrderMutation.isPending

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{isEditMode ? '발주 수정' : '새 발주 등록'}</h1>
        <Button variant="outline" onClick={() => navigate('/orders')}>
          목록으로 돌아가기
        </Button>
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
                      const totalWeight = (selectedProduct?.weightPerUnit || 0) * formData.quantity
                      return `총 무게: ${totalWeight.toFixed(2)}kg | 1kg까지 6000원, 이후 kg당 800원`
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
                    (상품가격 × 환율) + 배송비
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
            <div className="border p-4 rounded-md bg-blue-50/50">
              <h3 className="font-semibold text-lg mb-4">비용 상세 내역 (총 원가 구성)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-muted-foreground mb-1">원가 (위안)</p>
                  <p className="font-semibold">{formData.originalCostYuan.toLocaleString()} 위안</p>
                  <p className="text-sm text-blue-600">= {(formData.originalCostYuan * formData.exchangeRate).toLocaleString()}원</p>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-muted-foreground mb-1">구매대행 수수료 (위안)</p>
                  <p className="font-semibold">{formData.serviceFeeYuan.toLocaleString()} 위안</p>
                  <p className="text-sm text-blue-600">= {(formData.serviceFeeYuan * formData.exchangeRate).toLocaleString()}원</p>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-muted-foreground mb-1">검품비 (위안)</p>
                  <p className="font-semibold">{formData.inspectionFeeYuan.toLocaleString()} 위안</p>
                  <p className="text-sm text-blue-600">= {(formData.inspectionFeeYuan * formData.exchangeRate).toLocaleString()}원</p>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-muted-foreground mb-1">포장비 (위안)</p>
                  <p className="font-semibold">{formData.packagingFeeYuan.toFixed(2)} 위안</p>
                  <p className="text-sm text-blue-600">= {(formData.packagingFeeYuan * formData.exchangeRate).toLocaleString()}원</p>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-muted-foreground mb-1">중국내 배송비 (위안)</p>
                  <p className="font-semibold">{(formData.domesticShippingFeeYuan || 0).toLocaleString()} 위안</p>
                  <p className="text-sm text-blue-600">= {((formData.domesticShippingFeeYuan || 0) * formData.exchangeRate).toLocaleString()}원</p>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-muted-foreground mb-1">해외 배송비</p>
                  <p className="font-semibold text-blue-600">{(formData.internationalShippingFeeKrw || 0).toLocaleString()}원</p>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-muted-foreground mb-1">총 배송비</p>
                  <p className="font-semibold text-blue-600">{(formData.shippingFeeKrw || 0).toLocaleString()}원</p>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-muted-foreground mb-1">기타 비용</p>
                  <p className="font-semibold text-blue-600">{(formData.miscellaneousFeeKrw || 0).toLocaleString()}원</p>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-muted-foreground mb-1">통관비</p>
                  <p className="font-semibold text-blue-600">{formData.customsFeeKrw.toLocaleString()}원</p>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-muted-foreground mb-1">관세</p>
                  <p className="font-semibold text-blue-600">{formData.dutyKrw.toLocaleString()}원</p>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-muted-foreground mb-1">부가세</p>
                  <p className="font-semibold text-blue-600">{formData.vatKrw.toLocaleString()}원</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded border border-blue-700 text-white">
                  <p className="text-xs mb-1 opacity-90">총 원가</p>
                  <p className="font-bold text-lg">{formData.totalCostKrw.toLocaleString()}원</p>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, marginRate: Number(e.target.value) }))}
                  />
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
                    value={formData.actualShippingFeeKrw}
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

                <div className="space-y-2">
                  <Label>판매가격 (묶음당, 원)</Label>
                  <div className="flex h-10 w-full rounded-md border-2 border-primary bg-primary/5 px-3 py-2 text-lg font-bold text-primary">
                    {(() => {
                      const selectedProduct = products.find(p => p.id === formData.productId)
                      const unitsPerPackage = selectedProduct?.unitsPerPackage || 1
                      return calculateSellingPrice(
                        formData.totalCostKrw, 
                        formData.marginRate || 0,
                        formData.roas || 0,
                        formData.actualShippingFeeKrw || 0,
                        formData.marketplaceCommissionRate || 0,
                        unitsPerPackage
                      ).toLocaleString()
                    })()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(() => {
                      const selectedProduct = products.find(p => p.id === formData.productId)
                      const unitsPerPackage = selectedProduct?.unitsPerPackage || 1
                      return unitsPerPackage > 1 ? `${unitsPerPackage}개 묶음 기준` : '개당 가격'
                    })()}
                  </p>
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
