import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Youtube, Tv, ChevronRight, Film } from 'lucide-react';
import { format } from 'date-fns';

const platformIcons = { youtube: Youtube, twitch: Tv };
const statusStyles = {
  processing: 'bg-chart-4/15 text-chart-4 border-chart-4/20',
  completed: 'bg-chart-3/15 text-chart-3 border-chart-3/20',
  failed: 'bg-destructive/15 text-destructive border-destructive/20',
};

export default function ProjectCard({ project }) {
  const PlatformIcon = platformIcons[project.platform] || Youtube;

  return (
    <Link
      to={`/ProjectDetail?id=${project.id}`}
      className="group bg-card rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 overflow-hidden block"
    >
      <div className="relative h-36 bg-secondary overflow-hidden">
        {project.thumbnail_url ? (
          <img src={project.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PlatformIcon className="w-10 h-10 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge className={`${statusStyles[project.status]} border text-[10px] font-semibold uppercase tracking-wider`}>
            {project.status}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <PlatformIcon className="w-3 h-3" />
            <span className="capitalize">{project.platform}</span>
          </div>
          <div className="flex items-center gap-1">
            <Film className="w-3 h-3" />
            <span>{project.clip_count || 0} clips</span>
          </div>
          <span>{format(new Date(project.created_date), 'MMM d')}</span>
        </div>
      </div>
    </Link>
  );
}