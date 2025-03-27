import axios from 'axios';
import { Question, Community } from '../types/types';

const API_KEY = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
const API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const assignCommunityFromLLM = async (
  question: Question,
  communities: Community[],
): Promise<string> => {
  const communityList = communities.map(c => `- ${c.name}: ${c.about}`).join('\n');

  const prompt = `You are an expert at categorizing Stack Overflow questions into appropriate communities. 
Given a question and a list of communities with descriptions, return ONLY the name of the most appropriate community (no extra text).

Question:
Title: "${question.title}"
Text: "${question.text}"

Communities:
${communityList}

Community:`;

  try {
    const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    });

    const llmText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return llmText.trim();
  } catch (error) {
    console.error('LLM tagging failed:', error);
    return 'Uncategorized';
  }
};

export default assignCommunityFromLLM;
