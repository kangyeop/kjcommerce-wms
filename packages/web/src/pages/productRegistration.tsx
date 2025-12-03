import { useState, FC } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { productService } from '@/services';
import { Product } from '@/types';

// 로컬 타입 정의는 전역 타입을 사용하기 때문에 제거

export const ProductRegistrationPage: FC = () => {
  const queryClient = useQueryClient();

  // 제품 목록 조회 쿼리
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: productService.getAll,
  });

  // 제품 생성 뮤테이션
  const createProductMutation = useMutation({
    mutationFn: (newProduct: {
      name: string;
      pricePerUnitYuan: number;
      weightPerUnit: number;
      cbmPerUnit: number;
      productUrl?: string;
      options?: string;
      unitsPerPackage: number;
      coupangShippingFee: number;
      sellingPriceKrw?: number;
    }) => productService.create(newProduct),
    onSuccess: () => {
      // 제품 생성 성공 시 제품 목록 재조회
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // 폼 초기화
      setFormData({
        name: '',
        pricePerUnitYuan: '',
        weightPerUnit: '',
        cbmPerUnit: '',
        productUrl: '',
        options: '',
        unitsPerPackage: '1',
        coupangShippingFee: '',
        sellingPriceKrw: '',
      });
    },
  });

  // 제품 수정 뮤테이션
  const updateProductMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        name: string;
        pricePerUnitYuan: number;
        weightPerUnit: number;
        cbmPerUnit: number;
        productUrl?: string;
        options?: string;
        unitsPerPackage: number;
        coupangShippingFee: number;
        sellingPriceKrw?: number;
      };
    }) => productService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingProduct(null);
      setFormData({
        name: '',
        pricePerUnitYuan: '',
        weightPerUnit: '',
        cbmPerUnit: '', // Added cbmPerUnit
        productUrl: '',
        options: '',
        unitsPerPackage: '1',
        coupangShippingFee: '',
        sellingPriceKrw: '',
      });
    },
  });

  // 제품 삭제 뮤테이션
  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const [formData, setFormData] = useState({
    name: '',
    pricePerUnitYuan: '', // Changed to string
    weightPerUnit: '', // Changed to string
    cbmPerUnit: '', // Changed to string
    productUrl: '',
    options: '',
    unitsPerPackage: '1',
    coupangShippingFee: '',
    sellingPriceKrw: '',
  });

  const [editingProduct, setEditingProduct] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.pricePerUnitYuan || !formData.weightPerUnit) {
      return;
    }

    const productData = {
      name: formData.name,
      pricePerUnitYuan: parseFloat(formData.pricePerUnitYuan),
      weightPerUnit: parseFloat(formData.weightPerUnit),
      cbmPerUnit: parseFloat(formData.cbmPerUnit) || 0,
      unitsPerPackage: parseInt(formData.unitsPerPackage || '1'), // Ensure default '1' if empty string
      coupangShippingFee: parseInt(formData.coupangShippingFee || '0') || 0,
      ...(formData.productUrl && { productUrl: formData.productUrl }),
      ...(formData.options && { options: formData.options }),
      ...(formData.sellingPriceKrw && { sellingPriceKrw: parseFloat(formData.sellingPriceKrw) }),
    };

    if (editingProduct) {
      // 수정 모드
      updateProductMutation.mutate({ id: editingProduct, data: productData });
    } else {
      // 생성 모드
      createProductMutation.mutate(productData);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product.id);
    setFormData({
      name: product.name,
      pricePerUnitYuan: product.pricePerUnitYuan.toString(),
      weightPerUnit: product.weightPerUnit.toString(),
      cbmPerUnit: (product.cbmPerUnit || 0).toString(), // Added cbmPerUnit
      productUrl: product.productUrl || '',
      options: product.options || '',
      unitsPerPackage: (product.unitsPerPackage || 1).toString(),
      coupangShippingFee: (product.coupangShippingFee || 0).toString(),
      sellingPriceKrw: (product.sellingPriceKrw || '').toString(),
    });
    // 폼으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      pricePerUnitYuan: '',
      weightPerUnit: '',
      cbmPerUnit: '',
      productUrl: '',
      options: '',
      unitsPerPackage: '1',
      coupangShippingFee: '',
      sellingPriceKrw: '',
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('정말로 이 제품을 삭제하시겠습니까?')) {
      deleteProductMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">물류 등록 정보</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{editingProduct ? '제품 정보 수정' : '제품 정보 등록'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">제품명</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="제품명을 입력하세요"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerUnitYuan">개당 가격 (위안)</Label>
                <Input
                  id="pricePerUnitYuan"
                  name="pricePerUnitYuan"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.pricePerUnitYuan}
                  onChange={handleChange}
                  placeholder="개당 가격을 입력하세요 (위안)"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weightPerUnit">개당 무게 (g)</Label>
                <Input
                  id="weightPerUnit"
                  name="weightPerUnit" // Added name attribute
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.weightPerUnit}
                  onChange={handleChange} // Changed to use handleChange
                  placeholder="개당 무게를 입력하세요 (g)" // Added placeholder
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cbmPerUnit">개당 부피 (CBM)</Label>
                <Input
                  id="cbmPerUnit"
                  name="cbmPerUnit" // Added name attribute
                  type="number"
                  min="0"
                  step="0.000001"
                  value={formData.cbmPerUnit}
                  onChange={handleChange} // Changed to use handleChange
                  placeholder="개당 부피를 입력하세요 (CBM)" // Added placeholder
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productUrl">상품 URL</Label>
                <Input
                  id="productUrl"
                  name="productUrl"
                  type="url"
                  value={formData.productUrl}
                  onChange={handleChange}
                  placeholder="상품 원본 URL을 입력하세요 (선택사항)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="options">옵션 정보</Label>
                <textarea
                  id="options"
                  name="options"
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.options}
                  onChange={handleChange}
                  placeholder="옵션 정보를 입력하세요 (예: 색상: 블랙, 사이즈: L)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitsPerPackage">묶음 판매 수량</Label>
                <Input
                  id="unitsPerPackage"
                  name="unitsPerPackage"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.unitsPerPackage}
                  onChange={handleChange}
                  placeholder="묶음으로 판매할 개수 (기본: 1개)"
                  required
                />
                <p className="text-xs text-muted-foreground">예: 2개 묶음으로 판매하면 2 입력</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coupangShippingFee">쿠팡 배송비 (원)</Label>
                <Input
                  id="coupangShippingFee"
                  name="coupangShippingFee"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.coupangShippingFee}
                  onChange={handleChange}
                  placeholder="쿠팡 배송비 (기본: 0원)"
                />
                <p className="text-xs text-muted-foreground">쿠팡 로켓배송 등 배송비</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sellingPriceKrw">판매가격 (원)</Label>
                <Input
                  id="sellingPriceKrw"
                  name="sellingPriceKrw"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.sellingPriceKrw}
                  onChange={handleChange}
                  placeholder="판매가격 (선택사항)"
                />
                <p className="text-xs text-muted-foreground">기본 판매가격 (가격 계산기에서 자동으로 설정됨)</p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingProduct ? '수정하기' : '등록하기'}
                </Button>
                {editingProduct && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    취소
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>등록된 제품 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">등록된 제품이 없습니다.</p>
            ) : (
              <div className="border rounded-md overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">제품명</th>
                      <th className="px-4 py-2 text-right">개당 가격 (위안)</th>
                      <th className="px-4 py-2 text-right">개당 무게</th>
                      <th className="px-4 py-2 text-right">개당 부피 (CBM)</th>
                      <th className="px-4 py-2 text-center">묶음 수량</th>
                      <th className="px-4 py-2 text-right">판매가격</th>
                      <th className="px-4 py-2 text-left">상품 URL</th>
                      <th className="px-4 py-2 text-left">옵션</th>
                      <th className="px-4 py-2 text-center">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b">
                        <td className="px-4 py-2">{product.name}</td>
                        <td className="px-4 py-2 text-right">
                          {product.pricePerUnitYuan.toLocaleString()} 위안
                        </td>
                        <td className="px-4 py-2 text-right">
                          {product.weightPerUnit.toLocaleString()} kg
                        </td>
                        <td className="px-4 py-2 text-right">
                          {product.cbmPerUnit ? product.cbmPerUnit.toLocaleString() : '-'}
                        </td>
                        <td className="px-4 py-2 text-center">{product.unitsPerPackage || 1}개</td>
                        <td className="px-4 py-2 text-right">
                          {product.sellingPriceKrw ? (
                            <span className="font-medium text-green-600">{product.sellingPriceKrw.toLocaleString()}원</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {product.productUrl ? (
                            <a
                              href={product.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              링크 보기
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {product.options ? (
                            <span className="text-sm">{product.options}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2 justify-center">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                              수정
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(product.id)}
                            >
                              삭제
                            </Button>
                          </div>
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
    </div>
  );
};


