
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-disaster-updates.ts';
import '@/ai/flows/generate-disaster-image.ts';
import '@/ai/flows/generate-safety-checklist.ts';
