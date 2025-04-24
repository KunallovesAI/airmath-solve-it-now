
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Trash2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { EquationEntry, getHistory, clearHistory, deleteEquation } from '@/utils/historyStorage';
import LatexRenderer from '@/components/LatexRenderer';
import { format } from 'date-fns';
import { formatEquationText, formatResultText } from '@/utils/formatUtils';

const History = () => {
  const [history, setHistory] = useState<EquationEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your history?')) {
      clearHistory();
      setHistory([]);
    }
  };

  const handleDeleteEntry = (id: string) => {
    deleteEquation(id);
    setHistory(getHistory());
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">History</h1>
          {history.length > 0 && (
            <Button variant="destructive" onClick={handleClearHistory}>
              Clear All
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No history yet</p>
            <Link to="/" className="text-primary hover:underline mt-2 inline-block">
              Solve some equations
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <Card key={entry.id} className="overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 overflow-x-auto w-full">
                      <div className="text-sm text-muted-foreground">
                        {format(entry.timestamp, 'PPpp')}
                      </div>
                      <LatexRenderer 
                        latex={formatEquationText(entry.equation)} 
                        className="my-2"
                        displayMode={true}
                      />
                      <div className="font-medium mt-4">
                        Result: <LatexRenderer latex={formatResultText(entry.result)} />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEntry(entry.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                  <Link to={`/results?equation=${encodeURIComponent(entry.equation)}`}>
                    <Button size="sm">
                      View Details <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default History;
