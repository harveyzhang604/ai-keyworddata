'use client';

import { Activity, FileText, TrendingUp, Zap } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: 'keywords' | 'new' | 'green' | 'tasks';
  description?: string;
}

const iconMap = {
  keywords: FileText,
  new: TrendingUp,
  green: Zap,
  tasks: Activity,
};

const colorMap = {
  keywords: 'text-blue-600 dark:text-blue-400',
  new: 'text-green-600 dark:text-green-400',
  green: 'text-yellow-600 dark:text-yellow-400',
  tasks: 'text-purple-600 dark:text-purple-400',
};

const bgMap = {
  keywords: 'bg-blue-100 dark:bg-blue-900/20',
  new: 'bg-green-100 dark:bg-green-900/20',
  green: 'bg-yellow-100 dark:bg-yellow-900/20',
  tasks: 'bg-purple-100 dark:bg-purple-900/20',
};

export function StatsCard({ title, value, icon, description }: StatsCardProps) {
  const Icon = iconMap[icon];
  const colorClass = colorMap[icon];
  const bgClass = bgMap[icon];

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-3xl font-bold">{value.toLocaleString()}</h3>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className={`rounded-full p-3 ${bgClass}`}>
          <Icon className={`h-6 w-6 ${colorClass}`} />
        </div>
      </div>
    </div>
  );
}
