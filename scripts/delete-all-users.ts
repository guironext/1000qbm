import { prisma } from "../lib/prisma";

async function deleteAllUsers() {
  try {
    console.log("Starting deletion of all users...");

    // Use a transaction to ensure all deletions happen atomically
    await prisma.$transaction(async (tx) => {
      // 1. Delete all palmares (related to users)
      const palmaresCount = await tx.palmares.deleteMany({});
      console.log(`Deleted ${palmaresCount.count} palmares records`);

      // 2. (Skipped) boardIndex no longer exists

      // 3. Delete all users
      const usersCount = await tx.user.deleteMany({});
      console.log(`Deleted ${usersCount.count} users`);
    });

    console.log("All users and related records deleted successfully!");
  } catch (error) {
    console.error("Error deleting users:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllUsers();
