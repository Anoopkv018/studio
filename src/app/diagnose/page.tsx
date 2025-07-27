
'use client';

import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import { Upload, X, Volume2, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { detectCropDisease, type DetectCropDiseaseOutput } from '@/ai/flows/crop-disease-detection';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DiagnosePage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DetectCropDiseaseOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        setPhotoDataUri(dataUri);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setPhotoDataUri(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!photoDataUri) {
      toast({
        title: 'ಚಿತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
        description: 'ದಯವಿಟ್ಟು ರೋಗ ಪತ್ತೆಗಾಗಿ ನಿಮ್ಮ ಬೆಳೆಯ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await detectCropDisease({ photoDataUri });
      setResult(response);
    } catch (e) {
      console.error(e);
      setError('ರೋಗ ಪತ್ತೆ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.');
      toast({
        title: 'ದೋಷ',
        description: 'ರೋಗ ಪತ್ತೆ ಮಾಡುವಾಗ ದೋಷ দেখা দিয়েছে. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <PageHeader
        title="ಬೆಳೆ ರೋಗ ಪತ್ತೆ"
        subtitle="ನಿಮ್ಮ ಬೆಳೆಯ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ರೋಗದ ಮಾಹಿತಿ ಹಾಗೂ ಪರಿಹಾರಗಳನ್ನು ತಕ್ಷಣವೇ ಪಡೆಯಿರಿ."
      />
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg rounded-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div
                  className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {imagePreview ? (
                    <div className="relative group">
                      <Image
                        src={imagePreview}
                        alt="Uploaded crop"
                        width={400}
                        height={400}
                        className="rounded-md mx-auto max-h-64 w-auto object-contain"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearImage();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="h-12 w-12 text-primary-light" />
                      <p className="font-semibold">ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ</p>
                      <p className="text-sm">PNG, JPG</p>
                    </div>
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary-medium text-primary-foreground hover:bg-primary-medium/90 rounded-lg" disabled={isLoading || !imagePreview}>
                {isLoading ? 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...' : 'ರೋಗ ಪತ್ತೆ ಮಾಡಿ'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading && <LoadingSpinner />}

        {error && (
          <Alert variant="destructive" className="mt-6 rounded-lg">
            <AlertTitle>ದೋಷ</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Card className="mt-6 shadow-lg rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Leaf className="text-primary" /> ವಿಶ್ಲೇಷಣೆಯ ಫಲಿತಾಂಶ
              </CardTitle>
              {result.audioUri && (
                <>
                  <Button variant="outline" size="icon" onClick={playAudio} className="rounded-full">
                    <Volume2 className="h-5 w-5" />
                  </Button>
                  <audio ref={audioRef} src={result.audioUri} className="hidden" />
                </>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="font-semibold">🌿 ಬೆಳೆ ಹೆಸರು:</div>
                <div>{result.cropName}</div>
                <div className="font-semibold">🐛 ರೋಗದ ಹೆಸರು:</div>
                <div>{result.diseaseName}</div>
              </div>
              <div>
                <h4 className="font-semibold">🧪 ಲಕ್ಷಣಗಳು:</h4>
                <p className="text-muted-foreground">{result.symptoms}</p>
              </div>
              <div>
                <h4 className="font-semibold">💊 ಪರಿಹಾರ:</h4>
                <p className="text-muted-foreground">{result.solution}</p>
              </div>
              <div>
                <h4 className="font-semibold">🔒 ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು:</h4>
                <p className="text-muted-foreground">{result.prevention}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
