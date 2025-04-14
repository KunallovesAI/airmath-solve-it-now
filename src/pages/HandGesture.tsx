
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Check } from 'lucide-react';
import { toast } from "sonner";
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import { drawHand } from '@/utils/handTracker';
import { extractTextFromImage } from '@/utils/visionApi';

const HandGesture = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [model, setModel] = useState<handpose.HandPose | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [instructions, setInstructions] = useState("Loading hand detection model...");

  // Previous finger position
  const prevPos = useRef<{x: number, y: number} | null>(null);

  // Initialize TensorFlow and HandPose model
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        toast.info("Loading hand tracking model...");
        const handModel = await handpose.load();
        setModel(handModel);
        toast.success("Hand tracking model loaded!");
        setInstructions("Show index finger to draw, thumb to clear, all fingers to solve");
      } catch (error) {
        console.error('Error loading model:', error);
        toast.error("Failed to load hand tracking model");
      }
    };
    
    loadModel();
  }, []);

  // Set up camera
  useEffect(() => {
    if (!model) return;
    
    const setupCamera = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" }
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            
            // Initialize drawing canvas once video is ready
            videoRef.current.onloadedmetadata = () => {
              if (drawCanvasRef.current && videoRef.current) {
                const ctx = drawCanvasRef.current.getContext('2d');
                if (ctx) {
                  drawCanvasRef.current.width = videoRef.current.clientWidth;
                  drawCanvasRef.current.height = videoRef.current.clientHeight;
                  ctx.fillStyle = "white";
                  ctx.fillRect(0, 0, drawCanvasRef.current.width, drawCanvasRef.current.height);
                  ctx.lineWidth = 5;
                  ctx.lineCap = "round";
                  ctx.strokeStyle = "black";
                }
              }
              runHandpose();
            };
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          toast.error("Camera access denied or not available");
        }
      }
    };
    
    setupCamera();
    
    return () => {
      // Cleanup: stop all video tracks when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [model]);

  // Detect hand and run predictions
  const runHandpose = () => {
    if (!model || !videoRef.current) return;
    
    const detectHands = async () => {
      // Make detections
      if (videoRef.current && model) {
        try {
          const predictions = await model.estimateHands(videoRef.current);
          
          if (predictions.length > 0) {
            // Draw hand landmarks
            if (canvasRef.current) {
              const ctx = canvasRef.current.getContext('2d');
              if (ctx) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                // Draw hand skeleton
                drawHand(predictions, ctx);
                
                // Get finger positions
                const landmarks = predictions[0].landmarks;
                const indexFinger = landmarks[8]; // Index fingertip
                const thumbTip = landmarks[4];  // Thumb tip
                
                // Check which fingers are up
                const fingersUp = getFingersUp(landmarks);
                
                // Index finger up = drawing mode
                if (fingersUp[1] && !fingersUp[0] && !fingersUp[2] && !fingersUp[3] && !fingersUp[4]) {
                  setIsDrawing(true);
                  
                  if (drawCanvasRef.current) {
                    const drawCtx = drawCanvasRef.current.getContext('2d');
                    if (drawCtx) {
                      // Get current position
                      const currX = indexFinger[0];
                      const currY = indexFinger[1];
                      
                      // Draw line if we have a previous position
                      if (prevPos.current) {
                        drawCtx.beginPath();
                        drawCtx.moveTo(prevPos.current.x, prevPos.current.y);
                        drawCtx.lineTo(currX, currY);
                        drawCtx.stroke();
                        drawCtx.closePath();
                      }
                      
                      // Update previous position
                      prevPos.current = { x: currX, y: currY };
                    }
                  }
                } else {
                  setIsDrawing(false);
                  prevPos.current = null;
                }
                
                // Thumb up = clear canvas
                if (fingersUp[0] && !fingersUp[1] && !fingersUp[2] && !fingersUp[3] && !fingersUp[4]) {
                  clearCanvas();
                }
                
                // All fingers up = solve equation
                if (fingersUp[0] && fingersUp[1] && fingersUp[2] && fingersUp[3] && fingersUp[4]) {
                  solveEquation();
                }
              }
            }
          }
        } catch (error) {
          console.error('Error in hand detection:', error);
        }
      }
      
      // Continue detection loop
      requestAnimationFrame(detectHands);
    };
    
    detectHands();
  };

  // Determine which fingers are up
  const getFingersUp = (landmarks: number[][]) => {
    // Simple implementation - can be improved for more accurate gesture detection
    const wrist = landmarks[0];
    const fingertips = [landmarks[4], landmarks[8], landmarks[12], landmarks[16], landmarks[20]];
    const mcp = [landmarks[1], landmarks[5], landmarks[9], landmarks[13], landmarks[17]]; // Knuckles
    
    return fingertips.map((tip, i) => {
      // If fingertip y position is higher (smaller value) than knuckle
      return tip[1] < mcp[i][1];
    });
  };

  const clearCanvas = () => {
    if (drawCanvasRef.current) {
      const ctx = drawCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, drawCanvasRef.current.width, drawCanvasRef.current.height);
        prevPos.current = null;
        toast.info("Canvas cleared");
      }
    }
  };

  const solveEquation = async () => {
    if (isProcessing || !drawCanvasRef.current) return;
    
    setIsProcessing(true);
    toast.info("Processing equation...");
    
    try {
      // Convert canvas to base64 image
      const imageData = drawCanvasRef.current.toDataURL('image/png');
      
      // Extract text using Google Vision API
      const extractedText = await extractTextFromImage(imageData);
      
      if (!extractedText) {
        toast.error("No equation detected. Please draw more clearly.");
        setIsProcessing(false);
        return;
      }
      
      toast.success("Equation detected!");
      console.log("Extracted equation:", extractedText);
      
      // Navigate to the results page
      navigate(`/results?equation=${encodeURIComponent(extractedText)}&t=${new Date().getTime()}`);
    } catch (error) {
      console.error('Error processing equation:', error);
      toast.error("Failed to process equation");
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Hand Gesture Math Solver</h1>
          </div>
        </div>

        <Card className="relative overflow-hidden">
          <div className="p-4">
            <div className="text-center mb-4 text-muted-foreground">
              {instructions}
            </div>
            
            <div className="relative">
              {/* Video feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full border rounded-md"
                style={{ 
                  transform: 'scaleX(-1)',
                  maxHeight: '60vh',
                  objectFit: 'contain'
                }}
              />
              
              {/* Hand tracking canvas overlay */}
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
                style={{ transform: 'scaleX(-1)' }}
              />
              
              {/* Drawing canvas */}
              <canvas
                ref={drawCanvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
              
              {isProcessing && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
            
            <div className="flex justify-center gap-4 mt-4">
              <Button 
                variant="outline"
                onClick={clearCanvas}
                disabled={isProcessing}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
              <Button
                onClick={solveEquation}
                disabled={isProcessing}
              >
                <Check className="mr-2 h-4 w-4" />
                Solve
              </Button>
            </div>
          </div>
        </Card>
        
        <div className="text-center text-muted-foreground text-sm">
          <p>Gesture Instructions:</p>
          <ul className="list-disc list-inside">
            <li>Index finger up: Draw equation</li>
            <li>Thumb up: Clear canvas</li>
            <li>All fingers up: Solve equation</li>
            <li>Keep your hand clearly visible in the frame</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default HandGesture;
