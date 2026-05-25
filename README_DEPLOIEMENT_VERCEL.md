# Déploiement Vercel avec base modifiable

Ce projet ne dépend plus de PHP/MySQL local pour Vercel. Le site utilise maintenant une API serverless dans `api/index.js` et une base PostgreSQL distante via `DATABASE_URL` ou `POSTGRES_URL`.

## 1. Créer la base sur Vercel

1. Va dans ton projet Vercel.
2. Ajoute une base PostgreSQL depuis l'onglet Storage/Marketplace.
3. Connecte la base au projet pour que Vercel ajoute automatiquement `POSTGRES_URL` ou `DATABASE_URL`.

## 2. Importer les tables et les cartes

Option simple:

1. Ouvre la console SQL de ta base PostgreSQL sur Vercel.
2. Copie le contenu de `database/schema.sql`.
3. Lance le script SQL.

Option terminal:

```bash
npm install
DATABASE_URL="ton_url_postgres" npm run db:push
```

Sur Windows PowerShell:

```powershell
$env:DATABASE_URL="ton_url_postgres"
npm run db:push
```

## 3. Déployer le site

Tu peux envoyer le dossier sur Vercel. Vercel installera `pg`, servira `index.html`, et utilisera `/api` pour lire/modifier la base.

Les actions disponibles depuis le site:

- afficher les générations;
- afficher toutes les cartes;
- ajouter une carte;
- modifier une carte;
- supprimer une carte.

L'ancien `api.php` peut rester pour ton WAMP local, mais Vercel utilisera l'API JavaScript.
