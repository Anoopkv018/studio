
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { generateCultivationPlan } from '@/ai/flows/cultivation-guidelines';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays } from 'lucide-react';

const formSchema = z.object({
  cropName: z.string().min(2, { message: 'ಕನಿಷ್ಠ 2 ಅಕ್ಷರಗಳಿರಬೇಕು.' }),
  taluk: z.string().min(2, { message: 'ಕನಿಷ್ಠ 2 ಅಕ್ಷರಗಳಿರಬೇಕು.' }),
  hectares: z.coerce.number().min(0.1, { message: 'ಕನಿಷ್ಠ 0.1 ಹೆಕ್ಟೇರ್ ಇರಬೇಕು.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function GuidePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<string[] | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropName: '',
      taluk: '',
      hectares: 1,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setPlan(null);

    try {
      const response = await generateCultivationPlan(values);
      const weeklyPlan = response.cultivationPlan.split(/(?=ವಾರ \d+:)/).filter(s => s.trim());
      setPlan(weeklyPlan);
    } catch (e) {
      console.error(e);
      toast({
        title: 'ದೋಷ',
        description: 'ಮಾರ್ಗದರ್ಶನ ರಚಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <PageHeader
        title="ಬೆಳೆ ಬೆಳೆಸುವ ಮಾರ್ಗದರ್ಶನ"
        subtitle="ನಿಮ್ಮ ಬೆಳೆ, ಪ್ರದೇಶ ಮತ್ತು ಜಮೀನಿನ ಅಳತೆಯನ್ನು ನಮೂದಿಸಿ, ಮತ್ತು ವಾರದಿಂದ ವಾರಕ್ಕೆ ವಿವರವಾದ ಕೃಷಿ ಮಾರ್ಗದರ್ಶನವನ್ನು ಪಡೆಯಿರಿ."
      />
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="cropName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ಬೆಳೆ ಹೆಸರು</FormLabel>
                      <FormControl>
                        <Input placeholder="ಉದಾ: ರಾಗಿ, ಭತ್ತ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taluk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ತಾಲೂಕು</FormLabel>
                      <FormControl>
                        <Input placeholder="ಉದಾ: ಮೈಸೂರು, ಮಂಡ್ಯ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hectares"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ (ಹೆಕ್ಟೇರ್‌ಗಳಲ್ಲಿ)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'ರಚಿಸಲಾಗುತ್ತಿದೆ...' : 'ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isLoading && <LoadingSpinner />}

        {plan && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-center mb-6 font-headline text-primary">ಸಾಪ್ತಾಹಿಕ ಕೃಷಿ ಯೋಜನೆ</h2>
            <div className="relative border-l-2 border-primary/50 ml-4 pl-8 space-y-8">
              {plan.map((week, index) => {
                const parts = week.split(':');
                const weekTitle = parts[0];
                const weekContent = parts.slice(1).join(':').trim();

                return (
                  <div key={index} className="relative">
                    <div className="absolute -left-[42px] top-1 h-6 w-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                       {index + 1}
                    </div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-accent">
                          <CalendarDays /> {weekTitle}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">{weekContent}</p>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
