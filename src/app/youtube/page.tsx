
'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Mic, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type YouTubeVideo = {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
  };
};

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

export default function YoutubePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'kn-IN';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript;
        setSearchTerm(spokenText);
        handleSearch(null, spokenText); 
      };

      recognitionRef.current.onerror = (event: any) => {
        toast({
          title: 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಯಲ್ಲಿ ದೋಷ',
          description: `Error: ${event.error}`,
          variant: 'destructive',
        });
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [toast]);
  
  const handleSearch = async (e: FormEvent | null, term: string = searchTerm) => {
    e?.preventDefault();
    if (!term.trim()) {
      toast({ title: 'ದಯವಿಟ್ಟು ಹುಡುಕಾಟ ಪದವನ್ನು ನಮೂದಿಸಿ', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setVideos([]);

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${encodeURIComponent(
          term
        )}&type=video&relevanceLanguage=kn&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'Something went wrong');
      }

      const data = await response.json();
      setVideos(data.items || []);

    } catch (error: any) {
      console.error(error);
      toast({
        title: 'ವೀಡಿಯೊಗಳನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        toast({
            title: 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ',
            description: 'ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಯನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.',
            variant: 'destructive',
        });
        return;
      }
      setSearchTerm('');
      setIsRecording(true);
      recognitionRef.current?.start();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <PageHeader
        title="ಕೃಷಿ ಯೂಟ್ಯೂಬ್ ವಿಡಿಯೋಗಳು"
        subtitle="ಕೃಷಿ ತಜ್ಞರಿಂದ ಇತ್ತೀಚಿನ ತಂತ್ರಜ್ಞಾನ, ಸಲಹೆಗಳು ಮತ್ತು ಯಶಸ್ಸಿನ ಕಥೆಗಳನ್ನು ತಿಳಿಯಿರಿ."
      />
      <div className="max-w-xl mx-auto mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 md:gap-4 items-center">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ದಯವಿಟ್ಟು ಬೆಳೆ ಅಥವಾ ಕಾಯಿಲೆಯ ಹೆಸರು ನಮೂದಿಸಿ..."
            className="flex-grow"
            disabled={isLoading || isRecording}
          />
          <Button
            type="button"
            size="icon"
            onClick={toggleRecording}
            variant={isRecording ? 'destructive' : 'outline'}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            <Mic className={cn('h-5 w-5', isRecording && 'text-red-500 animate-pulse')} />
          </Button>
          <Button type="submit" size="icon" disabled={isLoading || isRecording}>
            <Search className="h-5 w-5" />
            <span className="sr-only">ಹುಡುಕಿ</span>
          </Button>
        </form>
         {isRecording && <p className="text-center text-primary font-semibold mt-4 animate-pulse">ಕೇಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ...</p>}
      </div>

      {isLoading && <LoadingSpinner />}

      {!isLoading && videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Card key={video.id.videoId} className="overflow-hidden flex flex-col">
              <div className="aspect-video w-full">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${video.id.videoId}`}
                  title={video.snippet.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-base font-semibold leading-snug">{video.snippet.title}</CardTitle>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && videos.length === 0 && (
        <div className="text-center text-muted-foreground mt-16">
          <p>ಯಾವುದೇ ವಿಡಿಯೋಗಳು ಲಭ್ಯವಿಲ್ಲ</p>
        </div>
      )}
    </div>
  );
}
