
'use client';

import { ArrowLeft, Globe } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [language, setLanguage] = useState('kn');
  const isHomePage = pathname === '/';
  const isDashboardPage = pathname === '/dashboard';

  const toggleLanguage = (lang: string) => {
    setLanguage(lang);
    // Here you would typically implement the logic to change the app's language
    // For now, it just updates the button text
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-4">
          {!isHomePage && !isDashboardPage && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              aria-label="Go back"
              className="text-primary-foreground hover:bg-primary-medium hover:text-primary-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold font-headline text-primary-foreground">
              ಕೃಷಿ ಮಿತ್ರ
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-medium hover:text-primary-foreground">
                    <Globe className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toggleLanguage('kn')}>ಕನ್ನಡ</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleLanguage('en')}>English</DropdownMenuItem>
            </DropdownMenuContent>
           </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
