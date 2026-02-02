import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  onFileUpload: (file: File) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function FileUploadZone({ onFileUpload, isLoading, error }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setFileName(file.name);
      await onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      await onFileUpload(file);
    }
  }, [onFileUpload]);

  const clearFile = useCallback(() => {
    setFileName(null);
  }, []);

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'upload-zone',
          isDragging && 'active',
          isLoading && 'opacity-50 pointer-events-none'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center gap-2 text-center pointer-events-none">
          {isLoading ? (
            <>
              <div className="w-10 h-10 rounded-full border-2 border-secondary border-t-transparent animate-spin" />
              <span className="text-sm text-muted-foreground">Traitement en cours...</span>
            </>
          ) : fileName ? (
            <>
              <FileSpreadsheet className="w-10 h-10 text-secondary" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{fileName}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  className="p-1 hover:bg-muted rounded-full pointer-events-auto"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-muted-foreground" />
              <div>
                <span className="text-sm font-medium text-foreground">
                  Glissez votre fichier Excel
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  ou cliquez pour sélectionner
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
