'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Mission {
  id: string;
  title: string;
  description: string;
  coreDrive: string;
  ikigaiComponent: 'passion' | 'mission' | 'profession' | 'vocation';
  points: number;
  progress: number;
}

const SAMPLE_MISSIONS: Mission[] = [
  {
    id: '1',
    title: 'Purpose Explorer',
    description: 'Complete your Ikigai map to discover your life purpose',
    coreDrive: 'Epic Meaning & Calling',
    ikigaiComponent: 'passion',
    points: 100,
    progress: 0,
  },
  {
    id: '2',
    title: 'Skill Master',
    description: 'Log 5 skills you want to develop',
    coreDrive: 'Development & Accomplishment',
    ikigaiComponent: 'profession',
    points: 50,
    progress: 0,
  },
  {
    id: '3',
    title: 'Community Champion',
    description: 'Help 3 other members with their journey',
    coreDrive: 'Social Influence & Relatedness',
    ikigaiComponent: 'mission',
    points: 75,
    progress: 0,
  },
  {
    id: '4',
    title: 'Value Creator',
    description: 'Identify 3 ways your skills can solve real problems',
    coreDrive: 'Ownership & Possession',
    ikigaiComponent: 'vocation',
    points: 60,
    progress: 0,
  },
];

export function MissionBoard() {
  const [missions, setMissions] = useState<Mission[]>(SAMPLE_MISSIONS);

  const getMissionVariant = (ikigaiComponent: string) => {
    const variants = {
      passion: 'default',
      mission: 'secondary',
      profession: 'outline',
      vocation: 'destructive',
    } as const;
    return variants[ikigaiComponent as keyof typeof variants] || 'default';
  };

  const handleMissionProgress = async (missionId: string) => {
    try {
      const response = await fetch('/api/gamification/mission-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ missionId }),
      });

      if (!response.ok) throw new Error('Failed to update mission progress');

      setMissions(missions.map(mission => {
        if (mission.id === missionId) {
          const newProgress = Math.min(100, mission.progress + 25);
          return { ...mission, progress: newProgress };
        }
        return mission;
      }));
    } catch (error) {
      console.error('Error updating mission progress:', error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Active Missions</h2>
        <Badge variant="outline">Daily Reset in 12h</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {missions.map((mission) => (
          <Card key={mission.id} className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{mission.title}</h3>
                <p className="text-sm text-muted-foreground">{mission.description}</p>
              </div>
              <Badge variant={getMissionVariant(mission.ikigaiComponent) as "default" | "secondary" | "outline" | "destructive"}>
                {mission.points} pts
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{mission.coreDrive}</span>
                <span>{mission.progress}%</span>
              </div>
              <Progress value={mission.progress} className="h-2" />
            </div>

            <Button 
              onClick={() => handleMissionProgress(mission.id)}
              disabled={mission.progress >= 100}
              className="w-full"
            >
              {mission.progress >= 100 ? 'Completed!' : 'Progress Mission'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
