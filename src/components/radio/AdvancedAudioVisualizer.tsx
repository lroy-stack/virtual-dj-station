
import React, { useEffect, useState, useRef } from 'react';

interface AdvancedAudioVisualizerProps {
  isPlaying: boolean;
  volume: number;
  className?: string;
  variant?: 'bars' | 'wave' | 'circle';
  barCount?: number;
  height?: number;
}

const AdvancedAudioVisualizer: React.FC<AdvancedAudioVisualizerProps> = ({ 
  isPlaying, 
  volume,
  className = '',
  variant = 'bars',
  barCount = 12,
  height = 60
}) => {
  const [visualData, setVisualData] = useState<number[]>(new Array(barCount).fill(0));
  const animationRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isPlaying) {
      startAnimation();
    } else {
      stopAnimation();
      setVisualData(new Array(barCount).fill(0));
    }

    return () => stopAnimation();
  }, [isPlaying, barCount]);

  useEffect(() => {
    if (variant === 'wave' || variant === 'circle') {
      drawWaveform();
    }
  }, [visualData, variant, volume]);

  const startAnimation = () => {
    const animate = () => {
      // Simular datos de frecuencia realistas
      const newData = Array.from({ length: barCount }, (_, i) => {
        const baseFreq = Math.sin(Date.now() * 0.001 + i * 0.5) * 0.5 + 0.5;
        const randomVariation = Math.random() * 0.4;
        const volumeMultiplier = volume * 0.8 + 0.2;
        return (baseFreq * 0.6 + randomVariation * 0.4) * volumeMultiplier * 100;
      });

      setVisualData(newData);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (variant === 'wave') {
      // Dibujar forma de onda
      ctx.beginPath();
      ctx.strokeStyle = `rgba(98, 0, 234, ${volume})`;
      ctx.lineWidth = 2;

      for (let i = 0; i < visualData.length; i++) {
        const x = (i / (visualData.length - 1)) * width;
        const y = height / 2 + (visualData[i] - 50) * (height / 100);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Efecto de brillo
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#6200ea';
      ctx.stroke();
    } else if (variant === 'circle') {
      // Visualizador circular
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 3;

      ctx.strokeStyle = `rgba(0, 229, 255, ${volume})`;
      ctx.lineWidth = 3;

      for (let i = 0; i < visualData.length; i++) {
        const angle = (i / visualData.length) * Math.PI * 2;
        const amplitude = visualData[i] / 100;
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + amplitude * 20);
        const y2 = centerY + Math.sin(angle) * (radius + amplitude * 20);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
  };

  if (variant === 'wave' || variant === 'circle') {
    return (
      <canvas
        ref={canvasRef}
        width={200}
        height={height}
        className={`${className}`}
        style={{ background: 'transparent' }}
      />
    );
  }

  // Visualizador de barras (default)
  return (
    <div className={`flex items-end gap-1 ${className}`} style={{ height }}>
      {visualData.map((value, index) => (
        <div
          key={index}
          className={`audio-bar transition-all duration-75 ${
            isPlaying ? 'opacity-100' : 'opacity-30'
          }`}
          style={{ 
            height: `${Math.max(4, value)}%`,
            width: `${100 / barCount}%`,
            background: `linear-gradient(to top, 
              rgba(98, 0, 234, ${volume * 0.8 + 0.2}), 
              rgba(0, 229, 255, ${volume * 0.6 + 0.4}))`
          }}
        />
      ))}
    </div>
  );
};

export default AdvancedAudioVisualizer;
