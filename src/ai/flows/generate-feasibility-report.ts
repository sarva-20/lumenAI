'use server';
/**
 * @fileOverview Generates a comprehensive feasibility report for solar panel installation.
 *
 * - generateFeasibilityReport - A function that generates the feasibility report.
 * - GenerateFeasibilityReportInput - The input type for the generateFeasibilityReport function.
 * - GenerateFeasibilityReportOutput - The return type for the generateFeasibilityReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFeasibilityReportInputSchema = z.object({
  roofAnalysis: z.string().describe('The analysis of the roof, including usable solar surface area and obstacles.'),
  solarRecommendations: z.string().describe('The recommendations for the solar panel system, including size and type.'),
  financialData: z.string().describe('The financial data, including expected cost, ROI, and monthly savings.'),
});
export type GenerateFeasibilityReportInput = z.infer<typeof GenerateFeasibilityReportInputSchema>;

const GenerateFeasibilityReportOutputSchema = z.object({
  report: z.string().describe('The generated feasibility report in a human-readable format.'),
});
export type GenerateFeasibilityReportOutput = z.infer<typeof GenerateFeasibilityReportOutputSchema>;

export async function generateFeasibilityReport(input: GenerateFeasibilityReportInput): Promise<GenerateFeasibilityReportOutput> {
  return generateFeasibilityReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFeasibilityReportPrompt',
  input: {schema: GenerateFeasibilityReportInputSchema},
  output: {schema: GenerateFeasibilityReportOutputSchema},
  prompt: `You are an expert in creating feasibility reports for solar panel installations. Use the following information to create a comprehensive and easy-to-understand report for the homeowner.

Roof Analysis: {{{roofAnalysis}}}
Solar Recommendations: {{{solarRecommendations}}}
Financial Data: {{{financialData}}}

Report:`, // The actual PDF creation is assumed to be handled elsewhere
});

const generateFeasibilityReportFlow = ai.defineFlow(
  {
    name: 'generateFeasibilityReportFlow',
    inputSchema: GenerateFeasibilityReportInputSchema,
    outputSchema: GenerateFeasibilityReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
