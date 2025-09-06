'use server';
/**
 * @fileOverview A flow to summarize disaster updates for emergency services.
 *
 * - summarizeDisasterUpdate - A function that takes a raw disaster update message and generates a concise summary.
 * - SummarizeDisasterUpdateInput - The input type for the function.
 * - SummarizeDisasterUpdateOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SummarizeDisasterUpdateInputSchema = z.object({
  updateMessage: z.string().describe('The raw, user-submitted disaster update message.'),
});
export type SummarizeDisasterUpdateInput = z.infer<typeof SummarizeDisasterUpdateInputSchema>;

const SummarizeDisasterUpdateOutputSchema = z.object({
  summary: z.string().describe('A concise, official summary of the disaster update suitable for emergency responders.'),
});
export type SummarizeDisasterUpdateOutput = z.infer<typeof SummarizeDisasterUpdateOutputSchema>;


export async function summarizeDisasterUpdate(input: SummarizeDisasterUpdateInput): Promise<SummarizeDisasterUpdateOutput> {
    return summarizeDisasterUpdateFlow(input);
}


const prompt = ai.definePrompt({
    name: 'summarizeDisasterUpdatePrompt',
    input: { schema: SummarizeDisasterUpdateInputSchema },
    output: { schema: SummarizeDisasterUpdateOutputSchema },
    prompt: `You are an emergency dispatcher. Your task is to summarize a user-submitted report into a concise, clear, and official alert for emergency services.

Focus on the critical information: what is the event, where is it, and what is the current status. Remove any conversational language.

User Report:
"{{updateMessage}}"

Generate a summary.`,
});

const summarizeDisasterUpdateFlow = ai.defineFlow(
    {
        name: 'summarizeDisasterUpdateFlow',
        inputSchema: SummarizeDisasterUpdateInputSchema,
        outputSchema: SummarizeDisasterUpdateOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
