'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ScoreHistoryChartProps {
  data: Array<{
    date: string;
    avg_score: number;
    avg_volume: number;
    difficulty: string;
    intent: string;
  }>;
}

export function ScoreHistoryChart({ data }: ScoreHistoryChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const chartData = data.map((item) => ({
    date: formatDate(item.date),
    score: parseFloat(item.avg_score.toString()),
    volume: parseInt(item.avg_volume.toString()),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>得分历史趋势（最近30天）</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 12 }}
              domain={[0, 100]}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value;
              }}
            />
            <Tooltip 
              contentStyle={{ fontSize: 12 }}
              formatter={(value: any, name: string) => {
                if (name === 'score') return [value.toFixed(2), '得分'];
                if (name === 'volume') {
                  if (value >= 1000000) return [`${(value / 1000000).toFixed(1)}M`, '搜索量'];
                  if (value >= 1000) return [`${(value / 1000).toFixed(1)}K`, '搜索量'];
                  return [value, '搜索量'];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="score" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="volume" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
