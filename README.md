# Appixo Admin Dashboard

Modern admin panel for managing enquiries, client communications, and platform metrics, connected to the Appixo backend.

- **Backend Base URL:** `https://appixo-backend.onrender.com`
- **Frontend Framework:** Next.js 16 (App Router, Turbopack, React 19)

---

## Live Demo Credentials

- **Username / Email:** `admin` or `admin@appixo.com`
- **Password:** `admin123`

---

## Environment Variables

Configure the backend URL in `.env.local` for local development or in Vercel's Project Settings for production:

```env
NEXT_PUBLIC_API_BASE_URL=https://appixo-backend.onrender.com
```

---

## Local Development

```bash
# Install dependencies
npm install

# Run the dev server
npm run dev

# Run production build
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the admin panel.

---

## Deploying to Vercel

### Option 1: Git-Connected Deployment (Recommended)

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: integrate Render backend and prepare for Vercel deployment"
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) and import the `appixo_admin` repository.
3. In **Environment Variables**, add:
   - **Key:** `NEXT_PUBLIC_API_BASE_URL`
   - **Value:** `https://appixo-backend.onrender.com`
4. Click **Deploy**.

### Option 2: Deploy via Vercel CLI

```bash
npx vercel
```
Follow the prompts and add the `NEXT_PUBLIC_API_BASE_URL` environment variable when prompted or in the Vercel dashboard.
