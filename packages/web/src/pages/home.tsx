import { Link } from 'react-router-dom'
import { 
  Package, 
  ShoppingCart, 
  Calculator, 
  BarChart3, 
  Warehouse 
} from 'lucide-react'

const HomePage = () => {
  const cards = [
    {
      title: '제품 관리',
      description: '제품 등록, 수정 및 조회',
      icon: Package,
      link: '/products',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: '발주 관리',
      description: '발주 생성 및 현황 관리',
      icon: ShoppingCart,
      link: '/orders',
      color: 'from-purple-500 to-pink-600'
    },
    {
      title: '판매가격 계산',
      description: '마진율 기반 최적 가격 산출',
      icon: Calculator,
      link: '/pricing',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      title: '광고 분석',
      description: '쿠팡 광고 성과 분석 및 제안',
      icon: BarChart3,
      link: '/ad-analysis',
      color: 'from-orange-500 to-red-600'
    },
    {
      title: '재고 관리',
      description: '로켓 그로스 재고 현황',
      icon: Warehouse,
      link: '/inventory',
      color: 'from-cyan-500 to-blue-600'
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          대시보드
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          KJ Commerce WMS에 오신 것을 환영합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.link}
              to={card.link}
              className="group relative overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className="p-6 relative">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${card.color} mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {card.title}
                </h3>
                <p className="text-slate-600 text-sm">
                  {card.description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">최근 활동</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>시스템 준비 완료</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">빠른 시작</h2>
          <div className="space-y-2">
            <Link to="/products/new" className="block text-sm text-indigo-600 hover:text-indigo-700 hover:underline">
              → 새 제품 등록하기
            </Link>
            <Link to="/orders/new" className="block text-sm text-indigo-600 hover:text-indigo-700 hover:underline">
              → 새 발주 생성하기
            </Link>
            <Link to="/pricing" className="block text-sm text-indigo-600 hover:text-indigo-700 hover:underline">
              → 판매가격 계산하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage