# HSC Board Exam Progress Tracker

## Overview

This is a study progress tracking application designed for 12th HSC (Higher Secondary Certificate) Board Exam preparation. The app helps students organize their study schedule with day-wise task management, subject-wise progress tracking, and goal visualization. The interface is inspired by Linear's clean productivity design combined with Notion's dashboard approach.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state caching and synchronization
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming (light/dark mode support)
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful JSON API endpoints under `/api/*`
- **Development**: Vite middleware for HMR during development
- **Production**: Static file serving from built assets

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` - shared between frontend and backend
- **Validation**: Zod schemas generated from Drizzle schema using drizzle-zod
- **Current Storage**: In-memory storage implementation (`MemStorage` class) with interface designed for easy PostgreSQL migration

### Project Structure
```
client/           # React frontend application
  src/
    components/   # Reusable UI components
    pages/        # Route page components (Dashboard, Schedule, Progress)
    hooks/        # Custom React hooks
    lib/          # Utility functions and API client
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route definitions
  storage.ts      # Data storage interface and implementation
shared/           # Shared code between frontend and backend
  schema.ts       # Database schema and type definitions
```

### Key Design Decisions

1. **Monorepo Structure**: Single repository with client, server, and shared directories enables type sharing and simpler deployment.

2. **Interface-Based Storage**: The `IStorage` interface in `storage.ts` abstracts data operations, allowing seamless transition from in-memory to PostgreSQL storage.

3. **Shared Schema**: Database schema in `shared/schema.ts` is used by both frontend (for types and validation) and backend (for ORM operations).

4. **Component-First UI**: Using shadcn/ui provides accessible, customizable components while maintaining design consistency.

## External Dependencies

### Database
- **PostgreSQL**: Configured via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migrations stored in `/migrations` directory
- **Migration Command**: `npm run db:push` for schema synchronization

### Frontend Libraries
- **Radix UI**: Accessible UI primitives (dialogs, dropdowns, forms, etc.)
- **Lucide React**: Icon library
- **date-fns**: Date manipulation utilities
- **embla-carousel-react**: Carousel component
- **recharts**: Chart visualization (via shadcn/ui chart component)

### Backend Libraries
- **express-session**: Session management (configured for PostgreSQL store)
- **connect-pg-simple**: PostgreSQL session store
- **zod**: Runtime schema validation

### Development Tools
- **Vite**: Frontend build and dev server
- **esbuild**: Backend production bundling
- **TypeScript**: Type checking across the codebase