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
});
export type CultivationPlanInput = z.infer<typeof CultivationPlanInputSchema>;

const CultivationPlanOutputSchema = z.object({
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

Generate a week-by-week cultivation plan for the following crop, taluk, and farm size. Be as detailed as possible, and provide specific advice for each week. The plan should be optimized for yield and sustainability.

Crop Name: {{{cropName}}}
Taluk: {{{taluk}}}
Hectares: {{{hectares}}}

Cultivation Plan:`,
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
