import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const groqKey = process.env.GROQ_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || 'NO_KEY_PROVIDED');

const callGroq = async (prompt, isArray = true) => {
  if (!groqKey || groqKey.includes('YOUR_')) return null;

  try {
    console.log(`⚡ Groq AI (Llama 70B) is processing...`);
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    }, {
      headers: { 'Authorization': `Bearer ${groqKey}` }
    });

    const text = response.data.choices[0].message.content;
    const json = JSON.parse(text);
    let result = isArray ? (json.clusters || json.data || Object.values(json)[0]) : json;

    // Helper to flatten nested AI structures into strings
    const flatten = (val) => {
      if (typeof val === 'string') return val;
      if (!val) return '';
      if (Array.isArray(val)) return val.join(', ');
      return JSON.stringify(val);
    };

    if (isArray && Array.isArray(result)) {
      return result.map(c => ({
        ...c,
        title: flatten(c.title),
        summary: flatten(c.summary),
        solution: flatten(c.solution),
        techStack: flatten(c.techStack),
        frequency: Number(c.frequency) || 1,
        severity: Number(c.severity) || 5
      }));
    }
    return result;
  } catch (e) {
    console.error(`Groq Logic Error:`, e.message);
    return null;
  }
};

export const processProblems = async (rawData, selectedSources) => {
  // Try Groq first for Clustering if key exists (much faster)
  const groqResult = await callGroq(`
    Analyze exactly ${rawData.length} items from ${selectedSources.join(', ')}. 
    Return a JSON object with a key 'clusters' containing an array of 5 objects.
    Each object keys: title, frequency, severity, summary, solution, techStack.
    Data: ${JSON.stringify(rawData).substring(0, 15000)}
  `, true);

  if (groqResult) return groqResult;

  if (!apiKey || apiKey.includes('YOUR_')) {
    console.error('⚠️ GEMINI_API_KEY is missing or invalid in .env');
    return [];
  }

  // UPDATED FOR 2026: More resilient model list
  const modelsToTry = [
    "gemini-2.5-flash", 
    "gemini-2.0-flash", 
    "gemini-1.5-flash",
    "gemini-pro-latest"
  ];
  
  const prompt = `
    Analyze the following raw data from user-selected sources (${selectedSources.join(', ')}) related to user complaints and pain points.
    Group them into the top 5 distinct "Problem Clusters". 
    Return a JSON array of objects with exactly these keys:
    - title: (Short, catchy name for the problem cluster)
    - frequency: (Number, how many posts/comments mention this specific cluster. MUST BE LESS THAN 100)
    - severity: (Number 1-10)
    - summary: (A brief description of the frustration)
    - solution: (A potential product idea)
    - techStack: (A comma-separated string)

    Important: For the 'frequency', do not use arbitrary large numbers. Base it on the relative occurrence within the provided ${rawData.length} items of sample data.

    Raw Data:
    ${JSON.stringify(rawData).substring(0, 15000)}
  `;

  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 Discovery Attempt using ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      let clusters = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

      const flatten = (val) => {
        if (typeof val === 'string') return val;
        if (!val) return '';
        if (Array.isArray(val)) return val.join(', ');
        return JSON.stringify(val);
      };

      if (Array.isArray(clusters)) {
        return clusters.map(c => ({
          ...c,
          title: flatten(c.title),
          summary: flatten(c.summary),
          solution: flatten(c.solution),
          techStack: flatten(c.techStack),
          frequency: Number(c.frequency) || 1,
          severity: Number(c.severity) || 5
        }));
      }
      return clusters;

    } catch (error) {
      console.error(`❌ Model ${modelName} failed:`, error.message);
      if (error.message.includes('429')) {
        console.warn('⚠️ Quota hit, waiting 3s before next model...');
        await new Promise(r => setTimeout(r, 3000));
      }
      continue;
    }
  }
  return [];
};

export const generateDeepDive = async (cluster) => {
  // Use Groq for deep dives if available
  const groqRes = await callGroq(`
    Deep Dive business/product analysis for: ${cluster.title}
    Details: ${cluster.summary}
    Return JSON with fields: marketOpportunity, competitorAnalysis, mvpBlueprint, technicalFeasibility.
  `, false);
  
  if (groqRes) return groqRes;

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
