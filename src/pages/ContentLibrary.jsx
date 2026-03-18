import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Film } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ClipCard from '@/components/content/ClipCard';

export default function ContentLibrary() {
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: clips = [], isLoading } = useQuery({
    queryKey: ['allClips'],
    queryFn: () => base44.entities.ContentClip.list('-created_date', 200),
  });

  const filtered = clips.filter(clip => {
    const matchSearch = !search || clip.title?.toLowerCase().includes(search.toLowerCase()) || clip.script?.toLowerCase().includes(search.toLowerCase());
    const matchPlatform = platformFilter === 'all' || clip.target_platform === platformFilter;
    const matchStatus = statusFilter === 'all' || clip.status === statusFilter;
    return matchSearch && matchPlatform && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Content Library</h1>
        <p className="text-sm text-muted-foreground mt-1">All your generated clip ideas in one place</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search clips..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border h-10"
          />
        </div>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-40 bg-secondary border-border">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
            <SelectItem value="youtube_shorts">YT Shorts</SelectItem>
            <SelectItem value="instagram_reels">Reels</SelectItem>
            <SelectItem value="twitter">Twitter/X</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-secondary border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="edited">Edited</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
          <Film className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-foreground mb-1">No clips found</h3>
          <p className="text-xs text-muted-foreground">
            {clips.length === 0 ? 'Create a project to start generating clips' : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(clip => (
            <ClipCard key={clip.id} clip={clip} />
          ))}
        </div>
      )}
    </div>
  );
}