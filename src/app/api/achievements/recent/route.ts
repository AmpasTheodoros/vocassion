import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const auth = await getAuthUser();
    
    if (!auth?.user?.id || !auth.profile) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = auth.profile.id;

    // Get recent achievements
    const achievements = await db.achievement.findMany({
      where: {
        userId,
      },
      orderBy: {
        unlockedAt: 'desc',
      },
      take: 5,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        unlockedAt: true,
      },
    });

    // Format achievements for the frontend
    const formattedAchievements = achievements.map(achievement => ({
      id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      date: achievement.unlockedAt.toISOString(),
      emoji: getCategoryEmoji(achievement.category),
    }));

    return NextResponse.json(formattedAchievements);
  } catch (error) {
    console.error("[RECENT_ACHIEVEMENTS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

function getCategoryEmoji(category: string): string {
  switch (category) {
    case 'passion':
      return '❤️';
    case 'skills':
      return '⭐';
    case 'mission':
      return '🌍';
    case 'vocation':
      return '💰';
    case 'milestone':
      return '🏆';
    default:
      return '🎯';
  }
}
