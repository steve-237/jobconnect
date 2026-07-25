# Frontend Web - JobConnect 🌐

Ceci est l'application Web de JobConnect destinée principalement aux utilisateurs naviguant depuis leur navigateur de bureau.

## 🛠️ Technologies
- **Framework** : Next.js 15 (App Router)
- **Styling** : Tailwind CSS (Dark Mode & Glassmorphism)
- **Requêtes HTTP** : Axios
- **Icônes** : Lucide React

## 📂 Structure du projet
L'architecture utilise le système "App Router" de Next.js :
- `src/app/page.tsx` : Landing page vitrine (Hero section, Features).
- `src/app/login/page.tsx` : Interface de connexion.
- `src/app/register/page.tsx` : Interface d'inscription.
- `src/app/dashboard/page.tsx` : Tableau de bord dynamique. Il affiche une vue différente selon que l'utilisateur connecté est un Employeur ou un Candidat.
- `src/app/jobs/page.tsx` : Page d'exploration des offres d'emploi (Candidats).
- `src/app/profile/page.tsx` : Page de profil utilisateur.

## 🚀 Démarrage Rapide

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Lancer le serveur de développement**
   ```bash
   npm run dev -- -p 3001
   ```
   *Remarque : Nous utilisons le port `3001` pour éviter tout conflit avec le serveur Backend NestJS qui tourne sur le port `3000`.*

3. **Accéder à l'application**
   Ouvrez [http://localhost:3001](http://localhost:3001) dans votre navigateur.

## 🎨 Composants UI
L'application repose fortement sur une classe CSS personnalisée `.glass` définie dans `src/app/globals.css`, qui applique automatiquement les effets de flou (backdrop-filter) et de bordures translucides caractéristiques du style *Glassmorphism*.
