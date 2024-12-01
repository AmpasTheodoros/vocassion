import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export { dynamic } from './route.config';

export async function GET() {
  try {
    const auth = await getAuthUser();
    
    if (!auth?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = auth.user.id;

    // Get user profile
    const profile = await db.profile.findUnique({
      where: { userId },
      include: {
        streaks: {
          where: {
            type: "daily_reflection",
          },
        },
        goals: {
          where: {
            status: "completed",
          },
        },
        achievements: true,
        rewards: true,
      },
    });

    if (!profile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    // Calculate total points from rewards
    const totalPoints = profile.rewards.reduce(
      (sum, reward) => sum + reward.points,
      0
    );

    // Get current streak
    const currentStreak = profile.streaks[0]?.currentCount || 0;

    return NextResponse.json({
      streakCount: currentStreak,
      completedGoals: profile.goals.length,
      totalAchievements: profile.achievements.length,
      currentPoints: totalPoints,
    });
  } catch (error) {
    console.error("[USER_STATS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
