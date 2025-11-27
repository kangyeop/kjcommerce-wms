import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { productService } from '@/services'

interface ProductWithOrders {
  id: number
  name: string
  pricePerUnitYuan: number
  weightPerUnit: number
  productUrl?: string
  options?: string
  unitsPerPackage: number
  orders?: Array<{
    id: number
    quantity: number
    totalCostKrw: number
    sellingPriceKrw: number
    orderDate: string
  }>
}

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // 제품 상세 조회 (발주 포함)
  const { data: product, isLoading } = useQuery<ProductWithOrders>({
    queryKey: ['product', id, 'withOrders'],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3000/api/products/${id}?includeOrders=true`)
      if (!response.ok) throw new Error('Failed to fetch product')
      return response.json()
    },
    enabled: !!id
  })

  // 제품 삭제 뮤테이션
  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      navigate('/products')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || '제품 삭제 중 오류가 발생했습니다.'
      alert(errorMessage)
    },
  })

  const handleDelete = () => {
    if (window.confirm('정말로 이 제품을 삭제하시겠습니까?')) {
      deleteProductMutation.mutate(Number(id))
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-muted-foreground">제품을 찾을 수 없습니다.</p>
      </div>
    )
  }

  const hasOrders = product.orders && product.orders.length > 0

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">제품 상세</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/products')}>
            목록으로
          </Button>
          <Button onClick={() => navigate(`/products/${id}/edit`)}>
            수정
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={hasOrders}
          >
            삭제
          </Button>
        </div>
      </div>

      {/* 제품 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>제품 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">제품명</p>
              <p className="text-lg font-semibold">{product.name}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">개당 가격</p>
              <p className="text-lg font-semibold">{product.pricePerUnitYuan.toLocaleString()} 위안</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">개당 무게</p>
              <p className="text-lg font-semibold">{product.weightPerUnit.toLocaleString()} g</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">묶음 판매 수량</p>
              <p className="text-lg font-semibold">{product.unitsPerPackage || 1}개</p>
            </div>
            
            {product.productUrl && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">상품 URL</p>
                <a 
                  href={product.productUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {product.productUrl}
                </a>
              </div>
            )}
            
            {product.options && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">옵션 정보</p>
                <p className="whitespace-pre-wrap">{product.options}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 관련 발주 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>관련 발주 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasOrders ? (
            <p className="text-center text-muted-foreground py-6">관련 발주가 없습니다.</p>
          ) : (
            <div className="border rounded-md overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">발주일</th>
                    <th className="px-4 py-3 text-right font-medium">수량</th>
                    <th className="px-4 py-3 text-right font-medium">총 원가</th>
                    <th className="px-4 py-3 text-right font-medium">판매가격</th>
                  </tr>
                </thead>
                <tbody>
                  {product.orders!.map((order) => (
                    <tr 
                      key={order.id} 
                      className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <td className="px-4 py-3">{new Date(order.orderDate).toLocaleDateString('ko-KR')}</td>
                      <td className="px-4 py-3 text-right">{order.quantity.toLocaleString()}개</td>
                      <td className="px-4 py-3 text-right">{order.totalCostKrw.toLocaleString()}원</td>
                      <td className="px-4 py-3 text-right">
                        {order.sellingPriceKrw ? `${order.sellingPriceKrw.toLocaleString()}원` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {hasOrders && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ 이 제품은 {product.orders!.length}개의 발주에서 사용 중이므로 삭제할 수 없습니다.
          </p>
        </div>
      )}
    </div>
  )
}

export default ProductDetailPage
