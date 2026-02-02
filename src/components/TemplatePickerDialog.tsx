'use client';

import { useState } from 'react';
import { useTemplates } from '@/lib/hooks/useTemplates';
import { useToast } from './Toast';
import type { SearchTemplate } from '@/lib/supabase';

interface TemplatePickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: SearchTemplate) => void;
}

export function TemplatePickerDialog({ isOpen, onClose, onSelectTemplate }: TemplatePickerDialogProps) {
  const { templates, publicTemplates, isLoading, deleteTemplate, useTemplate } = useTemplates();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'mine' | 'public'>('mine');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUseTemplate = async (template: SearchTemplate) => {
    await useTemplate(template.id);
    onSelectTemplate(template);
    onClose();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    const success = await deleteTemplate(id);
    if (success) {
      addToast('Template deleted', 'success');
    } else {
      addToast('Failed to delete template', 'error');
    }
    setDeletingId(null);
  };

  const displayTemplates = activeTab === 'mine' ? templates : publicTemplates;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-x-4 top-[10%] mx-auto max-w-lg bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)] shadow-[var(--shadow-lg)] z-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Search Templates</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--bg-surface)] text-[var(--text-muted)] transition-colors"
          >
            <span className="material-icons-outlined text-lg">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border-light)]">
          <button
            onClick={() => setActiveTab('mine')}
            className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
              activeTab === 'mine'
                ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            My Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
              activeTab === 'public'
                ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Public Templates ({publicTemplates.length})
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <span className="material-icons-outlined text-2xl text-[var(--text-muted)] animate-spin">refresh</span>
              <p className="text-xs text-[var(--text-muted)] mt-2">Loading templates...</p>
            </div>
          ) : displayTemplates.length === 0 ? (
            <div className="p-8 text-center">
              <span className="material-icons-outlined text-3xl text-[var(--text-muted)] mb-2 block">
                {activeTab === 'mine' ? 'bookmark_border' : 'public'}
              </span>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                {activeTab === 'mine' ? 'No templates yet' : 'No public templates'}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {activeTab === 'mine' ? 'Save a search as a template to reuse it later' : 'Public templates will appear here'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-light)]">
              {displayTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleUseTemplate(template)}
                  className="w-full text-left px-5 py-3 hover:bg-[var(--bg-surface)] transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors truncate">
                        {template.name}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                        {template.query}
                      </p>
                      {template.description && (
                        <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {template.count || 20} results
                        </span>
                        {template.usage_count ? (
                          <span className="text-[10px] text-[var(--text-muted)]">
                            Used {template.usage_count}x
                          </span>
                        ) : null}
                        {(template.criteria as string[] | null)?.length ? (
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {(template.criteria as string[]).length} criteria
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {activeTab === 'mine' && (
                        <button
                          onClick={(e) => handleDelete(template.id, e)}
                          disabled={deletingId === template.id}
                          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error-bg)] opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete template"
                        >
                          <span className={`material-icons-outlined text-sm ${deletingId === template.id ? 'animate-spin' : ''}`}>
                            {deletingId === template.id ? 'refresh' : 'delete'}
                          </span>
                        </button>
                      )}
                      <span className="material-icons-outlined text-sm text-[var(--text-muted)] group-hover:text-[var(--primary)]">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Save as Template Dialog
interface SaveTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  count: number;
  criteria: string[];
  enrichments: Array<{ description: string; format: string }>;
}

export function SaveTemplateDialog({ isOpen, onClose, query, count, criteria, enrichments }: SaveTemplateDialogProps) {
  const { saveAsTemplate } = useTemplates();
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    const template = await saveAsTemplate(name.trim(), query, {
      description: description.trim() || undefined,
      count,
      criteria,
      enrichments,
    });
    setIsSaving(false);
    if (template) {
      addToast('Template saved', 'success');
      setName('');
      setDescription('');
      onClose();
    } else {
      addToast('Failed to save template', 'error');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-x-4 top-[20%] mx-auto max-w-md bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)] shadow-[var(--shadow-lg)] z-50 overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border-light)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Save as Template</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Save this search configuration for reuse</p>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Template Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Senior Engineers Search"
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this template"
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none transition-colors"
            />
          </div>

          <div className="p-3 bg-[var(--bg-surface)] rounded-lg text-xs text-[var(--text-secondary)]">
            <p className="font-medium mb-1">Will save:</p>
            <p className="truncate">Query: {query}</p>
            <p>Results: {count}</p>
            {criteria.length > 0 && <p>{criteria.length} criteria</p>}
            {enrichments.length > 0 && <p>{enrichments.length} enrichments</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-[var(--border-light)] bg-[var(--bg-surface)]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            className="px-4 py-1.5 text-xs font-medium bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>
    </>
  );
}
