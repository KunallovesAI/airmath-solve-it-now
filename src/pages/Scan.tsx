
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, ArrowLeft } from 'lucide-react';
import CameraView from '@/components/camera/CameraView';
import CameraCapture from '@/components/camera/CameraCapture';
import CameraTips from '@/components/camera/CameraTips';

const Scan = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const {
    videoRef,
    hasFlash,
    flashOn,
    startCamera,
    toggleFlash,
    stopCamera,
    switchCamera
  } = CameraView({
    isScanning,
    onScanningChange: setIsScanning,
    onCameraError: setCameraError
  });
  
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
            <CameraCapture
              videoRef={videoRef}
              hasFlash={hasFlash}
              flashOn={flashOn}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
              toggleFlash={toggleFlash}
              switchCamera={switchCamera}
            />
          )}
        </Card>
        
        <CameraTips />
      </div>
    </Layout>
  );
};

export default Scan;
