"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatComponent from '@/components/chat/ChatComponent';
import { DailyChallenges } from "@/components/features/challenges/DailyChallenges";
import { GoalTracker } from "@/components/features/goals/GoalTracker";
import { GamificationSystem } from "@/components/features/gamification/GamificationSystem";
import { CommunityHub } from "@/components/community/CommunityHub";

interface Achievement {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  category: string;
}

interface Stats {
  completedTasks: number;
  totalAchievements: number;
  currentPoints: number;
  streakCount: number;
}

interface Profile {
  id: string;
  userId: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  endDate: string;
  status: string;
  category: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  status: string;
  type: string;
}

interface DashboardData {
  profile: Profile;
  goals: Goal[];
  challenges: Challenge[];
  achievements: Achievement[];
  stats: Stats;
}

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/dashboard");
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    fetchDashboardData();
  }, [user, router]);

  if (isLoading || !data) {
    return <div>Loading...</div>;
  }

  const calculateProgress = (_goal: Goal) => {
    // Implement progress calculation logic here
    return 0;
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.completedTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground">
              <path d="M12 2v20M2 12h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalAchievements}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground">
              <path d="M12 2v20M2 12h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.currentPoints} XP</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="challenges">Daily Challenges</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <GamificationSystem 
                xpPoints={data.stats.currentPoints}
                level={Math.floor(data.stats.currentPoints / 1000) + 1}
                badges={data.achievements.map(a => ({
                  id: a.id,
                  name: a.title,
                  description: a.description,
                  imageUrl: `/badges/${a.category.toLowerCase()}.png`
                }))}
                streakCount={data.stats.streakCount}
              />
            </TabsContent>
            <TabsContent value="challenges" className="space-y-4">
              <DailyChallenges 
                challenges={data.challenges.map(c => ({
                  id: c.id,
                  title: c.title,
                  description: c.description,
                  points: c.points || 0,
                  completed: c.status === 'COMPLETED',
                  type: (c.type?.toLowerCase() === 'daily' || c.type?.toLowerCase() === 'weekly' || c.type?.toLowerCase() === 'special') 
                    ? c.type.toLowerCase() as 'daily' | 'weekly' | 'special'
                    : 'daily'
                }))}
                onChallengeComplete={async (challengeId) => {
                  const response = await fetch(`/api/challenges/${challengeId}/complete`, {
                    method: 'POST',
                  });
                  if (response.ok) {
                    // Refresh the data after completing a challenge
                    const updatedData = await fetch("/api/dashboard").then(res => res.json());
                    setData(updatedData);
                  }
                }}
              />
            </TabsContent>
            <TabsContent value="goals" className="space-y-4">
              <GoalTracker 
                goals={data.goals.map(g => ({
                  id: g.id,
                  title: g.title,
                  description: g.description,
                  deadline: new Date(g.endDate),
                  completed: g.status === 'COMPLETED',
                  progress: calculateProgress(g),
                  category: g.category.toLowerCase() as 'passion' | 'profession' | 'mission' | 'vocation',
                }))}
                onGoalComplete={async (goalId) => {
                  const response = await fetch(`/api/goals/${goalId}/complete`, {
                    method: 'POST',
                  });
                  if (response.ok) {
                    // Refresh dashboard data
                    fetchDashboardData();
                  }
                }}
                onAddGoal={() => router.push('/goals/new')}
              />
            </TabsContent>
            <TabsContent value="community" className="space-y-4">
              <CommunityHub />
            </TabsContent>
          </Tabs>
        </div>

        <div className="col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {data.achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {achievement.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {new Date(achievement.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chat Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <ChatComponent />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
