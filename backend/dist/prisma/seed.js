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
//# sourceMappingURL=seed.js.map