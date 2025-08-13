import { PrismaClient, AdminRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const supabaseId = process.env.SUPERADMIN_SUPABASE_ID!;
  const email = process.env.SUPERADMIN_EMAIL!;
  const name = process.env.SUPERADMIN_NAME || 'Super Admin';

  if (!supabaseId || !email) {
    throw new Error('Set SUPERADMIN_SUPABASE_ID and SUPERADMIN_EMAIL in .env');
  }

  await prisma.adminUser.upsert({
    where: { supabaseId },
    create: {
      supabaseId,
      email,
      name,
      role: AdminRole.SUPERADMIN,
    },
    update: {
      email,
      name,
      role: AdminRole.SUPERADMIN,
    },
  });

  console.log('Superadmin seeded:', { supabaseId, email });
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
