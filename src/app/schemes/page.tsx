
'use client';

import { useState, type FormEvent, type ReactNode, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getGovtSchemeInfo, type GovtSchemeInfoOutput } from '@/ai/flows/govt-scheme-info';
import { useToast } from '@/hooks/use-toast';
import { Landmark, Mic, MicOff, Phone, Volume2, Globe } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// A simple component to render the scheme info with clickable links and bullet points
const RenderSchemeInfo = ({ content }: { content: string }) => {
  const lines = content.split('\n').filter(line => line.trim() !== '');
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return (
    <div className="space-y-3 text-muted-foreground">
      {lines.map((line, index) => {
        const isListItem = line.trim().startsWith('*') || line.trim().startsWith('-');
        const lineContent = isListItem ? line.trim().substring(1).trim() : line.trim();
        const parts = lineContent.split(urlRegex);

        const renderedLine = parts.map((part, i) =>
          part.match(urlRegex) ? (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {part}
            </a>
          ) : (
            <span key={i}>{part}</span>
          )
        );

        if (isListItem) {
          return (
            <div key={index} className="flex items-start">
              <span className="mr-3 mt-1 text-primary">•</span>
              <p>{renderedLine}</p>
            </div>
          );
        }
        
        return <p key={index}>{renderedLine}</p>;
      })}
    </div>
  );
};


export default function SchemesPage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GovtSchemeInfoOutput | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'kn-IN';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event: any) => {
        const recognizedText = event.results[0][0].transcript;
        setQuery(recognizedText);
        handleSearch(event, recognizedText);
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

    }

    return () => {
        if(recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }
  }, [isRecording, toast]);

  const startRecording = () => {
    if (recognitionRef.current) {
        setQuery('');
        setResult(null);
        setIsRecording(true);
        recognitionRef.current.start();
    } else {
        toast({
            title: 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ',
            description: 'ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಯನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.',
            variant: 'destructive',
        });
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

  const handleSearch = async (event: FormEvent, searchTerm: string = query) => {
    event.preventDefault();
    if (!searchTerm.trim()) {
      toast({
        title: 'ಹುಡುಕಾಟ ಪದ ಖಾಲಿಯಾಗಿದೆ',
        description: 'ದಯವಿಟ್ಟು ಯೋಜನೆಗೆ ಸಂಬಂಧಿಸಿದ ಪದವನ್ನು ನಮೂದಿಸಿ.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await getGovtSchemeInfo({ query: searchTerm });
      setResult(response);
    } catch (e) {
      console.error(e);
      toast({
        title: 'ದೋಷ',
        description: 'ಯೋಜನೆಗಳ ಮಾಹಿತಿ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
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
        title="ಸರ್ಕಾರಿ ಅಭಿವೃದ್ಧಿ ಯೋಜನೆಗಳು"
        subtitle="ಕೃಷಿಗೆ ಸಂಬಂಧಿಸಿದ ಸರ್ಕಾರದ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಹುಡುಕಿ. ಉದಾಹರಣೆಗೆ: ಸಬ್ಸಿಡಿ, ವಿಮೆ, ಕೃಷಿ ಯಂತ್ರೋಪಕರಣ."
      />
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg rounded-lg">
          <CardContent className="p-6">
            <form onSubmit={(e) => handleSearch(e)} className="flex gap-4 items-center">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಇಲ್ಲಿ ಹುಡುಕಿ..."
                className="flex-grow rounded-lg"
                disabled={isLoading || isRecording}
              />
               <Button type="button" size="icon" onClick={toggleRecording} className={cn('rounded-full', isRecording ? 'bg-red-500 hover:bg-red-600' : 'btn-voice')}>
                {isRecording ? <MicOff /> : <Mic />}
                <span className="sr-only">{isRecording ? 'ಧ್ವನಿಮುದ್ರಣ ನಿಲ್ಲಿಸಿ' : 'ಧ್ವನಿಮುದ್ರಣ ಪ್ರಾರಂಭಿಸಿ'}</span>
              </Button>
              <Button type="submit" disabled={isLoading || isRecording || !query.trim()} className="bg-primary-medium text-primary-foreground hover:bg-primary-medium/90 rounded-lg">
                {isLoading ? 'ಹುಡುಕಲಾಗುತ್ತಿದೆ...' : 'ಹುಡುಕಿ'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {(isLoading || isRecording) && <LoadingSpinner className={cn({'hidden': !isLoading})}/>}
        {isRecording && <p className="text-center text-primary font-semibold mt-4 animate-pulse">ಕೇಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ...</p>}

        {result && result.summary && (
          <Card className="mt-6 shadow-lg rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Landmark className="text-primary" /> ಸಂಬಂಧಿತ ಯೋಜನೆಗಳ ಮಾಹಿತಿ
              </CardTitle>
               {result.audioUri && (
                <>
                  <Button variant="outline" size="icon" onClick={playAudio} className="rounded-full">
                    <Volume2 className="h-5 w-5" />
                  </Button>
                  <audio ref={audioRef} src={result.audioUri} className="hidden" />
                </>
              )}
            </CardHeader>
            <CardContent>
              <RenderSchemeInfo content={result.summary} />
            </CardContent>
          </Card>
        )}
        
        <Card className="mt-6 shadow-lg rounded-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                    <Phone className="text-primary" /> ಸಂಪರ್ಕ ಮಾಹಿತಿ
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
                <p>ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ, ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹತ್ತಿರದ ಕೃಷಿ ಇಲಾಖೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ:</p>
                <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-accent" />
                    <span>ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರ: 1800-425-3553</span>
                </div>
                 <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-accent" />
                     <a href="https://raitamitra.karnataka.gov.in/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                        ರೈತ ಮಿತ್ರ ಪೋರ್ಟಲ್
                    </a>
                </div>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
