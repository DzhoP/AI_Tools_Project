# VIBECODING — AI Tools Catalog

Educational project (Vibecoding academy). Catalog of AI tools organized by categories, tags and team roles.

## Stack & Structure

- `vibe.project/` — Laravel 13 API + Blade auth (Breeze), port **8000**
- `vibe-frontend/` — Next.js 16 (App Router, Turbopack) + Tailwind v4, port **3000**
- MySQL 8 + Redis 7, everything runs in Docker (5 containers: vibe_app, vibe_nginx, vibe_mysql, vibe_redis, vibe_nextjs)
- `docker-compose.yml` lives in `vibe.project/`

## ⚠️ CRITICAL: Docker file sync is broken (host → container)

Docker Desktop on Linux does NOT propagate host file edits into running containers. After **every** file edit you MUST copy it manually:

```bash
# Laravel files
docker cp vibe.project/<path> vibe_app:/var/www/<path>
# Next.js files
docker cp vibe-frontend/<path> vibe_nextjs:/app/<path>
```

For CSS/config changes in Next.js (globals.css, layout), also clear the Turbopack cache:

```bash
docker exec vibe_nextjs rm -rf /app/.next && docker restart vibe_nextjs
```

Files created *inside* containers (e.g. uploads) sync fine between containers. Container restart refreshes the mount from host.

## Commands

```bash
cd vibe.project
docker compose up -d --build          # start everything
docker compose exec app php artisan <cmd>   # artisan (migrate, tinker, cache:clear...)
docker compose logs -f                # logs
```

Demo accounts (seeded): `owner@vibe.test`, `backend@vibe.test`, `frontend@vibe.test`, `pm@vibe.test`, `qa@vibe.test`, `designer@vibe.test` — all with password `password`.

## Domain rules

- **Roles:** owner / backend / frontend / pm / qa / designer. Owner is the only admin. Owner role is NOT self-registerable (allowlist via `Rule::in` in both register controllers).
- **Tool ownership:** `ai_tools.user_id` is set server-side from the authenticated user, never from request input. Edit/delete allowed for author OR owner (checked in `AiToolController::authorizeOwnership`).
- **Tool statuses:** `pending` / `approved` / `rejected`. Non-owner submissions start as `pending`; public list (`GET /api/tools`) returns only `approved` unless an owner passes `?status=`. Owner-created tools are auto-approved.
- **Owner-only routes** are grouped under `middleware('role:owner')` in `routes/api.php` (`/api/users`, `/api/tools/{id}/status`, `/api/activity`). Middleware alias registered in `bootstrap/app.php`.
- **Audit log:** every tool mutation (created/updated/deleted/approved/rejected) is recorded via `ActivityLog::record()`. Log `deleted` BEFORE calling `$tool->delete()`.
- **Caching:** `GET /api/categories` is cached in Redis for 6h using cache tags (`CategoryController::CACHE_TAG`). Every tool/category mutation must call `Cache::tags(...)->flush()`. Cache plain arrays (`->toArray()`), NEVER raw Eloquent Collections (deserialization breaks).
- **2FA:** email code flow. `POST /api/login` returns `two_factor_required` + sends a 6-digit code (10 min TTL, stored on `users` table); `POST /api/login/verify-2fa` exchanges it for the Sanctum token. In `local` env the response includes `demo_code` for easy testing — must be removed for production. Mail driver is `log`.

## Frontend conventions

- Auth state is a shared React context (`hooks/useAuth.tsx`, `AuthProvider` in `app/layout.tsx`). Never create per-component auth state.
- API client: `lib/api.ts` (typed `toolsApi`, `categoriesApi`, `tagsApi`, `rolesApi`, `uploadApi`; Bearer token from localStorage).
- UI language is **Bulgarian**. Design: honey-amber palette (amber-500 primary), dark mode via `.dark` class on `<html>` + localStorage (`ThemeToggle`), pre-paint script in layout prevents theme flash.
- Feedback: `useToast()` for success/error, `ConfirmModal` for destructive confirmations. No `alert()`/`confirm()`.
- Colored category/tag pills must use `textOn()` from `lib/color.ts` for readable text on user-picked colors.
- Role-gated nav: `NAV_ITEMS` in `components/Navbar.tsx`; admin area guard lives in `app/admin/layout.tsx`. UI gating is UX only — real enforcement is the API middleware.

## Working with the user

The user is a Bulgarian-speaking beginner (Vibecoding academy student). Communicate in Bulgarian, explain terms simply, avoid metaphor-jargon. Ask before big design decisions. The user prefers to run git/GitHub commands manually.
