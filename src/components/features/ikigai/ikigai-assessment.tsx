'use client';

// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { Progress } from '@/components/ui/progress';
// import { Badge } from '@/components/ui/badge';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Sparkles } from 'lucide-react';
// import confetti from 'canvas-confetti';
import { EnhancedIkigaiQuiz } from './enhanced-ikigai-quiz';

interface IkigaiAssessmentResults {
  passion: number;
  mission: number;
  profession: number;
  vocation: number;
}

interface IkigaiAssessmentProps {
  onComplete: (data: IkigaiAssessmentResults) => void;
}

const _sections = [
  {
    id: 'passion',
    title: 'What You Love',
    description: 'Discover activities that bring you joy and fulfillment',
    emoji: '❤️',
    points: 100,
    questions: [
      'What activities make you lose track of time?',
      'What topics do you enjoy learning about?',
      'What would you do even if you weren\'t paid for it?',
      'What makes you feel energized and excited?'
    ]
  },
  {
    id: 'skills',
    title: 'What You\'re Good At',
    description: 'Identify your natural talents and developed abilities',
    emoji: '⭐',
    points: 100,
    questions: [
      'What skills come naturally to you?',
      'What do others often compliment you on?',
      'What achievements are you most proud of?',
      'What problems do you solve easily that others find difficult?'
    ]
  },
  {
    id: 'mission',
    title: 'What the World Needs',
    description: 'Explore how you can contribute to society',
    emoji: '🌍',
    points: 100,
    questions: [
      'What social issues do you care about most?',
      'How would you like to make the world better?',
      'What problems do you see that need solving?',
      'How could you help others with your skills?'
    ]
  },
  {
    id: 'vocation',
    title: 'What You Can Be Paid For',
    description: 'Find ways to make your passion profitable',
    emoji: '💰',
    points: 100,
    questions: [
      'What services or products would people pay for?',
      'What skills of yours are in demand?',
      'What industry needs your unique combination of skills?',
      'What work would you enjoy that also provides value to others?'
    ]
  }
];

export default function IkigaiAssessment({ onComplete }: IkigaiAssessmentProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Discover Your Ikigai</h1>
        <p className="text-gray-600">
          Answer these questions to find the intersection of what you love, what you're good at,
          what the world needs, and what you can be paid for.
        </p>
      </div>
      
      <EnhancedIkigaiQuiz onComplete={onComplete} />
    </div>
  );
}
