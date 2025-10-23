'use server';

/**
 * @fileOverview Suggests relevant solar subsidies based on user context.
 *
 * - suggestSubsidies - A function that suggests subsidies.
 * - SuggestSubsidiesInput - The input type for the suggestSubsidies function.
 * - SuggestSubsidiesOutput - The return type for the suggestSubsidies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const SuggestSubsidiesInputSchema = z.object({
  location: z.string().describe('The state or region of the user (e.g., Tamil Nadu).'),
  propertyType: z.enum(['home', 'land']).describe('The type of property.'),
  systemSizeKW: z.number().describe('The recommended solar system size in kW.'),
});
export type SuggestSubsidiesInput = z.infer<typeof SuggestSubsidiesInputSchema>;

const SubsidySchema = z.object({
    name: z.string().describe("The official name of the subsidy or scheme."),
    description: z.string().describe("A brief, one or two sentence description of the subsidy and its key benefit."),
    link: z.string().describe("The official URL for the subsidy information."),
    isRecommended: z.boolean().optional().describe("Set to true for only the single most relevant subsidy for the user.")
});

const SuggestSubsidiesOutputSchema = z.object({
  subsidies: z.array(SubsidySchema).describe('An array of suggested subsidies.'),
});
export type SuggestSubsidiesOutput = z.infer<typeof SuggestSubsidiesOutputSchema>;

// Caching the file read to avoid reading from disk on every request in a deployed environment.
let subsidyData = '';
async function getSubsidyData() {
    if (!subsidyData) {
         try {
            const filePath = path.join(process.cwd(), 'subsidies.txt');
            subsidyData = await fs.readFile(filePath, 'utf-8');
        } catch (e) {
            console.error("Failed to read subsidies.txt", e);
            // In a real app, you might want to have a fallback or throw a more specific error.
            subsidyData = "No subsidy data available.";
        }
    }
    return subsidyData;
}


export async function suggestSubsidies(input: SuggestSubsidiesInput): Promise<SuggestSubsidiesOutput> {
  return suggestSubsidiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSubsidiesPrompt',
  input: {schema: z.object({
      location: z.string(),
      propertyType: z.enum(['home', 'land']),
      systemSizeKW: z.number(),
      subsidyData: z.string(),
  })},
  output: {schema: SuggestSubsidiesOutputSchema, format: 'json'},
  prompt: `You are an expert financial advisor for solar energy projects in India.
Your task is to analyze the provided document containing information about various subsidies and suggest the most relevant ones to the user based on their specific context.

**Subsidy Information Document:**
---
{{{subsidyData}}}
---

**User's Context:**
*   **Location:** {{{location}}}
*   **Property Type:** {{{propertyType}}}
*   **Proposed System Size:** {{{systemSizeKW}}} kW

**Instructions:**
1.  Carefully read the subsidy document.
2.  Based *only* on the information in the document and the user's context, identify the most applicable government subsidies and bank loans.
3.  For a 'home' property type, focus on residential and domestic schemes. For bank loans, identify which ones are available.
4.  Consider the system size. For example, if the system is 2 kW, the "PM Surya Ghar" scheme is highly relevant.
5.  Extract the official name, a brief description, and the informational link for each relevant subsidy and bank loan.
6.  From the list of relevant subsidies, identify the *single best* and most applicable one for the user. For that single subsidy, set the \`isRecommended\` flag to \`true\`. For all other subsidies, omit this flag or set it to false.
7.  Return a list of these subsidies and loans. If no specific subsidies seem to apply, return an empty array.
`,
});

const suggestSubsidiesFlow = ai.defineFlow(
  {
    name: 'suggestSubsidiesFlow',
    inputSchema: SuggestSubsidiesInputSchema,
    outputSchema: SuggestSubsidiesOutputSchema,
  },
  async input => {
    const subsidyData = await getSubsidyData();
    const {output} = await prompt({...input, subsidyData});
    return output!;
  }
);
