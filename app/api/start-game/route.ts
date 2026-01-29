import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Status, Langue } from '@/lib/generated/prisma/index.js';

export async function POST() {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has any palmares
    const existingPalmares = await prisma.palmares.findFirst({
      where: { userId: user.id },
    });

    if (existingPalmares) {
      return NextResponse.json({ message: 'Palmares already exists' }, { status: 200 });
    }

    // Get the first stage (numOrder = 1)
    const stage1 = await prisma.stage.findFirst({
      where: { numOrder: 1 },
    });

    if (!stage1) {
      return NextResponse.json({ error: 'No stage found' }, { status: 404 });
    }

    // Get the first section (numOrder = 1)
    const section1 = await prisma.section.findFirst({
      where: { numOrder: 1 },
    });

    if (!section1) {
      return NextResponse.json({ error: 'No section found' }, { status: 404 });
    }

    // Get the first jeu (numOrder = 1)
    const jeu = await prisma.jeu.findFirst({
      where: { numOrder: 1 },
    });

    if (!jeu) {
      return NextResponse.json({ error: 'No jeu found' }, { status: 404 });
    }

    // Create or update compteurSection with count = 1
    await prisma.compteurSection.upsert({
      where: {
        userId_stageId_sectionId: {
          userId: user.id,
          stageId: stage1.id,
          sectionId: section1.id,
        },
      },
      update: { count: 1 },
      create: {
        userId: user.id,
        stageId: stage1.id,
        sectionId: section1.id,
        count: 1,
      },
    });

    // Create palmares
    await prisma.palmares.create({
      data: {
        userId: user.id,
        stageId: stage1.id,
        statusStage: Status.CURRENT,
        stageNumOrder: 1,
        stageLength: 1,
        sectionId: section1.id,
        statusSection: Status.CURRENT,
        sectionNumOrder: 1,
        jeuId: jeu.id,
        statusJeu: Status.CURRENT,
        niveauJeu: "1",
        langue: Langue[user.langue as keyof typeof Langue] ?? Langue.FR,
        numOrder: 1,
        score: 0,
        isFinished: false,
        jeuValide: false,
      },
    });

    return NextResponse.json({ message: 'Game started successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}