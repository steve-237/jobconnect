import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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

  console.log('Seeding admin user...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin', salt);
  
  await prisma.user.upsert({
    where: { email: 'admin@jobconnect.com' },
    update: {},
    create: {
      email: 'admin@jobconnect.com',
      passwordHash,
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
    },
  });
  console.log('Created admin user: admin@jobconnect.com');

  console.log('Seeding test users...');
  const testPasswordHash = await bcrypt.hash('test', salt);
  
  await prisma.user.upsert({
    where: { email: 'employeur@test.com' },
    update: {},
    create: {
      email: 'employeur@test.com',
      passwordHash: testPasswordHash,
      firstName: 'Jean',
      lastName: 'Employeur',
      role: 'EMPLOYER',
    },
  });
  console.log('Created test employer: employeur@test.com');

  await prisma.user.upsert({
    where: { email: 'candidat@test.com' },
    update: {},
    create: {
      email: 'candidat@test.com',
      passwordHash: testPasswordHash,
      firstName: 'Marc',
      lastName: 'Candidat',
      role: 'CANDIDATE',
    },
  });
  console.log('Created test candidate: candidat@test.com');

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
