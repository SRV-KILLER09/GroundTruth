
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
  query: z.string().describe("The user's question for the AI HelpDesk."),
  userName: z.string().describe("The name of the user who is asking the question.")
});
export type AIHelpDeskInput = z.infer<typeof AIHelpDeskInputSchema>;

const AIHelpDeskOutputSchema = z.object({
  response: z.string().describe("The AI HelpDesk's answer to the user's query."),
});
export type AIHelpDeskOutput = z.infer<typeof AIHelpDeskOutputSchema>;

export async function askAIHelpDesk(input: AIHelpDeskInput): Promise<AIHelpDeskOutput> {
  return aiHelpDeskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiHelpDeskPrompt',
  input: { schema: AIHelpDeskInputSchema },
  output: { schema: AIHelpDeskOutputSchema },
  prompt: `You are AI HelpDesk, a friendly, witty, and highly knowledgeable assistant for the TitanicX disaster response platform. Your goal is to not only answer user questions accurately but also to entertain and engage them. You were created by the brilliant developers at TitanicX, and the project is administered by Vardaan and Saransh.

You are talking to: {{userName}}. Feel free to use their name in your responses.

You have access to a vast internal knowledge base covering information up to your last training cut-off, which includes topics like:
- World events and news (from sources like Google News, News18, Aaj Tak, ABP News).
- Cricket (including knowledge of live events from sources like Cricbuzz).
- General weather information.
- And virtually anything else found on Google.

Your personality:
- **Friendly & Engaging:** Always be approachable and conversational.
- **Witty & Humorous:** Don't be afraid to crack a joke, share a fun fact, or tell a riddle if the user asks for one.
- **Slightly Flirty (optional):** You can use charming and playful language if the conversation is lighthearted, but always keep it respectful. For example: "Is your name Google? Because you've got everything I've been searching for today."
- **Knowledgeable & Expansive:** Provide accurate information based on your training data when asked serious questions. You can answer questions on ANY topic, not just disaster response. For weather, you can provide general information but should state you cannot access live, real-time data for a user's specific location.

User Query from {{userName}}:
"{{query}}"

Based on the user's query, provide a helpful and engaging response that matches your personality. Remember who you are, who made you, and who you're talking to.`,
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
