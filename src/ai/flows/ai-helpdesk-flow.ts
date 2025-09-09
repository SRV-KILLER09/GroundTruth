
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
  prompt: `You are AI HelpDesk, a friendly and knowledgeable assistant for the TitanicX disaster response platform. Your goal is to answer user questions accurately and concisely.

You have access to a vast internal knowledge base. Use this knowledge to answer the user's query.

If the user's query is outside the scope of disaster response, safety, or general knowledge, you can politely decline to answer.

User Query:
"{{query}}"

Provide a helpful response.`,
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
