import assert from 'node:assert/strict';
import { it } from 'node:test';
import { isValid } from './is-valid.js';

it('isValid', () => {
  assert.strictEqual(isValid('index.ts', 'MyExport'), true);
  assert.strictEqual(isValid('my-function.ts', 'myFunction'), true);
  assert.strictEqual(isValid('my-super-function.ts', 'mySuperFunction'), true);
  assert.strictEqual(isValid('my-class.ts', 'MyClass'), true);
  assert.strictEqual(isValid('my-class.service.ts', 'MyClassService'), true);
  assert.strictEqual(isValid('my-constant.ts', 'MY_CONSTANT'), true);
  assert.strictEqual(isValid('my-file.ts', 'MyExport'), false);
  assert.strictEqual(isValid('my-file.ext.ts', 'MyFile'), false);
});
