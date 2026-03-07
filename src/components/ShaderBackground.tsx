import React, { useEffect, useRef } from "react";

type ShaderBackgroundProps = {
  className?: string;
};

const ShaderBackground: React.FC<ShaderBackgroundProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let animationFrameId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let time = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const ratio = window.devicePixelRatio || 1;

      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const render = () => {
      time += 0.007;

      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#070b14");
      gradient.addColorStop(1, "#0d1220");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      const waves = 4;
      for (let i = 0; i < waves; i += 1) {
        const hueShift = i * 22;
        const alpha = 0.08 - i * 0.012;

        context.beginPath();
        for (let x = 0; x <= width; x += 10) {
          const y =
            height * (0.28 + i * 0.17) +
            Math.sin(x * 0.004 + time * (1.5 + i * 0.45)) * (26 + i * 10) +
            Math.cos(x * 0.002 + time * (0.9 + i * 0.35)) * (16 + i * 7);

          if (x === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }

        context.lineTo(width, height);
        context.lineTo(0, height);
        context.closePath();

        context.fillStyle = `hsla(${220 + hueShift}, 85%, 58%, ${Math.max(alpha, 0.02)})`;
        context.fill();
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    resize();
    render();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
};

export default ShaderBackground;
