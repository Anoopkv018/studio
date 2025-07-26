
'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getGovtSchemeInfo } from '@/ai/flows/govt-scheme-info';
import { useToast } from '@/hooks/use-toast';
import { Landmark } from 'lucide-react';
import React from 'react';

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
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim()) {
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
      const response = await getGovtSchemeInfo({ query });
      setResult(response.summary);
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

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <PageHeader
        title="ಸರ್ಕಾರಿ ಅಭಿವೃದ್ಧಿ ಯೋಜನೆಗಳು"
        subtitle="ಕೃಷಿಗೆ ಸಂಬಂಧಿಸಿದ ಸರ್ಕಾರದ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಹುಡುಕಿ. ಉದಾಹರಣೆಗೆ: ಸಬ್ಸಿಡಿ, ವಿಮೆ, ಕೃಷಿ ಯಂತ್ರೋಪಕರಣ."
      />
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಇಲ್ಲಿ ಹುಡುಕಿ..."
                className="flex-grow"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'ಹುಡುಕಲಾಗುತ್ತಿದೆ...' : 'ಹುಡುಕಿ'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading && <LoadingSpinner />}

        {result && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="text-primary" /> ಸಂಬಂಧಿತ ಯೋಜನೆಗಳ ಮಾಹಿತಿ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RenderSchemeInfo content={result} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
