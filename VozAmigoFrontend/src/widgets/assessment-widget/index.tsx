import React, { useState, useEffect } from 'react';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import Box from '@cloudscape-design/components/box';
import { isVisualRefresh } from './../../common/apply-mode';
import { WidgetConfig } from '../interfaces';
import Button from '@cloudscape-design/components/button';
import config from '../../../../config/environment.json';

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

const apiKey = process.env.API_KEY as string;

const getQuestionFromGemini = async (userData) => {
  // Replace with actual API call to Gemini
  const response = await fetch('https://api.grantstarkman.com/question', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
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
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userResponses, setUserResponses] = useState([]);

// Function to fetch and parse the next question
const fetchNextQuestion = async () => {
  try {
    const data = await getQuestionFromGemini({ previousResponses: userResponses });

    // Generalized regex to match various response formats
    const questionPattern = /Question:\s*(\*\*)?\s*(.+?)\s*(\*\*)?(?=\n[a-d])/s;
    const optionsPattern = /\b([a-d])\)\s*(\*\*)?\s*(.+?)\s*(\*\*)?(?=\n[a-d]|$)/g;

    // Extract the question text
    const questionMatch = questionPattern.exec(data.message);
    const questionText = questionMatch ? questionMatch[2].trim() : "Couldn't parse the question.";

    // Extract the answer options
    const answerOptions = [];
    let match;
    while ((match = optionsPattern.exec(data.message)) !== null) {
      answerOptions.push({
        id: match[1], // The letter (a, b, c, d) serving as a unique identifier
        text: match[3].trim(), // The text of the answer option
      });
    }

    // Update the currentQuestion state with the parsed data
    const questionData = {
      id: Date.now(), // Generating a unique id for the question
      questionText: questionText,
      answerOptions: answerOptions,
      correctAnswerId: null // Placeholder, as the correct answer isn't provided in the response
    };

    setCurrentQuestion(questionData);
  } catch (error) {
    // Log detailed error for better diagnostics
    console.error('Failed to fetch question:', error);
  }
};

  // Function to handle user's answer and fetch the next question
  const handleAnswer = (questionId, answerId) => {
    setUserResponses([...userResponses, { questionId, answerId }]);
    fetchNextQuestion();
  };

  // Function to render the current question
  const renderCurrentQuestion = () => {
    if (!currentQuestion) {
      return <p>Loading question...</p>;
    }

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

      {/* Footer */}
      <Box textAlign="center">
        <p>Thank you for participating in the assessment.</p>
      </Box>
    </div>
  );
}
