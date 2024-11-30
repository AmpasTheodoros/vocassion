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

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get daily tasks
    const dailyTasks = await db.challenge.findMany({
      where: {
        userId,
        type: "daily",
        startDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    // Format tasks for the frontend
    const formattedTasks = dailyTasks.map(task => ({
      id: task.id,
      title: task.title,
      completed: task.status === "completed",
    }));

    return NextResponse.json(formattedTasks);
  } catch (error) {
    console.error("[DAILY_TASKS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
