const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default admin user
  const passwordHash = await bcrypt.hash('admin123', 12);

  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@graspelectric.com' },
    update: {},
    create: {
      email: 'admin@graspelectric.com',
      passwordHash,
      name: 'Admin User',
      isActive: true,
    },
  });

  console.log('Created admin user:', admin.email);

  // Create categories
  const categories = [
    {
      name: 'Polycarbonate Enclosures',
      slug: 'polycarbonate-enclosures',
      code: 'GE-PC Series',
      description: 'High-quality polycarbonate enclosures with excellent UV resistance and impact strength.',
      isFeatured: true,
      sortOrder: 1,
    },
    {
      name: 'Metal Enclosures',
      slug: 'metal-enclosures',
      code: 'GE-MT Series',
      description: 'Robust steel and aluminum enclosures for demanding industrial environments.',
      isFeatured: true,
      sortOrder: 2,
    },
    {
      name: 'Junction Boxes',
      slug: 'junction-boxes',
      code: 'GE-JB Series',
      description: 'Versatile junction boxes for electrical connections and cable management.',
      isFeatured: true,
      sortOrder: 3,
    },
    {
      name: 'Terminal Enclosures',
      slug: 'terminal-enclosures',
      code: 'GE-TB Series',
      description: 'Specialized enclosures designed for terminal blocks and connection points.',
      isFeatured: false,
      sortOrder: 4,
    },
    {
      name: 'Hazardous Area Enclosures',
      slug: 'hazardous-area-enclosures',
      code: 'GE-HZ Series',
      description: 'ATEX certified enclosures for explosive atmospheres and hazardous locations.',
      isFeatured: true,
      sortOrder: 5,
    },
    {
      name: 'Custom Solutions',
      slug: 'custom-solutions',
      code: 'GE-CS Series',
      description: 'Tailored enclosure solutions designed to meet your specific requirements.',
      isFeatured: false,
      sortOrder: 6,
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  console.log('Created', categories.length, 'categories');

  // Create default settings
  const settings = [
    { key: 'company_name', value: 'Grasp Electric' },
    { key: 'company_email', value: 'info@graspelectric.com' },
    { key: 'company_phone', value: '+91 1234567890' },
    { key: 'company_address', value: 'Industrial Area, India' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('Created default settings');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
