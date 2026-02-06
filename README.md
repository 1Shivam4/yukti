# Yukti - AI Resume SaaS

A high-fidelity SaaS application for creating professional resumes using AI.

## Architecture

- **Frontend**: Next.js (Static Export) + S3/CloudFront
- **Backend**: AWS Lambda + API Gateway
- **Database**: PostgreSQL (Docker on EC2)
- **AI**: Gemini API (Google)
- **Storage**: S3 (Direct uploads with presigned URLs)

## Project Structure

```
yukti/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Lambda functions (backend)
├── packages/
│   ├── shared/       # Shared types & Zod schemas
│   ├── ui/           # Shared React components
│   └── database/     # Prisma client & migrations
└── turbo.json        # Turborepo configuration
```

## Development

```bash
# Install dependencies
bun install

# Run development servers
bun dev

# Build all packages
bun build

# Lint
bun lint
```

## Tech Stack

- **Runtime**: Bun
- **Monorepo**: Turborepo
- **Frontend**: Next.js 15, React 19, Tailwind CSS, Shadcn/UI
- **Backend**: AWS Lambda, Express.js
- **Database**: PostgreSQL, Prisma ORM
- **Validation**: Zod
- **AI**: Vercel AI SDK + Gemini
- **PDF**: Puppeteer + @sparticuz/chromium

## Documentation

See `/docs` for detailed architecture and implementation guides.
