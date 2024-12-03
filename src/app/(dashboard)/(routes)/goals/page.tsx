"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import GoalTracker from "@/components/features/goals/GoalTracker";

interface DBGoal {
  id: string;
  title: string;
  description: string;
  deadline: Date | null;
  status: string;
  category: "passion" | "profession" | "mission" | "vocation";
}

export default function GoalsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [goals, setGoals] = useState<DBGoal[]>([]);

  useEffect(() => {
    if (!userId) {
      router.push('/sign-in');
      return;
    }

    // Fetch user's goals
    const fetchGoals = async () => {
      const response = await fetch('/api/goals');
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    };

    fetchGoals();
  }, [userId, router]);

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <GoalTracker
          goals={goals.map(goal => {
            const validCategories = ["passion", "profession", "mission", "vocation"] as const;
            const category = validCategories.includes(goal.category as "passion" | "profession" | "mission" | "vocation")
              ? goal.category as "passion" | "profession" | "mission" | "vocation"
              : "passion"; // default fallback

            return {
              id: goal.id,
              title: goal.title,
              description: goal.description,
              deadline: goal.deadline || new Date(),
              completed: goal.status === "COMPLETED",
              progress: calculateProgress(goal),
              category,
            };
          })}
          onGoalComplete={async (goalId) => {
            const response = await fetch(`/api/goals/${goalId}/complete`, {
              method: 'POST',
            });
            if (response.ok) {
              // Refresh goals after completion
              const updatedResponse = await fetch('/api/goals');
              if (updatedResponse.ok) {
                const data = await updatedResponse.json();
                setGoals(data);
              }
            }
          }}
          onAddGoal={() => router.push('/goals/new')}
        />
      </div>
    </div>
  );
}

function calculateProgress({ status }: DBGoal): number {
  return status === "COMPLETED" ? 100 : 0;
}
