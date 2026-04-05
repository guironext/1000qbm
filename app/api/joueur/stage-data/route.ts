import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { GameBookKind, GameBookStatus, Langue } from "@/lib/generated/prisma/index.js";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const activeBook = await prisma.gameBook.findFirst({
      where: {
        userId: user.id,
        kind: GameBookKind.STAGE,
        stageStatus: GameBookStatus.EN_COURS,
        stageAccomplished: false,
      },
      orderBy: { updatedAt: "desc" },
    });

    const stage = activeBook
      ? await prisma.stage.findFirst({
          where: { id: activeBook.stageId, langue: Langue.FR },
          include: {
            descriptions: { select: { texte: true } },
          },
        })
      : await prisma.stage.findFirst({
          where: { numOrder: 1, langue: Langue.FR },
          include: {
            descriptions: { select: { texte: true } },
          },
        });

    if (!stage) {
      return NextResponse.json(
        { error: "Stage not found" },
        { status: 404 },
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
      { status: 500 },
    );
  }
}
