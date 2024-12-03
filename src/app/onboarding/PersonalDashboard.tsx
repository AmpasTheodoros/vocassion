import React from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';

const PersonalDashboard = () => {
  const router = useRouter();

  const navigateToIkigaiAssessment = () => {
    router.push('/ikigai-assessment');
  };

  return (
    <div>
      <h1>Personal Dashboard</h1>
      {/* Display user progress, Ikigai map, and challenges */}
      <Button onClick={navigateToIkigaiAssessment}>Start Ikigai Assessment</Button>
    </div>
  );
};

export default PersonalDashboard;
