import { FC } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { OrderFormPage } from '../../pages/orderForm'

const OrderEditComponent: FC = () => {
  return <OrderFormPage />
}

export const Route = createFileRoute('/orders/$id')({
  component: OrderEditComponent,
})
