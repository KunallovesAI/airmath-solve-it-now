
import { toast } from "sonner";

// The Google Vision API key (this would ideally be stored in a backend environment variable)
const GOOGLE_VISION_API_KEY = 'AIzaSyCHObh0Ryhbr-IXjVKdLwv7QAdM4KI1k2c';

interface GoogleVisionResponse {
  responses: Array<{
    textAnnotations?: Array<{
      description: string;
      boundingPoly?: {
        vertices: Array<{
          x: number;
          y: number;
        }>;
      };
    }>;
    error?: {
      message: string;
    };
  }>;
}

/**
 * Extract text from an image using Google Cloud Vision API
 */
export const extractTextFromImage = async (imageBase64: string): Promise<string> => {
  try {
    // Make sure we're only sending the base64 data without the prefix
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Data,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 1,
                },
                {
                  type: 'DOCUMENT_TEXT_DETECTION',
                  maxResults: 1,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Vision API error:', errorData);
      toast.error('Failed to analyze image');
      return '';
    }

    const data: GoogleVisionResponse = await response.json();
    
    if (data.responses[0].error) {
      console.error('Google Vision API returned an error:', data.responses[0].error);
      toast.error('Failed to analyze image: ' + data.responses[0].error.message);
      return '';
    }

    // Get the first text annotation which contains the full text
    const extractedText = data.responses[0].textAnnotations?.[0]?.description || '';
    
    // Clean up the text to make it suitable for math expressions
    const cleanedText = cleanMathExpression(extractedText);
    
    console.log('Extracted text:', extractedText);
    console.log('Cleaned math expression:', cleanedText);
    
    return cleanedText;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    toast.error('Failed to analyze image');
    return '';
  }
};

/**
 * Clean up extracted text to make it suitable for math expressions
 */
const cleanMathExpression = (text: string): string => {
  if (!text) return '';
  
  // Remove newlines and replace with spaces
  let cleaned = text.replace(/\n/g, ' ');
  
  // Replace common OCR errors in mathematical notation
  cleaned = cleaned
    // Fix multiplication signs
    .replace(/[xX×]/g, '*')
    // Fix division signs
    .replace(/÷/g, '/')
    // Fix square root notation
    .replace(/√(\d+)/g, 'sqrt($1)')
    // Fix common fraction notation
    .replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}')
    // Fix power notation
    .replace(/\^(\d+)/g, '^{$1}')
    // Fix integral notation
    .replace(/∫/g, '\\int')
    // Remove extra spaces
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
};

/**
 * Prepare extracted text for mathematical processing
 */
export const prepareMathExpression = (text: string): string => {
  // Convert to LaTeX format for more complex expressions if needed
  return text;
};

