import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { productService } from '@/services'
import { Product } from '@/types'

const ProductListPage = () => {
  const navigate = useNavigate()

  // 제품 목록 조회
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: productService.getAll
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">제품 관리</h1>
        <Button onClick={() => navigate('/products/new')}>
          제품 추가
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>제품 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">등록된 제품이 없습니다.</p>
          ) : (
            <div className="border rounded-md overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">제품명</th>
                    <th className="px-4 py-3 text-right font-medium">개당 가격</th>
                    <th className="px-4 py-3 text-right font-medium">개당 무게</th>
                    <th className="px-4 py-3 text-center font-medium">묶음 수량</th>
                    <th className="px-4 py-3 text-left font-medium">상품 URL</th>
                    <th className="px-4 py-3 text-left font-medium">옵션</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr 
                      key={product.id} 
                      className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3 text-right">{product.pricePerUnitYuan.toLocaleString()} 위안</td>
                      <td className="px-4 py-3 text-right">{product.weightPerUnit.toLocaleString()} g</td>
                      <td className="px-4 py-3 text-center">{product.unitsPerPackage || 1}개</td>
                      <td className="px-4 py-3">
                        {product.productUrl ? (
                          <a 
                            href={product.productUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            링크 보기
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {product.options ? (
                          <span className="text-sm">{product.options}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
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

export default ProductListPage
