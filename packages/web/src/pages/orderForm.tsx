import { useState, useEffect, useCallback, FC } from 'react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { orderService, productService } from '@/services'
import { CreateOrderDto, Product } from '@/types'
import { useOrderCalculations, OrderItemInput, OrderGlobalInput } from '@/hooks/useOrderCalculations'
import { OrderProductTab } from '@/components/orders/OrderProductTab'
import { OrderSummary } from '@/components/orders/OrderSummary'

export const OrderFormPage: FC = () => {
  const params = useParams({ strict: false })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const id = params.id
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

  // 발주 아이템들 (입력값만 관리)
  const [items, setItems] = useState<OrderItemInput[]>([
    {
      productId: 0,
      quantity: 0,
      inspectionFeeYuan: 0,
      domesticShippingFeeYuan: 0,
    }
  ])

  // 전체 발주 공통 데이터 (입력값만 관리)
  const [formData, setFormData] = useState<OrderGlobalInput & { orderDate: string }>({
    exchangeRate: 180,
    internationalShippingFeeKrw: 0,
    miscellaneousFeeKrw: 0,
    customsFeeKrw: 22000,
    orderDate: new Date().toISOString().split('T')[0]
  })

  // 계산 로직 Hook 사용
  const { enrichedItems, totals } = useOrderCalculations(items, products, formData)

  // 기존 데이터 로드
  useEffect(() => {
    if (existingOrder) {
      const loadedItems = existingOrder.items && existingOrder.items.length > 0
        ? existingOrder.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            inspectionFeeYuan: item.inspectionFeeYuan,
            domesticShippingFeeYuan: item.domesticShippingFeeYuan || 0
          }))
        : [{
            productId: 0,
            quantity: 0,
            inspectionFeeYuan: 0,
            domesticShippingFeeYuan: 0,
          }]
      
      setItems(loadedItems)
      setFormData({
        exchangeRate: existingOrder.exchangeRate,
        internationalShippingFeeKrw: existingOrder.internationalShippingFeeKrw || 0,
        miscellaneousFeeKrw: existingOrder.miscellaneousFeeKrw || 0,
        customsFeeKrw: existingOrder.customsFeeKrw,
        orderDate: existingOrder.orderDate
      })
    }
  }, [existingOrder])

  // 해외배송비 자동 계산 업데이트 (계산된 값이 변경될 때만 업데이트하여 수동 수정 허용)
  useEffect(() => {
    setFormData(prev => ({ ...prev, internationalShippingFeeKrw: totals.calculatedInternationalShippingFee }))
  }, [totals.calculatedInternationalShippingFee])

  // 탭 추가 (새 상품 추가)
  const addProductTab = useCallback(() => {
    setItems(prev => [...prev, {
      productId: 0,
      quantity: 0,
      inspectionFeeYuan: 0,
      domesticShippingFeeYuan: 0,
    }])
    setActiveTabIndex(items.length)
  }, [items.length])

  // 탭 삭제 (상품 제거)
  const removeProductTab = useCallback((index: number) => {
    if (items.length === 1) {
      toast.error('최소 1개의 상품은 있어야 합니다.')
      return
    }
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    if (activeTabIndex >= newItems.length) {
      setActiveTabIndex(newItems.length - 1)
    }
  }, [items, activeTabIndex])

  // 아이템 업데이트
  const updateItem = useCallback((index: number, updates: Partial<OrderItemInput>) => {
    setItems(prev => {
      const newItems = [...prev]
      newItems[index] = { ...newItems[index], ...updates }
      return newItems
    })
  }, [])

  // 발주 생성 mutation
  const createOrderMutation = useMutation({
    mutationFn: (newOrder: CreateOrderDto) => orderService.create(newOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      navigate({ to: '/orders' })
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || '발주 등록 중 오류가 발생했습니다.'
      toast.error(errorMessage)
    }
  })

  // 발주 수정 mutation
  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, data }: { orderId: number, data: CreateOrderDto }) => {
      if (!orderId) throw new Error('Order ID is missing')
      return orderService.update(orderId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', id] })
      navigate({ to: '/orders' })
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || '발주 수정 중 오류가 발생했습니다.'
      toast.error(errorMessage)
    }
  })

  // 발주 삭제 mutation
  const deleteOrderMutation = useMutation({
    mutationFn: () => orderService.delete(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      navigate({ to: '/orders' })
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || '발주 삭제 중 오류가 발생했습니다.'
      toast.error(errorMessage)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const orderDto: CreateOrderDto = {
      items: enrichedItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        originalCostYuan: item.originalCostYuan,
        serviceFeeYuan: item.serviceFeeYuan,
        inspectionFeeYuan: item.inspectionFeeYuan,
        packagingFeeYuan: item.packagingFeeYuan,
        domesticShippingFeeYuan: item.domesticShippingFeeYuan,
        itemTotalCostKrw: item.itemTotalCostKrw,
        unitCostKrw: item.unitCostKrw,
      })),
      exchangeRate: formData.exchangeRate,
      internationalShippingFeeKrw: formData.internationalShippingFeeKrw,
      miscellaneousFeeKrw: formData.miscellaneousFeeKrw,
      customsFeeKrw: formData.customsFeeKrw,
      taxableAmountKrw: totals.taxableAmountKrw,
      dutyKrw: totals.dutyKrw,
      vatKrw: totals.vatKrw,
      totalCostKrw: totals.totalCostKrw,
      orderDate: formData.orderDate,
    }
    
    if (isEditMode && id) {
      updateOrderMutation.mutate({ orderId: Number(id), data: orderDto })
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
    <div className="mx-auto space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{isEditMode ? '발주 수정' : '새 발주 등록'}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate({ to: '/orders' })}>
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
            <div className="p-4 rounded-md border bg-slate-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">상품 목록</h3>
                <Button type="button" onClick={addProductTab} variant="outline" size="sm">
                  + 상품 추가
                </Button>
              </div>
              
              {/* 탭 헤더 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {items.map((item, index) => {
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
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeProductTab(index)
                          }}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* 현재 활성 탭 내용 */}
              <OrderProductTab 
                item={enrichedItems[activeTabIndex]}
                products={products}
                index={activeTabIndex}
                onUpdate={(updates) => updateItem(activeTabIndex, updates)}
              />
            </div>

            {/* 기본 정보 */}
            <div className="p-4 rounded-md border">
              <h3 className="mb-4 text-lg font-semibold">기본 정보</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

            {/* 주문 요약 및 합계 */}
            <OrderSummary 
              formData={formData}
              totals={totals}
              onUpdate={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
            />

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate({ to: '/orders' })}>
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
