'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Answer {
  question: string;
  answer: string;
}

interface AssessmentData {
  [key: string]: Answer[];
}

const sections = [
  {
    id: 'passion',
    title: 'What You Love',
    description: 'Discover activities that bring you joy and fulfillment',
    emoji: '❤️',
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
    questions: [
      'What services or products would people pay for?',
      'What skills of yours are in demand?',
      'What industry needs your unique combination of skills?',
      'What work would you enjoy that also provides value to others?'
    ]
  }
];

export default function IkigaiAssessment({ onComplete }: { onComplete: (data: AssessmentData) => void }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<AssessmentData>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAnswer = (answer: string) => {
    setIsAnimating(true);
    const sectionId = sections[currentSection].id;
    const currentQuestionText = sections[currentSection].questions[currentQuestion];
    const updatedAnswers = {
      ...answers,
      [sectionId]: [...(answers[sectionId] || []), { question: currentQuestionText, answer }]
    };
    setAnswers(updatedAnswers);

    setTimeout(() => {
      if (currentQuestion < sections[currentSection].questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
        setCurrentQuestion(0);
      } else {
        const handleComplete = (data: AssessmentData) => {
          onComplete(data);
        };
        handleComplete(updatedAnswers);
      }
      setIsAnimating(false);
    }, 500);
  };

  const progress = ((currentSection * sections[0].questions.length + currentQuestion + 1) /
    (sections.length * sections[0].questions.length)) * 100;

  const currentSectionData = sections[currentSection];
  const currentQuestionText = currentSectionData.questions[currentQuestion];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="text-4xl mb-2">{currentSectionData.emoji}</div>
        <h2 className="text-2xl font-bold mb-2">{currentSectionData.title}</h2>
        <p className="text-muted-foreground">{currentSectionData.description}</p>
      </div>

      <Progress value={progress} className="w-full" />

      <Card className={`p-6 transition-opacity duration-300 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-center mb-6">
            {currentQuestionText}
          </h3>
          <input
            type="text"
            placeholder="Type your answer here..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                handleAnswer((e.target as HTMLInputElement).value.trim());
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
          <div className="text-center text-sm text-muted-foreground">
            Press Enter to continue
          </div>
        </div>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        Question {currentSection * sections[0].questions.length + currentQuestion + 1} of{" "}
        {sections.length * sections[0].questions.length}
      </div>
    </div>
  );
}
