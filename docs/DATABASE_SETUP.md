# Database Setup Guide

## Quick Start (Local Development)

### 1. Start PostgreSQL with Docker

```bash
# Start PostgreSQL container
docker-compose up -d

# Check if it's running
docker-compose ps

# View logs
docker-compose logs postgres
```

### 2. Generate Prisma Client

```bash
cd packages/database
bun run db:generate
```

### 3. Create Database Schema

```bash
# Push schema to database (for development)
bun run db:push

# Or use migrations (recommended for production)
bun run db:migrate
```

### 4. Seed the Database

```bash
bun run db:seed
```

### 5. Explore Data with Prisma Studio

```bash
bun run db:studio
# Opens http://localhost:5555
```

## Database Schema

### User Table

- **id**: UUID (Primary Key)
- **cognitoId**: String (Unique) - AWS Cognito user ID
- **email**: String (Unique)
- **name**: String (Optional)
- **plan**: Enum (FREE, PRO)
- Relations: resumes[], documents[]

### Resume Table

- **id**: UUID (Primary Key)
- **userId**: UUID (Foreign Key → User)
- **title**: String
- Relations: snapshots[]

### ResumeSnapshot Table

- **id**: UUID (Primary Key)
- **resumeId**: UUID (Foreign Key → Resume)
- **version**: Integer
- **content**: JSON (Full resume data)
- Unique constraint: [resumeId, version]

### Document Table

- **id**: UUID (Primary Key)
- **userId**: UUID (Foreign Key → User)
- **key**: String (S3 key)
- **fileName**: String
- **fileType**: String
- **size**: Integer (bytes)

## Environment Variables

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

For local development:

```
DATABASE_URL="postgresql://yukti_admin:yukti_dev_password@localhost:5432/yukti"
```

For production (EC2 Docker):

```
DATABASE_URL="postgresql://yukti_admin:YOUR_PASSWORD@YOUR_EC2_IP:5432/yukti"
```

## Common Commands

```bash
# Generate Prisma Client after schema changes
bun run db:generate

# Push schema changes (dev only)
bun run db:push

# Create and run migrations
bun run db:migrate

# Open Prisma Studio GUI
bun run db:studio

# Seed database with test data
bun run db:seed
```

## Production Setup (EC2 Docker)

See `implementation_plan.md` Phase 1 for detailed instructions on:

1. Launching EC2 t4g.micro instance
2. Installing Docker
3. Running PostgreSQL container
4. Configuring EBS snapshots for backups

## Troubleshooting

### Connection refused

- Check if postgres container is running: `docker-compose ps`
- Verify port 5432 is not in use: `lsof -i :5432`

### Schema out of sync

- Reset database: `bun run db:push --force-reset`
- Or regenerate: `bun run db:generate && bun run db:migrate`

### Prisma Client not found

- Run: `cd packages/database && bun run db:generate`
