# 🌐 Guide de Déploiement Complet en Production - JobConnect

Ce document détaille la procédure de déploiement en production de l'écosystème complet **JobConnect** :
1. **Backend & Base de Données** sur [Render.com](https://render.com) (ou Railway)
2. **Frontend Web** sur [Vercel](https://vercel.com)
3. **Application Mobile** Android & iOS avec [Expo EAS](https://expo.dev)

---

## 1. Déploiement Backend & PostgreSQL (Render Blueprint)

Le dépôt contient un fichier d'infrastructure déclarative [`render.yaml`](./render.yaml).

### Procédure rapide :
1. Créez un compte sur [Render.com](https://render.com).
2. Connectez votre compte GitHub.
3. Allez dans **Blueprints** > **New Blueprint Instance**.
4. Sélectionnez le dépôt `steve-237/jobconnect`.
5. Render va automatiquement provisionner :
   * Une base **PostgreSQL Managée** (`jobconnect-postgres`).
   * Un service web **NestJS** (`jobconnect-backend`) avec migration Prisma automatique.
   * Un disque persistant de **5 Go** pour conserver les fichiers téléversés (`/uploads`).
   * Une clé secrète `JWT_SECRET` aléatoire de 64 caractères.
6. Renseignez dans l'interface Render les variables optionnelles si vous utilisez les paiements réels :
   * `STRIPE_SECRET_KEY`
   * `STRIPE_WEBHOOK_SECRET`
   * `GEMINI_API_KEY` (si vous activez les fonctionnalités IA en production).

---

## 2. Déploiement Frontend Web (Vercel)

L'application Web utilise **Next.js 16** et est configurée avec [`web/vercel.json`](./web/vercel.json).

### Procédure rapide :
1. Connectez-vous sur [Vercel](https://vercel.com) avec GitHub.
2. Cliquez sur **Add New Project** et importez `steve-237/jobconnect`.
3. Dans les options de configuration du projet :
   * **Root Directory** : Sélectionnez `web`.
   * **Framework Preset** : `Next.js`.
4. Ajoutez la variable d'environnement :
   * `NEXT_PUBLIC_API_URL` : `https://jobconnect-backend.onrender.com` (votre URL d'API Render sans slash à la fin).
5. Cliquez sur **Deploy**.

---

## 3. Déploiement Mobile Android / iOS (Expo Application Services - EAS)

L'application Mobile utilise **React Native (Expo)** et est configurée avec [`mobile/eas.json`](./mobile/eas.json).

### Build de l'APK Android (Test / Démo) :
```bash
# 1. Se positionner dans le dossier mobile
cd mobile

# 2. Installer la CLI EAS (si pas encore fait)
npm install -g eas-cli

# 3. Se connecter à votre compte Expo
eas login

# 4. Lancer le build de l'APK autonome Android
eas build -p android --profile preview
```
Une fois le build terminé sur les serveurs Expo (environ 10-15 min), Expo fournit un lien direct et un QR code pour télécharger et installer le fichier `.apk` sur n'importe quel smartphone Android.

### Build Production pour les Stores (Google Play / App Store) :
```bash
# Pour Google Play Store (App Bundle AAB)
eas build -p android --profile production

# Pour Apple App Store (nécessite compte Apple Developer)
eas build -p ios --profile production
```
