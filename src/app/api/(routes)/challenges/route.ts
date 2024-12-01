import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { randomUUID } from 'crypto';

interface ErrorResponse {
  message: string;
  error?: unknown;
}

interface IkigaiMap {
  userId: string;
  passion: string[];
  profession: string[];
  mission: string[];
  vocation: string[];
}

interface ChallengeTemplate {
  title: string;
  description: string;
  type: string;
  points: number;
}

interface Challenge {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: string;
  points: number;
  status: string;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(_req: Request): Promise<Response> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's Ikigai map to personalize challenges
    const ikigaiMap: IkigaiMap | null = await db.ikigaiMap.findUnique({
      where: { userId },
    });

    // Generate personalized challenges based on Ikigai map
    const challenges: Challenge[] = generateDailyChallenges(ikigaiMap);

    return NextResponse.json(challenges);
  } catch (error: unknown) {
    const errorResponse: ErrorResponse = {
      message: "Failed to fetch challenges",
      error,
    };
    return new NextResponse(JSON.stringify(errorResponse), { status: 500 });
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const { userId } = await auth();
    const { challengeId } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Mark challenge as completed and award points
    const completedChallenge: Challenge | null = await db.challenge.update({
      where: {
        id: challengeId,
        userId,
      },
      data: {
        status: "COMPLETED",
      },
    });

    // Award points
    await db.reward.create({
      data: {
        userId,
        description: `Completed daily challenge: ${completedChallenge?.title}`,
        points: completedChallenge?.points,
      },
    });

    // Update streak
    await updateStreak(userId, "daily_challenges");

    // Check for achievements
    await checkAndAwardAchievements(userId);

    return NextResponse.json(completedChallenge);
  } catch (error: unknown) {
    const errorResponse: ErrorResponse = {
      message: "Failed to create challenge",
      error,
    };
    return new NextResponse(JSON.stringify(errorResponse), { status: 500 });
  }
}

function generateDailyChallenges(ikigaiMap: IkigaiMap | null): Challenge[] {
  const baseTemplates: ChallengeTemplate[] = [
    {
      title: "Research Your Passion",
      description: "Spend 10 minutes researching careers related to your passion",
      type: "PASSION",
      points: 50,
    },
    {
      title: "Network for Growth",
      description: "Talk to one person about what drives you",
      type: "PROFESSION",
      points: 30,
    },
    {
      title: "Mission Reflection",
      description: "Write down three ways you can help others with your skills",
      type: "MISSION",
      points: 40,
    },
    {
      title: "Skill Development",
      description: "Learn something new related to your vocation",
      type: "VOCATION",
      points: 60,
    },
  ];

  // Personalize challenges based on Ikigai map
  return baseTemplates.map((template) => ({
    ...template,
    id: randomUUID(),
    userId: ikigaiMap?.userId,
    status: 'pending',
    startDate: new Date(),
    endDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    description: personalizeDescription(template, ikigaiMap),
  })) as Challenge[];
}

function personalizeDescription(template: ChallengeTemplate, ikigaiMap: IkigaiMap | null): string {
  if (!ikigaiMap) return template.description;

  switch (template.type) {
    case "PASSION":
      return ikigaiMap.passion.length > 0
        ? `Research careers related to ${ikigaiMap.passion[0]}`
        : template.description;
    case "PROFESSION":
      return ikigaiMap.profession.length > 0
        ? `Connect with someone in the ${ikigaiMap.profession[0]} field`
        : template.description;
    default:
      return template.description;
  }
}

async function updateStreak(userId: string, type: string) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const streak = await db.streak.findUnique({
    where: {
      userId_type: {
        userId,
        type,
      },
    },
  });

  if (!streak) {
    await db.streak.create({
      data: {
        userId,
        type,
        currentCount: 1,
        longestCount: 1,
        lastCheckin: today,
      },
    });
    return;
  }

  const lastCheckin = new Date(streak.lastCheckin);
  const isConsecutiveDay = lastCheckin.toDateString() === yesterday.toDateString();

  if (isConsecutiveDay) {
    const newCount = streak.currentCount + 1;
    await db.streak.update({
      where: {
        userId_type: {
          userId,
          type,
        },
      },
      data: {
        currentCount: newCount,
        longestCount: Math.max(newCount, streak.longestCount),
        lastCheckin: today,
      },
    });
  } else if (lastCheckin.toDateString() !== today.toDateString()) {
    await db.streak.update({
      where: {
        userId_type: {
          userId,
          type,
        },
      },
      data: {
        currentCount: 1,
        lastCheckin: today,
      },
    });
  }
}

async function checkAndAwardAchievements(userId: string) {
  // Check completed challenges count
  const completedChallenges = await db.challenge.count({
    where: {
      userId,
      status: "COMPLETED",
    },
  });

  const achievements = [
    {
      title: "Challenge Beginner",
      description: "Complete your first challenge",
      threshold: 1,
    },
    {
      title: "Challenge Explorer",
      description: "Complete 5 challenges",
      threshold: 5,
    },
    {
      title: "Challenge Master",
      description: "Complete 20 challenges",
      threshold: 20,
    },
  ];

  for (const achievement of achievements) {
    if (completedChallenges >= achievement.threshold) {
      await db.achievement.upsert({
        where: {
          userId_title: {
            userId,
            title: achievement.title,
          },
        },
        update: {},
        create: {
          userId,
          title: achievement.title,
          description: achievement.description,
          category: "CHALLENGES",
          points: achievement.threshold * 10,
        },
      });
    }
  }
}
