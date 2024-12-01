import { NextResponse, Request } from 'next/server';
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

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser();
    
    if (!auth?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = auth.user.id;
    const body = await request.json();
    const { type, points } = body;

    if (!type || !points) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Update user points
    await GamificationService.addPoints(userId, points);

    // Update streaks if it's a daily activity
    if (type === 'daily_reflection') {
      await GamificationService.updateStreak(userId, type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[GAMIFICATION_PROGRESS_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
