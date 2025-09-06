'use server';

/**
 * @fileOverview Summarizes disaster updates for a specific location using the latest information.
 *
 * - summarizeDisasterUpdates - A function that takes a location and returns a summarized overview of the disaster situation there.
 * - SummarizeDisasterUpdatesInput - The input type for the summarizeDisasterUpdates function.
 * - SummarizeDisasterUpdatesOutput - The return type for the summarizeDisasterUpdates function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDisasterUpdatesInputSchema = z.object({
  latitude: z.number().describe('The latitude of the location.'),
  longitude: z.number().describe('The longitude of the location.'),
  disasterType: z.string().describe('The type of disaster (e.g., flood, earthquake, fire).'),
  updates: z.array(z.string()).describe('An array of text-based updates about the disaster.'),
});
export type SummarizeDisasterUpdatesInput = z.infer<typeof SummarizeDisasterUpdatesInputSchema>;

const SummarizeDisasterUpdatesOutputSchema = z.object({
  summary: z.string().describe('A summarized overview of the disaster situation at the specified location.'),
});
export type SummarizeDisasterUpdatesOutput = z.infer<typeof SummarizeDisasterUpdatesOutputSchema>;

export async function summarizeDisasterUpdates(input: SummarizeDisasterUpdatesInput): Promise<SummarizeDisasterUpdatesOutput> {
  return summarizeDisasterUpdatesFlow(input);
}

const summarizeDisasterUpdatesPrompt = ai.definePrompt({
  name: 'summarizeDisasterUpdatesPrompt',
  input: {schema: SummarizeDisasterUpdatesInputSchema},
  output: {schema: SummarizeDisasterUpdatesOutputSchema},
  prompt: `You are an AI assistant helping to summarize disaster updates for a specific location.

  Given the following information about a disaster, create a concise summary of the situation.

  Disaster Type: {{{disasterType}}}
  Location: Latitude {{{latitude}}}, Longitude {{{longitude}}}

  Updates:
  {{#each updates}}
  - {{{this}}}
  {{/each}}

  Summary:`,
});

const summarizeDisasterUpdatesFlow = ai.defineFlow(
  {
    name: 'summarizeDisasterUpdatesFlow',
    inputSchema: SummarizeDisasterUpdatesInputSchema,
    outputSchema: SummarizeDisasterUpdatesOutputSchema,
  },
  async input => {
    const {output} = await summarizeDisasterUpdatesPrompt(input);
    return output!;
  }
);
