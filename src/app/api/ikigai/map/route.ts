import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser();
    
    if (!auth?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = auth.user.id;

    const body = await req.json();
    const { passion, skills, mission, vocation } = body;

    const ikigaiMap = await db.ikigaiMap.upsert({
      where: {
        userId: userId,
      },
      create: {
        userId,
        passions: passion,
        skills,
        mission,
        vocation,
      },
      update: {
        passions: passion,
        skills,
        mission,
        vocation,
      },
    });

    // Create an achievement for completing the Ikigai map
    await db.achievement.create({
      data: {
        userId,
        title: 'Ikigai Explorer',
        description: 'Completed your first Ikigai map!',
        category: 'milestone',
        points: 100,
      },
    });

    return NextResponse.json(ikigaiMap);
  } catch (error) {
    console.error('[IKIGAI_MAP_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
