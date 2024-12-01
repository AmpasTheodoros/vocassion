import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  type: 'daily' | 'weekly' | 'special';
}

interface DailyChallengesProps {
  challenges: Challenge[];
  onChallengeComplete: (challengeId: string) => Promise<void>;
}

export const DailyChallenges: React.FC<DailyChallengesProps> = ({
  challenges,
  onChallengeComplete,
}) => {
  const { toast } = useToast();

  const handleComplete = async (challengeId: string) => {
    try {
      await onChallengeComplete(challengeId);
      toast({
        title: "Challenge completed!",
        description: "You've earned points for completing this challenge.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to complete the challenge. Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Daily Challenges</h2>
      {challenges.map((challenge) => (
        <Card key={challenge.id} className={challenge.completed ? "opacity-75" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              {challenge.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                +{challenge.points} XP
              </span>
              {challenge.completed ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-gray-300" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {challenge.description}
            </p>
            {!challenge.completed && (
              <Button
                className="mt-4"
                onClick={() => handleComplete(challenge.id)}
              >
                Complete Challenge
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DailyChallenges;
