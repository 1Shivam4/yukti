import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create a test user
  const testUser = await prisma.user.upsert({
    where: { email: "test@yukti.dev" },
    update: {},
    create: {
      email: "test@yukti.dev",
      cognitoId: "test-cognito-id",
      name: "Test User",
      plan: "FREE",
    },
  });

  console.log("✅ Created test user:", testUser.email);

  // Create a test resume
  const testResume = await prisma.resume.create({
    data: {
      userId: testUser.id,
      title: "Software Engineer Resume",
      snapshots: {
        create: {
          version: 1,
          content: {
            basics: {
              name: "John Doe",
              email: "john@example.com",
              phone: "+1-555-0100",
              summary: "Experienced software engineer with expertise in full-stack development",
              location: {
                city: "San Francisco",
                countryCode: "US",
              },
            },
            work: [
              {
                name: "Tech Corp",
                position: "Senior Software Engineer",
                startDate: "2020-01-01",
                highlights: [
                  "Led team of 5 engineers in building microservices architecture",
                  "Improved system performance by 40%",
                ],
              },
            ],
            education: [
              {
                institution: "University of California",
                area: "Computer Science",
                studyType: "Bachelor",
                startDate: "2012-09-01",
                endDate: "2016-05-01",
              },
            ],
            skills: [
              {
                name: "JavaScript",
                level: "Expert",
                keywords: ["React", "Node.js", "TypeScript"],
              },
              {
                name: "Cloud Platforms",
                level: "Advanced",
                keywords: ["AWS", "Docker", "Kubernetes"],
              },
            ],
            projects: [],
          },
        },
      },
    },
  });

  console.log("✅ Created test resume:", testResume.title);
  console.log("\n🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
