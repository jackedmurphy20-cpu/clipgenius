import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Youtube, Tv, ExternalLink, Film, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ClipCard from '@/components/content/ClipCard';
import VideoPlayer from '@/components/content/VideoPlayer';
import { format } from 'date-fns';

export default function ProjectDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');
  const [activeClip, setActiveClip] = useState(null);

  const { data: projects = [], isLoading: loadingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => base44.entities.Project.filter({ id: projectId }),
    enabled: !!projectId,
  });

  const project = projects[0];

  const { data: clips = [], isLoading: loadingClips } = useQuery({
    queryKey: ['projectClips', projectId],
    queryFn: () => base44.entities.ContentClip.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  if (loadingProject) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Project not found</p>
        <Link to="/Dashboard">
          <Button variant="ghost" className="mt-4 gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const PlatformIcon = project.platform === 'youtube' ? Youtube : Tv;

  return (
    <div className="space-y-6">
      <Link to="/Dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Project header */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-foreground">{project.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <PlatformIcon className="w-3 h-3" />
                <span className="capitalize">{project.platform}</span>
              </span>
              <span className="flex items-center gap-1">
                <Film className="w-3 h-3" /> {clips.length} clips
              </span>
              <span>{format(new Date(project.created_date), 'MMM d, yyyy')}</span>
            </div>
          </div>
          <a href={project.source_url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <ExternalLink className="w-3 h-3" /> View Source
            </Button>
          </a>
        </div>
        {project.summary && (
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{project.summary}</p>
        )}
      </div>

      {/* Video player */}
      {activeClip ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Play className="w-3 h-3 text-primary" />
              Previewing: <span className="text-foreground font-medium">{activeClip.title}</span>
              {activeClip.timestamp_start && (
                <span className="ml-1">· starts at {activeClip.timestamp_start}</span>
              )}
            </p>
            <button onClick={() => setActiveClip(null)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Close player
            </button>
          </div>
          <VideoPlayer
            sourceUrl={project.source_url}
            startTimestamp={activeClip.timestamp_start}
          />
        </div>
      ) : (
        <div
          className="w-full aspect-video rounded-2xl border border-dashed border-border bg-card flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => setActiveClip({ title: 'Full video', timestamp_start: null })}
        >
          <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
            <Play className="w-5 h-5 text-primary ml-0.5" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Play Source Video</p>
            <p className="text-xs text-muted-foreground mt-0.5">Or click "Preview" on any clip to jump to that timestamp</p>
          </div>
        </div>
      )}

      {/* Clips */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Generated Clips ({clips.length})
        </h2>
        {loadingClips ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
          </div>
        ) : clips.length === 0 ? (
          <div className="bg-card rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">No clips generated yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clips.map(clip => (
              <ClipCard
                key={clip.id}
                clip={clip}
                onPreview={() => setActiveClip(clip)}
                isActive={activeClip?.id === clip.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}