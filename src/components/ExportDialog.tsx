'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import { WebsetItem, getPersonFromItem, getEnrichmentResult } from '@/types/exa';
import { useActivity } from '@/lib/hooks/useActivity';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  items: WebsetItem[];
  criteria?: string[];
  searchQuery?: string;
}

type ExportFormat = 'csv' | 'json' | 'xlsx';

export function ExportDialog({ isOpen, onClose, items, criteria = [], searchQuery = '' }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [includeOptions, setIncludeOptions] = useState({
    basicInfo: true,
    contactInfo: true,
    criteriaMatch: true,
    enrichments: true,
  });
  const [isExporting, setIsExporting] = useState(false);
  const { logExportCompleted } = useActivity();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData = prepareExportData(items, criteria, includeOptions);

      switch (format) {
        case 'csv':
          downloadCSV(exportData, `recruit-ai-export-${Date.now()}.csv`);
          break;
        case 'json':
          downloadJSON(items, criteria, includeOptions, `recruit-ai-export-${Date.now()}.json`, searchQuery);
          break;
        case 'xlsx':
          downloadXLSX(exportData, `recruit-ai-export-${Date.now()}.xlsx`);
          break;
      }

      // Log export activity
      logExportCompleted(items.length, format);

      onClose();
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleOption = (key: keyof typeof includeOptions) => {
    setIncludeOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Results" size="sm">
      <div className="space-y-5">
        {/* Format Selection */}
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)] block mb-2">Export Format</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { id: 'csv', label: 'CSV', desc: 'Spreadsheet compatible' },
              { id: 'json', label: 'JSON', desc: 'Developer friendly' },
              { id: 'xlsx', label: 'Excel', desc: 'Microsoft Excel' },
            ] as const).map((option) => (
              <button
                key={option.id}
                onClick={() => setFormat(option.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  format === option.id
                    ? 'border-[var(--primary)] bg-[var(--primary-light)]'
                    : 'border-[var(--border-light)] hover:border-[var(--border)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                <div className={`text-xs font-semibold ${
                  format === option.id ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'
                }`}>
                  {option.label}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Include Options */}
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)] block mb-2">Include in Export</label>
          <div className="space-y-2">
            {[
              { key: 'basicInfo', label: 'Basic Info', desc: 'Name, company, position, location' },
              { key: 'contactInfo', label: 'Contact Info', desc: 'Email, LinkedIn, GitHub URLs' },
              { key: 'criteriaMatch', label: 'Criteria Match', desc: 'Match status for each criterion' },
              { key: 'enrichments', label: 'Enrichments', desc: 'Additional enriched data' },
            ].map((option) => (
              <label
                key={option.key}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={includeOptions[option.key as keyof typeof includeOptions]}
                  onChange={() => toggleOption(option.key as keyof typeof includeOptions)}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-xs font-medium text-[var(--text-primary)]">{option.label}</div>
                  <div className="text-[10px] text-[var(--text-muted)]">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="p-3 bg-[var(--bg-surface)] rounded-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-secondary)]">Records to export</span>
            <span className="font-semibold text-[var(--text-primary)]">{items.length}</span>
          </div>
          {criteria.length > 0 && (
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-[var(--text-secondary)]">Criteria columns</span>
              <span className="font-semibold text-[var(--text-primary)]">{criteria.length}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || items.length === 0}
            className="btn btn-primary disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <span className="material-icons-outlined text-sm animate-spin">refresh</span>
                Exporting...
              </>
            ) : (
              <>
                <span className="material-icons-outlined text-sm">download</span>
                Export {format.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Helper functions for export
interface ExportRow {
  name: string;
  company: string;
  position: string;
  location: string;
  url: string;
  email?: string;
  linkedin?: string;
  github?: string;
  criteriaStatus?: Record<string, string>;
  enrichments?: Record<string, string>;
}

function prepareExportData(
  items: WebsetItem[],
  criteria: string[],
  options: { basicInfo: boolean; contactInfo: boolean; criteriaMatch: boolean; enrichments: boolean }
): ExportRow[] {
  return items.map(item => {
    const person = getPersonFromItem(item);
    const row: ExportRow = {
      name: '',
      company: '',
      position: '',
      location: '',
      url: '',
    };

    if (options.basicInfo) {
      row.name = person?.name || '';
      row.company = person?.company?.name || '';
      row.position = person?.position || '';
      row.location = person?.location || '';
      row.url = item.properties.url || '';
    }

    if (options.contactInfo) {
      row.email = getEnrichmentResult(item, 'email') || '';
      row.linkedin = getEnrichmentResult(item, 'linkedin') || item.properties.url || '';
      row.github = getEnrichmentResult(item, 'github') || '';
    }

    if (options.criteriaMatch && criteria.length > 0) {
      row.criteriaStatus = {};
      criteria.forEach((criterion, index) => {
        const evaluation = item.evaluations?.[index];
        row.criteriaStatus![criterion] = evaluation?.satisfied || 'unclear';
      });
    }

    if (options.enrichments && item.enrichments) {
      row.enrichments = {};
      item.enrichments.forEach(enrichment => {
        if (enrichment.status === 'completed' && enrichment.result?.length) {
          row.enrichments![enrichment.enrichmentId] = enrichment.result[0];
        }
      });
    }

    return row;
  });
}

function downloadCSV(data: ExportRow[], filename: string) {
  if (data.length === 0) return;

  // Build headers
  const headers: string[] = ['Name', 'Company', 'Position', 'Location', 'URL'];
  if (data[0].email !== undefined) headers.push('Email', 'LinkedIn', 'GitHub');
  if (data[0].criteriaStatus) {
    Object.keys(data[0].criteriaStatus).forEach(criterion => {
      headers.push(`Criteria: ${criterion.slice(0, 30)}`);
    });
  }
  if (data[0].enrichments) {
    Object.keys(data[0].enrichments).forEach(enrichment => {
      headers.push(`Enrichment: ${enrichment}`);
    });
  }

  // Build rows
  const rows = data.map(row => {
    const values: string[] = [
      escapeCsvValue(row.name),
      escapeCsvValue(row.company),
      escapeCsvValue(row.position),
      escapeCsvValue(row.location),
      escapeCsvValue(row.url),
    ];

    if (row.email !== undefined) {
      values.push(
        escapeCsvValue(row.email || ''),
        escapeCsvValue(row.linkedin || ''),
        escapeCsvValue(row.github || '')
      );
    }

    if (row.criteriaStatus) {
      Object.values(row.criteriaStatus).forEach(status => {
        values.push(escapeCsvValue(status));
      });
    }

    if (row.enrichments) {
      Object.values(row.enrichments).forEach(value => {
        values.push(escapeCsvValue(value));
      });
    }

    return values.join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadFile(csvContent, filename, 'text/csv');
}

function downloadJSON(
  items: WebsetItem[],
  criteria: string[],
  options: { basicInfo: boolean; contactInfo: boolean; criteriaMatch: boolean; enrichments: boolean },
  filename: string,
  searchQuery: string
) {
  const exportData = {
    exportedAt: new Date().toISOString(),
    searchQuery,
    totalRecords: items.length,
    criteria,
    candidates: items.map(item => {
      const person = getPersonFromItem(item);
      const candidate: Record<string, unknown> = {};

      if (options.basicInfo) {
        candidate.name = person?.name || null;
        candidate.company = person?.company?.name || null;
        candidate.position = person?.position || null;
        candidate.location = person?.location || null;
        candidate.profileUrl = item.properties.url || null;
        candidate.pictureUrl = person?.pictureUrl || null;
      }

      if (options.contactInfo) {
        candidate.email = getEnrichmentResult(item, 'email') || null;
        candidate.linkedin = getEnrichmentResult(item, 'linkedin') || null;
        candidate.github = getEnrichmentResult(item, 'github') || null;
      }

      if (options.criteriaMatch && item.evaluations) {
        candidate.criteriaEvaluations = item.evaluations.map(evaluation => ({
          criterion: evaluation.criterion,
          satisfied: evaluation.satisfied,
          reasoning: evaluation.reasoning,
          references: evaluation.references,
        }));
      }

      if (options.enrichments && item.enrichments) {
        candidate.enrichments = item.enrichments
          .filter(e => e.status === 'completed')
          .map(e => ({
            id: e.enrichmentId,
            format: e.format,
            result: e.result,
            reasoning: e.reasoning,
          }));
      }

      return candidate;
    }),
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
}

function downloadXLSX(data: ExportRow[], filename: string) {
  // For Excel, we'll create a more sophisticated CSV with proper encoding
  // that Excel can import well. In a real app, you'd use a library like xlsx or exceljs

  if (data.length === 0) return;

  // Build headers
  const headers: string[] = ['Name', 'Company', 'Position', 'Location', 'URL'];
  if (data[0].email !== undefined) headers.push('Email', 'LinkedIn', 'GitHub');
  if (data[0].criteriaStatus) {
    Object.keys(data[0].criteriaStatus).forEach(criterion => {
      headers.push(`Criteria: ${criterion.slice(0, 30)}`);
    });
  }
  if (data[0].enrichments) {
    Object.keys(data[0].enrichments).forEach(enrichment => {
      headers.push(`Enrichment: ${enrichment}`);
    });
  }

  // Build rows with tab separation (Excel-friendly)
  const rows = data.map(row => {
    const values: string[] = [
      row.name,
      row.company,
      row.position,
      row.location,
      row.url,
    ];

    if (row.email !== undefined) {
      values.push(row.email || '', row.linkedin || '', row.github || '');
    }

    if (row.criteriaStatus) {
      Object.values(row.criteriaStatus).forEach(status => {
        values.push(status);
      });
    }

    if (row.enrichments) {
      Object.values(row.enrichments).forEach(value => {
        values.push(value);
      });
    }

    return values.join('\t');
  });

  // Add BOM for Excel UTF-8 compatibility
  const xlsContent = '\uFEFF' + [headers.join('\t'), ...rows].join('\n');
  downloadFile(xlsContent, filename.replace('.xlsx', '.xls'), 'application/vnd.ms-excel');
}

function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
