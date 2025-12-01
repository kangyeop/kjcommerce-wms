import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/main-layout'
import HomePage from './pages/home'
import ProductListPage from './pages/product-list'
import ProductFormPage from './pages/product-form'
import OrderListPage from './pages/order-list'
import OrderFormPage from './pages/order-form'
import PricingCalculatorPage from './pages/pricing-calculator'
import { QueryProvider } from './context/QueryProvider'

function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductListPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id/edit" element={<ProductFormPage />} />
            <Route path="orders" element={<OrderListPage />} />
            <Route path="orders/new" element={<OrderFormPage />} />
            <Route path="orders/:id" element={<OrderFormPage />} />
            <Route path="pricing" element={<PricingCalculatorPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  )
}

export default App