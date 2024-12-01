import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const profile = await db.profile.findUnique({
      where: {
        userId: params.userId,
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
