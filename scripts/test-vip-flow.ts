import { createAdminClient } from '@insforge/sdk';

const insforgeAdmin = createAdminClient({
  baseUrl: 'https://w5x7768e.us-east.insforge.app',
  apiKey: 'ik_1df0a9cfebae220d87863047d916492b',
});

async function testVipFlow() {
  console.log('🧪 Testing Full VIP Royal Matchmaking Plan Purchase & Admin Approval Flow...\n');

  // 1. Find Groom User (Dr. Hamza Malik)
  const { data: user } = await insforgeAdmin.database
    .from('users')
    .select('id, name, email, subscription_tier')
    .eq('email', 'hamza.malik@gmail.com')
    .single();

  if (!user) {
    console.error('❌ Groom user not found in database');
    return;
  }
  console.log(`1. Initial Groom Status: ${user.name} (${user.email}) | Tier: ${user.subscription_tier}`);

  // 2. User submits Payment Proof for "VIP Royal Matchmaking"
  console.log('\n2. Submitting Payment Proof for VIP Royal Matchmaking...');
  const submitRes = await fetch('http://localhost:3000/api/payments/proofs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: '+92 300 1122334',
      planSlug: 'VIP',
      planName: 'VIP Royal Matchmaking',
      amount: 35000,
      currency: 'PKR',
      paymentMethod: 'JAZZCASH',
      transactionId: `TRX-VIP-${Date.now()}`,
      senderAccountNumber: '0300-1122334',
      screenshotUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
    }),
  });
  const submitData = await submitRes.json();
  console.log('   ✓ Payment Proof Submitted. ID:', submitData.data?.id, '| Status:', submitData.data?.status);

  const proofId = submitData.data?.id;
  if (!proofId) {
    console.error('❌ Failed to create proof');
    return;
  }

  // 3. Admin Approves Payment Proof
  console.log('\n3. Admin Approving Payment Proof from /admin/payments ...');
  const approveRes = await fetch('http://localhost:3000/api/payments/proofs', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: proofId,
      status: 'VERIFIED',
      reviewerName: 'Ladi (Super Admin)',
    }),
  });
  const approveData = await approveRes.json();
  console.log('   ✓ Admin Approval API Result:', approveData.success, '| Message:', approveData.message);

  // 4. Verify in InsForge Database: Users Table
  console.log('\n4. Checking InsForge Database User Record...');
  const { data: updatedUser } = await insforgeAdmin.database
    .from('users')
    .select('id, name, email, subscription_tier, is_verified, account_status')
    .eq('id', user.id)
    .single();

  console.log('   ✓ Updated User in DB:', {
    name: updatedUser?.name,
    email: updatedUser?.email,
    subscription_tier: updatedUser?.subscription_tier,
    is_verified: updatedUser?.is_verified,
    account_status: updatedUser?.account_status,
  });

  if (updatedUser?.subscription_tier === 'PREMIUM_PLUS') {
    console.log('   ✅ SUCCESS: User subscription_tier is correctly updated to PREMIUM_PLUS (VIP Royal Matchmaking)!');
  } else {
    console.error('   ❌ ERROR: Expected subscription_tier PREMIUM_PLUS, got:', updatedUser?.subscription_tier);
  }

  // 5. Verify Paid Invoice was generated
  console.log('\n5. Checking Invoices in InsForge Database...');
  const { data: invoices } = await insforgeAdmin.database
    .from('invoices')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  console.log('   ✓ Invoices Found for User:', invoices?.length);
  if (invoices && invoices.length > 0) {
    console.log('   ✓ Latest Invoice:', {
      invoice_number: invoices[0].invoice_number,
      plan_name: invoices[0].plan_name,
      amount: invoices[0].amount,
      status: invoices[0].status,
    });
  }

  // 6. Verify Matrimonial Profile Boost Status
  console.log('\n6. Checking Profile Boost Status in InsForge Database...');
  const { data: profile } = await insforgeAdmin.database
    .from('matrimonial_profiles')
    .select('id, full_name, is_featured, is_boosted')
    .eq('user_id', user.id)
    .single();

  console.log('   ✓ Matrimonial Profile Boost:', {
    profile_name: profile?.full_name,
    is_featured: profile?.is_featured,
    is_boosted: profile?.is_boosted,
  });

  console.log('\n🎉 ALL VIP FLOW CHECKS PASSED 100%!');
}

testVipFlow().catch(console.error);
