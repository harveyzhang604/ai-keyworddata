'use client';

import React from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { CalendarIcon, TrendingUpIcon, AlertCircleIcon, TargetIcon } from 'lucide-react';

interface KeywordInfoCardProps {
  keyword: {
    id: number;
    keyword: string;
    keyword_norm: string;
    word_count: number;
    created_at: string;
    latest_score: number;
    latest_volume: number;
    latest_difficulty: string;
    latest_intent: string;
    latest_is_green_light: boolean;
    latest_is_painkiller: boolean;
    latest_breakout_score: number | null;
    latest_source: string;
    latest_observed_at: string;
    observation_count: number;
    first_observed_at: string;
    last_observed_at: string;
  };
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

export function KeywordInfoCard({ keyword }: KeywordInfoCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold mb-2">{keyword.keyword}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{keyword.word_count} 词</Badge>
              <Badge className={difficultyColors[keyword.latest_difficulty]}>
                难度: {keyword.latest_difficulty}
              </Badge>
              <Badge className={intentColors[keyword.latest_intent]}>
                {keyword.latest_intent}
              </Badge>
              {keyword.latest_is_green_light && (
                <Badge className="bg-green-500 text-white">🟢 绿灯词</Badge>
              )}
              {keyword.latest_is_painkiller && (
                <Badge className="bg-red-500 text-white">💊 止痛药</Badge>
              )}
              {keyword.latest_breakout_score && keyword.latest_breakout_score > 0 && (
                <Badge className="bg-orange-500 text-white">
                  🔥 Breakout: {keyword.latest_breakout_score}
                </Badge>
              )}
            </div>
          </div>
          <div className={`text-4xl font-bold ${getScoreColor(keyword.latest_score)}`}>
            {keyword.latest_score}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5 text-gray-500" />
            <div>
              <div className="text-sm text-gray-500">搜索量</div>
              <div className="font-semibold">{formatNumber(keyword.latest_volume)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircleIcon className="h-5 w-5 text-gray-500" />
            <div>
              <div className="text-sm text-gray-500">观察次数</div>
              <div className="font-semibold">{keyword.observation_count}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TargetIcon className="h-5 w-5 text-gray-500" />
            <div>
              <div className="text-sm text-gray-500">数据来源</div>
              <div className="font-semibold">{keyword.latest_source}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-gray-500" />
            <div>
              <div className="text-sm text-gray-500">最新观察</div>
              <div className="font-semibold text-sm">{formatDate(keyword.latest_observed_at)}</div>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">首次发现:</span>{' '}
              {formatDate(keyword.first_observed_at)}
            </div>
            <div>
              <span className="font-medium">最后更新:</span>{' '}
              {formatDate(keyword.last_observed_at)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
