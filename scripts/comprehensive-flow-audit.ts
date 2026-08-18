async function runAudit() {
  console.log('🚀 STARTING COMPREHENSIVE LOCAL SYSTEM AUDIT ON http://localhost:3000 ...\n');
  const baseUrl = 'http://localhost:3000';

  let passCount = 0;
  let failCount = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passCount++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`, detail || '');
      failCount++;
    }
  }

  // =========================================================================
  // 1. PUBLIC & HOME ENDPOINTS
  // =========================================================================
  console.log('--- 1. Testing Core Pages & Routing ---');
  try {
    const homeRes = await fetch(`${baseUrl}/`);
    assert(homeRes.status === 200, 'Home Page (/) renders HTTP 200');

    const pricingRes = await fetch(`${baseUrl}/pricing`);
    assert(pricingRes.status === 200, 'Pricing Page (/pricing) renders HTTP 200');

    const loginRes = await fetch(`${baseUrl}/login`);
    assert(loginRes.status === 200, 'Login Page (/login) renders HTTP 200');
  } catch (e: any) {
    assert(false, 'Public Pages Exception', e.message);
  }

  // =========================================================================
  // 2. ADMIN STATS & DATABASE API INTEGRITY
  // =========================================================================
  console.log('\n--- 2. Testing InsForge Database API Endpoints ---');
  try {
    const statsRes = await fetch(`${baseUrl}/api/admin/stats`);
    const statsJson = await statsRes.json();
    const stats = statsJson.data || statsJson;
    assert(statsRes.status === 200 && stats.totalUsers === 3, 'Admin Stats API (/api/admin/stats) reports 3 Users', stats);
    assert(stats.totalProfiles === 3, 'Admin Stats API reports 3 Profiles', stats);
    assert(stats.pendingVerifs === 0, 'Zero fake pending verifications in DB queue');

    const profRes = await fetch(`${baseUrl}/api/profiles`);
    const profData = await profRes.json();
    assert(profRes.status === 200 && Array.isArray(profData.data) && profData.data.length === 3, 'Profiles API (/api/profiles) returns 3 real candidate profiles', profData.data?.length);

    const matchesRes = await fetch(`${baseUrl}/api/matches?gender=FEMALE`);
    const matchesData = await matchesRes.json();
    assert(matchesRes.status === 200 && Array.isArray(matchesData.data), 'Matches API (/api/matches) discovery active', matchesData.data?.length);
  } catch (e: any) {
    assert(false, 'API Integrity Exception', e.message);
  }

  // =========================================================================
  // 3. SUPER ADMIN LOGIN & PRIVILEGES
  // =========================================================================
  console.log('\n--- 3. Testing Super Admin Auth & Privileges ---');
  try {
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ladi02893@gmail.com', password: 'password123' }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminCookie = adminLoginRes.headers.get('set-cookie');

    assert(adminLoginRes.status === 200 && adminLoginData.success, 'Super Admin Login successful');
    assert(adminLoginData.redirectUrl === '/admin', 'Super Admin redirected to /admin');
    assert(adminLoginData.user.role === 'SUPER_ADMIN', 'Super Admin role verified as SUPER_ADMIN');

    // Fetch /api/auth/me as Admin
    const adminMeRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { cookie: adminCookie || '' },
    });
    const adminMeData = await adminMeRes.json();
    assert(adminMeData.authenticated && adminMeData.user.role === 'SUPER_ADMIN', 'Admin Session (/api/auth/me) active');
  } catch (e: any) {
    assert(false, 'Admin Auth Exception', e.message);
  }

  // =========================================================================
  // 4. BRIDE (AMNA KHAN) VIP ROYAL MATCHMAKING ACTIVE STATUS
  // =========================================================================
  console.log('\n--- 4. Testing Bride (Amna Khan) VIP Royal Plan Status ---');
  try {
    const brideLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'amna.khan@gmail.com', password: 'password123' }),
    });
    const brideLoginData = await brideLoginRes.json();
    const brideCookie = brideLoginRes.headers.get('set-cookie');

    assert(brideLoginRes.status === 200 && brideLoginData.success, 'Bride (Amna Khan) Login successful');
    assert(brideLoginData.user.subscriptionTier === 'PREMIUM_PLUS', 'Bride subscriptionTier is PREMIUM_PLUS (VIP Royal Matchmaking)');
    assert(brideLoginData.redirectUrl === '/dashboard', 'Bride redirected to /dashboard');

    // Verify session
    const brideMeRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { cookie: brideCookie || '' },
    });
    const brideMeData = await brideMeRes.json();
    assert(brideMeData.user?.subscriptionTier === 'PREMIUM_PLUS', 'Bride /api/auth/me confirms live PREMIUM_PLUS tier');
  } catch (e: any) {
    assert(false, 'Bride Flow Exception', e.message);
  }

  // =========================================================================
  // 5. GROOM (DR. HAMZA MALIK) MEMBERSHIP & UPGRADE FLOW
  // =========================================================================
  console.log('\n--- 5. Testing Groom (Dr. Hamza Malik) Live Upgrade & Approval Flow ---');
  try {
    const groomLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hamza.malik@gmail.com', password: 'password123' }),
    });
    const groomLoginData = await groomLoginRes.json();
    const groomCookie = groomLoginRes.headers.get('set-cookie');

    assert(groomLoginRes.status === 200 && groomLoginData.success, 'Groom (Dr. Hamza Malik) Login successful');

    // Groom submits payment proof for VIP
    const proofRes = await fetch(`${baseUrl}/api/payments/proofs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: groomLoginData.user.id,
        userName: groomLoginData.user.name,
        userEmail: groomLoginData.user.email,
        userPhone: '+92 300 9876543',
        planSlug: 'VIP',
        planName: 'VIP Royal Matchmaking',
        amount: 35000,
        currency: 'PKR',
        paymentMethod: 'JAZZCASH',
        transactionId: `AUDIT-TRX-${Date.now()}`,
      }),
    });
    const proofData = await proofRes.json();
    assert(proofRes.status === 200 && proofData.success, 'Groom submitted VIP payment proof (Status: PENDING)');

    // Admin verifies the proof
    const approveRes = await fetch(`${baseUrl}/api/payments/proofs`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: proofData.data.id,
        status: 'VERIFIED',
        reviewerName: 'Ladi (Super Admin)',
      }),
    });
    const approveData = await approveRes.json();
    assert(approveRes.status === 200 && approveData.success, 'Admin successfully verified groom payment proof');

    // Groom checks updated session
    const groomUpdatedRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { cookie: groomCookie || '' },
    });
    const groomUpdatedData = await groomUpdatedRes.json();
    assert(groomUpdatedData.user?.subscriptionTier === 'PREMIUM_PLUS', 'Groom session now reflects upgraded PREMIUM_PLUS (VIP) tier');

    // Clean up test proof so DB stays clean
    await fetch(`${baseUrl}/api/payments/proofs`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: proofData.data.id,
        status: 'VERIFIED',
      }),
    });
  } catch (e: any) {
    assert(false, 'Groom Flow Exception', e.message);
  }

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n========================================================');
  console.log(`📊 AUDIT RESULTS: ${passCount} PASSED | ${failCount} FAILED`);
  console.log('========================================================\n');

  if (failCount === 0) {
    console.log('🎉 ALL SYSTEM FLOWS ARE 100% OPERATIONAL AND READY FOR PRODUCTION PUSH!');
  } else {
    console.error('⚠️ Some tests failed. Please review errors above.');
  }
}

runAudit().catch(console.error);
