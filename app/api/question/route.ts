import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ReponseInput {
  intitule: string;
  isCorrect: boolean;
  langue: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jeuId = searchParams.get('jeuId');

    if (jeuId) {
      // Get questions for a specific jeu
      const questions = await prisma.question.findMany({
        where: { jeuId },
        include: {
          reponses: true
        },
        orderBy: {
          orderNum: 'asc'
        }
      });
      return NextResponse.json(questions);
    } else {
      // Get all questions
      const questions = await prisma.question.findMany({
        include: {
          reponses: true,
          jeu: true
        },
        orderBy: {
          orderNum: 'asc'
        }
      });
      return NextResponse.json(questions);
    }
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { intitule, langue, orderNum, jeuId, reponses } = body;

    if (!intitule || !langue || !jeuId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const question = await prisma.question.create({
      data: {
        intitule,
        langue,
        orderNum: orderNum || 0,
        jeuId,
        reponses: reponses ? {
          create: reponses.map((reponse: ReponseInput) => ({
            intitule: reponse.intitule,
            langue: reponse.langue || langue,
            isCorrect: reponse.isCorrect || false
          }))
        } : undefined
      },
      include: {
        reponses: true,
        jeu: true
      }
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, intitule, langue, orderNum, jeuId } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing question ID' },
        { status: 400 }
      );
    }

    const question = await prisma.question.update({
      where: { id },
      data: {
        intitule,
        langue,
        orderNum: orderNum || 0,
        jeuId
      },
      include: {
        reponses: true,
        jeu: true
      }
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
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
        { error: 'Missing question ID' },
        { status: 400 }
      );
    }

    await prisma.question.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}
