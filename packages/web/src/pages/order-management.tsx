import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { orderService, productService } from '@/services'
import { Order, CreateOrderDto, Product } from '@/types'

const OrderManagementPage = () => {
  const queryClient = useQueryClient()
  
  // 제품 목록 조회
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: productService.getAll
  })
  
  // 발주 목록 조회
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: orderService.getAll
  })
  
  // 발주 생성 mutation
  const createOrderMutation = useMutation({
    mutationFn: orderService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      resetForm()
    }
  })
  
  // 발주 삭제 mutation
  const deleteOrderMutation = useMutation({
    mutationFn: orderService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
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
    roas: 20,
    actualShippingFeeKrw: 3000,
    marketplaceCommissionRate: 10,
    orderDate: new Date().toISOString().split('T')[0]
  })
  
  const resetForm = () => {
    setFormData({
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
      roas: 20,
      actualShippingFeeKrw: 3000,
      marketplaceCommissionRate: 10,
      orderDate: new Date().toISOString().split('T')[0]
    })
  }
  
  // 제품 선택 시 원가 및 구매대행 수수료 자동 계산
  useEffect(() => {
    if (formData.productId && formData.quantity) {
      const selectedProduct = products.find(p => p.id === formData.productId)
      if (selectedProduct) {
        const originalCost = selectedProduct.pricePerUnitYuan * formData.quantity
        
        // 구매대행 수수료 계산
        let serviceFee = 0
        if (originalCost < 500) {
          serviceFee = 30
        } else if (originalCost < 1000) {
          serviceFee = 50
        } else {
          serviceFee = originalCost * 0.05
        }
        
        setFormData(prev => ({
          ...prev,
          originalCostYuan: originalCost,
          serviceFeeYuan: serviceFee,
          inspectionFeeYuan: originalCost * 0.02, // 검품비 2%
          packagingFeeYuan: 0.3 // 포장비 고정
        }))
      }
    }
  }, [formData.productId, formData.quantity, products])
  
  // 과세가격, 관세, 부가세 자동 계산
  useEffect(() => {
    const productPriceKrw = formData.originalCostYuan * formData.exchangeRate
    const taxableShipping = formData.shippingFeeKrw
    const taxableAmount = Math.round(productPriceKrw + taxableShipping)
    
    const duty = Math.round(taxableAmount * 0.08)
    const vat = Math.round((taxableAmount + duty) * 0.10)
    
    setFormData(prev => ({
      ...prev,
      taxableAmountKrw: taxableAmount,
      dutyKrw: duty,
      vatKrw: vat
    }))
  }, [formData.originalCostYuan, formData.exchangeRate, formData.shippingFeeKrw])
  
  // 총 원가 자동 계산
  useEffect(() => {
    const originalCostKrw = formData.originalCostYuan * formData.exchangeRate
    const serviceFeeKrw = formData.serviceFeeYuan * formData.exchangeRate
    const inspectionFeeKrw = formData.inspectionFeeYuan * formData.exchangeRate
    const packagingFeeKrw = formData.packagingFeeYuan * formData.exchangeRate
    
    const totalCost = originalCostKrw + serviceFeeKrw + inspectionFeeKrw + packagingFeeKrw +
                      formData.shippingFeeKrw + formData.customsFeeKrw + 
                      formData.dutyKrw + formData.vatKrw
    
    setFormData(prev => ({
      ...prev,
      totalCostKrw: Math.round(totalCost)
    }))
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
    createOrderMutation.mutate(formData)
  }
  
  const handleDelete = (id: number) => {
    if (confirm('정말 이 발주를 삭제하시겠습니까?')) {
      deleteOrderMutation.mutate(id)
    }
  }
  
  // 판매가격 계산 (묶음 판매 고려)
  const calculateSellingPrice = (
    totalCost: number, 
    marginRate: number, 
    roas: number,
    actualShippingFee: number,
    marketplaceCommissionRate: number,
    unitsPerPackage: number,
    quantity: number
  ) => {
    if (quantity === 0 || unitsPerPackage === 0) return 0
    
    const costPerPackage = totalCost / (quantity / unitsPerPackage)
    const desiredMargin = costPerPackage * (marginRate / 100)
    
    const roasDecimal = roas / 100
    const commissionDecimal = marketplaceCommissionRate / 100
    
    const numerator = costPerPackage + desiredMargin + actualShippingFee
    const denominator = 1 - commissionDecimal - roasDecimal
    
    if (denominator <= 0) return 0
    
    return Math.round(numerator / denominator)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">발주 관리</h1>

      {/* 발주 등록 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>새 발주 등록</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 제품 선택 */}
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

              {/* 수량 */}
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

              {/* 환율 */}
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

              {/* 원가 (자동 계산) */}
              <div className="space-y-2">
                <Label>원가 (위안) - 자동계산</Label>
                <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                  {formData.originalCostYuan.toLocaleString()}
                </div>
              </div>

              {/* 구매대행 수수료 (자동 계산) */}
              <div className="space-y-2">
                <Label>구매대행 수수료 (위안) - 자동계산</Label>
                <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                  {formData.serviceFeeYuan.toLocaleString()}
                </div>
              </div>

              {/* 배송비 */}
              <div className="space-y-2">
                <Label htmlFor="shippingFeeKrw">배송비 (원)</Label>
                <Input
                  id="shippingFeeKrw"
                  type="number"
                  value={formData.shippingFeeKrw}
                  onChange={(e) => setFormData(prev => ({ ...prev, shippingFeeKrw: Number(e.target.value) }))}
                />
              </div>

              {/* 과세가격 (자동 계산) */}
              <div className="space-y-2">
                <Label>과세가격 (원) - 자동계산</Label>
                <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                  {formData.taxableAmountKrw.toLocaleString()}
                </div>
              </div>

              {/* 관세 (자동 계산) */}
              <div className="space-y-2">
                <Label>관세 (원) - 자동계산</Label>
                <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                  {formData.dutyKrw.toLocaleString()}
                </div>
              </div>

              {/* 부가세 (자동 계산) */}
              <div className="space-y-2">
                <Label>부가세 (원) - 자동계산</Label>
                <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                  {formData.vatKrw.toLocaleString()}
                </div>
              </div>

              {/* 총 원가 (자동 계산) */}
              <div className="space-y-2">
                <Label>총 원가 (원) - 자동계산</Label>
                <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-semibold">
                  {formData.totalCostKrw.toLocaleString()}
                </div>
              </div>

              {/* 마진율 */}
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

              {/* 판매가격 (자동 계산) */}
              <div className="space-y-2">
                <Label>판매가격 (묶음당, 원) - 자동계산</Label>
                <div className="flex h-10 w-full rounded-md border-2 border-primary bg-primary/5 px-3 py-2 text-sm font-bold text-primary">
                  {(() => {
                    const selectedProduct = products.find(p => p.id === formData.productId)
                    const unitsPerPackage = selectedProduct?.unitsPerPackage || 1
                    return calculateSellingPrice(
                      formData.totalCostKrw, 
                      formData.marginRate || 0,
                      formData.roas || 0,
                      formData.actualShippingFeeKrw || 0,
                      formData.marketplaceCommissionRate || 0,
                      unitsPerPackage,
                      formData.quantity
                    ).toLocaleString()
                  })()}
                </div>
              </div>

              {/* 발주일 */}
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

            <div className="flex gap-2">
              <Button type="submit" disabled={createOrderMutation.isPending}>
                {createOrderMutation.isPending ? '등록 중...' : '발주 등록'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                초기화
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 발주 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>발주 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>로딩 중...</p>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground">등록된 발주가 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">제품</th>
                    <th className="text-right p-2">수량</th>
                    <th className="text-right p-2">총 원가</th>
                    <th className="text-right p-2">마진율</th>
                    <th className="text-right p-2">판매가격</th>
                    <th className="text-right p-2">예상 이익</th>
                    <th className="text-left p-2">발주일</th>
                    <th className="text-center p-2">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{order.id}</td>
                      <td className="p-2">{order.product?.name || '-'}</td>
                      <td className="text-right p-2">{order.quantity.toLocaleString()}</td>
                      <td className="text-right p-2">{order.totalCostKrw.toLocaleString()}원</td>
                      <td className="text-right p-2">{order.marginRate}%</td>
                      <td className="text-right p-2 font-semibold text-primary">
                        {order.sellingPriceKrw.toLocaleString()}원
                      </td>
                      <td className="text-right p-2 font-semibold text-green-600">
                        {(order.sellingPriceKrw - order.totalCostKrw).toLocaleString()}원
                      </td>
                      <td className="p-2">{order.orderDate}</td>
                      <td className="text-center p-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(order.id)}
                          disabled={deleteOrderMutation.isPending}
                        >
                          삭제
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default OrderManagementPage
