export interface EquationEntry {
  id: string;
  equation: string;
  timestamp: number;
  result: string;
}

export const saveEquation = (equation: string, result: string): void => {
  const history = getHistory();
  const newEntry: EquationEntry = {
    id: generateId(),
    equation,
    timestamp: Date.now(),
    result
  };
  
  history.unshift(newEntry);
  
  // Keep only the last 50 entries
  const trimmedHistory = history.slice(0, 50);
  localStorage.setItem("airmath_history", JSON.stringify(trimmedHistory));
};

export const getHistory = (): EquationEntry[] => {
  const savedHistory = localStorage.getItem("airmath_history");
  if (!savedHistory) {
    return [];
  }
  
  try {
    return JSON.parse(savedHistory) as EquationEntry[];
  } catch (error) {
    console.error("Failed to parse history:", error);
    return [];
  }
};

export const clearHistory = (): void => {
  localStorage.removeItem("airmath_history");
};

export const deleteEquation = (id: string): void => {
  const history = getHistory();
  const updatedHistory = history.filter(entry => entry.id !== id);
  localStorage.setItem("airmath_history", JSON.stringify(updatedHistory));
};

const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};
