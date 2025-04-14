
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import History from "./pages/History";
import Scan from "./pages/Scan";
import Draw from "./pages/Draw";
import Upload from "./pages/Upload";
import Type from "./pages/Type";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";
import HandGesture from "./pages/HandGesture";

// Create a new QueryClient instance outside of the component
const queryClient = new QueryClient();

const App = () => {
  // We'll use React.useEffect instead of directly using useEffect
  React.useEffect(() => {
    // Check for saved theme
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);
  
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/history" element={<History />} />
              <Route path="/scan" element={<Scan />} />
              <Route path="/draw" element={<Draw />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/type" element={<Type />} />
              <Route path="/results" element={<Results />} />
              <Route path="/hand-gesture" element={<HandGesture />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
