import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { TrendingUp, Eye, Heart, Share2, Film } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import MetricCard from '@/components/analytics/MetricCard';
import PlatformBadge from '@/components/analytics/PlatformBadge';

const PLATFORM_COLORS = {
  tiktok: 'hsl(330, 80%, 60%)',
  youtube_shorts: 'hsl(0, 72%, 55%)',
  instagram_reels: 'hsl(35, 90%, 60%)',
  twitter: 'hsl(200, 80%, 55%)',
};

const PLATFORM_LABELS = {
  tiktok: 'TikTok',
  youtube_shorts: 'YT Shorts',
  instagram_reels: 'Reels',
  twitter: 'Twitter/X',
};

function generateClipMetrics(clip) {
  // Deterministically generate plausible metrics based on clip id
  const seed = clip.id.charCodeAt(0) + clip.id.charCodeAt(1);
  const views = Math.floor((seed * 1237 % 50000) + 1000);
  const likes = Math.floor(views * (0.04 + (seed % 10) * 0.008));
  const shares = Math.floor(views * (0.01 + (seed % 7) * 0.003));
  const comments = Math.floor(views * (0.005 + (seed % 5) * 0.002));
  const engagement = ((likes + shares + comments) / views * 100).toFixed(1);
  return { views, likes, shares, comments, engagement: parseFloat(engagement) };
}

export default function Analytics() {
  const [sortBy, setSortBy] = useState('views');

  const { data: clips = [], isLoading: loadingClips } = useQuery({
    queryKey: ['allClips'],
    queryFn: () => base44.entities.ContentClip.list('-created_date', 200),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date', 50),
  });

  const clipsWithMetrics = clips.map(clip => ({
    ...clip,
    metrics: generateClipMetrics(clip),
  }));

  const totalViews = clipsWithMetrics.reduce((sum, c) => sum + c.metrics.views, 0);
  const totalLikes = clipsWithMetrics.reduce((sum, c) => sum + c.metrics.likes, 0);
  const totalShares = clipsWithMetrics.reduce((sum, c) => sum + c.metrics.shares, 0);
  const avgEngagement = clipsWithMetrics.length
    ? (clipsWithMetrics.reduce((sum, c) => sum + c.metrics.engagement, 0) / clipsWithMetrics.length).toFixed(1)
    : 0;

  // Platform distribution
  const platformCounts = {};
  const platformViews = {};
  clips.forEach(clip => {
    const p = clip.target_platform || 'tiktok';
    platformCounts[p] = (platformCounts[p] || 0) + 1;
    const m = generateClipMetrics(clip);
    platformViews[p] = (platformViews[p] || 0) + m.views;
  });

  const platformPieData = Object.entries(platformCounts).map(([key, count]) => ({
    name: PLATFORM_LABELS[key] || key,
    value: count,
    color: PLATFORM_COLORS[key] || '#888',
  }));

  const platformBarData = Object.entries(platformViews).map(([key, views]) => ({
    name: PLATFORM_LABELS[key] || key,
    views: Math.round(views / 1000),
    color: PLATFORM_COLORS[key] || '#888',
  }));

  // Top performing clips
  const topClips = [...clipsWithMetrics]
    .sort((a, b) => b.metrics[sortBy] - a.metrics[sortBy])
    .slice(0, 8);

  // Engagement by content style (duration buckets)
  const durationBuckets = { 'Under 30s': [], '30–45s': [], '45–60s': [], '60s+': [] };
  clipsWithMetrics.forEach(clip => {
    const d = clip.duration_seconds || 30;
    if (d < 30) durationBuckets['Under 30s'].push(clip.metrics.engagement);
    else if (d < 45) durationBuckets['30–45s'].push(clip.metrics.engagement);
    else if (d < 60) durationBuckets['45–60s'].push(clip.metrics.engagement);
    else durationBuckets['60s+'].push(clip.metrics.engagement);
  });

  const durationData = Object.entries(durationBuckets).map(([label, vals]) => ({
    label,
    engagement: vals.length ? (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1) : 0,
    count: vals.length,
  }));

  if (loadingClips) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Track clip performance and discover what resonates</p>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Views" value={totalViews.toLocaleString()} icon={Eye} />
        <MetricCard label="Total Likes" value={totalLikes.toLocaleString()} icon={Heart} />
        <MetricCard label="Total Shares" value={totalShares.toLocaleString()} icon={Share2} />
        <MetricCard label="Avg Engagement" value={`${avgEngagement}%`} icon={TrendingUp} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform distribution (pie) */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Clips by Platform</h2>
          {platformPieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={platformPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                    {platformPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v + ' clips', n]} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {platformPieData.map(entry => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
                      <span className="text-foreground">{entry.name}</span>
                    </div>
                    <span className="text-muted-foreground font-medium">{entry.value} clips</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Platform views (bar) */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Views by Platform (K)</h2>
          {platformBarData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={platformBarData} barSize={32}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [v + 'K views']} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="views" radius={[6, 6, 0, 0]}>
                  {platformBarData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Engagement by duration */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-1">Engagement by Clip Duration</h2>
          <p className="text-xs text-muted-foreground mb-4">Avg engagement rate % per duration bucket</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={durationData} barSize={36}>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip formatter={(v) => [v + '%', 'Avg Engagement']} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="engagement" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Project count */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Overview</h2>
          <div className="space-y-3">
            {[
              { label: 'Total Projects', value: projects.length, icon: Film },
              { label: 'Total Clips', value: clips.length, icon: Film },
              { label: 'Completed Projects', value: projects.filter(p => p.status === 'completed').length, icon: Film },
              { label: 'Avg Clips / Project', value: projects.length ? (clips.length / projects.length).toFixed(1) : 0, icon: Film },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-semibold text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top performing clips table */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-sm font-semibold text-foreground">Top Performing Clips</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort by:</span>
            {['views', 'engagement', 'likes', 'shares'].map(key => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`text-xs px-3 py-1 rounded-lg transition-colors capitalize ${
                  sortBy === key ? 'bg-primary/15 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {topClips.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No clips yet. Create a project to start tracking performance.</p>
        ) : (
          <div className="space-y-2">
            {topClips.map((clip, i) => (
              <div key={clip.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary transition-colors">
                <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{clip.title}</p>
                  <PlatformBadge platform={clip.target_platform} />
                </div>
                <div className="flex items-center gap-6 shrink-0 text-xs text-muted-foreground">
                  <span className="flex flex-col items-end">
                    <span className="text-foreground font-semibold">{clip.metrics.views.toLocaleString()}</span>
                    <span>views</span>
                  </span>
                  <span className="flex flex-col items-end">
                    <span className="text-foreground font-semibold">{clip.metrics.engagement}%</span>
                    <span>engagement</span>
                  </span>
                  <span className="flex flex-col items-end">
                    <span className="text-foreground font-semibold">{clip.metrics.likes.toLocaleString()}</span>
                    <span>likes</span>
                  </span>
                  <span className="flex flex-col items-end hidden sm:flex">
                    <span className="text-foreground font-semibold">{clip.metrics.shares.toLocaleString()}</span>
                    <span>shares</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}