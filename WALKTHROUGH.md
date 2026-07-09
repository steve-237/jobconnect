# JobConnect : Walkthrough & Bilan du Projet

Bienvenue dans le document récapitulatif de **JobConnect**. Au cours de ces 9 Sprints, nous avons construit de zéro une plateforme de mise en relation complète ("Uber pour les petits boulots"), avec une interface d'administration, une plateforme Web, et une application Mobile multi-rôles en temps réel !

---

## 🏗️ Architecture du Projet (Clean Code)

Nous avons mis un point d'honneur à respecter les principes de **Maintenabilité** et de **Clean Code**. L'infrastructure est divisée en 3 dépôts (monorepo) :

1. **Backend (`/backend`)** : Propulsé par **NestJS** et **Prisma (PostgreSQL)**. 
   - Architecture en modules indépendants (`auth`, `users`, `jobs`, `categories`, `applications`, `messages`).
   - Sécurité forte (Bcrypt pour les mots de passe, JWT pour l'authentification).
   - Intégration de **WebSockets (Socket.io)** pour la messagerie.
2. **Plateforme Web (`/web`)** : Propulsée par **Next.js (App Router)** et **TailwindCSS**.
   - Design en *Glassmorphism* (UI premium avec reflets, ombres et couleurs vibrantes).
   - Espaces dédiés par rôles : `Admin`, `CandidateDashboard`, `EmployerDashboard`.
3. **Application Mobile (`/mobile`)** : Propulsée par **React Native (Expo)**.
   - Routage dynamique basé sur le JWT via **Expo Router** (`app/_layout.tsx`).
   - Client API centralisé (`axios` + `expo-secure-store`).
   - Interfaces natives et messagerie avec auto-scroll.

---

## 🚀 Les 9 Sprints Accomplis

- **Sprint 1 : Setup de Base** - Initialisation de NestJS, Prisma, Next.js et Tailwind.
- **Sprint 2 : Système de Jobs** - Création du CRUD des offres et gestion des Catégories en base de données.
- **Sprint 3 : UI / UX Web** - Design Premium de la Landing Page, du Header de navigation et animations CSS.
- **Sprint 4 : Rôles & Admin** - Refonte de l'Authentification pour inclure les rôles (`ADMIN`, `CANDIDATE`, `EMPLOYER`) et création du `/admin`.
- **Sprint 5 : Candidatures** - Implémentation du système complet pour Postuler (Candidat) et Accepter (Employeur).
- **Sprint 6 : Messagerie Temps Réel (Web)** - Implémentation de Socket.io et du chat bidirectionnel.
- **Sprint 7 : Setup Mobile** - Initialisation de l'application Expo et création du parcours MVP pour les candidats (Login + Liste des Jobs).
- **Sprint 8 : Chat Mobile** - Portabilité des WebSockets sur React Native pour que le candidat discute avec l'employeur.
- **Sprint 9 : Espace Employeur Mobile** - Création des onglets employeurs (`Create Job`, `Applicants`) sur mobile.

---

## 🔑 Comptes de Test

La base de données contient des utilisateurs pré-configurés (seed) avec le mot de passe global : `password123`.

| Rôle | Email |
| :--- | :--- |
| **Admin** | `admin@jobconnect.com` |
| **Employeur** | `employer@jobconnect.com` |
| **Candidat** | `candidate@jobconnect.com` |

---

## 💻 Comment Lancer le Projet ?

**1. Le Backend (NestJS)**
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

**2. Le Site Web (Next.js)**
```bash
cd web
npm install
npm run dev -- -p 3001
```

**3. L'Application Mobile (Expo)**
```bash
cd mobile
npm install
npx expo start --tunnel
```

---

## 🔮 Pistes pour le futur (Next Steps)
L'application est prête à être testée par des utilisateurs ! Si vous décidez de lancer une V2, voici ce que vous pourriez implémenter :
- **Passerelle de Paiement (Stripe)** : Permettre à l'employeur de provisionner l'argent, qui sera débloqué une fois le job terminé.
- **Système de Notation / Avis** : Permettre à l'employeur de noter le candidat à la fin du job pour créer de la confiance.
- **Notifications Push** : Intégrer les notifications natives sur mobile (via Expo Push Notifications) lors de la réception d'un nouveau message.
