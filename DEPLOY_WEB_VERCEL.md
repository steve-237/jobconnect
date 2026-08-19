# 🚀 Guide de Déploiement : Application Web (Next.js) sur Vercel

Vercel est la plateforme créatrice de Next.js. Elle permet de déployer l'application Web de façon totalement **gratuite** (Hébergement, SSL, CDN inclus sans jamais sortir la carte bancaire).

Ce guide explique comment déployer l'application `web` de notre monorepo `JobConnect`.

---

## Étape 1 : Pousser le code sur GitHub
L'application doit être sur ton dépôt GitHub (`steve-237/jobconnect`). C'est déjà le cas !

## Étape 2 : Créer un compte Vercel
Rends-toi sur [Vercel.com](https://vercel.com/) et crée un compte (de préférence en t'inscrivant avec ton compte GitHub : *Continue with GitHub*).

## Étape 3 : Importer le projet
1. Sur le tableau de bord Vercel, clique sur le bouton **"Add New Project"** (ou "Import Project").
2. Dans la liste de tes dépôts GitHub, cherche `jobconnect` et clique sur **"Import"**.

## Étape 4 : Configurer le déploiement (Très Important)
Étant donné que notre application Web se trouve dans le sous-dossier `web/` et non à la racine du dépôt, il faut le préciser à Vercel :

1. **Project Name** : Garde le nom (ex: `jobconnect-web`).
2. **Framework Preset** : Vercel devrait détecter `Next.js` automatiquement.
3. **Root Directory** : Clique sur "Edit" et sélectionne le dossier `web`. (Ceci est capital pour que Vercel sache où se trouve l'application front-end).
4. **Environment Variables** :
   Déroule cette section et ajoute la variable suivante pour que le frontend puisse communiquer avec le Backend de production (si tu as déjà déployé le backend) :
   - **Name** : `NEXT_PUBLIC_API_URL`
   - **Value** : `https://ton-url-backend-render.onrender.com` (Remplace par l'URL de ton API Render, **sans /api à la fin**).*

## Étape 5 : Déployer
1. Clique sur le gros bouton **"Deploy"**.
2. Attends 1 à 2 minutes. Vercel va installer les dépendances et exécuter le Build (que nous venons de vérifier en local !).
3. Et voilà ! 🎉 Vercel va te donner une URL publique gratuite (ex: `https://jobconnect-web.vercel.app`) sécurisée avec HTTPS.

---

> **Bonus (Continious Deployment) :**
> Dorénavant, à chaque fois que nous ferons un `git push` sur la branche `main` de ton dépôt GitHub, Vercel détectera les changements et redéploiera ton application Web automatiquement sans aucune intervention de ta part !
