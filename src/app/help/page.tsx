
'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/PageHeader';
import { askAssistant } from '@/ai/flows/general-assistant-chat';
import { useToast } from '@/hooks/use-toast';
import { Send, User, Bot, Volume2, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'assistant';
  audio?: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function HelpPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
   const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'kn-IN';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript;
        setInput(spokenText);
      };

      recognitionRef.current.onerror = (event: any) => {
        toast({ title: 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಯಲ್ಲಿ ದೋಷ', description: `Error: ${event.error}`, variant: 'destructive'});
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [toast]);
  
  const playAudio = (audioDataUri: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(audioDataUri);
    audio.play();
    audioRef.current = audio;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askAssistant({ question: input });
      const assistantMessage: Message = {
        id: Date.now() + 1,
        text: response.answer,
        sender: 'assistant',
        audio: response.audio,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      if(response.audio){
        playAudio(response.audio);
      }
    } catch (e) {
      console.error(e);
      toast({
        title: 'ದೋಷ',
        description: 'ಉತ್ತರ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
        variant: 'destructive',
      });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        toast({ title: 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ', description: 'ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಯನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.', variant: 'destructive' });
        return;
      }
      setIsRecording(true);
      recognitionRef.current?.start();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col h-[calc(100vh-4rem)]">
      <PageHeader
        title="ಸಹಾಯಗಾರರೊಂದಿಗೆ ಮಾತನಾಡಿ"
        subtitle="ನಿಮ್ಮ ಯಾವುದೇ ಕೃಷಿ ಸಂಬಂಧಿತ ಪ್ರಶ್ನೆಗಳನ್ನು ಇಲ್ಲಿ ಕೇಳಿ. ನಮ್ಮ AI ಸಹಾಯಗಾರ ನಿಮಗೆ ಉತ್ತರಿಸುತ್ತಾರೆ."
      />
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full bg-card border rounded-lg overflow-hidden shadow-lg">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground pt-16">
              <Bot size={48} className="mx-auto" />
              <p className="mt-4">ಕೃಷಿ ಮಿತ್ರ ಸಹಾಯಗಾರನಿಗೆ ಸ್ವಾಗತ! <br/> ನಿಮ್ಮ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಲು ಕೆಳಗಿನ ಬಾಕ್ಸ್‌ನಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮೈಕ್ ಬಳಸಿ.</p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex items-end gap-2',
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.sender === 'assistant' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback><Bot size={20} /></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-xs md:max-w-md rounded-lg px-4 py-2 text-sm md:text-base',
                  msg.sender === 'user'
                    ? 'bg-primary-medium text-primary-foreground rounded-br-none'
                    : 'bg-muted rounded-bl-none'
                )}
              >
                {msg.text}
              </div>
               {msg.sender === 'assistant' && msg.audio && (
                <Button size="icon" variant="ghost" onClick={() => playAudio(msg.audio!)} className="rounded-full">
                    <Volume2 className="h-5 w-5 text-muted-foreground" />
                </Button>
              )}
              {msg.sender === 'user' && (
                 <Avatar className="h-8 w-8">
                  <AvatarFallback><User size={20} /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot size={20} /></AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-4 py-2 text-sm md:text-base rounded-bl-none">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse "/>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-150"/>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-300"/>
                     </div>
                  </div>
              </div>
          )}
           {isRecording && (
            <div className="text-center text-primary font-semibold mt-4 animate-pulse">
                ಕೇಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ...
            </div>
          )}
          </div>
        </ScrollArea>
        <div className="border-t p-4 bg-background/80">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ..."
              className="flex-1 resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isLoading}
            />
             <Button
                type="button"
                size="icon"
                onClick={toggleRecording}
                variant={isRecording ? 'destructive' : 'outline'}
                disabled={isLoading}
                aria-label={isRecording ? 'ಧ್ವನಿಮುದ್ರಣ ನಿಲ್ಲಿಸಿ' : 'ಧ್ವನಿಮುದ್ರಣ ಪ್ರಾರಂಭಿಸಿ'}
            >
                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
