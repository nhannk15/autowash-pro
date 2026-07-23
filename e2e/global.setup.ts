import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(here, '.env.e2e') });

export default async function globalSetup() {
  const backendURL = process.env.E2E_BACKEND_URL ?? 'http://127.0.0.1:8081';

  let healthResponse;
  for (let i = 0; i < 30; i++) {
    try {
      healthResponse = await fetch(`${backendURL}/actuator/health`);
      if (healthResponse.ok) break;
    } catch (e) {
      // Ignore network errors while starting
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  if (!healthResponse || !healthResponse.ok) {
    throw new Error(`E2E backend health check failed`);
  }
  const health = await healthResponse.json() as { status?: string };
  if (health.status !== 'UP') {
    throw new Error(`E2E backend is not UP: ${JSON.stringify(health)}`);
  }

  const infoResponse = await fetch(`${backendURL}/actuator/info`);
  if (!infoResponse.ok) {
    throw new Error(`E2E backend info check failed with HTTP ${infoResponse.status}`);
  }
  const info = await infoResponse.json() as { autowash?: { profile?: string } };
  if (info.autowash?.profile !== 'e2e') {
    throw new Error(`Refusing to run against non-E2E backend: ${JSON.stringify(info)}`);
  }
}
