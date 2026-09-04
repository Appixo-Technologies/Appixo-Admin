# Appixo Admin Dashboard

A modern admin control panel for managing client enquiries, communications, and platform metrics for Appixo Technologies.

## Features

- **Lead & Enquiry Management**: Filter, search, and review incoming client project inquiries in real-time.
- **Status Workflows**: Update enquiry lifecycle statuses (Pending, In Progress, Resolved, Closed).
- **Secure Authentication**: JWT-based session management with role-based access control.
- **Full Device Responsiveness**: Optimized layout across mobile, tablet, and desktop viewports.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Language**: TypeScript
- **Styling**: Custom CSS Design System
- **Backend Integration**: REST API via `NEXT_PUBLIC_API_BASE_URL`

---

## Environment Variables

Copy `.env.example` to `.env.local` and set your backend API base URL:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
```

---

## Local Development

```bash
# Install project dependencies
npm install

# Start local development server
npm run dev

# Create optimized production build
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the admin portal.

---

## Deployment (Vercel)

1. Push changes to your Git repository:
   ```bash
   git add .
   git commit -m "build: prepare for deployment"
   git push origin main
   ```
2. Import the project into [Vercel](https://vercel.com/new).
3. In **Environment Variables**, set:
   - **Key:** `NEXT_PUBLIC_API_BASE_URL`
   - **Value:** `https://appixo-backend.onrender.com`
4. Click **Deploy**.

