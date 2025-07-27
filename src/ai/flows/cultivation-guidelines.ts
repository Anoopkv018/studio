// CultivationGuidelines.ts
'use server';

/**
 * @fileOverview Generates a week-by-week cultivation plan in Kannada based on user inputs.
 *
 * - generateCultivationPlan - A function that generates the cultivation plan.
 * - CultivationPlanInput - The input type for the generateCultivationPlan function.
 * - CultivationPlanOutput - The return type for the generateCultivationPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CultivationPlanInputSchema = z.object({
  cropName: z.string().describe('The name of the crop.'),
  taluk: z.string().describe('The taluk (region) where the farming is taking place.'),
  hectares: z.number().describe('The size of the farm in hectares.'),
  cultivationDate: z.date().describe('The date when cultivation starts.'),
});
export type CultivationPlanInput = z.infer<typeof CultivationPlanInputSchema>;

const CultivationPlanOutputSchema = z.object({
  estimatedYieldDate: z.string().describe('The estimated date of yield/harvest in "YYYY-MM-DD" format.'),
  estimatedPrice: z.string().describe('The estimated average market price per quintal around the time of yield.'),
  cultivationPlan: z.string().describe('A week-by-week cultivation plan in Kannada.'),
});
export type CultivationPlanOutput = z.infer<typeof CultivationPlanOutputSchema>;

export async function generateCultivationPlan(input: CultivationPlanInput): Promise<CultivationPlanOutput> {
  return cultivationPlanFlow(input);
}

const cultivationPlanPrompt = ai.definePrompt({
  name: 'cultivationPlanPrompt',
  input: {schema: CultivationPlanInputSchema},
  output: {schema: CultivationPlanOutputSchema},
  prompt: `You are an expert agriculture advisor for farmers in Karnataka, India. You respond in Kannada.

Generate a week-by-week cultivation plan for the following crop, taluk, and farm size. Also, predict the yield date and the estimated market price at that time.

Crop Name: {{{cropName}}}
Taluk: {{{taluk}}}
Hectares: {{{hectares}}}
Cultivation Start Date: {{{cultivationDate}}}

1.  **Estimated Yield Date**: Based on the crop and start date, calculate the likely harvest date.
2.  **Estimated Price**: Based on historical data and market trends, estimate the average price per quintal for the crop around the harvest date.
3.  **Cultivation Plan**: Provide a detailed week-by-week plan from sowing to harvest.`,
});

const cultivationPlanFlow = ai.defineFlow(
  {
    name: 'cultivationPlanFlow',
    inputSchema: CultivationPlanInputSchema,
    outputSchema: CultivationPlanOutputSchema,
  },
  async input => {
    const {output} = await cultivationPlanPrompt(input);
    return output!;
  }
);
