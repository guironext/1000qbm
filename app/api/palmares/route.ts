import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { jeuId, niveauJeu, langue, numOrder, dernierNiveauJeu, score, sectionId, stageId } = body;

    // Check if palmares already exists for this jeu
    const existingPalmares = await prisma.palmares.findFirst({
      where: {
        userId: user.id,
        jeuId: jeuId,
      },
    });

    if (existingPalmares) {
      return NextResponse.json({ 
        exists: true, 
        message: "Palmares already exists" 
      });
    }

    // Create new palmares entry
    const palmares = await prisma.palmares.create({
      data: {
        userId: user.id,
        jeuId,
        sectionId,
        stageId,
        statusJeu: "VALIDATED",
        niveauJeu,
        langue,
        numOrder,
        dernierNiveauJeu,
        jeuValide: true,
        score,
        isFinished: true,
      },
    });

    return NextResponse.json({ success: true, palmares });
  } catch (error) {
    console.error("Error saving palmares:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

