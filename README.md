# EduVault — College Resource Hub

A secure, full-stack platform for college students to access past year question papers and subject-wise notes.

## Features

- 🔐 **Secure Auth** — Supabase email/password auth with PKCE flow, email verification
- 📄 **Question Papers** — Mid Term 1 & 2, End Semester papers organized by semester & subject
- 📚 **Notes** — Subject-wise notes grouped by semester
- 👑 **Admin Panel** — Upload, manage files; promote users to admin
- 🔒 **Signed URLs** — Secure, expiring download links (1 hour). Files are never public
- 📱 **Responsive** — Works on mobile, tablet, desktop
- 🚀 **Vercel-ready** — Deploy in minutes

---

## Project Structure

```
college-portal/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── RouteGuards.jsx      # ProtectedRoute, AdminRoute, PublicRoute
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx        # Main layout with Navbar
│   │   │   └── Navbar.jsx           # Navigation bar
│   │   └── ui/
│   │       └── index.jsx            # Button, Input, Select, Alert, Card, Badge...
│   ├── context/
│   │   └── AuthContext.jsx          # Global auth state + signIn/signUp/signOut
│   ├── hooks/
│   │   └── useData.js               # useSemesters, useSubjects, useQuestionPapers, useNotes
│   ├── lib/
│   │   └── supabase.js              # Supabase client + storage helpers
│   ├── pages/
│   │   ├── Landing.jsx              # Public landing page
│   │   ├── Login.jsx                # Sign in
│   │   ├── Signup.jsx               # Sign up with validation
│   │   ├── Dashboard.jsx            # Student dashboard
│   │   ├── QuestionPapers.jsx       # Browse & download papers
│   │   ├── Notes.jsx                # Browse & download notes
│   │   ├── AdminPanel.jsx           # Upload papers, notes, manage subjects
│   │   └── AdminUsers.jsx           # Manage user roles
│   ├── styles/
│   │   └── global.css               # Full design system
│   ├── App.jsx                      # Router + route guards
│   └── main.jsx                     # Entry point
├── supabase-schema.sql              # Full DB schema + RLS policies
├── vercel.json                      # Security headers + SPA rewrites
├── .env.example                     # Environment variables template
└── vite.config.js
```

---

## Setup Guide

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → run the full contents of `supabase-schema.sql`
3. This creates all tables, RLS policies, storage buckets, and the auto-profile trigger

### 2. Environment Variables

```bash
cp .env.example .env
```

Fill in your Supabase values from **Project Settings → API**:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install & Run

```bash
npm install
npm run dev
```

### 4. Create Your Admin Account

1. Sign up through the website with your email
2. Go to Supabase SQL Editor and run:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
   ```
3. Sign out and back in — you'll now see the Admin Panel

### 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
```

Or connect your GitHub repo to Vercel for automatic deployments.

---

## Security

| Layer | Implementation |
|-------|---------------|
| **Auth** | Supabase PKCE flow, email verification |
| **Database** | Row Level Security on all tables |
| **Storage** | Private buckets, signed URLs (1hr expiry) |
| **Files** | Type + size validation before upload |
| **Routes** | Client-side role guards (Admin/Student) |
| **Headers** | CSP, X-Frame-Options, etc. (via vercel.json) |

---

## Admin Workflow

1. Log in as admin → click **Admin Panel** in navbar
2. **Subjects & Semesters** tab → Add any missing subjects
3. **Question Papers** tab → Select semester/subject, choose exam type, upload PDF
4. **Notes** tab → Upload subject notes (PDF or DOCX)
5. **Manage Users** → Promote/demote other admins

---

## Customization

- **College name**: Search/replace `EduVault` across files
- **Semesters**: Modify the seed `INSERT` statements at the bottom of `supabase-schema.sql`
- **File size limits**: Change in `AdminPanel.jsx` (default: 10MB papers, 20MB notes)
- **URL expiry**: Change `3600` (seconds) in `src/lib/supabase.js → getSignedUrl()`
