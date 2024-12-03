"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  completed: boolean;
  progress: number;
  category: 'passion' | 'profession' | 'mission' | 'vocation';
}

interface GoalTrackerProps {
  goals: Goal[];
  onGoalComplete: (goalId: string) => Promise<void>;
  onAddGoal: () => void;
}

const GoalTracker: React.FC<GoalTrackerProps> = ({
  goals,
  onGoalComplete,
  onAddGoal,
}) => {
  const { toast } = useToast();

  const handleComplete = async (goalId: string) => {
    try {
      await onGoalComplete(goalId);
      toast({
        title: "Goal completed!",
        description: "Congratulations on achieving your goal!",
        variant: "default"
      });
    } catch (err) {
      console.error('Failed to complete goal:', err);
      toast({
        title: "Error",
        description: "Failed to mark goal as complete. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getCategoryColor = (category: Goal['category']) => {
    const colors = {
      passion: 'bg-red-500',
      profession: 'bg-blue-500',
      mission: 'bg-green-500',
      vocation: 'bg-yellow-500',
    };
    return colors[category];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Goals</h2>
        <Button onClick={onAddGoal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Goal
        </Button>
      </div>

      {goals.map((goal) => (
        <Card key={goal.id} className={goal.completed ? "opacity-75" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getCategoryColor(goal.category)}`} />
              <CardTitle className="text-lg font-medium">{goal.title}</CardTitle>
            </div>
            {goal.completed ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-gray-300" />
            )}
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
              </div>
            </div>
            {!goal.completed && (
              <Button
                className="mt-4"
                onClick={() => handleComplete(goal.id)}
                disabled={goal.progress < 100}
              >
                Mark as Complete
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GoalTracker;
