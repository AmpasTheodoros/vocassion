import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  unlockedAt: string;
}

interface Reward {
  id: string;
  description: string;
  points: number;
}

export function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await axios.get("/api/achievements");
        setAchievements(response.data);
        calculateTotalPoints(response.data);
      } catch (error) {
        console.error("Error fetching achievements:", error);
      }
    };

    const fetchRewards = async () => {
      try {
        const response = await axios.get("/api/rewards");
        setRewards(response.data);
      } catch (error) {
        console.error("Error fetching rewards:", error);
      }
    };

    fetchAchievements();
    fetchRewards();
  }, []);

  const calculateTotalPoints = (achievements: Achievement[]) => {
    const total = achievements.reduce((sum, achievement) => sum + achievement.points, 0);
    setTotalPoints(total);
  };

  return (
    <div className="space-y-4">
      {/* Total Points Display */}
      <Card className="bg-gradient-to-r from-yellow-100 to-amber-100">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            <div className="flex flex-col">
              <p className="text-sm font-medium">{totalPoints} Total Points</p>
              <p className="text-xs text-muted-foreground">
                Keep going to unlock more rewards!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <h4 className="font-medium">{achievement.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">+{achievement.points} XP</Badge>
                  <span className="text-xs text-muted-foreground">
                    Unlocked:{" "}
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Rewards */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rewards.slice(0, 5).map((reward) => (
              <div
                key={reward.id}
                className="flex items-center justify-between p-2 border rounded"
              >
                <span className="text-sm">{reward.description}</span>
                <Badge>+{reward.points} XP</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
