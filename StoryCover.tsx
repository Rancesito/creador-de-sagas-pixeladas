import React, { useState } from 'react';
import type { Story } from '../types';

interface StoryCoverProps {
  story: Story;
  onOpenBook: () => void;
}

export const StoryCover: React.FC<StoryCoverProps> = ({ story, onOpenBook }) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenClick = () => {
    setIsOpening(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div 
        className={`w-full max-w-2xl text-center p-6 bg-gradient-to-br from-[#5a3921] to-[#4a2e1a] shadow-[8px_8px_0px_#1a120b] flex flex-col items-center gap-6 book-cover ${isOpening ? 'book-cover-opening' : ''}`}
        onTransitionEnd={isOpening ? onOpenBook : undefined}
        style={{border: "4px solid #1a120b", borderRight: "8px solid #1a120b"}}
      >
        <div className="absolute top-4 left-4 w-12 h-12 bg-gradient-to-br from-[#ffd700] to-[#f0c14b] shadow-[2px_2px_0px_#a37c0e]" style={{clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"}}></div>
        <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-[#ffd700] to-[#f0c14b] shadow-[2px_2px_0px_#a37c0e]" style={{clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"}}></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-[#ffd700] to-[#f0c14b] shadow-[2px_2px_0px_#a37c0e]" style={{clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"}}></div>
        <div className="absolute bottom-4 right-4 w-12 h-12 bg-gradient-to-br from-[#ffd700] to-[#f0c14b] shadow-[2px_2px_0px_#a37c0e]" style={{clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"}}></div>

        <h1 className="text-3xl md:text-4xl font-bold text-[#FFD700] tracking-wider z-10">
          {story.title}
        </h1>
        
        <div className="w-full max-w-md aspect-square bg-black border-4 border-[#3a2515] flex items-center justify-center p-2 z-10">
            <img 
                src={story.coverImageUrl} 
                alt={`Portada de ${story.title}`}
                className="w-full h-full object-cover" 
            />
        </div>

        <button
          onClick={handleOpenClick}
          className="w-full max-w-sm text-xl nes-style-btn z-10"
        >
          <span className="z-10 relative">Abrir Libro</span>
        </button>
      </div>
    </div>
  );
};