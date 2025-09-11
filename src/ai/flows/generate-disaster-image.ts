
'use server';
/**
 * @fileOverview A flow to generate an image based on a disaster description.
 *
 * - generateDisasterImage - Generates an image from a text prompt.
 * - GenerateDisasterImageInput - The input type for the function.
 * - GenerateDisasterImageOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

const GenerateDisasterImageInputSchema = z.object({
  prompt: z.string().describe('A description of the disaster scene to generate an image for.'),
});
export type GenerateDisasterImageInput = z.infer<typeof GenerateDisasterImageInputSchema>;

const GenerateDisasterImageOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated image as a data URI.'),
});
export type GenerateDisasterImageOutput = z.infer<typeof GenerateDisasterImageOutputSchema>;

export async function generateDisasterImage(input: GenerateDisasterImageInput): Promise<GenerateDisasterImageOutput> {
  return generateDisasterImageFlow(input);
}

const generateDisasterImageFlow = ai.defineFlow(
  {
    name: 'generateDisasterImageFlow',
    inputSchema: GenerateDisasterImageInputSchema,
    outputSchema: GenerateDisasterImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: googleAI.model('imagen-4.0-fast-generate-001'),
      prompt: `Cinematic, photorealistic image of the following disaster scene: ${input.prompt}. Do not include text or people unless specified.`,
      config: {
        aspectRatio: '16:9',
      },
    });

    if (!media.url) {
      throw new Error('Image generation failed to return a data URI.');
    }

    return { imageDataUri: media.url };
  }
);
