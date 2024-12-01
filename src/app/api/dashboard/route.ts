import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [
      profile,
      goals,
      challenges,
      achievements,
    ] = await Promise.all([
      db.profile.findUnique({
        where: { userId },
        include: {
          ikigaiMap: true,
        },
      }),
      db.goal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      db.challenge.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      db.achievement.findMany({
        where: { userId },
        orderBy: { unlockedAt: 'desc' },
        take: 5,
      }),
    ]);

    // Calculate stats
    const stats = {
      completedTasks: await db.challenge.count({
        where: { userId, status: 'COMPLETED' },
      }),
      totalAchievements: await db.achievement.count({
        where: { userId },
      }),
      currentPoints: achievements.reduce((sum, a) => sum + a.points, 0),
      streakCount: await db.streak.count({
        where: { userId },
      }),
    };

    return NextResponse.json({
      profile,
      goals,
      challenges,
      achievements,
      stats,
    });
  } catch (error) {
    console.error("[DASHBOARD_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
