import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed an admin user
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
    },
  });

  console.log("Seeded user:", admin);

  // Seed some buyers
  const buyersData = [
    {
      fullName: "John Doe",
      phone: "9876543210",
      city: "Chandigarh",
      propertyType: "Apartment",
      bhk: "TWO",
      purpose: "Buy",
      budgetMin: 5000000,
      budgetMax: 7000000,
      timeline: "ZERO_TO_3M",
      source: "Website",
      status: "New",
      ownerId: admin.id,
    },
    {
      fullName: "Jane Smith",
      phone: "9876501234",
      city: "Mohali",
      propertyType: "Villa",
      bhk: "THREE",
      purpose: "Buy",
      budgetMin: 10000000,
      budgetMax: 15000000,
      timeline: "THREE_TO_6M",
      source: "Referral",
      status: "New",
      ownerId: admin.id,
    },
  ];

  for (const buyer of buyersData) {
    const newBuyer = await prisma.buyer.create({ data: buyer });
    console.log("Seeded buyer:", newBuyer);
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
