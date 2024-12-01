import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { GoalTracker } from "@/components/features/goals/GoalTracker";
import { db } from "@/lib/db";

interface DBGoal {
  id: string;
  title: string;
  description: string;
  deadline: Date | null;
  status: string;
  category: "passion" | "profession" | "mission" | "vocation";
}

export default async function GoalsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch user's goals
  const goals = await db.goal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <GoalTracker
          goals={goals.map(goal => {
            const validCategories = ["passion", "profession", "mission", "vocation"] as const;
            const category = validCategories.includes(goal.category as "passion" | "profession" | "mission" | "vocation")
              ? goal.category as "passion" | "profession" | "mission" | "vocation"
              : "passion"; // default fallback

            const typedGoal: DBGoal = {
              ...goal,
              category: category,
            };

            return {
              id: goal.id,
              title: goal.title,
              description: goal.description,
              deadline: goal.deadline || new Date(),
              completed: goal.status === "COMPLETED",
              progress: calculateProgress(typedGoal),
              category,
            };
          })}
          onGoalComplete={async (goalId) => {
            'use server';
            await db.goal.update({
              where: { id: goalId },
              data: { status: 'COMPLETED' },
            });
          }}
          onAddGoal={() => {
            redirect('/goals/new');
          }}
        />
      </div>
    </div>
  );
}

function calculateProgress({ status }: DBGoal): number {
  // Simple progress calculation based on status
  if (status === 'COMPLETED') return 100;
  
  // You might want to implement a more sophisticated progress calculation
  // based on your specific requirements
  return 50; // Default progress for in-progress goals
}
