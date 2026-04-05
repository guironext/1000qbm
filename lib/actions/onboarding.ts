"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { UserRole, Langue } from "@/lib/generated/prisma/index.js";

/** Progress is created when the player clicks Commencer (STAGE GameBook). */
export async function initializePalmaresForUser(userId: string) {
  void userId;
  return true;
}

export async function createEmployee(
  clerkId: string,
  role: UserRole,
  formData: {
    phone?: string;
    country?: string;
    langue?: string;
  },
) {
  try {
    const user = await (await clerkClient()).users.getUser(clerkId);
    if (!user || !user.firstName || !user.lastName) {
      throw new Error("User not found");
    }

    await (
      await clerkClient()
    ).users.updateUserMetadata(user.id, {
      publicMetadata: {
        onboardingCompleted: true,
        role: role,
        langue: formData.langue,
        country: formData.country,
        phone: formData.phone,
      },
    });

    await prisma.user.create({
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
