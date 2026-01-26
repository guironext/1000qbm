import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();

    switch (action) {
      case 'getByStageAndOrder':
        const section = await prisma.section.findFirst({
          where: {
            numOrder: data.numOrder,
            compterSection: {
              some: {
                stageId: data.stageId
              }
            }
          },
          include: {
            jeux: {
              select: {
                id: true,
                niveau: true
              }
            }
          }
        });
        return NextResponse.json(section);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Sections API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}