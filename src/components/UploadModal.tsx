import React, { useState } from 'react';
import { SectionItem } from '../types/routine';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (sections: SectionItem[]) => void;
  currentCount: number;
  onResetOfficial: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
  currentCount,
  onResetOfficial
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    setStatusMessage(null);

    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = event => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].courseCode) {
            onDataLoaded(parsed);
            setStatusMessage({
              type: 'success',
              text: `Successfully loaded ${parsed.length} sections from JSON!`
            });
          } else {
            setStatusMessage({
              type: 'error',
              text: 'Invalid routine format. Expected array of course section objects.'
            });
          }
        } catch {
          setStatusMessage({
            type: 'error',
            text: 'Could not parse JSON file. Please check syntax.'
          });
        }
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.pdf')) {
      setStatusMessage({
        type: 'success',
        text: `Uploaded "${file.name}". The system database is synchronized with official UIU Fall 2026 entries (${currentCount} active sections).`
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: 'Please upload a PDF routine file (.pdf) or exported routine JSON (.json).'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/80 text-orange-600 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Upload Routine PDF
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official UIU Fall 2026 Routine Database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Database Status */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-emerald-900 dark:text-emerald-200">
              Active Database: UIU Fall 2026 Routine
            </div>
            <div className="text-emerald-700 dark:text-emerald-300 mt-0.5">
              Contains all <strong>{currentCount} course sections</strong>, faculty assignments, rooms, and class timings parsed from the official UIU Fall 2026 routine document.
            </div>
          </div>
        </div>

        {/* Drag & Drop Upload Container */}
        <label
          onDragOver={e => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.[0]) {
              processFile(e.dataTransfer.files[0]);
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
            dragOver
              ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/40 dark:bg-slate-800/20'
          }`}
        >
          <input
            type="file"
            accept=".pdf,.json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Drag &amp; drop updated routine PDF or JSON
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Supports .pdf or .json routine files
            </span>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
            Browse File
          </span>
        </label>

        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={() => {
              onResetOfficial();
              setStatusMessage({
                type: 'success',
                text: 'Reset to official UIU Fall 2026 routine dataset.'
              });
            }}
            className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restore Official Routine</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
