'use client';

import React from 'react';
import IkigaiAssessment from '@/components/features/ikigai/ikigai-assessment';

interface IkigaiAssessmentResults {
  passion: number;
  mission: number;
  profession: number;
  vocation: number;
}

const IkigaiAssessmentPage = () => {
  const handleComplete = (data: IkigaiAssessmentResults) => {
    // Handle completion logic, such as saving data to the user's profile
    console.log('Ikigai Assessment Complete:', data);
  };

  return (
    <div>
      <IkigaiAssessment onComplete={handleComplete} />
    </div>
  );
};

export default IkigaiAssessmentPage;
