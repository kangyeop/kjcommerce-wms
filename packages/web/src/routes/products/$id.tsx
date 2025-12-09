import { createFileRoute } from '@tanstack/react-router'
import { ProductFormPage } from '../../pages/productForm'

export const Route = createFileRoute('/products/$id')({
  component: ProductFormPage,
})
