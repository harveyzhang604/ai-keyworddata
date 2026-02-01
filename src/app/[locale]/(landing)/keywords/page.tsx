/**
 * 关键词挖掘系统 - 首页
 * 作为系统入口，展示核心统计和快速导航
 */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  BarChart3Icon, 
  ListIcon, 
  TrendingUpIcon,
  DatabaseIcon,
  ServerIcon,
  FileTextIcon,
  ArrowUpIcon,
  PlayCircleIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';

interface Stats {
  totalKeywords: number;
  activeServers: number;
  totalReports: number;
  recentKeywords: number;
  runningTasks: number;
}

export default function KeywordsHomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/keywords/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* 头部 */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">🎯 AI 关键词挖掘分析系统</h1>
        <p className="text-xl text-muted-foreground">
          统一管理多服务器关键词数据，快速发现高价值机会
        </p>
      </div>

      {/* 快速统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总关键词数</CardTitle>
            <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '加载中...' : stats?.totalKeywords.toLocaleString() || '0'}
            </div>
            {!loading && stats && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <ArrowUpIcon className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+{stats.recentKeywords}</span> 最近7天
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃服务器</CardTitle>
            <ServerIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '-' : stats?.activeServers || '0'}
            </div>
            {!loading && stats && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <PlayCircleIcon className="h-3 w-3 text-blue-500" />
                <span className="text-blue-500">{stats.runningTasks}</span> 进行中
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">分析报告</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '-' : stats?.totalReports || '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              已生成的报告数
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 主要功能导航 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
          <Link href="/keywords/dashboard">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BarChart3Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">数据看板</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    查看统计数据和 TOP 10 机会
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                • 核心统计卡片<br />
                • TOP 10 关键词表格<br />
                • 趋势图表和意图分布<br />
                • 实时数据更新
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
          <Link href="/keywords/list">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ListIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">关键词列表</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    浏览和筛选所有关键词
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                • 多维度筛选（得分/难度/意图）<br />
                • 实时搜索<br />
                • 排序和分页<br />
                • 导出功能
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
          <Link href="/keywords/reports">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FileTextIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">分析报告</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    查看服务器上传的分析报告
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                • 报告列表和预览<br />
                • Markdown 渲染<br />
                • JSON 数据查看<br />
                • 报告下载
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
          <Link href="/keywords/trends">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUpIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">趋势分析</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    查看关键词趋势和变化
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                • 搜索量趋势<br />
                • 得分历史变化<br />
                • 新发现关键词<br />
                • 周期性分析
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* API 文档链接 */}
      <Card>
        <CardHeader>
          <CardTitle>🔌 服务器数据接入</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            服务器端使用以下 API 上传挖掘数据：
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <code className="text-sm font-mono">POST /api/ingest/runs</code>
              <p className="text-xs text-muted-foreground mt-2">创建挖掘任务</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <code className="text-sm font-mono">POST /api/ingest/keywords/batch</code>
              <p className="text-xs text-muted-foreground mt-2">批量上传关键词</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <code className="text-sm font-mono">POST /api/ingest/reports</code>
              <p className="text-xs text-muted-foreground mt-2">上传分析报告</p>
            </div>
          </div>
          <div className="pt-4 flex gap-4">
            <Link href="/keywords/api-keys">
              <Button variant="default">
                管理 API Keys
              </Button>
            </Link>
            <Link href="/keywords/api-docs">
              <Button variant="outline">
                查看完整 API 文档
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
