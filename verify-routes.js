const http = require('http');

const routes = [
  '/',
  '/search',
  '/pricing',
  '/about',
  '/stories',
  '/safety',
  '/contact',
  '/privacy',
  '/terms',
  '/login',
  '/register',
  '/forgot-password',
  '/profile/profile-1',
  '/dashboard',
  '/dashboard/profile',
  '/dashboard/discover',
  '/dashboard/interests',
  '/dashboard/favorites',
  '/dashboard/messages',
  '/dashboard/notifications',
  '/dashboard/subscription',
  '/dashboard/verification',
  '/dashboard/privacy',
  '/dashboard/analytics',
  '/dashboard/support',
  '/dashboard/settings',
  '/admin',
  '/admin/users',
  '/admin/profiles',
  '/admin/verifications',
  '/admin/reports',
  '/admin/subscriptions',
  '/admin/coupons',
  '/admin/cms',
  '/admin/analytics',
  '/admin/settings',
  '/admin/audit-logs',
  '/api/profiles',
  '/api/users',
  '/api/verifications',
  '/api/reports',
  '/api/payments/proofs',
  '/api/invoices',
  '/api/receiving-accounts',
  '/api/matches',
  '/api/admin/stats'
];

async function checkRoute(route) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${route}`, (res) => {
      console.log(`[STATUS ${res.statusCode}] ${route}`);
      resolve(res.statusCode);
    }).on('error', (err) => {
      console.error(`[ERROR] ${route}: ${err.message}`);
      resolve(500);
    });
  });
}

async function run() {
  console.log('Testing all platform endpoints...');
  for (const r of routes) {
    await checkRoute(r);
  }
  console.log('Finished route testing.');
}

run();

