import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = async (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('server credentials have no committed fallback values', async () => {
  const server = await source('src/lib/insforge/server.ts');
  assert.match(server, /process\.env\[name\]/);
  assert.match(server, /requiredServerEnv\('INSFORGE_URL'\)/);
  assert.match(server, /requiredServerEnv\('INSFORGE_API_KEY'\)/);
  assert.doesNotMatch(server, /https:\/\/[a-z0-9-]+\.insforge\.app/);
});

test('authentication requires strong configuration and bcrypt passwords', async () => {
  const auth = await source('src/lib/auth.ts');
  const login = await source('src/app/api/auth/login/route.ts');
  assert.match(auth, /secret\.length < 32/);
  assert.match(auth, /bcrypt\.compare/);
  assert.match(login, /verifyPassword\(password, user\.password_hash\)/);
  assert.doesNotMatch(login, /password\s*===\s*(?:user\.)?password/i);
  assert.doesNotMatch(login, /password123|admin123|demo/i);
});

test('admin switch endpoint is protected by an admin session', async () => {
  const route = await source('src/app/api/auth/switch/route.ts');
  assert.match(route, /requireAdmin/);
  assert.match(route, /auth\.user\.role !== 'SUPER_ADMIN'/);
  assert.match(route, /targetUser\.role !== 'USER'/);
  assert.doesNotMatch(route, /admin@|superadmin@/i);
});

test('sensitive uploads use private storage and server-owned folders', async () => {
  const upload = await source('src/app/api/upload/route.ts');
  assert.match(upload, /payment-evidence/);
  assert.match(upload, /verification-documents/);
  assert.match(upload, /user\.id/);
  assert.match(upload, /'payment-proofs': \{ bucket: 'payment-evidence'/);
});

test('payment approval delegates to the atomic database operation', async () => {
  const route = await source('src/app/api/payments/proofs/route.ts');
  assert.match(route, /approve_payment_proof/);
  assert.match(route, /requireAdmin/);
});

test('private evidence submissions require user-owned upload keys', async () => {
  const payment = await source('src/app/api/payments/proofs/route.ts');
  const verification = await source('src/app/api/verifications/route.ts');
  assert.match(payment, /screenshotKey\.startsWith\(`\$\{auth\.user\.id\}\/payment-proofs\/`\)/);
  assert.match(verification, /key\.startsWith\(`\$\{auth\.user\.id\}\/verifications\/`\)/);
});

test('profile photos are served through short-lived signed links', async () => {
  const dto = await source('src/lib/profile-dto.ts');
  const matches = await source('src/app/api/matches/route.ts');
  assert.match(dto, /createSignedUrl\(photo\.storage_key/);
  assert.match(matches, /createSignedUrl\(photo\.storage_key/);
});

test('moderator role cannot access full administrator operations', async () => {
  const auth = await source('src/lib/api-auth.ts');
  const middleware = await source('src/middleware.ts');
  assert.match(auth, /ADMIN_ROLES = new Set\(\['SUPER_ADMIN', 'ADMIN'\]\)/);
  assert.doesNotMatch(middleware, /'MODERATOR'/);
});

test('password changes verify the old password and invalidate other sessions', async () => {
  const route = await source('src/app/api/auth/password/route.ts');
  assert.match(route, /verifyPassword\(currentPassword/);
  assert.match(route, /hashPassword\(newPassword\)/);
  assert.match(route, /session_version: sessionVersion/);
  assert.match(route, /response\.cookies\.set/);
});

test('interest charging rejects stale connection balances', async () => {
  const route = await source('src/app/api/interests/route.ts');
  assert.match(route, /\.eq\('used_connections', auth\.user\.used_connections/);
  assert.match(route, /\.eq\('remaining_connections', auth\.user\.remaining_connections/);
});

test('middleware protects member and admin pages', async () => {
  const middleware = await source('src/middleware.ts');
  assert.match(middleware, /\/dashboard/);
  assert.match(middleware, /\/admin/);
  assert.match(middleware, /ADMIN/);
  assert.match(middleware, /SUPER_ADMIN/);
});
