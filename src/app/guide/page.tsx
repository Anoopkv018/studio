
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
import { generateCultivationPlan, type CultivationPlanOutput } from '@/ai/flows/cultivation-guidelines';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, CalendarIcon, DollarSign, Leaf } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formSchema = z.object({
  cropName: z.string().min(2, { message: 'ಕನಿಷ್ಠ 2 ಅಕ್ಷರಗಳಿರಬೇಕು.' }),
  taluk: z.string().min(2, { message: 'ಕನಿಷ್ಠ 2 ಅಕ್ಷರಗಳಿರಬೇಕು.' }),
  hectares: z.coerce.number().min(0.1, { message: 'ಕನಿಷ್ಠ 0.1 ಹೆಕ್ಟೇರ್ ಇರಬೇಕು.' }),
  cultivationDate: z.date({
    required_error: "ಬೆಳೆ ಆರಂಭಿಸುವ ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function GuidePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CultivationPlanOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropName: '',
      taluk: '',
      hectares: 1,
      cultivationDate: new Date(),
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await generateCultivationPlan({
        ...values,
        cultivationDate: values.cultivationDate.toISOString(),
      });
      setResult(response);
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
        <Card className="shadow-lg rounded-lg">
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
                        <Input placeholder="ಉದಾ: ರಾಗಿ, ಭತ್ತ" {...field} className="rounded-lg" />
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
                        <Input placeholder="ಉದಾ: ಮೈಸೂರು, ಮಂಡ್ಯ" {...field} className="rounded-lg" />
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
                        <Input type="number" step="0.1" {...field} className="rounded-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="cultivationDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>ಬೆಳೆ ಆರಂಭಿಸುವ ದಿನಾಂಕ</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>ಒಂದು ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-primary-medium text-primary-foreground hover:bg-primary-medium/90 rounded-lg" disabled={isLoading}>
                  {isLoading ? 'ರಚಿಸಲಾಗುತ್ತಿದೆ...' : 'ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isLoading && <LoadingSpinner />}

        {result && (
          <div className="mt-8 space-y-6">
            <Card className="shadow-lg rounded-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">ಮಾಹಿತಿ ಸಾರಾಂಶ</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <CalendarDays className="h-6 w-6 text-accent"/>
                        <div>
                            <p className="font-semibold">ನಿರೀಕ್ಷಿತ ಇಳುವರಿ ದಿನಾಂಕ</p>
                            <p className="text-lg font-bold">{result.estimatedYieldDate}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <DollarSign className="h-6 w-6 text-accent"/>
                        <div>
                            <p className="font-semibold">ಅಂದಾಜು ಬೆಲೆ (ಪ್ರತಿ ಕ್ವಿಂಟಲ್)</p>
                            <p className="text-lg font-bold">{result.estimatedPrice}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div>
              <h2 className="text-2xl font-bold text-center mb-6 font-headline text-primary">ಸಾಪ್ತಾಹಿಕ ಕೃಷಿ ಯೋಜನೆ</h2>
              <div className="relative border-l-2 border-primary/50 ml-4 pl-8 space-y-8">
                {result.cultivationPlan.split(/(?=ವಾರ \d+:)/).filter(s => s.trim()).map((week, index) => {
                  const parts = week.split(':');
                  const weekTitle = parts[0];
                  const weekContent = parts.slice(1).join(':').trim();

                  return (
                    <div key={index} className="relative">
                      <div className="absolute -left-[42px] top-1 h-6 w-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <Card className="shadow-lg rounded-lg">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-accent">
                            <Leaf /> {weekTitle}
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
          </div>
        )}
      </div>
    </div>
  );
}
