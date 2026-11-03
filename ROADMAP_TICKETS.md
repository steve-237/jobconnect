# 📋 Feuille de Route & Suivi des Tickets - JobConnect

Ce document centralise et suit l'état d'avancement des tickets pour les prochaines étapes de production du projet **JobConnect**.

---

## 🟢 Étape 1 : Sauvegarde & Versionnage Git (TICKET-01) - [TERMINÉ ✅]
- [x] **TICKET-01.1** : Nettoyer l'index Git et vérifier l'intégrité de l'arborescence (scripts et assets rangés).
- [x] **TICKET-01.2** : Commiter l'ensemble des refactorisations (sécurité NestJS, DTOs, typage partagé, modularisation des dashboards, 38 tests Jest).
- [x] **TICKET-01.3** : Taguer la version de consolidation `v1.1.0-refactored`.

---

## 🟡 Étape 2 : Recette Fonctionnelle & Tests E2E Playwright (TICKET-02) - [TERMINÉ ✅]
- [x] **TICKET-02.1** : Enrichir la suite Playwright (`web/tests/e2e-flow.spec.ts`) avec le scénario complet :
  - Connexion candidat & employeur.
  - Création d'une mission avec assistance IA.
  - Soumission d'une candidature et tableau de bord candidat.
  - Vérification du composant d'avis `ReviewModal` et soumission.
- [x] **TICKET-02.2** : Ajouter un script racine `npm run test:e2e` pour exécuter la suite Playwright facilement.
- [x] **TICKET-02.3** : Valider le bon déroulement des tests en local (headless).

---

## 🔵 Étape 3 : Stockage Fichiers Réel (Stockage Fichiers & Uploads) (TICKET-03) - [TERMINÉ ✅]
- [x] **TICKET-03.1** : Backend - Créer un `UploadsModule` avec NestJS & Multer pour la réception de fichiers (images / PDF).
- [x] **TICKET-03.2** : Backend - Implémenter le stockage sécurisé avec validation (taille max 10MB, mimetypes autorisés, prévention path traversal) et tests unitaires complets.
- [x] **TICKET-03.3** : Frontend - Brancher l'upload d'avatar réel et de justificatifs KYC sur `ProfilePage` vers l'API `/uploads`.
- [x] **TICKET-03.4** : Frontend - Brancher l'upload de preuves photo et documents justificatifs sur `OpenDisputeModal`.

---

## 🛡️ Étape 3bis : Plan de Durcissement de la Sécurité (SECURITY-TICKETS) - [TERMINÉ ✅]
> Voir le détail complet dans [`SECURITY_TICKETS.md`](file:///d:/formations_personnelles/platforme-jobs/SECURITY_TICKETS.md)
- [x] **SEC-01** : Protection contre la Faille IDOR sur `PATCH /users/:id` (Issue #1)
- [x] **SEC-02** : Contrôle d'accès & garde d'authentification sur `POST /uploads` (Issue #2)
- [x] **SEC-03** : Élimination du fallback `'secretKey'` et validation stricte de `JWT_SECRET` (Issue #3)
- [x] **SEC-04** : Désactivation des endpoints de contournement KYC (`simulateApproveKyc`) en production (Issue #4)
- [x] **SEC-05** : Durcissement de la vérification de signature du Webhook Stripe (Issue #5)
- [x] **SEC-06** : En-têtes HTTP de sécurité avec Helmet (Issue #6)
- [x] **SEC-07** : Restriction stricte des politiques CORS (API & WebSockets) (Issue #7)
- [x] **SEC-08** : Rate limiting & anti-brute force avec `@nestjs/throttler` (Issue #8)

---

## 🟣 Étape 4 : Déploiement en Production Cloud (TICKET-04) - [TERMINÉ ✅]
> Fichiers de configuration créés : `render.yaml`, `web/vercel.json`, `DEPLOYMENT_GUIDE.md` (Issue GitHub #9)
- [x] **TICKET-04.1** : Configuration des variables d'environnement modèles (`.env.production.example` pour backend, web et mobile).
- [x] **TICKET-04.2** : Infrastructure as Code Render (`render.yaml`) pour Backend NestJS, base PostgreSQL managée et disque persistant 5GB pour `/uploads`.
- [x] **TICKET-04.3** : Déploiement Frontend Web Vercel (`web/vercel.json` avec en-têtes de sécurité HSTS / CSP / anti-sniffing).
- [x] **TICKET-04.4** : Configuration et guide de Build APK Mobile Android avec Expo EAS (`eas build -p android --profile preview`).

---

## 🟠 Étape 5 : Notifications Transactionnelles & Onboarding (TICKET-05) - [TERMINÉ ✅]
> Issues GitHub résolues : [#10](https://github.com/steve-237/jobconnect/issues/10) (Emails transactionnels) et [#11](https://github.com/steve-237/jobconnect/issues/11) (Google OAuth)
- [x] **TICKET-05.1** : Intégration du service d'emails transactionnels (MailModule avec templates responsives HTML/texte) :
  - Email de bienvenue personnalisé selon le rôle (Candidat ou Employeur).
  - Notification par email pour l'employeur lors de la réception d'une candidature.
  - Notification par email pour le candidat lorsque sa candidature est acceptée.
  - Reçu de paiement et confirmation de mise sous séquestre des fonds.
- [x] **TICKET-05.2** : Authentification sociale OAuth (Google Login / Register) :
  - Endpoint backend sécurisé `POST /auth/google` avec création automatique ou liaison de compte.
  - Boutons "Continuer avec Google" intégrés sur les formulaires de connexion et d'inscription Web.
  - Tests unitaires complets sur `auth.service.spec.ts` et `mail.service.spec.ts` (51 tests passants).
