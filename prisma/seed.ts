import { Role, SubscriptionTier, Gender, MaritalStatus, Religion, DietType, HabitFrequency, FamilyType, FamilyValues } from '@prisma/client';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🌱 Seeding Pakistani Database...');

  // 1. Super Admin User: Laddi
  await prisma.user.upsert({
    where: { email: 'ladi02893@gmail.com' },
    update: {
      passwordHash: 'ladi02893',
      role: Role.SUPER_ADMIN,
      isVerified: true,
      subscriptionTier: SubscriptionTier.PREMIUM_PLUS,
    },
    create: {
      email: 'ladi02893@gmail.com',
      passwordHash: 'ladi02893',
      name: 'Ladi (Super Admin)',
      role: Role.SUPER_ADMIN,
      isVerified: true,
      subscriptionTier: SubscriptionTier.PREMIUM_PLUS,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    },
  });

  // 2. Amna Khan (Girl #1)
  await prisma.user.upsert({
    where: { email: 'amna.khan@gmail.com' },
    update: {
      passwordHash: 'password123',
      role: Role.USER,
      subscriptionTier: SubscriptionTier.FREE,
    },
    create: {
      email: 'amna.khan@gmail.com',
      passwordHash: 'password123',
      name: 'Amna Khan',
      role: Role.USER,
      isVerified: true,
      subscriptionTier: SubscriptionTier.FREE,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    },
  });

  // 3. Boys
  const boys = [
    { name: 'Dr. Hamza Malik', email: 'hamza.malik@gmail.com' },
    { name: 'Engr. Bilal Ahmed', email: 'bilal.ahmed@gmail.com' },
    { name: 'Usman Tariq', email: 'usman.tariq@gmail.com' },
    { name: 'Ali Raza Kazmi', email: 'ali.raza@gmail.com' },
    { name: 'Shahzad Arain', email: 'shahzad.arain@gmail.com' },
    { name: 'Farhan Cheema', email: 'farhan.cheema@gmail.com' },
    { name: 'Dr. Hassan Niazi', email: 'hassan.niazi@gmail.com' },
    { name: 'Waleed Sheikh', email: 'waleed.sheikh@gmail.com' },
    { name: 'Taimoor Abbasi', email: 'taimoor.abbasi@gmail.com' },
    { name: 'Danyal Memon', email: 'danyal.memon@gmail.com' },
  ];

  for (const b of boys) {
    await prisma.user.upsert({
      where: { email: b.email },
      update: {
        passwordHash: 'password123',
        role: Role.USER,
        subscriptionTier: SubscriptionTier.FREE,
      },
      create: {
        email: b.email,
        passwordHash: 'password123',
        name: b.name,
        role: Role.USER,
        isVerified: true,
        subscriptionTier: SubscriptionTier.FREE,
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
      },
    });
  }

  // 4. Girls
  const girls = [
    { name: 'Dr. Zainab Qureshi', email: 'zainab.qureshi@gmail.com' },
    { name: 'Fatima Zahra Kazmi', email: 'fatima.zahra@gmail.com' },
    { name: 'Areeba Rajput', email: 'areeba.rajput@gmail.com' },
    { name: 'Mariam Arain', email: 'mariam.arain@gmail.com' },
    { name: 'Hira Siddiqui', email: 'hira.siddiqui@gmail.com' },
    { name: 'Noor-ul-Ain Malik', email: 'noor.malik@gmail.com' },
    { name: 'Ayesha Butt', email: 'ayesha.butt@gmail.com' },
    { name: 'Dr. Mahnoor Gujjar', email: 'mahnoor.gujjar@gmail.com' },
    { name: 'Sara Abbasi', email: 'sara.abbasi@gmail.com' },
  ];

  for (const g of girls) {
    await prisma.user.upsert({
      where: { email: g.email },
      update: {
        passwordHash: 'password123',
        role: Role.USER,
        subscriptionTier: SubscriptionTier.FREE,
      },
      create: {
        email: g.email,
        passwordHash: 'password123',
        name: g.name,
        role: Role.USER,
        isVerified: true,
        subscriptionTier: SubscriptionTier.FREE,
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      },
    });
  }

  console.log('✅ Seed completed with 20 Pakistani Candidate profiles!');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
