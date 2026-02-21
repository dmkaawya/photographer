# 📸 Sadeepa Photography — Luxury Photographer Website

A modern, luxury Next.js photography website with Supabase backend, WhatsApp booking, and PDF invoice generation.

---

## 🚀 Tech Stack

- **Next.js 15** (App Router)
- **Tailwind CSS v4**
- **Supabase** (Database + Auth + Storage)
- **Framer Motion** (Animations)
- **jsPDF** (Invoice Generation)
- **Google Maps API** (Location selector)

---

## 📁 Project Structure

```
├── app/
│   ├── page.tsx              # Home page
│   ├── gallery/page.tsx      # Gallery page
│   ├── packages/page.tsx     # Packages page
│   ├── booking/page.tsx      # Booking form page
│   └── admin/
│       ├── page.tsx          # Admin dashboard
│       └── login/page.tsx    # Admin login
├── components/
│   ├── navigation.tsx
│   ├── footer.tsx
│   ├── home/
│   │   ├── hero.tsx          # Parallax hero section
│   │   ├── featured-works.tsx
│   │   ├── testimonials.tsx
│   │   └── instagram-preview.tsx
│   ├── gallery/
│   │   └── gallery-grid.tsx  # Masonry + lightbox + filters
│   ├── packages/
│   │   └── package-cards.tsx # Package cards + modal
│   ├── booking/
│   │   └── booking-form.tsx  # WhatsApp + PDF invoice
│   └── admin/
│       ├── login-form.tsx
│       └── dashboard.tsx     # Full admin panel
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils.ts
├── types/index.ts
└── supabase-schema.sql       # Database setup SQL
```

---

## ⚙️ Setup Guide

### 1. Clone and Install

```bash
git clone <your-repo>
cd sadeepa-photography
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in all values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
NEXT_PUBLIC_WHATSAPP_NUMBER=94771234567
NEXT_PUBLIC_PHOTOGRAPHER_NAME=Sadeepa Photography
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste contents of `supabase-schema.sql` → Run
3. Go to **Storage** → Create bucket named `gallery` → Set to **Public**
4. Go to **Authentication** → Create an admin user with email/password

### 4. Google Maps Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable **Maps JavaScript API** and **Geocoding API**
3. Create an API key and add to `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## 🌐 Deploying to Vercel

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo to [vercel.com](https://vercel.com) and add all environment variables in the Vercel dashboard under **Settings → Environment Variables**.

---

## 🎨 Customization

### Change Photographer Info
- **Name/Brand**: Update `app/layout.tsx` metadata and `components/footer.tsx`
- **WhatsApp**: Change `NEXT_PUBLIC_WHATSAPP_NUMBER` in `.env.local`
- **Social Links**: Update `components/footer.tsx`

### Change Colors (Gold Theme)
Edit `app/globals.css`:
```css
--gold: #c8a45e;        /* Main gold accent */
--gold-light: #d4b76a;  /* Hover state */
--gold-dark: #8a7a52;   /* Darker variant */
```

### Replace Hero Image
Replace `/public/images/hero.jpg` with your own image (recommended: 1920×1080px or larger).

### Customize Packages
Manage packages from the **Admin Panel** at `/admin` — or edit the seed data in `supabase-schema.sql`.

---

## 🔐 Admin Panel

Visit: `/admin/login`

Log in with the Supabase Auth user you created. From the dashboard you can:
- ✅ Add / Edit / Delete packages
- ✅ Upload gallery images to Supabase Storage
- ✅ Enable / Disable packages
- ✅ View all bookings

---

## 📱 Features

| Feature | Status |
|---|---|
| Parallax Hero | ✅ |
| 3D Image Hover Effects | ✅ |
| Gallery with Category Filter | ✅ |
| Lightbox Preview | ✅ |
| Masonry Grid | ✅ |
| Package Cards + Modal | ✅ |
| Booking Form | ✅ |
| WhatsApp Auto-Message | ✅ |
| PDF Invoice Generation | ✅ |
| GPS Location Detection | ✅ |
| Admin Auth (Supabase) | ✅ |
| Admin Package Manager | ✅ |
| Admin Gallery Upload | ✅ |
| Supabase Storage | ✅ |
| Framer Motion Animations | ✅ |
| Mobile Responsive | ✅ |
| Dark Luxury Theme | ✅ |
| Vercel Ready | ✅ |

---

## 📄 License

MIT — Free to use for personal and commercial projects.
