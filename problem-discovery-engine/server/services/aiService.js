import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || 'NO_KEY_PROVIDED');

export const processProblems = async (rawData) => {
  if (!apiKey || apiKey.includes('YOUR_')) {
    console.error('⚠️ GEMINI_API_KEY is missing or invalid in .env');
    return [];
  }

  // UPDATED FOR 2026: Using the latest available Gemini 2.x and 3.x models
  // Discovery: gemini-1.5 is no longer supported/found for this key
  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-pro-latest"];
  
  const prompt = `
    Analyze the following raw data from Reddit related to user complaints and pain points.
    Group them into the top 5 distinct "Problem Clusters".
    Return a JSON array of objects with exactly these keys:
    - title: (Short, catchy name for the problem cluster)
    - frequency: (Number, estimate of how many people are affected)
    - severity: (Number 1-10, based on how much pain it causes)
    - summary: (A brief description of exactly what is frustrating users)
    - solution: (A potential startup/product idea to fix this)
    - techStack: (A comma-separated string of recommended technologies)

    Raw Reddit Data:
    ${JSON.stringify(rawData).substring(0, 15000)}
  `;

  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 Attempting AI clustering with model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        return JSON.parse(text);
      } catch (e) {
        console.error(`AI Parsing failure with ${modelName}:`, e.message);
        continue;
      }
    } catch (error) {
      console.error(`❌ Model ${modelName} failed:`, error.message);
      if (modelName === modelsToTry[modelsToTry.length - 1]) {
        return [];
      }
    }
  }
  return [];
};
