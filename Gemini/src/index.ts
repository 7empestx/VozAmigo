/*
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

async function generateAssessmentQuestion(): Promise<void> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const prompt = 'Write a prompt for a beginner-level Spanish language assessment question.';

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    console.log('Generated Question:', text);
  } catch (error) {
    console.error('Error generating question:', error);
  }
}

generateAssessmentQuestion();
*/

import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'hello again world!',
        }),
    };
};
