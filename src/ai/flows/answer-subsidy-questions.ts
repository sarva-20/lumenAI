'use server';
/**
 * @fileOverview An AI chatbot that answers user questions about solar subsidies.
 *
 * - answerSubsidyQuestion - A function that answers user questions using the chatbot.
 * - AnswerSubsidyQuestionInput - The input type for the answerSubsidyQuestion function.
 * - AnswerSubsidyQuestionOutput - The return type for the answerSubsidyQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const AnswerSubsidyQuestionInputSchema = z.object({
  question: z.string().describe('The user question about solar energy subsidy information.'),
});
export type AnswerSubsidyQuestionInput = z.infer<typeof AnswerSubsidyQuestionInputSchema>;

const AnswerSubsidyQuestionOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the user question.'),
});
export type AnswerSubsidyQuestionOutput = z.infer<typeof AnswerSubsidyQuestionOutputSchema>;

// Caching the file read to avoid reading from disk on every request
let subsidyData = '';
async function getSubsidyData() {
    if (!subsidyData) {
         try {
            const filePath = path.join(process.cwd(), 'WholeSubsidies.txt');
            subsidyData = await fs.readFile(filePath, 'utf-8');
        } catch (e) {
            console.error("Failed to read WholeSubsidies.txt", e);
            subsidyData = "No subsidy data available to answer questions.";
        }
    }
    return subsidyData;
}


export async function answerSubsidyQuestion(input: AnswerSubsidyQuestionInput): Promise<AnswerSubsidyQuestionOutput> {
  return answerSubsidyQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerSubsidyQuestionPrompt',
  input: {schema: z.object({ question: z.string(), subsidyData: z.string() })},
  output: {schema: AnswerSubsidyQuestionOutputSchema},
  prompt: `You are a helpful AI chatbot that answers user questions about solar subsidies in India.
  
  Use the provided document as your primary source of information. Do not use external knowledge.

  Subsidy Information Document:
  ---
  {{{subsidyData}}}
  ---

  Question: {{{question}}}

  Answer:`,
});

const answerSubsidyQuestionFlow = ai.defineFlow(
  {
    name: 'answerSubsidyQuestionFlow',
    inputSchema: AnswerSubsidyQuestionInputSchema,
    outputSchema: AnswerSubsidyQuestionOutputSchema,
  },
  async ({ question }) => {
    const subsidyData = await getSubsidyData();
    const {output} = await prompt({ question, subsidyData });
    return output!;
  }
);
