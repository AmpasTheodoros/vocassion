import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser();
    
    if (!auth?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = auth.user.id;
    console.log('Processing Ikigai results for user:', userId);

    const { passion, profession, mission, vocation } = await req.json();
    console.log('Received Ikigai data:', { passion, profession, mission, vocation });

    // Get or create user profile
    let profile = await db.profile.findUnique({
      where: { userId },
      include: { ikigaiMap: true },
    });

    console.log('Found profile:', profile);

    if (!profile) {
      // Create a new profile if it doesn't exist
      console.log('Creating new profile for user:', userId);
      profile = await db.profile.create({
        data: {
          id: userId,
          userId,
          username: `user_${userId}`,
          slug: `user_${userId}`,
          email: auth.user.emailAddresses[0]?.emailAddress || '',
          name: auth.user.firstName || 'Anonymous',
        },
        include: { ikigaiMap: true },
      });
      console.log('Created new profile:', profile);
    }

    // Create or update Ikigai map
    console.log('Updating Ikigai map for profile:', profile.id);
    const ikigaiMap = await db.ikigaiMap.upsert({
      where: {
        userId: profile.id,
      },
      create: {
        userId: profile.id,
        passion,
        profession,
        mission,
        vocation,
      },
      update: {
        passion,
        profession,
        mission,
        vocation,
      },
    });

    console.log('Updated Ikigai map:', ikigaiMap);

    // Award achievement for completing assessment
    await db.achievement.create({
      data: {
        userId: profile.id,
        title: "Ikigai Pioneer",
        description: "Completed your first Ikigai assessment",
        category: "milestone",
        points: 100,
      },
    });

    // Update user's reward points
    await db.reward.create({
      data: {
        userId: profile.id,
        description: "Completed Ikigai Assessment",
        points: 100,
      },
    });

    return NextResponse.json(ikigaiMap);
  } catch (error) {
    console.error("[IKIGAI_ASSESSMENT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
