import { FC } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PricingCalculatorPage } from '../pages/pricingCalculator'

const PricingComponent: FC = () => {
  return <PricingCalculatorPage />
}

export const Route = createFileRoute('/pricing')({
  component: PricingComponent,
})
