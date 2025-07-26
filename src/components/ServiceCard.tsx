
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
};

export function ServiceCard({ title, subtitle, icon, href }: ServiceCardProps) {
  return (
    <Link href={href} className="group flex">
      <Card className="flex h-full w-full flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 hover:border-primary">
        <CardHeader className="flex-grow">
          <div className="flex items-start gap-4">
            <div className="text-primary pt-1">{icon}</div>
            <div className="flex flex-col">
              <CardTitle className="text-xl font-headline">{title}</CardTitle>
              <CardDescription className="mt-1">{subtitle}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full bg-transparent group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            ಹೆಚ್ಚು ನೋಡಿ
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
