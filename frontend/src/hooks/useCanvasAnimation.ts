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

    // Draw flame shape
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(scale, scale);
    
    // Flame body
    ctx.beginPath();
    ctx.moveTo(0, 40);
    ctx.bezierCurveTo(-25, 20, -20, -30, 0, -50);
    ctx.bezierCurveTo(20, -30, 25, 20, 0, 40);
    ctx.closePath();
    
    const flameGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 50);
    flameGradient.addColorStop(0, '#fffef0');
    flameGradient.addColorStop(0.3, '#ffdc00');
    flameGradient.addColorStop(0.6, color);
    flameGradient.addColorStop(1, `${color}00`);
    
    ctx.fillStyle = flameGradient;
    ctx.globalAlpha = opacity;
    ctx.fill();
    
    ctx.restore();

    // Draw name text
    if (opacity > 0.3) {
      ctx.save();
      ctx.font = `bold ${16 * scale}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
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

