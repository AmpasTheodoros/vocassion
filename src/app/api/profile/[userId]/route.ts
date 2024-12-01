import { NextResponse } from 'next/server';
import {db} from '@/lib/db';

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

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...profile,
      hasCompletedQuiz: !!profile.ikigaiMap,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
