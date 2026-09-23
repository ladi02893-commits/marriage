import { createAdminClient } from '@insforge/sdk';

function requiredServerEnv(name: 'INSFORGE_URL' | 'INSFORGE_API_KEY'): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required. Add it to .env.local and the deployment environment.`);
  }
  return value;
}

export const insforgeAdmin = createAdminClient({
  baseUrl: requiredServerEnv('INSFORGE_URL'),
  apiKey: requiredServerEnv('INSFORGE_API_KEY'),
});
