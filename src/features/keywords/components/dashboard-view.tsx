'use client';

import { useEffect, useState } from 'react';
import { StatsCard } from './stats-card';
import { TopKeywordsTable } from './top-keywords-table';
import { TrendChart } from './trend-chart';
import { IntentPieChart } from './intent-pie-chart';
import { Loader2 } from 'lucide-react';

interface DashboardData {
  stats: {
    totalKeywords: number;
    newThisWeek: number;
    greenLightKeywords: number;
    runningTasks: number;
  };
  topKeywords: any[];
  trends: any[];
  intentDistribution: any[];
  difficultyDistribution: any[];
}

export function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const response = await fetch('/api/keywords/dashboard');

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (err: any) {
        console.error('获取 Dashboard 数据失败:', err);
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            加载 Dashboard 数据...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            加载失败: {error}
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="container mx-auto space-y-8 py-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold">关键词挖掘 Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          查看关键词统计数据和挖掘机会
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="总关键词数"
          value={data.stats.totalKeywords}
          icon="keywords"
          description="所有发现的关键词"
        />
        <StatsCard
          title="本周新增"
          value={data.stats.newThisWeek}
          icon="new"
          description="最近 7 天新发现"
        />
        <StatsCard
          title="绿灯词"
          value={data.stats.greenLightKeywords}
          icon="green"
          description="高分低难度机会"
        />
        <StatsCard
          title="运行中任务"
          value={data.stats.runningTasks}
          icon="tasks"
          description="正在挖掘的任务"
        />
      </div>

      {/* TOP 10 关键词表格 */}
      <TopKeywordsTable keywords={data.topKeywords} />

      {/* 图表区域 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 趋势图 */}
        <TrendChart data={data.trends} />

        {/* 意图分布 */}
        <IntentPieChart data={data.intentDistribution} />
      </div>
    </div>
  );
}
