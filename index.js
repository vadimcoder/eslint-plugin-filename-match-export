import path from 'node:path';
import { isValid } from './is-valid.js';

/**
 * Custom ESLint rule: if a file has exactly one named export,
 * the filename must match it. Files with 0 or 2+ named exports are ignored.
 *
 * Understands Angular's dot-separated naming convention:
 *   seats-position-autofix.service.ts  →  SeatsPositionAutofixService
 *   my-component.component.ts          →  MyComponentComponent
 *   some-util.ts                       →  SomeUtil / someUtil
 */

/*
                How it works:

          ┌──────────────────────────┐
          │  Parse file with ESLint  │
          └────────────┬─────────────┘
                        │
          ┌────────────▼─────────────┐
          │  Collect all named       │
          │  ExportNamedDeclarations │
          └────────────┬─────────────┘
                        │
      ┌────────────────▼────────────────┐
      │  exports.length === 1 ?         │
      │                                 │
      │  0 or 2+  ──────►  skip (pass) │
      │  exactly 1  ──────►  continue   │
      └────────────────┬────────────────┘
                        │
      ┌────────────────▼────────────────┐
      │  Skip index / spec / test /     │
      │  stories files                  │
      └────────────────┬────────────────┘
                        │
      ┌────────────────▼────────────────┐
      │  Normalize filename:            │
      │                                 │
      │  "my-thing.service.ts"          │
      │    → strip ".ts"                │
      │    → split on "."               │
      │    → ["my-thing", "service"]    │
      │    → kebab → PascalCase each    │
      │    → ["MyThing", "Service"]     │
      │    → join → "MyThingService"    │
      └────────────────┬────────────────┘
                        │
      ┌────────────────▼────────────────┐
      │  Case-insensitive comparison    │
      │                                 │
      │  "mythingservice" ===           │
      │  "mythingservice"  →  pass ✅   │
      │                                 │
      │  "mythingservice" !==           │
      │  "userapiservice"  →  error ✗  │
      └─────────────────────────────────┘
*/

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'If a file has exactly one named export, the filename must match it',
    },
    messages: {
      mismatch:
        'Filename "{{filename}}" does not match the single named export "{{exportName}}".',
    },
    schema: [],
  },

  create(context) {
    const namedExports = [];

    return {
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          if (node.declaration.id) {
            // export function foo() {} / export class Foo {} /
            // export interface Foo {} / export type Foo = ...
            namedExports.push(node.declaration.id.name);
          } else if (node.declaration.declarations) {
            // export const foo = ..., bar = ...
            for (const decl of node.declaration.declarations) {
              if (decl.id.type === 'Identifier') {
                namedExports.push(decl.id.name);
              }
            }
          }
        }

        // export { foo, bar } or export { foo } from './bar'
        if (node.specifiers) {
          for (const spec of node.specifiers) {
            namedExports.push(
              spec.exported.type === 'Identifier'
                ? spec.exported.name
                : spec.exported.value,
            );
          }
        }
      },

      'Program:exit'(programNode) {
        if (namedExports.length !== 1) return;

        const exportName = namedExports[0];
        const filename = path.basename(context.filename);

        if (!isValid(filename, exportName)) {
          context.report({
            node: programNode,
            messageId: 'mismatch',
            data: { filename, exportName },
          });
        }
      },
    };
  },
};

export default {
  rules: {
    'match-named-export': rule,
  },
};
