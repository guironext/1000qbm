import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const jeux = await prisma.jeu.findMany({
      include: {
        stage: true,
        section: true,
        questions: {
          include: {
            reponses: true
          }
        }
      },
      orderBy: {
        numOrder: 'asc'
      }
    });

    return NextResponse.json(jeux);
  } catch (error) {
    console.error('Error fetching jeux:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jeux' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { langue, image, niveau, numOrder, stageId, sectionId } = body;

    if (!langue || !niveau || !stageId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const jeu = await prisma.jeu.create({
      data: {
        langue,
        image: image || null,
        niveau,
        numOrder: numOrder || 0,
        stageId,
        sectionId: sectionId || null
      },
      include: {
        stage: true,
        section: true
      }
    });

    return NextResponse.json(jeu);
  } catch (error) {
    console.error('Error creating jeu:', error);
    return NextResponse.json(
      { error: 'Failed to create jeu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, langue, image, niveau, numOrder, stageId, sectionId } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing jeu ID' },
        { status: 400 }
      );
    }

    const jeu = await prisma.jeu.update({
      where: { id },
      data: {
        langue,
        image: image || null,
        niveau,
        numOrder: numOrder || 0,
        stageId,
        sectionId: sectionId || null
      },
      include: {
        stage: true,
        section: true
      }
    });

    return NextResponse.json(jeu);
  } catch (error) {
    console.error('Error updating jeu:', error);
    return NextResponse.json(
      { error: 'Failed to update jeu' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing jeu ID' },
        { status: 400 }
      );
    }

    await prisma.jeu.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting jeu:', error);
    return NextResponse.json(
      { error: 'Failed to delete jeu' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentJeuId } = body;

    if (!currentJeuId) {
      return NextResponse.json(
        { error: 'Missing current jeu ID' },
        { status: 400 }
      );
    }

    // Get current jeu to find its numOrder
    const currentJeu = await prisma.jeu.findUnique({
      where: { id: currentJeuId },
      select: { numOrder: true }
    });

    if (!currentJeu) {
      return NextResponse.json(
        { error: 'Current jeu not found' },
        { status: 404 }
      );
    }

    // Update current jeu status to VALIDATED
    await prisma.jeu.update({
      where: { id: currentJeuId },
      data: { statusJeu: 'VALIDATED' }
    });

    // Get next jeu with numOrder + 1
    const nextJeu = await prisma.jeu.findFirst({
      where: {
        numOrder: currentJeu.numOrder + 1,
        statusJeu: 'NEW'
      },
      include: {
        stage: true,
        section: true,
        questions: {
          include: {
            reponses: true
          }
        }
      }
    });

    return NextResponse.json({ nextJeu });
  } catch (error) {
    console.error('Error updating jeu status:', error);
    return NextResponse.json(
      { error: 'Failed to update jeu status' },
      { status: 500 }
    );
  }
}