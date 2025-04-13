
import Layout from '@/components/Layout';
import InputMethods from '@/components/InputMethods';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to <span className="bg-gradient-to-r from-purple-600 to-violet-500 text-transparent bg-clip-text">AIRMATH</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Solve math problems instantly with our powerful tools
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <InputMethods />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
