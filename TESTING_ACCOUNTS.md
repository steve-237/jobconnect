# 🧪 Comptes de Test (JobConnect)

Voici les données de connexion pré-enregistrées dans la base de données (générées via le script de seed `backend/prisma/seed.ts`). Vous pouvez utiliser ces comptes pour tester les différentes interfaces et fonctionnalités de l'application.

> **Le mot de passe est identique pour tous les comptes : `password123`**

---

## 👨‍💼 Employeurs (Créateurs de missions)
Ces comptes sont configurés pour poster des annonces, accepter des candidatures, payer via Stripe/PayPal et noter les candidats.

| Prénom | Nom | Email | Rôle |
| :--- | :--- | :--- | :--- |
| Jean | Dupont | `jean.dupont@employeur.com` | `EMPLOYER` |
| Marie | Dubois | `marie.dubois@employeur.com` | `EMPLOYER` |

---

## 👷 Candidats (Chercheurs de missions)
Ces comptes sont configurés pour parcourir les annonces, postuler aux missions, discuter avec les employeurs et recevoir des évaluations.

| Prénom | Nom | Email | Rôle | Vérifié (KYC) |
| :--- | :--- | :--- | :--- | :--- |
| Marc | Bricoleur | `marc.bricole@candidat.com` | `CANDIDATE` | ✅ Oui |
| Lucie | Jardin | `lucie.jardin@candidat.com` | `CANDIDATE` | ✅ Oui |
| Paul | Coursier | `paul.coursier@candidat.com` | `CANDIDATE` | ❌ Non |

---

## 🛡️ Administrateur
Ce compte a les accès pour le futur portail d'administration (modération, validation KYC).

| Prénom | Nom | Email | Rôle |
| :--- | :--- | :--- | :--- |
| System | Admin | `admin@jobconnect.com` | `ADMIN` |

---

### Comment tester rapidement un flux de mission ?
1. Connectez-vous avec un **Candidat** sur l'application Web ou Mobile.
2. Postulez à une offre disponible (ex: *Montage de 2 armoires PAX*).
3. Connectez-vous avec l'**Employeur** correspondant (ex: *jean.dupont@employeur.com*).
4. Acceptez la candidature et lancez le paiement de réservation.
5. Observez l'ouverture du canal de discussion en temps réel (WebSockets) entre les deux comptes !
