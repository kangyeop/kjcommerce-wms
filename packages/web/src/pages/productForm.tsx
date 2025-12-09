import { useState, useEffect, FC } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { productService } from '@/services';
import { toast } from 'sonner';

import { calculateCoupangFee } from '@/lib/coupang-fee';

export const ProductFormPage: FC = () => {
  const params = useParams({ strict: false });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const id = params.id;
  const isEditMode = !!id;

  // 수정 모드일 때 기존 제품 정보 조회
  const { data: existingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getById(Number(id)),
    enabled: isEditMode,
  });

  const [formData, setFormData] = useState({
    name: '',
    pricePerUnitYuan: '',
    weightPerUnit: '',
    widthCm: '',
    depthCm: '',
    heightCm: '',
    productUrl: '',
    options: '',
    unitsPerPackage: '1',
    coupangShippingFee: '',
    sellingPriceKrw: '',
  });

  // 기존 데이터 로드
  useEffect(() => {
    if (existingProduct) {
      setFormData({
        name: existingProduct.name,
        pricePerUnitYuan: existingProduct.pricePerUnitYuan.toString(),
        weightPerUnit: existingProduct.weightPerUnit.toString(),
        widthCm: (existingProduct.widthCm || 0).toString(),
        depthCm: (existingProduct.depthCm || 0).toString(),
        heightCm: (existingProduct.heightCm || 0).toString(),
        productUrl: existingProduct.productUrl || '',
        options: existingProduct.options || '',
        unitsPerPackage: (existingProduct.unitsPerPackage || 1).toString(),
        coupangShippingFee: (existingProduct.coupangShippingFee || 0).toString(),
        sellingPriceKrw: (existingProduct.sellingPriceKrw || '').toString(),
      });
    }
  }, [existingProduct]);

  useEffect(() => {
    const depth = parseFloat(formData.depthCm) || 0;
    const width = parseFloat(formData.widthCm) || 0;
    const height = parseFloat(formData.heightCm) || 0;
    const weight = parseFloat(formData.weightPerUnit) || 0; // g 단위라고 가정되어 있으나 로직상 kg 필요하면 변환해야 함.
    const sellingPrice = parseFloat(formData.sellingPriceKrw) || 0;

    const weightKg = weight / 1000;

    if (width === 0 && depth === 0 && height === 0 && weight === 0) return;

    const fee = calculateCoupangFee(width, depth, height, weightKg, sellingPrice);

    setFormData((prev) => {
      if (prev.coupangShippingFee === fee.toString()) return prev;
      return { ...prev, coupangShippingFee: fee.toString() };
    });
  }, [formData.widthCm, formData.depthCm, formData.heightCm, formData.weightPerUnit, formData.sellingPriceKrw]);

  // 제품 생성 뮤테이션
  const createProductMutation = useMutation({
    mutationFn: (newProduct: any) => productService.create(newProduct),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('제품이 성공적으로 등록되었습니다.');
      navigate({ to: `/products/$id`, params: { id: data.id.toString() } });
    },
  });

  // 제품 수정 뮤테이션
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => productService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      navigate({ to: `/products/$id`, params: { id: id!.toString() } });
    },
  });

  // 제품 삭제 뮤테이션
  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate({ to: '/products' });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.pricePerUnitYuan || !formData.weightPerUnit) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const productData = {
      name: formData.name,
      pricePerUnitYuan: parseFloat(formData.pricePerUnitYuan),
      weightPerUnit: parseFloat(formData.weightPerUnit),
      widthCm: parseFloat(formData.widthCm) || 0,
      depthCm: parseFloat(formData.depthCm) || 0,
      heightCm: parseFloat(formData.heightCm) || 0,
      unitsPerPackage: parseInt(formData.unitsPerPackage) || 1,
      coupangShippingFee: parseInt(formData.coupangShippingFee) || 0,
      ...(formData.productUrl && { productUrl: formData.productUrl }),
      ...(formData.options && { options: formData.options }),
      ...(formData.sellingPriceKrw && { sellingPriceKrw: parseFloat(formData.sellingPriceKrw) }),
    };

    if (isEditMode) {
      updateProductMutation.mutate({ id: Number(id), data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const handleDelete = () => {
    if (window.confirm('정말로 이 제품을 삭제하시겠습니까?')) {
      deleteProductMutation.mutate(Number(id));
    }
  };

  const isPending = createProductMutation.isPending || updateProductMutation.isPending;

  return (
    <div className="mx-auto space-y-6 max-w-2xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{isEditMode ? '제품 수정' : '제품 추가'}</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(isEditMode ? { to: `/products/$id`, params: { id: id!.toString() } } : { to: '/products' })}
          >
            취소
          </Button>
          {isEditMode && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? '삭제 중...' : '삭제'}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? '제품 정보 수정' : '새 제품 등록'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">제품명 *</Label>
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
              <Label htmlFor="pricePerUnitYuan">개당 가격 (위안) *</Label>
              <Input
                id="pricePerUnitYuan"
                name="pricePerUnitYuan"
                type="number"
                min="0"
                step="0.01"
                value={formData.pricePerUnitYuan}
                onChange={handleChange}
                placeholder="개당 가격을 입력하세요"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weightPerUnit">개당 무게 (g) *</Label>
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

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="widthCm">가로 (cm)</Label>
                <Input
                  id="widthCm"
                  name="widthCm"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.widthCm}
                  onChange={handleChange}
                  placeholder="가로"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="depthCm">세로 (cm)</Label>
                <Input
                  id="depthCm"
                  name="depthCm"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.depthCm}
                  onChange={handleChange}
                  placeholder="세로"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heightCm">높이 (cm)</Label>
                <Input
                  id="heightCm"
                  name="heightCm"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.heightCm}
                  onChange={handleChange}
                  placeholder="높이"
                />
              </div>
            </div>
            {formData.widthCm && formData.depthCm && formData.heightCm && (
              <p className="text-sm text-muted-foreground">
                계산된 CBM:{' '}
                {(
                  (parseFloat(formData.widthCm) *
                    parseFloat(formData.depthCm) *
                    parseFloat(formData.heightCm)) /
                  1000000
                ).toFixed(6)}{' '}
                m³
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="unitsPerPackage">묶음 판매 수량 *</Label>
              <Input
                id="unitsPerPackage"
                name="unitsPerPackage"
                type="number"
                min="1"
                step="1"
                value={formData.unitsPerPackage}
                onChange={handleChange}
                placeholder="묶음으로 판매할 개수"
                required
              />
              <p className="text-xs text-muted-foreground">예: 2개 묶음으로 판매하면 2 입력</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellingPriceKrw">예상 쿠팡 판매가 (원)</Label>
              <Input
                id="sellingPriceKrw"
                name="sellingPriceKrw"
                type="number"
                min="0"
                step="1"
                value={formData.sellingPriceKrw}
                onChange={handleChange}
                placeholder="판매가격을 입력하세요"
              />
              <p className="text-xs text-muted-foreground">기본 판매가격 (선택사항)</p>
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
                placeholder="쿠팡 배송비를 입력하세요"
              />
              <p className="text-xs text-muted-foreground">
                판매가격 계산 시 사용됩니다 (자동 계산됨, 필요시 수정 가능)
              </p>
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

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? '저장 중...' : isEditMode ? '수정 완료' : '등록하기'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(isEditMode ? { to: `/products/$id`, params: { id: id.toString() } } : { to: '/products' })}
              >
                취소
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
