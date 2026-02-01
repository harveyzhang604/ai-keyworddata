'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { 
  LightbulbIcon, 
  TrendingUpIcon, 
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from 'lucide-react';

interface AISuggestionsCardProps {
  keyword: {
    latest_score: number;
    latest_volume: number;
    latest_difficulty: string;
    latest_intent: string;
    latest_is_green_light: boolean;
    latest_is_painkiller: boolean;
    latest_breakout_score: number | null;
    word_count: number;
  };
}

export function AISuggestionsCard({ keyword }: AISuggestionsCardProps) {
  // 生成 AI 建议
  const generateSuggestions = () => {
    const suggestions: Array<{
      type: 'success' | 'warning' | 'info' | 'danger';
      icon: React.ReactNode;
      title: string;
      content: string;
    }> = [];

    // 绿灯词建议
    if (keyword.latest_is_green_light) {
      suggestions.push({
        type: 'success',
        icon: <CheckCircleIcon className="h-5 w-5" />,
        title: '🟢 高优先级机会',
        content: '这是一个绿灯词！得分高且难度低，建议立即创建内容。竞争少，成功率高。',
      });
    }

    // 止痛药建议
    if (keyword.latest_is_painkiller) {
      suggestions.push({
        type: 'success',
        icon: <TrendingUpIcon className="h-5 w-5" />,
        title: '💊 强需求信号',
        content: '检测到止痛药关键词（包含 Error/Broken/Fix 等痛点词汇），用户需求强烈，转化率高。',
      });
    }

    // Breakout 建议
    if (keyword.latest_breakout_score && keyword.latest_breakout_score > 50) {
      suggestions.push({
        type: 'warning',
        icon: <AlertTriangleIcon className="h-5 w-5" />,
        title: '🔥 趋势飙升',
        content: `Breakout 得分 ${keyword.latest_breakout_score}，搜索量正在快速上涨。建议尽早布局，抢占流量红利。`,
      });
    }

    // 难度建议
    if (keyword.latest_difficulty === 'high') {
      suggestions.push({
        type: 'danger',
        icon: <XCircleIcon className="h-5 w-5" />,
        title: '⚠️ 竞争激烈',
        content: '难度较高，需要强大的域名权重和高质量内容。建议先从长尾词或低难度词切入。',
      });
    } else if (keyword.latest_difficulty === 'low' && keyword.latest_score >= 60) {
      suggestions.push({
        type: 'success',
        icon: <CheckCircleIcon className="h-5 w-5" />,
        title: '✨ 低难度高价值',
        content: '难度低且得分高，这是理想的目标关键词。容易排名，投入产出比高。',
      });
    }

    // 意图建议
    if (keyword.latest_intent === 'transactional') {
      suggestions.push({
        type: 'info',
        icon: <LightbulbIcon className="h-5 w-5" />,
        title: '💰 交易意图强',
        content: '用户有明确购买意图，适合产品页/Landing Page。优化转化路径，可直接带来收入。',
      });
    } else if (keyword.latest_intent === 'commercial') {
      suggestions.push({
        type: 'info',
        icon: <LightbulbIcon className="h-5 w-5" />,
        title: '🛍️ 商业调研',
        content: '用户处于调研阶段，适合对比文章、评测内容。引导至产品页可提高转化。',
      });
    }

    // 词长建议
    if (keyword.word_count >= 5) {
      suggestions.push({
        type: 'info',
        icon: <LightbulbIcon className="h-5 w-5" />,
        title: '📝 长尾关键词',
        content: '长尾词（5+ 词），意图更明确，竞争更低。虽然搜索量小，但转化率通常更高。',
      });
    }

    // 搜索量建议
    if (keyword.latest_volume >= 10000) {
      suggestions.push({
        type: 'warning',
        icon: <AlertTriangleIcon className="h-5 w-5" />,
        title: '📈 高搜索量',
        content: `月搜索量 ${(keyword.latest_volume / 1000).toFixed(1)}K+，流量潜力巨大。但需注意竞争可能也较激烈。`,
      });
    } else if (keyword.latest_volume < 100) {
      suggestions.push({
        type: 'info',
        icon: <LightbulbIcon className="h-5 w-5" />,
        title: '🎯 利基市场',
        content: '搜索量较小但可能是利基机会。适合早期布局，随着市场增长可能带来惊喜。',
      });
    }

    // 得分建议
    if (keyword.latest_score >= 80) {
      suggestions.push({
        type: 'success',
        icon: <CheckCircleIcon className="h-5 w-5" />,
        title: '⭐ 顶级机会',
        content: `综合得分 ${keyword.latest_score}，这是非常优质的目标。建议分配足够资源，优先执行。`,
      });
    } else if (keyword.latest_score < 40) {
      suggestions.push({
        type: 'warning',
        icon: <AlertTriangleIcon className="h-5 w-5" />,
        title: '🤔 谨慎评估',
        content: '综合得分较低，可能价值有限或竞争过高。建议重新评估或寻找更好的机会。',
      });
    }

    return suggestions;
  };

  const suggestions = generateSuggestions();

  const typeStyles = {
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
    danger: 'bg-red-50 border-red-200',
  };

  const iconStyles = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
    danger: 'text-red-600',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LightbulbIcon className="h-5 w-5 text-yellow-500" />
          AI 智能建议
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${typeStyles[suggestion.type]}`}
            >
              <div className="flex items-start gap-3">
                <div className={iconStyles[suggestion.type]}>{suggestion.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold mb-1">{suggestion.title}</div>
                  <div className="text-sm text-gray-700">{suggestion.content}</div>
                </div>
              </div>
            </div>
          ))}
          {suggestions.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              暂无特别建议，继续观察数据变化
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
