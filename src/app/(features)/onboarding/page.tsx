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

  const handleAssessmentComplete = (results: IkigaiAssessmentResults) => {
    // Handle the results from the Ikigai assessment
    console.log('Assessment completed with results:', results);
    // Redirect to dashboard or any other page
    router.push('/dashboard');
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
