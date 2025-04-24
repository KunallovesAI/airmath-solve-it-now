
/**
 * Formats equation text by removing markdown-style formatting
 * such as ** for bold and other symbols that might interfere with LaTeX rendering
 */
export const formatEquationText = (text: string): string => {
  if (!text) return '';
  
  // Replace markdown-style formatting
  let formattedText = text
    // Remove section headers like "**Equation:**"
    .replace(/\*\*[^*]+:\*\*/g, '')
    // Remove any remaining asterisks
    .replace(/\*\*/g, '')
    // Clean up any additional formatting symbols if needed
    .replace(/\\times/g, '\\times')
    // Trim extra whitespace
    .trim();
  
  return formattedText;
};
