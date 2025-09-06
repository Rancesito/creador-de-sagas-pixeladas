
import React, { useState, useCallback } from 'react';
import { StoryForm } from './components/StoryForm';
import { StoryBook } from './components/StoryBook';
import { StoryCover } from './components/StoryCover';
import { Loader } from './components/Loader';
import { AudioPlayer } from './components/AudioPlayer';
import { generateStoryAndImages } from './services/geminiService';
import type { Story, Tone } from './types';
import { AMBIENT_MUSIC_URL } from './constants';

export default function App() {
  const [story, setStory] = useState<Story | null>(null);
  const [tone, setTone] = useState<Tone>('epic-medieval');
  const [view, setView] = useState<'form' | 'loading' | 'cover' | 'book'>('form');
  const [error, setError] = useState<string | null>(null);
  
  const handleCreateStory = useCallback(async (idea: string, selectedTone: Tone, numPages: number) => {
    setView('loading');
    setError(null);
    setTone(selectedTone);
    try {
      const generatedStory = await generateStoryAndImages(idea, selectedTone, numPages);
      setStory(generatedStory);
      setView('cover');
    } catch (err) {
      console.error("Error creating story:", err);
      let errorMessage = 'Una fuerza misteriosa impidió que se creara la historia. Por favor, inténtalo de nuevo.';
      if (err instanceof Error) {
        if (/API key not valid/i.test(err.message)) {
          errorMessage = 'La clave de la API de Gemini no es válida o no se ha proporcionado. Por favor, verifica la configuración de tu entorno.';
        } else if (/quota|rate limit|resource_exhausted/i.test(err.message)) {
          errorMessage = 'Has excedido tu cuota de uso de la API de Gemini. Por favor, revisa tu plan y facturación o inténtalo más tarde.';
        } else if (/deadline/i.test(err.message)) {
          errorMessage = 'La solicitud ha tardado demasiado en responder. Por favor, inténtalo de nuevo más tarde.';
        }
      }
      setError(errorMessage);
      setView('form');
    }
  }, []);

  const handleOpenBook = () => {
    setView('book');
  };

  const handleCreateNew = () => {
    setStory(null);
    setView('form');
    setError(null);
  };

  const renderContent = () => {
    switch (view) {
      case 'loading':
        return <Loader />;
      case 'cover':
        return story && <StoryCover story={story} onOpenBook={handleOpenBook} />;
      case 'book':
        return story && <StoryBook story={story} onCreateNew={handleCreateNew} />;
      case 'form':
      default:
        return <StoryForm onSubmit={handleCreateStory} error={error} />;
    }
  };

  return (
    <main className="text-[#f2e9e4] min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-500 perspective-container">
      <div className="w-full max-w-5xl mx-auto">
        {renderContent()}
      </div>
      <AudioPlayer src={AMBIENT_MUSIC_URL} />
    </main>
  );
}