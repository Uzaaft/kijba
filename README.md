# Kan I Just Ban Already

A modern, collaborative Kanban board application built with Next.js, TypeScript, and PostgreSQL. Create boards, organize tasks into columns, and share your workflow with others.

## Features

- **Create & Manage Boards** - Create boards with password protection and shareable links
- **Drag-and-Drop Interface** - Reorder cards and columns using intuitive drag-and-drop
- **Real-time Updates** - Server-Sent Events (SSE) for live board synchronization
- **User Authentication** - Email/password authentication with session management
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Authentication**: Better Auth (email/password, cookie-based sessions)
- **UI Components**: shadcn/ui + Tailwind CSS 4 + Radix UI primitives
- **Drag & Drop**: @hello-pangea/dnd
- **Notifications**: Sonner (toast notifications)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database
- Docker (optional, for database)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-repo/kan-i-just-ban-already.git
cd kan-i-just-ban-already
```

2. Install dependencies:

```bash
nix develop # if using Nix
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Set up the database:

```bash
pnpm db:push
```

### Development

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Production

Build for production:

```bash
pnpm build
```

Start production server:

```bash
pnpm start
```

## Project Structure

```
src/
├── app/                    # Next.js routes
│   ├── (auth)/            # Authentication pages (login, signup)
│   ├── (dashboard)/       # Protected dashboard routes
│   │   └── boards/        # Board management
│   ├── api/               # API routes
│   │   └── events/        # SSE endpoint for real-time updates
│   └── public/            # Public board viewing
├── components/            # Reusable React components
├── lib/
│   ├── auth.ts           # Better Auth server configuration
│   ├── auth-client.ts    # Better Auth client hooks
│   ├── db/               # Database client and schema
│   └── utils/            # Utility functions
drizzle/                  # Database migrations
```

## Database Schema

**Core Tables**:

- `boards` - Kanban boards (uuid, owner_id, name, shareCode, passwordHash)
- `columns` - Board columns (uuid, boardId, name, position)
- `cards` - Cards in columns (uuid, columnId, content, position, color)

**Auth Tables** (Better Auth managed):

- `users` - User accounts
- `sessions` - User sessions
- `accounts` - OAuth accounts
- `verifications` - Email verification tokens

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server on port 3000 |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm tsc --noEmit` | Type check without emitting |
| `pnpm db:push` | Apply Drizzle migrations |

## Code Style & Conventions

- **Imports**: Use `@/*` path alias
- **Client/Server**: Mark client components with `"use client"`
- **Naming**: camelCase for functions, PascalCase for components
- **Error Handling**: Wrap fetches in try-catch, show errors via `toast.error()`
- **Exports**: Default exports for pages, named exports for components
- **Formatting**: Prettier via ESLint (flat config)

## Docker Setup

Run PostgreSQL locally with Docker:

```bash
docker-compose up -d
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure code is linted: `pnpm lint`
4. Type check: `pnpm tsc --noEmit`
5. Submit a pull request

## License

MIT
