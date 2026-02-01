'use client';

import Link from 'next/link';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

interface TopKeyword {
  id: number;
  keyword: string;
  score: number;
  searchVolume: number;
  difficulty: string;
  intent: string;
  painPointFlag: boolean;
}

interface TopKeywordsTableProps {
  keywords: TopKeyword[];
}

const difficultyColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
};

const intentColors = {
  informational: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  commercial: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  transactional: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  navigational: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
  unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
};

export function TopKeywordsTable({ keywords }: TopKeywordsTableProps) {
  if (keywords.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">暂无关键词数据</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-6">
        <h2 className="text-lg font-semibold">TOP 10 关键词</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          按得分排序的最佳机会关键词
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">排名</TableHead>
            <TableHead>关键词</TableHead>
            <TableHead className="text-center">得分</TableHead>
            <TableHead className="text-center">搜索量</TableHead>
            <TableHead className="text-center">难度</TableHead>
            <TableHead className="text-center">意图</TableHead>
            <TableHead className="text-center">标记</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keywords.map((kw, index) => (
            <TableRow key={kw.id}>
              <TableCell className="font-medium">#{index + 1}</TableCell>
              <TableCell>
                <Link
                  href={`/keywords/${kw.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {kw.keyword}
                </Link>
              </TableCell>
              <TableCell className="text-center">
                <span
                  className={`font-semibold ${
                    kw.score >= 80
                      ? 'text-green-600 dark:text-green-400'
                      : kw.score >= 60
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {kw.score.toFixed(1)}
                </span>
              </TableCell>
              <TableCell className="text-center">
                {kw.searchVolume > 0
                  ? kw.searchVolume.toLocaleString()
                  : '-'}
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant="secondary"
                  className={
                    difficultyColors[
                      kw.difficulty.toLowerCase() as keyof typeof difficultyColors
                    ] || difficultyColors.unknown
                  }
                >
                  {kw.difficulty}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant="secondary"
                  className={
                    intentColors[
                      kw.intent.toLowerCase() as keyof typeof intentColors
                    ] || intentColors.unknown
                  }
                >
                  {kw.intent}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                {kw.painPointFlag && (
                  <Badge
                    variant="secondary"
                    className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  >
                    止痛药
                  </Badge>
                )}
                {kw.score >= 80 && kw.difficulty === 'low' && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  >
                    🟢 绿灯
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
