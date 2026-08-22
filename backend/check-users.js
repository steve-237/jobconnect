const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  let users = await prisma.user.findMany({
    select: { id: true, email: true, firstName: true, role: true }
  });
  console.log('--- EXISTING USERS ---');
  console.log(users);

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Ensure test Employer account
  const employerEmail = 'employer@test.com';
  let employer = await prisma.user.findUnique({ where: { email: employerEmail } });
  if (!employer) {
    employer = await prisma.user.create({
      data: {
        email: employerEmail,
        passwordHash,
        firstName: 'Jean',
        lastName: 'Dupont',
        role: 'EMPLOYER',
        isVerified: true,
        kycStatus: 'APPROVED',
        bio: 'Entreprise / Employeur proposant des missions et opportunités sur JobConnect.',
      }
    });
    console.log('Created default test Employer:', employerEmail);
  } else {
    await prisma.user.update({
      where: { email: employerEmail },
      data: { passwordHash }
    });
    console.log('Reset test Employer password to password123 for:', employerEmail);
  }

  // 2. Ensure test Candidate account
  const candidateEmail = 'candidate@test.com';
  let candidate = await prisma.user.findUnique({ where: { email: candidateEmail } });
  if (!candidate) {
    candidate = await prisma.user.create({
      data: {
        email: candidateEmail,
        passwordHash,
        firstName: 'Alice',
        lastName: 'Martin',
        role: 'CANDIDATE',
        isVerified: true,
        kycStatus: 'APPROVED',
        bio: 'Prestataire / Candidat qualifié prêt à effectuer des missions sur JobConnect.',
      }
    });
    console.log('Created default test Candidate:', candidateEmail);
  } else {
    await prisma.user.update({
      where: { email: candidateEmail },
      data: { passwordHash }
    });
    console.log('Reset test Candidate password to password123 for:', candidateEmail);
  }

  console.log('\n--- ALL USERS READY FOR LOGIN ---');
  const allUsers = await prisma.user.findMany({
    select: { email: true, firstName: true, role: true }
  });
  console.log(allUsers);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
