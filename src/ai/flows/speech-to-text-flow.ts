
'use server';
/**
 * @fileOverview A flow to transcribe audio to text.
 *
 * - transcribeAudio - Transcribes audio data into text.
 * - TranscribeAudioInput - The input type for the function.
 * - TranscribeAudioOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';
import wav from 'wav';

const TranscribeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A short audio clip, as a data URI that must include a MIME type (like 'audio/webm' or 'audio/wav') and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the audio.'),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;

export async function transcribeAudio(
  input: TranscribeAudioInput
): Promise<TranscribeAudioOutput> {
  return speechToTextFlow(input);
}

const speechToTextFlow = ai.defineFlow(
  {
    name: 'speechToTextFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async (input) => {
    const { text } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      prompt: [
        {
          media: {
            url: input.audioDataUri,
          },
        },
        {
          text: 'Transcribe the spoken words in this audio clip. Only return the transcribed text.',
        },
      ],
    });
    return { transcription: text };
  }
);
