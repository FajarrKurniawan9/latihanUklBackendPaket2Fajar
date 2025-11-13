import { PrismaClient } from "@prisma/client";
import md5 from "md5";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seeding...");

  // Hapus data lama
  await prisma.borrow.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.user.deleteMany();

  // Seed Users
  const users = await prisma.user.createMany({
    data: [
      {
        name: "Admin Fajar",
        username: "admin",
        password: md5("admin123"),
        role: "admin",
      },
      {
        name: "User Ari",
        username: "ari",
        password: md5("user123"),
        role: "user",
      },
      {
        name: "User Vino",
        username: "vino",
        password: md5("user123"),
        role: "user",
      },
    ],
  });
  console.log(`✅ Created ${users.count} users`);

  // Seed Inventory
  const inventory = await prisma.inventory.createMany({
    data: [
      {
        name: "Laptop Asus",
        category: "Elektronik",
        quantity: 10,
        condition: "baik",
        location: "Lab Komputer 1",
      },
      {
        name: "Proyektor Epson",
        category: "Elektronik",
        quantity: 5,
        condition: "baik",
        location: "Ruang Multimedia",
      },
      {
        name: "Bola Voli",
        category: "Olahraga",
        quantity: 15,
        condition: "baik",
        location: "Gudang Olahraga",
      },
      {
        name: "Mikroskop",
        category: "Lab",
        quantity: 8,
        condition: "baik",
        location: "Lab Biologi",
      },
      {
        name: "Kamera DSLR",
        category: "Elektronik",
        quantity: 3,
        condition: "baik",
        location: "Ruang Multimedia",
      },
      {
        name: "Whiteboard",
        category: "ATK",
        quantity: 20,
        condition: "baik",
        location: "Gudang Umum",
      },
      {
        name: "Speaker Bluetooth",
        category: "Elektronik",
        quantity: 7,
        condition: "baik",
        location: "Ruang Guru",
      },
      {
        name: "Matras Yoga",
        category: "Olahraga",
        quantity: 25,
        condition: "baik",
        location: "Gudang Olahraga",
      },
    ],
  });
  console.log(`✅ Created ${inventory.count} inventory items`);

  console.log("🎉 Seeding completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });