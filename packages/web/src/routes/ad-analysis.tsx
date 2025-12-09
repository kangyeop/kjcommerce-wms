import { FC } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { AdAnalysisPage } from '../pages/adAnalysis'

const AdAnalysisComponent: FC = () => {
  return <AdAnalysisPage />
}

export const Route = createFileRoute('/ad-analysis')({
  component: AdAnalysisComponent,
})
