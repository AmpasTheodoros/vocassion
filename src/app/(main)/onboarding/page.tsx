"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import IkigaiAssessment from "@/components/ikigai/ikigai-assessment";
import confetti from "canvas-confetti";
import { useToast } from "@/hooks/use-toast";
import ChatComponent from '@/components/chat/ChatComponent';
import LeaderboardComponent from '@/components/leaderboard/LeaderboardComponent';

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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  const handleComplete = async (assessmentData: AssessmentData) => {
    try {
      setLoading(true);

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Ensure user profile exists
      const profileResponse = await fetch(`/api/profile/${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: user.firstName || "User",
          imageUrl: user.imageUrl || "",
          email: user.emailAddresses[0]?.emailAddress || "",
        }),
      });

      if (!profileResponse.ok) {
        const error = await profileResponse.text();
        console.error("Profile save error:", error);
        throw new Error(`Failed to create/update profile: ${error}`);
      }

      // Format the data for the API - handle the new quiz format
      const formattedData = {
        passion: Object.values(assessmentData.passion || {})
          .map(item => typeof item === 'string' ? item : item.answer)
          .filter(Boolean),
        skills: Object.values(assessmentData.profession || {})
          .map(item => typeof item === 'string' ? item : item.answer)
          .filter(Boolean),
        mission: Object.values(assessmentData.mission || {})
          .map(item => typeof item === 'string' ? item : item.answer)
          .filter(Boolean),
        vocation: Object.values(assessmentData.vocation || {})
          .map(item => typeof item === 'string' ? item : item.answer)
          .filter(Boolean)
      };

      // Save Ikigai map data
      const mapResponse = await fetch(`/api/ikigai/map/${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!mapResponse.ok) {
        const error = await mapResponse.text();
        console.error("Map save error:", error);
        throw new Error(`Failed to save Ikigai map: ${error}`);
      }

      // Show success message with confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.5, y: 0.6 }
      });

      toast({
        title: "Success!",
        description: "Your Ikigai assessment has been saved.",
      });

      // Move to dashboard after a brief delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);

    } catch (error) {
      console.error("Error in onboarding:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An error occurred during onboarding',
      });
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="p-6 space-y-4">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">Welcome to Your Journey!</h1>
              <p className="text-muted-foreground">
                Let&apos;s discover your Ikigai - your reason for being
              </p>
            </div>
            <Button 
              className="w-full"
              onClick={() => setStep(2)}
              size="lg"
            >
              Begin Discovery
            </Button>
          </Card>
        );
      case 2:
        return (
          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Your Ikigai Assessment</h2>
              <IkigaiAssessment onComplete={handleComplete} />
            </Card>
          </div>
        );
      case 3:
        return (
          <Card className="p-6 text-center space-y-4">
            <h2 className="text-2xl font-bold">Congratulations! 🎉</h2>
            <p className="text-muted-foreground">
              Your Ikigai map is being created. You&apos;ve earned your first achievement!
            </p>
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Redirecting to your dashboard...
              </p>
            )}
            {step === 3 && (
              <div className="flex justify-around mt-8">
                <ChatComponent />
                <LeaderboardComponent />
              </div>
            )}
          </Card>
        );
    }
  };

  if (!isLoaded || !user) {
    return null;
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4 min-h-screen">
      <div className="space-y-8">
        <div className="space-y-2">
          <Progress value={(step / 3) * 100} className="w-full" />
          <p className="text-sm text-center text-muted-foreground">
            Step {step} of 3
          </p>
        </div>
        {renderStep()}
      </div>
    </div>
  );
}
