import { createAdminClient } from '@insforge/sdk';

const insforgeAdmin = createAdminClient({
  baseUrl: 'https://w5x7768e.us-east.insforge.app',
  apiKey: 'ik_1df0a9cfebae220d87863047d916492b',
});

async function inspect() {
  console.log('🔍 Inspecting Current Database Records...');

  const { data: users } = await insforgeAdmin.database.from('users').select('*');
  console.log('\n--- USERS IN DATABASE ---');
  users?.forEach(u => {
    console.log(`ID: ${u.id} | Name: ${u.name} | Email: ${u.email} | Tier: ${u.subscription_tier} | Status: ${u.account_status} | Verified: ${u.is_verified}`);
  });

  const { data: proofs } = await insforgeAdmin.database.from('payment_proofs').select('*');
  console.log('\n--- PAYMENT PROOFS IN DATABASE ---');
  if (!proofs || proofs.length === 0) {
    console.log('(No payment proofs in database)');
  } else {
    proofs.forEach(p => {
      console.log(`Proof ID: ${p.id} | User ID: ${p.user_id} | User: ${p.user_name} (${p.user_email}) | Plan: ${p.plan_name} (${p.plan_slug}) | Status: ${p.status}`);
    });
  }

  const { data: invoices } = await insforgeAdmin.database.from('invoices').select('*');
  console.log('\n--- INVOICES IN DATABASE ---');
  if (!invoices || invoices.length === 0) {
    console.log('(No invoices in database)');
  } else {
    invoices.forEach(inv => {
      console.log(`Invoice: ${inv.invoice_number} | User ID: ${inv.user_id} | Plan: ${inv.plan_name} | Amount: ${inv.amount} | Status: ${inv.status}`);
    });
  }
}

inspect().catch(console.error);
