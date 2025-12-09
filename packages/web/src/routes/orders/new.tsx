import { FC } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { OrderFormPage } from '../../pages/orderForm'

const OrderNewComponent: FC = () => {
  return <OrderFormPage />
}

export const Route = createFileRoute('/orders/new')({
  component: OrderNewComponent,
})
