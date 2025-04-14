
// Utility for drawing hand landmarks
export const drawHand = (predictions: any[], ctx: CanvasRenderingContext2D): void => {
  if (!predictions.length) return;

  // Get prediction landmarks
  const landmarks = predictions[0].landmarks;
  
  // Draw points
  for (let i = 0; i < landmarks.length; i++) {
    const x = landmarks[i][0];
    const y = landmarks[i][1];
    
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#FF0000';
    ctx.fill();
  }
  
  // Draw connections (fingers)
  // Thumb
  drawConnections(ctx, landmarks, [0, 1, 2, 3, 4]);
  // Index finger
  drawConnections(ctx, landmarks, [0, 5, 6, 7, 8]);
  // Middle finger
  drawConnections(ctx, landmarks, [0, 9, 10, 11, 12]);
  // Ring finger
  drawConnections(ctx, landmarks, [0, 13, 14, 15, 16]);
  // Pinky
  drawConnections(ctx, landmarks, [0, 17, 18, 19, 20]);
  // Palm
  drawConnections(ctx, landmarks, [0, 5, 9, 13, 17]);
};

// Helper to draw connected lines
const drawConnections = (ctx: CanvasRenderingContext2D, landmarks: number[][], indices: number[]): void => {
  ctx.beginPath();
  ctx.moveTo(landmarks[indices[0]][0], landmarks[indices[0]][1]);
  
  for (let i = 1; i < indices.length; i++) {
    ctx.lineTo(landmarks[indices[i]][0], landmarks[indices[i]][1]);
  }
  
  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 2;
  ctx.stroke();
};
