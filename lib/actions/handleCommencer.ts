"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function handleCommencerClick() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get user from db
  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get current palmares
  const currentPalmares = await prisma.palmares.findFirst({
    where: {
      userId: user.id,
      statusStage: 'CURRENT'
    },
    include: {
      section: {
        include: {
          jeux: true
        }
      }
    }
  });

  if (!currentPalmares || !currentPalmares.section) {
    throw new Error("No current palmares or section found");
  }

  // Get the first jeu from the current section
  const jeu = currentPalmares.section.jeux[0];
  
  if (!jeu) {
    throw new Error("No jeu found in current section");
  }

  // Redirect to jeu page
  redirect(`/fr/joueur/board/jeu/${jeu.id}`);
}