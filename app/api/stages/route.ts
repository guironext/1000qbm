import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();

    switch (action) {
      case 'getByOrder':
        const stage = await prisma.stage.findFirst({
          where: { numOrder: data.stageNumOrder },
          select: {
            id: true,
            niveau: true,
            image: true,
            descriptions: {
              select: { texte: true }
            },
            numOrder: true
          }
        });
        if (stage) {
          const descriptionsText = stage.descriptions.map((d) => d.texte);
          return NextResponse.json({
            ...stage,
            descriptions: descriptionsText,
            stageNumOrder: stage.numOrder
          });
        }
        return NextResponse.json(stage);

      case 'getAll':
        console.log('Fetching all stages');
        const stages = await prisma.stage.findMany({
          select: {
            id: true,
            niveau: true,
            image: true,
            descriptions: {
              select: { texte: true }
            },
            numOrder: true
          },
          orderBy: { numOrder: 'asc' }
        });
        console.log('Stages found:', stages);
        const formattedStages = stages.map((stage) => ({
          ...stage,
          descriptions: stage.descriptions.map((d) => d.texte),
          stageNumOrder: stage.numOrder
        }));
        console.log('Formatted stages:', formattedStages);
        return NextResponse.json(formattedStages);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Stages API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}