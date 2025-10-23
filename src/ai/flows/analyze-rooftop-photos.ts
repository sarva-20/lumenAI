'use server';

/**
 * @fileOverview Analyzes rooftop photos for solar panel suitability.
 *
 * - analyzeRooftopPhoto - A function that handles the rooftop photo analysis process.
 * - AnalyzeRooftopPhotoInput - The input type for the analyzeRooftopPhoto function.
 * - AnalyzeRooftopPhotoOutput - The return type for the analyzeRooftopPhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeRooftopPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the roof, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  polygon: z.string().describe("A space-separated string of lat,lng coordinates for the roof polygon.")
});
export type AnalyzeRooftopPhotoInput = z.infer<typeof AnalyzeRooftopPhotoInputSchema>;

const AnalyzeRooftopPhotoOutputSchema = z.object({
  usableSurfaceArea: z
    .string()
    .describe('The estimated usable surface area of the roof for solar panels in square meters.'),
  potentialObstructions:
    z.string().describe('Identified potential obstructions on the roof (e.g., vents, chimneys, trees).'),
  panelLayoutSketch: z
    .string()
    .describe('A detailed textual description of a suggested solar panel layout on the identified roof area.'),
});
export type AnalyzeRooftopPhotoOutput = z.infer<typeof AnalyzeRooftopPhotoOutputSchema>;

export async function analyzeRooftopPhoto(
  input: AnalyzeRooftopPhotoInput
): Promise<AnalyzeRooftopPhotoOutput> {
  return analyzeRooftopPhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeRooftopPhotoPrompt',
  input: {schema: AnalyzeRooftopPhotoInputSchema},
  output: {schema: AnalyzeRooftopPhotoOutputSchema},
  prompt: `You are an expert in analyzing rooftop satellite images for solar panel suitability.

You will analyze the provided photo. The user has drawn a polygon to outline their roof. The polygon coordinates are: {{{polygon}}}.

Your task is to:
1.  Focus on the area within the drawn polygon in the image.
2.  Estimate the total usable surface area for solar panels within that polygon, in square meters.
3.  Identify any potential obstructions on or near the roof area, such as vents, chimneys, skylights, or shadows from nearby trees and buildings.
4.  Generate a descriptive, hand-drawn-style sketch description for a suggested solar panel layout within the usable area. This should be a textual description, not an image. For example: "A grid of 12 panels, arranged in 2 rows of 6, covering the southern-facing section of the roof, avoiding the chimney on the west side."

Analyze the following photo:
{{media url=photoDataUri}}

Provide your analysis based on the outlined polygon.`,
});

const analyzeRooftopPhotoFlow = ai.defineFlow(
  {
    name: 'analyzeRooftopPhotoFlow',
    inputSchema: AnalyzeRooftopPhotoInputSchema,
    outputSchema: AnalyzeRooftopPhotoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
