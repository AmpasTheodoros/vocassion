import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

interface GamificationProps {
  xpPoints: number;
  level: number;
  badges: Badge[];
  streakCount: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export const GamificationSystem: React.FC<GamificationProps> = ({
  xpPoints,
  level,
  badges,
  streakCount,
}) => {
  const { user } = useUser();
  const nextLevelXP = (level + 1) * 1000;
  const progress = (xpPoints / nextLevelXP) * 100;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback>{user?.firstName?.charAt(0)}</AvatarFallback>
            </Avatar>
            Level {level}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground">
              {xpPoints} / {nextLevelXP} XP to next level
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🔥 Current Streak: {streakCount} days</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Keep up the momentum! Complete daily tasks to maintain your streak.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {badges.map((badge) => (
              <Badge
                key={badge.id}
                variant="secondary"
                className="flex flex-col items-center p-2"
              >
                <Image
                  src={badge.imageUrl}
                  alt={badge.name}
                  className="w-8 h-8 mb-1"
                />
                <span className="text-xs">{badge.name}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamificationSystem;
