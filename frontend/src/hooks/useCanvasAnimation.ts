import { useRef, useEffect, useCallback } from 'react';
import type { Flame } from './useSocket';

interface UseCanvasAnimationOptions {
  flames: Flame[];
  brightness?: number;
}

interface CanvasFlame extends Flame {
  y: number;
  progress: number;
}

const ANIMATION_DURATION = 4000; // 4 seconds

export function useCanvasAnimation({ flames }: UseCanvasAnimationOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const flamesRef = useRef<CanvasFlame[]>([]);

  // Update flames reference when props change
  useEffect(() => {
    const now = Date.now();
    
    // Add new flames
    flames.forEach(flame => {
      const exists = flamesRef.current.some(f => f.id === flame.id);
      if (!exists) {
        flamesRef.current.push({
          ...flame,
          y: 1, // Start at bottom (normalized)
          progress: 0,
        });
      }
    });

    // Remove old flames
    flamesRef.current = flamesRef.current.filter(flame => {
      const age = now - flame.startTime;
      return age < ANIMATION_DURATION;
    });
  }, [flames]);

  // Draw flame on canvas
  const drawFlame = useCallback((
    ctx: CanvasRenderingContext2D,
    flame: CanvasFlame,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const { x, progress, color, name } = flame;
    
    // Calculate position
    const px = (x / 100) * canvasWidth;
    const py = canvasHeight - (progress * canvasHeight * 1.2); // Rise above screen
    
    // Calculate scale and opacity based on progress
    const scale = 1 - progress * 0.5; // Shrink as it rises
    const opacity = 1 - Math.pow(progress, 2); // Fade out
    
    // Draw glow
    const gradient = ctx.createRadialGradient(px, py, 0, px, py, 60 * scale);
    gradient.addColorStop(0, `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
    gradient.addColorStop(0.5, `${color}${Math.floor(opacity * 128).toString(16).padStart(2, '0')}`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(px, py, 60 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Draw flame shape (from Thanks.tsx SVG path)
    // SVG viewBox: 0 0 24 32, center at (12, 16)
    ctx.save();
    ctx.translate(px, py);
    
    // Scale factor for flame size
    const flameScale = scale * 1.2;
    ctx.scale(flameScale, flameScale);
    
    // Flame body path - convert SVG coordinates to canvas (centered at origin)
    // SVG: M 12 28 -> canvas: (0, 12) relative to center (12, 16)
    ctx.beginPath();
    ctx.moveTo(0, 12); // (12, 28) - (12, 16) = (0, 12)
    
    // Left side curves (convert from SVG absolute to canvas relative)
    // C 8 26 6 22 6 18 -> relative to center: (-4, 10) (-6, 6) (-6, 2)
    ctx.bezierCurveTo(-4, 10, -6, 6, -6, 2);
    // C 6 14 8 10 10 6 -> relative: (-6, -2) (-4, -6) (-2, -10)
    ctx.bezierCurveTo(-6, -2, -4, -6, -2, -10);
    // C 11 4 12 2 12 2 -> relative: (-1, -12) (0, -14) (0, -14)
    ctx.bezierCurveTo(-1, -12, 0, -14, 0, -14);
    
    // Right side curves (mirror)
    // C 12 2 13 4 14 6 -> relative: (0, -14) (1, -12) (2, -10)
    ctx.bezierCurveTo(0, -14, 1, -12, 2, -10);
    // C 16 10 18 14 18 18 -> relative: (4, -6) (6, -2) (6, 2)
    ctx.bezierCurveTo(4, -6, 6, -2, 6, 2);
    // C 18 22 16 26 12 28 -> relative: (6, 6) (4, 10) (0, 12)
    ctx.bezierCurveTo(6, 6, 4, 10, 0, 12);
    
    ctx.closePath();
    
    // Radial gradient matching Thanks.tsx (cx="35%" cy="70%" = approximately (0, -2) in our coordinate system)
    const gradientCenterY = -2;
    const gradientRadius = 12;
    const flameGradient = ctx.createRadialGradient(0, gradientCenterY, 0, 0, gradientCenterY, gradientRadius);
    flameGradient.addColorStop(0, '#fffef0');
    flameGradient.addColorStop(0.4, '#ffdc00');
    flameGradient.addColorStop(0.8, color);
    flameGradient.addColorStop(1, `${color}00`);
    
    ctx.fillStyle = flameGradient;
    ctx.globalAlpha = opacity;
    ctx.fill();
    
    // Inner white ellipse (core of flame) - ellipse at (12, 14) in SVG = (0, -2) in canvas
    ctx.beginPath();
    ctx.ellipse(0, gradientCenterY, 3, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 254, 240, ${opacity * 0.8})`;
    ctx.fill();
    
    ctx.restore();

    // Draw name text
    if (opacity > 0.3) {
      ctx.save();
      const fontSize = 28 * scale;
      ctx.font = `bold ${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.5})`;
      ctx.lineWidth = 2;
      ctx.strokeText(name, px, py + 60 * scale);
      ctx.fillText(name, px, py + 60 * scale);
      ctx.restore();
    }
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = Date.now();
    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Update and draw flames
    flamesRef.current.forEach(flame => {
      const age = now - flame.startTime;
      flame.progress = Math.min(age / ANIMATION_DURATION, 1);
      
      if (flame.progress < 1) {
        drawFlame(ctx, flame, width, height);
      }
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [drawFlame]);

  // Start animation loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { canvasRef };
}

