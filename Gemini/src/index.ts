import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// This function generates a beginner-level Spanish language assessment question
async function generateAssessmentQuestion(): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Write a beginner-level Spanish language assessment question with a clear and distinct question followed by multiple choice answers. Format the question and answers like this:
  Question: [Your question here]
  a) Answer option 1
  b) Answer option 2
  c) Answer option 3
  d) Answer option 4
  The correct answer is: [Your correct answer here]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    console.log("Generated Question:", text);
    return text; // Return the generated question
  } catch (error) {
    console.error("Error generating question:", error);
    throw error; // Rethrow the error to handle it in the Lambda handler
  }
}

// This function is the Lambda handler. It is the main entry point for the Lambda function
export const handler = async (
  event: APIGatewayEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  console.log("Event:", event);
  try {
    const question = await generateAssessmentQuestion(); // Await the result of the question generation
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://alpha.vozamigo.grantstarkman.com",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: question, // Send the generated question as the response
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://alpha.vozamigo.grantstarkman.com",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        error: "Error generating the question.",
      }),
    };
  }
};
