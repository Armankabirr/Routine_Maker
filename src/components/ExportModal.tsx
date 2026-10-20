import React, { useState, useRef } from 'react';
import { SectionItem } from '../types/routine';
import { calculateStatistics, DAYS_OF_WEEK } from '../utils/routineUtils';
import { Download, X, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSections: SectionItem[];
  allCourseCodes: string[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  selectedSections,
  allCourseCodes
}) => {
  const [studentName, setStudentName] = useState('Arman Kabir');
  const [studentId, setStudentId] = useState('0112230478');
  const [program, setProgram] = useState('BSCSE');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const stats = calculateStatistics(selectedSections);

  const handleExportPDF = async () => {
    if (!printAreaRef.current) return;
    setIsExporting(true);
    setExportSuccess(false);
    try {
      const element = printAreaRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min((pdfWidth - 40) / imgWidth, (pdfHeight - 40) / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 20;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      const filename = `UIU_Fall_2026_Routine_${studentId || 'Arman_Kabir'}.pdf`;
      pdf.save(filename);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 flex flex-col gap-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              <span>Export Routine as PDF</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Official United International University Fall 2026 pre-registration schedule sheet
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Meta Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Student Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              placeholder="e.g. Arman Kabir"
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Student ID
            </label>
            <input
              type="text"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              placeholder="e.g. 0112230478"
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Department / Program
            </label>
            <select
              value={program}
              onChange={e => setProgram(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="BSCSE">Dept. of Computer Science & Engineering (BSCSE)</option>
              <option value="BSDS">Dept. of Data Science (BSDS)</option>
            </select>
          </div>
        </div>

        {/* Dedicated Single Export Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/60">
          <div>
            <div className="text-xs sm:text-sm font-bold text-orange-950 dark:text-orange-200">
              Ready to Download Routine
            </div>
            <div className="text-[11px] text-orange-700 dark:text-orange-300">
              Includes {selectedSections.length} enrolled courses, {stats.totalCredits} credits, faculty info, and complete weekly timetable.
            </div>
          </div>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : exportSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Downloaded Successfully!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export as PDF</span>
              </>
            )}
          </button>
        </div>

        {/* Printable Canvas Section Preview */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 overflow-x-auto bg-slate-100 dark:bg-slate-950">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            PDF Document Preview
          </div>

          <div
            ref={printAreaRef}
            className="bg-white text-slate-900 p-8 rounded-xl shadow-xs w-[1000px] mx-auto text-xs space-y-6"
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
          >
            {/* Header Branding */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
                  United International University
                </h1>
                <div className="text-sm font-bold text-orange-600">
                  Fall 2026 Student Class Routine Plan
                </div>
                <div className="text-[11px] text-slate-500">
                  Program: {program} · Pre-Registration Worksheet
                </div>
              </div>

              <div className="text-right text-[11px] font-mono">
                <div className="font-bold text-slate-900">{studentName || 'Arman Kabir'}</div>
                <div>ID: {studentId || '0112230478'}</div>
                <div className="text-slate-500">Trimester: Fall 2026</div>
              </div>
            </div>

            {/* Courses Table */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                Enrolled Courses &amp; Allocated Sections
              </div>
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-100 font-bold text-slate-700">
                    <th className="py-2 px-2.5">Course Code</th>
                    <th className="py-2 px-2.5">Course Title</th>
                    <th className="py-2 px-2.5">Sec</th>
                    <th className="py-2 px-2.5">Faculty</th>
                    <th className="py-2 px-2.5">Days</th>
                    <th className="py-2 px-2.5">Time</th>
                    <th className="py-2 px-2.5">Room</th>
                    <th className="py-2 px-2.5 text-right">Cr</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedSections.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-4 text-center text-slate-400 italic">
                        No courses enrolled yet. Select sections from planner.
                      </td>
                    </tr>
                  ) : (
                    selectedSections.map(s => (
                      <tr key={s.id}>
                        <td className="py-2 px-2.5 font-bold font-mono">{s.courseCode}</td>
                        <td className="py-2 px-2.5">{s.courseTitle}</td>
                        <td className="py-2 px-2.5 font-bold">{s.section}</td>
                        <td className="py-2 px-2.5">{s.facultyName} ({s.facultyInitial})</td>
                        <td className="py-2 px-2.5">{s.day2 ? `${s.day1} & ${s.day2}` : s.day1}</td>
                        <td className="py-2 px-2.5 font-mono">{s.time1}</td>
                        <td className="py-2 px-2.5 font-mono">{s.room1}</td>
                        <td className="py-2 px-2.5 font-bold font-mono text-right">{s.credit}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 font-bold text-slate-900">
                    <td colSpan={7} className="py-2 px-2.5 text-right uppercase">
                      Total Planned Credits:
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono text-sm">
                      {stats.totalCredits}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Weekly Timetable Grid */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                Weekly Class Routine Grid
              </div>
              <div className="grid grid-cols-5 border border-slate-300 divide-x divide-slate-300">
                {DAYS_OF_WEEK.map(day => {
                  const dayEvents = selectedSections.flatMap(s =>
                    s.schedules.filter(sl => sl.day === day).map(sl => ({ section: s, slot: sl }))
                  ).sort((a, b) => a.slot.startMinutes - b.slot.startMinutes);

                  return (
                    <div key={day} className="flex flex-col">
                      <div className="bg-slate-200 py-1.5 px-2 text-center font-bold text-[11px] border-b border-slate-300">
                        {day}
                      </div>
                      <div className="p-2 space-y-2 min-h-[160px] bg-slate-50/50">
                        {dayEvents.length === 0 ? (
                          <div className="text-center text-slate-400 py-8 italic text-[10px]">
                            No Class
                          </div>
                        ) : (
                          dayEvents.map((evt, i) => (
                            <div
                              key={i}
                              className="p-2 rounded-lg bg-white border border-slate-300 shadow-2xs text-[10px] space-y-0.5"
                            >
                              <div className="font-bold text-slate-900 flex justify-between">
                                <span>{evt.section.courseCode}</span>
                                <span>Sec {evt.section.section}</span>
                              </div>
                              <div className="text-slate-600 font-mono text-[9px]">
                                {evt.slot.time}
                              </div>
                              <div className="text-slate-500 flex justify-between text-[9px]">
                                <span>{evt.section.facultyInitial}</span>
                                <span className="font-bold">{evt.slot.room}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Document Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
              <div>United International University · Fall 2026 Trimester</div>
              <div>Planned by Arman Kabir (ID: 0112230478)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
