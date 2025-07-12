# @pglib/vite-plugin-original-class-name

Add original names of classes to the dist code.

## Why this exists?

Sometimes, we need to get the name of the classes we get from `import.meta.glob`, but after the code is compiled and minified, the names of the classes will be minified to less characters.

The plugin adds a static property to all classes with the original name, so that we can get the original name of the class in the compiled code.

## Installation

```sh
npm i -D @pglib/vite-plugin-original-class-name
# or use pnpm
pnpm i -D @pglib/vite-plugin-original-class-name
```

## Usage

Add the plugin to `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import originalClassName from "@pglib/vite-plugin-original-class-name";

export default defineConfig({
  plugins: [
    originalClassName({
      staticMethodName: "className", // or any other name you like
    }),
  ],
});
```

## TypeScript support

### Method 1

Add declaration to `src/vite-env.d.ts`:

```ts
/// <reference types="@pglib/vite-plugin-original-class-name/client" />
```

### Method 2

Add declaration to `tsconfig.json`:

```json
{
  "compilerOptions": {
    // ...
    "types": ["@pglib/vite-plugin-original-class-name/client"]
  }
  // ...
}
```
