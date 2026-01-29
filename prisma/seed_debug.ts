import { config } from "dotenv";
config({ path: ".env.local" });
config();
// import { prisma } from "../lib/prisma.ts";

async function main() {
  const { prisma } = await import("../lib/prisma");

  try {
    console.log("Seeding Stage 1 data...");

    const stage = await prisma.stage.findFirst({
      where: { numOrder: 1 },
    });

    if (!stage) {
      console.log("Stage 1 not found. Creating it...");
      await prisma.stage.create({
        data: {
          title: "Le Commencement",
          langue: "FR",
          niveau: "1",
          numOrder: 1,
          image:
            "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&auto=format&fit=crop&q=60", // Generic Bible/book image
          statusStage: "CURRENT",
          descriptions: {
            create: [
              {
                texte:
                  "Bienvenue dans cette première étape de votre voyage spirituel.",
              },
              { texte: "Ici, nous allons découvrir les fondements de la foi." },
            ],
          },
        },
      });
    } else {
      console.log("Stage 1 found. Updating image and descriptions...");
      await prisma.stage.update({
        where: { id: stage.id },
        data: {
          image:
            "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&auto=format&fit=crop&q=60",
          descriptions: {
            deleteMany: {}, // Clear existing
            create: [
              {
                texte:
                  "Bienvenue dans cette première étape de votre voyage spirituel.",
              },
              { texte: "Ici, nous allons découvrir les fondements de la foi." },
            ],
          },
        },
      });
    }

    console.log("Seeding completed.");
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
