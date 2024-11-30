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
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import ChatComponent from '@/components/chat/ChatComponent';
import LeaderboardComponent from '@/components/leaderboard/LeaderboardComponent';

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

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
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
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.firstName}!</h1>
          <p className="text-muted-foreground">
            Continue your journey to purpose and fulfillment
          </p>
        </div>
        <Button onClick={() => router.push("/reflection/new")}>
          Daily Reflection
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streakCount} days</div>
            <Progress value={(stats.streakCount % 7) * 14.28} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Goals Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedGoals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAchievements}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentPoints}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Daily Tasks & Goals */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today&#39;s Focus</CardTitle>
              <CardDescription>Your tasks for today</CardDescription>
            </CardHeader>
            <CardContent>
              {dailyTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between py-2"
                >
                  <span>{task.title}</span>
                  <Badge variant={task.completed ? "secondary" : "default"}>
                    {task.completed ? "Done" : "Todo"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Ikigai Progress */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Your Ikigai Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="passion" value={activeTab} onValueChange={handleTabChange}>
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
                  <p>Next milestone: Share your passion story with the community</p>
                </div>
              </TabsContent>
              {/* Add similar content for other tabs */}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Calendar & Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" className="rounded-md border" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center space-x-4"
                >
                  <div className="text-2xl">{achievement.emoji}</div>
                  <div>
                    <h4 className="font-semibold">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-around mt-8">
        <ChatComponent />
        <LeaderboardComponent />
      </div>
      <p>Let&apos;s continue our journey</p>
    </div>
  );
}
