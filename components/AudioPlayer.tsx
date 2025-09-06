import React, { useState, useRef, useEffect } from 'react';
import { MuteIcon } from './icons/MuteIcon';
import { VolumeIcon } from './icons/VolumeIcon';

interface AudioPlayerProps {
  src: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const playAudio = () => {
        // This promise rejection is expected if autoplay is blocked.
        audio.play().catch(error => {
            console.warn("La reproducción automática fue bloqueada. Esperando interacción del usuario.", error);
        });
    }

    // Attempt to play on mount.
    playAudio();

    const handleInteraction = () => {
        if (audio.paused) {
          playAudio();
        }
        // This listener is only needed for the first interaction.
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
    };
    
    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);

    return () => {
        // Cleanup listeners when the component unmounts.
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
    };

  }, [src]);

  const toggleMute = () => {
    if (audioRef.current) {
        // Also try to play on toggle, in case initial attempts failed and user only clicks the button.
        if (audioRef.current.paused) {
            audioRef.current.play().catch(()=>{/* ignore */});
        }
      const newMutedState = !audioRef.current.muted;
      audioRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop />
      <button
        onClick={toggleMute}
        className="fixed top-4 right-4 z-50 bg-[#111111] border-2 border-[#444444] p-3 hover:border-[#FFD700] transition-colors"
        aria-label={isMuted ? "Activar sonido" : "Silenciar"}
      >
        {isMuted ? <MuteIcon /> : <VolumeIcon />}
      </button>
    </>
  );
};