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
    shippingFeeKrw: 0,
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
        shippingFeeKrw: existingOrder.shippingFeeKrw,
        customsFeeKrw: existingOrder.customsFeeKrw,
        taxableAmountKrw: existingOrder.taxableAmountKrw,
        dutyKrw: existingOrder.dutyKrw,
        vatKrw: existingOrder.vatKrw,
        totalCostKrw: existingOrder.totalCostKrw,
        marginRate: existingOrder.marginRate,
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

  // 제품 선택 시 원가 자동 계산 (신규 등록일 때만, 혹은 제품/수량이 변경될 때)
  useEffect(() => {
    if (formData.productId && formData.quantity) {
      // 기존 데이터 로딩 직후에는 자동 계산 방지 (사용자가 입력한 값을 덮어쓰지 않도록 주의)
      // 하지만 여기서는 "다시 계산해서 업데이트"가 목적이므로 항상 계산 로직을 수행하는 것이 맞을 수 있음
      // 다만, 수정 모드에서 초기 로딩 시에는 계산을 건너뛰거나, 
      // 사용자가 값을 변경했을 때만 계산하도록 하는 것이 UX상 좋음.
      // 여기서는 간단하게 제품/수량이 변경되면 무조건 재계산하도록 함.
      
      const selectedProduct = products.find(p => p.id === formData.productId)
      if (selectedProduct) {
        const originalCost = selectedProduct.pricePerUnitYuan * formData.quantity
        
        // 값이 실제로 변경되었을 때만 업데이트 (무한 루프 방지 및 불필요한 렌더링 방지)
        if (originalCost !== formData.originalCostYuan) {
             setFormData(prev => ({
              ...prev,
              originalCostYuan: originalCost,
              inspectionFeeYuan: originalCost * 0.02, // 검품비 2%
              packagingFeeYuan: 0.3 // 포장비 고정
            }))
        }
      }
    }
  }, [formData.productId, formData.quantity, products])

  // 총 원가 자동 계산
  useEffect(() => {
    const originalCostKrw = formData.originalCostYuan * formData.exchangeRate
    const serviceFeeKrw = formData.serviceFeeYuan * formData.exchangeRate
    const inspectionFeeKrw = formData.inspectionFeeYuan * formData.exchangeRate
    const packagingFeeKrw = formData.packagingFeeYuan * formData.exchangeRate
    
    const totalCost = originalCostKrw + serviceFeeKrw + inspectionFeeKrw + packagingFeeKrw +
                      formData.shippingFeeKrw + formData.customsFeeKrw + 
                      formData.dutyKrw + formData.vatKrw
    
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

  // 판매가격 계산
  const calculateSellingPrice = (totalCost: number, marginRate: number) => {
    return Math.round(totalCost + (totalCost * marginRate / 100))
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
                        {product.name} - {product.pricePerUnitYuan}위안
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
                  <Label htmlFor="serviceFeeYuan">서비스 수수료 (위안)</Label>
                  <Input
                    id="serviceFeeYuan"
                    type="number"
                    step="0.01"
                    value={formData.serviceFeeYuan}
                    onChange={(e) => setFormData(prev => ({ ...prev, serviceFeeYuan: Number(e.target.value) }))}
                  />
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
                  <Label htmlFor="packagingFeeYuan">포장비 (위안)</Label>
                  <Input
                    id="packagingFeeYuan"
                    type="number"
                    step="0.01"
                    value={formData.packagingFeeYuan}
                    onChange={(e) => setFormData(prev => ({ ...prev, packagingFeeYuan: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippingFeeKrw">배송비 (원)</Label>
                  <Input
                    id="shippingFeeKrw"
                    type="number"
                    value={formData.shippingFeeKrw}
                    onChange={(e) => setFormData(prev => ({ ...prev, shippingFeeKrw: Number(e.target.value) }))}
                  />
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
                  <Label htmlFor="dutyKrw">관세 (원)</Label>
                  <Input
                    id="dutyKrw"
                    type="number"
                    value={formData.dutyKrw}
                    onChange={(e) => setFormData(prev => ({ ...prev, dutyKrw: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatKrw">부가세 (원)</Label>
                  <Input
                    id="vatKrw"
                    type="number"
                    value={formData.vatKrw}
                    onChange={(e) => setFormData(prev => ({ ...prev, vatKrw: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>

            {/* 결과 섹션 */}
            <div className="border p-4 rounded-md bg-muted/20">
              <h3 className="font-semibold text-lg mb-4">최종 계산 결과</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label>판매가격 (원)</Label>
                  <div className="flex h-10 w-full rounded-md border-2 border-primary bg-primary/5 px-3 py-2 text-lg font-bold text-primary">
                    {calculateSellingPrice(formData.totalCostKrw, formData.marginRate || 0).toLocaleString()}
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
