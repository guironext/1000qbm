const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function deleteAllUsers() {
  try {
    console.log("Starting deletion of all users...");

    // Use a transaction to ensure all deletions happen atomically
    const result = await prisma.$transaction(async (tx) => {
      // 1. Delete all palmares (related to users)
      const palmaresCount = await tx.palmares.deleteMany({});
      console.log(`Deleted ${palmaresCount.count} palmares records`);

      // 2. Delete all boardIndex records (related to users)
      const boardIndexCount = await tx.boardIndex.deleteMany({});
      console.log(`Deleted ${boardIndexCount.count} boardIndex records`);

      // 3. Delete all users
      const usersCount = await tx.user.deleteMany({});
      console.log(`Deleted ${usersCount.count} users`);

      return {
        palmares: palmaresCount.count,
        boardIndex: boardIndexCount.count,
        users: usersCount.count,
      };
    });

    console.log("All users and related records deleted successfully!");
    console.log("Summary:", result);
  } catch (error) {
    console.error("Error deleting users:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllUsers();

