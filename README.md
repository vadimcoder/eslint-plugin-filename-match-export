# eslint-plugin-filename-match-export

[![ESLint >= 9](https://img.shields.io/badge/ESLint-%3E%3D%209-4B32C3?logo=eslint)](https://eslint.org/)
[![Flat Config](https://img.shields.io/badge/config-flat-green)](https://eslint.org/docs/latest/use/configure/configuration-files)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

ESLint rule that enforces filenames to match the single named export. Multi-export files are ignored.

| filename must be      | export                          |
| --------------------- | ------------------------------- |
| `my-function.*`       | export function myFunction      |
| `my-super-function.*` | export function mySuperFunction |
| `my-class.*`          | export class MyClass            |
| `my-class.service.*`  | export class MyClassService     |
| `my-const.*`          | export const MY_CONST           |
| `index.*`             | ignored                         |
| `*.spec.*`            | ignored                         |
| `*.test.*`            | ignored                         |
| `*.stories.*`         | ignored                         |

## Features

- **Single-export focus** — only reports when a file has exactly one named export, skips everything else
- **Case-insensitive** — `myFunction` matches `my-function.ts` and `MyFunction` matches `my-function.ts`
- **TypeScript-aware** — handles `export class`, `export function`, `export const`, `export interface`, `export type`, and re-exports (`export { Foo } from '...'`)
- **ESLint 9 flat config** — native support, no `@eslint/compat` wrappers needed
- **Zero dependencies** — only uses Node.js built-in `path` module
- **Smart skipping** — automatically ignores `index.*`, `*.spec.*`, `*.test.*`, and `*.stories.*` files
- **Angular-aware** — understands dot-separated naming (`my-thing.service.ts` matches `MyThingService`)

## Installation

```bash
npm install --save-dev eslint-plugin-filename-match-export
```

## Usage

### Flat config (`eslint.config.js`) — ESLint >= 9

```js
import filenameMatchExport from 'eslint-plugin-filename-match-export';

export default [
  {
    files: ['src/**/*.ts'],
    plugins: {
      'filename-match-export': filenameMatchExport,
    },
    rules: {
      'filename-match-export/match-named-export': [
        'error',
        {
          ignore: ['environment.development.ts', 'global.d.ts'],
        },
      ],
    },
  },
];
```

### Legacy config (`.eslintrc.*`) — ESLint 8

```json
{
  "plugins": ["filename-match-export"],
  "rules": {
    "filename-match-export/match-named-export": "error"
  }
}
```

## Comparison with other plugins

|                                                                     | **This plugin** | [eslint-plugin-filenames](https://github.com/selaux/eslint-plugin-filenames) | [eslint-plugin-filename-export](https://github.com/ekwoka/eslint-plugin-filename-export) | [eslint-plugin-filenames-simple](https://github.com/epaew/eslint-plugin-filenames-simple) | [eslint-plugin-check-file](https://github.com/DukeLuo/eslint-plugin-check-file) | [eslint-plugin-angular-file-naming](https://github.com/nicfontaine/eslint-plugin-angular-file-naming) |
| ------------------------------------------------------------------- | :-------------: | :--------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------: |
| **Matches filename to export**                                      |      Named      |                                 Default only                                 |                                     Named + Default                                      |                                           Named                                           |                                       No                                        |                                                  No                                                   |
| **Single export only** (skip multi-export files)                    |       Yes       |                                      No                                      |                                            No                                            |                                            Yes                                            |                                        —                                        |                                                   —                                                   |
| **Angular dot-separated naming** (`*.service.ts`, `*.component.ts`) |       Yes       |                                      No                                      |                                            No                                            |                                            No                                             |                                       No                                        |                                              Suffix only                                              |
| **ESLint 9 flat config** (native)                                   |       Yes       |                                      No                                      |                                            No                                            |                                            No                                             |                                    Yes (v3)                                     |                                                  No                                                   |
| **Maintained**                                                      |       Yes       |                               Abandoned (2018)                               |                                     Personal project                                     |                                       Stale (2023)                                        |                                       Yes                                       |                                             Stale (2022)                                              |
| **Zero dependencies**                                               |       Yes       |                                      No                                      |                                            No                                            |                                            No                                             |                                       No                                        |                                                  No                                                   |

### Why not the others?

**[eslint-plugin-filenames](https://github.com/selaux/eslint-plugin-filenames)** — The original. Its `match-exported` rule only checks \*\*default\*\* exports, not named exports. The project has been explicitly abandoned since 2018 and doesn't support ESLint 9.

**[eslint-plugin-filename-export](https://github.com/ekwoka/eslint-plugin-filename-export)** — Checks named exports, but fires on **every** file that has named exports, not just single-export files. A barrel file re-exporting 20 symbols must have a filename matching at least one of them — not useful. It also doesn't understand Angular's dot-separated naming, so `my.service.ts` exporting `MyService` is a violation because `my.service` doesn't match `MyService` without the dot-segment awareness.

**[eslint-plugin-filenames-simple](https://github.com/epaew/eslint-plugin-filenames-simple)** — Its `named-export` rule correctly skips multi-export files, the closest to this plugin's behavior. However, it doesn't understand Angular dot-separated naming (it strips only the last extension, so `my.service.ts` becomes `my.service` and fails to match `MyService`). It also explicitly doesn't support ESLint 9 (`peerDependencies: "eslint": "<9.0.0"`).

**[eslint-plugin-check-file](https://github.com/DukeLuo/eslint-plugin-check-file)** — Enforces filename **casing patterns** (kebab-case, PascalCase, etc.) but does not match filenames against export names at all. Great for enforcing naming conventions, but solving a different problem.

**[eslint-plugin-angular-file-naming](https://github.com/nicfontaine/eslint-plugin-angular-file-naming)** — Enforces that Angular files have the correct **suffix** (`.component.ts`, `.service.ts`, etc.) but does not match the filename against the exported class name. Unmaintained since 2022.

## Supported export types

```ts
export function myFunction() {} // ✅ function declaration
export class MyClass {} // ✅ class declaration
export const myConst = 42; // ✅ variable declaration
export interface MyInterface {} // ✅ TypeScript interface
export type MyType = string; // ✅ TypeScript type alias
export { myThing }; // ✅ named export specifier
export { myThing } from './other'; // ✅ re-export
export const a = 1,
  b = 2; // ✅ counts as 2 exports (ignored)
export default class {} // ✅ default exports are not counted
```

## Contributing

Contributions are welcome! Please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)
