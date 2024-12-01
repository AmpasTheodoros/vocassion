"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ChatComponent from '@/components/chat/ChatComponent';
import LeaderboardComponent from '@/components/leaderboard/LeaderboardComponent';
import { ActionSteps } from '@/components/goals/action-steps';
import { Calendar } from "@/components/ui/calendar";
import { PersonalizedDashboard } from "@/components/dashboard/PersonalizedDashboard";

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface Achievement {
  id: string;
  title: string;
  date: string;
  emoji: string;
  description: string;
}

interface Stats {
  streakCount: number;
  completedGoals: number;
  totalAchievements: number;
  currentPoints: number;
}

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    streakCount: 0,
    completedGoals: 0,
    totalAchievements: 0,
    currentPoints: 0,
  });
  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [activeTab, setActiveTab] = useState("passion");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    // Check if user has completed quiz
    fetch(`/api/profile/${user.id}`).then(async (res) => {
      if (res.ok) {
        const profile = await res.json();
        if (!profile.hasCompletedQuiz) {
          router.push('/');
          return;
        }
      }
    });
    
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const [statsRes, tasksRes, achievementsRes] = await Promise.all([
          fetch("/api/user/stats"),
          fetch("/api/tasks/daily"),
          fetch("/api/achievements/recent"),
        ]);

        if (statsRes.ok && tasksRes.ok && achievementsRes.ok) {
          const [statsData, tasksData, achievementsData] = await Promise.all([
            statsRes.json(),
            tasksRes.json(),
            achievementsRes.json(),
          ]);

          setStats(statsData);
          setDailyTasks(tasksData);
          setRecentAchievements(achievementsData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstName}!</h1>
          <p className="text-muted-foreground">
            Your journey to purpose and fulfillment continues
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/goals")}>
            View Goals
          </Button>
          <Button onClick={() => router.push("/reflection/new")}>
            Daily Reflection
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streakCount} days</div>
            <Progress value={(stats.streakCount % 7) * 14.28} className="mt-2" />
          </CardContent>
        </Card>
        <Card className="bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedGoals}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAchievements}</div>
            <p className="text-xs text-muted-foreground mt-1">Unlocked</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentPoints}</div>
            <p className="text-xs text-muted-foreground mt-1">Total earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Sidebar */}
        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today&apos;s Focus</CardTitle>
              <CardDescription>Your key tasks for today</CardDescription>
            </CardHeader>
            <CardContent>
              {dailyTasks.length > 0 ? (
                <div className="space-y-2">
                  {dailyTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <span className="text-sm">{task.title}</span>
                      <Badge variant={task.completed ? "secondary" : "default"}>
                        {task.completed ? "Done" : "Todo"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tasks for today
                </p>
              )}
            </CardContent>
          </Card>
          <ActionSteps />
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ikigai Journey</CardTitle>
              <CardDescription>Track your progress in finding your purpose</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="passion" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 gap-4">
                  <TabsTrigger value="passion">Passion</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="mission">Mission</TabsTrigger>
                  <TabsTrigger value="vocation">Vocation</TabsTrigger>
                </TabsList>
                <TabsContent value="passion">
                  <div className="space-y-4 mt-4">
                    <h3 className="font-semibold">What You Love</h3>
                    <Progress value={75} />
                    <p className="text-sm text-muted-foreground">
                      Next milestone: Share your passion story with the community
                    </p>
                  </div>
                </TabsContent>
                {/* Add similar content for other tabs */}
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personalized Content</CardTitle>
              <CardDescription>
                Resources and activities tailored to your journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PersonalizedDashboard />
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAchievements.length > 0 ? (
                  recentAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-start gap-3 p-2 rounded-lg bg-muted/50"
                    >
                      <div className="text-2xl">{achievement.emoji}</div>
                      <div>
                        <h4 className="font-medium text-sm">{achievement.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No achievements yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                className="rounded-md border"
                classNames={{
                  day_selected: "bg-primary text-primary-foreground",
                  day_today: "bg-muted text-muted-foreground",
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Community Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Community Chat</CardTitle>
            <CardDescription>Connect with others on similar journeys</CardDescription>
          </CardHeader>
          <CardContent>
            <ChatComponent />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>See how you compare with others</CardDescription>
          </CardHeader>
          <CardContent>
            <LeaderboardComponent />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
