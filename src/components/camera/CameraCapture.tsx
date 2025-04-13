
import React, { useRef } from 'react';
import { extractTextFromImage } from '@/utils/visionApi';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import ScannerOverlay from './ScannerOverlay';
import CameraControls from './CameraControls';

interface CameraCaptureProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  hasFlash: boolean;
  flashOn: boolean;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  toggleFlash: () => void;
  switchCamera: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  videoRef,
  hasFlash,
  flashOn,
  isProcessing,
  setIsProcessing,
  toggleFlash,
  switchCamera
}) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      setIsProcessing(true);
      toast.info("Processing image...");
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error("Failed to process image");
        setIsProcessing(false);
        return;
      }
      
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get the image data from the canvas
      const imageData = canvas.toDataURL('image/jpeg');
      
      // Extract text using Google Vision API
      const extractedText = await extractTextFromImage(imageData);
      
      if (!extractedText) {
        toast.error("No text detected in the image. Try again with clearer lighting.");
        setIsProcessing(false);
        return;
      }
      
      toast.success("Math expression detected!");
      
      // Navigate to the results page
      navigate(`/results?equation=${encodeURIComponent(extractedText)}`);
    } catch (error) {
      console.error('Error capturing image:', error);
      toast.error("Failed to process image");
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline
        muted
        className="w-full h-auto"
        style={{ maxHeight: "70vh" }}
      />
      
      <ScannerOverlay isProcessing={isProcessing} />
      
      <CameraControls
        hasFlash={hasFlash}
        flashOn={flashOn}
        isProcessing={isProcessing}
        onCaptureClick={captureImage}
        onFlashToggle={toggleFlash}
        onCameraSwitch={switchCamera}
      />
      
      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
