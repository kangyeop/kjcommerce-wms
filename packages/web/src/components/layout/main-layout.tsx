import { Link, Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground py-4 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold">KJ Commerce WMS</Link>
            <nav>
              <ul className="flex space-x-6">
                <li><Link to="/" className="hover:text-white/80 transition-colors">홈</Link></li>
                <li><Link to="/product-registration" className="hover:text-white/80 transition-colors">제품 등록</Link></li>
                <li><Link to="/orders" className="hover:text-white/80 transition-colors">발주 관리</Link></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} KJ Commerce WMS</p>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout