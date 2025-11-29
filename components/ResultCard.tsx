import React, { useState } from 'react';
import { ParsedResult } from '../types';
import { Copy, Check } from 'lucide-react';

interface ResultCardProps {
  result: ParsedResult;
  index: number;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, index }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded">
              Ca {index + 1}
            </span>
          </div>
          <button 
            onClick={handleCopy}
            className="text-gray-400 hover:text-blue-600 transition-colors"
            title="Sao chép kết quả"
          >
            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
          </button>
        </div>

        <div>
          <p className="text-lg font-medium text-gray-900 break-words font-mono bg-gray-50 p-4 rounded-lg border border-gray-100">
            {result.formatted}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;