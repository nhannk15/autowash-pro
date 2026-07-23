import { mergeTests } from '@playwright/test';
import { authTest } from './auth.fixture.js';
import { apiTest } from './api.fixture.js';
import { dataTest } from './data.fixture.js';

export const test = mergeTests(authTest, apiTest, dataTest);
export { expect } from '@playwright/test';
