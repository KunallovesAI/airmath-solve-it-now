
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, LineChart } from 'lucide-react';
import LatexRenderer from '@/components/LatexRenderer';
import { solveEquation } from '@/utils/mathSolver';
import { saveEquation } from '@/utils/historyStorage';
import { toast } from "sonner";

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

const Results = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [solution, setSolution] = useState<SolutionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [equation, setEquation] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchSolution = async () => {
      const equationParam = searchParams.get('equation');
      
      if (!equationParam) {
        navigate('/');
        return;
      }

      setEquation(equationParam);
      console.log("Processing equation:", equationParam);
      
      try {
        // Solve the equation - properly handling the Promise
        const result = await solveEquation(equationParam);
        console.log("Solution result:", result);
        setSolution(result);
        
        // Save to history
        if (result && result.result) {
          saveEquation(equationParam, result.result);
        }
      } catch (error) {
        console.error('Error solving equation:', error);
        setSolution({
          original: equationParam,
          steps: [],
          result: "Error solving equation",
          error: "An unexpected error occurred."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSolution();
  }, [searchParams, navigate]);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
  if (!solution) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Error</h1>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Unable to Process Equation</CardTitle>
            </CardHeader>
            <CardContent>
              <p>We couldn't process the equation. Please try again.</p>
              <Button className="mt-4" onClick={() => navigate('/')}>
                Return Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Solution</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Original Equation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="overflow-x-auto max-w-full">
                <LatexRenderer latex={solution.original || equation || ''} />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(solution.original || equation || '')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {solution.error ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{solution.error}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Step-by-Step Solution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {solution.steps && solution.steps.length > 0 ? (
                  solution.steps.map((step, index) => (
                    <div key={index} className="space-y-2 pb-4 border-b last:border-0">
                      <div className="text-muted-foreground text-sm">
                        Step {index + 1}: {step.explanation}
                      </div>
                      <LatexRenderer latex={step.expression} />
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    No step-by-step solution available for this equation type.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Result</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="overflow-x-auto max-w-full">
                    <LatexRenderer latex={solution.result} />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(solution.result)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {solution.graph && (
              <Card>
                <CardHeader>
                  <CardTitle>Graph</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-8">
                  <LineChart className="h-24 w-24 text-muted-foreground mb-4" />
                  <p className="text-center text-muted-foreground">
                    Graph visualization would be shown here in a complete implementation.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Results;
