import { db } from '@/lib/db';

export type CoreDrive = {
  id: string;
  name: string;
  description: string;
  category: 'left-brain' | 'right-brain';
};

export const CORE_DRIVES: CoreDrive[] = [
  {
    id: 'epic-meaning',
    name: 'Epic Meaning & Calling',
    description: 'Contributing to something greater than yourself',
    category: 'left-brain',
  },
  {
    id: 'development',
    name: 'Development & Accomplishment',
    description: 'Making progress and developing skills',
    category: 'left-brain',
  },
  {
    id: 'ownership',
    name: 'Ownership & Possession',
    description: 'Owning and controlling your journey',
    category: 'left-brain',
  },
  {
    id: 'scarcity',
    name: 'Scarcity & Impatience',
    description: 'Pursuing exclusive or rare achievements',
    category: 'left-brain',
  },
  {
    id: 'social',
    name: 'Social Influence & Relatedness',
    description: 'Connecting and competing with others',
    category: 'right-brain',
  },
  {
    id: 'unpredictability',
    name: 'Unpredictability & Curiosity',
    description: 'Discovering new challenges and surprises',
    category: 'right-brain',
  },
  {
    id: 'avoidance',
    name: 'Loss & Avoidance',
    description: 'Maintaining progress and avoiding setbacks',
    category: 'right-brain',
  },
  {
    id: 'creativity',
    name: 'Empowerment of Creativity & Feedback',
    description: 'Creating and receiving feedback',
    category: 'right-brain',
  },
];

export class GamificationService {
  // Add points to user's total
  static async addPoints(userId: string, points: number) {
    // Create a new reward record for the points
    await db.reward.create({
      data: {
        userId,
        points,
        description: "Points awarded",
      }
    });

    // Get total points from rewards
    const rewards = await db.reward.findMany({
      where: { userId },
      select: { points: true }
    });

    const totalPoints = rewards.reduce((sum, reward) => sum + reward.points, 0);

    return totalPoints;
  }

  // Award points and create achievement for completing Ikigai sections
  static async awardIkigaiProgress(userId: string, section: string) {
    const points = 25; // 25 points per section
    
    await db.reward.create({
      data: {
        userId,
        description: `Completed ${section} section of Ikigai map`,
        points,
      },
    });

    // Check if all sections are completed
    const ikigaiMap = await db.ikigaiMap.findUnique({
      where: { userId },
    });

    if (ikigaiMap?.passion.length && 
        ikigaiMap?.profession.length && 
        ikigaiMap?.mission.length && 
        ikigaiMap?.vocation.length) {
      await db.achievement.create({
        data: {
          userId,
          title: 'Ikigai Master',
          description: 'Completed all sections of your Ikigai map',
          category: 'development',
          points: 100,
        },
      });
    }
  }

  // Maintain and update user streaks
  static async updateStreak(profileId: string, type: string) {
    const today = new Date();
    const streak = await db.streak.findUnique({
      where: {
        userId_type: {
          userId: profileId,
          type,
        },
      },
    });

    if (!streak) {
      await db.streak.create({
        data: {
          userId: profileId,
          type,
          currentCount: 1,
          longestCount: 1,
          lastCheckin: today,
        },
      });
      return;
    }

    const lastCheckin = new Date(streak.lastCheckin);
    const daysSinceLastCheckin = Math.floor(
      (today.getTime() - lastCheckin.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastCheckin === 1) {
      // Streak continues
      const currentCount = streak.currentCount + 1;
      const longestCount = Math.max(currentCount, streak.longestCount);

      await db.streak.update({
        where: {
          userId_type: {
            userId: profileId,
            type,
          },
        },
        data: {
          currentCount,
          longestCount,
          lastCheckin: today,
        },
      });

      // Award streak achievements
      if (currentCount === 7) {
        await this.awardStreakAchievement(profileId, '7-day');
      } else if (currentCount === 30) {
        await this.awardStreakAchievement(profileId, '30-day');
      }
    } else if (daysSinceLastCheckin > 1) {
      // Streak broken
      await db.streak.update({
        where: {
          userId_type: {
            userId: profileId,
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

  // Award streak-based achievements
  private static async awardStreakAchievement(profileId: string, type: '7-day' | '30-day') {
    const achievements = {
      '7-day': {
        title: 'Week Warrior',
        description: 'Maintained a 7-day streak',
        points: 50,
      },
      '30-day': {
        title: 'Monthly Master',
        description: 'Maintained a 30-day streak',
        points: 200,
      },
    };

    const achievement = achievements[type];

    await db.achievement.create({
      data: {
        userId: profileId,
        title: achievement.title,
        description: achievement.description,
        category: 'development',
        points: achievement.points,
      },
    });
  }

  // Get user's total points
  static async getUserPoints(profileId: string) {
    const rewards = await db.reward.findMany({
      where: { userId: profileId },
    });

    return rewards.reduce((total, reward) => total + reward.points, 0);
  }

  // Get user's level based on points
  static async getUserLevel(profileId: string) {
    const points = await this.getUserPoints(profileId);
    return Math.floor(points / 100) + 1; // Every 100 points = 1 level
  }
}
