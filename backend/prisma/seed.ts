import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Déménagement', description: 'Aide au déménagement, transport de meubles, etc.' },
  { name: 'Jardinage', description: 'Entretien de jardin, tonte, taille, etc.' },
  { name: 'Ménage', description: 'Nettoyage intérieur, vitres, repassage, etc.' },
  { name: 'Livraison', description: 'Livraison de colis, courses, coursiers, etc.' },
  { name: 'Bricolage', description: 'Montage de meubles, petites réparations, etc.' },
  { name: 'Éducation', description: 'Cours particuliers, soutien scolaire, etc.' },
  { name: 'Informatique', description: 'Dépannage, installation réseau, etc.' },
];

async function main() {
  console.log('Start seeding categories...');
  for (const c of categories) {
    const category = await prisma.category.upsert({
      where: { name: c.name },
      update: {},
      create: {
        name: c.name,
        description: c.description,
      },
    });
    console.log(`Created category: ${category.name}`);
  }
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
