
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

interface LatexRendererProps {
  latex: string;
  className?: string;
}

const LatexRenderer = ({ latex, className = "" }: LatexRendererProps) => {
  // Ensure the latex is enclosed in proper delimiters if not already
  const formattedLatex = latex.startsWith('$') ? latex : `$${latex}$`;

  return (
    <div className={`equation-container ${className}`}>
      <Latex>{formattedLatex}</Latex>
    </div>
  );
};

export default LatexRenderer;
