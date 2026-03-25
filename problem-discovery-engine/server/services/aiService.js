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
    - frequency: (Number, based on the provided sample, how many posts/comments mention this specific cluster. MUST BE LESS THAN 100)
    - severity: (Number 1-10, based on how much pain it causes)
    - summary: (A brief description of exactly what is frustrating users)
    - solution: (A potential startup/product idea to fix this)
    - techStack: (A comma-separated string of recommended technologies)

    Important: For the 'frequency', do not use arbitrary large numbers. Base it on the relative occurrence within the provided ${rawData.length} items of sample data.

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

export const generateDeepDive = async (cluster) => {
  if (!apiKey || apiKey.includes('YOUR_')) return null;

  // Broaden the list to bypass model-specific quotas
  const modelsToTry = [
    "gemini-2.5-flash", 
    "gemini-2.0-flash", 
    "gemini-1.5-flash", 
    "gemini-pro-latest"
  ];
  
  const prompt = `
    Conduct a "Deep Dive" business and product analysis for the following startup problem:
    Problem: ${cluster.title}
    Summary: ${cluster.summary}
    Proposed Solution: ${cluster.solution}

    Generate a detailed response in JSON format with exactly these four keys:
    - marketOpportunity: (String - A comprehensive paragraph of market analysis. NO NESTED OBJECTS.)
    - competitorAnalysis: (String - A comprehensive paragraph of competitor breakdown. NO NESTED OBJECTS.)
    - mvpBlueprint: (String - A simple numbered list of 5 steps, e.g. "1. Step one\n2. Step two". NO NESTED OBJECTS.)
    - technicalFeasibility: (String - A comprehensive paragraph of technical roadblocks and solutions. NO NESTED OBJECTS.)

    CRITICAL: All values MUST be simple text strings. Do NOT return arrays or nested objects.
  `;

  for (const modelName of modelsToTry) {
    try {
      console.log(`🧠 Deep Dive with ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean possible MD junk
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return JSON.parse(text);

    } catch (e) {
      console.error(`AI Error (${modelName}):`, e.message);
      if (e.message.includes('429')) {
        console.warn('⚠️ Quota exceeded, waiting 2s before trying next model...');
        await new Promise(r => setTimeout(r, 2000));
      }
      continue;
    }
  }
  return null;
};
