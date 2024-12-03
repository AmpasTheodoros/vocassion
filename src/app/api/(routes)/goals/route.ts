import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = await getAuthUser();
    
    if (!auth?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = auth.user.id;

    const mainGoals = await db.mainGoal.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(mainGoals);
  } catch (error) {
    console.error("[GOALS_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET_BY_ID(
  req: Request,
  { params }: { params: { goalId: string } }
) {
  try {
    const auth = await getAuthUser();
    
    if (!auth?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = auth.user.id;
    const { goalId } = params;

    const goal = await db.mainGoal.findUnique({
      where: {
        id: goalId,
        userId,
      },
      include: {
        subGoals: {
          include: {
            milestones: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        feedback: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
    });

    if (!goal) {
      return new NextResponse("Goal not found", { status: 404 });
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error("[GOAL_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { goalId: string } }
) {
  try {
    const auth = await getAuthUser();
    
    if (!auth?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = auth.user.id;
    const { goalId } = params;
    const { action } = await req.json();

    const goal = await db.mainGoal.findUnique({
      where: {
        id: goalId,
        userId,
      },
      include: {
        subGoals: {
          include: {
            milestones: true,
          },
        },
      },
    });

    if (!goal) {
      return new NextResponse("Goal not found", { status: 404 });
    }

    if (action === "unlock") {
      // Check if user has enough points
      const profile = await db.profile.findUnique({
        where: { userId },
        include: {
          rewards: true,
          penalties: true,
        },
      });

      if (!profile) {
        return new NextResponse("Profile not found", { status: 404 });
      }

      const totalPoints =
        profile.rewards.reduce((sum, reward) => sum + reward.points, 0) -
        profile.penalties.reduce((sum, penalty) => sum + penalty.pointsLost, 0);

      if (totalPoints < goal.pointsCost) {
        return new NextResponse("Insufficient points", { status: 400 });
      }

      // Deduct points and unlock goal
      await db.penalty.create({
        data: {
          userId: profile.id,
          reason: `Unlocked goal: ${goal.title}`,
          pointsLost: goal.pointsCost,
        },
      });

      await db.mainGoal.update({
        where: { id: goalId },
        data: { status: "active" },
      });

      // Create encouraging feedback
      await db.feedback.create({
        data: {
          mainGoalId: goalId,
          userId: profile.id,
          content: "You've taken the first step! Let's achieve this goal together! ",
          type: "encouragement",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[GOAL_ACTION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
