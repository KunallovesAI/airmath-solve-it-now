
import React from 'react';
import Katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
  latex: string;
  className?: string;
  displayMode?: boolean;
}

const LatexRenderer: React.FC<LatexRendererProps> = ({ 
  latex, 
  className = "", 
  displayMode = false 
}) => {
  // Handle LaTeX rendering safely
  const renderLatex = () => {
    try {
      if (typeof latex !== 'string') {
        console.error('Invalid latex input (not a string):', latex);
        return { __html: 'Error: Invalid input format' };
      }
      
      // Don't add extra $ symbols - use the raw latex input
      return {
        __html: Katex.renderToString(latex, {
          throwOnError: false,
          displayMode: displayMode
        })
      };
    } catch (error) {
      console.error('Error rendering LaTeX:', error);
      return { __html: `Error rendering: ${latex}` };
    }
  };

  return (
    <div 
      className={`equation-container ${className}`}
      dangerouslySetInnerHTML={renderLatex()}
    />
  );
};

export default LatexRenderer;
