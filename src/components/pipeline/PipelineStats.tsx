'use client';

import { useMemo } from 'react';
import { PipelineStage, PipelineCandidate } from '@/lib/hooks/usePipeline';
import { TrendingUp, TrendingDown, Users, ArrowRight } from 'lucide-react';

interface PipelineStatsProps {
  stages: PipelineStage[];
  candidates: PipelineCandidate[];
}

export function PipelineStats({ stages, candidates }: PipelineStatsProps) {
  const stats = useMemo(() => {
    return stages.map((stage, index) => {
      const count = candidates.filter(c =>
        c.stage === stage.name || (!c.stage && stage.name === 'New')
      ).length;

      const percentage = candidates.length > 0 ? (count / candidates.length) * 100 : 0;

      // Calculate conversion rate from previous stage
      let conversionRate = 100;
      if (index > 0) {
        const prevStage = stages[index - 1];
        const prevCount = candidates.filter(c =>
          c.stage === prevStage.name || (!c.stage && prevStage.name === 'New')
        ).length;
        conversionRate = prevCount > 0 ? (count / prevCount) * 100 : 0;
      }

      return {
        ...stage,
        count,
        percentage,
        conversionRate,
      };
    });
  }, [stages, candidates]);

  const totalCandidates = candidates.length;
  const hiredCount = candidates.filter(c => c.stage === 'Hired').length;
  const overallConversion = totalCandidates > 0 ? (hiredCount / totalCandidates) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] p-4">
          <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium">Total Candidates</span>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{totalCandidates}</p>
        </div>

        <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] p-4">
          <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium">Hired</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{hiredCount}</p>
        </div>

        <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] p-4">
          <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
            <ArrowRight className="w-4 h-4" />
            <span className="text-xs font-medium">In Pipeline</span>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {totalCandidates - hiredCount - candidates.filter(c => c.stage === 'Rejected').length}
          </p>
        </div>

        <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] p-4">
          <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Hire Rate</span>
          </div>
          <p className="text-2xl font-bold text-[var(--primary)]">{overallConversion.toFixed(1)}%</p>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] p-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Pipeline Funnel</h3>

        <div className="space-y-3">
          {stats.filter(s => s.name !== 'Rejected').map((stage, index) => (
            <div key={stage.id} className="flex items-center gap-3">
              <div className="w-24 text-xs font-medium text-[var(--text-secondary)] truncate">
                {stage.name}
              </div>

              <div className="flex-1 relative">
                <div className="h-8 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.max(stage.percentage, 5)}%`,
                      backgroundColor: stage.color,
                    }}
                  >
                    {stage.percentage > 20 && (
                      <span className="text-xs font-semibold text-white">
                        {stage.count}
                      </span>
                    )}
                  </div>
                </div>
                {stage.percentage <= 20 && (
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--text-primary)]">
                    {stage.count}
                  </span>
                )}
              </div>

              <div className="w-20 text-right">
                {index > 0 && (
                  <span className={`text-xs font-medium ${
                    stage.conversionRate >= 50 ? 'text-green-600' :
                    stage.conversionRate >= 25 ? 'text-yellow-600' :
                    'text-red-500'
                  }`}>
                    {stage.conversionRate.toFixed(0)}% conv.
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stage Breakdown */}
      <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] p-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Stage Breakdown</h3>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {stats.map((stage) => (
            <div
              key={stage.id}
              className="text-center p-3 rounded-lg bg-[var(--bg-surface)]"
            >
              <div
                className="w-3 h-3 rounded-full mx-auto mb-2"
                style={{ backgroundColor: stage.color }}
              />
              <p className="text-lg font-bold text-[var(--text-primary)]">{stage.count}</p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">{stage.name}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{stage.percentage.toFixed(0)}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
