import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ExternalLink, Trash2, ChevronDown, ChevronUp, Loader2, Zap } from 'lucide-react';

const platformColors = {
  tiktok: 'bg-chart-5/15 text-chart-5 border-chart-5/20',
  instagram: 'bg-chart-4/15 text-chart-4 border-chart-4/20',
  youtube: 'bg-destructive/15 text-destructive border-destructive/20',
  twitter: 'bg-chart-2/15 text-chart-2 border-chart-2/20',
  other: 'bg-muted text-muted-foreground border-border',
};

const platformLabels = {
  tiktok: 'TikTok', instagram: 'Instagram', youtube: 'YouTube', twitter: 'Twitter/X', other: 'Other',
};

export default function ViralVideoCard({ video, onAnalyze, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const isAnalyzing = video.status === 'analyzing';
  const isAnalyzed = video.status === 'analyzed';

  let factors = [];
  try { factors = JSON.parse(video.virality_factors || '[]'); } catch {}

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-3 hover:border-primary/20 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {video.title || video.url}
          </p>
          <a href={video.url} target="_blank" rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5 truncate">
            <ExternalLink className="w-3 h-3 shrink-0" />
            <span className="truncate">{video.url}</span>
          </a>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant="outline" className={`${platformColors[video.platform]} border text-[10px]`}>
            {platformLabels[video.platform]}
          </Badge>
        </div>
      </div>

      {/* Niche tag */}
      {video.niche && (
        <p className="text-[11px] text-muted-foreground">
          Niche: <span className="text-foreground font-medium">{video.niche}</span>
        </p>
      )}

      {/* Analysis preview */}
      {isAnalyzed && (
        <>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { label: 'Hook Style', value: video.hook_style },
              { label: 'Pacing', value: video.pacing },
              { label: 'Visual Format', value: video.visual_format },
            ].map(({ label, value }) => (
              <div key={label} className="bg-secondary rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
                <p className="text-xs text-foreground font-medium leading-snug line-clamp-2">{value || '—'}</p>
              </div>
            ))}
          </div>

          {video.hook_score && (
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-chart-4" />
              <span className="text-xs text-muted-foreground">Hook Score:</span>
              <div className="flex-1 bg-secondary rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-chart-4 transition-all"
                  style={{ width: `${(video.hook_score / 10) * 100}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-chart-4">{video.hook_score}/10</span>
            </div>
          )}

          {factors.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {factors.map((f, i) => (
                <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{f}</span>
              ))}
            </div>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Hide replication tips' : 'Show replication tips'}
          </button>
          {expanded && video.replication_tips && (
            <div className="bg-secondary rounded-xl p-4 text-sm text-secondary-foreground leading-relaxed whitespace-pre-wrap">
              {video.replication_tips}
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-border">
        {!isAnalyzed && (
          <Button
            size="sm"
            variant="ghost"
            className="text-xs h-8 text-primary hover:text-primary"
            onClick={() => onAnalyze(video)}
            disabled={isAnalyzing}
          >
            {isAnalyzing
              ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Analyzing…</>
              : <><Sparkles className="w-3 h-3 mr-1" /> Analyze with AI</>
            }
          </Button>
        )}
        {isAnalyzed && (
          <Button size="sm" variant="ghost" className="text-xs h-8 text-primary hover:text-primary" onClick={() => onAnalyze(video)}>
            <Sparkles className="w-3 h-3 mr-1" /> Re-analyze
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="text-xs h-8 text-muted-foreground hover:text-destructive ml-auto"
          onClick={() => onDelete(video.id)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}