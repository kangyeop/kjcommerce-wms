import { FC } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { OrderListPage } from '../../pages/orderList'

const OrdersComponent: FC = () => {
  return <OrderListPage />
}

export const Route = createFileRoute('/orders/')({
  component: OrdersComponent,
})
