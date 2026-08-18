import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Connecting to Prisma Postgres database...');
  try {
    const [
      users,
      profiles,
      proofs,
      invoices,
      verifs,
      reports,
      accounts,
      interests,
      plans
    ] = await Promise.all([
      prisma.user.count(),
      prisma.matrimonialProfile.count(),
      prisma.paymentProof.count(),
      prisma.invoice.count(),
      prisma.verificationRequest.count(),
      prisma.abuseReport.count(),
      prisma.receivingAccount.count(),
      prisma.interestRequest.count(),
      prisma.subscriptionPlan.count(),
    ]);

    console.log(`✅ Connected`);
    console.log(`Database state verified:`);
    console.log(`- Users: ${users}`);
    console.log(`- Profiles: ${profiles}`);
    console.log(`- Payment Proofs: ${proofs}`);
    console.log(`- Invoices: ${invoices}`);
    console.log(`- Verification Requests: ${verifs}`);
    console.log(`- Abuse Reports: ${reports}`);
    console.log(`- Receiving Accounts: ${accounts}`);
    console.log(`- Interest Requests: ${interests}`);
    console.log(`- Subscription Plans: ${plans}`);
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Connection verification failed:', error.message);
    process.exit(1);
  }
}

main();
