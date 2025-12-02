## Best Practices

- Prefer functional components
- Use `FC` for functional components with props
- Utilize `useState` and `useEffect` hooks for state and side effects
- Implement proper TypeScript interfaces for props and state
- Use `memo` for performance optimization when needed
- Implement custom hooks for reusable logic
- Utilize TypeScript's strict mode

### Code Styles

# Use named exports instead of default export

- Use named exports instead of default export to avoid discrepancies between the defined name and the imported name.

### Wrong

```tsx
const SayHello = (props: Props) => {
  return <>Hello, {props.name}</>;
};

export default SayHello;
```

```tsx
import SayHelloBlahblah from './path/to/SayHello';

<SayHelloBlahblah name="Tom" />;
```

### Right

```tsx
export const SayHello = (props: Props) => {
  return <>Hello, {props.name}</>;
};
```

```tsx
import { SayHello } from './path/to/SayHello';

<SayHello name="Tom" />;
```

# Defining component `Props`

- Define component `Props` using `interface`.
- When extending other component props, use `ComponentProps`.

### Wrong

```ts
type Props = {
  name: string;
  age: number;
  gender?: 'M' | 'F';
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  OtherComponentProps;
```

### Right

```ts
interface Props extends ComponentProps<'button'>, ComponentProps<typeof OtherComponent> {
  name: string;
  age: number;
  gender?: 'M' | 'F';
}
```

- Do not export the props type and always name it `Props`.

### Wrong

```ts
export interface Props extends ComponentProps<'button'> {
  name: string;
}
```

```ts
interface MyComponentProps extends ComponentProps<'button'> {
  name: string;
}
```

### Right

```ts
interface Props extends ComponentProps<'button'> {
  name: string;
}
```

- If `children` is required in `Props`, extend `PropsWithChildren` from React.

### Wrong

```ts
export interface Props {
  children?: ReactNode;
}
```

### Right

```ts
interface Props extends PropsWithChildren {}
```

# Component definition

- Use `React.FC` to type components.

### Wrong

```tsx
const MyComponent = (props: Props) => { ... };
```

```tsx
function MyComponent(props: Props) { ... }
```

### Right

```tsx
const MyComponent: FC<Props> = (props) => { ... };
```

# Variable naming

- React component names should use PascalCase.
- React element variables should use camelCase.

### Wrong

```tsx
const Message = <p>hello world</p>;

return <>You said {Message}</>;
```

### Right

```tsx
const message = <p>hello world</p>;

return <>You said {message}</>;
```

# Handler naming

- Handlers passed as props should be named with `on~`, and handlers defined inside components should be named with `handle~`.
- Use the `on|handle{Event}{Target}` pattern.
  - `onClickClose` / `handleClickClose`
  - `onChangeEmail` / `handleChangeEmail`

### Wrong

```tsx
interface Props {
  handleClick?: () => void;
}

export const MyButton = ({ handleClick }: Props) => {
  const onClick = () => {
    if (confirm('Really?')) {
      handleClick?.();
    }
  };

  return <button onClick={onClick}>Click me</button>;
};
```

### Right

```tsx
interface Props {
  onClick?: () => void;
}

export const MyButton = ({ onClick }: Props) => {
  const handleClick = () => {
    if (confirm('Really?')) {
      onClick?.();
    }
  };

  return <button onClick={handleClick}>Click me</button>;
};
```

# curly

- Always use `{}` for code blocks.
- https://eslint.org/docs/latest/rules/curly

### Wrong

```tsx
if (foo) foo++;
```

### Right

```tsx
if (foo) {
  foo++;
}
```

# Export only necessary modules

- Only export modules that need to be provided externally.
- Do not use `export * from 'path';` except for the index.ts of a slice. ([FSD file architecture convention](https://wiki.workers-hub.com/display/azentone/Pocket+AI+-+AI+FE+FSD+convention))

### Wrong

```tsx
export const secretValue = 'secret';

export const getSecret = () => secretValue;
```

```tsx
export * from './CardList';
```

### Right

```tsx
const secretValue = 'secret';

export const getSecret = () => secretValue;
```

```tsx
export { CardList } from './CardList';
```

# class naming

- Use snake_case for class names.
- Use `_` instead of `-`.

### Right

```scss
.title_area {
  display: flex;

  .title {
    font-size: 32px;
  }

  .button_edit {
    font-size: 14px;
  }
}
```

## Recommended folder structure

```
src/
    api/
    components/
    constants/
    hooks/
    lib/
    pages/
    routes/
    App.tsx
    main.tsx
    Router.tsx
    index.tsx
    types.tsx
```

## Additional Instructions

- Use .tsx extension for files with JSX
- Implement strict TypeScript checks
- Utilize React.lazy and Suspense for code-splitting
- Use type inference where possible
- Implement error boundaries for robust error handling
- Follow React and TypeScript best practices and naming conventions
- Use ESLint with TypeScript and React plugins for code quality

# File Naming

- All file names should be in camelCase (e.g., `myComponent.tsx`, `utils.ts`).
