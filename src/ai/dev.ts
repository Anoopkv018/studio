import { config } from 'dotenv';
config();

import '@/ai/flows/crop-disease-detection.ts';
import '@/ai/flows/cultivation-guidelines.ts';
import '@/ai/flows/market-price-query.ts';
import '@/ai/flows/govt-scheme-info.ts';
import '@/ai/flows/general-assistant-chat.ts';