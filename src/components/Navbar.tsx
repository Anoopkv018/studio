
'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from './ui/button';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-4">
          {!isHomePage && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold font-headline text-primary">
              ಕೃಷಿ ಮಿತ್ರ
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
