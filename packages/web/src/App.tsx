import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/main-layout'
import HomePage from './pages/home'
import ProductRegistrationPage from './pages/product-registration'
import OrderListPage from './pages/order-list'
import OrderFormPage from './pages/order-form'
import { QueryProvider } from './context/QueryProvider'

function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="product-registration" element={<ProductRegistrationPage />} />
            <Route path="orders" element={<OrderListPage />} />
            <Route path="orders/new" element={<OrderFormPage />} />
            <Route path="orders/:id" element={<OrderFormPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  )
}

export default App