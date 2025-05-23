import axios from 'axios';
import { Question, Community } from '../types/types';

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Uses the Gemini LLM to determine the most appropriate community for a given question.
 * If no suitable match is found, it returns "Uncategorized".
 *
 * @param question - The question to categorize, including its title and text.
 * @param communities - A list of available communities with their names and descriptions.
 * @returns {Promise<string>} - The name of the best-matching community, or "Uncategorized".
 */
const assignCommunityFromLLM = async (
  question: Question,
  communities: Community[],
): Promise<string> => {
  const communityList = communities.map(c => `- ${c.name}: ${c.about}`).join('\n');

  const prompt = `You are an expert at categorizing Stack Overflow questions into appropriate communities. 
Given a question and a list of communities with descriptions, return ONLY the name of the most appropriate community (no extra text).

If none of the communities are a good fit for the question, return "Uncategorized".

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

    const llmText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    return llmText.trim();
  } catch (error) {
    throw new Error('Failed to assign community from LLM');
  }
};

export default assignCommunityFromLLM;
