import React from 'react';

export default function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent || 'bg-primary/15'}`}>
        <Icon className={`w-5 h-5 ${accent ? 'text-white' : 'text-primary'}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}