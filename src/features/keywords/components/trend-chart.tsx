'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface TrendData {
  date: string;
  count: number;
}

interface TrendChartProps {
  data: TrendData[];
}

export function TrendChart({ data }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8">
        <h3 className="text-lg font-semibold">关键词发现趋势</h3>
        <div className="mt-4 flex h-[300px] items-center justify-center">
          <p className="text-sm text-muted-foreground">暂无趋势数据</p>
        </div>
      </div>
    );
  }

  // 格式化日期
  const formattedData = data.map((item) => ({
    ...item,
    dateFormatted: new Date(item.date).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold">关键词发现趋势</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        近 30 天每日新增关键词数量
      </p>
      <div className="mt-6 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="dateFormatted"
              className="text-xs text-muted-foreground"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              className="text-xs text-muted-foreground"
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
