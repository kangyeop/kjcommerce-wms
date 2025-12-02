import { FC } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SidebarLayout } from './components/layout/sidebarLayout'
import { HomePage } from './pages/home'
import { ProductListPage } from './pages/productList'
import { ProductFormPage } from './pages/productForm'
import { OrderListPage } from './pages/orderList'
import { OrderFormPage } from './pages/orderForm'
import { PricingCalculatorPage } from './pages/pricingCalculator'
import { AdAnalysisPage } from './pages/adAnalysis'
import { InventoryPage } from './pages/inventory'
import { QueryProvider } from './context/QueryProvider'

export const App: FC = () => {
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