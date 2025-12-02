import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Warehouse, RefreshCw, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
import { marketplaceService } from '@/services/marketplaceService';
import { InventoryResponse, InventoryItem, OrdersResponse, OrderItem } from '@/types/marketplace.types';

const InventoryPage = () => {
  const [apiConfigured, setApiConfigured] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Check API status
  const { data: statusData } = useQuery({
    queryKey: ['marketplace-status'],
    queryFn: marketplaceService.getStatus,
  });

  // Fetch inventory
  const {
    data: inventoryData,
    isLoading: inventoryLoading,
    refetch: refetchInventory,
  } = useQuery<InventoryResponse>({
    queryKey: ['marketplace-inventory'],
    queryFn: marketplaceService.getInventory,
    enabled: apiConfigured,
  });

  // Fetch orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useQuery<OrdersResponse>({
    queryKey: ['marketplace-sales-orders', startDate, endDate],
    queryFn: () => marketplaceService.getSalesOrders(formatDateForAPI(startDate), formatDateForAPI(endDate)),
    enabled: apiConfigured,
  });

  useEffect(() => {
    if (statusData?.configured) {
      setApiConfigured(true);
    }
  }, [statusData]);

  // Set default dates (last 7 days)
  useEffect(() => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(lastWeek.toISOString().split('T')[0]);
  }, []);

  const handleRefresh = () => {
    refetchInventory();
    refetchOrders();
  };

  const formatDateForAPI = (dateString: string) => {
    if (!dateString) return '';
    return dateString.replace(/-/g, '');
  };

  const formatPrice = (price: string) => {
    if (!price) return '0';
    const numericPrice = parseInt(price, 10);
    return numericPrice.toLocaleString();
  };

  const formatDateTime = (timestamp: string) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
          <Warehouse className="w-8 h-8 text-indigo-600" />
          재고 관리
        </h1>
        <p className="text-slate-500 mt-2">로켓 그로스 재고 현황 및 주문 내역을 관리합니다.</p>
      </div>

      {/* API Status Banner */}
      <Card
        className={apiConfigured ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {apiConfigured ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">API 연동 완료</p>
                  <p className="text-sm text-green-700">
                    쿠팡 Open API가 정상적으로 연결되었습니다.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900">API 연동 필요</p>
                  <p className="text-sm text-amber-700">{statusData?.message || '로딩 중...'}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {apiConfigured ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>로켓 그로스 재고 현황</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={inventoryLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${inventoryLoading ? 'animate-spin' : ''}`} />
                  새로고침
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inventoryLoading ? (
                <div className="text-center py-10 text-slate-400">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  <p>재고 데이터를 불러오는 중...</p>
                </div>
              ) : inventoryData ? (
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                          <th className="p-3 text-left font-semibold text-slate-700">Vendor ID</th>
                          <th className="p-3 text-left font-semibold text-slate-700">
                            External SKU ID
                          </th>
                          <th className="p-3 text-right font-semibold text-slate-700">
                            주문 가능 수량
                          </th>
                          <th className="p-3 text-right font-semibold text-slate-700">
                            30일 판매량
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inventoryData?.length > 0 ? (
                          inventoryData.map((item: InventoryItem, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-3 font-mono text-xs">{item.vendorId}</td>
                              <td className="p-3 font-mono text-xs">{item.externalSkuId}</td>
                              <td className="p-3 text-right font-medium">
                                {item.inventoryDetails.totalOrderableQuantity}
                              </td>
                              <td className="p-3 text-right">
                                {item.salesCountMap.SALES_COUNT_LAST_THIRTY_DAYS}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-10 text-center text-slate-400">
                              재고 데이터가 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-red-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>재고 데이터를 불러오는데 실패했습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>주문 내역</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="startDate" className="text-sm font-medium">
                      시작일
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="endDate" className="text-sm font-medium">
                      종료일
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={ordersLoading}
                  >
                    <Calendar className={`w-4 h-4 mr-2 ${ordersLoading ? 'animate-spin' : ''}`} />
                    조회
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="text-center py-10 text-slate-400">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  <p>주문 데이터를 불러오는 중...</p>
                </div>
              ) : ordersData ? (
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                          <th className="p-3 text-left font-semibold text-slate-700">결제일시</th>
                          <th className="p-3 text-left font-semibold text-slate-700">옵션 ID</th>
                          <th className="p-3 text-left font-semibold text-slate-700">상품명</th>
                          <th className="p-3 text-right font-semibold text-slate-700">판매 수량</th>
                          <th className="p-3 text-right font-semibold text-slate-700">단가 (원)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ordersData && ordersData.length > 0 ? (
                          ordersData.flatMap((orderGroup, groupIdx) =>
                            orderGroup.orderItems.map((order: OrderItem, idx: number) => (
                              <tr key={`${groupIdx}-${idx}`} className="hover:bg-slate-50">
                                <td className="p-3">{formatDateTime(orderGroup.paidAt)}</td>
                                <td className="p-3 font-mono text-xs">{order.vendorItemId}</td>
                                <td className="p-3">{order.productName}</td>
                                <td className="p-3 text-right font-medium">{order.salesQuantity}</td>
                                <td className="p-3 text-right font-medium">{formatPrice(order.unitSalesPrice)}</td>
                              </tr>
                            ))
                          )
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-10 text-center text-slate-400">
                              주문 데이터가 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-red-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>주문 데이터를 불러오는데 실패했습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-10">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">API 연동 필요</h3>
              <p className="text-slate-600 max-w-md mb-6">
                쿠팡 Open API 키를 설정하면 실시간 재고 현황과 주문 내역을 확인할 수 있습니다.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg text-left">
                <p className="text-sm text-blue-800">
                  <strong>설정 방법:</strong>
                  <br />
                  1. 쿠팡 WING에서 Open API 키 발급
                  <br />
                  2. 서버의 <code className="bg-blue-100 px-1 rounded">.env</code> 파일에 다음 추가:
                  <br />
                  <code className="block bg-blue-100 p-2 rounded mt-2 text-xs">
                    COUPANG_ACCESS_KEY=your_access_key
                    <br />
                    COUPANG_SECRET_KEY=your_secret_key
                    <br />
                    COUPANG_VENDOR_ID=your_vendor_id
                  </code>
                  <br />
                  3. 서버 재시작 후 페이지 새로고침
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InventoryPage;
