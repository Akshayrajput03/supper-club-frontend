# SupperClub Frontend

React app for the Neighborhood Supper Club Platform.

## Pages

| Route | Page | Auth |
|---|---|---|
| `/` | Home / Landing | Public |
| `/listings` | Browse dinners | Public |
| `/listings/:id` | Dinner detail + booking | Public (book requires auth) |
| `/login` | Sign in | Public |
| `/register` | Create account | Public |
| `/dashboard` | My bookings + chat | Protected |
| `/host/create` | Create a dinner listing | Protected |

## Tech Stack
- React 18 + React Router 6
- Axios (API calls with JWT interceptor)
- react-hot-toast (notifications)
- lucide-react (icons)
- date-fns (date formatting)
- Google Fonts: Playfair Display + Inter

## Local Development

```bash
npm install
cp .env.example .env.local   # fill in values

npm start    # starts on http://localhost:3000
```

The `"proxy": "http://localhost:8080"` in package.json proxies all `/api/*` calls to the Spring Boot backend during development.

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable in Vercel dashboard:
# REACT_APP_API_URL = https://supper-club-api.fly.dev/api
```

The `vercel.json` handles SPA routing so React Router works correctly.

## Design System

The app uses a warm earthy design with:
- **Terracotta** `#C4622D` — primary color, CTAs
- **Cream** `#FAF7F2` — background
- **Charcoal** `#1E1A16` — text
- **Playfair Display** — headings (serif, warmth)
- **Inter** — body text (clean, readable)

## Full Stack Architecture

```
React (Vercel)  ←→  Spring Boot API (Fly.io)  ←→  PostgreSQL (Supabase)
                              ↕
                         Stripe API
```
