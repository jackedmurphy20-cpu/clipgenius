import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Youtube, Tv, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

function detectPlatform(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('twitch.tv')) return 'twitch';
  return null;
}

function extractYoutubeThumbnail(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : '';
}

export default function NewProject() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [url, setUrl] = useState('');
  const [clipCount, setClipCount] = useState('5');
  const [targetPlatform, setTargetPlatform] = useState('tiktok');
  const [isGenerating, setIsGenerating] = useState(false);

  const platform = detectPlatform(url);

  const handleGenerate = async () => {
    if (!url.trim()) {
      toast.error('Please paste a URL');
      return;
    }
    if (!platform) {
      toast.error('Please enter a valid YouTube or Twitch URL');
      return;
    }

    setIsGenerating(true);
    let project = null;

    try {
      const thumbnail_url = platform === 'youtube' ? extractYoutubeThumbnail(url) : '';

      // Step 1: Create project
      project = await base44.entities.Project.create({
        title: 'Analyzing content...',
        source_url: url,
        platform,
        thumbnail_url,
        status: 'processing',
        clip_count: 0,
      });

      // Step 2: Ask AI to analyze and generate clips
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a viral short-form content expert. Analyze this ${platform} URL: ${url}

Generate ${clipCount} short-form content ideas optimized for ${targetPlatform === 'youtube_shorts' ? 'YouTube Shorts' : targetPlatform === 'instagram_reels' ? 'Instagram Reels' : targetPlatform}.

For each clip, provide:
- A catchy title
- An attention-grabbing opening hook (first 3 seconds)
- A full script (30-60 seconds worth of speaking)
- Estimated duration in seconds
- Suggested timestamp range from the source (make reasonable estimates like "2:30" - "3:15")
- 3-5 relevant hashtags (comma separated, no # symbol)

Also provide:
- An overall title for the source content
- A brief summary of the source content`,
        response_json_schema: {
          type: 'object',
          properties: {
            source_title: { type: 'string' },
            source_summary: { type: 'string' },
            clips: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  hook: { type: 'string' },
                  script: { type: 'string' },
                  duration_seconds: { type: 'number' },
                  timestamp_start: { type: 'string' },
                  timestamp_end: { type: 'string' },
                  hashtags: { type: 'string' },
                },
              },
            },
          },
        },
        model: 'gpt_5_mini',
      });

      // Step 3: Save clips
      const clipsToCreate = result.clips.map(clip => ({
        project_id: project.id,
        title: clip.title,
        hook: clip.hook,
        script: clip.script,
        target_platform: targetPlatform,
        duration_seconds: clip.duration_seconds,
        timestamp_start: clip.timestamp_start,
        timestamp_end: clip.timestamp_end,
        hashtags: clip.hashtags,
        status: 'draft',
      }));

      await base44.entities.ContentClip.bulkCreate(clipsToCreate);

      // Step 4: Update project
      await base44.entities.Project.update(project.id, {
        title: result.source_title || 'Untitled Project',
        summary: result.source_summary || '',
        status: 'completed',
        clip_count: clipsToCreate.length,
      });

      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['clips'] });
      toast.success(`Generated ${clipsToCreate.length} clip ideas!`);
      navigate(`/ProjectDetail?id=${project.id}`);
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
      if (project?.id) {
        await base44.entities.Project.update(project.id, { status: 'failed' });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">New Project</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Paste a YouTube or Twitch URL to generate short-form content ideas
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Video / Stream URL</Label>
          <div className="relative">
            <Input
              placeholder="https://youtube.com/watch?v=... or https://twitch.tv/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-12 pl-4 pr-12 bg-secondary border-border text-sm"
              disabled={isGenerating}
            />
            {platform && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {platform === 'youtube' ? (
                  <Youtube className="w-5 h-5 text-destructive" />
                ) : (
                  <Tv className="w-5 h-5 text-chart-1" />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Number of Clips</Label>
            <Select value={clipCount} onValueChange={setClipCount} disabled={isGenerating}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 clips</SelectItem>
                <SelectItem value="5">5 clips</SelectItem>
                <SelectItem value="8">8 clips</SelectItem>
                <SelectItem value="10">10 clips</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Target Platform</Label>
            <Select value={targetPlatform} onValueChange={setTargetPlatform} disabled={isGenerating}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="youtube_shorts">YouTube Shorts</SelectItem>
                <SelectItem value="instagram_reels">Instagram Reels</SelectItem>
                <SelectItem value="twitter">Twitter / X</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {platform === 'youtube' && extractYoutubeThumbnail(url) && (
          <div className="rounded-xl overflow-hidden border border-border">
            <img
              src={extractYoutubeThumbnail(url)}
              alt="Video thumbnail"
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !platform}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing content & generating clips...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Short-Form Content
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      {isGenerating && (
        <div className="bg-card rounded-2xl border border-primary/20 p-6 text-center space-y-3">
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          <p className="text-sm text-foreground font-medium">AI is analyzing your content</p>
          <p className="text-xs text-muted-foreground">
            This may take 15-30 seconds depending on content length
          </p>
        </div>
      )}
    </div>
  );
}