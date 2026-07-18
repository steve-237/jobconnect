"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
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
    console.log('Seeding users...');
    const salt = await bcrypt.genSalt(10);
    const pwd = await bcrypt.hash('password123', salt);
    await prisma.user.upsert({
        where: { email: 'admin@jobconnect.com' },
        update: {},
        create: { email: 'admin@jobconnect.com', passwordHash: pwd, firstName: 'System', lastName: 'Admin', role: 'ADMIN' },
    });
    const employer1 = await prisma.user.upsert({
        where: { email: 'jean.dupont@employeur.com' },
        update: {},
        create: { email: 'jean.dupont@employeur.com', passwordHash: pwd, firstName: 'Jean', lastName: 'Dupont', role: 'EMPLOYER', isVerified: true, bio: 'Je recherche souvent de l\'aide pour des petits travaux.' },
    });
    const employer2 = await prisma.user.upsert({
        where: { email: 'marie.dubois@employeur.com' },
        update: {},
        create: { email: 'marie.dubois@employeur.com', passwordHash: pwd, firstName: 'Marie', lastName: 'Dubois', role: 'EMPLOYER', isVerified: true, bio: 'Maman de 3 enfants, j\'ai besoin d\'aide pour le ménage et le jardin.' },
    });
    const candidate1 = await prisma.user.upsert({
        where: { email: 'marc.bricole@candidat.com' },
        update: {},
        create: { email: 'marc.bricole@candidat.com', passwordHash: pwd, firstName: 'Marc', lastName: 'Bricoleur', role: 'CANDIDATE', isVerified: true, bio: 'Expert en montage de meubles IKEA et petits travaux.' },
    });
    const candidate2 = await prisma.user.upsert({
        where: { email: 'lucie.jardin@candidat.com' },
        update: {},
        create: { email: 'lucie.jardin@candidat.com', passwordHash: pwd, firstName: 'Lucie', lastName: 'Jardin', role: 'CANDIDATE', isVerified: true, bio: 'J\'ai la main verte ! Je m\'occupe de vos jardins avec passion.' },
    });
    const candidate3 = await prisma.user.upsert({
        where: { email: 'paul.coursier@candidat.com' },
        update: {},
        create: { email: 'paul.coursier@candidat.com', passwordHash: pwd, firstName: 'Paul', lastName: 'Coursier', role: 'CANDIDATE', isVerified: false, bio: 'Je livre vos colis rapidement sur Paris en vélo.' },
    });
    console.log('Seeding jobs...');
    await prisma.job.deleteMany();
    const job1 = await prisma.job.create({
        data: {
            title: 'Montage de 2 armoires PAX',
            description: 'Je recherche quelqu\'un d\'expérimenté pour monter deux grandes armoires IKEA PAX ce weekend.',
            price: 80.0,
            location: 'Paris 15e',
            status: 'PUBLISHED',
            employerId: employer1.id,
            categoryId: categoryMap.get('Bricolage').id,
        }
    });
    const job2 = await prisma.job.create({
        data: {
            title: 'Tonte de pelouse (500m2)',
            description: 'La pelouse est très haute, j\'ai la tondeuse mais pas le temps. A faire rapidement.',
            price: 50.0,
            location: 'Lyon',
            status: 'PUBLISHED',
            employerId: employer2.id,
            categoryId: categoryMap.get('Jardinage').id,
        }
    });
    const job3 = await prisma.job.create({
        data: {
            title: 'Livraison d\'un colis urgent',
            description: 'J\'ai oublié mes clés au bureau, quelqu\'un peut-il faire l\'aller-retour ?',
            price: 30.0,
            location: 'Marseille',
            status: 'MATCHING',
            employerId: employer1.id,
            categoryId: categoryMap.get('Livraison').id,
        }
    });
    const job4 = await prisma.job.create({
        data: {
            title: 'Grand ménage de printemps',
            description: 'Ménage complet de mon appartement de 60m2, incluant les vitres.',
            price: 120.0,
            location: 'Bordeaux',
            status: 'COMPLETED',
            employerId: employer2.id,
            categoryId: categoryMap.get('Ménage').id,
        }
    });
    console.log('Seeding applications...');
    await prisma.application.create({
        data: {
            jobId: job1.id,
            candidateId: candidate1.id,
            message: 'Bonjour, j\'ai l\'habitude de monter des armoires PAX. Je suis disponible samedi matin.',
            isAccepted: false,
        }
    });
    const appJob2 = await prisma.application.create({
        data: {
            jobId: job2.id,
            candidateId: candidate2.id,
            message: 'Bonjour Marie, je suis dispo pour tonter votre pelouse ce dimanche.',
            isAccepted: true,
        }
    });
    await prisma.job.update({ where: { id: job2.id }, data: { status: 'IN_PROGRESS' } });
    await prisma.message.create({
        data: {
            applicationId: appJob2.id,
            senderId: candidate2.id,
            content: 'Merci d\'avoir accepté ! A quelle heure puis-je passer ?',
        }
    });
    await prisma.message.create({
        data: {
            applicationId: appJob2.id,
            senderId: employer2.id,
            content: 'Bonjour Lucie, vers 14h ça vous irait ?',
        }
    });
    const appJob4 = await prisma.application.create({
        data: {
            jobId: job4.id,
            candidateId: candidate1.id,
            message: 'Je suis très minutieux, je peux m\'en occuper demain.',
            isAccepted: true,
        }
    });
    console.log('Seeding reviews...');
    await prisma.review.create({
        data: {
            jobId: job4.id,
            rating: 5,
            comment: 'Travail exceptionnel, Marc a été très efficace et ponctuel !',
            reviewerId: employer2.id,
            revieweeId: candidate1.id,
        }
    });
    console.log('Seeding finished successfully.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map