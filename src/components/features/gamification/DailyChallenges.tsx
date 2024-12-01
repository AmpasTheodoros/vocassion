import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  status: string;
}

interface Streak {
  currentCount: number;
  longestCount: number;
}

export function DailyChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
    fetchStreak();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await axios.get("/api/challenges/daily");
      setChallenges(response.data);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStreak = async () => {
    try {
      const response = await axios.get("/api/streaks/daily_challenges");
      setStreak(response.data);
    } catch (error) {
      console.error("Error fetching streak:", error);
    }
  };

  const completeChallenge = async (challengeId: string) => {
    try {
      await axios.post("/api/challenges/daily", { challengeId });
      fetchChallenges();
      fetchStreak();
    } catch (error) {
      console.error("Error completing challenge:", error);
    }
  };

  if (loading) {
    return <div>Loading challenges...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Streak Display */}
      {streak && (
        <Card className="bg-gradient-to-r from-orange-100 to-amber-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-500" />
              <div className="flex flex-col">
                <p className="text-sm font-medium">
                  {streak.currentCount} Day Streak!
                </p>
                <p className="text-xs text-muted-foreground">
                  Best: {streak.longestCount} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Challenges */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <h4 className="font-medium">{challenge.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {challenge.description}
                  </p>
                  <Badge variant="secondary">+{challenge.points} XP</Badge>
                </div>
                <Button
                  onClick={() => completeChallenge(challenge.id)}
                  disabled={challenge.status === "COMPLETED"}
                >
                  {challenge.status === "COMPLETED" ? "Completed" : "Complete"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
