
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-[-1]">
        <Image
          src="https://placehold.co/1920x1080.png"
          alt="Karnataka landscape"
          data-ai-hint="karnataka landscape"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm"></div>
      </div>
      <div className="container relative z-10 text-center text-foreground">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
          ಕೃಷಿ ಮಿತ್ರ
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg md:text-xl">
          ನಿಮ್ಮ ಕೃಷಿ ಚಟುವಟಿಕೆಗಳಿಗೆ ನಮ್ಮ ಬೆಂಬಲ. ಆಧುನಿಕ ತಂತ್ರಜ್ಞಾನದೊಂದಿಗೆ ನಿಮ್ಮ ಬೆಳೆಗಳನ್ನು ಬೆಳೆಸಲು ನಾವು ಸಹಾಯ ಮಾಡುತ್ತೇವೆ.
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/dashboard">
              ಸೇವೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
