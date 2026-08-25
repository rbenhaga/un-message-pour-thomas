# Un message pour Thomas

Petit site de collecte de messages avec choix d'écriture et signature dessinée ou saisie au clavier.

## Développement local

1. Copier `.dev.vars.example` vers `.dev.vars` et choisir `ATELIER_KEY`.
2. Lancer `npm install` puis `npm run dev`.
3. Ouvrir `http://localhost:3000`.

L'atelier organisateur est disponible sur `/atelier`. Il permet de consulter, imprimer et télécharger une sauvegarde JSON complète des messages, signatures comprises.

## Persistance des messages

Les messages sont stockés dans une base Cloudflare D1 liée au binding `DB`. Ils ne sont pas stockés dans le dépôt GitHub.

Pour conserver les messages lors d'un nouveau déploiement, il faut impérativement rattacher l'application à la même base D1. Changer de base crée une collecte vide. La variable secrète `ATELIER_KEY` doit aussi être configurée sur l'hébergeur et ne doit jamais être ajoutée au dépôt.

GitHub Pages ne convient pas à ce projet : il ne peut pas exécuter la route serveur `/api/messages` ni accéder à D1.

## Vérifications

```bash
npm run lint
npm run build
```
