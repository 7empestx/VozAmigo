import React, { useState, useEffect } from "react";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import Box from "@cloudscape-design/components/box";
import { isVisualRefresh } from "./../../common/apply-mode";
import { WidgetConfig } from "../interfaces";
import Button from "@cloudscape-design/components/button";
import body from "../../../../config/body.json";

export const assessmentWidget: WidgetConfig = {
  definition: { defaultRowSpan: 3, defaultColumnSpan: 2 },
  data: {
    icon: "table",
    title: "AssessmentWidget",
    description: "Assessment Widget",
    disableContentPaddings: !isVisualRefresh,
    header: AssessmentWidgetHeader,
    content: AssessmentWidget,
    footer: AssessmentWidgetFooter,
  },
};

const apiKey = process.env.API_KEY as string;

const getQuestionFromGemini = async (userData, config) => {
  console.log(config);
  if (config.envrionment === "local") {
    console.log("Fetching question from local API...");
    const response = await fetch(config.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });

    // const data = JSON.parse(response.body);
    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(
        `API responded with status ${response.status}: ${errorDetails}`,
      );
    }

    const questionData = await response.json();
    const data = JSON.parse(questionData.body);
    return data;
  } else {
    console.log("Fetching question from remote API...");
    const response = await fetch("https://api.grantstarkman.com/question", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(
        `API responded with status ${response.status}: ${errorDetails}`,
      );
    }

    const questionData = await response.json();
    return questionData;
  }
}

function AssessmentWidgetHeader() {
  return <Header>Assessment Widget</Header>;
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
  const [config, setConfig] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userResponses, setUserResponses] = useState([]);

  useEffect(() => {
    // Fetch the environment configuration dynamically
    fetch('/environment.json')
      .then(response => response.json())
      .then(data => {
        setConfig(data);
        console.log("Configuration loaded:", data);
      })
      .catch(error => console.error("Failed to load configuration:", error));
  }, []);

  useEffect(() => {
    if (config) {
      fetchNextQuestion();
    }
  }, [config]); // This effect runs whenever the config changes

  const fetchNextQuestion = async () => {
    if (!config) return;

    try {
      const response = await getQuestionFromGemini({
        previousResponses: userResponses,
      }, config);
      console.log("Received data:", response); // This will log the full response object

      // Parse the JSON string in the body to get the actual data object
      const data = response;
      console.log("Parsed data:", data); // Log the parsed data to ensure it's correct

      const questionPattern =
        /Question:\s*(\*\*)?\s*(.+?)\s*(\*\*)?(?=\n[a-d])/s;
      const optionsPattern =
        /\b([a-d])\)\s+(\*\*)?\s*(.+?)\s*(\*\*)?(?=\n[a-d]|$)/g;

      const questionMatch = questionPattern.exec(data.message);
      const questionText = questionMatch
        ? questionMatch[2].trim()
        : "Couldn't parse the question.";

      const answerOptions = [];
      let match;
      while ((match = optionsPattern.exec(data.message)) !== null) {
        answerOptions.push({
          id: match[1],
          text: match[3].trim(),
        });
      }

      if (!questionMatch || answerOptions.length === 0) {
        console.error("Failed to parse the question or options:", data.message);
        setCurrentQuestion({
          questionText:
            "Failed to parse the question. Please try again or contact support.",
          answerOptions: [],
        });
        return; // Stop further execution if parsing fails
      }

      const questionData = {
        id: Date.now(),
        questionText: questionText,
        answerOptions: answerOptions,
        correctAnswerId: null, // Assuming correct answer handling is done elsewhere
      };

      setCurrentQuestion(questionData);
    } catch (error) {
      console.error("Failed to fetch or parse question:", error);
      setCurrentQuestion({
        questionText:
          "Error fetching or parsing question. Please check the network or contact support.",
        answerOptions: [],
      });
    }
  };

  // Function to handle user's answer and fetch the next question
  const handleAnswer = (questionId, answerId) => {
    setUserResponses([...userResponses, { questionId, answerId }]);
    fetchNextQuestion();
  };

  const renderCurrentQuestion = () => {
    if (!currentQuestion) {
      return <p>Loading question...</p>;
    }

    console.log("Rendering answer options:", currentQuestion.answerOptions); // Debug: log options

    return (
      <div>
        <h2>{currentQuestion.questionText}</h2>
        {currentQuestion.answerOptions.map((answerOption, index) => (
          <Button
            onClick={() => handleAnswer(currentQuestion.id, answerOption.id)}
            key={answerOption.id + index} // Combine id with index to ensure uniqueness
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
