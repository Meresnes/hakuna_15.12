import { useCanvasAnimation } from '../hooks/useCanvasAnimation';
import type { Flame } from '../hooks/useSocket';

interface PresenterCanvasProps {
  flames: Flame[];
  brightness?: number;
}

function PresenterCanvas({ flames, brightness = 1 }: PresenterCanvasProps) {
  const { canvasRef } = useCanvasAnimation({ flames, brightness });

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{
        mixBlendMode: 'screen',
      }}
    />
  );
}

export default PresenterCanvas;

