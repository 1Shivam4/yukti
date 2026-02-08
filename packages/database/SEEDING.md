# Database Seeding Guide

This guide explains how to seed the database with resume templates in both development and production environments.

## Overview

The seeding script populates the `ResumeTemplate` table with 30 predefined resume templates across three categories:

- **Professional** (10 templates): Traditional corporate and industry-specific designs
- **Creative** (10 templates): Modern, vibrant designs for creative professionals
- **Minimal** (10 templates): Clean, simple layouts focusing on content

## Local Development

### Initial Setup

1. **Ensure your database is set up and migrations are current**:

   ```bash
   cd packages/database
   bun run db:migrate
   ```

2. **Run the seed script**:

   ```bash
   bun run db:seed
   ```

   **Expected Output**:

   ```
   🌱 Seeding database with resume templates...

   ✅ Created: Corporate Classic (professional)
   ✅ Created: Executive Profile (professional)
   ...

   ==================================================
   📊 Seeding Summary:
      • Total templates: 30
      • Created: 30
      • Updated: 0
   ==================================================

   📁 Templates by Category:
      • professional: 10
      • creative: 10
      • minimal: 10

   🎉 Seeding completed successfully!
   ```

3. **Verify the data** (optional):
   ```bash
   bun run db:studio
   ```
   This opens Prisma Studio where you can browse the `ResumeTemplate` table.

### Re-running Seeds

The seed script is **idempotent** - you can run it multiple times safely. It uses `upsert` operations based on template names:

- **First run**: Creates all templates
- **Subsequent runs**: Updates existing templates if names match

```bash
bun run db:seed
```

---

## Production Environment

### Initial Database Seeding (First Deploy)

#### Option 1: Manual Seeding (Recommended for First-Time Setup)

1. **Connect to your production database**:
   Ensure your `DATABASE_URL` environment variable points to production:

   ```bash
   export DATABASE_URL="postgresql://user:password@host:5432/dbname"
   ```

2. **Run migrations**:

   ```bash
   cd packages/database
   bun run db:migrate
   ```

3. **Run seed script**:

   ```bash
   bun run db:seed
   ```

4. **Verify** (SSH into server or use database client):
   ```sql
   SELECT category, COUNT(*) FROM "ResumeTemplate" GROUP BY category;
   ```

#### Option 2: Automated Seeding in CI/CD

Add seeding to your deployment pipeline (example with GitHub Actions):

```yaml
# .github/workflows/deploy.yml
- name: Run Database Migration
  run: |
    cd packages/database
    bun run db:migrate

- name: Seed Database
  run: |
    cd packages/database
    bun run db:seed
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

> **⚠️ Warning**: Only run seeds on the initial deployment. After that, use the update process below.

---

### Adding New Templates (Production Updates)

When adding new templates to production without affecting existing data:

1. **Edit `packages/database/src/seed.ts`** locally and add your new templates to the `templates` array.

2. **Test locally first**:

   ```bash
   cd packages/database
   bun run db:seed
   ```

3. **Deploy to production**:

   **Option A - Manual Update**:

   ```bash
   # SSH into production server
   cd /path/to/your/app/packages/database
   git pull origin main
   bun run db:seed
   ```

   **Option B - CI/CD Pipeline**:
   - Commit your changes to the repository
   - Your deployment pipeline will automatically run the seed script
   - The upsert logic ensures only new templates are added

4. **Verify in production**:

   ```bash
   # Check total count
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"ResumeTemplate\";"

   # Check by category
   psql $DATABASE_URL -c "SELECT category, COUNT(*) FROM \"ResumeTemplate\" GROUP BY category;"
   ```

---

## Common Scenarios

### Updating Existing Templates

To update template properties (structure, theme, description):

1. Edit the template in `seed.ts`
2. Run the seed script:
   ```bash
   bun run db:seed
   ```
3. The `upsert` operation will update the existing template based on the `name` field

### Disabling Templates

To disable templates without deleting them:

**Option 1 - Direct Database Update**:

```sql
UPDATE "ResumeTemplate"
SET "isActive" = false
WHERE name = 'Template Name';
```

**Option 2 - Update Seed Script**:

1. Set `isActive: false` for the template in `seed.ts`
2. Re-run the seed script

### Deleting Templates

> **⚠️ Caution**: Deleting templates may affect existing resumes that reference them

```sql
-- Check if any resumes use this template
SELECT COUNT(*) FROM "Resume" WHERE "templateId" = 'template-id';

-- If safe to delete
DELETE FROM "ResumeTemplate" WHERE id = 'template-id';
```

---

## Troubleshooting

### Database Connection Errors

**Error**: `Can't reach database server`

**Solution**:

1. Verify `DATABASE_URL` is correct:
   ```bash
   echo $DATABASE_URL
   ```
2. Check database is running:
   ```bash
   psql $DATABASE_URL -c "SELECT 1;"
   ```

### Duplicate Name Errors

**Error**: `Unique constraint failed on the constraint: name`

This shouldn't happen with the upsert logic, but if it does:

```sql
-- Find duplicates
SELECT name, COUNT(*)
FROM "ResumeTemplate"
GROUP BY name
HAVING COUNT(*) > 1;

-- Remove duplicates (keep newest)
DELETE FROM "ResumeTemplate" a
USING "ResumeTemplate" b
WHERE a.name = b.name
  AND a."createdAt" < b."createdAt";
```

### Transaction Timeout

**Error**: `Transaction timeout`

**Cause**: Large seed scripts may timeout on slow connections

**Solution**:

```typescript
// Increase timeout in seed.ts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Add timeout config
  __internal: {
    engine: {
      connectTimeout: 60000, // 60 seconds
    },
  },
});
```

---

## Best Practices

1. **Always test locally first**: Run seeds in development before production
2. **Backup production data**: Before running seeds in production, create a database backup
3. **Use idempotent operations**: The current seed script uses upsert - keep this pattern
4. **Version control**: Keep seed data in Git for reproducibility
5. **Document changes**: Comment your seed updates for team visibility
6. **Monitor production**: After seeding, verify the data in production database

---

## Advanced Usage

### Conditional Seeding

Seed only if table is empty (useful for fresh deployments):

```typescript
async function main() {
  const existing = await prisma.resumeTemplate.count();

  if (existing > 0) {
    console.log("⚠️  Templates already exist. Skipping seed.");
    return;
  }

  // Continue with seeding...
}
```

### Environment-Specific Seeds

```typescript
const isProd = process.env.NODE_ENV === "production";

const templates = [
  // ... existing templates
];

// Add test templates only in development
if (!isProd) {
  templates.push({
    name: "Test Template",
    // ... test data
  });
}
```

### Bulk Import from JSON

```typescript
import templates from "./templates.json";

async function main() {
  for (const template of templates) {
    await prisma.resumeTemplate.upsert({
      where: { name: template.name },
      update: template,
      create: template,
    });
  }
}
```

---

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review Prisma documentation: https://www.prisma.io/docs
3. Check application logs for detailed error messages
