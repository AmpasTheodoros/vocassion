import { db } from "@/lib/db";

const VALID_CHALLENGE_CATEGORIES = ["skills", "mission", "vocation", "passion"] as const;
type ChallengeCategory = typeof VALID_CHALLENGE_CATEGORIES[number];

function isValidChallengeCategory(category: string): category is ChallengeCategory {
  return VALID_CHALLENGE_CATEGORIES.includes(category as ChallengeCategory);
}

export async function getTeamChallenges() {
  try {
    const challenges = await db.teamChallenge.findMany({
      where: {
        endDate: {
          gte: new Date(),
        },
      },
      include: {
        participants: true,
        creator: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return challenges.map((challenge) => {
      if (!isValidChallengeCategory(challenge.category)) {
        console.warn(`Invalid challenge category found: ${challenge.category}`);
      }
      return {
        ...challenge,
        category: (isValidChallengeCategory(challenge.category) ? challenge.category : "skills") as ChallengeCategory,
      };
    });
  } catch (error) {
    console.error("[GET_TEAM_CHALLENGES]", error);
    throw new Error("Failed to fetch team challenges");
  }
}

export async function createTeamChallenge(
  creatorId: string,
  data: {
    title: string;
    description: string;
    category: string;
    rewardPoints: number;
    endDate: Date;
  }
) {
  try {
    if (!isValidChallengeCategory(data.category)) {
      throw new Error(`Invalid challenge category: ${data.category}`);
    }

    const challenge = await db.teamChallenge.create({
      data: {
        creatorId,
        ...data,
        category: data.category as ChallengeCategory,
      },
    });

    return challenge;
  } catch (error) {
    console.error("[CREATE_TEAM_CHALLENGE]", error);
    throw new Error("Failed to create team challenge");
  }
}

export async function joinTeamChallenge(challengeId: string, userId: string) {
  try {
    const participant = await db.teamChallengeParticipant.create({
      data: {
        challengeId,
        userId,
        status: "active",
      },
    });

    return participant;
  } catch (error) {
    console.error("[JOIN_TEAM_CHALLENGE]", error);
    throw new Error("Failed to join team challenge");
  }
}

export async function updateChallengeProgress(
  challengeId: string,
  userId: string,
  progress: number
) {
  try {
    const participant = await db.teamChallengeParticipant.update({
      where: {
        challengeId_userId: {
          challengeId,
          userId,
        },
      },
      data: {
        progress,
        status: progress >= 100 ? "completed" : "active",
      },
    });

    if (progress >= 100) {
      // Award points to the user
      await db.reward.create({
        data: {
          userId,
          points: (await db.teamChallenge.findUnique({
            where: { id: challengeId },
          }))?.rewardPoints || 0,
          description: "Team challenge completion",
        },
      });
    }

    return participant;
  } catch (error) {
    console.error("[UPDATE_CHALLENGE_PROGRESS]", error);
    throw new Error("Failed to update challenge progress");
  }
}
