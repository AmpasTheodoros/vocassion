import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const data = await request.json();
    
    // First ensure the profile exists
    const profile = await db.profile.findUnique({
      where: {
        userId: params.userId,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Format the data correctly
    const ikigaiData = {
      passion: data.passion || [],
      profession: data.skills || [], // Map skills to profession
      mission: data.mission || [],
      vocation: data.vocation || [],
      updatedAt: new Date(),
    };

    // Create or update the ikigai map
    const ikigaiMap = await db.ikigaiMap.upsert({
      where: {
        userId: profile.id,
      },
      create: {
        userId: profile.id,
        ...ikigaiData
      },
      update: ikigaiData,
    });

    return NextResponse.json(ikigaiMap);
  } catch (error) {
    console.error('Error saving Ikigai map:', error);
    return NextResponse.json(
      { error: 'Failed to save Ikigai map', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const profile = await db.profile.findUnique({
      where: {
        userId: params.userId,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const ikigaiMap = await db.ikigaiMap.findUnique({
      where: {
        userId: profile.id,
      },
    });

    if (!ikigaiMap) {
      return NextResponse.json(
        { error: 'Ikigai map not found' },
        { status: 404 }
      );
    }

    // Transform the data to match the expected format
    return NextResponse.json({
      passion: ikigaiMap.passion,
      mission: ikigaiMap.mission,
      profession: ikigaiMap.profession,
      vocation: ikigaiMap.vocation,
    });
  } catch (error) {
    console.error('Error fetching Ikigai map:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Ikigai map', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
