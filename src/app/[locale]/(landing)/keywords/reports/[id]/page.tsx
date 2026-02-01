/**
 * 报告详情页面
 */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ArrowLeftIcon, CalendarIcon, ServerIcon, FileTextIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ReportDetail {
  id: number;
  run_id: number;
  title: string;
  report_markdown: string;
  report_json: any;
  created_at: string;
  status: string;
  keywords_analyzed: number;
  server_name: string;
}

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = params?.id as string;
  
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'markdown' | 'json'>('markdown');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/keywords/reports/${reportId}`);
        
        if (!response.ok) {
          throw new Error('获取报告详情失败');
        }

        const data = await response.json();
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">{error || '报告不存在'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* 返回按钮 */}
      <div>
        <Link href="/keywords/reports">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            返回列表
          </Button>
        </Link>
      </div>

      {/* 报告头部 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl">{report.title}</CardTitle>
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
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'markdown' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('markdown')}
              >
                Markdown
              </Button>
              <Button
                variant={viewMode === 'json' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('json')}
              >
                JSON
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 报告内容 */}
      <Card>
        <CardHeader>
          <CardTitle>报告内容</CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === 'markdown' ? (
            <div className="prose max-w-none">
              {report.report_markdown ? (
                <ReactMarkdown>{report.report_markdown}</ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">无 Markdown 内容</p>
              )}
            </div>
          ) : (
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[600px]">
              <code>
                {report.report_json 
                  ? JSON.stringify(report.report_json, null, 2)
                  : '无 JSON 数据'}
              </code>
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
