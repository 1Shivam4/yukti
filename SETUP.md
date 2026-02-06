# Yukti - Development Setup Guide

## ✅ Phase 0 Complete - Project Initialized!

The Turborepo monorepo is successfully set up with all workspaces configured and building correctly.

## Project Structure

```
yukti/
├── apps/
│   ├── web/              # Next.js frontend (Static Export)
│   │   ├── src/app/      # App Router pages
│   │   └── package.json  # Dependencies: Next.js 15, React 19, Tailwind
│   └── api/              # AWS Lambda functions
│       ├── src/
│       │   ├── functions/
│       │   │   ├── auth/       # Auth Lambda
│       │   │   ├── resumes/    # Resume CRUD Lambda
│       │   │   ├── ai/         # AI  Lambda (to be created)
│       │   │   └── render/     # PDF rendering Lambda (to be created)
│       │   └── index.ts        # Express dev server
│       └── package.json  # Dependencies: Express, AWS SDK
├── packages/
│   ├── shared/           # Shared types & Zod schemas
│   │   └── src/
│   │       ├── resume.schema.ts  # JSON Resume Zod schema
│   │       └── index.ts
│   └── ui/               # Shared React components
│       └── src/
│           ├── Button.tsx
│           └── index.tsx
├── package.json          # Root workspace config
├── turbo.json            # Turborepo pipeline
└── README.md
```

## Available Commands

```bash
# Install dependencies (already done)
bun install

# Run all apps in development mode
bun dev

# Build all packages
bun run build

# Lint all packages
bun run lint

# Format code
bun run format
```

## What's Working

✅ **Turborepo** configured with build caching  
✅ **Next.js 15** with App Router and static export mode  
✅ **Tailwind CSS** configured and working  
✅ **Lambda functions** with TypeScript support  
✅ **Shared packages** (@yukti/shared with Zod schemas)  
✅ **Build system** verified - all packages build successfully  
✅ **Git repository** initialized with 2 commits

## Next Steps (Phase 1 - Foundation)

1. **Set up PostgreSQL Docker container on EC2 or locally**
2. **Configure Prisma** in packages/database
3. **Set up AWS Cognito** for authentication
4. **Create Auth Lambda** with Cognito integration
5. **Build Resume CRUD endpoints**

## Development Workflow

### Working on Frontend

```bash
cd apps/web
bun dev
# Opens http://localhost:3000
```

### Working on API (Local Development)

```bash
cd apps/api
bun dev
# API runs on http://localhost:3001
```

### Testing Build

```bash
# From root directory
bun run build

# Check web build output
ls -lh apps/web/out/

# Check API build output
ls -lh apps/api/dist/
```

## Important Notes

- **Static Export**: Next.js is configured for static export (no SSE, no API routes)
- **Lambda Functions**: API functions are structured for AWS Lambda deployment
- **Workspace Dependencies**: Packages use `workspace:*` protocol for cross-package imports
- **TypeScript**: Strict mode enabled across all packages

## Build Artifacts

- Next.js: `apps/web/out/` (static files for S3)
- API: `apps/api/dist/` (bundled Lambda functions)

## Ready to Deploy?

When ready to deploy:

1. **Frontend**: `aws s3 sync apps/web/out s3://yukti-frontend`
2. **Backend**: Use AWS SAM (template in implementation_plan.md)

---

**Status**: ✅ Phase 0 Complete  
**Next Phase**: Backend Foundation (AWS Cognito + PostgreSQL + Prisma)
