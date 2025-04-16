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
    
    console.log("Processing image for equation recognition...");
    
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
                  text: "You are a math equation solver specializing in handwritten equations. This image contains a handwritten mathematical equation. Your job is to:\n\n1. Extract the exact mathematical equation from the image, handling all mathematical symbols, fractions, powers, etc.\n2. Solve this equation step by step.\n\nFormat your response EXACTLY as follows:\n\n**Equation:**\n$ [equation] $\n\n**Steps to Solve:**\n1. **[Step title]:**\n$ [equation] $\n\n2. **[Step title]:**\n$ [equation] $\n\n... and so on.\n\n**Final Answer:**\n$ [result] $\n\nIMPORTANT RULES:\n- Use proper LaTeX formatting for all equations inside $ symbols.\n- If you can't see any equation or the image is blank, say 'No equation detected in the image'.\n- Be very attentive to how the equation is written - consider all possible interpretations if unclear.\n- Show ALL intermediate steps in the solution.\n- If you see a simple mathematical expression without an equality, solve it to find its value."
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
            temperature: 0.1,
            top_p: 0.95,
            top_k: 40,
            max_output_tokens: 2048,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error:', errorData);
      toast.error('Failed to analyze image');
      return { text: '', error: 'Failed to analyze image' };
    }

    const data = await response.json();
    console.log("API response:", data);
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('No response from API');
      return { text: '', error: 'No response received' };
    }

    // Extract the content from the response
    const content = data.candidates[0].content;
    if (!content || !content.parts || content.parts.length === 0) {
      return { text: '', error: 'Empty response from API' };
    }

    const extractedText = content.parts[0].text || '';
    console.log('Extracted text from API:', extractedText);
    
    // Return the complete text from API for processing
    toast.success('Equation extracted');
    return { text: extractedText };
  } catch (error) {
    console.error('Error extracting text from image:', error);
    toast.error('Failed to process image');
    return { text: '', error: String(error) };
  }
};

/**
 * Send a text-based equation to Gemini API for solving
 */
export const solveTextEquationWithGemini = async (equation: string): Promise<GeminiResponse> => {
  try {
    console.log("Processing text equation...");
    
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
                  text: `You are a math equation solver. Solve this equation: ${equation}\n\nFormat your response EXACTLY as follows:\n\n**Equation:**\n$ [equation] $\n\n**Steps to Solve:**\n1. **[Step title]:**\n$ [equation] $\n\n2. **[Step title]:**\n$ [equation] $\n\n... and so on.\n\n**Final Answer:**\n$ [result] $\n\nNOTE: Keep equations in LaTeX format within $ symbols. Show ALL intermediate steps clearly.`
                }
              ]
            }
          ],
          generation_config: {
            temperature: 0.1,
            top_p: 0.95,
            top_k: 40,
            max_output_tokens: 2048,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error:', errorData);
      toast.error('Failed to solve equation');
      return { text: '', error: 'Failed to solve equation' };
    }

    const data = await response.json();
    console.log("API response:", data);
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('No response from API');
      return { text: '', error: 'No response received' };
    }

    // Extract the content from the response
    const content = data.candidates[0].content;
    if (!content || !content.parts || content.parts.length === 0) {
      return { text: '', error: 'Empty response from API' };
    }

    const extractedText = content.parts[0].text || '';
    console.log('Extracted text from API:', extractedText);
    
    // Return the complete text from API
    toast.success('Equation processed');
    return { text: extractedText };
  } catch (error) {
    console.error('Error solving equation:', error);
    toast.error('Failed to solve equation');
    return { text: '', error: String(error) };
  }
};

/**
 * Parse Gemini API response to extract the key information
 */
export const parseGeminiResponse = (responseText: string): string => {
  // For now, we'll return the entire text for processing in the results page
  return responseText;
};
