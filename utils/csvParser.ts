import Papa from 'papaparse';
import { ParsedResult } from '../types';

export const fetchAndParseCSV = async (url: string): Promise<string[][]> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        complete: (results) => {
          resolve(results.data as string[][]);
        },
        error: (error: Error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error("Error fetching/parsing CSV:", error);
    throw error;
  }
};

export const parseLocalCSV = (file: File): Promise<string[][]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        resolve(results.data as string[][]);
      },
      error: (error: Error) => {
        reject(error);
      }
    });
  });
};

// Helper to find non-empty header by looking left if current cell is empty (Merged cell logic)
const findHeaderValue = (grid: string[][], rowIdx: number, colIdx: number): string => {
  if (rowIdx < 0 || rowIdx >= grid.length) return '';
  
  // Look from current column backwards to 0
  for (let c = colIdx; c >= 0; c--) {
    const val = grid[rowIdx][c];
    if (val && val.trim() !== '') {
      return val.trim();
    }
  }
  return '';
};

export const searchInGrid = (grid: string[][], searchTerm: string): ParsedResult[] => {
  if (!searchTerm || searchTerm.trim() === '') return [];
  
  const results: ParsedResult[] = [];
  const term = searchTerm.trim().toLowerCase();
  
  // Global values
  // I = B1 -> Row 0, Col 1
  const I = grid.length > 0 && grid[0].length > 1 ? grid[0][1] : '';
  // J = B3 -> Row 2, Col 1
  const J = grid.length > 2 && grid[2].length > 1 ? grid[2][1] : '';

  // Iterate through the grid
  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];
    for (let c = 0; c < row.length; c++) {
      const cellValue = row[c] ? row[c].toString() : '';
      
      // Check if cell contains search term
      if (cellValue.toLowerCase().includes(term)) {
        
        const getVal = (rowOff: number, colOff: number) => {
          const targetR = r + rowOff;
          const targetC = c + colOff;
          if (targetR >= 0 && targetR < grid.length && targetC >= 0 && targetC < grid[targetR].length) {
            return grid[targetR][targetC]?.toString().trim() || '';
          }
          return '';
        };

        // Header indices (0-based)
        // Row 5 in Excel is index 4
        // Row 6 in Excel is index 5
        const C = findHeaderValue(grid, 4, c); 
        const B = findHeaderValue(grid, 5, c);

        const A = cellValue.trim();
        const D = getVal(1, 0);
        const E = getVal(0, 1);
        const F = getVal(2, 0);
        const G = getVal(2, 1);
        const H = getVal(3, 0);

        // Format: I - J - D - B (C) - E - F - G - H
        const formatted = `${I} - ${J} - ${D} - ${B} (${C}) - ${E} - ${F} - ${G} - ${H}`;

        results.push({
          raw: cellValue,
          formatted,
          components: { A, B, C, D, E, F, G, H, I, J },
          coordinates: { row: r, col: c }
        });
      }
    }
  }
  
  return results;
};