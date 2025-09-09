
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-disaster-updates.ts';
import '@/ai/flows/generate-safety-checklist.ts';
import '@/ai/flows/send-welcome-email.ts';
import '@/ai/flows/generate-disaster-image.ts';

