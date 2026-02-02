'use client';

import { useState, useRef, useCallback } from 'react';
import { useCandidates } from '@/lib/hooks/useCandidates';
import { useToast } from './Toast';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (count: number) => void;
}

interface ParsedCandidate {
  name: string;
  email?: string;
  title?: string;
  company?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  skills?: string[];
}

type ColumnMapping = Record<string, keyof ParsedCandidate | 'skip'>;

const CANDIDATE_FIELDS: { key: keyof ParsedCandidate; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'title', label: 'Job Title' },
  { key: 'company', label: 'Company' },
  { key: 'location', label: 'Location' },
  { key: 'linkedin', label: 'LinkedIn URL' },
  { key: 'github', label: 'GitHub URL' },
];

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map(parseRow);
  return { headers, rows };
}

function autoMapColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const lowerHeaders = headers.map(h => h.toLowerCase().trim());

  lowerHeaders.forEach((header, i) => {
    const key = headers[i];
    if (header.includes('name') && !header.includes('company')) mapping[key] = 'name';
    else if (header.includes('email') || header.includes('e-mail')) mapping[key] = 'email';
    else if (header.includes('title') || header.includes('position') || header.includes('role') || header.includes('job')) mapping[key] = 'title';
    else if (header.includes('company') || header.includes('organization') || header.includes('employer')) mapping[key] = 'company';
    else if (header.includes('location') || header.includes('city') || header.includes('country')) mapping[key] = 'location';
    else if (header.includes('linkedin')) mapping[key] = 'linkedin';
    else if (header.includes('github')) mapping[key] = 'github';
    else mapping[key] = 'skip';
  });

  return mapping;
}

function parseJSON(text: string): ParsedCandidate[] {
  const data = JSON.parse(text);
  const items = Array.isArray(data) ? data : data.candidates || data.data || data.results || [];

  return items.map((item: Record<string, unknown>) => ({
    name: String(item.name || item.full_name || item.fullName || 'Unknown'),
    email: item.email ? String(item.email) : undefined,
    title: item.title || item.position || item.job_title || item.jobTitle ? String(item.title || item.position || item.job_title || item.jobTitle) : undefined,
    company: item.company || item.organization || item.employer ? String(item.company || item.organization || item.employer) : undefined,
    location: item.location || item.city ? String(item.location || item.city) : undefined,
    linkedin: item.linkedin || item.linkedin_url || item.linkedinUrl ? String(item.linkedin || item.linkedin_url || item.linkedinUrl) : undefined,
    github: item.github || item.github_url || item.githubUrl ? String(item.github || item.github_url || item.githubUrl) : undefined,
    skills: Array.isArray(item.skills) ? item.skills.map(String) : undefined,
  }));
}

type Step = 'upload' | 'map' | 'preview' | 'importing' | 'done';

export function ImportDialog({ isOpen, onClose, onImportComplete }: ImportDialogProps) {
  const { saveCandidates } = useCandidates();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [fileType, setFileType] = useState<'csv' | 'json'>('csv');
  const [fileName, setFileName] = useState('');

  // CSV state
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});

  // Parsed candidates
  const [candidates, setCandidates] = useState<ParsedCandidate[]>([]);
  const [importResult, setImportResult] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });

  if (!isOpen) return null;

  const reset = () => {
    setStep('upload');
    setFileType('csv');
    setFileName('');
    setCsvHeaders([]);
    setCsvRows([]);
    setColumnMapping({});
    setCandidates([]);
    setImportResult({ success: 0, failed: 0 });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const text = await file.text();

    if (file.name.endsWith('.json')) {
      setFileType('json');
      try {
        const parsed = parseJSON(text);
        setCandidates(parsed);
        setStep('preview');
      } catch {
        addToast('Failed to parse JSON file', 'error');
      }
    } else {
      setFileType('csv');
      const { headers, rows } = parseCSV(text);
      if (headers.length === 0 || rows.length === 0) {
        addToast('CSV file is empty or invalid', 'error');
        return;
      }
      setCsvHeaders(headers);
      setCsvRows(rows);
      setColumnMapping(autoMapColumns(headers));
      setStep('map');
    }
  };

  const handleMappingComplete = () => {
    // Check that at least 'name' is mapped
    const hasName = Object.values(columnMapping).includes('name');
    if (!hasName) {
      addToast('Please map at least the Name column', 'error');
      return;
    }

    // Convert CSV rows to candidates using mapping
    const parsed = csvRows.map(row => {
      const candidate: ParsedCandidate = { name: '' };
      csvHeaders.forEach((header, i) => {
        const field = columnMapping[header];
        if (field && field !== 'skip' && row[i]) {
          if (field === 'skills') {
            candidate.skills = row[i].split(',').map(s => s.trim());
          } else {
            (candidate as unknown as Record<string, unknown>)[field] = row[i];
          }
        }
      });
      return candidate;
    }).filter(c => c.name.trim());

    setCandidates(parsed);
    setStep('preview');
  };

  const handleImport = async () => {
    setStep('importing');

    const params = candidates.map(c => ({
      name: c.name,
      email: c.email,
      title: c.title,
      company: c.company,
      location: c.location,
      linkedin: c.linkedin,
      github: c.github,
      skills: c.skills,
      source: 'csv_import',
    }));

    const saved = await saveCandidates(params);
    const result = { success: saved.length, failed: candidates.length - saved.length };
    setImportResult(result);
    setStep('done');

    if (saved.length > 0) {
      onImportComplete?.(saved.length);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.json'))) {
      // Simulate file input change
      const dt = new DataTransfer();
      dt.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dt.files;
        fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } else {
      addToast('Please upload a CSV or JSON file', 'error');
    }
  }, [addToast]);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={handleClose} />
      <div className="fixed inset-x-4 top-[5%] md:top-[10%] mx-auto max-w-2xl bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)] shadow-[var(--shadow-lg)] z-50 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)] shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Import Candidates</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {step === 'upload' && 'Upload a CSV or JSON file'}
              {step === 'map' && 'Map columns to candidate fields'}
              {step === 'preview' && `Preview ${candidates.length} candidates`}
              {step === 'importing' && 'Importing candidates...'}
              {step === 'done' && 'Import complete'}
            </p>
          </div>
          <button onClick={handleClose} className="p-1 rounded hover:bg-[var(--bg-surface)] text-[var(--text-muted)]">
            <span className="material-icons-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          {/* Upload Step */}
          {step === 'upload' && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-[var(--border-default)] rounded-xl p-10 text-center hover:border-[var(--primary)] transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className="material-icons-outlined text-4xl text-[var(--text-muted)] mb-3 block">upload_file</span>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                Drop your file here or click to browse
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Supports CSV and JSON files
              </p>
            </div>
          )}

          {/* Column Mapping Step (CSV only) */}
          {step === 'map' && (
            <div className="space-y-4">
              <p className="text-xs text-[var(--text-secondary)]">
                Found {csvHeaders.length} columns and {csvRows.length} rows in <span className="font-medium">{fileName}</span>
              </p>
              <div className="space-y-2">
                {csvHeaders.map((header) => (
                  <div key={header} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-[var(--text-primary)] w-32 truncate" title={header}>
                      {header}
                    </span>
                    <span className="material-icons-outlined text-sm text-[var(--text-muted)]">arrow_forward</span>
                    <select
                      value={columnMapping[header] || 'skip'}
                      onChange={(e) => setColumnMapping(prev => ({ ...prev, [header]: e.target.value as keyof ParsedCandidate | 'skip' }))}
                      className="flex-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:border-[var(--border-focus)] focus:outline-none"
                    >
                      <option value="skip">Skip this column</option>
                      {CANDIDATE_FIELDS.map(f => (
                        <option key={f.key} value={f.key}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              {/* Preview first row */}
              {csvRows.length > 0 && (
                <div className="p-3 bg-[var(--bg-surface)] rounded-lg">
                  <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Sample (Row 1)</p>
                  <div className="space-y-1">
                    {csvHeaders.map((header, i) => (
                      <div key={header} className="flex gap-2 text-xs">
                        <span className="text-[var(--text-muted)] w-28 truncate">{header}:</span>
                        <span className="text-[var(--text-primary)]">{csvRows[0]?.[i] || '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview Step */}
          {step === 'preview' && (
            <div className="space-y-4">
              <p className="text-xs text-[var(--text-secondary)]">
                Ready to import {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
              </p>
              <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-light)] overflow-hidden max-h-[300px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[var(--bg-surface)] sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-[var(--text-muted)]">#</th>
                      <th className="text-left px-3 py-2 font-medium text-[var(--text-muted)]">Name</th>
                      <th className="text-left px-3 py-2 font-medium text-[var(--text-muted)]">Title</th>
                      <th className="text-left px-3 py-2 font-medium text-[var(--text-muted)]">Company</th>
                      <th className="text-left px-3 py-2 font-medium text-[var(--text-muted)]">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)]">
                    {candidates.slice(0, 20).map((c, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-[var(--text-muted)]">{i + 1}</td>
                        <td className="px-3 py-2 font-medium text-[var(--text-primary)]">{c.name}</td>
                        <td className="px-3 py-2 text-[var(--text-secondary)]">{c.title || '-'}</td>
                        <td className="px-3 py-2 text-[var(--text-secondary)]">{c.company || '-'}</td>
                        <td className="px-3 py-2 text-[var(--text-secondary)]">{c.email || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {candidates.length > 20 && (
                  <div className="px-3 py-2 text-xs text-[var(--text-muted)] bg-[var(--bg-surface)]">
                    ...and {candidates.length - 20} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Importing Step */}
          {step === 'importing' && (
            <div className="text-center py-8">
              <span className="material-icons-outlined text-3xl text-[var(--primary)] animate-spin block mb-3">refresh</span>
              <p className="text-sm font-medium text-[var(--text-primary)]">Importing {candidates.length} candidates...</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">This may take a moment</p>
            </div>
          )}

          {/* Done Step */}
          {step === 'done' && (
            <div className="text-center py-8">
              <span className="material-icons-outlined text-4xl text-[var(--success)] block mb-3">check_circle</span>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-1">Import Complete</p>
              <p className="text-xs text-[var(--text-secondary)]">
                Successfully imported {importResult.success} candidate{importResult.success !== 1 ? 's' : ''}
                {importResult.failed > 0 && ` (${importResult.failed} failed)`}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between px-5 py-3 border-t border-[var(--border-light)] bg-[var(--bg-surface)] shrink-0">
          <button
            onClick={step === 'done' ? handleClose : step === 'upload' ? handleClose : () => {
              if (step === 'map') setStep('upload');
              else if (step === 'preview' && fileType === 'csv') setStep('map');
              else setStep('upload');
            }}
            className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
          >
            {step === 'done' ? 'Close' : step === 'upload' ? 'Cancel' : 'Back'}
          </button>
          <div className="flex gap-2">
            {step === 'map' && (
              <button
                onClick={handleMappingComplete}
                className="px-4 py-1.5 text-xs font-medium bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
              >
                Continue
              </button>
            )}
            {step === 'preview' && (
              <button
                onClick={handleImport}
                className="px-4 py-1.5 text-xs font-medium bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
              >
                Import {candidates.length} Candidates
              </button>
            )}
            {step === 'done' && (
              <button
                onClick={handleClose}
                className="px-4 py-1.5 text-xs font-medium bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
