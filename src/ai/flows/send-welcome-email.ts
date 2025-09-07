'use server';
/**
 * @fileOverview A flow to handle sending welcome emails.
 *
 * - sendWelcomeEmail - A function that simulates sending a welcome email to a new user and a notification to the admin.
 * - SendWelcomeEmailInput - The input type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SendWelcomeEmailInputSchema = z.object({
  email: z.string().email().describe('The email address of the new user.'),
  username: z.string().describe('The username of the new user.'),
});
export type SendWelcomeEmailInput = z.infer<typeof SendWelcomeEmailInputSchema>;

export async function sendWelcomeEmail(input: SendWelcomeEmailInput): Promise<void> {
  return sendWelcomeEmailFlow(input);
}

const sendWelcomeEmailFlow = ai.defineFlow(
  {
    name: 'sendWelcomeEmailFlow',
    inputSchema: SendWelcomeEmailInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    const adminEmail = 'vardaansaxena096@gmail.com';

    // In a real application, you would use an email sending service here.
    // For this simulation, we will log the actions to the console.

    console.log(`
      --- SIMULATING EMAIL ---
      To: ${input.email}
      Subject: Welcome to TitanicX!

      Hi ${input.username},

      Welcome to TitanicX! We are thrilled to have you join our community dedicated to disaster response and safety.
      
      You can now log in to your account to view real-time updates, access safety resources, and contribute to community reports.

      Thank you for joining us.

      Best,
      The TitanicX Team
      ------------------------
    `);

    console.log(`
      --- SIMULATING ADMIN NOTIFICATION ---
      To: ${adminEmail}
      Subject: New User Registration

      A new user has registered on TitanicX.

      Username: ${input.username}
      Email: ${input.email}
      
      -----------------------------------
    `);

    // This flow doesn't return anything, so we return void.
  }
);
