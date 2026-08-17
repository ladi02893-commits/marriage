import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Connecting to Prisma Postgres database...');
  try {
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: { email: true, role: true, name: true },
    });

    console.log(`✅ Connected`);
    console.log(`Database state verified:`);
    console.log(`- Total Users in DB: ${userCount}`);
    users.forEach((u) => {
      console.log(`  • ${u.name} (${u.email}) - Role: ${u.role}`);
    });
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Connection verification failed:', error.message);
    process.exit(1);
  }
}

main();
