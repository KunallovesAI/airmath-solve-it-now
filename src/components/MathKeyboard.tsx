
import { Button } from "@/components/ui/button";

interface MathKeyboardProps {
  onInput: (value: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

const MathKeyboard = ({ onInput, onBackspace, onClear }: MathKeyboardProps) => {
  const buttons = [
    [
      { value: "7", display: "7" },
      { value: "8", display: "8" },
      { value: "9", display: "9" },
      { value: "\\div", display: "÷" },
      { value: "\\pi", display: "π" },
    ],
    [
      { value: "4", display: "4" },
      { value: "5", display: "5" },
      { value: "6", display: "6" },
      { value: "\\times", display: "×" },
      { value: "\\sqrt{}", display: "√" },
    ],
    [
      { value: "1", display: "1" },
      { value: "2", display: "2" },
      { value: "3", display: "3" },
      { value: "+", display: "+" },
      { value: "^", display: "^" },
    ],
    [
      { value: "0", display: "0" },
      { value: ".", display: "." },
      { value: "=", display: "=" },
      { value: "-", display: "-" },
      { value: "(", display: "(" },
    ],
    [
      { value: "x", display: "x" },
      { value: "y", display: "y" },
      { value: "\\frac{}{}", display: "a/b" },
      { value: "\\int", display: "∫" },
      { value: ")", display: ")" },
    ],
  ];

  const specialCommands = [
    { value: "\\sum", display: "∑" },
    { value: "\\prod", display: "∏" },
    { value: "\\lim", display: "lim" },
    { value: "\\infty", display: "∞" },
  ];

  return (
    <div className="math-keyboard border rounded-lg bg-card p-2">
      <div className="grid grid-cols-5 gap-1 mb-2">
        {buttons.map((row, rowIndex) => (
          <React.Fragment key={`row-${rowIndex}`}>
            {row.map((button) => (
              <Button
                key={button.value}
                variant="outline"
                className="h-10 text-lg"
                onClick={() => onInput(button.value)}
              >
                {button.display}
              </Button>
            ))}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-1 mb-2">
        {specialCommands.map((cmd) => (
          <Button
            key={cmd.value}
            variant="outline"
            className="h-10"
            onClick={() => onInput(cmd.value)}
          >
            {cmd.display}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-1">
        <Button
          variant="outline"
          className="h-10"
          onClick={onBackspace}
        >
          Backspace
        </Button>
        <Button
          variant="outline"
          className="h-10"
          onClick={onClear}
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default MathKeyboard;
