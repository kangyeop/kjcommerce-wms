import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SidebarLayout from './components/layout/sidebar-layout'
import HomePage from './pages/home'
import ProductListPage from './pages/product-list'
import ProductFormPage from './pages/product-form'
import OrderListPage from './pages/order-list'
import OrderFormPage from './pages/order-form'
import PricingCalculatorPage from './pages/pricing-calculator'
import AdAnalysisPage from './pages/ad-analysis'
import InventoryPage from './pages/inventory'
import { QueryProvider } from './context/QueryProvider'

function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SidebarLayout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductListPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id" element={<ProductFormPage />} />
            <Route path="orders" element={<OrderListPage />} />
            <Route path="orders/new" element={<OrderFormPage />} />
            <Route path="orders/:id" element={<OrderFormPage />} />
            <Route path="pricing" element={<PricingCalculatorPage />} />
            <Route path="ad-analysis" element={<AdAnalysisPage />} />
            <Route path="inventory" element={<InventoryPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  )
}

export default App