'use server';

/**
 * @fileOverview A general assistant AI agent for answering farmer questions in Kannada.
 *
 * - askAssistant - A function that handles the question answering process.
 * - AskAssistantInput - The input type for the askAssistant function.
 * - AskAssistantOutput - The return type for the askAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const AskAssistantInputSchema = z.object({
  question: z.string().describe('The question asked by the farmer in Kannada.'),
});
export type AskAssistantInput = z.infer<typeof AskAssistantInputSchema>;

const AskAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the question in Kannada.'),
  audio: z.string().describe('The audio data of the answer in WAV format as a data URI.'),
});
export type AskAssistantOutput = z.infer<typeof AskAssistantOutputSchema>;

export async function askAssistant(input: AskAssistantInput): Promise<AskAssistantOutput> {
  return askAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askAssistantPrompt',
  input: {schema: AskAssistantInputSchema},
  output: {schema: AskAssistantOutputSchema},
  prompt: `Answer the following question from a farmer in Kannada. Be helpful and polite.\n\nQuestion: {{{question}}}`,
});

const askAssistantFlow = ai.defineFlow(
  {
    name: 'askAssistantFlow',
    inputSchema: AskAssistantInputSchema,
    outputSchema: AskAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output?.answer) {
      throw new Error('No answer was generated.');
    }

    const ttsResponse = await ai.generate({
      model: ai.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: output.answer,
    });

    if (!ttsResponse.media) {
      throw new Error('No media returned from TTS.');
    }

    const audioBuffer = Buffer.from(
      ttsResponse.media.url.substring(ttsResponse.media.url.indexOf(',') + 1),
      'base64'
    );

    const audio = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {
      answer: output.answer,
      audio: audio,
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
