# TanStack Query Best Practices

## Project Structure

- Use `@lukemorales/query-key-factory` for query key management
- Define query keys in `src/queryKeys` directory
- Organize query hooks in `src/queries` directory by feature
- Separate query keys and query hooks for better maintainability
- Use centralized query client from `@/api/query`
- Define shared type utilities in `src/types/query.ts`

## Query Key Management

- Use `@lukemorales/query-key-factory` to create type-safe query keys
- Define query keys in `src/queryKeys/{feature}Query.ts` files
- Export query key factories for each feature domain
- Shoulde include both queryKey and queryFn

### Query Key Structure

```ts
// src/queryKeys/badgeQuery.ts
import { createQueryKeys } from '@lukemorales/query-key-factory';

import {
  getBadges,
  getBadge,
  getBadgeJob,
  getBadgeJobs,
  getBadgeQueueStats,
} from '@/api/lpComponent/badge';
import { GetBadgesParams, GetBadgeJobsParams } from '@/types';

export const badgeQuery = createQueryKeys('badge', {
  list: (params?: GetBadgesParams) => ({
    queryKey: [params],
    queryFn: () => getBadges(params),
  }),
  detail: (id: string) => ({
    queryKey: [id],
    queryFn: () => getBadge(id),
  }),
  job: (jobId: string) => ({
    queryKey: [jobId],
    queryFn: () => getBadgeJob(jobId),
  }),
  jobs: (params?: GetBadgeJobsParams) => ({
    queryKey: [params],
    queryFn: () => getBadgeJobs(params),
  }),
  queueStats: () => ({
    queryKey: ['queueStats'],
    queryFn: () => getBadgeQueueStats(),
  }),
});
```

## Query Hook Organization

- Create query hooks in `src/queries/{feature}/` directories
- Use feature-based directory structure for better organization
- Keep related queries together in the same feature directory

### Directory Structure

```
src/
  queryKeys/
    userQuery.ts
    workflowQuery.ts
    traceQuery.ts
  queries/
    users/
      useUserListQuery.ts
      useUserQuery.ts
    workflows/
      useWorkflowListQuery.ts
      useWorkflowQuery.ts
    traces/
      useTraceListQuery.ts
      useTraceQuery.ts
```

## Suspense Query Usage

- Prefer `useSuspenseQuery` over `useQuery` for data fetching
- Use `SuspenseQueryOptions` type for proper type safety with query-key-factory
- Use defined `SuspenseQueryOptions` type utilities in `src/types/query.ts`

## Query Hook Naming

- Hook names should be in the form `use{Entity}DetailQuery` for single entities
- Hook names should be in the form `use{Entity}ListQuery` for collections
- Use descriptive names that clearly indicate the data being fetched

### Wrong

```tsx
const useUsers = () => {
  return useQuery({...});
};

const useGetUser = (id: number) => {
  return useQuery({...});
};
```

### Right

```tsx
const useUserListQuery = () => {
  return useSuspenseQuery({...});
};

const useUserDetailQuery = (id: number) => {
  return useSuspenseQuery({...});
};
```

## Query Hook Implementation

- Always use the corresponding query key from `queryKeys`
- Use data fetch functions from `src/api` directory
- Use `useSuspenseQuery` for data fetching hooks
- Use `SuspenseQueryOptions` type for proper type safety
- Support query options parameter for flexibility
- Export invalidate functions alongside query hooks

### Wrong

```tsx
const useUsersQuery = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
  return { users: data ?? [], isLoading };
};
```

### Right

```tsx
import { useSuspenseQuery } from '@tanstack/react-query';
import { queryClient } from '@/api/query';
import { userQuery } from '@/queryKeys';
import { GetUsersParams } from '@/types';
import { SuspenseQueryOptions } from '@/types/query';

export const useUserListQuery = (
  params?: GetUsersParams,
  options?: Omit<SuspenseQueryOptions<typeof userQuery.list>, 'queryKey'>
) => useSuspenseQuery({ ...userQuery.list(params), ...options });

export const invalidateUserList = (params?: GetUsersParams) =>
  queryClient.invalidateQueries({ queryKey: userQuery.list(params).queryKey });
```

## Query Options Interface

- Use `SuspenseQueryOptions` type for suspense query options
- Omit `queryKey`, `queryFn` from options since it comes from query-key-factory
- Make options parameter optional with default values

### Query Options Pattern

```tsx
import { useSuspenseQuery } from '@tanstack/react-query';
import { queryClient } from '@/api/query';
import { userQuery } from '@/queryKeys';
import { SuspenseQueryOptions } from '@/types/query';

export const useUserQuery = (
  id: string,
  options?: Omit<SuspenseQueryOptions<typeof userQuery.detail>, 'queryKey'>
) => useSuspenseQuery({ ...userQuery.detail(id), ...options });

export const invalidateUser = (id: string) =>
  queryClient.invalidateQueries({ queryKey: userQuery.detail(id).queryKey });
```

## Common Types

### CommonMutationParams

- Use defined common mutation parameters in `src/types/common.ts`
- Use consistent success and error callback patterns
- Define specific mutation params type if specific params needed

```ts
// src/types/common.ts
export type CommonMutationParams = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};
```

## Mutation Hooks

- Mutation hooks should be named `use{Action}{Entity}Mutation`
- Follow similar patterns as query hooks for consistency
- Place mutations in the same feature directory as related queries
- Prefer `mutate` over `mutateAsync` for mutation hook usage

### Mutation Naming

```tsx
// Good naming examples
const useCreateUserMutation = () => { ... };
const useUpdateUserMutation = () => { ... };
const useDeleteUserMutation = () => { ... };
```

### Mutation Implementation

```tsx
import { useMutation } from '@tanstack/react-query';
import { createUser } from '@/api/user';
import { CommonMutationParams } from '@/types';

export const useCreateUserMutation = (params?: CommonMutationParams) =>
  useMutation({
    mutationFn: createUser,
    ...params,
  });
```

## Query Invalidation

- Use query keys from `queryKeys` for invalidation
- Invalidate related queries after mutations
- Use proper invalidation patterns for cache management

### Invalidation Pattern

```tsx
const queryClient = useQueryClient();

const mutation = useCreateUserMutation({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: userKeys.all });
  },
});
```

## Export Pattern

- Export all query hooks from feature index files
- Use `export * from` pattern for cleaner exports
- Export both query hooks and invalidate functions
- Use named exports consistently

### Feature Index Export

```tsx
// src/queries/users/index.ts
export * from './useUserListQuery';
export * from './useUserQuery';
export * from './useCreateUserMutation';
export * from './useUpdateUserMutation';
export * from './useDeleteUserMutation';
```

### Individual Hook Export Pattern

```tsx
// src/queries/users/useUserListQuery.ts
import { useSuspenseQuery } from '@tanstack/react-query';
import { queryClient } from '@/api/query';
import { userQuery } from '@/queryKeys';
import { GetUsersParams } from '@/types';
import { SuspenseQueryOptions } from '@/types/query';

export const useUserListQuery = (
  params?: GetUsersParams,
  options?: Omit<SuspenseQueryOptions<typeof userQuery.list>, 'queryKey'>
) => useSuspenseQuery({ ...userQuery.list(params), ...options });

export const invalidateUserList = (params?: GetUsersParams) =>
  queryClient.invalidateQueries({ queryKey: userQuery.list(params).queryKey });
```

## Additional Guidelines

- Always handle loading and error states appropriately
- Use proper TypeScript typing for all query functions
- Implement proper error handling in query functions
- Follow the established naming conventions consistently
- Keep query hooks focused and single-purpose
- Export invalidate functions alongside query hooks for cache management
- Use centralized queryClient from `@/api/query`
- Prefer `useSuspenseQuery` for better loading state management
- Use `SuspenseQueryOptions` type for advanced type safety with query-key-factory
- Prefer `mutate` over `mutateAsync` for mutation hook usage

## API Integration

- All data fetch functions must be imported from `src/api` directory
- Organize API functions by feature in `src/api/{feature}/{function}.ts` files
- Each API function should be in its own file named after the function
- Group related API functions under a feature directory (e.g., `src/api/user/getUser.ts`, `src/api/user/updateUser.ts`)
- Use consistent naming for API functions that match the query hook names
- API functions should handle HTTP requests and response parsing
- Export API functions from a feature index.ts file for cleaner imports
