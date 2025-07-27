
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background">
      <div className="container text-center text-foreground">
        <div className="mb-6 flex flex-col items-center justify-center space-y-4">
          <Image
            src="/logo/gg.png"
            alt="Google Cloud Logo"
            width={120}
            height={80}
            className="h-auto"
          />
          <p className="text-muted-foreground">presents</p>
        </div>
     
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            <span style={{ color: '#4285F4' }}>ಕೃ</span>
            <span style={{ color: '#EA4335' }}>ಷಿ</span>
            <span style={{ color: '#FBBC05' }}> ಮಿ</span>
            <span style={{ color: '#34A853' }}>ತ್ರ</span>
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
