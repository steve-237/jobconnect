# JobConnect 🚀

JobConnect est une plateforme de mise en relation de type "Uber pour les petits boulots". Elle permet à des employeurs de publier des missions ponctuelles (jardinage, montage de meubles, nettoyage, etc.) et à des candidats (Jobsetters) d'y postuler, avec un système de paiement sécurisé, de messagerie en temps réel et de notation.

## 🏗️ Architecture Globale
Le projet est divisé en 3 parties distinctes interconnectées :
1. **Backend (API)** : Construit avec **NestJS**, **Prisma** et **PostgreSQL**.
2. **Frontend Web** : Construit avec **Next.js** et **Tailwind CSS**. 
3. **Frontend Mobile** : Construit avec **React Native (Expo)**.

## 🛠️ Stack Technique
- **Base de Données** : PostgreSQL (Docker)
- **Backend** : Node.js, NestJS, Socket.io (WebSockets), Stripe API, JWT (Authentication).
- **Web** : React 19, Next.js (App Router), Tailwind CSS (Design Glassmorphism).
- **Mobile** : React Native 0.86, Expo 57, Expo Router, expo-secure-store.

## 🎨 Design System
Nous utilisons un design moderne de type **"Dark Mode & Glassmorphism"**.
- Couleurs principales : Arrière-plans très sombres (`#000000`, `#111111`) avec des accents vifs (Emerald `#10B981` pour le succès, Indigo `#6366F1` / Bleu `#3B82F6` pour l'action).
- Effets de transparence (CSS `backdrop-filter: blur()`).
- Typographie et icônes claires via **Lucide Icons**.

## 🚀 Comment Lancer l'Infrastructure

### 1. Base de données
Assurez-vous d'avoir Docker démarré.
```bash
docker run --name jobconnect_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=jobconnect -p 5434:5432 -d postgres
```

### 2. Démarrer le Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

### 3. Démarrer le Web
```bash
cd web
npm install
npm run dev -- -p 3001
```
L'application Web sera disponible sur `http://localhost:3001`.

### 4. Démarrer le Mobile
```bash
cd mobile
npm install
npx expo start --android --port 8082
```
Ouvrez l'émulateur Android ou utilisez Expo Go sur votre téléphone physique.

---

> Pour plus de détails techniques, veuillez consulter les `README.md` présents dans chaque sous-dossier (`backend`, `web`, `mobile`).
