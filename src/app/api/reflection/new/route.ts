import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    console.log('Current user:', user);
    
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clerkUserId = user.id;
    console.log('Clerk User ID:', clerkUserId);

    // Ensure profile exists
    let profile;
    try {
      profile = await db.profile.findUnique({
        where: {
          userId: clerkUserId
        }
      });
      console.log('Existing profile:', profile);
    } catch (dbError) {
      console.error('Database error finding profile:', dbError);
      throw new Error('Failed to check profile existence');
    }

    if (!profile) {
      console.log('Creating new profile...');
      try {
        profile = await db.profile.create({
          data: {
            id: clerkUserId,
            userId: clerkUserId,
            username: user.username || `user_${clerkUserId}`,
            email: user.emailAddresses[0].emailAddress,
            name: `${user.firstName} ${user.lastName}`.trim() || user.username || `User ${clerkUserId}`,
            slug: user.username || `user-${clerkUserId}`,
            imageUrl: user.imageUrl,
          }
        });
        console.log('Created profile:', profile);
      } catch (profileError) {
        console.error('Error creating profile:', profileError);
        if (profileError instanceof Prisma.PrismaClientKnownRequestError) {
          if (profileError.code === 'P2002') {
            return NextResponse.json(
              { error: 'Profile already exists with this username or email' },
              { status: 409 }
            );
          }
        }
        throw new Error('Failed to create profile');
      }
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    console.log('Request body:', body);
    const { mood, gratitude, challenges, wins, content } = body;

    // Validate required fields
    if (!mood || !gratitude || !challenges || !wins || !content) {
      const missingFields = [];
      if (!mood) missingFields.push('mood');
      if (!gratitude) missingFields.push('gratitude');
      if (!challenges) missingFields.push('challenges');
      if (!wins) missingFields.push('wins');
      if (!content) missingFields.push('content');
      
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    console.log('Creating reflection with data:', {
      userId: clerkUserId,
      mood,
      gratitude,
      challenges,
      wins,
      content
    });

    // Create daily reflection
    try {
      const reflection = await db.dailyReflection.create({
        data: {
          userId: clerkUserId,
          mood,
          gratitude,
          challenges,
          wins,
          content,
        },
      });
      console.log('Created reflection:', reflection);

      // Update streak
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const streak = await db.streak.findUnique({
        where: {
          userId_type: {
            userId: clerkUserId,
            type: "daily_reflection",
          },
        },
      });

      if (streak) {
        const lastCheckin = new Date(streak.lastCheckin);
        const isConsecutive = lastCheckin.toDateString() === yesterday.toDateString();

        await db.streak.update({
          where: {
            userId_type: {
              userId: clerkUserId,
              type: "daily_reflection",
            },
          },
          data: {
            currentCount: isConsecutive ? streak.currentCount + 1 : 1,
            lastCheckin: today,
          },
        });
      } else {
        await db.streak.create({
          data: {
            userId: clerkUserId,
            type: "daily_reflection",
            currentCount: 1,
            lastCheckin: today,
          },
        });
      }

      return NextResponse.json(reflection);
    } catch (dbError) {
      console.error('Database error:', dbError);
      if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
        if (dbError.code === 'P2002') {
          return NextResponse.json(
            { error: 'You have already submitted a reflection today' },
            { status: 409 }
          );
        }
        if (dbError.code === 'P2003') {
          return NextResponse.json(
            { error: 'Profile not found' },
            { status: 404 }
          );
        }
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error in reflection API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save reflection', 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
