# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

"JedOS" — a desktop-OS-styled portfolio site. React frontend renders draggable windows/icons/taskbar; a .NET Web API serves projects/skills/contact data from Postgres. Some UI text and API error messages are in Thai.

```
portfolio-fullstack/
├── client/   React + TypeScript + Tailwind (Vite)
├── server/   ASP.NET Core Web API + EF Core (Npgsql)
└── docker-compose.yml / docker-compose.prod.yml
```

There is no test suite in this repo (neither client nor server).

## Commands

### Full stack (Docker)
```bash
docker compose up --build
```
Frontend on :3000, API on :5000 (Swagger at /swagger in Development), Postgres on :5432 (postgres/devpass).

### Frontend (`client/`)
```bash
npm install
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build
npm run preview   # preview production build on :3000
```
Needs `client/.env` with `VITE_API_URL=http://localhost:5000` when running outside Docker.

### Backend (`server/`)
```bash
dotnet restore
dotnet run
```
EF Core migrations (.NET SDK required locally, not present in the container dev image):
```bash
dotnet tool install --global dotnet-ef   # once
dotnet ef migrations add <Name>
```
Migrations apply automatically via `db.Database.Migrate()` in [Program.cs](server/Program.cs) at startup — never run `dotnet ef database update` manually.

## Architecture

### Frontend: single-state-tree desktop shell
[Desktop.tsx](client/src/components/desktop/Desktop.tsx) is the only stateful component — it owns the full `WindowState[]` array (position, z-index, open/minimized) for every window and passes down `open/close/minimize/focus/move` callbacks. Windows are not mounted/unmounted on close; [Window.tsx](client/src/components/desktop/Window.tsx) returns `null` when closed/minimized, so window content components never remount and lose state during a session.

Adding a new "app" window requires touching three places in lockstep:
1. Add the id to `WindowId` in [types/index.ts](client/src/types/index.ts)
2. Add an entry to `initialWindows` in [Desktop.tsx](client/src/components/desktop/Desktop.tsx)
3. Add the component to the `windowContent` map in the same file

Dragging is handled by [useDraggable.ts](client/src/hooks/useDraggable.ts), a pointer-events hook returning `onPointerDown`; each `Window` wires it to its own title bar.

All API calls go through the single typed client in [api/client.ts](client/src/api/client.ts) (`api.getProjects`, `api.getSkills`, `api.sendContact`) — a thin `fetch` wrapper reading `VITE_API_URL` at build/runtime. Don't call `fetch` directly from components.

### Backend: minimal controller-per-resource API
Three controllers ([ProjectsController](server/Controllers/ProjectsController.cs), [SkillsController](server/Controllers/SkillsController.cs), [ContactController](server/Controllers/ContactController.cs)) talk directly to [AppDbContext](server/Data/AppDbContext.cs) — no repository/service layer except `IEmailService` for contact-form notifications ([Services/EmailService.cs](server/Services/EmailService.cs)). Contact form saves to the DB first and only *then* attempts to send a notification email; email failures are logged but never fail the request (see [ContactController.cs](server/Controllers/ContactController.cs)).

Seed data (initial projects/skills) lives as `HasData(...)` calls in `AppDbContext.OnModelCreating` — to change seeded rows, edit there and add a new migration rather than editing the DB directly. `Project.TechStack` is mapped to a native Postgres `text[]` column, not a join table.

### Connection string resolution
[Program.cs](server/Program.cs) builds the DB connection string differently per environment: if `DATABASE_URL` env var is set (Railway's managed Postgres format), it's parsed into a Npgsql-style string; otherwise it falls back to `ConnectionStrings:DefaultConnection` from config (used by Docker Compose / local `appsettings.json`). CORS is locked to a single origin read from the `FrontendUrl` config key.

### Deployment targets
Two independent deployment paths exist — don't conflate their config:
- **Self-hosted VPS**: `docker-compose.prod.yml` + [Caddyfile](Caddyfile), Caddy handles automatic HTTPS via Let's Encrypt for two DNS records (`$DOMAIN` and `api.$DOMAIN`).
- **Railway**: three separate services (managed Postgres plugin, API from `server/` Dockerfile, client from `client/` Dockerfile), wired via `DATABASE_URL`, `FrontendUrl`, and `VITE_API_URL` env vars/build args.

SMTP env vars (`Smtp__User`, `Smtp__Password`, `Smtp__NotifyTo`) are optional — contact form still persists to DB without them, just skips the notification email. `Smtp__Password` must be a Gmail App Password, not the account password.
