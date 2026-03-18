import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, TrendingUp } from 'lucide-react';
import AddVideoModal from '@/components/viral/AddVideoModal';
import ViralVideoCard from '@/components/viral/ViralVideoCard';
import { toast } from 'sonner';

export default function ViralTracker() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const queryClient = useQueryClient();

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['viralVideos'],
    queryFn: () => base44.entities.ViralVideo.list('-created_date', 100),
  });

  const addMutation = useMutation({
    mutationFn: (data) => base44.entities.ViralVideo.create({ ...data, status: 'saved' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viralVideos'] });
      toast.success('Video saved!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ViralVideo.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['viralVideos'] }),
  });

  const analyzeMutation = useMutation({
    mutationFn: async (video) => {
      await base44.entities.ViralVideo.update(video.id, { status: 'analyzing' });
      queryClient.invalidateQueries({ queryKey: ['viralVideos'] });
      // Keep reference to id in case of error

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert short-form content strategist. Analyze this viral video URL and break down WHY it performs well.

Video URL: ${video.url}
Platform: ${video.platform}
${video.niche ? `Niche: ${video.niche}` : ''}
${video.title ? `Notes: ${video.title}` : ''}

Based on the URL, platform context, and your knowledge of viral content patterns on ${video.platform}, provide a detailed analysis. If the URL gives hints about the content type, use that. Otherwise, analyze based on typical high-performing content for this platform.

Return a JSON object with exactly these fields:
- hook_style: (string, 1-2 sentences) The type of hook used — e.g. "Bold controversial statement opener", "Pattern interrupt with unexpected visual"
- pacing: (string, 1-2 sentences) The pacing style — e.g. "Fast-cut rapid fire, new scene every 1-2 seconds", "Slow build with one long take"
- visual_format: (string, 1-2 sentences) The visual approach — e.g. "Talking head with on-screen text overlays", "B-roll montage with voiceover"
- hook_score: (number 1-10) Estimated hook strength based on platform and content signals
- virality_factors: (array of 3-5 short strings) Key reasons this type of content goes viral, e.g. ["Relatable struggle", "Unexpected twist ending", "Strong emotional hook"]
- replication_tips: (string, 3-5 bullet points starting with •) Specific, actionable tips to replicate this style for your own content`,
        response_json_schema: {
          type: 'object',
          properties: {
            hook_style: { type: 'string' },
            pacing: { type: 'string' },
            visual_format: { type: 'string' },
            hook_score: { type: 'number' },
            virality_factors: { type: 'array', items: { type: 'string' } },
            replication_tips: { type: 'string' },
          },
        },
      });

      await base44.entities.ViralVideo.update(video.id, {
        status: 'analyzed',
        hook_style: result.hook_style,
        pacing: result.pacing,
        visual_format: result.visual_format,
        hook_score: result.hook_score,
        virality_factors: JSON.stringify(result.virality_factors || []),
        replication_tips: result.replication_tips,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viralVideos'] });
      toast.success('Analysis complete!');
    },
    onError: async (_, video) => {
      await base44.entities.ViralVideo.update(video.id, { status: 'failed' });
      queryClient.invalidateQueries({ queryKey: ['viralVideos'] });
      toast.error('Analysis failed. Try again.');
    },
  });

  const filtered = videos.filter(v => {
    const matchesPlatform = filterPlatform === 'all' || v.platform === filterPlatform;
    const matchesSearch = !search ||
      v.title?.toLowerCase().includes(search.toLowerCase()) ||
      v.url?.toLowerCase().includes(search.toLowerCase()) ||
      v.niche?.toLowerCase().includes(search.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  const analyzedCount = videos.filter(v => v.status === 'analyzed').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" /> Viral Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Save viral videos and let AI decode what makes them work
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Add Video
        </Button>
      </div>

      {/* Stats */}
      {videos.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Videos Saved', value: videos.length },
            { label: 'Analyzed', value: analyzedCount },
            { label: 'Platforms', value: new Set(videos.map(v => v.platform)).size },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card rounded-2xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      {videos.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search videos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-card border-border text-sm"
            />
          </div>
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-40 bg-card border-border text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="twitter">Twitter/X</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-foreground font-semibold">No videos saved yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Save URLs of viral videos you find and AI will decode what makes them work
            </p>
          </div>
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Your First Video
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(video => (
            <ViralVideoCard
              key={video.id}
              video={video}
              onAnalyze={(v) => analyzeMutation.mutate(v)}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      <AddVideoModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdd={(data) => addMutation.mutate(data)}
      />
    </div>
  );
}