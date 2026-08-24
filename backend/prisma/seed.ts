import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const categories = [
  { name: 'Déménagement', description: 'Aide au déménagement, transport de meubles, etc.', iconUrl: 'truck' },
  { name: 'Jardinage', description: 'Entretien de jardin, tonte, taille, etc.', iconUrl: 'leaf' },
  { name: 'Ménage', description: 'Nettoyage intérieur, vitres, repassage, etc.', iconUrl: 'sparkles' },
  { name: 'Livraison', description: 'Livraison de colis, courses, coursiers, etc.', iconUrl: 'package' },
  { name: 'Bricolage', description: 'Montage de meubles, petites réparations, etc.', iconUrl: 'hammer' },
  { name: 'Éducation', description: 'Cours particuliers, soutien scolaire, etc.', iconUrl: 'book' },
  { name: 'Informatique', description: 'Dépannage, installation réseau, etc.', iconUrl: 'monitor' },
];

async function main() {
  console.log('Start seeding DB...');

  // 1. Catégories
  console.log('Seeding categories...');
  const categoryMap = new Map();
  for (const c of categories) {
    const category = await prisma.category.upsert({
      where: { name: c.name },
      update: {},
      create: {
        name: c.name,
        description: c.description,
        iconUrl: c.iconUrl,
      },
    });
    categoryMap.set(category.name, category);
  }

  // 2. Utilisateurs
  console.log('Seeding users...');
  const salt = await bcrypt.genSalt(10);
  const pwd = await bcrypt.hash('password123', salt);

  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@jobconnect.com' },
    update: {},
    create: { email: 'admin@jobconnect.com', passwordHash: pwd, firstName: 'System', lastName: 'Admin', role: 'ADMIN' },
  });

  // Employeurs
  const employer1 = await prisma.user.upsert({
    where: { email: 'jean.dupont@employeur.com' },
    update: {},
    create: { email: 'jean.dupont@employeur.com', passwordHash: pwd, firstName: 'Jean', lastName: 'Dupont', role: 'EMPLOYER', isVerified: true, bio: 'Je recherche souvent de l\'aide pour des petits travaux et aménagements.' },
  });
  const employer2 = await prisma.user.upsert({
    where: { email: 'marie.dubois@employeur.com' },
    update: {},
    create: { email: 'marie.dubois@employeur.com', passwordHash: pwd, firstName: 'Marie', lastName: 'Dubois', role: 'EMPLOYER', isVerified: true, bio: 'Maman de 3 enfants, j\'ai besoin d\'aide pour le ménage et le jardin.' },
  });
  const employer3 = await prisma.user.upsert({
    where: { email: 'sophie.bernard@employeur.com' },
    update: {},
    create: { email: 'sophie.bernard@employeur.com', passwordHash: pwd, firstName: 'Sophie', lastName: 'Bernard', role: 'EMPLOYER', isVerified: true, bio: 'Chef d\'entreprise cherchant des renforts ponctuels.' },
  });

  // Candidats
  const candidate1 = await prisma.user.upsert({
    where: { email: 'marc.bricole@candidat.com' },
    update: {},
    create: { email: 'marc.bricole@candidat.com', passwordHash: pwd, firstName: 'Marc', lastName: 'Bricoleur', role: 'CANDIDATE', isVerified: true, bio: 'Expert en montage de meubles IKEA et petits travaux de rénovation.' },
  });
  const candidate2 = await prisma.user.upsert({
    where: { email: 'lucie.jardin@candidat.com' },
    update: {},
    create: { email: 'lucie.jardin@candidat.com', passwordHash: pwd, firstName: 'Lucie', lastName: 'Jardin', role: 'CANDIDATE', isVerified: true, bio: 'J\'ai la main verte ! Je m\'occupe de vos jardins et espaces verts avec passion.' },
  });
  const candidate3 = await prisma.user.upsert({
    where: { email: 'paul.coursier@candidat.com' },
    update: {},
    create: { email: 'paul.coursier@candidat.com', passwordHash: pwd, firstName: 'Paul', lastName: 'Coursier', role: 'CANDIDATE', isVerified: true, bio: 'Livreur réactif et ponctuel, équipé d\'un véhicule d\'appoint.' },
  });

  // 3. Clean and Seed 16 Jobs
  console.log('Clearing old jobs & applications...');
  await prisma.transaction.deleteMany();
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();

  console.log('Seeding 16 realistic jobs...');

  const jobsData = [
    {
      title: 'Montage de 2 armoires IKEA PAX',
      description: 'Recherche personne expérimentée avec ses outils pour monter 2 armoires hautes avec portes coulissantes.',
      price: 85.0,
      location: 'Paris 15e',
      latitude: 48.8412,
      longitude: 2.2960,
      status: 'PUBLISHED' as const,
      employerId: employer1.id,
      categoryId: categoryMap.get('Bricolage').id,
    },
    {
      title: 'Tonte de pelouse & taille de haies (400m²)',
      description: 'Pelouse à tondre et haie de cyprès à égaliser. Tondeuse fournie sur place.',
      price: 65.0,
      location: 'Lyon 6e',
      latitude: 45.7680,
      longitude: 4.8557,
      status: 'PUBLISHED' as const,
      employerId: employer2.id,
      categoryId: categoryMap.get('Jardinage').id,
    },
    {
      title: 'Livraison express de documents officiels',
      description: 'Récupération d\'un pli important au centre-ville pour livraison immédiate avant 17h.',
      price: 35.0,
      location: 'Marseille Vieux-Port',
      latitude: 43.2965,
      longitude: 5.3698,
      status: 'PUBLISHED' as const,
      employerId: employer3.id,
      categoryId: categoryMap.get('Livraison').id,
    },
    {
      title: 'Grand ménage de printemps & vitres',
      description: 'Nettoyage complet d\'un appartement T3 de 70m² incluant baies vitrées et cuisine.',
      price: 120.0,
      location: 'Bordeaux Quinconces',
      latitude: 44.8448,
      longitude: -0.5742,
      status: 'PUBLISHED' as const,
      employerId: employer2.id,
      categoryId: categoryMap.get('Ménage').id,
    },
    {
      title: 'Aide déménagement studio 25m²',
      description: 'Besoin de 2 bras pour porter 10 cartons et 1 canapé du 2ème au 1er étage avec ascenseur.',
      price: 90.0,
      location: 'Toulouse Capitole',
      latitude: 43.6047,
      longitude: 1.4442,
      status: 'PUBLISHED' as const,
      employerId: employer1.id,
      categoryId: categoryMap.get('Déménagement').id,
    },
    {
      title: 'Cours particuliers de Mathématiques (Terminale)',
      description: 'Soutien intensif de 2 heures en algèbre et probabilités pour préparation au Bac.',
      price: 50.0,
      location: 'Lille Centre',
      latitude: 50.6366,
      longitude: 3.0635,
      status: 'PUBLISHED' as const,
      employerId: employer3.id,
      categoryId: categoryMap.get('Éducation').id,
    },
    {
      title: 'Dépannage PC Portable & Installation SSD',
      description: 'Mon ordinateur rame. Besoin de remplacer le disque dur par un SSD et réinstaller Windows 11.',
      price: 75.0,
      location: 'Nantes Centre',
      latitude: 47.2184,
      longitude: -1.5536,
      status: 'PUBLISHED' as const,
      employerId: employer1.id,
      categoryId: categoryMap.get('Informatique').id,
    },
    {
      title: 'Fixation TV Murale & Masquage des câbles',
      description: 'Pose d\'un support TV mural orientable sur mur en brique avec goulotte cache-câbles.',
      price: 55.0,
      location: 'Nice Promenade',
      latitude: 43.6961,
      longitude: 7.2656,
      status: 'PUBLISHED' as const,
      employerId: employer2.id,
      categoryId: categoryMap.get('Bricolage').id,
    },
    {
      title: 'Garde de chat à domicile (3 jours)',
      description: 'Passer 1h par jour pour nourrir mon chat, changer la litière et jouer un peu.',
      price: 60.0,
      location: 'Strasbourg Centre',
      latitude: 48.5734,
      longitude: 7.7521,
      status: 'PUBLISHED' as const,
      employerId: employer3.id,
      categoryId: categoryMap.get('Ménage').id,
    },
    {
      title: 'Rangement & Désencombrement d\'une cave',
      description: 'Aide à trier, mettre en étagères et évacuer des cartons encombrants à la déchetterie.',
      price: 70.0,
      location: 'Rennes Centre',
      latitude: 48.1173,
      longitude: -1.6778,
      status: 'PUBLISHED' as const,
      employerId: employer1.id,
      categoryId: categoryMap.get('Déménagement').id,
    },
    {
      title: 'Remplacement Robinet Cuisine & Syphon',
      description: 'Mon mitigeur de cuisine fuite. J\'ai acheté le nouveau robinet, besoin de pose propre.',
      price: 70.0,
      location: 'Montpellier Comédie',
      latitude: 43.6085,
      longitude: 3.8795,
      status: 'PUBLISHED' as const,
      employerId: employer2.id,
      categoryId: categoryMap.get('Bricolage').id,
    },
    {
      title: 'Cours d\'Anglais conversationnel (2h)',
      description: 'Session de conversation orale professionnelle en anglais avant un entretien d\'embauche.',
      price: 50.0,
      location: 'Paris 11e',
      latitude: 48.8590,
      longitude: 2.3780,
      status: 'PUBLISHED' as const,
      employerId: employer3.id,
      categoryId: categoryMap.get('Éducation').id,
    },
    {
      title: 'Peinture murale d\'une chambre (15m²)',
      description: 'Mise en peinture blanche d\'une chambre d\'enfant. Peinture et rouleaux fournis.',
      price: 160.0,
      location: 'Lyon Villeurbanne',
      latitude: 45.7715,
      longitude: 4.8820,
      status: 'PUBLISHED' as const,
      employerId: employer1.id,
      categoryId: categoryMap.get('Bricolage').id,
    },
    {
      title: 'Nettoyage complet état des lieux',
      description: 'Dépoussiérage, désinfection sanitaires et nettoyage sols pour remise des clés.',
      price: 110.0,
      location: 'Marseille Prado',
      latitude: 43.2680,
      longitude: 5.3890,
      status: 'PUBLISHED' as const,
      employerId: employer2.id,
      categoryId: categoryMap.get('Ménage').id,
    },
    {
      title: 'Transport & Livraison d\'une table en bois',
      description: 'Récupération d\'une table de salle à manger achetée sur LeBonCoin et livraison chez moi.',
      price: 45.0,
      location: 'Lille Vauban',
      latitude: 50.6310,
      longitude: 3.0480,
      status: 'PUBLISHED' as const,
      employerId: employer3.id,
      categoryId: categoryMap.get('Livraison').id,
    },
    {
      title: 'Taille d\'arbres fruitiers & ramassage',
      description: 'Taille légère de 3 pommiers et évacuation des branches mortes dans le jardin.',
      price: 85.0,
      location: 'Bordeaux Caudéran',
      latitude: 44.8490,
      longitude: -0.6120,
      status: 'PUBLISHED' as const,
      employerId: employer1.id,
      categoryId: categoryMap.get('Jardinage').id,
    },
  ];

  const createdJobs = [];
  for (const j of jobsData) {
    const created = await prisma.job.create({ data: j });
    createdJobs.push(created);
  }

  // 4. Sample Applications & Messages for demo
  console.log('Seeding demo applications & messages...');

  const app1 = await prisma.application.create({
    data: {
      jobId: createdJobs[0].id,
      candidateId: candidate1.id,
      message: 'Bonjour, j\'ai monté des dizaines d\'armoires PAX IKEA. Je suis disponible dès ce weekend avec ma boîte à outils !',
      isAccepted: false,
    },
  });

  const app2 = await prisma.application.create({
    data: {
      jobId: createdJobs[1].id,
      candidateId: candidate2.id,
      message: 'Bonjour Marie, j\'ai mon propre matériel professionnel. Je peux passer samedi matin.',
      isAccepted: true,
    },
  });

  await prisma.job.update({
    where: { id: createdJobs[1].id },
    data: { status: 'IN_PROGRESS' },
  });

  await prisma.message.create({
    data: {
      applicationId: app2.id,
      senderId: candidate2.id,
      content: 'Bonjour Marie ! Merci pour la confirmation. À quelle heure souhaitez-vous que j\'arrive samedi ?',
    },
  });

  await prisma.message.create({
    data: {
      applicationId: app2.id,
      senderId: employer2.id,
      content: 'Bonjour Lucie, parfait pour samedi 9h. Je vous attends avec plaisir !',
    },
  });

  // Sample Completed Job & Review
  await prisma.job.update({
    where: { id: createdJobs[3].id },
    data: { status: 'COMPLETED' },
  });

  await prisma.review.create({
    data: {
      jobId: createdJobs[3].id,
      rating: 5,
      comment: 'Service impeccable ! Appartement étincelant et vitres impeccables. Je recommande vivitement.',
      reviewerId: employer2.id,
      revieweeId: candidate1.id,
    },
  });

  console.log(`✅ Successfully seeded 16 jobs across major French cities!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
