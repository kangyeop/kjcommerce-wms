import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { SidebarLayout } from '../components/layout/sidebarLayout';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <SidebarLayout>
      <Outlet />
      <TanStackRouterDevtools />
    </SidebarLayout>
  );
}
