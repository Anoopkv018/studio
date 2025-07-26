'use server';

/**
 * @fileOverview Summarizes government schemes related to agriculture in Kannada.
 *
 * - getGovtSchemeInfo - A function that handles the retrieval and summarization of government scheme information.
 * - GovtSchemeInfoInput - The input type for the getGovtSchemeInfo function.
 * - GovtSchemeInfoOutput - The return type for the getGovtSchemeInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GovtSchemeInfoInputSchema = z.object({
  query: z.string().describe('The search query for government schemes (e.g., "ಸಬ್ಸಿಡಿ", "ವಿಮೆ", "ಮೂಲಧನ ನೆರವು").'),
});
export type GovtSchemeInfoInput = z.infer<typeof GovtSchemeInfoInputSchema>;

const GovtSchemeInfoOutputSchema = z.object({
  summary: z.string().describe('A summary of the relevant government schemes in Kannada, including links to official portals.'),
});
export type GovtSchemeInfoOutput = z.infer<typeof GovtSchemeInfoOutputSchema>;

export async function getGovtSchemeInfo(input: GovtSchemeInfoInput): Promise<GovtSchemeInfoOutput> {
  return govtSchemeInfoFlow(input);
}

const includeLinkTool = ai.defineTool({
  name: 'getRelevantLink',
  description: 'This tool is called to retrieve URL to include in the answer.',
  inputSchema: z.object({
    scheme: z.string().describe('The scheme name.'),
  }),
  outputSchema: z.string().describe('URL to include in the answer'),
},
  async (input) => {
    // TODO: Implement the tool to fetch relevant links.  This is a placeholder.
    console.log("getRelevantLink: asked to include URL for ", input.scheme)
    return "https://example.com/scheme-info";
  }
);

const prompt = ai.definePrompt({
  name: 'govtSchemeInfoPrompt',
  input: {schema: GovtSchemeInfoInputSchema},
  output: {schema: GovtSchemeInfoOutputSchema},
  tools: [includeLinkTool],
  prompt: `You are an expert on government schemes related to agriculture in Karnataka. A farmer is asking for information about schemes related to the query: {{{query}}}.

  Summarize the relevant schemes in Kannada in bullet points. Include links to official government portals where available. Use the tool to find relevant URLs.  Format all output in Kannada.
  If the user asks about a specific scheme, use the tool to find a link for it.
  `,
});

const govtSchemeInfoFlow = ai.defineFlow(
  {
    name: 'govtSchemeInfoFlow',
    inputSchema: GovtSchemeInfoInputSchema,
    outputSchema: GovtSchemeInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
