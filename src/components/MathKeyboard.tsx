
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface MathKeyboardProps {
  onInput: (value: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

const MathKeyboard: React.FC<MathKeyboardProps> = ({ onInput, onBackspace, onClear }) => {
  const [activeTab, setActiveTab] = useState('basic');

  // Define keyboard layouts
  const basicKeys = [
    ['1', '2', '3', '+', '('],
    ['4', '5', '6', '-', ')'],
    ['7', '8', '9', '×', '='],
    ['0', '.', '^', '÷', '√']
  ];

  const advancedKeys = [
    ['π', 'θ', 'α', '∞', '∫'],
    ['sin', 'cos', 'tan', 'log', 'ln'],
    ['!', '|x|', '\\frac{}{}', '\\sqrt{}', '\\sum'],
    ['lim', '\\vec{}', '\\overrightarrow{}', '\\int_{}^{}', '≈']
  ];

  // CSS classes for keyboard buttons
  const buttonClass = 'h-12 text-center flex items-center justify-center';

  // Handle button click
  const handleButtonClick = (value: string) => {
    onInput(value);
  };

  return (
    <div className="math-keyboard mt-4 border rounded-lg overflow-hidden">
      <Tabs defaultValue="basic" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="p-2">
          <div className="grid grid-cols-5 gap-2">
            {basicKeys.map((row, rowIndex) => (
              React.Children.toArray(
                row.map(key => (
                  <Button 
                    variant="outline" 
                    className={buttonClass} 
                    onClick={() => handleButtonClick(key)}
                  >
                    {key}
                  </Button>
                ))
              )
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="p-2">
          <div className="grid grid-cols-5 gap-2">
            {advancedKeys.map((row, rowIndex) => (
              React.Children.map(row, key => (
                <Button 
                  variant="outline" 
                  className={buttonClass} 
                  onClick={() => handleButtonClick(key)}
                >
                  {key}
                </Button>
              ))
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="control-buttons grid grid-cols-2 gap-2 p-2 border-t">
        <Button variant="outline" onClick={onBackspace}>Backspace</Button>
        <Button variant="outline" onClick={onClear}>Clear</Button>
      </div>
    </div>
  );
};

export default MathKeyboard;
