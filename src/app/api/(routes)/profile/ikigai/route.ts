import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await db.profile.findUnique({
      where: {
        userId,
      },
      include: {
        ikigaiMap: true,
      },
    });

    if (!profile?.ikigaiMap) {
      return NextResponse.json({}, { status: 404 });
    }

    return NextResponse.json({
      passion: profile.ikigaiMap.passion,
      mission: profile.ikigaiMap.mission,
      vocation: profile.ikigaiMap.vocation,
    });
  } catch (error) {
    console.error('Error fetching Ikigai data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Ikigai data' },
      { status: 500 }
    );
  }
}
