
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send } from 'lucide-react';
import MathKeyboard from '@/components/MathKeyboard';
import LatexRenderer from '@/components/LatexRenderer';
import { toast } from "sonner";

const Type = () => {
  const navigate = useNavigate();
  const [equation, setEquation] = useState("");
  
  const handleInput = (value: string) => {
    // Direct input without adding extra $ symbols
    setEquation((prev) => {
      // Special handling for commands that need brackets
      if (value === "\\sqrt") {
        return prev + "\\sqrt{}";
      }
      if (value === "\\frac") {
        return prev + "\\frac{}{}";
      }
      return prev + value;
    });
  };
  
  const handleBackspace = () => {
    setEquation((prev) => prev.slice(0, -1));
  };
  
  const handleClear = () => {
    setEquation("");
  };
  
  const handleSolve = () => {
    if (!equation.trim()) {
      toast.error("Please enter an equation first");
      return;
    }
    
    // Navigate to the results page
    navigate(`/results?equation=${encodeURIComponent(equation)}`);
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Type Equation</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Equation Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {equation ? (
              <LatexRenderer latex={equation} displayMode={true} />
            ) : (
              <div className="h-16 flex items-center justify-center border rounded-lg bg-muted/20">
                <p className="text-muted-foreground">Your equation will appear here</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleSolve}
              disabled={!equation.trim()}
            >
              <Send className="mr-2 h-4 w-4" />
              Solve Equation
            </Button>
          </CardFooter>
        </Card>
        
        <MathKeyboard 
          onInput={handleInput}
          onBackspace={handleBackspace}
          onClear={handleClear}
        />
      </div>
    </Layout>
  );
};

export default Type;
