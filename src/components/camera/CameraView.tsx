
import { useRef, useState, useEffect } from 'react';
import { toast } from "sonner";

// Define extended interfaces for torch capability
interface ExtendedMediaTrackCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}

interface ExtendedConstraintSet extends MediaTrackConstraintSet {
  advanced?: { torch?: boolean }[];
}

interface CameraViewProps {
  isScanning: boolean;
  onScanningChange: (scanning: boolean) => void;
  onCameraError: (error: string | null) => void;
}

const CameraView = ({ 
  isScanning, 
  onScanningChange, 
  onCameraError 
}: CameraViewProps) => {
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const startCamera = async () => {
    try {
      // Reset any previous errors
      onCameraError(null);
      
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
        
        // Make sure the video is displayed properly
        videoRef.current.style.display = 'block';
        videoRef.current.style.width = '100%';
        videoRef.current.style.height = 'auto';
        
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          if (videoRef.current) {
            videoRef.current.play().catch(e => {
              console.error("Error playing video:", e);
              onCameraError("Failed to start video playback");
            });
          }
        };
        
        onScanningChange(true);
        
        // Check if flash is available
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities ? track.getCapabilities() as ExtendedMediaTrackCapabilities : {};
        setHasFlash(capabilities.torch || false);
        
        console.log("Camera started successfully. Flash available:", capabilities.torch);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      onCameraError("Camera access denied or not available");
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
  
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      onScanningChange(false);
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
        onScanningChange(true);
      }
      
      toast.info("Camera switched");
    } catch (error) {
      console.error('Error switching camera:', error);
      toast.error("Failed to switch camera");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return {
    videoRef,
    hasFlash,
    flashOn,
    startCamera,
    toggleFlash,
    stopCamera,
    switchCamera
  };
};

export default CameraView;
