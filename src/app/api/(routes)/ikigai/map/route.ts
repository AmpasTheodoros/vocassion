import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true
});

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser();
    
    if (!auth?.user?.id || !auth.profile) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = auth.profile.id;

    const body = await req.json();
    const { passion, profession, mission, vocation } = body;

    const ikigaiMap = await db.ikigaiMap.upsert({
      where: {
        userId: userId,
      },
      update: {
        passion,
        profession,
        mission,
        vocation,
      },
      create: {
        userId,
        passion,
        profession,
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

    // Trigger a Pusher event for leaderboard updates
    await pusher.trigger('leaderboard-channel', 'update', {
      message: `User ${userId} has updated their Ikigai map.`
    });

    return new NextResponse(JSON.stringify(ikigaiMap), { status: 200 });
  } catch (error) {
    console.error('[IKIGAI_MAP_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
