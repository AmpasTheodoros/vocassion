"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import confetti from "canvas-confetti";

const moods = [
  { value: "energized", label: "Energized 🔋" },
  { value: "happy", label: "Happy 😊" },
  { value: "neutral", label: "Neutral 😐" },
  { value: "tired", label: "Tired 😴" },
  { value: "stressed", label: "Stressed 😰" },
];

export default function NewReflectionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    mood: "",
    gratitude: "",
    challenges: "",
    wins: "",
    content: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Submitting form data:', form);

      const response = await fetch("/api/reflection/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        console.error('Response error:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        throw new Error(data.error || data.details || 'Failed to submit reflection');
      }

      // Trigger celebration animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.5, y: 0.6 },
      });

      // Update streak and award points
      await fetch("/api/gamification/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "daily_reflection",
          points: 50,
        }),
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Error submitting reflection:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit reflection';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Daily Reflection</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                How are you feeling today?
              </label>
              <Select
                value={form.mood}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, mood: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your mood" />
                </SelectTrigger>
                <SelectContent>
                  {moods.map((mood) => (
                    <SelectItem key={mood.value} value={mood.value}>
                      {mood.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                What are you grateful for today?
              </label>
              <Textarea
                value={form.gratitude}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, gratitude: e.target.value }))
                }
                placeholder="List 3 things you're grateful for..."
                className="h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Any challenges you faced?
              </label>
              <Textarea
                value={form.challenges}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, challenges: e.target.value }))
                }
                placeholder="What challenges did you encounter?"
                className="h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                What wins would you like to celebrate?
              </label>
              <Textarea
                value={form.wins}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, wins: e.target.value }))
                }
                placeholder="Share your achievements, big or small..."
                className="h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Reflect on your Ikigai journey
              </label>
              <Textarea
                value={form.content}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="How did today's activities align with your purpose?"
                className="h-32"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Reflection"}
          </Button>
        </div>
      </form>
    </div>
  );
}
