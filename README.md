# Strength Sync – Open‑Source Fitness Tracker with AI

## ✨ Overview

**Strength Sync** is a modern, privacy‑first workout planner and logger. Built with **Next.js (App Router) + Prisma + Supabase**, it helps athletes and coaches create templates, log sessions, and visualise progress. Upcoming AI‑powered features will generate personalised workouts and insights from your training data.

## 🏗️ Core Features

* **Folders → Workouts → Exercises** hierarchy for tidy programming.
* **Live logging UI** that tracks sets/reps, RIR and rest timers.
* **Dashboards & charts** for streaks, PRs and volume trends.
* **Supabase Auth** with social‑login & edge‑session middleware.
* **Responsive shadcn/ui design** that works great on mobile.
* **AI Workout Generator** (under development) to suggest evidence‑based templates.

## 🗺️ Roadmap

* RIR & intensity guidance
* Exercise caching & quick search
* Template marketplace
* Mobile PWA / offline mode
* …see the `TODO` list in code for more ideas

## 🧰 Tech Stack

| Layer          | Tech                                                                    |
| -------------- | ----------------------------------------------------------------------- |
| Front‑end      | Next.js 15, React 18, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons |
| State          | React Server Components + Zustand                                       |
| Charts         | Recharts                                                                |
| Auth & Storage | Supabase JS SDK 2 + Postgres                                            |
| ORM            | Prisma 5 (PostgreSQL)                                                   |
| Utility        | Zod, nanoid, date‑fns                                                   |

Scripts are defined in **package.json** (e.g. `pnpm dev`, `pnpm db:generate`).

## 🖥️ Local Setup

1. **Clone** the repo and `cd` into it.
2. **Environment vars** – copy `.env.example` to `.env` and fill in secrets. At minimum set a valid `DATABASE_URL`.
3. **Database** – spin up Postgres with Docker via:

   ```bash
   ./start-database.sh
   ```

   The script auto‑creates a container called `str-sync-postgres`.
4. **Install** dependencies & generate the Prisma client:

   ```bash
   pnpm install
   pnpm db:generate   # runs `prisma migrate dev`
   ```
5. **Run** the dev server:

   ```bash
   pnpm dev
   ```

   Visit [http://localhost:3000](http://localhost:3000).

### Migrations

Prisma migrations live in `prisma/migrations/*`. During development `prisma migrate dev` will create/apply new migrations and seed the DB.

## 🚀 Deployment

* **Vercel** – zero‑config; just add env vars.
* **Docker Compose** – bundle Next.js & Postgres for self‑hosting.

## 🤖 AI Add‑ons (Planned)

* **Generate workout templates** from goals & equipment.
* **Summarise performance trends** into natural‑language insights.
* **Recommend progression** based on fatigue / RIR data.

## 🙌 Contributing

1. Fork ➜ create a feature branch ➜ commit using Conventional Commits.
2. Run `pnpm lint` & `pnpm check` before opening a PR.
3. Describe behaviour changes and attach screenshots/GIFs when relevant.

## 📄 License

MIT — see `LICENSE` for details.

> Built with ❤️ by the community to make strength training data‑driven and fun.
