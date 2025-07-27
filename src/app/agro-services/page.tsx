
'use client';

import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Search, Navigation, Mic, MicOff, Phone, Volume2, Building } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { findNearbyServices, type AgroService, type FindNearbyServicesInput } from '@/ai/flows/agro-services-locator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Tractor, TestTube, Leaf, Wind } from 'lucide-react';


declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function AgroServicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [radius, setRadius] = useState('10'); // in km
  const [location, setLocation] = useState<{ latitude: number; longitude: number} | null>(null);
  const [services, setServices] = useState<AgroService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
        handleSearch(spokenText);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        toast({ title: 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಯಲ್ಲಿ ದೋಷ', description: `Error: ${event.error}`, variant: 'destructive'});
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
        toast({ title: 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ', description: 'ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಯನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.', variant: 'destructive' });
        return;
      }
      setSearchQuery('');
      setServices([]);
      setIsRecording(true);
      recognitionRef.current?.start();
    }
  };

  const handleDetectLocation = () => {
    setIsLoadingLocation(true);
    setSearchQuery('');
    setServices([]);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          handleSearch(null, { latitude, longitude });
          setIsLoadingLocation(false);
          toast({ title: 'ನಿಮ್ಮ ಸ್ಥಳ ಪತ್ತೆಯಾಗಿದೆ!' });
        },
        (error) => {
          toast({ title: 'ಸ್ಥಳ ಪತ್ತೆ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ', description: 'ದಯವಿಟ್ಟು ಬ್ರೌಸರ್ ಅನುಮತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.', variant: 'destructive'});
          setIsLoadingLocation(false);
        }
      );
    } else {
      toast({ title: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಜಿಯೋಲೋಕೇಶನ್ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.', variant: 'destructive' });
      setIsLoadingLocation(false);
    }
  };

  const handleSearch = async (query: string | null = searchQuery, loc: {latitude: number, longitude: number} | null = location) => {
    if (!query && !loc) {
      toast({ title: 'ದಯವಿಟ್ಟು ಸ್ಥಳವನ್ನು ನಮೂದಿಸಿ ಅಥವಾ ಪತ್ತೆ ಮಾಡಿ', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    setServices([]);
    
    const input: FindNearbyServicesInput = {
      radius: parseInt(radius, 10) * 1000, // convert km to meters
    };

    if (loc) {
      input.latitude = loc.latitude;
      input.longitude = loc.longitude;
    } else if (query) {
      input.query = query;
    }

    try {
      const response = await findNearbyServices(input);
      setServices(response.services);
    } catch (e) {
      console.error(e);
      toast({ title: 'ದೋಷ', description: 'ಸೇವೆಗಳನ್ನು ಹುಡುಕಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.', variant: 'destructive'});
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (audioUri: string) => {
    if (audioRef.current) {
        audioRef.current.pause();
    }
    const newAudio = new Audio(audioUri);
    newAudio.play();
    audioRef.current = newAudio;
  };
  
  const getCategoryIcon = (category: string) => {
      if (category.includes('ಗೊಬ್ಬರ') || category.includes('Fertilizer')) return <Wind className="h-6 w-6 text-accent" />;
      if (category.includes('ಬೀಜ') || category.includes('Seed')) return <Leaf className="h-6 w-6 text-accent" />;
      if (category.includes('ಪಶು') || category.includes('Veterinary')) return <TestTube className="h-6 w-6 text-accent" />;
      if (category.includes('ಕೇಂದ್ರ') || category.includes('Center')) return <Building className="h-6 w-6 text-accent" />;
      if (category.includes('ಟ್ರಾಕ್ಟರ್') || category.includes('Tractor')) return <Tractor className="h-6 w-6 text-accent" />;
      return <MapPin className="h-6 w-6 text-accent" />;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <PageHeader
        title="ಹತ್ತಿರದ ಕೃಷಿ ಸೇವೆಗಳು"
        subtitle="ನಿಮ್ಮ ಸಮೀಪದಲ್ಲಿರುವ ಕೃಷಿ ಅಂಗಡಿಗಳು, ಮಂಡಿಗಳು ಮತ್ತು ಸೇವಾ ಕೇಂದ್ರಗಳನ್ನು ಹುಡುಕಿ."
      />
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8 sticky top-[calc(4rem+1px)] z-10 bg-background/90 backdrop-blur-sm">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="md:col-span-2 flex items-center gap-2">
                 <Input
                    placeholder="ಪಿನ್ ಕೋಡ್ ಅಥವಾ ತಾಲೂಕು ನಮೂದಿಸಿ..."
                    className="flex-grow"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isLoading || isRecording || isLoadingLocation}
                 />
                 <Button
                    type="button"
                    size="icon"
                    onClick={toggleRecording}
                    variant={isRecording ? 'destructive' : 'outline'}
                    disabled={isLoading || isLoadingLocation}
                    aria-label={isRecording ? 'ಧ್ವನಿಮುದ್ರಣ ನಿಲ್ಲಿಸಿ' : 'ಧ್ವನಿಮುದ್ರಣ ಪ್ರಾರಂಭಿಸಿ'}
                 >
                    {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                 </Button>
               </div>
               <Select value={radius} onValueChange={setRadius} disabled={isLoading || isLoadingLocation}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="ತ್ರಿಜ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">5 ಕಿ.ಮೀ ಒಳಗೆ</SelectItem>
                        <SelectItem value="10">10 ಕಿ.ಮೀ ಒಳಗೆ</SelectItem>
                        <SelectItem value="25">25 ಕಿ.ಮೀ ಒಳಗೆ</SelectItem>
                        <SelectItem value="50">50 ಕಿ.ಮೀ ಒಳಗೆ</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="flex flex-col md:flex-row gap-4 mt-4">
                <Button className="w-full md:w-auto flex-grow" onClick={() => handleSearch()} disabled={isLoading || isRecording || isLoadingLocation}>
                    <Search className="mr-2 h-4 w-4" /> ಹುಡುಕಿ
                </Button>
                <Button variant="outline" className="w-full md:w-auto flex-grow" onClick={handleDetectLocation} disabled={isLoading || isRecording || isLoadingLocation}>
                    <Navigation className="mr-2 h-4 w-4" /> {isLoadingLocation ? 'ಪತ್ತೆ ಮಾಡಲಾಗುತ್ತಿದೆ...' : 'ನನ್ನ ಸ್ಥಳ ಬಳಸಿ'}
                </Button>
            </div>
          </CardContent>
        </Card>

        {isRecording && <p className="text-center text-primary font-semibold mt-4 animate-pulse">ಕೇಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ...</p>}

        <div className="mt-8">
            {isLoading && <LoadingSpinner />}
            {!isLoading && services.length === 0 && (
                 <Alert>
                    <MapPin className="h-4 w-4" />
                    <AlertTitle>ಪ್ರಾರಂಭಿಸಲು ಹುಡುಕಿ</AlertTitle>
                    <AlertDescription>
                        ಹತ್ತಿರದ ಕೃಷಿ ಸೇವೆಗಳನ್ನು ಹುಡುಕಲು ಮೇಲಿನ ಹುಡುಕಾಟ ಪಟ್ಟಿಯನ್ನು ಬಳಸಿ ಅಥವಾ ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಪತ್ತೆ ಮಾಡಿ.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service, index) => (
                    <Card key={index}>
                        <CardContent className="p-4">
                            <div className="flex gap-4">
                                <div className="p-3 bg-accent/20 rounded-full h-fit">
                                    {getCategoryIcon(service.category)}
                                </div>
                                <div className="flex-grow space-y-2">
                                    <h3 className="font-bold text-lg text-primary">{service.name}</h3>
                                    <p className="text-sm font-semibold text-muted-foreground">{service.category}</p>
                                    <p className="text-sm text-muted-foreground">{service.address}</p>
                                    {service.phoneNumber && (
                                        <a href={`tel:${service.phoneNumber}`} className="flex items-center gap-2 text-sm text-accent hover:underline">
                                            <Phone className="h-4 w-4" /> {service.phoneNumber}
                                        </a>
                                    )}
                                    <p className="text-sm font-bold">{service.distance}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button asChild variant="outline" className="flex-1">
                                    <a href={service.directionsUrl} target="_blank" rel="noopener noreferrer">
                                        <Navigation className="mr-2 h-4 w-4" /> ದಿಕ್ಕುಗಳು
                                    </a>
                                </Button>
                                {service.audioUri && (
                                    <Button onClick={() => playAudio(service.audioUri!)} variant="secondary" className="flex-1">
                                        <Volume2 className="mr-2 h-4 w-4" /> ಮಾಹಿತಿ ಕೇಳಿ
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
