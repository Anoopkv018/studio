
'use client';

import { useState, type FormEvent, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PlayCircle, Mic, MicOff, Volume2, Search } from 'lucide-react';
import { searchYoutubeVideos } from '@/ai/flows/youtube-video-search';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


type Video = {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    url: string;
    dataAiHint: string;
};

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function YoutubePage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    handleSearch(new Event('submit') as any, true); // Initial search
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'kn-IN'; // Kannada
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event: any) => {
        const recognizedText = event.results[0][0].transcript;
        setQuery(recognizedText);
        stopRecording();
        // Automatically submit search after voice input
        handleSearch(new Event('submit') as any, false, recognizedText);
      };

      recognitionRef.current.onerror = (event: any) => {
        toast({
          title: 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಯಲ್ಲಿ ದೋಷ',
          description: `Error: ${event.error}`,
          variant: 'destructive',
        });
        stopRecording();
      };
      
      recognitionRef.current.onend = () => {
        if(isRecording) stopRecording();
      }

    } else if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
       toast({
        title: 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ',
        description: 'ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಯನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.',
        variant: 'destructive',
      });
    }

    return () => {
        if(recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }
  }, [isRecording, toast]); // Removed handleSearch from dependencies
  
  const startRecording = () => {
    if (recognitionRef.current) {
        setQuery('');
        setIsRecording(true);
        recognitionRef.current.start();
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
    }
  }

  const toggleRecording = () => {
      if(isRecording) {
          stopRecording();
      } else {
          startRecording();
      }
  }

  const handleSearch = async (event: FormEvent, isInitialSearch = false, voiceQuery?: string) => {
    event.preventDefault();
    
    const searchQuery = voiceQuery !== undefined ? voiceQuery : query;

    if (!isInitialSearch && !searchQuery.trim()) {
      toast({ title: 'ಹುಡುಕಾಟ ಪದ ಖಾಲಿಯಾಗಿದೆ', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setVideos([]);
    setAudioUri(null);

    try {
      const response = await searchYoutubeVideos({ query: searchQuery });
      setVideos(response.videos);
      setAudioUri(response.audioUri);
    } catch (e) {
      console.error(e);
      toast({
        title: 'ದೋಷ',
        description: 'ವೀಡಿಯೊಗಳನ್ನು ಹುಡುಕಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <PageHeader
        title="ಕೃಷಿ ಯೂಟ್ಯೂಬ್ ವಿಡಿಯೋಗಳು"
        subtitle="ಕೃಷಿ ತಜ್ಞರಿಂದ ಇತ್ತೀಚಿನ ತಂತ್ರಜ್ಞಾನ, ಸಲಹೆಗಳು ಮತ್ತು ಯಶಸ್ಸಿನ ಕಥೆಗಳನ್ನು ತಿಳಿಯಿರಿ."
      />
      <div className="max-w-xl mx-auto mb-8">
        <form onSubmit={(e) => handleSearch(e)} className="flex gap-2 md:gap-4 items-center">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ಬೆಳೆ ಅಥವಾ ವಿಷಯದ ಬಗ್ಗೆ ಹುಡುಕಿ..."
            className="flex-grow"
            disabled={isLoading || isRecording}
          />
           <Button type="button" size="icon" onClick={toggleRecording} variant={isRecording ? 'destructive' : 'outline'}>
            {isRecording ? <MicOff /> : <Mic />}
            <span className="sr-only">{isRecording ? 'ಧ್ವನಿಮುದ್ರಣ ನಿಲ್ಲಿಸಿ' : 'ಧ್ವನಿಮುದ್ರಣ ಪ್ರಾರಂಭಿಸಿ'}</span>
          </Button>
          <Button type="submit" size="icon" disabled={isLoading || isRecording}>
            <Search/>
            <span className="sr-only">ಹುಡುಕಿ</span>
          </Button>
           {audioUri && (
            <>
                <Button type="button" variant="outline" size="icon" onClick={playAudio}>
                    <Volume2 className="h-5 w-5" />
                </Button>
                <audio ref={audioRef} src={audioUri} className="hidden" />
            </>
           )}
        </form>
         {isRecording && <p className="text-center text-primary font-semibold mt-4 animate-pulse">ಕೇಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ...</p>}
      </div>
      
      {isLoading ? <LoadingSpinner /> : videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map(video => (
            <Card key={video.id} className="overflow-hidden flex flex-col group">
              <CardHeader className="p-0">
                <div className="relative">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    width={600}
                    height={400}
                    className="aspect-video object-cover"
                    data-ai-hint={video.dataAiHint}
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="h-16 w-16 text-white/80"/>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle>{video.title}</CardTitle>
                <CardDescription className="mt-2">{video.description}</CardDescription>
              </CardContent>
              <CardFooter className="p-4">
                 <Button asChild className="w-full">
                    <Link href={video.url} target="_blank">ವಿಡಿಯೋ ವೀಕ್ಷಿಸಿ</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground mt-16">
            <p>ಯಾವುದೇ ವೀಡಿಯೊಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಬೇರೆ ಹುಡುಕಾಟ ಪದವನ್ನು ಪ್ರಯತ್ನಿಸಿ.</p>
        </div>
      )}
    </div>
  );
}
