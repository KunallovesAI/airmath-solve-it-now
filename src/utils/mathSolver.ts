// Math solver utility for processing equations and solutions

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
    console.log("Processing equation:", equation);
    
    // Check for error messages from Gemini
    if (equation.includes("No equation detected") || 
        equation.includes("image is blank") ||
        equation.includes("no equation")) {
      return {
        original: "No valid equation detected",
        steps: [],
        result: "Unable to process",
        error: "No valid equation detected in the image. Please try again with clearer writing."
      };
    }
    
    // Extract the actual equation and solution from Gemini's response
    const parsedData = parseGeminiResponse(equation);
    console.log("Parsing Gemini response:", equation);
    
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
    let equationMatch = response.match(/\*\*Equation:\*\*\s*\$(.*?)\$/);
    // Try alternate formats if first pattern doesn't match
    if (!equationMatch || !equationMatch[1]) {
      equationMatch = response.match(/Equation:\s*\$(.*?)\$/);
    }
    if (!equationMatch || !equationMatch[1]) {
      equationMatch = response.match(/\*Equation:\*\s*\$(.*?)\$/);
    }
    if (!equationMatch || !equationMatch[1]) {
      // Try to find any LaTeX expression as a fallback
      equationMatch = response.match(/\$(.*?)\$/);
    }
    
    if (equationMatch && equationMatch[1]) {
      originalEquation = equationMatch[1].trim();
    }
    
    // Extract the final answer
    let resultMatch = response.match(/\*\*Final Answer:\*\*\s*\$(.*?)\$/);
    // Try alternate formats if first pattern doesn't match
    if (!resultMatch || !resultMatch[1]) {
      resultMatch = response.match(/Final Answer:\s*\$(.*?)\$/);
    }
    if (!resultMatch || !resultMatch[1]) {
      resultMatch = response.match(/\*Final Answer:\*\s*\$(.*?)\$/);
    }
    if (!resultMatch || !resultMatch[1]) {
      resultMatch = response.match(/Result:\s*\$(.*?)\$/);
    }
    if (!resultMatch || !resultMatch[1]) {
      resultMatch = response.match(/Answer:\s*\$(.*?)\$/);
    }
    if (!resultMatch || !resultMatch[1]) {
      // Try to find the last LaTeX expression as a fallback for result
      const allLatexMatches = response.match(/\$(.*?)\$/g);
      if (allLatexMatches && allLatexMatches.length > 0) {
        const lastLatex = allLatexMatches[allLatexMatches.length - 1];
        resultMatch = [lastLatex, lastLatex.replace(/^\$|\$$/g, '')];
      }
    }
    
    if (resultMatch && resultMatch[1]) {
      finalResult = resultMatch[1].trim();
    }
    
    // Extract the steps - look for different patterns
    const stepsPatterns = [
      /\*\*Steps to Solve:\*\*([\s\S]*?)(?:\*\*Final Answer|$)/,
      /Steps to Solve:([\s\S]*?)(?:Final Answer|$)/,
      /\*Steps to Solve:\*([\s\S]*?)(?:\*Final Answer|$)/,
      /Solution:([\s\S]*?)(?:Final Answer|$)/,
      /\*\*Solution:\*\*([\s\S]*?)(?:\*\*Final Answer|$)/
    ];
    
    let stepsSection = null;
    for (const pattern of stepsPatterns) {
      const match = response.match(pattern);
      if (match && match[1]) {
        stepsSection = match[1];
        break;
      }
    }
    
    if (stepsSection) {
      const stepText = stepsSection;
      
      // Try to match all numbered steps with different patterns
      const stepPatterns = [
        /(\d+\.\s*\*\*[^*]+\*\*:?)([\s\S]*?)(?=\d+\.\s*\*\*|$)/g,
        /(\d+\.\s*[^:]+:)([\s\S]*?)(?=\d+\.\s*|$)/g,
        /(\*\*Step \d+\*\*:)([\s\S]*?)(?=\*\*Step \d+\*\*:|$)/g,
        /(\*Step \d+\*:)([\s\S]*?)(?=\*Step \d+\*:|$)/g,
        /(Step \d+:)([\s\S]*?)(?=Step \d+:|$)/g,
        /(\**[^:*]+\**:)([\s\S]*?)(?=\**[^:*]+\**:|$)/g  // General pattern for any step-like formatting
      ];
      
      for (const pattern of stepPatterns) {
        let match;
        let foundSteps = false;
        
        while ((match = pattern.exec(stepText)) !== null) {
          foundSteps = true;
          const stepTitle = match[1].replace(/\*\*/g, '').trim();
          const stepContent = match[2].trim();
          
          // Extract LaTeX expressions from the step content
          const latexMatches = stepContent.match(/\$(.*?)\$/g);
          const expressions = latexMatches 
            ? latexMatches.map(m => m.replace(/^\$|\$$/g, '').trim())
            : [];
          
          // Add each expression as a step
          if (expressions.length > 0) {
            solutionSteps.push({
              explanation: stepTitle,
              expression: expressions[expressions.length - 1] // Use the last expression as the result of this step
            });
          } else {
            // If no LaTeX found, use the step content as plain text
            solutionSteps.push({
              explanation: stepTitle,
              expression: stepContent.replace(/\*\*/g, '')
            });
          }
        }
        
        if (foundSteps) break; // If we found steps with this pattern, don't try others
      }
    }
    
    // If no steps were extracted, try to create steps from all LaTeX expressions
    if (solutionSteps.length === 0) {
      const allLatexMatches = response.match(/\$(.*?)\$/g);
      if (allLatexMatches && allLatexMatches.length > 1) {
        // Skip the first match (usually the equation) and the last (usually the result)
        for (let i = 1; i < allLatexMatches.length - 1; i++) {
          const latex = allLatexMatches[i].replace(/^\$|\$$/g, '').trim();
          solutionSteps.push({
            explanation: `Step ${i}`,
            expression: latex
          });
        }
      }
    }
    
    // If we have an equation but no steps or result, try to extract any content
    if (originalEquation !== response && solutionSteps.length === 0 && finalResult === "Could not extract result") {
      // Get all text after the equation section
      const afterEquation = response.split(/\*\*Equation:\*\*\s*\$(.*?)\$/s)[2] || response;
      
      // Try to extract any meaningful content
      const cleanedContent = afterEquation
        .replace(/\*\*/g, '')
        .replace(/\\n/g, ' ')
        .trim();
        
      if (cleanedContent) {
        solutionSteps.push({
          explanation: "Solution process",
          expression: cleanedContent
        });
        
        // Use the last part as the result
        const parts = cleanedContent.split(/\.|;|:/);
        if (parts.length > 1) {
          finalResult = parts[parts.length - 1].trim();
        } else {
          finalResult = cleanedContent;
        }
      }
    }
    
    // If still no steps, create a single step with the whole response
    if (solutionSteps.length === 0) {
      // Check if the response contains "no equation" or error messages
      if (response.toLowerCase().includes("no equation") || 
          response.toLowerCase().includes("image is blank") ||
          response.toLowerCase().includes("cannot identify")) {
        return {
          original: "No equation detected",
          steps: [],
          result: "No equation found",
          error: "No valid equation detected in the image. Please try again with clearer writing."
        };
      }
      
      solutionSteps.push({
        explanation: "Equation processing",
        expression: originalEquation
      });
    }
    
    // If we still haven't found a result but have steps, use the last step's expression
    if (finalResult === "Could not extract result" && solutionSteps.length > 0) {
      finalResult = solutionSteps[solutionSteps.length - 1].expression;
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
      result: "Could not extract result",
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
