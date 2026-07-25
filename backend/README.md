# Backend - JobConnect API ⚙️

Ce dossier contient toute la logique serveur, l'API RESTful et le système WebSockets pour la plateforme JobConnect.

## 🛠️ Technologies
- **Framework** : NestJS
- **ORM** : Prisma
- **Base de données** : PostgreSQL
- **Temps Réel** : Socket.io
- **Paiements** : Stripe

## 📂 Structure du projet
- `src/auth` : Authentification et gestion des tokens JWT.
- `src/users` : Gestion des profils Employeurs et Candidats.
- `src/jobs` : Offres d'emploi.
- `src/applications` : Gestion des candidatures.
- `src/messages` : Messagerie en temps réel.
- `src/payments` : Intégration Stripe (Génération de session et Webhooks).
- `src/notifications` : Envoi de notifications push via le SDK Expo.
- `prisma/` : Schéma de base de données et scripts de seed.

## 🚀 Démarrage Rapide

1. **Variables d'Environnement**
   Créez un fichier `.env` basé sur `.env.example` s'il existe. 
   L'URL de la base de données est définie par défaut à :
   `DATABASE_URL="postgresql://postgres:postgres@localhost:5434/jobconnect?schema=public"`

2. **Base de Données**
   Assurez-vous que l'instance Docker de PostgreSQL est active sur le port `5434`.
   Appliquez les migrations et peuplez la base de données (Seed) :
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

3. **Lancement du serveur**
   ```bash
   npm run start:dev
   ```
   Le serveur API écoutera sur le port `3000`.

## 📖 Tester l'API
L'API REST est exposée sur `http://localhost:3000`.
Les WebSockets (Socket.io) écoutent également sur le même port.
