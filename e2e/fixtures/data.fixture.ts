import { test as base } from '@playwright/test';

type Cleanup = () => Promise<void>;

type DataFixtures = {
  uniqueData: {
    suffix: string;
    email: string;
    licensePlate: string;
  };
  registerCleanup: (cleanup: Cleanup) => void;
};

export const dataTest = base.extend<DataFixtures>({
  uniqueData: async ({}, use, testInfo) => {
    const suffix = `${Date.now()}-${testInfo.workerIndex}`;
    await use({
      suffix,
      email: `e2e.${suffix}@gmail.com`,
      licensePlate: `E2E-${suffix.slice(-8)}`,
    });
  },
  registerCleanup: async ({}, use) => {
    const cleanups: Cleanup[] = [];
    await use((cleanup) => cleanups.push(cleanup));
    for (const cleanup of cleanups.reverse()) {
      await cleanup();
    }
  },
});
