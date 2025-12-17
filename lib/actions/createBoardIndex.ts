"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createBoardIndex() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { boardIndex: true }
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Create BoardIndex if it doesn't exist
  if (!user.boardIndex) {
    await prisma.boardIndex.create({
      data: {
        userId: user.id,
        play1: 1,
        play2: 2,
        play3: 3,
        play4: 4,
        play5: 5,
        play6: 6,
        play7: 7,
        play8: 8,
        play9: 9,
        play10: 10,
        play11: 11,
        play12: 12,
        play13: 13,
        play14: 14,
        play15: 15,
        play16: 16,
        play17: 17,
        play18: 18,
        play19: 19,
        play20: 20,
        play21: 21,
        play22: 22,
        play23: 23,
        play24: 24,
        play25: 25,
      }
    });
  }

  // Redirect based on language
  const langue = user.langue || "FR";

  if (langue === "EN") {
    redirect("/eng/joueur/board");
  } else if (langue === "ES") {
    redirect("/es/joueur/board");
  } else {
    redirect("/fr/joueur/board");
  }
}