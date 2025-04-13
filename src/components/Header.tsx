
import { History } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <Link to="/" className="flex items-center gap-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-500 text-transparent bg-clip-text">
          AIRMATH
        </h1>
      </Link>
      <div className="flex items-center gap-2">
        <Link to="/history">
          <Button variant="ghost" size="icon">
            <History className="h-5 w-5" />
            <span className="sr-only">History</span>
          </Button>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
