'use server';

/**
 * @fileOverview Generates solar panel recommendations based on roof analysis and energy consumption data.
 *
 * - generateSolarRecommendations - A function that handles the solar panel recommendation generation.
 * - GenerateSolarRecommendationsInput - The input type for the generateSolarRecommendations function.
 * - GenerateSolarRecommendationsOutput - The return type for the generateSolarRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSolarRecommendationsInputSchema = z.object({
  roofAnalysis: z
    .string()
    .describe('The AI-generated analysis of the roof, including usable solar surface area and obstacles.'),
  energyConsumption: z
    .string()
    .describe('The energy consumption data of the homeowner (e.g., average monthly kWh).'),
  location: z.string().describe('The location (e.g., city, state, or postal code) of the property.'),
  propertyType: z.enum(['home', 'land']).describe("The type of property the installation is for."),
  roofType: z.string().describe("The type of roof (e.g., 'flat', 'sloped-asphalt', 'sloped-tile'). Will be 'n/a' if propertyType is 'land'."),
  installationType: z.string().describe("The desired installation type (e.g., 'rooftop', 'ground-mounted')."),
  panelPreference: z.string().describe("The user's preference for panel type (e.g., 'budget', 'standard', 'premium').")
});
export type GenerateSolarRecommendationsInput = z.infer<
  typeof GenerateSolarRecommendationsInputSchema
>;

const GenerateSolarRecommendationsOutputSchema = z.object({
  systemSize: z.string().describe('The recommended system size in kW, presented as a range (e.g., "1.5 kW - 2.0 kW").'),
  systemType: z
    .enum(['on-grid', 'off-grid', 'hybrid'])
    .describe('The recommended system type.'),
  estimatedCost: z.string().describe('The estimated cost of the system in INR (e.g., "₹1,50,000 - ₹2,00,000").'),
  estimatedSavings: z
    .string()
    .describe('The estimated monthly savings with the solar panel system in INR (e.g., "₹1500 - ₹2000").'),
  roi: z.string().describe('The estimated return on investment (ROI) period (e.g., "5-7 years").'),
});
export type GenerateSolarRecommendationsOutput = z.infer<
  typeof GenerateSolarRecommendationsOutputSchema
>;

export async function generateSolarRecommendations(
  input: GenerateSolarRecommendationsInput
): Promise<GenerateSolarRecommendationsOutput> {
  return generateSolarRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSolarRecommendationsPrompt',
  input: {schema: GenerateSolarRecommendationsInputSchema},
  output: {schema: GenerateSolarRecommendationsOutputSchema},
  prompt: `You are an expert solar panel system advisor.

Based on the user's property analysis, energy consumption, location, and specific preferences, generate a set of optimized solar panel recommendations.

**User-Provided Data:**
*   **Location:** {{{location}}}
*   **Property Type:** {{{propertyType}}}
*   **Area Analysis:** {{{roofAnalysis}}}
*   **Energy Consumption:** {{{energyConsumption}}}
*   **Roof Type:** {{{roofType}}}
*   **Installation Type:** {{{installationType}}}
*   **Panel Preference:** {{{panelPreference}}}

**Your Task:**
1.  **Analyze Context:** Consider all the provided data. The property type ('home' or 'land') is crucial. If it's 'land', the installation will be 'ground-mounted'. If it's 'home', consider the roof type. The panel preference ('budget', 'standard', 'premium') should influence the cost, efficiency, and ROI. A premium system costs more but is more efficient, leading to a potentially faster ROI. A budget system is cheaper but less efficient.
2.  **Calculate System Size:** Use the usable surface area from the 'Area Analysis' to calculate the recommended system size. Follow this rule: **"You can install approximately 1.2 – 1.5 kW of solar panels on a 10 m² rooftop."** Extract the usable area and apply this calculation. The final system size MUST be presented as a range (e.g., "1.2 kW - 1.5 kW").
3.  **Leverage External Knowledge:** Use your knowledge of solar irradiance for the given location, typical costs for different panel tiers, and installation complexities based on roof and installation type to estimate other values.
4.  **Provide Recommendations:** Output the following fields based on your analysis:
    *   **System Size (kW):** The optimal size range calculated in the previous step.
    *   **System Type:** 'on-grid', 'off-grid', 'hybrid'.
    *   **Estimated Cost:** A realistic price range in Indian Rupees (INR).
    *   **Estimated Monthly Savings:** A projected monthly savings range in Indian Rupees (INR).
    *   **ROI:** The estimated return on investment period.
`,
});

const generateSolarRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateSolarRecommendationsFlow',
    inputSchema: GenerateSolarRecommendationsInputSchema,
    outputSchema: GenerateSolarRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
