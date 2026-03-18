import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Clock, Hash, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

const platformColors = {
  tiktok: 'bg-chart-5/15 text-chart-5 border-chart-5/20',
  youtube_shorts: 'bg-destructive/15 text-destructive border-destructive/20',
  instagram_reels: 'bg-chart-4/15 text-chart-4 border-chart-4/20',
  twitter: 'bg-chart-2/15 text-chart-2 border-chart-2/20',
};

const platformLabels = {
  tiktok: 'TikTok',
  youtube_shorts: 'YT Shorts',
  instagram_reels: 'Reels',
  twitter: 'Twitter/X',
};

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  edited: 'bg-chart-2/15 text-chart-2',
  published: 'bg-chart-3/15 text-chart-3',
};

export default function ClipCard({ clip }) {
  const [expanded, setExpanded] = useState(false);

  const copyScript = () => {
    navigator.clipboard.writeText(clip.script);
    toast.success('Script copied to clipboard');
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5 hover:border-primary/20 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{clip.title}</h3>
          {clip.hook && (
            <p className="text-xs text-primary mt-1 italic">"{clip.hook}"</p>
          )}
        </div>
        <Badge className={`${statusColors[clip.status]} text-[10px] shrink-0`}>
          {clip.status}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {clip.target_platform && (
          <Badge variant="outline" className={`${platformColors[clip.target_platform]} border text-[10px]`}>
            {platformLabels[clip.target_platform]}
          </Badge>
        )}
        {clip.duration_seconds && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="w-3 h-3" /> {clip.duration_seconds}s
          </span>
        )}
        {clip.timestamp_start && (
          <span className="text-[11px] text-muted-foreground">
            {clip.timestamp_start} → {clip.timestamp_end}
          </span>
        )}
      </div>

      <div className="mt-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Hide script' : 'Show script'}
        </button>
        {expanded && (
          <div className="mt-2 bg-secondary rounded-xl p-4 text-sm text-secondary-foreground leading-relaxed whitespace-pre-wrap">
            {clip.script}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
        <Button size="sm" variant="ghost" className="text-xs h-8" onClick={copyScript}>
          <Copy className="w-3 h-3 mr-1" /> Copy Script
        </Button>
        {clip.hashtags && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground ml-auto">
            <Hash className="w-3 h-3" /> {clip.hashtags}
          </span>
        )}
      </div>
    </div>
  );
}