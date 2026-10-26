import React, { useState, useEffect } from 'react';

interface IntroVideoProps {
  onVideoEnd: () => void;
}

export const IntroVideo: React.FC<IntroVideoProps> = ({ onVideoEnd }) => {
  const [videoEnded, setVideoEnded] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);

  useEffect(() => {
    // Check if video has already been played in this session
    const hasPlayed = sessionStorage.getItem('introVideoPlayed');
    if (!hasPlayed) {
      setShouldPlay(true);
    } else {
      // If already played, skip directly to end
      onVideoEnd();
    }
  }, [onVideoEnd]);

  useEffect(() => {
    const handleVideoEnd = () => {
      setVideoEnded(true);
      sessionStorage.setItem('introVideoPlayed', 'true');
      onVideoEnd();
    };

    const video = document.getElementById('intro-video') as HTMLVideoElement;
    if (video) {
      video.addEventListener('ended', handleVideoEnd);
      return () => {
        video.removeEventListener('ended', handleVideoEnd);
      };
    }
  }, [onVideoEnd]);

  if (!shouldPlay || videoEnded) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <video
        id="intro-video"
        src="/omav.mp4"
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
        onEnded={() => {
          setVideoEnded(true);
          sessionStorage.setItem('introVideoPlayed', 'true');
          onVideoEnd();
        }}
      />
    </div>
  );
};
