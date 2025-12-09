import { FC } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { InventoryPage } from '../pages/inventory'

const InventoryComponent: FC = () => {
  return <InventoryPage />
}

export const Route = createFileRoute('/inventory')({
  component: InventoryComponent,
})
