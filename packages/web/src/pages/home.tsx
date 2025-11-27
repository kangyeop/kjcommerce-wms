import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const HomePage = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold">KJ Commerce WMS</h1>
        <p className="text-xl text-muted-foreground mt-2">물류 관리 시스템에 오신 것을 환영합니다!</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>제품 등록</CardTitle>
            <CardDescription>제품 기본 정보를 관리합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>각 제품의 개당 가격(위안)과 무게(g) 정보를 등록하고 관리할 수 있습니다.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/product-registration">관리하기</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>발주 관리</CardTitle>
            <CardDescription>발주 및 판매가격을 통합 관리합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>발주를 등록하면 모든 비용(수수료, 배송비, 관세 등)과 마진율을 고려하여 판매가격을 자동으로 계산합니다.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/orders">관리하기</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default HomePage