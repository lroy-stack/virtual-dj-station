
import React, { useEffect, useState } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ 
  isPlaying, 
  barCount = 5 
}) => {
  const [bars, setBars] = useState<number[]>(new Array(barCount).fill(20));

  useEffect(() => {
    if (!isPlaying) {
      setBars(new Array(barCount).fill(20));
      return;
    }

    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.random() * 40 + 10));
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, barCount]);

  return (
    <div className="flex items-end gap-1 h-8">
      {bars.map((height, index) => (
        <div
          key={index}
          className={`audio-bar transition-all duration-100 ${
            isPlaying ? 'opacity-100' : 'opacity-50'
          }`}
          style={{ 
            height: `${height}px`,
            animationDelay: `${index * 0.1}s`
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;
