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
    const { mood, gratitude, challenges, wins, content } = await req.json();

    // Create daily reflection
    const reflection = await db.dailyReflection.create({
      data: {
        userId,
        mood,
        gratitude,
        challenges,
        wins,
        content,
      },
    });

    // Update streak
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const streak = await db.streak.findUnique({
      where: {
        userId_type: {
          userId,
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
            userId,
            type: "daily_reflection",
          },
        },
        data: {
          currentCount: isConsecutive ? streak.currentCount + 1 : 1,
          longestCount: isConsecutive
            ? Math.max(streak.longestCount, streak.currentCount + 1)
            : streak.longestCount,
          lastCheckin: today,
        },
      });
    } else {
      await db.streak.create({
        data: {
          userId,
          type: "daily_reflection",
          currentCount: 1,
          longestCount: 1,
          lastCheckin: today,
        },
      });
    }

    return NextResponse.json(reflection);
  } catch (error) {
    console.error("[REFLECTION_CREATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
