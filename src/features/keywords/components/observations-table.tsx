'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

interface ObservationsTableProps {
  observations: Array<{
    id: number;
    score: number;
    volume: number;
    difficulty: string;
    intent: string;
    is_green_light: boolean;
    is_painkiller: boolean;
    breakout_score: number | null;
    source: string;
    observed_at: string;
  }>;
}

const difficultyColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const intentColors: Record<string, string> = {
  informational: 'bg-blue-100 text-blue-800',
  transactional: 'bg-purple-100 text-purple-800',
  commercial: 'bg-orange-100 text-orange-800',
  navigational: 'bg-gray-100 text-gray-800',
};

export function ObservationsTable({ observations }: ObservationsTableProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 font-bold';
    if (score >= 60) return 'text-blue-600 font-semibold';
    if (score >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>观察历史（最近50条）</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">得分</TableHead>
                <TableHead className="w-24">搜索量</TableHead>
                <TableHead className="w-20">难度</TableHead>
                <TableHead className="w-24">意图</TableHead>
                <TableHead className="w-24">标记</TableHead>
                <TableHead className="w-24">来源</TableHead>
                <TableHead className="w-40">观察时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {observations.map((obs) => (
                <TableRow key={obs.id}>
                  <TableCell className={getScoreColor(obs.score)}>
                    {obs.score}
                  </TableCell>
                  <TableCell>{formatNumber(obs.volume)}</TableCell>
                  <TableCell>
                    <Badge className={difficultyColors[obs.difficulty]}>
                      {obs.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={intentColors[obs.intent]}>
                      {obs.intent}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {obs.is_green_light && (
                        <span className="text-green-500" title="绿灯词">🟢</span>
                      )}
                      {obs.is_painkiller && (
                        <span className="text-red-500" title="止痛药">💊</span>
                      )}
                      {obs.breakout_score && obs.breakout_score > 0 && (
                        <span className="text-orange-500" title={`Breakout: ${obs.breakout_score}`}>🔥</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{obs.source}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDateTime(obs.observed_at)}
                  </TableCell>
                </TableRow>
              ))}
              {observations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    暂无观察记录
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
