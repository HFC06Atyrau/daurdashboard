import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { SalesRecord } from '../types';
import { processUploadedData } from '../services/dataService';
import { Translation } from '../translations';

interface FileUploaderProps {
  onDataLoaded: (data: SalesRecord[]) => void;
  onError: (msg: string) => void;
  labels: Translation;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded, onError, labels }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        if (!evt.target) return;
        
        const arrayBuffer = evt.target.result;
        if (!arrayBuffer) {
           console.error("FileReader result is empty");
           onError(labels.uploadError);
           return;
        }

        // Read file
        const wb = XLSX.read(arrayBuffer, { type: 'array' });
        
        if (!wb || !wb.SheetNames || wb.SheetNames.length === 0) {
           console.error("No sheets found in workbook");
           onError(labels.uploadError);
           return;
        }

        // Grab the first sheet
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        if (!ws) {
            console.error("Sheet content is undefined");
            onError(labels.uploadError);
            return;
        }

        // Check if sheet is empty (no range)
        if (!ws['!ref']) {
             console.warn("Sheet has no range (!ref). Treated as empty.");
             onError(labels.uploadError);
             return;
        }
        
        // Convert to Array of Arrays ({ header: 1 }) 
        // This avoids issues with duplicate headers or key mismatches from implicit row 0 headers
        // Wrap in try-catch specifically for sheet_to_json as it can be fragile with some inputs
        let rawRows: any[][] = [];
        try {
            rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as any[][];
        } catch (jsonErr) {
            console.error("sheet_to_json failed:", jsonErr);
            onError(labels.uploadError);
            return;
        }
        
        console.log("Parsed Rows (Sample):", rawRows?.slice(0, 5));

        if (rawRows && rawRows.length > 0) {
          const processed = processUploadedData(rawRows);
          
          if (processed.length === 0) {
             console.warn("Parsed data but no valid records mapped.");
             onError(labels.uploadError);
          } else {
             onDataLoaded(processed);
          }
        } else {
            console.warn("Sheet was empty or parsed to empty rows.");
            onError(labels.uploadError);
        }
      } catch (err) {
        console.error("XLSX Parse Error:", err);
        onError(labels.uploadError);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
        onError(labels.uploadError);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsArrayBuffer(file);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input 
        type="file" 
        accept=".csv, .xlsx, .xls" 
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button 
        onClick={triggerUpload}
        className="flex items-center gap-2 text-sm font-semibold text-white transition-all bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-lg border border-indigo-500/50 shadow-lg shadow-indigo-500/20 active:scale-95"
      >
        <Upload className="w-4 h-4" />
        <span className="uppercase">{labels.uploadData}</span>
      </button>
    </>
  );
};