import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { orderService, productService } from '@/services'
import { CreateOrderDto, Product, OrderItem } from '@/types'

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

  // 현재 활성 탭 (상품 인덱스)
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  // 발주 아이템들 (여러 상품)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      productId: 0,
      quantity: 0,
      originalCostYuan: 0,
      serviceFeeYuan: 0,
      inspectionFeeYuan: 0,
      packagingFeeYuan: 0,
      domesticShippingFeeYuan: 0,
      itemTotalCostKrw: 0,
      unitCostKrw: 0,
    }
  ])

  // 전체 발주 공통 데이터
  const [formData, setFormData] = useState({
    exchangeRate: 180,
    internationalShippingFeeKrw: 0,
    miscellaneousFeeKrw: 0,
    customsFeeKrw: 22000,
    taxableAmountKrw: 0,
    dutyKrw: 0,
    vatKrw: 0,
    totalCostKrw: 0,
    orderDate: new Date().toISOString().split('T')[0]
  })

  // 기존 데이터 로드
  useEffect(() => {
    if (existingOrder) {
      const items = existingOrder.items && existingOrder.items.length > 0
        ? existingOrder.items
        : [{
            productId: 0,
            quantity: 0,
            originalCostYuan: 0,
            serviceFeeYuan: 0,
            inspectionFeeYuan: 0,
            packagingFeeYuan: 0,
            domesticShippingFeeYuan: 0,
            itemTotalCostKrw: 0,
            unitCostKrw: 0,
          }]
      
      setOrderItems(items)
      setFormData({
        exchangeRate: existingOrder.exchangeRate,
        internationalShippingFeeKrw: existingOrder.internationalShippingFeeKrw || 0,
        miscellaneousFeeKrw: existingOrder.miscellaneousFeeKrw || 0,
        customsFeeKrw: existingOrder.customsFeeKrw,
        taxableAmountKrw: existingOrder.taxableAmountKrw,
        dutyKrw: existingOrder.dutyKrw,
        vatKrw: existingOrder.vatKrw,
        totalCostKrw: existingOrder.totalCostKrw,
        orderDate: existingOrder.orderDate
      })
    }
  }, [existingOrder])

  // 탭 추가 (새 상품 추가)
  const addProductTab = () => {
    setOrderItems([...orderItems, {
      productId: 0,
      quantity: 0,
      originalCostYuan: 0,
      serviceFeeYuan: 0,
      inspectionFeeYuan: 0,
      packagingFeeYuan: 0,
      domesticShippingFeeYuan: 0,
      itemTotalCostKrw: 0,
      unitCostKrw: 0,
    }])
    setActiveTabIndex(orderItems.length)
  }

  // 탭 삭제 (상품 제거)
  const removeProductTab = (index: number) => {
    if (orderItems.length === 1) {
      alert('최소 1개의 상품은 있어야 합니다.')
      return
    }
    const newItems = orderItems.filter((_, i) => i !== index)
    setOrderItems(newItems)
    if (activeTabIndex >= newItems.length) {
      setActiveTabIndex(newItems.length - 1)
    }
  }

  // 현재 활성 아이템 업데이트
  const updateCurrentItem = (updates: Partial<OrderItem>) => {
    const newItems = [...orderItems]
    newItems[activeTabIndex] = { ...newItems[activeTabIndex], ...updates }
    setOrderItems(newItems)
  }

  const currentItem = orderItems[activeTabIndex]

  // 제품 선택 시 원가, 구매대행 수수료, 포장비 자동 계산
  useEffect(() => {
    if (currentItem.productId && currentItem.quantity) {
      const selectedProduct = products.find(p => p.id === currentItem.productId)
      if (selectedProduct) {
        const originalCost = selectedProduct.pricePerUnitYuan * currentItem.quantity
        
        // 구매대행 수수료 계산
        let serviceFee = 0
        if (originalCost < 500) {
          serviceFee = 30
        } else if (originalCost < 1000) {
          serviceFee = 50
        } else {
          serviceFee = originalCost * 0.05
        }
        
        // 포장비 계산
        const unitsPerPackage = selectedProduct.unitsPerPackage || 1
        const packagingFee = (currentItem.quantity / unitsPerPackage) * 0.3
        
        updateCurrentItem({
          originalCostYuan: originalCost,
          serviceFeeYuan: serviceFee,
          inspectionFeeYuan: originalCost * 0.02,
          packagingFeeYuan: packagingFee,
        })
      }
    }
  }, [currentItem.productId, currentItem.quantity, products, activeTabIndex])

  // 각 아이템의 총 원가 및 개당 원가 계산
  useEffect(() => {
    const newItems = orderItems.map(item => {
      const originalCostKrw = item.originalCostYuan * formData.exchangeRate
      const serviceFeeKrw = item.serviceFeeYuan * formData.exchangeRate
      const inspectionFeeKrw = item.inspectionFeeYuan * formData.exchangeRate
      const packagingFeeKrw = item.packagingFeeYuan * formData.exchangeRate
      const domesticShippingKrw = (item.domesticShippingFeeYuan || 0) * formData.exchangeRate
      
      const itemTotal = Math.round(
        originalCostKrw + serviceFeeKrw + inspectionFeeKrw + 
        packagingFeeKrw + domesticShippingKrw
      )
      
      const unitCost = item.quantity > 0 ? Math.round(itemTotal / item.quantity) : 0
      
      return { ...item, itemTotalCostKrw: itemTotal, unitCostKrw: unitCost }
    })
    
    setOrderItems(newItems)
  }, [
    orderItems.map(i => i.originalCostYuan).join(','),
    orderItems.map(i => i.serviceFeeYuan).join(','),
    orderItems.map(i => i.inspectionFeeYuan).join(','),
    orderItems.map(i => i.packagingFeeYuan).join(','),
    orderItems.map(i => i.domesticShippingFeeYuan).join(','),
    orderItems.map(i => i.quantity).join(','),
    formData.exchangeRate
  ])

  // 해외배송비 자동 계산 (모든 상품의 무게 합산)
  useEffect(() => {
    const totalWeightG = orderItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId)
      if (product) {
        return sum + (product.weightPerUnit * item.quantity)
      }
      return sum
    }, 0)
    
    const totalWeightKg = totalWeightG / 1000
    let internationalShipping = 0
    if (totalWeightKg <= 1) {
      internationalShipping = 6000
    } else {
      internationalShipping = 6000 + Math.ceil((totalWeightKg - 1) * 1600)
    }
    
    if (internationalShipping !== formData.internationalShippingFeeKrw) {
      setFormData(prev => ({ ...prev, internationalShippingFeeKrw: internationalShipping }))
    }
  }, [orderItems, products])

  // 과세가격, 관세, 부가세 자동 계산 (모든 상품의 원가 합산)
  useEffect(() => {
    const totalProductPriceYuan = orderItems.reduce((sum, item) => sum + item.originalCostYuan, 0)
    const productPriceKrw = totalProductPriceYuan * formData.exchangeRate
    const taxableAmount = Math.round(productPriceKrw)
    
    const duty = Math.round(taxableAmount * 0.08)
    const vat = Math.round((taxableAmount + duty) * 0.10)
    
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
  }, [orderItems, formData.exchangeRate])

  // 총 원가 자동 계산
  useEffect(() => {
    const itemsTotal = orderItems.reduce((sum, item) => sum + item.itemTotalCostKrw, 0)
    const totalCost = itemsTotal +
                      (formData.internationalShippingFeeKrw || 0) +
                      (formData.miscellaneousFeeKrw || 0) +
                      formData.customsFeeKrw +
                      formData.dutyKrw +
                      formData.vatKrw
    
    const roundedTotalCost = Math.round(totalCost)

    if (roundedTotalCost !== formData.totalCostKrw) {
      setFormData(prev => ({ ...prev, totalCostKrw: roundedTotalCost }))
    }
  }, [
    orderItems,
    formData.internationalShippingFeeKrw,
    formData.miscellaneousFeeKrw,
    formData.customsFeeKrw,
    formData.dutyKrw,
    formData.vatKrw
  ])

  // 발주 생성 mutation
  const createOrderMutation = useMutation({
    mutationFn: (newOrder: CreateOrderDto) => orderService.create(newOrder),
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
    mutationFn: (updatedOrder: CreateOrderDto) => orderService.update(Number(id), updatedOrder),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const orderDto: CreateOrderDto = {
      items: orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        originalCostYuan: item.originalCostYuan,
        serviceFeeYuan: item.serviceFeeYuan,
        inspectionFeeYuan: item.inspectionFeeYuan,
        packagingFeeYuan: item.packagingFeeYuan,
        domesticShippingFeeYuan: item.domesticShippingFeeYuan || 0,
        itemTotalCostKrw: item.itemTotalCostKrw,
        unitCostKrw: item.unitCostKrw,
      })),
      exchangeRate: formData.exchangeRate,
      internationalShippingFeeKrw: formData.internationalShippingFeeKrw,
      miscellaneousFeeKrw: formData.miscellaneousFeeKrw,
      customsFeeKrw: formData.customsFeeKrw,
      taxableAmountKrw: formData.taxableAmountKrw,
      dutyKrw: formData.dutyKrw,
      vatKrw: formData.vatKrw,
      totalCostKrw: formData.totalCostKrw,
      orderDate: formData.orderDate,
    }
    
    if (isEditMode) {
      updateOrderMutation.mutate(orderDto)
    } else {
      createOrderMutation.mutate(orderDto)
    }
  }

  const handleDelete = () => {
    if (window.confirm('정말로 이 발주를 삭제하시겠습니까?')) {
      deleteOrderMutation.mutate()
    }
  }

  const isPending = createOrderMutation.isPending || updateOrderMutation.isPending

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
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
            {/* 상품 탭 */}
            <div className="border rounded-md p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">상품 목록</h3>
                <Button type="button" onClick={addProductTab} variant="outline" size="sm">
                  + 상품 추가
                </Button>
              </div>
              
              {/* 탭 헤더 */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {orderItems.map((item, index) => {
                  const product = products.find(p => p.id === item.productId)
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-2 px-4 py-2 rounded-t-md cursor-pointer transition-colors ${
                        activeTabIndex === index
                          ? 'bg-white border-2 border-b-0 border-blue-500 font-semibold'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      onClick={() => setActiveTabIndex(index)}
                    >
                      <span>{product?.name || `상품 ${index + 1}`}</span>
                      {orderItems.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeProductTab(index)
                          }}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* 1차 결제 - 상품별 비용 */}
              <div className="bg-white border-2 border-blue-500 rounded-b-md rounded-tr-md p-4 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-bold border border-blue-200">
                    1차 결제
                  </span>
                  <span className="text-sm text-gray-600">상품 매입 및 중국 내 이동 (상품별)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`product-${activeTabIndex}`}>제품</Label>
                    <select
                      id={`product-${activeTabIndex}`}
                      className="w-full border border-input rounded-md h-10 px-3"
                      value={currentItem.productId}
                      onChange={(e) => updateCurrentItem({ productId: Number(e.target.value) })}
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
                    <Label htmlFor={`quantity-${activeTabIndex}`}>수량</Label>
                    <Input
                      id={`quantity-${activeTabIndex}`}
                      type="number"
                      min="1"
                      value={currentItem.quantity || ''}
                      onChange={(e) => updateCurrentItem({ quantity: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>원가 (위안) - 자동계산</Label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                      {currentItem.originalCostYuan.toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>구매대행 수수료 (위안) - 자동계산</Label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                      {currentItem.serviceFeeYuan.toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`inspection-${activeTabIndex}`}>검품비 (위안)</Label>
                    <Input
                      id={`inspection-${activeTabIndex}`}
                      type="number"
                      step="0.01"
                      value={currentItem.inspectionFeeYuan}
                      onChange={(e) => updateCurrentItem({ inspectionFeeYuan: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>포장비 (위안) - 자동계산</Label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                      {currentItem.packagingFeeYuan.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`domestic-shipping-${activeTabIndex}`}>중국내 배송비 (위안)</Label>
                    <Input
                      id={`domestic-shipping-${activeTabIndex}`}
                      type="number"
                      step="0.01"
                      value={currentItem.domesticShippingFeeYuan || ''}
                      onChange={(e) => updateCurrentItem({ domesticShippingFeeYuan: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded border mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">이 상품의 총 원가:</span>
                      <span className="text-xl font-bold text-blue-600">
                        {currentItem.itemTotalCostKrw.toLocaleString()}원
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">개당 원가:</span>
                      <span className="text-xl font-bold text-green-600">
                        {currentItem.unitCostKrw.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="border p-4 rounded-md">
              <h3 className="font-semibold text-lg mb-4">기본 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* 2차 결제 - 전체 합산 비용 */}
            <div className="border p-4 rounded-md bg-green-50/50">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-bold border border-green-200">
                  2차 결제
                </span>
                <span className="text-sm text-gray-600">국제 배송 및 통관 (전체 합산)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="internationalShipping">해외 배송비 (원) - 자동계산/수정가능</Label>
                  <Input
                    id="internationalShipping"
                    type="number"
                    value={formData.internationalShippingFeeKrw || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, internationalShippingFeeKrw: Number(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    전체 무게 기준 자동 계산
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="miscellaneous">기타 비용 (원)</Label>
                  <Input
                    id="miscellaneous"
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customs">통관비 (원)</Label>
                  <Input
                    id="customs"
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
                </div>

                <div className="space-y-2">
                  <Label>부가세 (원) - 자동계산</Label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                    {formData.vatKrw.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* 총 원가 표시 */}
            <div className="border-2 border-blue-600 p-4 rounded-md bg-blue-50">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">전체 발주 총 원가</h3>
                <div className="text-3xl font-bold text-blue-600">
                  {formData.totalCostKrw.toLocaleString()}원
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                = 모든 상품 원가 ({orderItems.reduce((sum, item) => sum + item.itemTotalCostKrw, 0).toLocaleString()}원) 
                + 2차 결제 ({(formData.internationalShippingFeeKrw + formData.miscellaneousFeeKrw + formData.customsFeeKrw + formData.dutyKrw + formData.vatKrw).toLocaleString()}원)
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
