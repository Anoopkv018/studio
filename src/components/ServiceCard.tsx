
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

type ServiceCardProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  href: string;
  color: string;
  textColor: string;
};

export function ServiceCard({ title, subtitle, icon, href, color, textColor }: ServiceCardProps) {
  return (
    <Link href={href} className="group flex">
      <Card 
        className="flex h-full w-full flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 rounded-lg"
        style={{ backgroundColor: color, color: textColor, border: 'none' }}
      >
        <CardHeader className="flex-grow">
          <div className="flex items-start gap-4">
            <div className="pt-1">{icon}</div>
            <div className="flex flex-col">
              <CardTitle className="text-xl font-headline" style={{ color: textColor }}>{title}</CardTitle>
              <CardDescription className="mt-1" style={{ color: textColor, opacity: 0.9 }}>{subtitle}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardFooter>
          <Button
            className="w-full transition-colors"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              color: textColor,
              border: `1px solid ${textColor}`
            }}
          >
            ಹೆಚ್ಚು ನೋಡಿ
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
