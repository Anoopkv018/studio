
'use client';

import { useState, type FormEvent, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getMarketPrice, type MarketPriceOutput } from '@/ai/flows/market-price-query';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Volume2 } from 'lucide-react';

export default function PricePage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MarketPriceOutput | null>(null);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim()) {
      toast({
        title: 'ಪ್ರಶ್ನೆ ಖಾಲಿಯಾಗಿದೆ',
        description: 'ದಯವಿಟ್ಟು ಬೆಳೆ ಮತ್ತು ಸ್ಥಳದ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await getMarketPrice({ query });
      setResult(response);
    } catch (e) {
      console.error(e);
      toast({
        title: 'ದೋಷ',
        description: 'ಬೆಲೆ ಮಾಹಿತಿ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
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
        title="ಬೆಲೆ ಮಾಹಿತಿ"
        subtitle="ನಿಮ್ಮ ಬೆಳೆಗೆ ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಏನು? ಎಂದು ಇಲ್ಲಿ ಕೇಳಿ ಮತ್ತು ತಕ್ಷಣವೇ ಉತ್ತರ, ಹಾಗೂ ಮಾರಾಟ ಸಲಹೆಗಳನ್ನು ಪಡೆಯಿರಿ."
      />
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ಉದಾ: ಟೊಮೆಟೋ ಬೆಲೆ ಇಂದು ಎಷ್ಟು?"
                className="flex-grow"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'ಪಡೆಯಲಾಗುತ್ತಿದೆ...' : 'ಬೆಲೆ ಪಡೆಯಿರಿ'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading && <LoadingSpinner />}

        {result && (
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="text-primary" /> ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ
              </CardTitle>
              {result.audioUri && (
                <>
                  <Button variant="outline" size="icon" onClick={playAudio}>
                    <Volume2 className="h-5 w-5" />
                  </Button>
                  <audio ref={audioRef} src={result.audioUri} className="hidden" />
                </>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="font-semibold">🌿 ಬೆಳೆ:</span> {result.crop}</div>
                <div><span className="font-semibold">📅 ದಿನಾಂಕ:</span> {result.date}</div>
              </div>
              <div>
                <h4 className="font-semibold">💰 ಇಂದು ಅಂದಾಜು ಬೆಲೆ:</h4>
                <p className="text-xl font-bold text-primary">{result.estimatedPrice}</p>
              </div>
              <div>
                <h4 className="font-semibold">💬 ಮಾರಾಟ ಸಲಹೆ:</h4>
                <p className="text-muted-foreground">{result.salesAdvice}</p>
              </div>
              <div>
                <h4 className="font-semibold">📦 ತಜ್ಞ ಸಲಹೆ:</h4>
                <p className="text-muted-foreground">{result.expertAdvice}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
