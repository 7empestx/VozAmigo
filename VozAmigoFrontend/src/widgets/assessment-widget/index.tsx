import React, { useState } from 'react';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import Box from '@cloudscape-design/components/box';
import { isVisualRefresh } from './../../common/apply-mode';
import { WidgetConfig } from '../interfaces';
import Button from '@cloudscape-design/components/button';

interface Question {
  id: number;
  questionText: string;
  answerOptions: { id: number; text: string }[];
  correctAnswerId: number;
}

const exampleQuestions: Question[] = [
  {
    id: 1,
    questionText: 'How do you say "hello" in Spanish?',
    answerOptions: [
      { id: 1, text: 'Hola' },
      { id: 2, text: 'Adiós' },
      { id: 3, text: 'Por favor' },
    ],
    correctAnswerId: 1,
  },
];

export const assessmentWidget: WidgetConfig = {
  definition: { defaultRowSpan: 3, defaultColumnSpan: 2 },
  data: {
    icon: 'table',
    title: 'AssessmentWidget',
    description: 'Assessment Widget',
    disableContentPaddings: !isVisualRefresh,
    header: AssessmentWidgetHeader,
    content: AssessmentWidget,
    footer: AssessmentWidgetFooter,
  },
};

function AssessmentWidgetHeader() {
  return (
    <Header
    >
      Assessment Widget
    </Header>
  );
}

function AssessmentWidgetFooter() {
  return (
    <Box textAlign="center">
      <Link href="#" variant="primary">
        View More
      </Link>
    </Box>
  );
}

export default function AssessmentWidget() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<number, number>>(new Map());

  // Function to record the user's answer and move to the next question
  const handleAnswer = (questionId: number, answerId: number) => {
    setUserAnswers(new Map(userAnswers.set(questionId, answerId)));
    if (currentQuestionIndex < exampleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // The user has completed the assessment
      // Here you could navigate to a results page or display the results inline
    }
  };

  // Function to render the current question
  const renderCurrentQuestion = () => {
    const currentQuestion = exampleQuestions[currentQuestionIndex];
    return (
      <div>
        <h2>{currentQuestion.questionText}</h2>
        {currentQuestion.answerOptions.map((answerOption) => (
          <Button
            onClick={() => handleAnswer(currentQuestion.id, answerOption.id)}
            key={answerOption.id}
          >
            {answerOption.text}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <Header title="Welcome to Your Spanish Journey" />
      <p>Follow the instructions to complete your language level assessment.</p>

      {/* Assessment Area */}
      {renderCurrentQuestion()}

      {/* Placeholder for Learning Style Survey */}
      {/* Placeholder for Results and Analysis */}

      {/* Footer */}
      <Box textAlign="center">
        <p>Thank you for participating in the assessment.</p>
      </Box>
    </div>
  );
}



