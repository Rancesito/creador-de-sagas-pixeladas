import React, { useState, useRef, useEffect } from 'react';
import type { Story } from '../types';
import { PlayIcon } from './icons/PlayIcon';
import { StopIcon } from './icons/StopIcon';

declare const jspdf: any;
declare const html2canvas: any;

interface StoryBookProps {
  story: Story;
  onCreateNew: () => void;
}

export const StoryBook: React.FC<StoryBookProps> = ({ story, onCreateNew }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isExporting, setIsExporting] = useState(false);
  const pageTurnSoundRef = useRef<HTMLAudioElement>(null);

  // Text-to-speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sentences, setSentences] = useState<string[]>([]);
  const [highlightedSentenceIndex, setHighlightedSentenceIndex] = useState(-1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const sentenceBoundaries = useRef<number[]>([]);

  // Load voices
  useEffect(() => {
    const loadVoices = () => setVoices(speechSynthesis.getVoices());
    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Cleanup speech synthesis on component unmount
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
    };
  }, []);
  
  // Update sentences and stop speech when page changes
  useEffect(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setHighlightedSentenceIndex(-1);

    const currentText = story.pages[currentPage].text;
    const sentencesArray = currentText.match(/[^.!?]+[.!?\s]*|[^.!?]+$/g) || [currentText];
    setSentences(sentencesArray.map(s => s.trim()).filter(Boolean));

    let currentIndex = 0;
    sentenceBoundaries.current = sentencesArray.map(sentence => {
        const startIndex = currentIndex;
        currentIndex += sentence.length;
        return startIndex;
    });

  }, [currentPage, story]);


  const goToPage = (pageIndex: number) => {
    if (pageIndex < 0 || pageIndex >= totalPages) return;
    
    pageTurnSoundRef.current?.play().catch(e => console.error("Error playing sound:", e));
    setDirection(pageIndex > currentPage ? 'next' : 'prev');
    setCurrentPage(pageIndex);
  };

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setHighlightedSentenceIndex(-1);
      return;
    }

    const textToSpeak = story.pages[currentPage].text;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    let spanishVoice = voices.find(voice => voice.name === 'Google español');
    if (!spanishVoice) spanishVoice = voices.find(voice => voice.lang.startsWith('es-ES'));
    if (!spanishVoice) spanishVoice = voices.find(voice => voice.lang.startsWith('es'));
    
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }
    utterance.lang = 'es-ES';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setHighlightedSentenceIndex(-1);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setHighlightedSentenceIndex(-1);
    };
    utterance.onboundary = (event) => {
      const charIndex = event.charIndex;
      const currentSentence = sentenceBoundaries.current.findIndex((boundary, index) => {
        const nextBoundary = sentenceBoundaries.current[index + 1] || Infinity;
        return charIndex >= boundary && charIndex < nextBoundary;
      });
      setHighlightedSentenceIndex(currentSentence);
    };

    speechSynthesis.speak(utterance);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    const { jsPDF } = jspdf;
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [960, 540]
    });

    const pagesToRender = [{
        text: story.title,
        imageUrl: story.coverImageUrl,
        isCover: true,
    }, ...story.pages];

    for (let i = 0; i < pagesToRender.length; i++) {
        const pageData = pagesToRender[i];
        const container = document.createElement('div');
        container.style.width = '960px';
        container.style.height = '540px';
        container.style.background = '#2c1d10';
        container.style.color = '#f2e9e4';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.padding = '20px';
        container.style.fontFamily = 'VT323, monospace';
        
        const img = document.createElement('img');
        img.src = pageData.imageUrl;
        img.style.width = i === 0 ? '50%' : '100%';
        img.style.maxHeight = '80%';
        img.style.objectFit = 'cover';
        img.style.border = '4px solid #444444';

        const textDiv = document.createElement('div');
        if (i === 0) {
            textDiv.style.fontFamily = '"Press Start 2P", cursive';
            textDiv.style.fontSize = '32px';
            textDiv.style.textAlign = 'center';
            textDiv.style.color = '#FFD700';
            textDiv.style.marginTop = '20px';
            textDiv.innerText = pageData.text;
            container.appendChild(img);
            container.appendChild(textDiv);
        } else {
            container.style.display = 'grid';
            container.style.gridTemplateColumns = '1fr 1fr';
            container.style.gap = '20px';
            textDiv.style.fontSize = '18px';
            textDiv.style.whiteSpace = 'pre-wrap';
            textDiv.style.overflowWrap = 'break-word';
            textDiv.innerText = pageData.text;
            container.appendChild(textDiv);
            container.appendChild(img);
        }

        document.body.appendChild(container);
        
        const canvas = await html2canvas(container, { useCORS: true, allowTaint: true });
        const imgData = canvas.toDataURL('image/png');
        
        if (i > 0) {
            pdf.addPage();
        }
        
        pdf.addImage(imgData, 'PNG', 0, 0, 960, 540);
        document.body.removeChild(container);
    }

    pdf.save(`${story.title.replace(/\s/g, '-')}.pdf`);
    setIsExporting(false);
  };

  const totalPages = story.pages.length;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      <audio ref={pageTurnSoundRef} src="https://cdn.pixabay.com/download/audio/2021/08/04/audio_03b3520286.mp3" preload="auto" />
      <h1 className="text-3xl md:text-4xl font-bold text-[#FFD700] mb-6 text-center font-press-start truncate px-4">{story.title}</h1>
      
      <div className="w-full p-2 bg-[#FFD700] shadow-[inset_0_0_0_4px_#a37c0e,8px_8px_0px_#1a120b] mb-6">
        <div className="w-full h-[70vh] md:h-[60vh] relative bg-gradient-to-br from-[#4a2e1a] to-[#2c1d10] magic-dust-effect">
            <div className="absolute top-0 right-10 w-10 h-24 bg-[#c84c0c] border-4 border-[#444444] border-t-0 z-10" style={{clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)"}}></div>
            <div key={currentPage} className={`w-full h-full ${direction === 'next' ? 'page-slide-in-next' : 'page-slide-in-prev'}`}>
                <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                    <div className="text-left p-6 md:p-8 flex items-center overflow-y-auto">
                        <p className="text-[#f2e9e4] text-xl md:text-2xl leading-relaxed w-full">
                           {sentences.map((sentence, index) => (
                             <span key={index} className={`transition-colors duration-200 ${highlightedSentenceIndex === index ? 'bg-yellow-800/70 rounded' : 'bg-transparent'}`}>
                               {sentence}
                             </span>
                           ))}
                        </p>
                    </div>
                    <div className="w-full h-full bg-black p-2">
                        <div className="w-full h-full border-4 border-gray-700/50">
                            <img 
                                src={story.pages[currentPage].imageUrl} 
                                alt={story.pages[currentPage].imagePrompt} 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0} className="nes-style-btn">
              Anterior
            </button>
            <span className="text-[#FFD700] text-lg font-press-start">
              {currentPage + 1} / {totalPages}
            </span>
            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages - 1} className="nes-style-btn">
              Siguiente
            </button>
        </div>
        
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <button onClick={handleToggleSpeech} className="nes-style-btn !p-3" aria-label={isSpeaking ? "Detener lectura" : "Leer en voz alta"}>
              {isSpeaking ? <StopIcon /> : <PlayIcon />}
            </button>
            <button onClick={handleExportPDF} disabled={isExporting} className="nes-style-btn text-sm">
                {isExporting ? 'Exportando...' : 'Exportar PDF'}
            </button>
            {currentPage === totalPages - 1 && (
            <button onClick={onCreateNew} className="nes-style-btn text-sm hover:bg-green-700">
                Crear Nueva Historia
            </button>
            )}
        </div>
      </div>
    </div>
  );
};