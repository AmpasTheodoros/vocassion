"use client";

import IkigaiAssessment from '@/components/features/ikigai/ikigai-assessment';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface IkigaiAssessmentResults {
  passion: number;
  mission: number;
  profession: number;
  vocation: number;
}

export default function OnboardingPage() {
  const router = useRouter();

  const handleAssessmentComplete = async (results: IkigaiAssessmentResults) => {
    try {
      console.log('Saving Ikigai results:', results);
      // Save the Ikigai assessment results
      const response = await fetch('/api/ikigai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passion: [results.passion.toString()],
          mission: [results.mission.toString()],
          profession: [results.profession.toString()],
          vocation: [results.vocation.toString()],
        }),
      });

      const data = await response.json();
      console.log('Ikigai save response:', data);

      if (!response.ok) {
        throw new Error('Failed to save Ikigai results');
      }

      console.log('Successfully saved Ikigai results, redirecting to dashboard');
      // Redirect to dashboard after successful save
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving Ikigai results:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Your Ikigai Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <IkigaiAssessment onComplete={handleAssessmentComplete} />
        </CardContent>
      </Card>
    </div>
  );
}
