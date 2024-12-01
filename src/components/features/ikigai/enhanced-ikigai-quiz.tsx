'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface QuizQuestion {
  id: string;
  text: string;
  type: 'slider' | 'multiChoice' | 'text' | 'select' | 'reflection';
  category: 'passion' | 'profession' | 'mission' | 'vocation';
  options?: string[];
  nextQuestion?: (answer: string | number) => string;
  reflectionPrompt?: string;
}

interface Answer {
  questionId: string;
  answer: string | number;
  category: string;
}

interface IkigaiAssessmentResults {
  passion: number;
  mission: number;
  profession: number;
  vocation: number;
}

interface EnhancedIkigaiQuizProps {
  onComplete: (results: IkigaiAssessmentResults) => void;
}

const questions: QuizQuestion[] = [
  // Passion Section
  {
    id: 'passion_1',
    text: 'What activities make you lose track of time?',
    type: 'multiChoice',
    category: 'passion',
    options: [
      'Creating Art or Music',
      'Writing or Storytelling',
      'Problem Solving',
      'Teaching Others',
      'Building Things',
      'Physical Activities',
      'Research and Analysis',
      'Other (describe below)'
    ],
    nextQuestion: (answer) => answer === 'Other (describe below)' ? 'passion_1_detail' : 'passion_2',
  },
  {
    id: 'passion_1_detail',
    text: 'Tell us more about what activities make you lose track of time.',
    type: 'text',
    category: 'passion',
    nextQuestion: () => 'passion_2',
  },
  {
    id: 'passion_2',
    text: 'If money weren\'t an issue, what would you spend your time doing?',
    type: 'reflection',
    category: 'passion',
    reflectionPrompt: 'Take a moment to imagine a life without financial constraints. What activities would fill your days? What dreams would you pursue?',
    nextQuestion: (_answer: string | number) => 'profession_1',
  },
  
  // Profession Section
  {
    id: 'profession_1',
    text: 'What skills do you feel most confident in?',
    type: 'multiChoice',
    category: 'profession',
    options: [
      'Technical & Programming',
      'Creative & Design',
      'Communication & Writing',
      'Leadership & Management',
      'Analysis & Research',
      'Teaching & Mentoring',
      'Problem Solving',
      'Other'
    ],
    nextQuestion: (_answer) => 'profession_2',
  },
  {
    id: 'profession_2',
    text: 'Write about a time you received recognition or felt proud of your work—what skills were you using?',
    type: 'reflection',
    category: 'profession',
    reflectionPrompt: 'Think about a specific moment when others acknowledged your expertise or when you felt particularly accomplished. What were you doing? What made it special?',
    nextQuestion: (_answer) => 'mission_1',
  },
  
  // Mission Section
  {
    id: 'mission_1',
    text: 'What global or local problems do you care about the most?',
    type: 'multiChoice',
    category: 'mission',
    options: [
      'Education & Learning',
      'Environment & Sustainability',
      'Health & Wellness',
      'Social Justice & Equality',
      'Technology & Innovation',
      'Mental Health & Well-being',
      'Community Development',
      'Other'
    ],
    nextQuestion: (_answer) => 'mission_2',
  },
  {
    id: 'mission_2',
    text: 'How would you like to contribute to solving these problems?',
    type: 'reflection',
    category: 'mission',
    reflectionPrompt: 'Imagine you had all the resources needed to make a difference. How would you approach solving these problems? What unique perspective or skills could you bring?',
  },
  
  // Vocation Section
  {
    id: 'vocation_1',
    text: 'What career paths interest you the most?',
    type: 'multiChoice',
    category: 'vocation',
    options: [
      'Technology & Software',
      'Arts & Creative Fields',
      'Education & Training',
      'Business & Entrepreneurship',
      'Healthcare & Wellness',
      'Research & Academia',
      'Social Impact & Non-profit',
      'Other'
    ],
    nextQuestion: (_answer) => 'vocation_2',
  },
  {
    id: 'vocation_2',
    text: 'What aspects of work bring you the most satisfaction?',
    type: 'slider',
    category: 'vocation',
    options: [
      'Creative Freedom',
      'Problem Solving',
      'Helping Others',
      'Learning New Things',
      'Leading Teams',
      'Building Solutions'
    ],
  },
  {
    id: 'vocation_3',
    text: 'Describe your ideal work environment and the type of impact you\'d like to make.',
    type: 'reflection',
    category: 'vocation',
    reflectionPrompt: 'Consider both the physical environment and the nature of your work. What does your perfect workday look like? What kind of legacy would you like to leave?',
  }
];

export function EnhancedIkigaiQuiz({ onComplete }: EnhancedIkigaiQuizProps) {
  const [currentQuestionId, setCurrentQuestionId] = useState(questions[0].id);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [progress, setProgress] = useState(0);
  const [reflection, setReflection] = useState('');
  const [sliderValues, setSliderValues] = useState<{ [key: string]: number }>({});

  const currentQuestion = questions.find(q => q.id === currentQuestionId);

  const handleAnswer = (answer: string | number) => {
    // Save the answer
    setAnswers(prev => [...prev, {
      questionId: currentQuestionId,
      answer,
      category: currentQuestion!.category,
    }]);

    // Reset reflection text if needed
    if (currentQuestion?.type === 'reflection') {
      setReflection('');
    }

    // Handle branching logic
    if (currentQuestion?.nextQuestion) {
      const nextId = currentQuestion.nextQuestion(answer);
      setCurrentQuestionId(nextId);
    } else {
      // Find next question in sequence
      const currentIndex = questions.findIndex(q => q.id === currentQuestionId);
      if (currentIndex < questions.length - 1) {
        setCurrentQuestionId(questions[currentIndex + 1].id);
      } else {
        // Quiz completed
        const results = processResults();
        onComplete(results);
      }
    }

    setProgress((answers.length + 1) / questions.length * 100);
  };

  const processResults = () => {
    const categorizedResults: { [key: string]: (string | number)[] } = {
      passion: [],
      profession: [],
      mission: [],
      vocation: [],
    };

    answers.forEach(answer => {
      categorizedResults[answer.category].push(answer.answer);
    });

    // Calculate average scores for each category
    const results: IkigaiAssessmentResults = {
      passion: calculateCategoryScore(categorizedResults.passion),
      mission: calculateCategoryScore(categorizedResults.mission),
      profession: calculateCategoryScore(categorizedResults.profession),
      vocation: calculateCategoryScore(categorizedResults.vocation),
    };

    return results;
  };

  const calculateCategoryScore = (answers: (string | number)[]) => {
    const numericAnswers = answers.map(answer => {
      if (typeof answer === 'number') {
        return answer;
      }
      // For text/reflection answers, assign a default score (e.g., 75 for detailed responses)
      return answer.length > 100 ? 75 : 50;
    });

    return numericAnswers.length > 0
      ? Math.round(numericAnswers.reduce((a, b) => a + b, 0) / numericAnswers.length)
      : 0;
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'slider':
        return (
          <div className="w-full space-y-4">
            {currentQuestion.options?.map((option) => (
              <div key={option} className="space-y-2">
                <label className="text-sm font-medium">{option}</label>
                <Slider
                  defaultValue={[sliderValues[option] || 50]}
                  max={100}
                  step={1}
                  onValueChange={(value) => {
                    setSliderValues(prev => ({
                      ...prev,
                      [option]: value[0]
                    }));
                  }}
                />
              </div>
            ))}
            <Button 
              onClick={() => {
                // Calculate the average of all slider values
                const averageValue = Object.values(sliderValues).reduce((a, b) => a + b, 0) / Object.values(sliderValues).length;
                handleAnswer(averageValue);
              }}
              className="w-full mt-4"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      case 'multiChoice':
        return (
          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options?.map((option) => (
              <Button
                key={option}
                variant="outline"
                onClick={() => handleAnswer(option)}
                className="h-auto py-4 text-left"
              >
                {option}
              </Button>
            ))}
          </div>
        );

      case 'reflection':
        return (
          <div className="space-y-4">
            {currentQuestion.reflectionPrompt && (
              <p className="text-muted-foreground italic">
                {currentQuestion.reflectionPrompt}
              </p>
            )}
            <Textarea
              placeholder="Take your time to reflect and write your thoughts..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="min-h-[200px]"
            />
            <Button 
              onClick={() => handleAnswer(reflection)}
              disabled={!reflection.trim()}
              className="w-full"
            >
              Save Reflection <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <Textarea
              placeholder="Type your answer here..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="min-h-[100px]"
            />
            <Button 
              onClick={() => handleAnswer(reflection)}
              disabled={!reflection.trim()}
              className="w-full"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
    }
  };

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-500 text-right">{Math.round(progress)}% complete</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold">{currentQuestion?.text}</h2>
            {renderQuestion()}
          </motion.div>
        </AnimatePresence>
      </div>
    </Card>
  );
}
