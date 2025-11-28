"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "../prisma";
import { revalidatePath } from "next/cache";
import { UserRole } from "../generated/prisma";
import { Langue } from "../generated/prisma";

// Extract palmares initialization logic
export async function initializePalmaresForUser(userId: string, userLangue: string) {
  try {
    console.log("Starting palmares initialization for user:", userId);
    
    // Check if palmares already exists for this user
    const existingPalmares = await prisma.palmares.findFirst({
      where: { userId },
    });

    // If palmares already exists, don't create a new one
    if (existingPalmares) {
      console.log("Palmares already exists for user:", userId);
      return true;
    }

    // First, let's check what records exist in the database
    const allStages = await prisma.stage.findMany({
      orderBy: { numOrder: 'asc' },
    });
    console.log("All stages in DB:", allStages.map(s => ({ title: s.title, status: s.statusStage })));

    const allSections = await prisma.section.findMany({
      orderBy: { numOrder: 'asc' },
    });
    console.log("All sections in DB:", allSections.map(s => ({ title: s.title, status: s.statusSection })));

    // Try to find stage with CURRENT status, fallback to first stage
    let stage1 = await prisma.stage.findFirst({
      where: { 
        statusStage: "CURRENT" 
      },
      orderBy: { numOrder: 'asc' },
    });

    if (!stage1) {
      stage1 = await prisma.stage.findFirst({
        orderBy: { numOrder: 'asc' },
      });
    }

    // Try to find section with CURRENT status, fallback to first section
    let session1 = await prisma.section.findFirst({
      where: { 
        statusSection: "CURRENT" 
      },
      orderBy: { numOrder: 'asc' },
    });

    if (!session1) {
      session1 = await prisma.section.findFirst({
        orderBy: { numOrder: 'asc' },
      });
    }

    // Find the first jeu for the stage and section
    const firstJeu = await prisma.jeu.findFirst({
      where: {
        stageId: stage1?.id,
        sectionId: session1?.id,
      },
      orderBy: { numOrder: 'asc' },
    });

    // If no jeu found with both stage and section, try just with stage
    let jeu = firstJeu;
    if (!jeu && stage1) {
      jeu = await prisma.jeu.findFirst({
        where: {
          stageId: stage1.id,
        },
        orderBy: { numOrder: 'asc' },
      });
    }

    console.log("Debug - stage1:", stage1?.title, "session1:", session1?.title, "jeu:", jeu?.id);

    if (stage1 && session1 && jeu) {
      const palmares = await prisma.palmares.create({
        data: {
          userId,
          stageId: stage1.id,
          statusStage: "CURRENT",
          sectionId: session1.id,
          statusSection: "CURRENT",
          jeuId: jeu.id,
          statusJeu: "CURRENT",
          niveauJeu: `${stage1.title}-${session1.title}`,
          langue: (userLangue as Langue) || Langue.FR,
          numOrder: 1,
          jeuValide: false,
          score: 0,
          isFinished: false,
        },
      });
      console.log("Palmares created successfully:", palmares.id);
      return true;
    }
    
    console.log("Could not create palmares - missing required records. Stage:", !!stage1, "Section:", !!session1, "Jeu:", !!jeu);
    return false;
  } catch (error) {
    console.error("Error creating palmares:", error);
    return false;
  }
}

export async function createEmployee(
  clerkId: string,
  role: UserRole,
  formData: {
    phone?: string;
    country?: string;
    langue?: string;
  }
) {
  try {
    const user = await (await clerkClient()).users.getUser(clerkId);
    if (!user || !user.firstName || !user.lastName) {
      throw new Error("User not found");
    }

    await (await clerkClient()).users.updateUserMetadata(user.id, {
      publicMetadata: {
        onboardingCompleted: true,
        role: role,
        langue: formData.langue,
        country: formData.country,
        phone: formData.phone,
      },
    });

    const newUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        role,
        langue: (formData.langue as Langue) || Langue.FR,
        country: formData.country || null,
        phone: formData.phone || null,
      },
    });

    // Initialize palmares for new user
    await initializePalmaresForUser(newUser.id, formData.langue || "FR");

    revalidatePath("/onboarding");

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
    };
  }
}


