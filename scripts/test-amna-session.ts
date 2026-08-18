async function testAmnaSession() {
  console.log('Testing Amna Khan Session & VIP Plan ...\n');

  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'amna.khan@gmail.com', password: 'password123' }),
  });

  const cookies = loginRes.headers.get('set-cookie');
  const loginData = await loginRes.json();
  console.log('1. Login API Response User:');
  console.log('   Name:', loginData.user.name);
  console.log('   Subscription Tier:', loginData.user.subscriptionTier);
  console.log('   Role:', loginData.user.role);

  // 2. Fetch /api/auth/me with Cookie
  const meRes = await fetch('http://localhost:3000/api/auth/me', {
    headers: {
      cookie: cookies || '',
    },
  });
  const meData = await meRes.json();
  console.log('\n2. /api/auth/me Session Response:');
  console.log('   Authenticated:', meData.authenticated);
  console.log('   User Name:', meData.user?.name);
  console.log('   Subscription Tier in Session:', meData.user?.subscriptionTier);

  if (meData.user?.subscriptionTier === 'PREMIUM_PLUS') {
    console.log('\n🎉 SUCCESS: Amna Khan is now 100% active on VIP Royal Matchmaking (PREMIUM_PLUS)!');
  } else {
    console.error('\n❌ FAILED: Expected PREMIUM_PLUS, got:', meData.user?.subscriptionTier);
  }
}

testAmnaSession().catch(console.error);
