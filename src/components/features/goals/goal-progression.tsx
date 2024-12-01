"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Lock, Trophy } from "lucide-react";
import confetti from "canvas-confetti";

interface Milestone {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  pointsReward: number;
}

interface SubGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: string;
  pointsReward: number;
  milestones: Milestone[];
}

interface MainGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  progress: number;
  pointsCost: number;
  pointsReward: number;
  status: string;
  subGoals: SubGoal[];
}

export function GoalProgression({
  mainGoal,
  userPoints,
  onUnlock,
  onComplete,
}: {
  mainGoal: MainGoal;
  userPoints: number;
  onUnlock: () => void;
  onComplete: () => void;
}) {
  const [activeSubGoal, setActiveSubGoal] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");

  const isLocked = mainGoal.status === "locked" && userPoints < mainGoal.pointsCost;
  const isCompleted = mainGoal.status === "completed";

  const handleUnlock = async () => {
    if (userPoints >= mainGoal.pointsCost) {
      await fetch(`/api/goals/${mainGoal.id}/unlock`, {
        method: "POST",
      });
      onUnlock();
    }
  };

  const handleMilestoneComplete = async (
    subGoalId: string,
    milestoneId: string
  ) => {
    try {
      const response = await fetch(
        `/api/goals/${mainGoal.id}/subgoals/${subGoalId}/milestones/${milestoneId}/complete`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        // Random chance for bonus feedback (variable ratio schedule)
        if (Math.random() < 0.3) {
          setFeedback("🌟 Exceptional progress! Here's a bonus reward!");
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: 0.5, y: 0.6 },
          });
        }
      }
    } catch (error) {
      console.error("Error completing milestone:", error);
    }
  };

  const updateProgress = async (newProgress: number) => {
    try {
      await fetch(`/api/goals/${mainGoal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress: newProgress }),
      });
      
      if (newProgress === 100) {
        // Handle completion
        onComplete?.();
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleProgressClick = () => {
    const newProgress = Math.min(mainGoal.progress + 10, 100);
    updateProgress(newProgress);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {mainGoal.title}
              {isLocked && <Lock className="h-4 w-4" />}
              {isCompleted && <Trophy className="h-4 w-4 text-yellow-500" />}
            </CardTitle>
            <CardDescription>{mainGoal.description}</CardDescription>
          </div>
          <Badge variant={isCompleted ? "success" : "secondary"}>
            {mainGoal.difficulty}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {isLocked ? (
          <div className="text-center p-6">
            <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="mb-4">
              Unlock this goal for {mainGoal.pointsCost} points
            </p>
            <Button
              onClick={handleUnlock}
              disabled={userPoints < mainGoal.pointsCost}
            >
              Unlock Goal
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span>Overall Progress</span>
                <span>{mainGoal.progress}%</span>
              </div>
              <Progress value={mainGoal.progress} />
              <Button onClick={handleProgressClick}>Increase Progress</Button>
            </div>

            <div className="space-y-4">
              {mainGoal.subGoals.map((subGoal) => (
                <Card key={subGoal.id}>
                  <CardHeader className="p-4">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() =>
                        setActiveSubGoal(
                          activeSubGoal === subGoal.id ? null : subGoal.id
                        )
                      }
                    >
                      <div>
                        <CardTitle className="text-sm">{subGoal.title}</CardTitle>
                        <Progress
                          value={subGoal.progress}
                          className="w-32 mt-2"
                        />
                      </div>
                      <Badge variant="outline">{subGoal.pointsReward} pts</Badge>
                    </div>
                  </CardHeader>

                  {activeSubGoal === subGoal.id && (
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-2">
                        {subGoal.milestones.map((milestone) => (
                          <TooltipProvider key={milestone.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer"
                                  onClick={() =>
                                    handleMilestoneComplete(
                                      subGoal.id,
                                      milestone.id
                                    )
                                  }
                                >
                                  <span className="flex items-center gap-2">
                                    {milestone.isCompleted ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <AlertCircle className="h-4 w-4" />
                                    )}
                                    {milestone.title}
                                  </span>
                                  <Badge variant="outline">
                                    {milestone.pointsReward} pts
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{milestone.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            {feedback && (
              <div className="mt-4 p-4 bg-accent rounded-md text-center">
                {feedback}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
