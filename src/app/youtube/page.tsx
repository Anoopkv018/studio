
'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PlayCircle } from 'lucide-react';

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

export default function YoutubePage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState(mockVideos);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    // In a real app, you would filter videos based on the query or make an API call
    setTimeout(() => {
      const filteredVideos = query
        ? mockVideos.filter(v => v.title.includes(query) || v.description.includes(query))
        : mockVideos;
      setVideos(filteredVideos);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <PageHeader
        title="ಕೃಷಿ ಯೂಟ್ಯೂಬ್ ವಿಡಿಯೋಗಳು"
        subtitle="ಕೃಷಿ ತಜ್ಞರಿಂದ ಇತ್ತೀಚಿನ ತಂತ್ರಜ್ಞಾನ, ಸಲಹೆಗಳು ಮತ್ತು ಯಶಸ್ಸಿನ ಕಥೆಗಳನ್ನು ತಿಳಿಯಿರಿ."
      />
      <div className="max-w-xl mx-auto mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ಬೆಳೆ ಅಥವಾ ವಿಷಯದ ಬಗ್ಗೆ ಹುಡುಕಿ..."
            className="flex-grow"
          />
          <Button type="submit">ಹುಡುಕಿ</Button>
        </form>
      </div>
      
      {isLoading ? <LoadingSpinner /> : (
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
      )}
    </div>
  );
}
