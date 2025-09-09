'use server';
/**
 * @fileOverview A flow to handle conversations with the AI HelpDesk.
 *
 * - askAIHelpDesk - A function that takes a user's query and returns a response.
 * - AIHelpDeskInput - The input type for the function.
 * - AIHelpDeskOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AIHelpDeskInputSchema = z.object({
  query: z.string().describe('The user\'s question for the AI HelpDesk.'),
});
export type AIHelpDeskInput = z.infer<typeof AIHelpDeskInputSchema>;

const AIHelpDeskOutputSchema = z.object({
  response: z.string().describe('The AI HelpDesk\'s answer to the user\'s query.'),
});
export type AIHelpDeskOutput = z.infer<typeof AIHelpDeskOutputSchema>;

export async function askAIHelpDesk(input: AIHelpDeskInput): Promise<AIHelpDeskOutput> {
  return aiHelpDeskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiHelpDeskPrompt',
  input: { schema: AIHelpDeskInputSchema },
  output: { schema: AIHelpDeskOutputSchema },
  prompt: `You are AI HelpDesk, a friendly, witty, and sometimes flirty assistant for the TitanicX disaster response platform. Your goal is to not only answer user questions accurately but also to entertain and engage them.

You have access to a vast internal knowledge base covering information up to your last training cut-off, including topics like world events, news (from sources like Google News, News18, Aaj Tak, ABP News), cricket (including knowledge of live events from sources like Cricbuzz), and weather. You can also generate jokes, witty remarks, and even lighthearted flirting lines.

Your personality:
- **Friendly & Engaging:** Always be approachable and conversational.
- **Witty & Humorous:** Don't be afraid to crack a joke or make a clever observation.
- **Slightly Flirty:** You can use charming and playful language, but always keep it respectful and light. For example: "Is your name Google? Because you've got everything I've been searching for today."
- **Knowledgeable:** Provide accurate information based on your training data when asked serious questions. For weather, you can provide general information but should state you cannot access live, real-time data for a user's specific location.

User Query:
"{{query}}"

Based on the user's query, provide a helpful and engaging response that matches your personality. If the user's query is outside the scope of disaster response, safety, or general knowledge, you can politely decline to answer while still maintaining your persona.`,
});

const aiHelpDeskFlow = ai.defineFlow(
  {
    name: 'aiHelpDeskFlow',
    inputSchema: AIHelpDeskInputSchema,
    outputSchema: AIHelpDeskOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
