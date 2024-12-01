import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await getAuthUser();
    
    if (!auth?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const challenges = await db.teamChallenge.findMany({
      where: {
        endDate: {
          gte: new Date(),
        },
      },
      include: {
        participants: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedChallenges = challenges.map((challenge) => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      participants: challenge.participants.length,
      deadline: challenge.endDate,
      reward: challenge.rewardPoints,
    }));

    return NextResponse.json(formattedChallenges);
  } catch (error) {
    console.error("[TEAM_CHALLENGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser();
    
    if (!auth?.user?.id || !auth.profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, description, category, endDate, rewardPoints } = await req.json();
    const userId = auth.profile.id;

    const challenge = await db.teamChallenge.create({
      data: {
        creatorId: userId,
        title,
        description,
        category,
        endDate,
        rewardPoints,
      },
    });

    return NextResponse.json(challenge);
  } catch (error) {
    console.error("[TEAM_CHALLENGES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
