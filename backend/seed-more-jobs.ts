import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const jean = await prisma.user.findUnique({
    where: { email: 'jean.dupont@employeur.com' }
  });

  if (!jean) {
    console.error("Jean Dupont n'existe pas !");
    return;
  }

  const category1 = await prisma.category.findFirst({ where: { name: 'Bricolage' } });
  const category2 = await prisma.category.findFirst({ where: { name: 'Livraison' } });
  const category3 = await prisma.category.findFirst({ where: { name: 'Jardinage' } });

  const cat1Id = category1?.id || (await prisma.category.findFirst())!.id;
  const cat2Id = category2?.id || cat1Id;
  const cat3Id = category3?.id || cat1Id;

  await prisma.job.createMany({
    data: [
      {
        title: 'Montage de meuble TV',
        description: 'Besoin d\'aide pour monter un grand meuble TV de salon.',
        price: 50.0,
        location: 'Paris 12e',
        status: 'PENDING',
        employerId: jean.id,
        categoryId: cat1Id,
      },
      {
        title: 'Livraison de cartons de déménagement',
        description: 'J\'ai besoin de faire transporter 5 gros cartons vers mon nouveau logement.',
        price: 45.0,
        location: 'Paris 15e',
        status: 'PUBLISHED',
        employerId: jean.id,
        categoryId: cat2Id,
      },
      {
        title: 'Nettoyage terrasse et jardin',
        description: 'Ma terrasse a besoin d\'un bon coup de karcher et le gazon doit être tondu.',
        price: 90.0,
        location: 'Versailles',
        status: 'PUBLISHED',
        employerId: jean.id,
        categoryId: cat3Id,
      }
    ]
  });

  console.log('3 nouvelles missions créées avec succès pour Jean Dupont !');
}

main().catch(console.error).finally(() => prisma.$disconnect());
