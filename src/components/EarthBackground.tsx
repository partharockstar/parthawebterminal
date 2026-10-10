import React, { useEffect, useRef } from 'react';

/**
 * Cyber Matrix Number Rain Background
 * Features multi-layered numbers (0-9) that constantly change/mutate in real-time
 * and cascade vertically downwards with cyber glow and trailing effects.
 */
export const EarthBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Numbers pool: digits 0-9
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    interface NumberStream {
      x: number;
      y: number;
      speed: number;
      fontSize: number;
      length: number;
      chars: string[];
      layer: number; // 0 = foreground big, 1 = midground, 2 = deep background
      opacity: number;
      glow: number;
      changeRate: number; // how frequently digits mutate
    }

    let streams: NumberStream[] = [];

    const createStream = (layer: number, forcedY?: number): NumberStream => {
      let fontSize: number;
      let speed: number;
      let length: number;
      let opacity: number;
      let glow: number;
      let changeRate: number;

      if (layer === 0) {
        // Foreground: large, fast, high glow
        fontSize = Math.floor(Math.random() * 12) + 28; // 28px - 40px
        speed = Math.random() * 3.0 + 3.2;
        length = Math.floor(Math.random() * 14) + 8;
        opacity = 0.95;
        glow = 18;
        changeRate = 0.22; // 22% chance per frame to mutate digits
      } else if (layer === 1) {
        // Midground: standard size & speed
        fontSize = Math.floor(Math.random() * 8) + 18; // 18px - 26px
        speed = Math.random() * 2.2 + 1.8;
        length = Math.floor(Math.random() * 18) + 12;
        opacity = 0.75;
        glow = 10;
        changeRate = 0.16;
      } else {
        // Deep background: dense, small, distant
        fontSize = Math.floor(Math.random() * 5) + 12; // 12px - 16px
        speed = Math.random() * 1.6 + 1.0;
        length = Math.floor(Math.random() * 22) + 14;
        opacity = 0.42;
        glow = 4;
        changeRate = 0.12;
      }

      const chars: string[] = [];
      for (let i = 0; i < length; i++) {
        chars.push(digits[Math.floor(Math.random() * digits.length)]);
      }

      const streamY =
        forcedY !== undefined
          ? forcedY
          : -Math.random() * height * 1.5 - fontSize * 2;

      return {
        x: Math.random() * width,
        y: streamY,
        speed,
        fontSize,
        length,
        chars,
        layer,
        opacity,
        glow,
        changeRate,
      };
    };

    const initStreams = () => {
      streams = [];

      // Foreground count
      const numLarge = Math.max(12, Math.floor(width / 60));
      for (let i = 0; i < numLarge; i++) {
        // Distribute initial Y positions randomly so screen is immediately filled
        const initialY = Math.random() * height * 1.5 - height * 0.5;
        streams.push(createStream(0, initialY));
      }

      // Midground count
      const numMid = Math.max(25, Math.floor(width / 32));
      for (let i = 0; i < numMid; i++) {
        const initialY = Math.random() * height * 1.5 - height * 0.5;
        streams.push(createStream(1, initialY));
      }

      // Background small count
      const numSmall = Math.max(40, Math.floor(width / 18));
      for (let i = 0; i < numSmall; i++) {
        const initialY = Math.random() * height * 1.5 - height * 0.5;
        streams.push(createStream(2, initialY));
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      initStreams();
    };

    resize();
    window.addEventListener('resize', resize);

    // Main animation loop
    const render = () => {
      // Dark trail persistence fade
      ctx.fillStyle = 'rgba(1, 4, 10, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Render layers from deepest (layer 2) to foreground (layer 0)
      for (let l = 2; l >= 0; l--) {
        for (let i = 0; i < streams.length; i++) {
          const stream = streams[i];
          if (stream.layer !== l) continue;

          ctx.font = `bold ${stream.fontSize}px "Fira Code", monospace`;

          // Continually change numbers in real-time ("change hoite thakbo")
          if (Math.random() < stream.changeRate) {
            const mutateCount = Math.floor(Math.random() * 3) + 1;
            for (let m = 0; m < mutateCount; m++) {
              const charIdx = Math.floor(Math.random() * stream.chars.length);
              stream.chars[charIdx] = digits[Math.floor(Math.random() * digits.length)];
            }
          }

          // Draw the falling vertical stream of numbers
          for (let c = 0; c < stream.chars.length; c++) {
            const charY = stream.y - c * (stream.fontSize * 1.15);

            // Skip off-screen characters
            if (charY < -stream.fontSize || charY > height + stream.fontSize) {
              continue;
            }

            if (c === 0) {
              // Head character: glowing bright white / cyan
              ctx.fillStyle = '#ffffff';
              ctx.shadowColor = '#00f0ff';
              ctx.shadowBlur = stream.glow * 2.2;
            } else if (c === 1) {
              // Second character: bright cyan
              ctx.fillStyle = '#a5f3fc';
              ctx.shadowColor = '#00f0ff';
              ctx.shadowBlur = stream.glow * 1.5;
            } else {
              // Tail fading down with cyber cyan glow
              const fadeRatio = 1 - c / stream.length;
              const alpha = stream.opacity * Math.max(0.12, fadeRatio);
              ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
              ctx.shadowColor = '#00f0ff';
              ctx.shadowBlur = stream.glow * fadeRatio;
            }

            ctx.fillText(stream.chars[c], stream.x, charY);
          }

          ctx.shadowBlur = 0;

          // Move stream downwards ("niche porte thakbo")
          stream.y += stream.speed;

          // Reset stream when it reaches the bottom
          const totalStreamLengthPx = stream.length * (stream.fontSize * 1.15);
          if (stream.y - totalStreamLengthPx > height) {
            stream.y = -stream.fontSize * 2;
            stream.x = Math.random() * width;
            // Mutate all characters for the new drop
            for (let k = 0; k < stream.chars.length; k++) {
              stream.chars[k] = digits[Math.floor(Math.random() * digits.length)];
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#01040a]">
      {/* Falling Numbers Matrix Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* Atmospheric Vignette Overlay */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#010308]/40 to-[#010308]/90 pointer-events-none" />

      {/* CRT Cyber Scanline subtle scan effect */}
      <div className="absolute inset-0 opacity-[0.12] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#000_3px,#000_4px)] pointer-events-none" />
    </div>
  );
};
