'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/answer-user-questions-with-ai-chatbot.ts';
import '@/ai/flows/moderate-forum-content.ts';
import '@/ai/flows/generate-solar-recommendations.ts';
import '@/ai/flows/analyze-rooftop-photos.ts';
import '@/ai/flows/generate-feasibility-report.ts';
import '@/ai/flows/suggest-subsidies.ts';
import '@/ai/flows/answer-subsidy-questions.ts';
