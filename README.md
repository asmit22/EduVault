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
