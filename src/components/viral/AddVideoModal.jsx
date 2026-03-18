import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'lucide-react';

const platforms = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'other', label: 'Other' },
];

function detectPlatform(url) {
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
  return 'other';
}

export default function AddVideoModal({ open, onClose, onAdd }) {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('');
  const [title, setTitle] = useState('');
  const [niche, setNiche] = useState('');

  const handleUrlChange = (val) => {
    setUrl(val);
    if (!platform) setPlatform(detectPlatform(val));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url || !platform) return;
    onAdd({ url, platform, title, niche });
    setUrl(''); setPlatform(''); setTitle(''); setNiche('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Link className="w-4 h-4 text-primary" /> Save Viral Video
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Video URL *</Label>
            <Input
              placeholder="https://www.tiktok.com/..."
              value={url}
              onChange={e => handleUrlChange(e.target.value)}
              className="bg-secondary border-border text-sm"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Platform *</Label>
            <Select value={platform} onValueChange={setPlatform} required>
              <SelectTrigger className="bg-secondary border-border text-sm">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {platforms.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Title / Note (optional)</Label>
            <Input
              placeholder="e.g. Crazy hook opener, cooking niche"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-secondary border-border text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Niche / Topic (optional)</Label>
            <Input
              placeholder="e.g. fitness, finance, comedy"
              value={niche}
              onChange={e => setNiche(e.target.value)}
              className="bg-secondary border-border text-sm"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost" className="flex-1 text-sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 text-sm">Save Video</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}