import React, { useState, useEffect } from 'react';

function parseTimestamp(ts) {
  if (!ts) return 0;
  const parts = ts.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function getYouTubeId(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function getTwitchChannel(url) {
  const match = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);
  return match ? match[1] : null;
}

export default function VideoPlayer({ sourceUrl, startTimestamp }) {
  const [embedSrc, setEmbedSrc] = useState('');

  useEffect(() => {
    if (!sourceUrl) return;

    const youtubeId = getYouTubeId(sourceUrl);
    if (youtubeId) {
      const start = parseTimestamp(startTimestamp);
      setEmbedSrc(
        `https://www.youtube.com/embed/${youtubeId}?start=${start}&autoplay=1&rel=0`
      );
      return;
    }

    const twitchChannel = getTwitchChannel(sourceUrl);
    if (twitchChannel) {
      const parent = window.location.hostname;
      setEmbedSrc(
        `https://player.twitch.tv/?channel=${twitchChannel}&parent=${parent}&autoplay=false`
      );
    }
  }, [sourceUrl, startTimestamp]);

  if (!embedSrc) return null;

  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden border border-border bg-black">
      <iframe
        key={embedSrc}
        src={embedSrc}
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
}