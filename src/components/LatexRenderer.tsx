
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
      
      // Clean up the latex string from any remaining markdown or formatting
      let cleanLatex = latex
        // Remove markdown-like formatting
        .replace(/\*\*/g, '')
        // Replace "$ ... $" with just the content between the $
        .replace(/\$([^$]+)\$/g, '$1')
        // Remove dots between formulas to improve rendering
        .replace(/\.\s*/g, ' ')
        // Remove extra spaces
        .trim();
      
      // Don't try to render empty strings
      if (!cleanLatex) {
        return { __html: '' };
      }

      // For very long expressions, try to extract just the math part
      if (cleanLatex.length > 100) {
        // Try to find equation patterns
        const mathPattern = /\\int|\\sum|\\frac|\\sqrt|\$/;
        if (mathPattern.test(cleanLatex)) {
          const matches = cleanLatex.match(/(\\\w+\{.*?\}|\\\w+|\$.*?\$)/g);
          if (matches) {
            cleanLatex = matches.join(' ');
          }
        }
      }

      return {
        __html: Katex.renderToString(cleanLatex, {
          throwOnError: false,
          displayMode: displayMode,
          output: 'html'
        })
      };
    } catch (error) {
      console.error('Error rendering LaTeX:', error, 'Input was:', latex);
      // Display a simplified version of the raw text if rendering fails
      return { __html: `${latex.substring(0, 50)}${latex.length > 50 ? '...' : ''}` };
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
