import {
  PrismaClient,
  AdminRole,
  OrderStatus,
  TicketStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const supabaseId = process.env.SUPERADMIN_SUPABASE_ID!;
  const email = process.env.SUPERADMIN_EMAIL!;
  const name = process.env.SUPERADMIN_NAME || 'Super Admin';

  if (!supabaseId || !email) {
    throw new Error('Set SUPERADMIN_SUPABASE_ID and SUPERADMIN_EMAIL in .env');
  }

  // --- Superadmin ---
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
  console.log('✅ Superadmin seeded');

  // --- Partners ---
  const partnersData = [
    {
      name: 'Global Impact Org',
      contactEmail: 'contact@globalimpact.org',
      website: 'https://globalimpact.org',
    },
    {
      name: 'Tech for Good',
      contactEmail: 'hello@techforgood.com',
      website: 'https://techforgood.com',
    },
    {
      name: 'EcoSave',
      contactEmail: 'info@ecosave.org',
      website: 'https://ecosave.org',
    },
  ];

  await prisma.partner.createMany({
    data: partnersData,
    skipDuplicates: true,
  });
  console.log('✅ Partners seeded');

  const partners = await prisma.partner.findMany();

  // --- Events ---
  const eventsData = [
    {
      name: 'Clean Water Initiative',
      type: 'Charity',
      description: 'Providing clean drinking water to rural communities.',
      location: 'Nairobi',
      date: new Date('2025-09-10'),
      partnerId: partners[0].id,
    },
    {
      name: 'Tree Planting Day',
      type: 'Environmental',
      description: 'A day to plant trees and restore green spaces.',
      location: 'Kigali',
      date: new Date('2025-10-01'),
      partnerId: partners[2].id,
    },
    {
      name: 'Tech Literacy Workshop',
      type: 'Education',
      description: 'Teaching basic computer skills to young learners.',
      location: 'Accra',
      date: new Date('2025-11-15'),
      partnerId: partners[1].id,
    },
  ];

  await prisma.event.createMany({
    data: eventsData,
    skipDuplicates: true,
  });
  console.log('✅ Events seeded');

  const events = await prisma.event.findMany();

  // --- Products ---
  const productsData = [
    {
      name: 'Reusable Water Bottle',
      description: 'Eco-friendly water bottle.',
      type: 'Merchandise',
      price: 15.0,
      stockQuantity: 100,
      eventId: events[0].id,
    },
    {
      name: 'Tree Planting Kit',
      description: 'Kit for planting your own tree.',
      type: 'Merchandise',
      price: 25.0,
      stockQuantity: 50,
      eventId: events[1].id,
    },
    {
      name: 'USB Learning Drive',
      description: 'Contains free educational resources.',
      type: 'Merchandise',
      price: 10.0,
      stockQuantity: 200,
      eventId: events[2].id,
    },
  ];

  await prisma.product.createMany({
    data: productsData,
    skipDuplicates: true,
  });
  console.log('✅ Products seeded');

  const products = await prisma.product.findMany();

  // --- Images ---
  const imagesData = products.map((product) => ({
    productId: product.id,
    type: 'thumbnail',
    fileUrl: `https://placehold.co/400x400?text=${encodeURIComponent(product.name)}`,
    alt: `${product.name} image`,
  }));

  await prisma.image.createMany({
    data: imagesData,
    skipDuplicates: true,
  });
  console.log('✅ Images seeded');

  console.log('🎯 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
