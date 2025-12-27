# Portfolio Website - Abdhesh

## Overview
A personal portfolio website built with React, Express, and PostgreSQL. The application showcases projects, skills, and professional experience.

## Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Radix UI, shadcn/ui

## Project Structure
```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities and query client
│   │   └── pages/        # Page components
│   └── index.html        # Entry HTML file
├── server/               # Backend Express server
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── db.ts             # Database connection
│   ├── storage.ts        # Data access layer
│   └── vite.ts           # Vite dev server integration
├── shared/               # Shared code between client/server
│   ├── schema.ts         # Drizzle database schema
│   └── routes.ts         # Shared route definitions
└── script/
    └── build.ts          # Production build script
```

## Development
- **Start dev server**: `npx tsx server/index.ts`
- **Database push**: `npm run db:push`
- **Build for production**: `npm run build`
- **Run production**: `npm run start`

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (automatically provided)

## Deployment
Configured for autoscale deployment on Replit. The production build compiles the frontend and bundles the server.
