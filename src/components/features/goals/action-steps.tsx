"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusCircle,
  Trophy,
  Star,
  Calendar,
  Filter,
  ArrowUpDown,
  Clock,
  Target,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import confetti from "canvas-confetti";

interface ActionStep {
  id: string;
  title: string;
  completed: boolean;
  deadline?: Date;
  category: "skill" | "passion" | "mission" | "vocation";
  difficulty: "easy" | "medium" | "hard";
  createdAt: Date;
}

type SortOption = "newest" | "oldest" | "difficulty" | "deadline";

export function ActionSteps() {
  const [steps, setSteps] = useState<ActionStep[]>([]);
  const [newStep, setNewStep] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ActionStep["category"]>("skill");
  const [selectedDifficulty, setSelectedDifficulty] = useState<ActionStep["difficulty"]>("easy");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [filterCategory, setFilterCategory] = useState<ActionStep["category"] | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [isAddingStep, setIsAddingStep] = useState(false);

  useEffect(() => {
    // Load steps from localStorage on component mount
    const savedSteps = localStorage.getItem("actionSteps");
    if (savedSteps) {
      setSteps(JSON.parse(savedSteps).map((step: Omit<ActionStep, 'deadline' | 'createdAt'> & { deadline?: string; createdAt: string }) => ({
        ...step,
        deadline: step.deadline ? new Date(step.deadline) : undefined,
        createdAt: new Date(step.createdAt),
      })));
    }
  }, []);

  useEffect(() => {
    // Save steps to localStorage whenever they change
    localStorage.setItem("actionSteps", JSON.stringify(steps));
  }, [steps]);

  const handleAddStep = () => {
    if (!newStep.trim()) return;

    const step: ActionStep = {
      id: Math.random().toString(36).substr(2, 9),
      title: newStep,
      completed: false,
      category: selectedCategory,
      difficulty: selectedDifficulty,
      deadline: selectedDate,
      createdAt: new Date(),
    };

    setSteps([...steps, step]);
    setNewStep("");
    setSelectedDate(undefined);
    setIsAddingStep(false);

    // Positive reinforcement for creating new steps
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#10B981', '#6366F1', '#8B5CF6'],
    });
  };

  const handleComplete = async (stepId: string) => {
    const updatedSteps = steps.map((step) =>
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );
    setSteps(updatedSteps);

    const step = steps.find((s) => s.id === stepId);
    if (step && !step.completed) {
      // Celebrate completion with visual feedback
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.5, y: 0.6 },
        colors: ['#10B981', '#6366F1', '#8B5CF6'],
      });

      try {
        await fetch("/api/gamification/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "action_step_complete",
            category: step.category,
            difficulty: step.difficulty,
            points: getDifficultyPoints(step.difficulty),
          }),
        });
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    }
  };

  const getDifficultyPoints = (difficulty: ActionStep["difficulty"]) => {
    const points = { easy: 10, medium: 20, hard: 30 };
    return points[difficulty];
  };

  const getProgressPercentage = () => {
    if (steps.length === 0) return 0;
    return (steps.filter((step) => step.completed).length / steps.length) * 100;
  };

  const getDifficultyColor = (difficulty: ActionStep["difficulty"]) => {
    const colors = {
      easy: "text-green-500",
      medium: "text-yellow-500",
      hard: "text-red-500",
    };
    return colors[difficulty];
  };

  const filteredAndSortedSteps = steps
    .filter((step) => filterCategory === "all" || step.category === filterCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "oldest":
          return a.createdAt.getTime() - b.createdAt.getTime();
        case "difficulty":
          const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
          return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
        case "deadline":
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return a.deadline.getTime() - b.deadline.getTime();
        default:
          return 0;
      }
    });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Action Steps
        </CardTitle>
        <CardDescription>Break down your Ikigai journey into achievable steps</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(getProgressPercentage())}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{steps.filter(s => s.completed).length} completed</span>
              <span>{steps.length} total steps</span>
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex gap-2">
            <Select value={filterCategory} onValueChange={(value: ActionStep["category"] | "all") => setFilterCategory(value)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="skill">Skills</SelectItem>
                <SelectItem value="passion">Passion</SelectItem>
                <SelectItem value="mission">Mission</SelectItem>
                <SelectItem value="vocation">Vocation</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="difficulty">Difficulty</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Add New Step */}
          {isAddingStep ? (
            <div className="space-y-4 rounded-lg border p-4">
              <Input
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                placeholder="What's your next step?"
                className="flex-1"
              />
              <div className="flex flex-wrap gap-2">
                <Select value={selectedCategory} onValueChange={(value: ActionStep["category"]) => setSelectedCategory(value)}>
                  <SelectTrigger className="w-[140px]">
                    <Target className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skill">Skill</SelectItem>
                    <SelectItem value="passion">Passion</SelectItem>
                    <SelectItem value="mission">Mission</SelectItem>
                    <SelectItem value="vocation">Vocation</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedDifficulty} onValueChange={(value: ActionStep["difficulty"]) => setSelectedDifficulty(value)}>
                  <SelectTrigger className="w-[140px]">
                    <Star className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy (10 pts)</SelectItem>
                    <SelectItem value="medium">Medium (20 pts)</SelectItem>
                    <SelectItem value="hard">Hard (30 pts)</SelectItem>
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[140px]">
                      <Calendar className="h-4 w-4 mr-2" />
                      {selectedDate ? format(selectedDate, "PP") : "Set deadline"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsAddingStep(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddStep}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setIsAddingStep(true)} className="w-full">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Step
            </Button>
          )}

          {/* Action Steps List */}
          <div className="space-y-2">
            {filteredAndSortedSteps.map((step) => (
              <div
                key={step.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Checkbox
                          checked={step.completed}
                          onCheckedChange={() => handleComplete(step.id)}
                          className="data-[state=checked]:bg-primary"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Mark as {step.completed ? 'incomplete' : 'complete'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="space-y-1">
                    <p className={step.completed ? "line-through text-muted-foreground" : ""}>
                      {step.title}
                    </p>
                    {step.deadline && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Due {format(step.deadline, "PP")}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {step.category}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={`flex items-center gap-1 ${getDifficultyColor(step.difficulty)}`}
                  >
                    <Star className="h-3 w-3" />
                    {getDifficultyPoints(step.difficulty)} pts
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {steps.length === 0 && (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Start breaking down your goals into small, achievable steps!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Each completed step brings you closer to your Ikigai
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>Tip: Break down larger goals into smaller, manageable steps for better progress tracking</p>
      </CardFooter>
    </Card>
  );
}
