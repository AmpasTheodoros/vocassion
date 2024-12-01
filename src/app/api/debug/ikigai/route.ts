import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const auth = await getAuthUser();
    
    if (!auth?.user?.id || !auth.profile) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = auth.profile.id;

    // Get the profile with ikigai data
    const profile = await db.profile.findUnique({
      where: {
        id: userId,
      },
      include: {
        ikigaiMap: true,
      },
    });

    return NextResponse.json({
      profile: {
        id: profile?.id,
        userId: profile?.userId,
      },
      ikigaiMap: profile?.ikigaiMap,
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug data' },
      { status: 500 }
    );
  }
}
