
import React from 'react';

interface ScannerOverlayProps {
  isProcessing: boolean;
}

const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ isProcessing }) => {
  return (
    <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
      <div className="w-4/5 h-20 border-2 border-primary animate-pulse-slow rounded-md flex items-center justify-center">
        <div className="absolute w-8 h-8 border-t-2 border-l-2 border-primary -top-1 -left-1 rounded-tl-md"></div>
        <div className="absolute w-8 h-8 border-t-2 border-r-2 border-primary -top-1 -right-1 rounded-tr-md"></div>
        <div className="absolute w-8 h-8 border-b-2 border-l-2 border-primary -bottom-1 -left-1 rounded-bl-md"></div>
        <div className="absolute w-8 h-8 border-b-2 border-r-2 border-primary -bottom-1 -right-1 rounded-br-md"></div>
        <p className="text-white text-shadow bg-black/50 px-2 py-1 rounded text-sm">
          {isProcessing ? "Processing..." : "Hold steady to scan equation"}
        </p>
      </div>
    </div>
  );
};

export default ScannerOverlay;
