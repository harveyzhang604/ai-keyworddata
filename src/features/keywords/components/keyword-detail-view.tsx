'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { KeywordInfoCard } from './keyword-info-card';
import { ScoreHistoryChart } from './score-history-chart';
import { AISuggestionsCard } from './ai-suggestions-card';
import { ObservationsTable } from './observations-table';

interface KeywordDetailViewProps {
  keywordId: string;
}

interface KeywordDetail {
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
  history: Array<{
    date: string;
    avg_score: number;
    avg_volume: number;
    difficulty: string;
    intent: string;
  }>;
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
  reports: Array<{
    id: number;
    run_id: number;
    keywords_analyzed: number;
    created_at: string;
    status: string;
    server_id: number;
    server_name: string;
  }>;
  notes: Array<{
    id: number;
    note: string;
    created_by: string;
    created_at: string;
  }>;
}

export function KeywordDetailView({ keywordId }: KeywordDetailViewProps) {
  const [data, setData] = useState<KeywordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/keywords/${keywordId}`);
        
        if (!response.ok) {
          throw new Error('获取关键词详情失败');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [keywordId]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">{error || '关键词不存在'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* 返回按钮 */}
      <div>
        <Link href="/keywords/list">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            返回列表
          </Button>
        </Link>
      </div>

      {/* 关键词基本信息 */}
      <KeywordInfoCard keyword={data.keyword} />

      {/* 得分历史趋势图 */}
      {data.history.length > 0 && (
        <ScoreHistoryChart data={data.history} />
      )}

      {/* AI 智能建议 */}
      <AISuggestionsCard keyword={data.keyword} />

      {/* 观察历史表格 */}
      <ObservationsTable observations={data.observations} />
    </div>
  );
}
