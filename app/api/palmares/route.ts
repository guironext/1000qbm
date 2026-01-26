import { NextRequest, NextResponse } from 'next/server';
import {
  updateCurrentPalmares,
  resetPreviousJeuScore,
  getCurrentUserPalmares,
  createNewPalmares,
  getNextSection,
  getNextStage,
  updatePalmaresStageStatus,
  startGame,
  getCurrentStagePalmares
} from '@/lib/actions/palmaresActions';

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();

    switch (action) {
      case 'updateCurrent':
        return NextResponse.json(await updateCurrentPalmares(data.userId, data.score));
      
      case 'resetPrevious':
        return NextResponse.json(await resetPreviousJeuScore(data.userId));
      
      case 'getCurrent':
        return NextResponse.json(await getCurrentUserPalmares(data.userId));
      
      case 'createNew':
        return NextResponse.json(await createNewPalmares(data));
      
      case 'getNextSection':
        return NextResponse.json(await getNextSection(data.stageId, data.sectionNumOrder));
      
      case 'getNextStage':
        return NextResponse.json(await getNextStage(data.stageNumOrder));
      
      case 'updateStageStatus':
        return NextResponse.json(await updatePalmaresStageStatus(data.userId, data.stageNumOrder));

      case 'startGame':
        return NextResponse.json(await startGame(data.userId));

      case 'getCurrentStage':
        return NextResponse.json(await getCurrentStagePalmares(data.userId));

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Palmares API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}