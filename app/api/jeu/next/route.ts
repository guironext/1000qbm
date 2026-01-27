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
      include: { boardIndex: true, palmares: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { jeuId, score } = body;

    // Get current jeu
    const currentJeu = await prisma.jeu.findUnique({
      where: { id: jeuId },
      include: {
        section: true,
        stage: true
      }
    });

    if (!currentJeu) {
      return NextResponse.json({ error: "Jeu not found" }, { status: 404 });
    }

    // Update current jeu status to VALIDATED
    await prisma.jeu.update({
      where: { id: jeuId },
      data: { statusJeu: 'VALIDATED' }
    });

    // Create Palmares entry
    await prisma.palmares.create({
      data: {
        userId: user.id,
        jeuId: currentJeu.id,
        sectionId: currentJeu.sectionId,
        stageId: currentJeu.stageId,
        statusStage: "VALIDATED",
        stageNumOrder: currentJeu.stage!.numOrder,
        stageLength: 1, // assuming
        statusSection: "VALIDATED",
        sectionNumOrder: currentJeu.section!.numOrder,
        statusJeu: "VALIDATED",
        niveau: currentJeu.niveau,
        langue: currentJeu.langue,
        numOrder: currentJeu.numOrder,
        jeuValide: true,
        score,
        isFinished: true,
      },
    });

    // Determine current board position
    const boardIndex = user.boardIndex;
    if (!boardIndex) {
      return NextResponse.json({ error: "BoardIndex not found" }, { status: 404 });
    }

    // Find which play field matches current jeu numOrder
    let currentPlayField = 'play1';
    let currentPlayIndex = 1;
    for (let i = 1; i <= 25; i++) {
      const playField = `play${i}` as keyof typeof boardIndex;
      if (boardIndex[playField] === currentJeu.numOrder) {
        currentPlayField = playField;
        currentPlayIndex = i;
        break;
      }
    }

    // Get next boardIndex value (current + 1)
    const nextBoardIndexValue = currentJeu.numOrder + 1;

    // Update BoardIndex
    if (currentPlayIndex <= 25) {
      await prisma.boardIndex.update({
        where: { id: boardIndex.id },
        data: {
          [currentPlayField]: nextBoardIndexValue
        }
      });
    }

    // Get next jeu with the new numOrder
    const nextJeu = await prisma.jeu.findFirst({
      where: {
        numOrder: nextBoardIndexValue,
        langue: currentJeu.langue
      },
      include: {
        section: true,
        stage: true
      }
    });

    if (!nextJeu) {
      return NextResponse.json({ 
        success: true, 
        finished: true,
        message: "No more games available" 
      });
    }

    // Update next jeu status to CURRENT
    await prisma.jeu.update({
      where: { id: nextJeu.id },
      data: { statusJeu: 'CURRENT' }
    });

    // Create CURRENT palmares entry for the next jeu
    await prisma.palmares.create({
      data: {
        userId: user.id,
        jeuId: nextJeu.id,
        sectionId: nextJeu.sectionId,
        stageId: nextJeu.stageId,
        statusStage: "CURRENT",
        stageNumOrder: nextJeu.stage!.numOrder,
        stageLength: 1,
        statusSection: "CURRENT",
        sectionNumOrder: nextJeu.section!.numOrder,
        statusJeu: "CURRENT",
        niveau: nextJeu.niveau,
        langue: nextJeu.langue,
        numOrder: nextJeu.numOrder,
        jeuValide: false,
        score: 0,
        isFinished: false,
      },
    });

    // Check if next numOrder is a milestone (1, 5, 10, 15, 20, 25)
    const isMilestone = [1, 5, 10, 15, 20, 25].includes(nextBoardIndexValue);

    return NextResponse.json({ 
      success: true,
      nextSection: nextJeu.section,
      nextStage: nextJeu.stage,
      isMilestone,
      nextNumOrder: nextBoardIndexValue
    });
  } catch (error) {
    console.error("Error in next game:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

