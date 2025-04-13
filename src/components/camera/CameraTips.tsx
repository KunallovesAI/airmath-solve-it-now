
import React from 'react';

const CameraTips: React.FC = () => {
  return (
    <div className="text-center text-muted-foreground text-sm">
      <p>For best scanning results:</p>
      <ul className="list-disc list-inside">
        <li>Ensure good lighting on the equation</li>
        <li>Keep the device steady</li>
        <li>Focus the equation within the frame</li>
        <li>Allow camera permissions when prompted</li>
      </ul>
    </div>
  );
};

export default CameraTips;
