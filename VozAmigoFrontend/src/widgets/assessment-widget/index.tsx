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

const getQuestionFromGemini = async (userData) => {
  // Replace with actual API call to Gemini
  const response = await fetch('/api/gemini/questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const questionData = await response.json();
  return questionData;
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

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userResponses, setUserResponses] = useState([]);

// Call this function whenever you need to get the next question
const fetchNextQuestion = async () => {
  const nextQuestionData = await getQuestionFromGemini({ previousResponses: userResponses });
  setCurrentQuestion(nextQuestionData);
};

// Call this function when the user submits an answer
const handleAnswer = (answer) => {
  // Store the user's response
  setUserResponses([...userResponses, answer]);
  // Then fetch the next question
  fetchNextQuestion();
};

useEffect(() => {
  // Fetch the initial question
  fetchNextQuestion();
}, []);

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



