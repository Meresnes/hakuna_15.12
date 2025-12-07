import { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import type { Flame } from './useSocket';

interface UseCanvasAnimationOptions {
  flames: Flame[];
  brightness?: number;
}

interface CanvasFlame extends Flame {
  y: number;
  progress: number;
  scale: number;
  opacity: number;
  xOffset: number; // For horizontal drift
  morphPhase: number; // For flame shape animation
  gsapAnimation?: gsap.core.Timeline;
}

const ANIMATION_DURATION = 10000; // 6 seconds (slower animation)

export function useCanvasAnimation({ flames }: UseCanvasAnimationOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const flamesRef = useRef<CanvasFlame[]>([]);
  const timeRef = useRef(0);

  // Update flames reference when props change
  useEffect(() => {
    // Add new flames
    flames.forEach(flame => {
      const exists = flamesRef.current.some(f => f.id === flame.id);
      if (!exists) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const canvasHeight = canvas.height;
        const startY = canvasHeight + 50; // Start below screen
        const endY = -100; // End above screen
        
        const newFlame: CanvasFlame = {
          ...flame,
          y: startY,
          progress: 0,
          scale: 1.6,
          opacity: 1,
          xOffset: 0,
          morphPhase: Math.random() * Math.PI * 2, // Random starting phase for morphing
        };

        // Use GSAP for smooth animation
        const tl = gsap.timeline({
          onComplete: () => {
            // Remove flame when animation completes
            flamesRef.current = flamesRef.current.filter(f => f.id !== flame.id);
          },
        });

        // Animate Y position with smooth easing
        tl.to(newFlame, {
          y: endY,
          duration: ANIMATION_DURATION / 1000,
          ease: 'power2.out', // Smooth deceleration
        });

        // Animate scale (shrink as it rises)
        tl.to(newFlame, {
          scale: 0.5,
          duration: ANIMATION_DURATION / 1000,
          ease: 'power2.out',
        }, 0); // Start at same time

        // Animate opacity (fade out)
        tl.to(newFlame, {
          opacity: 0,
          duration: ANIMATION_DURATION / 1000,
          ease: 'power1.out',
        }, 0);

        // Add subtle horizontal drift for more natural movement
        const driftAmount = (Math.random() - 0.5) * 40; // Random drift -20 to +20 pixels
        tl.to(newFlame, {
          xOffset: driftAmount,
          duration: ANIMATION_DURATION / 1000,
          ease: 'sine.inOut', // Smooth sine wave for natural drift
        }, 0);

        newFlame.gsapAnimation = tl;
        flamesRef.current.push(newFlame);
      }
    });

    // Clean up old flames
    flamesRef.current = flamesRef.current.filter(flame => {
      const age = Date.now() - flame.startTime;
      return age < ANIMATION_DURATION + 1000; // Keep a bit longer for cleanup
    });
  }, [flames]);

  // Draw enhanced flame on canvas
  const drawFlame = useCallback((
    ctx: CanvasRenderingContext2D,
    flame: CanvasFlame,
    canvasWidth: number,
    canvasHeight: number,
    time: number
  ) => {
    const { x, color, name, scale, opacity, xOffset, morphPhase } = flame;
    
    // Calculate position with drift
    const px = (x / 100) * canvasWidth + xOffset;
    const py = flame.y;
    
    // Skip if off screen
    if (py < -100 || py > canvasHeight + 100) return;
    
    // Animated morphing phase for flame shape (creates flickering effect)
    const morphSpeed = 0.003;
    const currentMorph = morphPhase + time * morphSpeed;
    const morphAmount = Math.sin(currentMorph) * 0.15; // 15% variation
    
    // Enhanced glow effect (larger)
    const glowRadius = 70 * scale;
    const glowGradient = ctx.createRadialGradient(px, py, 0, px, py, glowRadius);
    const glowOpacity = Math.floor(opacity * 180).toString(16).padStart(2, '0');
    const glowMidOpacity = Math.floor(opacity * 100).toString(16).padStart(2, '0');
    
    glowGradient.addColorStop(0, `${color}${glowOpacity}`);
    glowGradient.addColorStop(0.3, `${color}${glowMidOpacity}`);
    glowGradient.addColorStop(0.6, `${color}40`);
    glowGradient.addColorStop(1, 'transparent');
    
    // Draw outer glow
    ctx.save();
    ctx.globalAlpha = opacity * 0.6;
    ctx.beginPath();
    ctx.fillStyle = glowGradient;
    ctx.arc(px, py, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Draw flame shape with morphing animation (larger)
    ctx.save();
    ctx.translate(px, py);
    
    const flameScale = scale * 2.0; // Increased from 1.3 to 2.0
    ctx.scale(flameScale, flameScale);
    
    // Apply subtle rotation for more dynamic look
    const rotation = Math.sin(currentMorph * 0.5) * 0.1; // Small rotation
    ctx.rotate(rotation);
    
    // Flame body path with morphing
    ctx.beginPath();
    const morphLeft = 1 + morphAmount;
    const morphRight = 1 - morphAmount;
    
    ctx.moveTo(0, 12);
    
    // Left side with morphing
    ctx.bezierCurveTo(
      -4 * morphLeft, 10, 
      -6 * morphLeft, 6, 
      -6 * morphLeft, 2
    );
    ctx.bezierCurveTo(
      -6 * morphLeft, -2, 
      -4 * morphLeft, -6, 
      -2 * morphLeft, -10
    );
    ctx.bezierCurveTo(
      -1 * morphLeft, -12, 
      0, -14, 
      0, -14
    );
    
    // Right side with morphing
    ctx.bezierCurveTo(
      0, -14, 
      1 * morphRight, -12, 
      2 * morphRight, -10
    );
    ctx.bezierCurveTo(
      4 * morphRight, -6, 
      6 * morphRight, -2, 
      6 * morphRight, 2
    );
    ctx.bezierCurveTo(
      6 * morphRight, 6, 
      4 * morphRight, 10, 
      0, 12
    );
    
    ctx.closePath();
    
    // Enhanced radial gradient (larger)
    const gradientCenterY = -2;
    const gradientRadius = 18; // Increased from 14
    const flameGradient = ctx.createRadialGradient(0, gradientCenterY, 0, 0, gradientCenterY, gradientRadius);
    flameGradient.addColorStop(0, '#fffef0');
    flameGradient.addColorStop(0.2, '#ffdc00');
    flameGradient.addColorStop(0.5, color);
    flameGradient.addColorStop(0.8, `${color}CC`);
    flameGradient.addColorStop(1, `${color}00`);
    
    ctx.fillStyle = flameGradient;
    ctx.globalAlpha = opacity;
    ctx.fill();
    
    // Inner white core with pulsing effect
    const corePulse = 1 + Math.sin(currentMorph * 2) * 0.1;
    ctx.beginPath();
    ctx.ellipse(0, gradientCenterY, 3 * corePulse, 8 * corePulse, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 254, 240, ${opacity * 0.9})`;
    ctx.fill();
    
    // Add bright center highlight
    ctx.beginPath();
    ctx.ellipse(0, gradientCenterY - 2, 2 * corePulse, 4 * corePulse, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.6})`;
    ctx.fill();
    
    ctx.restore();

    // Draw name text with enhanced styling
    if (opacity > 0.3) {
      ctx.save();
      const fontSize = 26 * scale;
      ctx.font = `bold ${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      
      // Enhanced text shadow/glow
      ctx.shadowColor = color;
      ctx.shadowBlur = 20 * scale;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Text outline for better readability
      ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.7})`;
      ctx.lineWidth = 3 * scale;
      ctx.strokeText(name, px, py + 90 * scale); // Adjusted for larger flame
      
      // Main text
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fillText(name, px, py + 90 * scale); // Adjusted for larger flame
      
      ctx.restore();
    }
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    timeRef.current += 16; // Approximate frame time (60fps)
    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Update and draw flames
    flamesRef.current.forEach(flame => {
      // Calculate progress for cleanup
      const age = Date.now() - flame.startTime;
      flame.progress = Math.min(age / ANIMATION_DURATION, 1);
      
      if (flame.progress < 1.1) { // Draw slightly beyond completion for smooth fade
        drawFlame(ctx, flame, width, height, timeRef.current);
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
      // Clean up GSAP animations
      flamesRef.current.forEach(flame => {
        if (flame.gsapAnimation) {
          flame.gsapAnimation.kill();
        }
      });
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
