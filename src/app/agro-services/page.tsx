
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Search, Navigation } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

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

export default function AgroServicesPage() {
  const [location, setLocation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDetectLocation = () => {
    setIsLoading(true);
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

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <PageHeader
        title="ಹತ್ತಿರದ ಕೃಷಿ ಸೇವೆಗಳು"
        subtitle="ನಿಮ್ಮ ಸಮೀಪದಲ್ಲಿರುವ ಕೃಷಿ ಅಂಗಡಿಗಳು, ಮಂಡಿಗಳು ಮತ್ತು ಸೇವಾ ಕೇಂದ್ರಗಳನ್ನು ಹುಡುಕಿ."
      />
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="ಪಿನ್ ಕೋಡ್ ಅಥವಾ ತಾಲೂಕು ನಮೂದಿಸಿ..."
                className="flex-grow"
              />
              <Button className="w-full md:w-auto">
                <Search className="mr-2 h-4 w-4" /> ಹುಡುಕಿ
              </Button>
              <Button variant="outline" className="w-full md:w-auto" onClick={handleDetectLocation} disabled={isLoading}>
                <Navigation className="mr-2 h-4 w-4" /> ಸ್ಥಳ ಪತ್ತೆ ಮಾಡಿ
              </Button>
            </div>
            {isLoading && <LoadingSpinner className="py-4" />}
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
