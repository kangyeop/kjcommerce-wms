import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { productService } from '@/services'

// 로컬 타입 정의는 전역 타입을 사용하기 때문에 제거

const ProductRegistrationPage = () => {
  const queryClient = useQueryClient();
  
  // 제품 목록 조회 쿼리
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAll,
  });
  
  // 제품 생성 뮤테이션
  const createProductMutation = useMutation({
    mutationFn: (newProduct: { name: string; pricePerUnitYuan: number; weightPerUnit: number }) =>
      productService.create(newProduct),
    onSuccess: () => {
      // 제품 생성 성공 시 제품 목록 재조회
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // 폼 초기화
      setFormData({ name: '', pricePerUnitYuan: '', weightPerUnit: '' });
    },
  });

  const [formData, setFormData] = useState({
    name: '',
    pricePerUnitYuan: '',
    weightPerUnit: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.pricePerUnitYuan || !formData.weightPerUnit) {
      return;
    }

    const newProduct = {
      name: formData.name,
      pricePerUnitYuan: parseFloat(formData.pricePerUnitYuan),
      weightPerUnit: parseFloat(formData.weightPerUnit),
    };

    // API를 통해 제품 생성
    createProductMutation.mutate(newProduct);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">물류 등록 정보</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>제품 정보 등록</CardTitle>
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
                <Label htmlFor="weightPerUnit">개당 무게 (kg)</Label>
                <Input 
                  id="weightPerUnit"
                  name="weightPerUnit"
                  type="number"
                  min="0"
                  step="0.001"
                  value={formData.weightPerUnit}
                  onChange={handleChange}
                  placeholder="개당 무게를 입력하세요"
                  required
                />
              </div>

              <Button type="submit" className="w-full">등록하기</Button>
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
              <div className="border rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">제품명</th>
                      <th className="px-4 py-2 text-right">개당 가격 (위안)</th>
                      <th className="px-4 py-2 text-right">개당 무게</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b">
                        <td className="px-4 py-2">{product.name}</td>
                        <td className="px-4 py-2 text-right">{product.pricePerUnitYuan.toLocaleString()} 위안</td>
                        <td className="px-4 py-2 text-right">{product.weightPerUnit.toLocaleString()} kg</td>
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

export default ProductRegistrationPage;