import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

async function generateAssessmentQuestion(): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const prompt = 'Write a prompt for a beginner-level Spanish language assessment question.';

  try {
    console.log('Hello from Lambda!');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    console.log('Generated Question:', text);
    return text; // Return the generated question
  } catch (error) {
    console.error('Error generating question:', error);
    throw error; // Rethrow the error to handle it in the Lambda handler
  }
}

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    const question = await generateAssessmentQuestion(); // Await the result of the question generation
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: question, // Send the generated question as the response
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Adjust this to match your front-end's domain in production
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        error: 'Error generating the question.',
      }),
    };
  }
};
