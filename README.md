# EduFlow — Plateforme E-Learning Complète

Une plateforme d'apprentissage moderne connectant étudiants et professeurs, avec une application **web (Next.js 14)** et **mobile (Flutter)** partageant le même backend **Supabase**.

## 🏗️ Architecture Technique

```
E-learning/
├── web/                    # Application Next.js 14 (App Router)
│   ├── app/
│   │   ├── (auth)/         # Pages login/register
│   │   ├── api/            # API Routes Next.js (Gemini AI)
│   │   │   └── quiz/       # generate/ et feedback/
│   │   └── dashboard/
│   │       ├── admin/      # Dashboard administrateur
│   │       ├── student/    # Dashboard étudiant
│   │       └── teacher/    # Dashboard professeur
│   ├── components/
│   ├── lib/supabase/       # Client/Server/Middleware Supabase
│   └── .env.local          # Variables d'environnement
│
├── mobile/                 # Application Flutter
│   └── lib/
│       ├── app/router.dart # GoRouter avec guards d'auth
│       └── features/       # Auth, Dashboard, Quiz
│
└── supabase/
    ├── migrations/         # Schéma SQL + RLS complet
    └── functions/          # Edge Functions Deno
        ├── calculate-score/    # Calcul sécurisé des scores
        ├── enroll-course/      # Inscription aux cours
        ├── generate-certificate/   # Génération PDF HTML
        └── generate-quiz/      # Génération AI quiz (OpenAI)
```

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- Flutter 3.0+
- Un projet Supabase actif

### 1. Configuration Web

```bash
cd web
cp .env.local.example .env.local
# Éditez .env.local avec vos clés Supabase
npm install
npm run dev
```

### 2. Configuration Mobile

Dans `mobile/lib/main.dart`, remplacez les credentials hardcodés par des variables système ou un `.env` Flutter :
```dart
await Supabase.initialize(
  url: const String.fromEnvironment('SUPABASE_URL'),
  anonKey: const String.fromEnvironment('SUPABASE_ANON_KEY'),
);
```

### 3. Base de Données Supabase

Exécutez les migrations dans l'ordre dans l'éditeur SQL de Supabase :

1. `20260309_initial_schema.sql` — Schéma de base + RLS
2. `20260310_course_materials.sql` — Table materials
3. `20260310_fix_recursion.sql` — Fix récursion RLS
4. `20260310_storage_setup.sql` — Buckets de stockage
5. `20260311_certificates.sql` — Système de certificats
6. `20260311_student_visibility.sql` — Visibilité étudiants
7. `20260312_auto_publish.sql` — Auto-publication
8. `20260312_storage_and_scores.sql` — Scores + avatars
9. `20260313_fix_critical_bugs.sql` — ⭐ Migration critique (Auto-Profil, Inscription, Fix Quiz)
10. `20260313_security_and_indexes.sql` — Index de performance
11. `20260313_qa_and_scores_security.sql` — Sécurité Q&A et scores

### 4. Edge Functions Supabase

Déployez les Edge Functions avec Supabase CLI :

```bash
supabase functions deploy calculate-score
supabase functions deploy enroll-course
supabase functions deploy generate-certificate
supabase functions deploy generate-quiz

# Définir les secrets
supabase secrets set OPENAI_API_KEY=your-key
```

## 🔐 Sécurité

| Mécanisme | Statut |
|---|---|
| Row Level Security (RLS) | ✅ Activé sur toutes les tables |
| Scores calculés côté serveur | ✅ Edge Function sécurisée |
| JWT validé avant chaque opération | ✅ |
| Middleware de protection des routes | ✅ |
| Récursion RLS résolue | ✅ Via fonctions SECURITY DEFINER |

## 📱 Rôles Utilisateurs

| Rôle | Accès |
|---|---|
| **student** | Voir les cours publiés, s'inscrire, faire les quiz, obtenir des certificats |
| **teacher** | Créer/modifier/supprimer ses cours, générer des quiz IA, répondre aux Q&A |
| **admin** | Accès complet à toutes les données |

## 🤖 Fonctionnalités IA

- **Génération de quiz** : Utilise Gemini 1.5 Flash (API Next.js) avec fallback démo
- **Feedback IA** : Analyse personnalisée après chaque quiz
- **Certificats** : Générés automatiquement en HTML/PDF lors de la réussite

## ⚠️ Notes Importantes

- La clé Supabase `anonKey` dans `mobile/main.dart` doit être externalisée avant la production
- Configurez `GEMINI_API_KEY` dans `.env.local` pour activer la génération AI réelle
- La page d'administration (`/dashboard/admin`) nécessite un utilisateur avec `role = 'admin'` dans la table `profiles`
