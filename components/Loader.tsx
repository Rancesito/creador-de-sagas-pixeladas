import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Invocando píxeles ancestrales...",
  "Componiendo una saga épica...",
  "Despertando a los espíritus del arte...",
  "Afinando la orquesta chiptune...",
  "Renderizando reinos nostálgicos...",
  "Consultando al oráculo de silicio...",
  "Tejiendo los hilos de la narrativa...",
];

export const Loader: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <div className="w-16 h-16 border-4 border-dashed border-[#FFD700] rounded-full animate-spin mb-6"></div>
      <h2 className="text-2xl font-press-start text-[#FFD700] mb-4">
        Forjando Tu Leyenda...
      </h2>
      <p className="text-lg text-[#f2e9e4] transition-opacity duration-500">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};