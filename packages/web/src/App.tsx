import { FC } from 'react'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryProvider } from './context/QueryProvider'
import { Toaster } from 'sonner'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export const App: FC = () => {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
      <Toaster />
    </QueryProvider>
  )
}