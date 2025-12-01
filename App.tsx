import React, { useState, useEffect } from 'react';
import { Search, FileSpreadsheet, AlertCircle, Database } from 'lucide-react';
import { fetchAndParseCSV, searchInGrid } from './utils/csvParser';
import { ParsedResult, SheetData } from './types';
import ResultCard from './components/ResultCard';

// Default provided Sheet URL (Must use export format)
const SHEET_ID = "1rQIUtnSBYg8FB51NneVIHQmta8dZ8RH6O6AQaFnpDvQ";
const GID = "130432073";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [sheetData, setSheetData] = useState<SheetData>({
    grid: [],
    loading: false,
    error: null,
  });
  const [results, setResults] = useState<ParsedResult[]>([]);

  const loadData = async () => {
    setSheetData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const grid = await fetchAndParseCSV(CSV_URL);
      setSheetData({ grid, loading: false, error: null });
    } catch (err) {
      console.error(err);
      setSheetData({ 
        grid: [], 
        loading: false, 
        error: "Không thể tải dữ liệu. Vui lòng thử lại sau." 
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    // Clear results and error if empty
    if (!term) {
        setResults([]);
        setInputError(null);
        return;
    }

    // Validation: Check for non-digits
    const isNum = /^\d+$/.test(term);
    if (!isNum) {
        setInputError("Chỉ được nhập các chữ số.");
        setResults([]);
        return;
    }

    // Validation: Check for length 9
    if (term.length !== 9) {
        setInputError("Vui lòng nhập đúng 9 chữ số SĐT mã, không gồm số 0.");
        setResults([]);
        return;
    }

    setInputError(null);

    // Perform search if data is loaded
    if (sheetData.grid.length > 0) {
      const found = searchInGrid(sheetData.grid, term);
      setResults(found);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 sm:px-6">
      
      {/* Header */}
      <div className="w-full max-w-3xl text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Database size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Tra cứu lịch làm việc Ways Station (đợi web load 10 giây)
          </h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-3xl space-y-6">
        
        {/* Error Message for Data Loading */}
        {sheetData.error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-red-700">
              <p className="font-semibold mb-1">Lỗi hệ thống</p>
              <p>{sheetData.error}</p>
            </div>
          </div>
        )}

        {/* Search Input */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className={`h-6 w-6 transition-colors ${inputError ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-500'}`} />
          </div>
          <input
            type="text"
            className={`block w-full pl-12 pr-4 py-4 bg-white border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 text-lg transition-all ${
                inputError 
                ? 'border-red-300 focus:ring-red-500 focus:border-transparent' 
                : 'border-gray-200 focus:ring-blue-500 focus:border-transparent'
            }`}
            placeholder="Đợi web load 10 giây rồi nhập đúng 9 chữ số SĐT mã nhân viên, không gồm số 0..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={sheetData.grid.length === 0}
            maxLength={9}
          />
        </div>

        {/* Input Validation Error */}
        {inputError && (
             <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                 <AlertCircle size={16} />
                 <span className="text-sm font-medium">{inputError}</span>
             </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          {!inputError && searchTerm.length === 9 && results.length === 0 && sheetData.grid.length > 0 && (
            <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
              <FileSpreadsheet className="mx-auto h-10 w-10 text-gray-300 mb-2" />
              <p>Không tìm thấy kết quả nào cho "{searchTerm}"</p>
            </div>
          )}

          {results.map((result, idx) => (
            <ResultCard key={`${idx}-${result.coordinates.row}-${result.coordinates.col}`} result={result} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
