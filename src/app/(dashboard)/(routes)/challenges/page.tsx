import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DailyChallenges } from "@/components/features/challenges/DailyChallenges";
import { GamificationSystem } from "@/components/features/gamification/GamificationSystem";
import {db} from "@/lib/db";

export default async function ChallengesPage() {
  const session = await auth();
  const userId = session?.userId;

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch user's challenges and gamification data
  const profile = await db.profile.findUnique({
    where: { userId },
    include: {
      challenges: true,
      achievements: true,
      streaks: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  const challenges = profile?.challenges || [];
  const achievements = profile?.achievements || [];
  const currentStreak = profile?.streaks[0]?.currentCount || 0;

  // Calculate XP and level based on achievements
  const totalXP = achievements.reduce((sum, achievement) => sum + achievement.points, 0);
  const level = Math.floor(totalXP / 1000) + 1;

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-8">Daily Challenges</h1>
          <DailyChallenges
            challenges={challenges.map(c => ({
              id: c.id,
              title: c.title,
              description: c.description,
              points: c.points,
              completed: c.status === 'COMPLETED',
              type: (c.type.toLowerCase() === 'daily' || c.type.toLowerCase() === 'weekly' || c.type.toLowerCase() === 'special') 
                ? c.type.toLowerCase() as 'daily' | 'weekly' | 'special'
                : 'daily'
            }))}
            onChallengeComplete={async (challengeId) => {
              'use server';
              await db.challenge.update({
                where: { id: challengeId },
                data: { status: 'COMPLETED' },
              });
            }}
          />
        </div>
        <div>
          <GamificationSystem
            xpPoints={totalXP}
            level={level}
            badges={achievements.map(a => ({
              id: a.id,
              name: a.title,
              description: a.description,
              imageUrl: `/badges/${a.category.toLowerCase()}.png`,
            }))}
            streakCount={currentStreak}
          />
        </div>
      </div>
    </div>
  );
}
