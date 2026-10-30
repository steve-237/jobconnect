# 🛡️ Suivi des Tickets de Sécurité (SECURITY-TICKETS) - JobConnect

Ce document centralise et trace la résolution méthodique de l'ensemble des vulnérabilités de sécurité identifiées lors de l'audit du projet **JobConnect**.

---

## 🔴 Phase 1 : Vulnérabilités Critiques & Élevées (Priorité Haute)

### 📌 `SEC-01` : Protection contre la Faille IDOR sur la mise à jour utilisateur
* **GitHub Issue** : [#1](https://github.com/steve-237/jobconnect/issues/1)
* **Gravité** : 🔴 Élevée (CWE-639 / Broken Object Level Authorization)
* **Composant** : `backend/src/users/users.controller.ts`
* **Description** : `PATCH /users/:id` permet actuellement à tout utilisateur connecté de modifier les données de n'importe quel autre utilisateur sans contrôle d'appartenance.
* **Tâches à réaliser** :
  - [x] **SEC-01.1** : Restreindre `PATCH /users/:id` en vérifiant que `req.user.userId === id` ou que `req.user.role === 'ADMIN'`.
  - [x] **SEC-01.2** : Retourner une `ForbiddenException` si l'utilisateur tente de modifier un tiers sans être administrateur.
  - [x] **SEC-01.3** : Ajouter un test unitaire dédié dans `users.service.spec.ts` pour valider l'interdiction de modification non autorisée.
* **Statut** : [x] **Résolu & Vérifié ✅**

---

### 📌 `SEC-02` : Sécurisation et Contrôle d'Accès sur l'Upload de Fichiers
* **GitHub Issue** : [#2](https://github.com/steve-237/jobconnect/issues/2)
* **Gravité** : 🔴 Élevée (CWE-434 / Unrestricted File Upload & DoS)
* **Composant** : `backend/src/uploads/uploads.controller.ts`
* **Description** : L'endpoint `POST /uploads` est public et ne dispose d'aucun garde d'authentification ni de limite de taille au niveau du middleware Multer.
* **Tâches à réaliser** :
  - [x] **SEC-02.1** : Ajouter `@UseGuards(JwtAuthGuard)` sur `POST /uploads`.
  - [x] **SEC-02.2** : Configurer la limite de taille (10 Mo) directement dans les options du `FileInterceptor` pour rejeter les fichiers trop volumineux avant consommation mémoire.
  - [x] **SEC-02.3** : Mettre à jour `uploads.service.spec.ts` pour couvrir les scénarios d'accès protégé.
* **Statut** : [x] **Résolu & Vérifié ✅**

---

### 📌 `SEC-03` : Sécurisation de la Clé Secrète JWT et Validation au Démarrage
* **GitHub Issue** : [#3](https://github.com/steve-237/jobconnect/issues/3)
* **Gravité** : 🔴 Critique (CWE-798 / Hardcoded Credentials & Forgery)
* **Composants** : `backend/src/auth/auth.module.ts`, `backend/src/auth/jwt.strategy.ts`, `backend/src/messages/messages.gateway.ts`, `backend/src/main.ts`
* **Description** : Le fallback `'secretKey'` hardcodé permet de forger des jetons JWT valides si la variable `JWT_SECRET` n'est pas définie.
* **Tâches à réaliser** :
  - [x] **SEC-03.1** : Supprimer tous les fallbacks `'secretKey'` dans l'ensemble des modules backend.
  - [x] **SEC-03.2** : Vérifier la présence et la robustesse de `process.env.JWT_SECRET` dès le démarrage (`main.ts`) et lever une erreur fatale si absent.
  - [x] **SEC-03.3** : Fournir une variable d'exemple forte dans `.env.example`.
* **Statut** : [x] **Résolu & Vérifié ✅**

---

### 📌 `SEC-04` : Désactivation des Endpoints de Contournement KYC en Production
* **GitHub Issue** : [#4](https://github.com/steve-237/jobconnect/issues/4)
* **Gravité** : 🔴 Élevée (CWE-285 / Improper Authorization & Business Logic Bypass)
* **Composants** : `backend/src/users/users.controller.ts`, `backend/src/users/users.service.ts`
* **Description** : L'endpoint `POST /users/me/kyc/simulate-approve` permet à un utilisateur de s'octroyer le statut KYC vérifié sans validation administrative.
* **Tâches à réaliser** :
  - [x] **SEC-04.1** : Bloquer l'accès à `simulateApproveKyc` dès lors que `NODE_ENV === 'production'`.
  - [x] **SEC-04.2** : Restreindre cet endpoint aux profils `ADMIN` ou aux environnements locaux de test.
* **Statut** : [x] **Résolu & Vérifié ✅**

---

### 📌 `SEC-05` : Durcissement du Webhook Stripe
* **GitHub Issue** : [#5](https://github.com/steve-237/jobconnect/issues/5)
* **Gravité** : 🔴 Élevée (CWE-345 / Insufficient Verification of Data Authenticity)
* **Composant** : `backend/src/payments/payments.controller.ts`
* **Description** : La signature Stripe n'est pas exigée de manière inconditionnelle si `NODE_ENV !== 'production'`.
* **Tâches à réaliser** :
  - [x] **SEC-05.1** : Exiger inconditionnellement l'en-tête `stripe-signature` dès que Stripe est configuré.
  - [x] **SEC-05.2** : Rejeter immédiatement les requêtes dépourvues de signature cryptographique.
* **Statut** : [x] **Résolu & Vérifié ✅**

---

## 🟡 Phase 2 : Durcissement Infrastructure & En-têtes (Priorité Moyenne)

### 📌 `SEC-06` : En-têtes HTTP de Sécurité avec Helmet
* **GitHub Issue** : [#6](https://github.com/steve-237/jobconnect/issues/6)
* **Gravité** : 🟡 Moyenne (CWE-693 / Missing Security Headers)
* **Composant** : `backend/src/main.ts`
* **Description** : Absence d'en-têtes HTTP de protection (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`).
* **Tâches à réaliser** :
  - [x] **SEC-06.1** : Installer `helmet` dans le package `backend`.
  - [x] **SEC-06.2** : Activer `app.use(helmet())` dans `main.ts` en ajustant les règles pour la distribution de médias/uploads.
* **Statut** : [x] **Résolu & Vérifié ✅**

---

### 📌 `SEC-07` : Restriction Stricte des Politiques CORS (HTTP & WebSocket)
* **GitHub Issue** : [#7](https://github.com/steve-237/jobconnect/issues/7)
* **Gravité** : 🟡 Moyenne (CWE-942 / Overly Permissive CORS)
* **Composants** : `backend/src/main.ts`, `backend/src/messages/messages.gateway.ts`
* **Description** : L'API HTTP utilise `origin: true` et le WebSocket utilise `origin: '*'`.
* **Tâches à réaliser** :
  - [x] **SEC-07.1** : Configurer une liste blanche d'origines autorisées basée sur `FRONTEND_URL` et les origines locales/mobiles.
  - [x] **SEC-07.2** : Aligner la passerelle WebSocket sur les origines autorisées.
* **Statut** : [x] **Résolu & Vérifié ✅**

---

### 📌 `SEC-08` : Protection Anti-Brute Force et Rate Limiting
* **GitHub Issue** : [#8](https://github.com/steve-237/jobconnect/issues/8)
* **Gravité** : 🟡 Moyenne (CWE-307 / Improper Restriction of Excessive Authentication Attempts)
* **Composant** : `backend/src/auth/`
* **Description** : Absence de limitation du nombre de requêtes sur `/auth/login` et `/auth/register`.
* **Tâches à réaliser** :
  - [x] **SEC-08.1** : Installer `@nestjs/throttler` dans le package `backend`.
  - [x] **SEC-08.2** : Configurer `ThrottlerGuard` global avec restriction renforcée à 10 tentatives/min sur les routes `/auth/login` et `/auth/register`.
* **Statut** : [x] **Résolu & Vérifié ✅**
