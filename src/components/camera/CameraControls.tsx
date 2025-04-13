
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, FlipHorizontal, Lightbulb } from 'lucide-react';

interface CameraControlsProps {
  hasFlash: boolean;
  flashOn: boolean;
  isProcessing: boolean;
  onCaptureClick: () => void;
  onFlashToggle: () => void;
  onCameraSwitch: () => void;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  hasFlash,
  flashOn,
  isProcessing,
  onCaptureClick,
  onFlashToggle,
  onCameraSwitch
}) => {
  return (
    <div className="absolute bottom-4 inset-x-0 flex justify-center gap-4">
      {hasFlash && (
        <Button 
          variant="secondary" 
          size="icon"
          className="rounded-full w-12 h-12"
          onClick={onFlashToggle}
          disabled={isProcessing}
        >
          <Lightbulb className={`h-6 w-6 ${flashOn ? 'text-yellow-400' : ''}`} />
        </Button>
      )}
      <Button 
        variant="default"
        size="icon"
        className="rounded-full w-14 h-14 bg-primary"
        onClick={onCaptureClick}
        disabled={isProcessing}
      >
        <Camera className="h-7 w-7" />
        {isProcessing && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></span>
          </span>
        )}
      </Button>
      <Button 
        variant="secondary" 
        size="icon"
        className="rounded-full w-12 h-12"
        onClick={onCameraSwitch}
        disabled={isProcessing}
      >
        <FlipHorizontal className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default CameraControls;
