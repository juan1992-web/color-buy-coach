
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase'; // Corrected path

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Define interfaces for better type safety
interface Product {
  id: number;
  name: string;
  url: string;
  category: string;
  tone: string;
}

interface ProductData {
  lips: Product[];
  blush: Product[];
  top: Product[];
}

const loadingTexts = [
  "Analyzing your unique skin tone...",
  "Comparing against thousands of shades...",
  "Finding your perfect color harmony...",
  "Curating product recommendations...",
  "Finalizing your personalized palette...",
];

const Home: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(loadingTexts[0]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      let textIndex = 0;
      setLoadingText(loadingTexts[0]);
      interval = setInterval(() => {
        textIndex = (textIndex + 1) % loadingTexts.length;
        setLoadingText(loadingTexts[textIndex]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
      setProducts(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select an image file.');
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      if (!analyzeResponse.ok) throw new Error('Image analysis failed. Please try a different photo.');

      const analysisResult = await analyzeResponse.json();
      const diagnosedTone = analysisResult.tone || 'Spring Bright';
      setResult(diagnosedTone);

      const [lips, blush, top] = await Promise.all([
        supabase.from('products').select().eq('tone', diagnosedTone).eq('category', 'lips').limit(1),
        supabase.from('products').select().eq('tone', diagnosedTone).eq('category', 'blush').limit(1),
        supabase.from('products').select().eq('tone', diagnosedTone).eq('category', 'top').limit(1),
      ]);

      if (lips.error || blush.error || top.error) throw new Error('Could not fetch product recommendations.');
      if (!lips.data?.[0] || !blush.data?.[0] || !top.data?.[0]) throw new Error(`We couldn't find a full product set for the '${diagnosedTone}' tone.`);

      setProducts({ lips: lips.data, blush: blush.data, top: top.data });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const renderProductCard = (product: Product, categoryName: string) => (
    <Card key={product.id} className="text-center transform hover:scale-105 transition-transform duration-300">
        <CardHeader>
            <CardTitle className="text-xl font-bold">{categoryName}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="h-12 flex items-center justify-center">{product.name}</p>
        </CardContent>
        <CardFooter className="justify-center">
            <Button asChild>
                <a href={product.url} target="_blank" rel="noopener noreferrer">Shop Now</a>
            </Button>
        </CardFooter>
    </Card>
  );

  const resetState = () => {
    setFile(null);
    setResult(null);
    setProducts(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="text-center transition-opacity duration-500">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
        <p className="text-xl font-semibold text-muted-foreground mt-6">{loadingText}</p>
      </div>
    );
  }

  if (result && products) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold tracking-tight">Your Personal Color is:</h2>
          <p className="mt-2 text-5xl font-bold text-primary">{result}</p>
          <p className="mt-6 text-lg text-muted-foreground">Here are the products perfectly matched to your tone.</p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
              {products.lips[0] && renderProductCard(products.lips[0], 'Lipstick')}
              {products.blush[0] && renderProductCard(products.blush[0], 'Blush')}
              {products.top[0] && renderProductCard(products.top[0], 'Top')}
          </div>
          <Button onClick={resetState} variant="outline" className="mt-12">
            Analyze Another Photo
          </Button>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-extrabold tracking-tight">Discover Your Perfect Palette</CardTitle>
        <CardDescription className="text-lg">Upload your photo, and let our AI reveal the colors that make you shine.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
            <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center space-y-2">
                    {file ? (
                        <p className="font-semibold text-primary">{file.name}</p>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v5a4 4 0 01-4 4H7z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11a2 2 0 100-4 2 2 0 000 4z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11a1 1 0 100-2 1 1 0 000 2z" /></svg>
                            <span className="font-medium text-muted-foreground">Click or drag to upload</span>
                        </>
                    )}
                </div>
            </label>
        </div>
        {error && <p className="text-sm font-semibold text-center text-destructive mt-4">{error}</p>}
      </CardContent>
      <CardFooter className="flex-col space-y-4">
        <Button onClick={handleSubmit} disabled={!file || loading} className="w-full">
            {loading ? 'Analyzing...' : 'Reveal My Colors'}
        </Button>
        <p className="text-xs text-muted-foreground">Your photo is deleted immediately after analysis. We respect your privacy.</p>
      </CardFooter>
    </Card>
  );
};

export default Home;
