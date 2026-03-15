import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Langue } from "@/lib/generated/prisma/index.js";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        palmares: { orderBy: { createdAt: "desc" } },
        jeuEnCours: { orderBy: { updatedAt: "desc" } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hasPalmares = user.palmares && user.palmares.length > 0;

    if (!hasPalmares) {
      // Create palmares and jeuEnCours for new user
      await prisma.$transaction([
        prisma.palmares.create({
          data: {
            userId: user.id,
            score: 0,
            stage: "Stage 1",
            section: "section 1",
            stageNumOrder: 1,
            sectionNumOrder: 1,
            jeuValide: false,
          },
        }),
        prisma.jeuEnCours.create({
          data: {
            userId: user.id,
            stage: "Stage 1",
            section: "section 1",
            stageNumOrder: 1,
            sectionNumOrder: 1,
          },
        }),
      ]);
    }


    // Get stageNumOrder: 1 if no palmares (we just created it), else from latest jeuEnCours
    const latestJeuEnCours = user.jeuEnCours?.[0];
    const stageNumOrder =
      hasPalmares && latestJeuEnCours
        ? latestJeuEnCours.stageNumOrder
        : 1;

    // Fetch stage where numOrder === stageNumOrder, langue FR
    const stage = await prisma.stage.findFirst({
      where: {
        numOrder: stageNumOrder,
        langue: Langue.FR,
      },
      include: {
        descriptions: { select: { texte: true } },
      },
    });

    if (!stage) {
      return NextResponse.json(
        { error: "Stage not found", stageNumOrder },
        { status: 404 }
      );
    }

    return NextResponse.json({
      image: stage.image,
      niveau: stage.niveau,
      title: stage.title,
      descriptions: stage.descriptions.map((d) => d.texte),
    });
  } catch (error) {
    console.error("Stage data API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
