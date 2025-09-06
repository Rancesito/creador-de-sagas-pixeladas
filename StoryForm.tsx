import React, { useState } from 'react';
import { TONES } from '../constants';
import type { Tone } from '../types';

interface StoryFormProps {
  onSubmit: (idea: string, tone: Tone, numPages: number) => void;
  error: string | null;
}

export const StoryForm: React.FC<StoryFormProps> = ({ onSubmit, error }) => {
  const [idea, setIdea] = useState('');
  const [tone, setTone] = useState<Tone>('epic-medieval');
  const [numPages, setNumPages] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim()) {
      onSubmit(idea, tone, numPages);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[#FFD700] mb-4 tracking-wider">
          Creador de Sagas Pixeladas
        </h1>
        <p className="text-lg md:text-xl text-[#f2e9e4] mb-8">
          ¡Convierte tus ideas más locas en libros de cuentos pixelados con bandas sonoras épicas!
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="nes-field">
            <label htmlFor="idea_field" className="text-left block mb-2 text-lg text-[#FFD700] font-press-start">La Idea de tu Historia</label>
            <textarea
              id="idea_field"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Un valiente caballero en busca de un dragón legendario..."
              className="w-full p-4 bg-[#111111] border-2 border-[#444444] text-[#f2e9e4] focus:border-[#FFD700] focus:outline-none transition-colors h-32 resize-none"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="nes-field">
              <label htmlFor="tone_select" className="text-left block mb-2 text-lg text-[#FFD700] font-press-start">Elige el Tono</label>
              <div className="relative">
                  <select
                  id="tone_select"
                  value={tone}
                  onChange={(e) => setTone(e.target.value as Tone)}
                  className="w-full appearance-none p-4 bg-[#111111] border-2 border-[#444444] text-[#f2e9e4] focus:border-[#FFD700] focus:outline-none transition-colors cursor-pointer"
                  >
                  {TONES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#FFD700]">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
              </div>
            </div>

            <div className="nes-field">
              <label htmlFor="pages_select" className="text-left block mb-2 text-lg text-[#FFD700] font-press-start">Nº de Páginas</label>
              <div className="relative">
                  <select
                  id="pages_select"
                  value={numPages}
                  onChange={(e) => setNumPages(parseInt(e.target.value, 10))}
                  className="w-full appearance-none p-4 bg-[#111111] border-2 border-[#444444] text-[#f2e9e4] focus:border-[#FFD700] focus:outline-none transition-colors cursor-pointer"
                  >
                    {Array.from({ length: 15 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#FFD700]">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full text-xl nes-style-btn hover:bg-[#c84c0c] hover:text-[#FFD700]"
          >
            Crear mi Historia
          </button>
        </form>

        {error && <p className="mt-6 text-red-400 bg-red-900/50 p-3 border border-red-500">{error}</p>}
      </div>
    </div>
  );
};