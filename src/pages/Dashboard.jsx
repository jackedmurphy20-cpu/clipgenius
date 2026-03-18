import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FolderOpen, Film, Sparkles, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import StatCard from '@/components/dashboard/StatCard';
import ProjectCard from '@/components/dashboard/ProjectCard';

export default function Dashboard() {
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date', 50),
  });

  const { data: clips = [], isLoading: loadingClips } = useQuery({
    queryKey: ['clips'],
    queryFn: () => base44.entities.ContentClip.list('-created_date', 100),
  });

  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalClips = clips.length;
  const recentProjects = projects.slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Turn long-form content into viral shorts</p>
        </div>
        <Link to="/NewProject">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loadingProjects || loadingClips ? (
          Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard label="Total Projects" value={projects.length} icon={FolderOpen} />
            <StatCard label="Completed" value={completedProjects} icon={Sparkles} />
            <StatCard label="Clips Generated" value={totalClips} icon={Film} />
          </>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Projects</h2>
          {projects.length > 6 && (
            <Link to="/ContentLibrary" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
        {loadingProjects ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
          </div>
        ) : recentProjects.length === 0 ? (
          <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
            <Sparkles className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-sm font-semibold text-foreground mb-1">No projects yet</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Paste a YouTube or Twitch URL to start generating short-form content
            </p>
            <Link to="/NewProject">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Plus className="w-3 h-3" /> Create First Project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}