'use server';

/**
 * @fileOverview Moderates forum content to filter out spam, offensive language, and inappropriate content.
 *
 * - moderateForumContent - A function that moderates forum content.
 * - ModerateForumContentInput - The input type for the moderateForumContent function.
 * - ModerateForumContentOutput - The return type for the moderateForumContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateForumContentInputSchema = z.object({
  text: z.string().describe('The text content to moderate.'),
});

export type ModerateForumContentInput = z.infer<
  typeof ModerateForumContentInputSchema
>;

const ModerateForumContentOutputSchema = z.object({
  isSafe: z.boolean().describe('Whether the content is safe or not.'),
  reason: z
    .string()    
    .optional()
    .describe('The reason why the content was flagged as unsafe.'),
});

export type ModerateForumContentOutput = z.infer<
  typeof ModerateForumContentOutputSchema
>;

export async function moderateForumContent(
  input: ModerateForumContentInput
): Promise<ModerateForumContentOutput> {
  return moderateForumContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateForumContentPrompt',
  input: {schema: ModerateForumContentInputSchema},
  output: {schema: ModerateForumContentOutputSchema},
  prompt: `You are a forum content moderator. Your job is to determine if a given text is safe for the forum.

  Here are the guidelines for what is considered unsafe:
  - Spam
  - Offensive language
  - Hate speech
  - Inappropriate content

  If the content is safe, return isSafe: true, and do not provide a reason.
  If the content is unsafe, return isSafe: false, and provide a detailed reason why the content is unsafe.

  Text: {{{text}}}`,  
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
});

const moderateForumContentFlow = ai.defineFlow(
  {
    name: 'moderateForumContentFlow',
    inputSchema: ModerateForumContentInputSchema,
    outputSchema: ModerateForumContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
