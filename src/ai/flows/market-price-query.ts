
'use server';

/**
 * @fileOverview Retrieves market prices for crops based on user queries in Kannada.
 *
 * - getMarketPrice - A function that handles the process of querying market prices and generating advice.
 * - MarketPriceInput - The input type for the getMarketPrice function.
 * - MarketPriceOutput - The return type for the getMarketPrice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import wav from 'wav';

const MarketPriceInputSchema = z.object({
  query: z.string().describe('The user query in Kannada, e.g., \"ಟೊಮೆಟೋ ಬೆಲೆ ಇಂದು ಎಷ್ಟು?\"'),
});
export type MarketPriceInput = z.infer<typeof MarketPriceInputSchema>;

const MarketPriceOutputSchema = z.object({
  crop: z.string().describe('The crop name.'),
  date: z.string().describe('The date for which the price is being queried.'),
  estimatedPrice: z.string().describe('The estimated price for the crop on the given date.'),
  salesAdvice: z.string().describe('Expert advice on when and how to sell the crop.'),
  expertAdvice: z.string().describe('Additional expert advice related to the crop and market conditions.'),
  audioUri: z.string().describe('Audio URI for the Kannada response.'),
});
export type MarketPriceOutput = z.infer<typeof MarketPriceOutputSchema>;

export async function getMarketPrice(input: MarketPriceInput): Promise<MarketPriceOutput> {
  return marketPriceFlow(input);
}

const marketPricePrompt = ai.definePrompt({
  name: 'marketPricePrompt',
  input: {schema: MarketPriceInputSchema},
  output: {schema: MarketPriceOutputSchema},
  prompt: `You are an agricultural expert providing market prices and advice to farmers in Kannada.

  Based on the user's query, extract the crop and date for which the price is being requested.
  Then, using your knowledge and any available tools, provide the estimated price for the crop on that date, along with expert sales and general advice.

  User Query: {{{query}}}

  Format your response in Kannada, including:
  - 🌿 ಬೆಳೆ (Crop Name)
  - 📅 ದಿನಾಂಕ (Date)
  - 💰 ಇಂದು ಅಂದಾಜು ಬೆಲೆ (Estimated Price Today)
  - 💬 ಮಾರಾಟ ಸಲಹೆ (Sales Advice)
  - 📦 ತಜ್ಞ ಸಲಹೆ (Expert Advice)`,
});

const marketPriceFlow = ai.defineFlow(
  {
    name: 'marketPriceFlow',
    inputSchema: MarketPriceInputSchema,
    outputSchema: MarketPriceOutputSchema,
  },
  async input => {
    const {output} = await marketPricePrompt(input);

    if (!output) {
      throw new Error('No output from marketPricePrompt');
    }

    const fullTextResponse = `ಬೆಳೆ: ${output.crop}, ದಿನಾಂಕ: ${output.date}, ಇಂದು ಅಂದಾಜು ಬೆಲೆ: ${output.estimatedPrice}, ಮಾರಾಟ ಸಲಹೆ: ${output.salesAdvice}, ತಜ್ಞ ಸಲಹೆ: ${output.expertAdvice}`;

    const ttsOutput = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: fullTextResponse,
    });

    if (!ttsOutput.media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      ttsOutput.media.url.substring(ttsOutput.media.url.indexOf(',') + 1),
      'base64'
    );

    const audioUri = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {
        crop: output.crop,
        date: output.date,
        estimatedPrice: output.estimatedPrice,
        salesAdvice: output.salesAdvice,
        expertAdvice: output.expertAdvice,
        audioUri: audioUri,
    };
  }
);

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
