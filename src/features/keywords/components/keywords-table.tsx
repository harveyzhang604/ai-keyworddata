'use client';

import Link from 'next/link';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface Keyword {
  id: number;
  keyword: string;
  score: number;
  searchVolume: number;
  difficulty: string;
  intent: string;
  wordCount: number;
  painPointFlag: boolean;
  source: string;
  category: string;
  observedAt: string;
  isGreenLight: boolean;
}

interface KeywordsTableProps {
  keywords: Keyword[];
  sortBy: string;
  sortOrder: string;
  onSort: (field: string) => void;
}

const difficultyColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  medium:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
};

const intentColors = {
  informational:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  commercial:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  transactional:
    'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  navigational:
    'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
  unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
};

export function KeywordsTable({
  keywords,
  sortBy,
  sortOrder,
  onSort,
}: KeywordsTableProps) {
  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  if (keywords.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-muted-foreground">
          没有找到符合条件的关键词，请调整筛选条件
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">关键词</TableHead>
            <TableHead className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort('score')}
                className="h-8"
              >
                得分
                <SortIcon field="score" />
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort('search_volume')}
                className="h-8"
              >
                搜索量
                <SortIcon field="search_volume" />
              </Button>
            </TableHead>
            <TableHead className="text-center">难度</TableHead>
            <TableHead className="text-center">意图</TableHead>
            <TableHead className="text-center">词数</TableHead>
            <TableHead className="text-center">来源</TableHead>
            <TableHead className="text-center">标记</TableHead>
            <TableHead className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort('observed_at')}
                className="h-8"
              >
                观察时间
                <SortIcon field="observed_at" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keywords.map((kw) => (
            <TableRow key={kw.id}>
              <TableCell>
                <Link
                  href={`/keywords/${kw.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {kw.keyword}
                </Link>
                {kw.category && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {kw.category}
                  </div>
                )}
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
                {kw.searchVolume > 0 ? kw.searchVolume.toLocaleString() : '-'}
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
                <span className="text-sm text-muted-foreground">
                  {kw.wordCount}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <span className="text-sm capitalize text-muted-foreground">
                  {kw.source}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex flex-wrap justify-center gap-1">
                  {kw.isGreenLight && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    >
                      🟢
                    </Badge>
                  )}
                  {kw.painPointFlag && (
                    <Badge
                      variant="secondary"
                      className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    >
                      💊
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <span className="text-sm text-muted-foreground">
                  {new Date(kw.observedAt).toLocaleDateString('zh-CN')}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
