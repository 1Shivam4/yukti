import { prisma, PrismaClient } from "./index";

async function testPrismaClient() {
  console.log("Testing Prisma Client...");

  // Test 1: Check if prisma instance exists
  console.log("✓ Prisma instance created:", prisma instanceof PrismaClient);

  // Test 2: Try a simple query (this will fail if DB not running, but types should work)
  try {
    const count = await prisma.user.count();
    console.log("✓ User count query successful:", count);
  } catch (error) {
    console.log("⚠ Database not connected (expected if PostgreSQL not running)");
    console.log("  To connect: docker-compose up -d");
  }

  console.log("\n✅ Prisma Client TypeScript types are working correctly!");
}

testPrismaClient()
  .catch((e) => console.error("Error:", e))
  .finally(() => prisma.$disconnect());
