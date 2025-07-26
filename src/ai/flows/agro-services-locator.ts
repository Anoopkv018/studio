'use server';

/**
 * @fileOverview A location-based service finder for agricultural needs.
 *
 * - findNearbyServices - A function that finds nearby agro services.
 * - FindNearbyServicesInput - The input type for the findNearbyServices function.
 * - FindNearbyServicesOutput - The return type for the findNearbyServices function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';
import {googleAI} from '@genkit-ai/googleai';

// Input and Output Schemas
const FindNearbyServicesInputSchema = z.object({
  latitude: z.number().optional().describe('The latitude of the user.'),
  longitude: z.number().optional().describe('The longitude of the user.'),
  query: z.string().optional().describe("A text query like 'Mysore' or a pincode."),
  radius: z.number().describe('The search radius in meters.'),
});
export type FindNearbyServicesInput = z.infer<typeof FindNearbyServicesInputSchema>;

const AgroServiceSchema = z.object({
  name: z.string().describe('The name of the service center in Kannada.'),
  category: z.string().describe('The category of the service in Kannada (e.g., ಗೊಬ್ಬರದ ಅಂಗಡಿ, ಬೀಜದ ಅಂಗಡಿ).'),
  address: z.string().describe('The full address in Kannada.'),
  phoneNumber: z.string().optional().describe('The contact phone number.'),
  distance: z.string().describe('The distance from the user in kilometers.'),
  directionsUrl: z.string().url().describe('The Google Maps URL for directions.'),
  audioUri: z.string().optional().describe('A data URI for the audio summary of the service information.'),
});
export type AgroService = z.infer<typeof AgroServiceSchema>;

const FindNearbyServicesOutputSchema = z.object({
  services: z.array(AgroServiceSchema),
});
export type FindNearbyServicesOutput = z.infer<typeof FindNearbyServicesOutputSchema>;

// Mock Search Tool
const findServicesTool = ai.defineTool(
  {
    name: 'findNearbyAgroServices',
    description: 'Finds nearby agricultural services like fertilizer shops, seed sellers, etc., using Google Maps data.',
    inputSchema: FindNearbyServicesInputSchema,
    outputSchema: FindNearbyServicesOutputSchema,
  },
  async (input) => {
    // In a real app, this would use the Google Maps Places API.
    // For now, we return mock data based on the query.
    console.log('Searching for services with input:', input);
    
    // This is a placeholder. You would replace this with a real API call.
    // Ensure the Google Maps API key is stored securely as an environment variable.
    // const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    // if (!GOOGLE_MAPS_API_KEY) {
    //   throw new Error("Google Maps API key is not configured.");
    // }

    return {
      services: [
        {
          name: 'ಶ್ರೀ ಲಕ್ಷ್ಮಿ ಫರ್ಟಿಲೈಸರ್',
          category: 'ರಸಗೊಬ್ಬರ ಅಂಗಡಿ',
          address: 'ಎನ್‌ಹೆಚ್ 275, ಹುಣಸೂರು ರಸ್ತೆ, ಮೈಸೂರು',
          phoneNumber: '08012345678',
          distance: '2.1 ಕಿ.ಮೀ',
          directionsUrl: 'https://maps.google.com',
        },
        {
          name: 'ಕಾವೇರಿ ಸೀಡ್ಸ್',
          category: 'ಬೀಜ ಮಾರಾಟಗಾರರು',
          address: 'ಬಸವೇಶ್ವರ ರಸ್ತೆ, ಮಂಡ್ಯ',
          phoneNumber: '08232987654',
          distance: '4.5 ಕಿ.ಮೀ',
          directionsUrl: 'https://maps.google.com',
        },
        {
          name: 'ಕೃಷಿಕ ಸೇವಾ ಕೇಂದ್ರ',
          category: 'ಸರ್ಕಾರಿ ಕೃಷಿ ಕೇಂದ್ರ',
          address: 'ಜಿಲ್ಲಾಧಿಕಾರಿ ಕಚೇರಿ ಹತ್ತಿರ, ಹಾಸನ',
          phoneNumber: '18004253553',
          distance: '8.2 ಕಿ.ಮೀ',
          directionsUrl: 'https://maps.google.com',
        },
        {
            name: 'ಪಶು ಚಿಕಿತ್ಸಾಲಯ',
            category: 'ಪಶು ವೈದ್ಯಕೀಯ ಕ್ಲಿನಿಕ್',
            address: 'ಗ್ರಾಮಾಂತರ ಪ್ರದೇಶ, ಪಾಂಡವಪುರ',
            distance: '12.0 ಕಿ.ಮೀ',
            directionsUrl: 'https://maps.google.com',
        },
      ],
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
    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));
    writer.write(pcmData);
    writer.end();
  });
}

// Main exported function
export async function findNearbyServices(input: FindNearbyServicesInput): Promise<FindNearbyServicesOutput> {
  const { services } = await findServicesTool(input);

  // Generate audio for each service
  const servicesWithAudio = await Promise.all(
    services.map(async (service) => {
      const infoToSpeak = `
        ಹೆಸರು: ${service.name}.
        ವರ್ಗ: ${service.category}.
        ವಿಳಾಸ: ${service.address}.
        ದೂರ: ${service.distance}.
        ${service.phoneNumber ? `ಫೋನ್ ಸಂಖ್ಯೆ: ${service.phoneNumber}.` : ''}
      `;

      try {
        const { media } = await ai.generate({
          model: googleAI.model('gemini-2.5-flash-preview-tts'),
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Algenib' },
              },
            },
          },
          prompt: infoToSpeak,
        });

        if (media) {
          const audioBuffer = Buffer.from(
            media.url.substring(media.url.indexOf(',') + 1),
            'base64'
          );
          const audioUri = 'data:audio/wav;base64,' + (await toWav(audioBuffer));
          return { ...service, audioUri };
        }
      } catch (e) {
        console.error(`Failed to generate audio for ${service.name}:`, e);
      }

      return service; // Return service without audio URI on error
    })
  );

  return { services: servicesWithAudio };
}
