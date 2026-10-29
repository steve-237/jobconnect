# 📋 Feuille de Route & Suivi des Tickets - JobConnect

Ce document centralise et suit l'état d'avancement des tickets pour les prochaines étapes de production du projet **JobConnect**.

---

## 🟢 Étape 1 : Sauvegarde & Versionnage Git (TICKET-01)
- [x] **TICKET-01.1** : Nettoyer l'index Git et vérifier l'intégrité de l'arborescence (scripts et assets rangés).
- [ ] **TICKET-01.2** : Commiter l'ensemble des refactorisations (sécurité NestJS, DTOs, typage partagé, modularisation des dashboards, 38 tests Jest).
- [ ] **TICKET-01.3** : Taguer la version de consolidation `v1.1.0-refactored`.

---

## 🟡 Étape 2 : Recette Fonctionnelle & Tests E2E Playwright (TICKET-02)
- [ ] **TICKET-02.1** : Enrichir la suite Playwright (`web/tests/e2e-flow.spec.ts`) avec le scénario complet :
  - Connexion candidat & employeur.
  - Création d'une mission avec assistance IA.
  - Soumission d'une candidature et acceptation par l'employeur.
  - Vérification du composant d'avis `ReviewModal`.
- [ ] **TICKET-02.2** : Ajouter un script racine `npm run test:e2e` pour exécuter la suite Playwright facilement.
- [ ] **TICKET-02.3** : Valider le bon déroulement des tests en local (headless).

---

## 🔵 Étape 3 : Stockage Fichiers Réel (Stockage Cloud) (TICKET-03)
- [ ] **TICKET-03.1** : Backend - Créer un `UploadsModule` avec NestJS & Multer pour la réception de fichiers (images / PDF).
- [ ] **TICKET-03.2** : Backend - Implémenter un adaptateur de stockage configurable (local en dev / Cloudinary ou S3 en prod).
- [ ] **TICKET-03.3** : Frontend - Brancher l'upload d'avatar et de justificatifs KYC sur `ProfilePage`.
- [ ] **TICKET-03.4** : Frontend - Brancher l'upload de preuves photo sur `OpenDisputeModal`.

---

## 🟣 Étape 4 : Déploiement en Production Cloud (TICKET-04)
- [ ] **TICKET-04.1** : Configuration des variables d'environnement de production (`.env.production`).
- [ ] **TICKET-04.2** : Déploiement Backend & PostgreSQL sur Render / Railway (`render.yaml`).
- [ ] **TICKET-04.3** : Déploiement Frontend Web sur Vercel (`vercel.json`).
- [ ] **TICKET-04.4** : Build APK Mobile Android avec Expo EAS (`eas build -p android`).

---

## 🟠 Étape 5 : Notifications Transactionnelles & Onboarding (TICKET-05)
- [ ] **TICKET-05.1** : Intégration du service d'emails transactionnels (Resend ou Brevo) pour confirmations d'inscription et reçus.
- [ ] **TICKET-05.2** : Authentification sociale OAuth (Google Login).
