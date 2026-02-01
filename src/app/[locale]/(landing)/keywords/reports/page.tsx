/**
 * 报告列表页面
 */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { FileTextIcon, CalendarIcon, ServerIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';

interface Report {
  id: number;
  run_id: number;
  title: string;
  status: string;
  keywords_analyzed: number;
  created_at: string;
  server_name: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/keywords/reports');
        
        if (!response.ok) {
          throw new Error('获取报告列表失败');
        }

        const data = await response.json();
        setReports(data.reports || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📄 分析报告</h1>
          <p className="text-muted-foreground mt-2">
            查看服务器上传的关键词分析报告
          </p>
        </div>
        <Link href="/keywords">
          <Button variant="outline">返回首页</Button>
        </Link>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总报告数</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">成功分析</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reports.filter(r => r.status === 'success').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">失败任务</CardTitle>
            <XCircleIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {reports.filter(r => r.status === 'failed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 报告列表 */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-48">
              <div className="text-center text-muted-foreground">
                <FileTextIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>暂无报告</p>
                <p className="text-sm mt-2">服务器上传报告后将在此显示</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <Badge variant={report.status === 'success' ? 'default' : 'destructive'}>
                        {report.status === 'success' ? '成功' : '失败'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ServerIcon className="h-4 w-4" />
                        <span>{report.server_name || '未知服务器'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileTextIcon className="h-4 w-4" />
                        <span>{report.keywords_analyzed || 0} 个关键词</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{new Date(report.created_at).toLocaleString('zh-CN')}</span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/keywords/reports/${report.id}`}>
                    <Button variant="outline" size="sm">
                      查看详情
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
