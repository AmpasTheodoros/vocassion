"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import IkigaiAssessment from "@/components/ikigai/ikigai-assessment";
import confetti from "canvas-confetti";

interface AssessmentData {
  [key: string]: {
    question: string;
    answer: string;
  }[];
}

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  const handleComplete = async (assessmentData: AssessmentData) => {
    try {
      const response = await fetch("/api/ikigai/map", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assessmentData),
      });

      if (response.ok) {
        // Trigger confetti animation
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.5, y: 0.6 },
        });

        // Award achievement
        await fetch("/api/gamification/progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            achievementType: "COMPLETED_IKIGAI_ASSESSMENT",
            userId: user?.id,
          }),
        });

        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error saving Ikigai map:", error);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Progress value={(step / totalSteps) * 100} className="mb-8" />
      
      <Card className="p-6">
        {step === 1 && (
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">It&apos;s time to start your journey</h1>
            <p className="text-lg mb-6">
              Let&apos;s get started with your goals. Through this engaging process, we&apos;ll help you uncover what makes you truly come alive.
            </p>
            <Button onClick={() => setStep(2)} size="lg">
              Start Discovery
            </Button>
          </div>
        )}

        {step === 2 && (
          <IkigaiAssessment
            onComplete={(data) => {
              handleComplete(data);
              setStep(3);
            }}
          />
        )}

        {step === 3 && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              🎉 Congratulations! Your Ikigai Map is Ready
            </h2>
            <p className="mb-6">
              We&apos;re excited to have you here. You&apos;ve taken the first step towards living a more purposeful life. You&apos;re almost there! Let&apos;s explore your personalized dashboard!
            </p>
            <Button onClick={() => router.push("/dashboard")} size="lg">
              View My Dashboard
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
