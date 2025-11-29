export interface ParsedResult {
  raw: string;
  formatted: string;
  components: {
    A: string; // Input Value
    B: string; // Header 2
    C: string; // Header 1
    D: string; // Row + 1
    E: string; // Col + 1
    F: string; // Row + 2
    G: string; // Row + 2, Col + 1
    H: string; // Row + 3
    I: string; // Cell B1
    J: string; // Cell B3
  };
  coordinates: {
    row: number;
    col: number;
  };
}

export interface SheetData {
  grid: string[][];
  loading: boolean;
  error: string | null;
}