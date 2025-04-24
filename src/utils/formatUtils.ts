
/**
 * Formats equation text by removing markdown-style formatting
 * such as ** for bold and other symbols that might interfere with LaTeX rendering
 */
export const formatEquationText = (text: string): string => {
  if (!text) return '';
  
  // For history display, we want minimal processing to preserve original format
  let formattedText = text
    // Remove markdown-style formatting
    .replace(/\*\*[^*]+:\*\*/g, '')
    .replace(/\*\*/g, '')
    // Clean up raw LaTeX markers but preserve original structure
    .trim();
  
  return formattedText;
};

/**
 * Formats the result to show only the final equation
 */
export const formatResultText = (text: string): string => {
  if (!text) return '';
  
  // Find the most likely result part
  const resultMatch = text.match(/(?:=\s*|result\s*is\s*|answer\s*is\s*)([^\.]+)/i);
  if (resultMatch && resultMatch[1]) {
    return resultMatch[1].trim();
  }
  
  // If we couldn't find a clear result pattern, just return a cleaner version of the text
  return text
    .replace(/\*\*/g, '')
    .replace(/Result:|\s+/g, ' ')
    .trim();
};
