const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error'],
});

// Common specs template for enclosure products
const commonSpecs = [
  { key: 'Environment Protection', value: 'ROHS and Halogen Free' },
  { key: 'Fire Rating', value: 'UL94V-0' },
  { key: 'ROHS Compliance', value: 'IEC 62321' },
  { key: 'Ambient Temperature', value: '-25 to +80 Deg. C' },
  { key: 'Glow Wire Test', value: '960 Deg. C as per IS 11000-2-1, IEC 60695-2-10' },
  { key: 'Impact Resistance', value: 'IK08/IK 07 as per IEC 60068-2-72' },
  { key: 'Ultraviolet Protection', value: 'UV Stabilised as per EN ISO 4892' },
  { key: 'Ingress Protection', value: 'IP 67 as per IEC-60529' },
  { key: 'Material', value: 'ABS/PC, with Transparent and Opaque Lid options' },
];

// Common features template for enclosure products
const commonFeatures = [
  'Plain walled enclosures.',
  'Rust proof polymer screws.',
  'Gland holes/Customizations can be carried out as per specific drawings.',
  'Parallel inner bush ribs for mounting din channel with self-tapping screw.',
  'Embedded M8 Nut for easy outside mounting without tampering enclosure and IP Rating.',
  'Stainless Steel Mounting Clamps/Polycarbonate Mounting Clamps with hardware (SS304)',
  'Available with Transparent cover (Optional).',
];

// Dimension options to randomly assign
const dimensions = [
  '80X80X55 mm',
  '120X80X55 mm',
  '120X120X60 mm',
  '140X105X55 mm',
  '180X130X60 mm',
  '180X180X100 mm',
  '220X150X90 mm',
  '280X190X100 mm',
  '380X280X130 mm',
  '560X380X180 mm',
];

async function main() {
  console.log('Starting product data seeding...\n');

  // Get all products
  const products = await prisma.product.findMany({
    include: {
      dynamicSpecs: true,
      features: true,
    },
  });

  console.log(`Found ${products.length} products to update.\n`);

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    console.log(`Processing: ${product.name} (${product.id})`);

    try {
      // Check if product already has specs
      if (product.dynamicSpecs.length > 0) {
        console.log(`  - Skipping specs (already has ${product.dynamicSpecs.length} specs)`);
      } else {
        // Add specs with a random dimension
        const randomDimension = dimensions[Math.floor(Math.random() * dimensions.length)];
        const specsWithDimension = [
          ...commonSpecs,
          { key: 'Dimension', value: randomDimension },
        ];

        await prisma.productDynamicSpec.createMany({
          data: specsWithDimension.map((spec, index) => ({
            productId: product.id,
            specKey: spec.key,
            specValue: spec.value,
            sortOrder: index,
          })),
        });
        console.log(`  - Added ${specsWithDimension.length} specs`);
      }

      // Check if product already has features
      if (product.features.length > 0) {
        console.log(`  - Skipping features (already has ${product.features.length} features)`);
      } else {
        await prisma.productFeature.createMany({
          data: commonFeatures.map((text, index) => ({
            productId: product.id,
            featureText: text,
            sortOrder: index,
          })),
        });
        console.log(`  - Added ${commonFeatures.length} features`);
      }

      updated++;
    } catch (error) {
      console.error(`  - Error: ${error.message}`);
      skipped++;
    }

    console.log('');
  }

  console.log('='.repeat(50));
  console.log(`Seeding completed!`);
  console.log(`  Updated: ${updated} products`);
  console.log(`  Skipped: ${skipped} products`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
