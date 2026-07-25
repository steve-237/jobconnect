# Frontend Mobile - JobConnect 📱

Ceci est l'application Mobile de JobConnect, conçue pour iOS et Android. Elle permet aux utilisateurs (Employeurs et Jobsetters) d'accéder à la plateforme en déplacement, avec des fonctionnalités natives comme la géolocalisation et les notifications Push.

## 🛠️ Technologies
- **Framework** : React Native (Version 0.86)
- **Outil de Build** : Expo (Version 57)
- **Navigation** : Expo Router (Routing basé sur les dossiers)
- **Stockage Sécurisé** : Expo Secure Store (pour les JWT)
- **Temps Réel** : Socket.io-client

## 📂 Structure du projet (Feature-First)
L'application utilise le routing par dossier via `app/` :
- `src/api/` : Configuration du client HTTP Axios.
- `src/hooks/` : Hooks personnalisés (ex: `usePushNotifications`, `useSocket`).
- `app/_layout.tsx` : Root layout qui protège l'application et gère les redirections selon le rôle de l'utilisateur (Employeur vs Candidat).
- `app/(auth)/` : Écrans de connexion et d'inscription.
- `app/(tabs)/` : Écrans principaux pour les Candidats (Exploration de jobs, Profil).
- `app/(employer_tabs)/` : Écrans principaux pour les Employeurs (Gestion des annonces, Profil).
- `app/applicants/` : Écran affichant les candidatures reçues pour une mission.
- `app/messages/` : Messagerie en temps réel.

## 🚀 Démarrage Rapide

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Lancer le serveur Expo (Metro Bundler)**
   ```bash
   npx expo start --android --port 8082
   ```
   *Remarque : Nous utilisons le port `8082` et forçons l'environnement Android par défaut pour ce MVP.*

3. **Accéder à l'application**
   - **Émulateur** : Appuyez sur `a` dans le terminal pour lancer l'émulateur Android si celui-ci ne s'est pas ouvert automatiquement.
   - **Appareil Physique** : Téléchargez l'application **Expo Go** sur votre téléphone et scannez le QR code affiché dans le terminal.
