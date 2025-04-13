
import React from 'react';
import Latex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
  latex: string;
  className?: string;
}

const LatexRenderer: React.FC<LatexRendererProps> = ({ latex, className = "" }) => {
  // Ensure the latex is enclosed in proper delimiters if not already
  const formattedLatex = latex.startsWith('$') ? latex : `$${latex}$`;

  return (
    <div 
      className={`equation-container ${className}`}
      dangerouslySetInnerHTML={{
        __html: Latex.renderToString(formattedLatex, {
          throwOnError: false,
          displayMode: false
        })
      }}
    />
  );
};

export default LatexRenderer;
