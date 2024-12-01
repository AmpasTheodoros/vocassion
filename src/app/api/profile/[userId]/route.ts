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

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const data = await request.json();
    
    // Generate a unique username and slug from the name
    const baseUsername = (data.name || 'user').toLowerCase().replace(/\s+/g, '');
    const timestamp = Date.now().toString().slice(-4);
    const username = `${baseUsername}${timestamp}`;
    const slug = username;

    const profile = await db.profile.upsert({
      where: {
        userId: params.userId,
      },
      create: {
        userId: params.userId,
        name: data.name,
        email: data.email,
        imageUrl: data.imageUrl,
        username: username,
        slug: slug,
      },
      update: {
        name: data.name,
        email: data.email,
        imageUrl: data.imageUrl,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to create/update profile', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
