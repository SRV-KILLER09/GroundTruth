'use server';
/**
 * @fileOverview A flow to generate an image based on a disaster description.
 *
 * - generateDisasterImage - A function that takes a disaster type and description and returns an image data URI.
 * - GenerateDisasterImageInput - The input type for the function.
 * - GenerateDisasterImageOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

const GenerateDisasterImageInputSchema = z.object({
  disasterType: z.string().describe('The type of the disaster (e.g., Flood, Fire).'),
  description: z.string().describe('A description of the scene.'),
});
export type GenerateDisasterImageInput = z.infer<typeof GenerateDisasterImageInputSchema>;

const GenerateDisasterImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
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
        prompt: `Generate a realistic, newsworthy image of a ${input.disasterType}. The scene should depict the following: ${input.description}. The image should look like it was taken by a person on the scene.`,
    });
    
    if (!media.url) {
        throw new Error('Image generation failed.');
    }

    return {
      imageUrl: media.url,
    };
  }
);
