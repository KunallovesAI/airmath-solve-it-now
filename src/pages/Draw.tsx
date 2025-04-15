
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Trash2, Eye } from 'lucide-react';
import { toast } from "sonner";
import { solveMathWithGemini } from '@/utils/geminiApi';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Draw = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    setCanvasContext(ctx);
    
    // Set canvas dimensions to match display size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      // Set physical size to 2x the display size for better resolution
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      
      // Scale the context to maintain the same drawing coordinates
      ctx.scale(2, 2);
      
      // Set white background for better visibility
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set up canvas style for better handwriting recognition
      ctx.lineWidth = 10; // Much thicker lines for better visibility
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#000000'; // Pure black for maximum contrast
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
      e.preventDefault(); // Prevent scrolling when drawing
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
    
    // Clear with white background instead of transparent
    canvasContext.fillStyle = '#ffffff';
    canvasContext.fillRect(
      0, 
      0, 
      canvasRef.current.width / 2, 
      canvasRef.current.height / 2
    );
    
    setHasDrawn(false);
  };
  
  // Preview the drawing before sending to API
  const previewDrawing = () => {
    if (!hasDrawn || !canvasRef.current) {
      toast.error("Please draw an equation first");
      return;
    }
    
    ensureWhiteBackground();
    const imageData = canvasRef.current.toDataURL('image/jpeg', 1.0);
    setPreviewImage(imageData);
    setShowPreview(true);
  };
  
  const recognizeEquation = async () => {
    if (!hasDrawn) {
      toast.error("Please draw an equation first");
      return;
    }
    
    if (!canvasRef.current) return;
    
    setIsProcessing(true);
    toast.info("Analyzing your handwriting...");
    
    try {
      // Process the image to improve contrast
      enhanceImageContrast();
      
      // Ensure canvas has a white background
      ensureWhiteBackground();
      
      // Convert canvas to base64 image data with maximum quality
      const imageData = canvasRef.current.toDataURL('image/jpeg', 1.0);
      setPreviewImage(imageData);
      
      console.log("Sending drawing for recognition...");
      
      // Send to API
      const result = await solveMathWithGemini(imageData);
      
      if (result.error || !result.text) {
        toast.error(result.error || "Failed to recognize equation");
        setIsProcessing(false);
        return;
      }
      
      // Check if any equation was detected
      if (result.text.includes("No equation detected") || 
          result.text.includes("image is blank") ||
          result.text.includes("no equation")) {
        toast.error("No equation detected in your drawing. Please try again with clearer writing.");
        setIsProcessing(false);
        return;
      }
      
      toast.success("Equation successfully recognized!");
      
      // Navigate to the results page with the raw response
      const timestamp = new Date().getTime();
      navigate(`/results?equation=${encodeURIComponent(result.text)}&t=${timestamp}`);
    } catch (error) {
      console.error("Error recognizing equation:", error);
      toast.error("Failed to process equation");
      setIsProcessing(false);
    }
  };
  
  // Ensure the canvas has a white background before image capture
  const ensureWhiteBackground = () => {
    if (!canvasRef.current || !canvasContext) return;
    
    const canvas = canvasRef.current;
    const ctx = canvasContext;
    
    // Get current image data
    const imageData = ctx.getImageData(0, 0, canvas.width/2, canvas.height/2);
    const data = imageData.data;
    
    // Check if the canvas is transparent or has a non-white background
    let hasTransparency = false;
    for (let i = 0; i < data.length; i += 4) {
      // If alpha channel is not 255 (fully opaque)
      if (data[i + 3] < 255) {
        hasTransparency = true;
        break;
      }
    }
    
    if (hasTransparency) {
      // Create a new canvas with white background
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) return;
      
      // Fill with white
      tempCtx.fillStyle = 'white';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Draw original content on top
      tempCtx.drawImage(canvas, 0, 0);
      
      // Copy back to original canvas
      ctx.drawImage(tempCanvas, 0, 0, canvas.width/2, canvas.height/2);
    }
  };
  
  // Enhance the contrast of the drawing
  const enhanceImageContrast = () => {
    if (!canvasRef.current || !canvasContext) return;
    
    const canvas = canvasRef.current;
    const ctx = canvasContext;
    
    // Get current image data
    const imageData = ctx.getImageData(0, 0, canvas.width/2, canvas.height/2);
    const data = imageData.data;
    
    // Enhance contrast - make dark pixels darker and light pixels lighter
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      
      // If pixel is dark (likely part of drawing), make it black
      if (avg < 200) {
        data[i] = 0;     // R
        data[i + 1] = 0; // G
        data[i + 2] = 0; // B
      } else {
        // If pixel is light (likely background), make it white
        data[i] = 255;     // R
        data[i + 1] = 255; // G
        data[i + 2] = 255; // B
      }
    }
    
    // Put the modified image data back on the canvas
    ctx.putImageData(imageData, 0, 0);
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
            className="w-full touch-none"
            style={{ 
              height: '300px', 
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0'
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          
          <div className="p-4 border-t flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex gap-2 w-full sm:w-auto justify-start">
              <Button
                variant="outline"
                onClick={clearCanvas}
                disabled={isProcessing}
                className="flex-1 sm:flex-initial"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
              
              <Button
                variant="outline"
                onClick={previewDrawing}
                disabled={!hasDrawn || isProcessing}
                className="flex-1 sm:flex-initial"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
            
            <Button
              variant="default"
              onClick={recognizeEquation}
              disabled={!hasDrawn || isProcessing}
              className="w-full sm:w-auto"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Recognize
                </>
              )}
            </Button>
          </div>
        </Card>
        
        <div className="text-center text-muted-foreground text-sm">
          <p>Draw your equation clearly using your finger or stylus</p>
          <p>Use thick, dark strokes for better recognition</p>
          <p>Write larger symbols with space between them for best results</p>
          <p>Use the Preview button to check if your drawing is clear enough</p>
        </div>
      </div>
      
      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {previewImage && <img src={previewImage} alt="Captured drawing" className="max-w-full border" />}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowPreview(false)}>Cancel</Button>
            <Button onClick={() => {
              setShowPreview(false);
              recognizeEquation();
            }}>Process Image</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Draw;
