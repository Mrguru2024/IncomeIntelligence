import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Define the question and answer structure
interface QuizQuestion {
  id: number;
  text: string;
  options: {
    id: string;
    text: string;
    personalityType: string;
    value: number;
  }[];
}

interface QuizAnswer {
  questionId: number;
  optionId: string;
  personalityType: string;
  value: number;
}

// Define the props for the component
interface SpendingPersonalityQuizProps {
  onComplete: () => void;
}

export default function SpendingPersonalityQuiz({ onComplete }: SpendingPersonalityQuizProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [progress, setProgress] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Fetch quiz questions from the server
  const { data: questions, isLoading: questionsLoading, error: questionsError } = useQuery({
    queryKey: ['/api/spending-personality/questions'],
    queryFn: async () => {
      const res = await fetch('/api/spending-personality/questions');
      if (!res.ok) throw new Error('Failed to fetch quiz questions');
      return res.json();
    }
  });

  // Submit quiz results mutation
  const submitQuizMutation = useMutation<any, Error, { userId: number; answers: QuizAnswer[] }>({
    mutationFn: async (quizData) => {
      const res = await apiRequest('POST', '/api/spending-personality/submit-quiz', quizData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/spending-personality/results'] });
      onComplete();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error submitting quiz',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Calculate progress as the quiz progresses
  useEffect(() => {
    if (questions && questions.length > 0) {
      setProgress(Math.round((currentQuestionIndex / questions.length) * 100));
    }
  }, [currentQuestionIndex, questions]);

  // Handle selecting an option
  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
  };

  // Handle moving to the next question
  const handleNextQuestion = () => {
    if (!selectedOption || !questions) return;

    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswerData = currentQuestion.options.find((option: { id: string }) => option.id === selectedOption);

    if (selectedAnswerData) {
      // Add the answer to our collection
      const newAnswer: QuizAnswer = {
        questionId: currentQuestion.id,
        optionId: selectedOption,
        personalityType: selectedAnswerData.personalityType,
        value: selectedAnswerData.value
      };

      setAnswers([...answers, newAnswer]);
    }

    // If we have more questions, go to the next one
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      // We're done with the quiz, submit the results
      if (user?.id) {
        submitQuizMutation.mutate({
          userId: user.id,
          answers: [...answers, {
            questionId: currentQuestion.id,
            optionId: selectedOption,
            personalityType: selectedAnswerData?.personalityType || '',
            value: selectedAnswerData?.value || 0
          }]
        });
      } else {
        toast({
          title: 'Error',
          description: 'User ID not available. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  // Handle loading state
  if (questionsLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle error state
  if (questionsError || !questions) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-semibold mb-2">Oops! Something went wrong</h3>
        <p className="text-muted-foreground mb-4">
          We couldn't load the personality quiz questions. Please try again later.
        </p>
        <Button onClick={onComplete}>Skip for now</Button>
      </div>
    );
  }

  // If we don't have any questions, show an error
  if (questions.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-semibold mb-2">No questions available</h3>
        <p className="text-muted-foreground mb-4">
          There are no personality quiz questions available at the moment.
        </p>
        <Button onClick={onComplete}>Continue</Button>
      </div>
    );
  }

  // Get the current question
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{progress}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">{currentQuestion.text}</h3>
          
          <RadioGroup 
            value={selectedOption || ''} 
            onValueChange={handleSelectOption}
            className="space-y-3"
          >
            {currentQuestion.options.map((option: { id: string; text: string }) => (
              <div key={option.id} className="flex items-start space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label 
                  htmlFor={option.id} 
                  className="font-normal cursor-pointer"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleNextQuestion} 
          disabled={!selectedOption || submitQuizMutation.isPending}
          className="flex items-center"
        >
          {currentQuestionIndex < questions.length - 1 ? (
            <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
          ) : (
            <>Submit</>
          )}
        </Button>
      </div>
    </div>
  );
}