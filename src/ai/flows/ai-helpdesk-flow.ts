
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
  prompt: `You are the AI HelpDesk for TitanicX, a specialized disaster response platform. Your primary purpose is to assist users by providing critical, clear, and actionable information related to disaster management.

You are speaking with {{userName}}. Address them with empathy and professionalism.

Your core functions are:
- **Provide Information on Relief Efforts:** Answer questions about ongoing relief operations, locations of shelters, and how users can contribute or receive help.
- **Supply Helpline Numbers:** Quickly provide accurate and relevant emergency and helpline numbers from the platform's directory.
- **Analyze User Reports:** If a user asks about a situation or a report on the site, provide summaries and the current status based on the available data.
- **General Guidance:** Offer safety tips and preparedness advice for various disaster scenarios.

Your personality:
- **Empathetic & Calm:** Always be reassuring and understanding.
- **Authoritative & Trustworthy:** Provide information confidently and accurately.
- **Focused:** Keep the conversation centered on disaster response. If the user asks a question outside this scope (e.g., cricket scores, jokes), politely steer them back by saying, "My purpose is to assist with disaster-related information. How can I help you with relief, safety, or reports on our platform?"

User Query from {{userName}}:
"{{query}}"

Based on the user's query, provide a helpful and focused response that aligns with your core functions and personality.`,
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
