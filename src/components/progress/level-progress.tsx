"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";

interface ProgressLevel {
  id: string;
  category: string;
  level: number;
  currentXP: number;
  requiredXP: number;
}

const CATEGORIES = {
  passion: { label: "Passion", emoji: "❤️" },
  skill: { label: "Skills", emoji: "⚡" },
  mission: { label: "Mission", emoji: "🎯" },
  vocation: { label: "Vocation", emoji: "💼" },
};

export function LevelProgress({
  levels,
  onLevelUp,
}: {
  levels: ProgressLevel[];
  onLevelUp: (category: string, newLevel: number) => void;
}) {
  const [animations, setAnimations] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Check for level ups
    levels.forEach((level) => {
      if (level.currentXP >= level.requiredXP && !animations[level.id]) {
        // Trigger level up animation
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.5, y: 0.6 },
        });

        // Update animation state
        setAnimations((prev) => ({ ...prev, [level.id]: true }));

        // Notify parent component
        onLevelUp(level.category, level.level + 1);
      }
    });
  }, [levels, animations, onLevelUp]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {levels.map((level) => (
        <Card
          key={level.id}
          className={`transition-transform duration-300 ${
            animations[level.id] ? "scale-105" : ""
          }`}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {CATEGORIES[level.category as keyof typeof CATEGORIES].emoji}{" "}
                {CATEGORIES[level.category as keyof typeof CATEGORIES].label}
              </CardTitle>
              <Badge variant="outline">Level {level.level}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>XP Progress</span>
                <span>
                  {level.currentXP} / {level.requiredXP}
                </span>
              </div>
              <Progress
                value={(level.currentXP / level.requiredXP) * 100}
                className="h-2"
              />
              <div className="text-xs text-muted-foreground text-center">
                {level.requiredXP - level.currentXP} XP until next level
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
