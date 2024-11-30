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

    const { passions, skills, mission, vocation } = await req.json();

    // Get or create user profile
    const profile = await db.profile.findUnique({
      where: { userId },
      include: { ikigaiMap: true },
    });

    if (!profile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    // Create or update Ikigai map
    const ikigaiMap = await db.ikigaiMap.upsert({
      where: {
        userId: profile.id,
      },
      create: {
        userId: profile.id,
        passions,
        skills,
        mission,
        vocation,
      },
      update: {
        passions,
        skills,
        mission,
        vocation,
      },
    });

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
