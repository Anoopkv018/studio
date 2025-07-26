'use server';

/**
 * @fileOverview Searches for YouTube videos related to agriculture and provides a summary with audio.
 *
 * - searchYoutubeVideos - A function that handles searching for YouTube videos.
 * - YoutubeSearchInput - The input type for the searchYoutubeVideos function.
 * - YoutubeSearchOutput - The return type for the searchYoutubeVideos function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const YoutubeSearchInputSchema = z.object({
  query: z.string().describe('The search query for YouTube videos in Kannada.'),
});
export type YoutubeSearchInput = z.infer<typeof YoutubeSearchInputSchema>;

const VideoSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    thumbnail: z.string(),
    url: z.string(),
    dataAiHint: z.string(),
});

const YoutubeSearchOutputSchema = z.object({
    videos: z.array(VideoSchema).describe("A list of relevant YouTube videos."),
    summary: z.string().describe('A summary of the search results in Kannada.'),
    audioUri: z.string().describe('Audio URI for the summary in Kannada.'),
});
export type YoutubeSearchOutput = z.infer<typeof YoutubeSearchOutputSchema>;

// Mock data, in a real application this would come from a YouTube API
const mockVideos = [
  {
    id: '1',
    title: 'ಸಾವಯವ ಕೃಷಿ ಪದ್ಧತಿಗಳು',
    description: 'ನೈಸರ್ಗಿಕವಾಗಿ ಬೆಳೆಯನ್ನು ಬೆಳೆಸುವ ಸುಲಭ ವಿಧಾನಗಳು ಮತ್ತು ತಂತ್ರಗಳು.',
    thumbnail: 'https://placehold.co/600x400.png',
    url: 'https://www.youtube.com',
    dataAiHint: 'organic farming',
  },
  {
    id: '2',
    title: 'ಹನಿ ನೀರಾವರಿ ಅಳವಡಿಸುವುದು ಹೇಗೆ?',
    description: 'ಕಡಿಮೆ ನೀರಿನಲ್ಲಿ ಹೆಚ್ಚು ಇಳುವರಿ ಪಡೆಯಲು ಹನಿ ನೀರಾವರಿ ವ್ಯವಸ್ಥೆಯ ಮಾಹಿತಿ.',
    thumbnail: 'https://placehold.co/600x400.png',
    url: 'https://www.youtube.com',
    dataAiHint: 'drip irrigation',
  },
  {
    id: '3',
    title: 'ರಾಗಿ ಬೆಳೆಯಲ್ಲಿ ಅಧಿಕ ಇಳುವರಿ',
    description: 'ರಾಗಿ ಬೆಳೆಯುವ ರೈತರಿಗಾಗಿ ಅಧಿಕ ಇಳುವರಿ ಪಡೆಯುವ ಕುರಿತು ತಜ್ಞರ ಸಲಹೆಗಳು.',
    thumbnail: 'https://placehold.co/600x400.png',
    url: 'https://www.youtube.com',
    dataAiHint: 'millet farming',
  },
   {
    id: '4',
    title: 'ಟೊಮ್ಯಾಟೊ ಕೃಷಿಯಲ್ಲಿ ರೋಗ ನಿರ್ವಹಣೆ',
    description: 'ಟೊಮ್ಯಾಟೊ ಬೆಳೆಗೆ ಬರುವ ರೋಗಗಳನ್ನು ಗುರುತಿಸುವುದು ಮತ್ತು ಅವುಗಳ ನಿರ್ವಹಣೆ.',
    thumbnail: 'https://placehold.co/600x400.png',
    url: 'https://www.youtube.com',
    dataAiHint: 'tomato plant',
  },
];


const searchTool = ai.defineTool(
  {
    name: 'searchYoutubeTool',
    description: 'Searches for YouTube videos based on a query.',
    inputSchema: z.object({
      query: z.string().describe('The search query.'),
    }),
    outputSchema: z.array(VideoSchema),
  },
  async (input) => {
    // In a real app, you would make an API call to YouTube here.
    // For now, we'll filter the mock data.
    console.log(`Searching for videos with query: ${input.query}`);
    if (!input.query) {
      return mockVideos;
    }
    const lowerCaseQuery = input.query.toLowerCase();
    const filteredVideos = mockVideos.filter(v => 
        v.title.toLowerCase().includes(lowerCaseQuery) || 
        v.description.toLowerCase().includes(lowerCaseQuery)
    );
    return filteredVideos;
  }
);


export async function searchYoutubeVideos(input: YoutubeSearchInput): Promise<YoutubeSearchOutput> {
  return youtubeVideoSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'youtubeSearchPrompt',
  input: {schema: YoutubeSearchInputSchema},
  output: {schema: YoutubeSearchOutputSchema},
  tools: [searchTool],
  prompt: `You are a helpful assistant for farmers. A farmer is searching for YouTube videos about "{{query}}".
  
  1. Use the searchYoutubeTool to find relevant videos for the query "{{query}}".
  2. The tool will return a list of videos. You must pass this list of videos back in the 'videos' field of your response.
  3. Create a short, one-sentence summary in Kannada of the videos you found. For example, "ನಾನು ನಿಮಗಾಗಿ ಸಾವಯವ ಕೃಷಿ ಬಗ್ಗೆ ಕೆಲವು ವೀಡಿಯೊಗಳನ್ನು ಕಂಡುಕೊಂಡಿದ್ದೇನೆ."
  4. Your entire response, including the video list and summary, must be in the specified JSON format. Do not add the audioUri yet.`,
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

const youtubeVideoSearchFlow = ai.defineFlow(
  {
    name: 'youtubeVideoSearchFlow',
    inputSchema: YoutubeSearchInputSchema,
    outputSchema: YoutubeSearchOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("Could not generate a response.");
    }

    const { summary, videos } = output;
    
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
        prompt: summary,
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
      videos: videos || [],
      summary: summary,
      audioUri: audioUri,
    };
  }
);
