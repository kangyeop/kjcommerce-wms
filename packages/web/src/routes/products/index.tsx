import { createFileRoute } from '@tanstack/react-router'
import { ProductListPage } from '../../pages/productList'

export const Route = createFileRoute('/products/')({
  component: ProductListPage,
})
