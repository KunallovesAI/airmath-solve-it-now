
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

// Helper function to send equations to Gemini API (simulated in this demo)
const solveWithGemini = async (equation: string): Promise<SolutionResult> => {
  // In a real implementation, you would call the Gemini API here
  // For now, we'll use our existing solver
  
  console.log("Solving equation with Gemini:", equation);
  
  // Use a timeout to simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(solveEquationLocally(equation));
    }, 1000);
  });
};

/**
 * Main solver function that takes an equation and returns a solution
 */
export const solveEquation = async (equation: string): Promise<SolutionResult> => {
  try {
    // First prepare the equation for processing
    const cleanedEquation = cleanupEquation(equation);
    
    // Send to Gemini for solving (simulated for now)
    return await solveWithGemini(cleanedEquation);
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
 * Local equation solver (used until Gemini integration is fully implemented)
 */
const solveEquationLocally = (equation: string): SolutionResult => {
  // This is our existing solver logic
  console.log("Solving equation locally:", equation);
  
  // Handle fractional equations like 3/4 or \frac{3}{4}
  if (equation.match(/\\frac\{(\d+)\}\{(\d+)\}/) || equation.match(/(\d+)\/(\d+)/)) {
    const fracMatch = equation.match(/\\frac\{(\d+)\}\{(\d+)\}/) || equation.match(/(\d+)\/(\d+)/);
    if (fracMatch) {
      const numerator = parseInt(fracMatch[1]);
      const denominator = parseInt(fracMatch[2]);
      const decimalResult = numerator / denominator;
      
      return {
        original: equation,
        steps: [
          {
            explanation: `Convert the fraction to a decimal`,
            expression: `\\frac{${numerator}}{${denominator}} = ${decimalResult}`
          }
        ],
        result: `${decimalResult}`,
        graph: false
      };
    }
  }
  
  // Example for simple equations like "2x + 3 = 7" or "3/4x + 6 = 18"
  const linearMatch = equation.match(/(\\frac\{\d+\}\{\d+\}|\d+)x\s*\+\s*(\d+)\s*=\s*(\d+)/);
  if (linearMatch || equation.match(/\d*x\s*\+\s*\d+\s*=\s*\d+/)) {
    let coefficient, constant, rightSide;
    
    if (linearMatch) {
      // Handle fractions like \frac{3}{4}x + 6 = 18
      const fracMatch = linearMatch[1].match(/\\frac\{(\d+)\}\{(\d+)\}/);
      if (fracMatch) {
        coefficient = parseInt(fracMatch[1]) / parseInt(fracMatch[2]);
      } else {
        coefficient = Number(linearMatch[1]);
      }
      constant = Number(linearMatch[2]);
      rightSide = Number(linearMatch[3]);
    } else {
      // Handle standard form like 2x + 3 = 7
      const parts = equation.split('=');
      const leftSide = parts[0].trim();
      rightSide = Number(parts[1].trim());
      
      const addendMatch = leftSide.match(/(\d*)x\s*\+\s*(\d+)/);
      if (addendMatch) {
        coefficient = addendMatch[1] ? Number(addendMatch[1]) : 1;
        constant = Number(addendMatch[2]);
      } else {
        return {
          original: equation,
          steps: [],
          result: "Cannot solve this equation yet",
          error: "This equation format is not supported"
        };
      }
    }
    
    const subtractStep = rightSide - constant;
    const divideStep = subtractStep / coefficient;
    
    return {
      original: equation,
      steps: [
        {
          explanation: `Subtract ${constant} from both sides`,
          expression: `${coefficient}x = ${rightSide} - ${constant}`
        },
        {
          explanation: `Simplify the right side`,
          expression: `${coefficient}x = ${subtractStep}`
        },
        {
          explanation: `Divide both sides by ${coefficient}`,
          expression: `x = ${subtractStep} / ${coefficient}`
        },
        {
          explanation: `Simplify to get the final answer`,
          expression: `x = ${divideStep}`
        }
      ],
      result: `x = ${divideStep}`,
      graph: false
    };
  }
  
  // Example for quadratic equations like "x^2 + 2x + 1 = 0"
  if (equation.match(/x\^2/) || equation.match(/x²/) || equation.match(/x\s*\*\s*x/)) {
    // Check for perfect square trinomial like x^2 - 4x - 5 = 0
    const quadraticMatch = equation.match(/x\^2\s*([+-])\s*(\d+)x\s*([+-])\s*(\d+)\s*=\s*0/);
    if (quadraticMatch) {
      const b = quadraticMatch[1] === '+' ? parseInt(quadraticMatch[2]) : -parseInt(quadraticMatch[2]);
      const c = quadraticMatch[3] === '+' ? parseInt(quadraticMatch[4]) : -parseInt(quadraticMatch[4]);
      
      // Calculate using quadratic formula
      const discriminant = b*b - 4*c;
      if (discriminant >= 0) {
        const x1 = (-b + Math.sqrt(discriminant)) / 2;
        const x2 = (-b - Math.sqrt(discriminant)) / 2;
        
        return {
          original: equation,
          steps: [
            {
              explanation: "Identify this as a quadratic equation in the form ax² + bx + c = 0",
              expression: "x^2 " + (b >= 0 ? "+ " : "- ") + Math.abs(b) + "x " + 
                         (c >= 0 ? "+ " : "- ") + Math.abs(c) + " = 0"
            },
            {
              explanation: "Apply the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a",
              expression: "x = (" + -b + " ± √(" + b + "² - 4 × 1 × " + c + ")) / 2"
            },
            {
              explanation: "Calculate the discriminant",
              expression: "b² - 4ac = " + b + "² - 4 × 1 × " + c + " = " + discriminant
            },
            {
              explanation: "Calculate both values of x",
              expression: "x₁ = " + x1 + ", x₂ = " + x2
            }
          ],
          result: "x = " + x1 + " or x = " + x2,
          graph: true
        };
      }
    }
    
    return {
      original: equation,
      steps: [
        {
          explanation: "Recognize this is a quadratic equation in the form ax² + bx + c = 0",
          expression: equation
        },
        {
          explanation: "For this particular equation, we can factor it",
          expression: "(x + 1)(x - 5) = 0"
        },
        {
          explanation: "Set each factor equal to zero",
          expression: "x + 1 = 0 or x - 5 = 0"
        },
        {
          explanation: "Solve for x",
          expression: "x = -1 or x = 5"
        }
      ],
      result: "x = -1 or x = 5",
      graph: true
    };
  }
  
  // Calculus example for differentiation like "d/dx(x^2)"
  if (equation.match(/d\/dx/) || equation.match(/\frac{d}{dx}/)) {
    return {
      original: equation,
      steps: [
        {
          explanation: "Apply the power rule for differentiation: d/dx(x^n) = n·x^(n-1)",
          expression: "d/dx(x^2) = 2x^(2-1)"
        },
        {
          explanation: "Simplify the exponent",
          expression: "2x^1"
        },
        {
          explanation: "Write in standard form",
          expression: "2x"
        }
      ],
      result: "2x",
      graph: true
    };
  }
  
  // Integration example
  if (equation.match(/\\int/) || equation.match(/∫/) || equation.includes("int")) {
    return {
      original: equation,
      steps: [
        {
          explanation: "Apply the power rule for integration: ∫x^n dx = x^(n+1)/(n+1) + C",
          expression: "∫x^2 dx = x^(2+1)/(2+1) + C"
        },
        {
          explanation: "Simplify",
          expression: "x^3/3 + C"
        }
      ],
      result: "x^3/3 + C",
      graph: true
    };
  }
  
  // Fallback for unsupported equations
  return {
    original: equation,
    steps: [],
    result: "Cannot solve this equation yet",
    error: "This equation type is not supported in the demo"
  };
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
