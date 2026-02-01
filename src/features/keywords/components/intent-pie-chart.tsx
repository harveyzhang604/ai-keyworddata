'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface IntentData {
  intent: string;
  count: number;
}

interface IntentPieChartProps {
  data: IntentData[];
}

const COLORS = {
  informational: '#3b82f6',
  commercial: '#8b5cf6',
  transactional: '#f97316',
  navigational: '#06b6d4',
  unknown: '#6b7280',
};

const LABELS = {
  informational: '信息型',
  commercial: '商业型',
  transactional: '交易型',
  navigational: '导航型',
  unknown: '未知',
};

export function IntentPieChart({ data }: IntentPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8">
        <h3 className="text-lg font-semibold">意图分布</h3>
        <div className="mt-4 flex h-[300px] items-center justify-center">
          <p className="text-sm text-muted-foreground">暂无数据</p>
        </div>
      </div>
    );
  }

  const formattedData = data.map((item) => ({
    ...item,
    label: LABELS[item.intent as keyof typeof LABELS] || item.intent,
    fill: COLORS[item.intent as keyof typeof COLORS] || COLORS.unknown,
  }));

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold">意图分布</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        关键词搜索意图分类统计
      </p>
      <div className="mt-6 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedData}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ label, percent }) =>
                `${label} ${(percent * 100).toFixed(0)}%`
              }
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {formattedData.map((item) => (
          <div key={item.intent} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-sm text-muted-foreground">
              {item.label}: {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
