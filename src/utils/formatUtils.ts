
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
    // Extract just the equation part if there's a lot of explanatory text
    // Look for common equation patterns
    .replace(/([^\n]+)\.The power rule.+/s, '$1')
    // Remove "where n is any real number" explanations
    .replace(/where\s*n\s*is\s*any\s*real\s*number.+/s, '')
    // Remove "and C is the constant of integration" explanations
    .replace(/and\s*C\s*is\s*the\s*constant\s*of\s*integration.+/s, '')
    // Simplify the equation display by removing excessive text
    .replace(/1\.\s*|2\.\s*/g, '')
    // Trim extra whitespace
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
