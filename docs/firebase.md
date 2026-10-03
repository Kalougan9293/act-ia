# Firebase — ConformAI

## Isolation des données

Chaque compte a un `structureId`. Un RH ne voit que les collaborateurs de **sa** structure. Un collaborateur ne voit que **son** parcours. Les règles Firestore (`firestore.rules`) l’imposent côté serveur via custom claims Auth (`role`, `structureId`).

## Activer Firebase (console)

1. Créer un projet sur [Firebase Console](https://console.firebase.google.com)
2. Ajouter une app **Web** → copier la config dans `.env.local` (voir `.env.example`)
3. Activer **Authentication** → méthode E-mail / Mot de passe
4. Créer une base **Firestore** (mode production) → déployer les règles :
   ```bash
   npx firebase login
   npx firebase use <project-id>
   npx firebase deploy --only firestore:rules
   ```
5. Custom claims (Cloud Function ou Admin SDK) à chaque création de compte :
   ```js
   { role: "rh" | "employee" | "super_admin", structureId: "str_xxx" }
   ```

## Accès sans « code »

1. Super admin / RH crée le compte (e-mail)
2. Firebase envoie un e-mail de définition du mot de passe (`sendPasswordResetEmail`)
3. Première connexion → espace RH (`/rh`) ou collaborateur (`/utilisateur`)

Helpers : `lib/firebase/auth.ts` (`provisionUser`, `signIn`, `sendResetPassword`).

## Routes actuelles (mock session)

| Route | Rôle | Isolation |
|-------|------|-----------|
| `/admin` | Super admin | Toutes structures |
| `/rh` | RH Atelier Lumière | `structureId = str_atelier` |
| `/utilisateur` | Collaborateur Camille | Même structure, parcours perso |
| `/connexion` | Choix démo | — |

Tant que `.env.local` Firebase est vide, les espaces tournent en **session mock** avec la même isolation `structureId`.
