import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isReusableCommonsLicense } from './destinationPhotos';

describe('licencias de fotografías de Wikimedia Commons', () => {
  it('acepta CC0, dominio público y licencias CC con atribución reutilizables', () => {
    assert.equal(isReusableCommonsLicense('CC0'), true);
    assert.equal(isReusableCommonsLicense('Public domain'), true);
    assert.equal(isReusableCommonsLicense('CC BY 4.0'), true);
    assert.equal(isReusableCommonsLicense('CC BY-SA 4.0'), true);
  });

  it('rechaza licencias no comerciales, sin derivados o sin licencia clara', () => {
    assert.equal(isReusableCommonsLicense('CC BY-NC 4.0'), false);
    assert.equal(isReusableCommonsLicense('CC BY-ND 4.0'), false);
    assert.equal(isReusableCommonsLicense(''), false);
    assert.equal(isReusableCommonsLicense('All rights reserved'), false);
  });
});
