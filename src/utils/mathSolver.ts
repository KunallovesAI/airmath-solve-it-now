
// This is a simple implementation of a math solver
// In a real app, this would be connected to a more robust math engine

interface SolutionStep {
  explanation: string;
  expression: string;
}

interface SolutionResult {
  original: string;
  steps: SolutionStep[];
  result: string;
  graph?: boolean;
  error?: string;
}

/**
 * Main solver function that takes an equation and returns a solution
 */
export const solveEquation = async (equation: string): Promise<SolutionResult> => {
  try {
    // First prepare the equation for processing
    const cleanedEquation = cleanupEquation(equation);
    
    // Extract the actual equation and solution from Gemini's response
    const parsedData = parseGeminiResponse(cleanedEquation);
    
    // Return the parsed solution
    return parsedData;
  } catch (error) {
    console.error("Error solving equation:", error);
    return {
      original: equation,
      steps: [],
      result: "Error solving equation",
      error: "Failed to process this equation. Please try again."
    };
  }
};

/**
 * Cleanup function to normalize equations from OCR
 */
const cleanupEquation = (equation: string): string => {
  // Replace common OCR errors in equations
  let cleaned = equation
    .replace(/[×]/g, '*')  // Replace × with *
    .replace(/[÷]/g, '/')  // Replace ÷ with /
    .replace(/\s+/g, ' ')  // Normalize spaces
    .trim();
    
  return cleaned;
};

/**
 * Parse the Gemini API response to extract equation, steps, and result
 */
const parseGeminiResponse = (response: string): SolutionResult => {
  console.log("Parsing Gemini response:", response);
  
  // Set default values
  let originalEquation = response;
  let finalResult = "Could not extract result";
  let solutionSteps: SolutionStep[] = [];
  
  try {
    // Extract the original equation
    const equationMatch = response.match(/\*\*Equation:\*\*\s*\$(.*?)\$/);
    if (equationMatch && equationMatch[1]) {
      originalEquation = equationMatch[1].trim();
    }
    
    // Extract the final answer
    const resultMatch = response.match(/\*\*Final Answer:\*\*\s*\$(.*?)\$/);
    if (resultMatch && resultMatch[1]) {
      finalResult = resultMatch[1].trim();
    }
    
    // Extract the steps - look for numbered steps
    const stepsSection = response.match(/\*\*Steps to Solve:\*\*([\s\S]*?)(?:\*\*Final Answer|$)/);
    
    if (stepsSection && stepsSection[1]) {
      const stepText = stepsSection[1];
      
      // Match all numbered steps
      const stepRegex = /(\d+\.\s*\*\*[^*]+\*\*:?)([\s\S]*?)(?=\d+\.\s*\*\*|$)/g;
      let match;
      
      while ((match = stepRegex.exec(stepText)) !== null) {
        const stepTitle = match[1].replace(/\*\*/g, '').trim();
        const stepContent = match[2].trim();
        
        // Extract LaTeX expressions from the step content
        const latexMatches = stepContent.match(/\$(.*?)\$/g);
        const expressions = latexMatches ? latexMatches.map(m => m.replace(/^\$|\$$/g, '').trim()) : [];
        
        // Add each expression as a step
        if (expressions.length > 0) {
          solutionSteps.push({
            explanation: stepTitle,
            expression: expressions[expressions.length - 1] // Use the last expression as the result of this step
          });
        }
      }
    }
    
    // If no steps were extracted, create a single step with the whole response
    if (solutionSteps.length === 0) {
      solutionSteps.push({
        explanation: "Equation processing",
        expression: originalEquation
      });
    }
    
    return {
      original: originalEquation,
      steps: solutionSteps,
      result: finalResult,
      graph: false
    };
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    return {
      original: response,
      steps: [
        {
          explanation: "Raw Gemini response",
          expression: response
        }
      ],
      result: finalResult,
      graph: false
    };
  }
};

export const formatLatex = (equation: string): string => {
  // Replace common equation patterns with LaTeX format
  // This is a simplified implementation
  let formatted = equation;
  
  // Replace sqrt with \sqrt{}
  formatted = formatted.replace(/sqrt\(([^)]+)\)/g, "\\sqrt{$1}");
  
  // Replace ^ with ^{}
  formatted = formatted.replace(/\^(\d+)/g, "^{$1}");
  
  // Replace fractions like a/b with \frac{a}{b}
  formatted = formatted.replace(/(\d+)\/(\d+)/g, "\\frac{$1}{$2}");
  
  // Replace integrals
  formatted = formatted.replace(/int\s/g, "\\int ");
  
  return formatted;
};
