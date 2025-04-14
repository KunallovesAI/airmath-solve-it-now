
/**
 * Utility functions for interacting with Google's Gemini API
 */

import { toast } from "sonner";

// Gemini API key
const GEMINI_API_KEY = "AIzaSyBenDJlvFLFvmcrRgqjUA-DsYRGIOWSjM0";

interface GeminiResponse {
  text: string;
  error?: string;
}

/**
 * Send an image to Gemini API for math equation recognition and solving
 */
export const solveMathWithGemini = async (imageBase64: string): Promise<GeminiResponse> => {
  try {
    // Make sure we're only sending the base64 data without the prefix
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    
    console.log("Sending image to Gemini API for math recognition...");
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: "Extract and solve the mathematical equation in this image. Return only the equation, steps to solve it, and the final answer. Format it correctly for LaTeX."
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generation_config: {
            temperature: 0.2,
            top_p: 0.8,
            max_output_tokens: 2048,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      toast.error('Failed to analyze image with Gemini');
      return { text: '', error: 'Failed to analyze image with Gemini API' };
    }

    const data = await response.json();
    console.log("Gemini API response:", data);
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('No response from Gemini API');
      return { text: '', error: 'No response from Gemini API' };
    }

    // Extract the content from the response
    const content = data.candidates[0].content;
    if (!content || !content.parts || content.parts.length === 0) {
      return { text: '', error: 'Empty response from Gemini API' };
    }

    const extractedText = content.parts[0].text || '';
    
    // Use a regex to extract any LaTeX equations from the response
    const equationMatches = extractedText.match(/\\\w+(?:\{[^}]*\})*|\\\([^)]*\\\)/g);
    const extractedEquation = equationMatches ? equationMatches[0] : extractedText;
    
    console.log('Extracted equation from Gemini:', extractedEquation);
    
    return { text: extractedEquation || extractedText };
  } catch (error) {
    console.error('Error extracting text from image with Gemini:', error);
    toast.error('Failed to analyze image with Gemini');
    return { text: '', error: String(error) };
  }
};

/**
 * Parse Gemini API response to extract the key information
 */
export const parseGeminiResponse = (responseText: string): string => {
  // For now, we'll just return the text as is
  // In the future, we could enhance this to better extract and format LaTeX expressions
  return responseText;
};
