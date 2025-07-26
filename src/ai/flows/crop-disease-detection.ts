'use server';

/**
 * @fileOverview Detects crop diseases from an image and provides solutions, with audio playback.
 *
 * - detectCropDisease - A function that handles the crop disease detection process.
 * - DetectCropDiseaseInput - The input type for the detectCropDisease function.
 * - DetectCropDiseaseOutput - The return type for the detectCropDisease function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const DetectCropDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectCropDiseaseInput = z.infer<typeof DetectCropDiseaseInputSchema>;

const DetectCropDiseaseOutputSchema = z.object({
  cropName: z.string().describe('The name of the crop.'),
  diseaseName: z.string().describe('The name of the disease detected.'),
  symptoms: z.string().describe('The symptoms of the disease.'),
  solution: z.string().describe('The solution to treat the disease.'),
  prevention: z.string().describe('Preventive measures for the disease.'),
  audioUri: z.string().describe('Audio URI for the response in Kannada.'),
});
export type DetectCropDiseaseOutput = z.infer<typeof DetectCropDiseaseOutputSchema>;

export async function detectCropDisease(input: DetectCropDiseaseInput): Promise<DetectCropDiseaseOutput> {
  return detectCropDiseaseFlow(input);
}

const detectCropDiseasePrompt = ai.definePrompt({
  name: 'detectCropDiseasePrompt',
  input: {schema: DetectCropDiseaseInputSchema},
  output: {schema: DetectCropDiseaseOutputSchema},
  prompt: `You are an expert in plant pathology, specializing in identifying and treating crop diseases. Analyze the image of the plant provided and provide the following information in Kannada:

1.  🌿 ಬೆಳೆ ಹೆಸರು (Crop Name)
2.  🐛 ರೋಗದ ಹೆಸರು (Disease Name)
3.  🧪 ಲಕ್ಷಣಗಳು (Symptoms)
4.  💊 ಪರಿಹಾರ (Solution)
5.  🔒 ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು (Preventive Measures)

Image: {{media url=photoDataUri}}
`,
});

const audioPrompt = ai.definePrompt({
  name: 'audioPrompt',
  input: {schema: z.string()},
  output: {schema: z.string()},
  prompt: `{{{input}}}`,
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

const detectCropDiseaseFlow = ai.defineFlow(
  {
    name: 'detectCropDiseaseFlow',
    inputSchema: DetectCropDiseaseInputSchema,
    outputSchema: DetectCropDiseaseOutputSchema,
  },
  async input => {
    const {output} = await detectCropDiseasePrompt(input);

    const fullTextResponse = `Crop Name: ${output?.cropName}\nDisease Name: ${output?.diseaseName}\nSymptoms: ${output?.symptoms}\nSolution: ${output?.solution}\nPrevention: ${output?.prevention}`;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
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

    let audioUri = null;
    if (media) {
      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );
      audioUri = 'data:audio/wav;base64,' + (await toWav(audioBuffer));
    }


    return {
      cropName: output?.cropName!,
      diseaseName: output?.diseaseName!,
      symptoms: output?.symptoms!,
      solution: output?.solution!,
      prevention: output?.prevention!,
      audioUri: audioUri!,
    };
  }
);
