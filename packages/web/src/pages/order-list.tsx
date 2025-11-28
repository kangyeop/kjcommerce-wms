import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { orderService } from '@/services';
import { Order } from '@/types';

const OrderListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 발주 목록 조회
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: orderService.getAll,
  });

  // 발주 삭제 mutation
  const deleteOrderMutation = useMutation({
    mutationFn: orderService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // 행 클릭 이벤트 전파 방지
    if (confirm('정말 이 발주를 삭제하시겠습니까?')) {
      deleteOrderMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">발주 목록</h1>
        <Button asChild>
          <Link to="/orders/new">새 발주 등록</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>전체 발주 내역</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>로딩 중...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>등록된 발주가 없습니다.</p>
              <Button variant="link" asChild className="mt-2">
                <Link to="/orders/new">첫 번째 발주 등록하기</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">ID</th>
                    <th className="text-left p-3 font-medium">제품명</th>
                    <th className="text-right p-3 font-medium">수량</th>
                    <th className="text-right p-3 font-medium">총 원가</th>
                    <th className="text-right p-3 font-medium">마진율</th>
                    <th className="text-right p-3 font-medium">판매가격</th>
                    <th className="text-right p-3 font-medium">예상 이익</th>
                    <th className="text-left p-3 font-medium">발주일</th>
                    <th className="text-center p-3 font-medium">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <td className="p-3">{order.id}</td>
                      <td className="p-3 font-medium">{order.product?.name || '-'}</td>
                      <td className="text-right p-3">{order.quantity.toLocaleString()}</td>
                      <td className="text-right p-3">{order.totalCostKrw.toLocaleString()}원</td>
                      <td className="text-right p-3">{order.marginRate}%</td>
                      <td className="text-right p-3 font-bold text-primary">
                        {order.sellingPriceKrw.toLocaleString()}원
                      </td>
                      <td className="text-right p-3 font-semibold text-green-600">
                        {(
                          order.marginRate *
                          order.sellingPriceKrw *
                          (order.quantity / (order.product?.unitsPerPackage || 1))
                        ).toLocaleString()}
                        원
                      </td>
                      <td className="p-3">{order.orderDate}</td>
                      <td className="text-center p-3">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => handleDelete(e, order.id)}
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
  );
};

export default OrderListPage;
