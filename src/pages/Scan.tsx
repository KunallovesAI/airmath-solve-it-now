
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, FlipHorizontal, Lightbulb, ArrowLeft } from 'lucide-react';
import { toast } from "sonner";

// Define extended interfaces for torch capability
interface ExtendedMediaTrackCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}

interface ExtendedConstraintSet extends MediaTrackConstraintSet {
  advanced?: { torch?: boolean }[];
}

const Scan = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const startCamera = async () => {
    try {
      // Reset any previous errors
      setCameraError(null);
      
      const constraints = {
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Camera access granted");
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          if (videoRef.current) {
            videoRef.current.play().catch(e => {
              console.error("Error playing video:", e);
              setCameraError("Failed to start video playback");
            });
          }
        };
        
        setIsScanning(true);
        
        // Check if flash is available
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities ? track.getCapabilities() as ExtendedMediaTrackCapabilities : {};
        setHasFlash(capabilities.torch || false);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError("Camera access denied or not available");
      toast.error("Camera access denied or not available");
    }
  };

  const toggleFlash = async () => {
    if (!videoRef.current?.srcObject) return;
    
    try {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      
      // Use the extended interface with type assertion
      const capabilities = track.getCapabilities() as ExtendedMediaTrackCapabilities;
      
      if (capabilities && 'torch' in capabilities) {
        const constraints: ExtendedConstraintSet = {
          advanced: [{ torch: !flashOn }]
        };
        
        await track.applyConstraints(constraints as MediaTrackConstraints);
        setFlashOn(!flashOn);
        toast.info(flashOn ? "Flash turned off" : "Flash turned on");
      } else {
        toast.error("Flash control not available on this device");
      }
    } catch (error) {
      console.error('Error toggling flash:', error);
      toast.error("Flash control not available");
    }
  };
  
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // In a real app, here we would send the image to a math OCR service
    // For demo purposes, we'll simulate finding an equation
    toast.success("Processing image...");
    
    setTimeout(() => {
      // Simulate successful equation extraction
      const equation = "3x + 2 = 8";
      toast.success("Equation detected!");
      
      // Stop the camera
      stopCamera();
      
      // Navigate to the results page
      navigate(`/results?equation=${encodeURIComponent(equation)}`);
    }, 1500);
  };
  
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsScanning(false);
      setFlashOn(false);
    }
  };
  
  const switchCamera = async () => {
    stopCamera();
    
    try {
      const constraints = {
        video: { 
          facingMode: 'user', // Switch to front camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
      
      toast.info("Camera switched");
    } catch (error) {
      console.error('Error switching camera:', error);
      toast.error("Failed to switch camera");
    }
  };
  
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Scan Equation</h1>
        </div>

        <Card className="overflow-hidden relative">
          {!isScanning ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                Position your camera to focus on a math equation
              </p>
              {cameraError && (
                <p className="text-red-500 mb-4">{cameraError}</p>
              )}
              <Button onClick={startCamera}>
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>
            </div>
          ) : (
            <div className="relative">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                className="w-full h-auto"
                style={{ maxHeight: "70vh" }}
              />
              
              {/* Overlay with instruction */}
              <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
                <div className="w-4/5 h-20 border-2 border-primary animate-pulse-slow rounded-md flex items-center justify-center">
                  <p className="text-white text-shadow bg-black/50 px-2 py-1 rounded text-sm">
                    Hold steady to scan equation
                  </p>
                </div>
              </div>
              
              <div className="absolute bottom-4 inset-x-0 flex justify-center gap-4">
                {hasFlash && (
                  <Button 
                    variant="secondary" 
                    size="icon"
                    className="rounded-full w-12 h-12"
                    onClick={toggleFlash}
                  >
                    <Lightbulb className={`h-6 w-6 ${flashOn ? 'text-yellow-400' : ''}`} />
                  </Button>
                )}
                <Button 
                  variant="default"
                  size="icon"
                  className="rounded-full w-14 h-14 bg-primary"
                  onClick={captureImage}
                >
                  <Camera className="h-7 w-7" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="icon"
                  className="rounded-full w-12 h-12"
                  onClick={switchCamera}
                >
                  <FlipHorizontal className="h-6 w-6" />
                </Button>
              </div>
            </div>
          )}
        </Card>
        
        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </Layout>
  );
};

export default Scan;
