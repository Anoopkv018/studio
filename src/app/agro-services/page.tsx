
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Search, Navigation, Mic, MicOff } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';


type Service = {
  name: string;
  type: 'shop' | 'mandi' | 'fertilizer' | 'kendra';
  distance: string;
  address: string;
};

const serviceTypes = {
  shop: 'ಕೃಷಿ ಅಂಗಡಿ',
  mandi: 'ಮಂಡಿ',
  fertilizer: 'ಗೊಬ್ಬರ ಕೇಂದ್ರ',
  kendra: 'ಕೃಷಿ ಕೇಂದ್ರ',
};

const mockServices: Service[] = [
  { name: 'ರೈತ ಮಿತ್ರ ಆಗ್ರೋ', type: 'shop', distance: '2.5 km', address: 'ಮುಖ್ಯ ರಸ್ತೆ, ಮೈಸೂರು' },
  { name: 'APMC ಮಂಡಿ', type: 'mandi', distance: '5 km', address: 'APMC ಯಾರ್ಡ್, ಮಂಡ್ಯ' },
  { name: 'ಕಾವೇರಿ ಗೊಬ್ಬರ ಕೇಂದ್ರ', type: 'fertilizer', distance: '3.1 km', address: 'ಗ್ರಾಮಾಂತರ ಪ್ರದೇಶ, ಶ್ರೀರಂಗಪಟ್ಟಣ' },
  { name: 'ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರ', type: 'kendra', distance: '8 km', address: 'ವಿವಿ ಕ್ಯಾಂಪಸ್, ಬೆಂಗಳೂರು' },
];

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function AgroServicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [radius, setRadius] = useState('10');
  const [location, setLocation] = useState<string | null>(null);
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
        setSearchQuery(spokenText);
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
      setSearchQuery('');
      setIsRecording(true);
      recognitionRef.current?.start();
    }
  };


  const handleDetectLocation = () => {
    setIsLoading(true);
    setSearchQuery('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd use these coords to query an API
          setLocation(`ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಸ್ಥಳ`);
          setIsLoading(false);
          toast({ title: 'ಸ್ಥಳ ಪತ್ತೆಯಾಗಿದೆ!' });
        },
        (error) => {
          toast({
            title: 'ಸ್ಥಳ ಪತ್ತೆ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ',
            description: 'ದಯವಿಟ್ಟು ಬ್ರೌಸರ್ ಅನುಮತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.',
            variant: 'destructive',
          });
          setIsLoading(false);
        }
      );
    } else {
      toast({ title: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಜಿಯೋಲೋಕೇಶನ್ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.', variant: 'destructive' });
      setIsLoading(false);
    }
  };
  
  const handleSearch = () => {
      if(!searchQuery) {
        toast({ title: 'ದಯವಿಟ್ಟು ಸ್ಥಳವನ್ನು ನಮೂದಿಸಿ', variant: 'destructive' });
        return;
      }
      setIsLoading(true);
      setLocation(null);
      // Mock search
      setTimeout(() => {
          setLocation(`"${searchQuery}" ಗಾಗಿ ಫಲಿತಾಂಶಗಳು`);
          setIsLoading(false);
      }, 1000)
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <PageHeader
        title="ಹತ್ತಿರದ ಕೃಷಿ ಸೇವೆಗಳು"
        subtitle="ನಿಮ್ಮ ಸಮೀಪದಲ್ಲಿರುವ ಕೃಷಿ ಅಂಗಡಿಗಳು, ಮಂಡಿಗಳು ಮತ್ತು ಸೇವಾ ಕೇಂದ್ರಗಳನ್ನು ಹುಡುಕಿ."
      />
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="md:col-span-2 flex items-center gap-2">
                 <Input
                    placeholder="ಪಿನ್ ಕೋಡ್ ಅಥವಾ ತಾಲೂಕು ನಮೂದಿಸಿ..."
                    className="flex-grow"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isLoading || isRecording}
                 />
                 <Button
                    type="button"
                    size="icon"
                    onClick={toggleRecording}
                    variant={isRecording ? 'destructive' : 'outline'}
                 >
                    {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                 </Button>
               </div>
               <Select value={radius} onValueChange={setRadius} disabled={isLoading}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="ತ್ರಿಜ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5 ಕಿ.ಮೀ ಒಳಗೆ</SelectItem>
                        <SelectItem value="10">10 ಕಿ.ಮೀ ಒಳಗೆ</SelectItem>
                        <SelectItem value="25">25 ಕಿ.ಮೀ ಒಳಗೆ</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="flex flex-col md:flex-row gap-4 mt-4">
                <Button className="w-full md:w-auto flex-grow" onClick={handleSearch} disabled={isLoading || isRecording}>
                    <Search className="mr-2 h-4 w-4" /> ಹುಡುಕಿ
                </Button>
                <Button variant="outline" className="w-full md:w-auto flex-grow" onClick={handleDetectLocation} disabled={isLoading}>
                    <Navigation className="mr-2 h-4 w-4" /> ಸ್ಥಳ ಪತ್ತೆ ಮಾಡಿ
                </Button>
            </div>
            {(isLoading || isRecording) && <LoadingSpinner className={cn({'hidden': !isLoading}, 'py-4')}/>}
            {isRecording && <p className="text-center text-primary font-semibold mt-4 animate-pulse">ಕೇಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ...</p>}
            {location && <p className="mt-4 text-center text-primary font-semibold">{location}</p>}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>ನಕ್ಷೆ</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
                        <Image
                            src="https://placehold.co/600x400.png"
                            width={600}
                            height={400}
                            alt="Map Placeholder"
                            data-ai-hint="map karnataka"
                            className="object-cover rounded-md"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>ಸೇವಾ ಕೇಂದ್ರಗಳು</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {mockServices.map((service, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 rounded-lg border">
                            <div className="p-3 bg-accent/20 rounded-full">
                                <MapPin className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                                <h3 className="font-semibold">{service.name}</h3>
                                <p className="text-sm text-muted-foreground">{serviceTypes[service.type]}</p>
                                <p className="text-sm font-bold text-primary">{service.distance}</p>
                            </div>
                        </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
