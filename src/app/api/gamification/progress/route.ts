import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { GamificationService } from '@/lib/services/gamification';

export { dynamic } from './route.config';

export async function GET() {
  try {
    const auth = await getAuthUser();
    
    if (!auth?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = auth.user.id;

    // Fetch all user progress data
    const [achievements, streaks, points, level] = await Promise.all([
      db.achievement.findMany({
        where: { userId },
        orderBy: { unlockedAt: 'desc' },
      }),
      db.streak.findMany({
        where: { userId },
      }),
      GamificationService.getUserPoints(userId),
      GamificationService.getUserLevel(userId),
    ]);

    return NextResponse.json({
      achievements,
      streaks,
      points,
      level,
    });
  } catch (error) {
    console.error('[GAMIFICATION_PROGRESS_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
