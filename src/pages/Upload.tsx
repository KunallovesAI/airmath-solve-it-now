
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, Image, Check, X } from 'lucide-react';
import { toast } from "sonner";
import { extractTextFromImage } from '@/utils/visionApi';

const UploadPage = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.includes('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const processImage = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    toast.info("Processing image...");
    
    try {
      // Extract text using Google Vision API
      const extractedText = await extractTextFromImage(selectedImage);
      
      if (!extractedText) {
        toast.error("No text detected in the image. Try again with a clearer image.");
        setIsProcessing(false);
        return;
      }
      
      toast.success("Math expression extracted!");
      
      // Navigate to the results page
      navigate(`/results?equation=${encodeURIComponent(extractedText)}`);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error("Failed to process image");
      setIsProcessing(false);
    }
  };
  
  const cancelSelection = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Upload Equation</h1>
        </div>

        <Card className="overflow-hidden">
          <div className="p-6">
            {!selectedImage ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-muted rounded-full p-4">
                  <Image className="w-10 h-10 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Select an image containing a math equation
                  </p>
                  <Button onClick={triggerFileInput}>
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Image
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative border rounded-md overflow-hidden">
                  <img 
                    src={selectedImage} 
                    alt="Selected equation" 
                    className="w-full h-auto object-contain"
                    style={{ maxHeight: '300px' }}
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={cancelSelection}
                    disabled={isProcessing}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={processImage}
                    disabled={isProcessing}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Confirm & Process
                  </Button>
                </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange} 
            />
          </div>
        </Card>
        
        <div className="text-center text-muted-foreground text-sm">
          <p>For best results:</p>
          <ul className="list-disc list-inside">
            <li>Ensure the equation is clearly visible</li>
            <li>Avoid glare and shadows</li>
            <li>Center the equation in the image</li>
            <li>Both printed and handwritten equations are supported</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default UploadPage;
