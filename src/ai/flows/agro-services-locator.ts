
'use server';

/**
 * @fileOverview A location-based service finder for agricultural needs.
 * This flow uses a mock tool to simulate fetching data from Google Maps.
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

// Helper function to calculate distance (haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance.toFixed(1); // Return distance in km with one decimal place
};


// Live Google Maps Search Tool
const findServicesTool = ai.defineTool(
  {
    name: 'findNearbyAgroServices',
    description: 'Finds nearby agricultural services like fertilizer shops, seed sellers, etc., using Google Maps data.',
    inputSchema: FindNearbyServicesInputSchema,
    outputSchema: FindNearbyServicesOutputSchema,
  },
  async (input) => {
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error("Google Maps API key is not configured.");
    }

    let location;
    let originLat = input.latitude;
    let originLng = input.longitude;

    // If query is provided, it takes precedence for geocoding the search center.
    if (input.query) {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(input.query)}&key=${GOOGLE_MAPS_API_KEY}`;
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();
      if (geocodeData.status !== 'OK' || !geocodeData.results[0]) {
        return { services: [] }; // Return empty if location not found
      }
      const { lat, lng } = geocodeData.results[0].geometry.location;
      location = `${lat},${lng}`;
      originLat = lat; // Set the origin for distance calculation to the geocoded location
      originLng = lng;
    } else if (input.latitude && input.longitude) {
        location = `${input.latitude},${input.longitude}`;
    } else {
        return { services: [] }; // No location info provided
    }

    const keywords = [
        "fertilizer shop", "seed supplier", "pesticide store",
        "krishi kendra", "tractor repair", "veterinary clinic",
        "agriculture service"
    ].join('|');

    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${input.radius}&keyword=${encodeURIComponent(keywords)}&key=${GOOGLE_MAPS_API_KEY}&language=kn`;

    const placesResponse = await fetch(placesUrl);
    const placesData = await placesResponse.json();

    if (placesData.status !== 'OK') {
      console.error('Google Places API Error:', placesData.error_message || placesData.status);
      return { services: [] };
    }

    const services: AgroService[] = placesData.results.map((place: any) => ({
      name: place.name || 'ಹೆಸರು ಲಭ್ಯವಿಲ್ಲ',
      category: place.types?.[0]?.replace(/_/g, ' ') || 'ಕೃಷಿ ಸೇವೆ',
      address: place.vicinity || 'ವಿಳಾಸ ಲಭ್ಯವಿಲ್ಲ',
      phoneNumber: place.formatted_phone_number, // This requires a separate Details request, will be undefined here.
      distance: (originLat && originLng && place.geometry?.location)
        ? `${calculateDistance(originLat, originLng, place.geometry.location.lat, place.geometry.location.lng)} ಕಿ.ಮೀ`
        : 'ದೂರ ಲಭ್ಯವಿಲ್ಲ',
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.vicinity)}&destination_place_id=${place.place_id}`,
    }));

    return { services };
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

const findNearbyServicesFlow = ai.defineFlow(
  {
    name: 'findNearbyServicesFlow',
    inputSchema: FindNearbyServicesInputSchema,
    outputSchema: FindNearbyServicesOutputSchema,
  },
  async (input) => {
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
);


// Main exported function
export async function findNearbyServices(input: FindNearbyServicesInput): Promise<FindNearbyServicesOutput> {
  return findNearbyServicesFlow(input);
}
