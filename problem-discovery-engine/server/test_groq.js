import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const groqKey = process.env.GROQ_API_KEY;

async function testGroq() {
  console.log('Key:', groqKey?.substring(0, 5) + '...');
  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: "llama-3.1-70b-versatile",
      messages: [{ role: "user", content: "Tell me test. Respond with JSON: { 'status': 'ok' }" }],
      response_format: { type: "json_object" }
    }, {
      headers: { 'Authorization': `Bearer ${groqKey}` }
    });
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (e) {
    console.error('Error:', e.response?.data || e.message);
  }
}

testGroq();
