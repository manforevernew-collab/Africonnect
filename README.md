# AfriConnect v2

Africa's premier verified professional network. KYC-verified talent, AI-matched opportunities, built for Africa.

## 🚀 Quick Start (Local)

```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

## 🌐 Deploy to Vercel

### Option 1: Vercel CLI (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from project root
vercel

# 4. Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# 5. Redeploy with env vars
vercel --prod
```

### Option 2: Vercel Dashboard (GitHub)

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and click "Add New Project"
3. Import your GitHub repo
4. Set Framework Preset to **Vite**
5. Add Environment Variables:
   - `VITE_SUPABASE_URL` = `https://hmzdufreadfglgsiryeb.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
6. Click **Deploy**

### Option 3: Vercel Dashboard (Manual Upload)

1. Run `npm run build` locally
2. Go to [vercel.com](https://vercel.com) → "Add New Project"
3. Select "Import Git Repository" or upload the `dist/` folder
4. Add the environment variables above
5. Deploy

## ⚙️ Environment Variables

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://hmzdufreadfglgsiryeb.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## 📁 Project Structure

```
africonnect-v2/
├── src/
│   ├── components/     # Navbar, Footer, ProtectedRoute, KYCGuard
│   ├── context/        # AuthContext
│   ├── lib/            # Supabase client
│   ├── pages/          # All route pages
│   ├── App.jsx         # Router setup
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── vite.config.js
├── vercel.json         # SPA routing config
├── package.json
├── .env
└── .env.example
```

## ✨ Features

- **Professional Directory** — Browse KYC-verified African professionals
- **Job Board** — Search and filter jobs by category, location, type
- **Business Job Posting** — Recruiters post jobs with required skills
- **AI Matching** — Resume skills matched against job requirements (% score)
- **KYC Verification** — Govt ID upload for job seekers, business cert for recruiters
- **Address Verification** — GPS capture + utility bill upload
- **Admin Dashboard** — Approve/reject KYC and address submissions
- **Social Auth** — Google, LinkedIn, X, Apple
- **Demo Accounts** — One-click login for testing

## 🔐 Demo Accounts

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Job Seeker | `jobseeker@africonnect.demo` | `DemoPass123!` | User |
| Business | `business@africonnect.demo` | `DemoPass123!` | Admin |

## 🗄️ Supabase Setup

1. Run the migration SQL in your Supabase SQL Editor
2. Create storage buckets: `resumes` (public), `kyc` (private)
3. Enable Auth providers: Google, LinkedIn (OIDC), Twitter/X

## 📝 Notes

- The `.env` file contains your Supabase credentials. **Do not commit this to Git.**
- `vercel.json` handles React Router SPA routing on Vercel.
- To make a user an admin, update their `role` in the `profiles` table to `'admin'`.

---

Built with ❤️ for Africa.
