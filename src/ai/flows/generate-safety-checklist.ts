
'use server';
/**
 * @fileOverview A flow to generate a safety checklist based on location.
 *
 * - generateSafetyChecklist - Generates a safety checklist and evacuation advice.
 * - GenerateSafetyChecklistInput - The input type for the function.
 * - GenerateSafetyChecklistOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateSafetyChecklistInputSchema = z.object({
  location: z.string().describe('The name of the city or area.'),
});
export type GenerateSafetyChecklistInput = z.infer<typeof GenerateSafetyChecklistInputSchema>;

const GenerateSafetyChecklistOutputSchema = z.object({
  checklist: z.array(z.string()).describe('A list of actionable safety tips.'),
  evacuationRoute: z.string().describe('Brief advice on a primary evacuation route or strategy.'),
});
export type GenerateSafetyChecklistOutput = z.infer<typeof GenerateSafetyChecklistOutputSchema>;

export async function generateSafetyChecklist(input: GenerateSafetyChecklistInput): Promise<GenerateSafetyChecklistOutput> {
  return generateSafetyChecklistFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSafetyChecklistPrompt',
  input: { schema: GenerateSafetyChecklistInputSchema },
  output: { schema: GenerateSafetyChecklistOutputSchema },
  prompt: `You are a disaster preparedness expert. Based on the provided location, identify the 2-3 most likely natural disasters for that region (e.g., Mumbai -> Floods, Cyclones; Delhi -> Earthquakes, Heatwaves).

Create a concise, actionable safety checklist of 4-5 bullet points that covers the most critical preparations for those likely disasters.

Then, provide a brief, one-sentence suggestion for a primary evacuation route or strategy, considering the location's geography.

Location: {{location}}`,
});

const generateSafetyChecklistFlow = ai.defineFlow(
  {
    name: 'generateSafetyChecklistFlow',
    inputSchema: GenerateSafetyChecklistInputSchema,
    outputSchema: GenerateSafetyChecklistOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
