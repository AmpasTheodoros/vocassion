'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Answer {
  question: string;
  answer: string;
}

interface AssessmentData {
  [key: string]: Answer[];
}

interface IkigaiAssessmentProps {
  onComplete: (data: AssessmentData) => void;
}

const sections = [
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
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<AssessmentData>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [points, setPoints] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [answer, setAnswer] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const currentSectionData = sections[currentSection];
  const progress = ((currentSection * 4 + currentQuestion + 1) / (sections.length * 4)) * 100;

  const handleAnswer = () => {
    if (!answer.trim()) return;

    const sectionId = currentSectionData.id;
    const question = currentSectionData.questions[currentQuestion];
    
    setAnswers(prev => ({
      ...prev,
      [sectionId]: [
        ...(prev[sectionId] || []),
        { question, answer }
      ]
    }));

    // Add points for completing a question
    setPoints(prev => prev + 25);

    if (currentQuestion < currentSectionData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      if (currentSection < sections.length - 1) {
        setCurrentSection(prev => prev + 1);
        setCurrentQuestion(0);
        // Bonus points for completing a section
        setPoints(prev => prev + currentSectionData.points);
        triggerCelebration();
      } else {
        // Final completion
        setShowCelebration(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.5, y: 0.6 }
        });
        onComplete(answers);
      }
    }
    
    // Reset answer and button state
    setAnswer('');
    setIsButtonDisabled(true);
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { x: 0.5, y: 0.6 }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 p-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{currentSectionData.title}</h2>
          <p className="text-muted-foreground">{currentSectionData.description}</p>
        </div>
        <Badge variant="secondary" className="text-lg">
          <Sparkles className="w-4 h-4 mr-2" />
          {points} pts
        </Badge>
      </div>

      <Progress value={progress} className="w-full" />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentSection}-${currentQuestion}`}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="text-xl mb-4">
              {currentSectionData.emoji} {currentSectionData.questions[currentQuestion]}
            </h3>
            <textarea
              className="w-full p-3 rounded-md border min-h-[100px] mb-4"
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) => {
                const value = e.target.value;
                setAnswer(value);
                setIsButtonDisabled(value.trim().length < 10);
              }}
            />
            <Button
              onClick={handleAnswer}
              className={`w-full ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isButtonDisabled}
            >
              Continue
            </Button>
          </Card>
        </motion.div>
      </AnimatePresence>

      {showCelebration && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed inset-0 flex items-center justify-center bg-black/50"
        >
          <Card className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">🎉 Journey Complete!</h2>
            <p className="text-xl mb-4">Youw&apos;ve earned {points} points!</p>
            <p className="text-muted-foreground mb-6">
              Your Ikigai map is being generated...
            </p>
            <Button onClick={() => setShowCelebration(false)}>
              View Your Ikigai Map
            </Button>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
