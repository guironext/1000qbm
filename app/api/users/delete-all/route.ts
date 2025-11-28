import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Delete all users and their related records
export async function DELETE() {
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

    return NextResponse.json({
      message: "All users and related records deleted successfully",
      deleted: result,
    });
  } catch (error) {
    console.error("Error deleting users:", error);
    return NextResponse.json(
      {
        error: "Failed to delete users",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

