'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CORE_DRIVES } from '@/lib/services/gamification';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  unlockedAt: Date;
}

interface Streak {
  type: string;
  currentCount: number;
  longestCount: number;
}

export function ProgressDashboard() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    fetchUserProgress();
  }, []);

  const fetchUserProgress = async () => {
    try {
      const response = await fetch('/api/gamification/progress');
      const data = await response.json();
      setAchievements(data.achievements);
      setStreaks(data.streaks);
      setPoints(data.points);
      setLevel(data.level);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const nextLevelProgress = (points % 100) / 100 * 100;

  return (
    <div className="space-y-6 p-6">
      {/* Level Progress */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Level {level}</h2>
          <Badge variant="secondary">{points} Points</Badge>
        </div>
        <Progress value={nextLevelProgress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          {100 - (points % 100)} points until next level
        </p>
      </Card>

      {/* Core Drives */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Core Drives</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CORE_DRIVES.map((drive) => (
            <div key={drive.id} className="space-y-2">
              <div className="flex justify-between">
                <h3 className="font-medium">{drive.name}</h3>
                <Badge variant={drive.category === 'left-brain' ? 'default' : 'secondary'}>
                  {drive.category}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{drive.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Achievements and Streaks */}
      <Tabs defaultValue="achievements">
        <TabsList>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements">
          <Card className="p-6">
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                  <Badge>{achievement.points} pts</Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="streaks">
          <Card className="p-6">
            <div className="space-y-4">
              {streaks.map((streak) => (
                <div key={streak.type} className="space-y-2">
                  <h3 className="font-medium capitalize">
                    {streak.type.replace('_', ' ')} Streak
                  </h3>
                  <div className="flex space-x-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current</p>
                      <p className="text-xl font-bold">{streak.currentCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Longest</p>
                      <p className="text-xl font-bold">{streak.longestCount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
