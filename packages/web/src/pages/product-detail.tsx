import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { productService } from '@/services';
import { Product } from '@/types';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 제품 상세 조회
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => productService.getById(Number(id)),
    enabled: !!id,
  });

  // 제품 삭제 mutation
  const deleteProductMutation = useMutation({
    mutationFn: productService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/products');
    },
    onError: () => {
      alert('제품 삭제 중 오류가 발생했습니다.');
    }
  });

  const handleDelete = () => {
    if (confirm('정말 이 제품을 삭제하시겠습니까?')) {
      deleteProductMutation.mutate(Number(id));
    }
  };

  if (isLoading) return <p>로딩 중...</p>;
  if (!product) return <p>제품을 찾을 수 없습니다.</p>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">제품 상세 정보</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/products')}>
            목록으로
          </Button>
          <Button variant="outline" onClick={() => navigate(`/products/${id}/edit`)}>
            수정
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteProductMutation.isPending}
          >
            삭제
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-500">기본 정보</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between border-b pb-2">
                    <span>개당 가격</span>
                    <span className="font-medium">{product.pricePerUnitYuan.toLocaleString()} 위안</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span>개당 무게</span>
                    <span className="font-medium">{product.weightPerUnit.toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span>개당 부피</span>
                    <span className="font-medium">{product.cbmPerUnit ? product.cbmPerUnit.toLocaleString() : '-'} CBM</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span>묶음 수량</span>
                    <span className="font-medium">{product.unitsPerPackage || 1} 개</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-500">추가 정보</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex flex-col border-b pb-2">
                    <span className="mb-1">상품 URL</span>
                    {product.productUrl ? (
                      <a 
                        href={product.productUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        {product.productUrl}
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                  <div className="flex flex-col border-b pb-2">
                    <span className="mb-1">옵션</span>
                    <span className="whitespace-pre-wrap">{product.options || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDetailPage;
