
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eraser, Send, Trash2 } from 'lucide-react';
import { toast } from "sonner";

const Draw = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setCanvasContext(ctx);
    
    // Set canvas dimensions to match display size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Set up canvas style
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--foreground')
        .trim();
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);
  
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasContext) return;
    
    setIsDrawing(true);
    setHasDrawn(true);
    
    const { offsetX, offsetY } = getEventCoordinates(e);
    canvasContext.beginPath();
    canvasContext.moveTo(offsetX, offsetY);
  };
  
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasContext) return;
    
    const { offsetX, offsetY } = getEventCoordinates(e);
    canvasContext.lineTo(offsetX, offsetY);
    canvasContext.stroke();
  };
  
  const stopDrawing = () => {
    if (!canvasContext) return;
    
    setIsDrawing(false);
    canvasContext.closePath();
  };
  
  const getEventCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };
    
    if ('touches' in e) {
      // Touch event
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      return {
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top
      };
    } else {
      // Mouse event
      return {
        offsetX: e.nativeEvent.offsetX,
        offsetY: e.nativeEvent.offsetY
      };
    }
  };
  
  const clearCanvas = () => {
    if (!canvasContext || !canvasRef.current) return;
    
    canvasContext.clearRect(
      0, 
      0, 
      canvasRef.current.width, 
      canvasRef.current.height
    );
    setHasDrawn(false);
  };
  
  const recognizeEquation = () => {
    if (!hasDrawn) {
      toast.error("Please draw an equation first");
      return;
    }
    
    toast.info("Analyzing your handwriting...");
    
    // In a real app, we would send the canvas image to a handwriting recognition service
    // For demo purposes, we'll simulate recognition
    setTimeout(() => {
      // Simulate successful recognition
      const equation = "\\int x^2 dx";
      toast.success("Equation recognized!");
      
      // Navigate to the results page
      navigate(`/results?equation=${encodeURIComponent(equation)}`);
    }, 1500);
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Draw Equation</h1>
        </div>

        <Card className="overflow-hidden p-0">
          <canvas
            ref={canvasRef}
            className="w-full bg-card touch-none"
            style={{ height: '300px' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          
          <div className="p-4 border-t flex justify-between items-center">
            <Button
              variant="outline"
              onClick={clearCanvas}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
            
            <Button
              variant="default"
              onClick={recognizeEquation}
              disabled={!hasDrawn}
            >
              <Send className="h-4 w-4 mr-2" />
              Recognize
            </Button>
          </div>
        </Card>
        
        <div className="text-center text-muted-foreground text-sm">
          <p>Draw your equation clearly using your finger or stylus</p>
          <p>Supports mathematical symbols, fractions, and more</p>
        </div>
      </div>
    </Layout>
  );
};

export default Draw;
