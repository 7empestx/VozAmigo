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

