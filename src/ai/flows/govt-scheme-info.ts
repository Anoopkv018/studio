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
import wav from 'wav';

const GovtSchemeInfoInputSchema = z.object({
  query: z.string().describe('The search query for government schemes (e.g., "ಸಬ್ಸಿಡಿ", "ವಿಮೆ", "ಮೂಲಧನ ನೆರವು").'),
});
export type GovtSchemeInfoInput = z.infer<typeof GovtSchemeInfoInputSchema>;

const GovtSchemeInfoOutputSchema = z.object({
  summary: z.string().describe('A summary of the relevant government schemes in Kannada, including links to official portals.'),
  audioUri: z.string().describe('Audio URI for the summary in Kannada.'),
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
  output: {schema: z.object({ summary: z.string().describe('A summary of the relevant government schemes in Kannada, including links to official portals.') })},
  tools: [includeLinkTool],
  prompt: `You are an expert on government schemes related to agriculture in Karnataka. A farmer is asking for information about schemes related to the query: {{{query}}}.

  Summarize the relevant schemes in Kannada in bullet points. Include links to official government portals where available. Use the tool to find relevant URLs.  Format all output in Kannada.
  If the user asks about a specific scheme, use the tool to find a link for it.
  `,
});


async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}


const govtSchemeInfoFlow = ai.defineFlow(
  {
    name: 'govtSchemeInfoFlow',
    inputSchema: GovtSchemeInfoInputSchema,
    outputSchema: GovtSchemeInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output?.summary) {
        throw new Error('Could not generate a summary.');
    }

    const ttsResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: output.summary,
    });

    if (!ttsResponse.media) {
      throw new Error('No media returned from TTS.');
    }

    const audioBuffer = Buffer.from(
      ttsResponse.media.url.substring(ttsResponse.media.url.indexOf(',') + 1),
      'base64'
    );
    
    const audioUri = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {
        summary: output.summary,
        audioUri: audioUri,
    };
  }
);
