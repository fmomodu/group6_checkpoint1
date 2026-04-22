# 💅 Beauty Book

> Discover, compare, and connect with local beauty professionals.

**Group 6** — CS Project | Next.js Full-Stack App

---

## Team
| Role | Member |
|------|--------|
| Project Manager | Favour |
| UX Designer | Viyata |
| Builder / Developer | Hanson |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS |
| Backend | Next.js API Routes (serverless) |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js (JWT + credentials) |
| AI | Anthropic Claude (BeautyBot) |
| Deployment | Vercel |

---

## Features (MVP)

- ✅ User registration & sign-in
- ✅ Search & browse beauty professionals
- ✅ Location-based search
- ✅ Filter by service type, price, rating
- ✅ Beauty professional profile pages
- ✅ Save / favorite providers
- ✅ Ratings & reviews (CRUD)
- ✅ MySQL/PostgreSQL database integration
- ✅ AI chatbot (BeautyBot) for personalized recommendations

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero search + featured pros |
| `/search` | Search results with filters |
| `/professionals/[id]` | Pro profile with gallery, hours, reviews |
| `/login` | Sign in |
| `/register` | Create account |
| `/profile` | User profile + saved/pinned techs |

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/professionals` | Search professionals |
| GET | `/api/professionals/[id]` | Get one professional |
| ALL | `/api/auth/[...path]` | Neon Auth handler |
| GET | `/api/favorites` | Get user's saved pros |
| POST | `/api/favorites` | Toggle favorite |
| POST | `/api/reviews` | Create/update review |
| POST | `/api/chat` | AI chatbot (BeautyBot) |

---

## Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/fmomodu/group6_checkpoint1.git
cd group6_checkpoint1
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```
DATABASE_URL="postgresql://..."
NEON_AUTH_BASE_URL="https://your-branch.neonauth.us-east-1.aws.neon.tech"
NEON_AUTH_COOKIE_SECRET="run: openssl rand -base64 32"
ANTHROPIC_API_KEY="sk-ant-..."
```

### 3. Set up the database
```bash
npx prisma db push
node prisma/seed.js
```

Enable Neon Auth in the Neon Console first under:
`Project -> Branch -> Auth -> Configuration`

### 4. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import repo
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` — use [Neon](https://neon.tech) or [Vercel Postgres](https://vercel.com/storage/postgres) for free PostgreSQL
   - `NEON_AUTH_BASE_URL` — copy from Neon Console under your branch Auth configuration
   - `NEON_AUTH_COOKIE_SECRET` — generate with `openssl rand -base64 32`
   - `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com)
4. Click Deploy!
5. After deploy, run seed: `npx vercel env pull && node prisma/seed.js`

---

## Database Schema

```
User          — id, email, name, password, image
Professional  — id, name, bio, city, services[], priceMin, priceMax, gallery[], avgRating
Review        — userId, professionalId, rating, comment
Favorite      — userId, professionalId
Hours         — professionalId, day, open, close
```

---

## Folder Structure

```
beauty-book/
├── app/
│   ├── page.js              # Homepage
│   ├── search/page.js       # Search results
│   ├── professionals/[id]/  # Pro profile
│   ├── login/page.js
│   ├── register/page.js
│   ├── profile/page.js      # User profile + saved
│   └── api/
│       ├── auth/            # NextAuth + register
│       ├── professionals/   # Search + profile
│       ├── favorites/       # Save/unsave
│       ├── reviews/         # CRUD reviews
│       └── chat/            # BeautyBot AI
├── components/
│   ├── Navbar.js
│   ├── ChatBot.js
│   └── ReviewForm.js
├── lib/
│   ├── prisma.js
│   └── auth.js
├── prisma/
│   ├── schema.prisma
│   └── seed.js
└── README.md
```
