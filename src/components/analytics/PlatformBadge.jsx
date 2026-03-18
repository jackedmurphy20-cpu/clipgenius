import React from 'react';

const styles = {
  tiktok: 'bg-chart-5/15 text-chart-5',
  youtube_shorts: 'bg-destructive/15 text-destructive',
  instagram_reels: 'bg-chart-4/15 text-chart-4',
  twitter: 'bg-chart-2/15 text-chart-2',
};

const labels = {
  tiktok: 'TikTok',
  youtube_shorts: 'YT Shorts',
  instagram_reels: 'Reels',
  twitter: 'Twitter/X',
};

export default function PlatformBadge({ platform }) {
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full mt-0.5 inline-block ${styles[platform] || 'bg-muted text-muted-foreground'}`}>
      {labels[platform] || platform}
    </span>
  );
}