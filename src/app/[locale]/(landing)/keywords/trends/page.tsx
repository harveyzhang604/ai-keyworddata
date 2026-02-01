/**
 * 趋势分析页面
 */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { 
  TrendingUpIcon, 
  ArrowLeftIcon, 
  TrendingDownIcon,
  BarChart3Icon,
  ActivityIcon,
  SparklesIcon,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TrendsData {
  dateRange: {
    start: string;
    end: string;
    days: number;
  };
  summary: {
    total_keywords: number;
    new_keywords: number;
    total_runs: number;
    avg_score: number;
    avg_volume: number;
  };
  volumeTrend: Array<{
    date: string;
    avg_volume: number;
    keyword_count: number;
  }>;
  scoreTrend: Array<{
    date: string;
    avg_score: number;
    max_score: number;
    min_score: number;
  }>;
  newKeywordsTrend: Array<{
    date: string;
    new_keywords: number;
    high_score_keywords: number;
  }>;
  topGrowingKeywords: Array<{
    id: number;
    keyword: string;
    first_volume: number;
    latest_volume: number;
    growth_rate: number;
    observation_count: number;
  }>;
  recentActiveKeywords: Array<{
    id: number;
    keyword: string;
    observation_count: number;
    avg_score: number;
    max_volume: number;
  }>;
}

export default function TrendsPage() {
  const [data, setData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchTrends();
  }, [days]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/keywords/trends?days=${days}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      console.error('获取趋势数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">加载中...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">暂无数据</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/keywords">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mt-4">📈 趋势分析</h1>
          <p className="text-muted-foreground mt-2">
            查看关键词搜索量、得分趋势和新发现
          </p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30, 60, 90].map((d) => (
            <Button
              key={d}
              variant={days === d ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDays(d)}
            >
              {d}天
            </Button>
          ))}
        </div>
      </div>

      {/* 统计摘要 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总关键词数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.total_keywords || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              新增关键词
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{data.summary.new_keywords || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均得分
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.avg_score?.toFixed(1) || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均搜索量
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(data.summary.avg_volume || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              挖掘任务数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.total_runs || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索量趋势 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3Icon className="h-5 w-5" />
            搜索量趋势
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.volumeTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="avg_volume"
                name="平均搜索量"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="keyword_count"
                name="关键词数量"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 得分趋势 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5" />
            得分趋势
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.scoreTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="avg_score"
                name="平均得分"
                stroke="#8884d8"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="max_score"
                name="最高得分"
                stroke="#82ca9d"
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="min_score"
                name="最低得分"
                stroke="#ffc658"
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 新发现关键词趋势 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5" />
            新发现关键词趋势
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.newKeywordsTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="new_keywords" name="新关键词" fill="#8884d8" />
              <Bar
                dataKey="high_score_keywords"
                name="高分关键词"
                fill="#82ca9d"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* TOP 增长关键词 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5 text-green-600" />
            TOP 增长关键词
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topGrowingKeywords.slice(0, 10).map((kw, index) => (
              <div
                key={kw.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold text-muted-foreground w-8">
                    #{index + 1}
                  </div>
                  <div>
                    <Link href={`/keywords/${kw.id}`}>
                      <div className="font-medium hover:text-primary">
                        {kw.keyword}
                      </div>
                    </Link>
                    <div className="text-sm text-muted-foreground">
                      {kw.first_volume} → {kw.latest_volume} 搜索量
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      kw.growth_rate > 100 ? 'default' : 'secondary'
                    }
                  >
                    <TrendingUpIcon className="h-3 w-3 mr-1" />
                    +{kw.growth_rate}%
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {kw.observation_count} 次观察
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 近期活跃关键词 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5 text-blue-600" />
            近期活跃关键词
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentActiveKeywords.slice(0, 10).map((kw) => (
              <div
                key={kw.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div>
                  <Link href={`/keywords/${kw.id}`}>
                    <div className="font-medium hover:text-primary">
                      {kw.keyword}
                    </div>
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    平均得分: {kw.avg_score?.toFixed(1)} | 最大搜索量:{' '}
                    {kw.max_volume}
                  </div>
                </div>
                <Badge variant="outline">
                  {kw.observation_count} 次观察
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
