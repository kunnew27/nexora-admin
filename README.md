# Nexora Admin

A modern, minimalist admin dashboard built with **React 19**, **Vite**, **Tailwind CSS v4**, and **shadcn/ui (Base UI)**.

## Features

- **Authentication** — login flow with route guards (`AdminLayout` requires auth, `AuthLayout` is guest-only), persisted with Zustand
- **Dashboard** — stats, sales area chart (Recharts), and recent invoices
- **Reusable DataTable** — client-side search, sortable columns, pagination, sticky header, viewport-fitted scrolling; plus a server-side variant (`ServerDataTable`) with debounced search, skeleton loading, and error retry
- **Users management** — create/edit via a right-side drawer with **Zod validation**, delete with a confirmation dialog, and **sonner toasts** for every action
- **Command palette (⌘K)** — quick navigation from anywhere, frosted-glass styling
- **Notifications** — header bell with unread badge, mark-read / mark-all-read
- **Theming** — Light / Dark / System switcher, persisted across reloads
- **Settings** — tabbed toolbar (Profile / Security / Notifications) with toggle panels
- **Full-width shell** — sidebar layout with route-aware breadcrumbs and active states

## Tech Stack

| Tool | Purpose |
|------|---------|
| [React 19](https://react.dev) + [Vite 8](https://vite.dev) | UI & build tooling |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling |
| [shadcn/ui](https://ui.shadcn.com) (base-nova / Base UI) | Component primitives |
| [React Router v7](https://reactrouter.com) | Routing & guards |
| [Zustand 5](https://zustand.docs.pmnd.rs) | State (auth, theme, users, notifications) |
| [Zod](https://zod.dev) | Form validation |
| [Recharts](https://recharts.org) | Charts |
| [sonner](https://sonner.emilkowal.ski) | Toasts |
| [Husky](https://typicode.github.io/husky) + [commitlint](https://commitlint.js.org) | Git hooks & commit conventions |

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Log in with any valid email — the demo auth store accepts any credentials.

Other scripts:

```bash
npm run build    # type-check + production build
npm run lint     # ESLint
npm run preview  # preview the production build
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn primitives (button, dialog, sheet, …)
│   ├── data-table.tsx   # reusable client-side DataTable
│   ├── data-table-server.tsx
│   ├── user-form-drawer.tsx
│   ├── command-palette.tsx
│   ├── notifications-menu.tsx
│   └── app-shell.tsx / app-header.tsx / app-sidebar.tsx
├── layouts/             # AdminLayout (guarded) & AuthLayout (guest)
├── pages/               # dashboard, users, settings, activity, …
├── stores/              # Zustand stores (auth, theme, users, …)
├── lib/                 # validators, utils
└── routes/              # router configuration
```

## Git Conventions

Commits follow [Conventional Commits](https://www.conventionalcommits.org) and are enforced by Husky + commitlint:

```
feat(users): add bulk delete
fix: correct dropdown z-index
chore: bump dependencies
```

Allowed types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`.

On every commit, the `pre-commit` hook runs `npm run lint`.
