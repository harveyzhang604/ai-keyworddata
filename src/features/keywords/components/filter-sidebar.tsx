'use client';

import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Slider } from '@/shared/components/ui/slider';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Switch } from '@/shared/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Filter, X } from 'lucide-react';

export interface FilterState {
  minScore: number;
  maxScore: number;
  difficulty: string[];
  intent: string[];
  wordCount: string;
  dateRange: string;
  source: string[];
  server: string[];
  greenLight: boolean;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  servers: { id: number; name: string }[];
}

export function FilterSidebar({
  filters,
  onFilterChange,
  onReset,
  servers,
}: FilterSidebarProps) {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'difficulty' | 'intent' | 'source' | 'server', value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  return (
    <div className="space-y-6 rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h3 className="font-semibold">筛选条件</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="h-4 w-4" />
          清空
        </Button>
      </div>

      {/* 得分范围 */}
      <div className="space-y-3">
        <Label>得分范围</Label>
        <div className="space-y-2">
          <Slider
            min={0}
            max={100}
            step={5}
            value={[filters.minScore, filters.maxScore]}
            onValueChange={(values) => {
              updateFilter('minScore', values[0]);
              updateFilter('maxScore', values[1]);
            }}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{filters.minScore}</span>
            <span>{filters.maxScore}</span>
          </div>
        </div>
      </div>

      {/* 难度 */}
      <div className="space-y-3">
        <Label>难度</Label>
        <div className="space-y-2">
          {['low', 'medium', 'high'].map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox
                id={`difficulty-${level}`}
                checked={filters.difficulty.includes(level)}
                onCheckedChange={() => toggleArrayFilter('difficulty', level)}
              />
              <label
                htmlFor={`difficulty-${level}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {level === 'low' ? '低' : level === 'medium' ? '中' : '高'}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 意图 */}
      <div className="space-y-3">
        <Label>搜索意图</Label>
        <div className="space-y-2">
          {[
            { value: 'informational', label: '信息型' },
            { value: 'commercial', label: '商业型' },
            { value: 'transactional', label: '交易型' },
            { value: 'navigational', label: '导航型' },
          ].map((item) => (
            <div key={item.value} className="flex items-center space-x-2">
              <Checkbox
                id={`intent-${item.value}`}
                checked={filters.intent.includes(item.value)}
                onCheckedChange={() => toggleArrayFilter('intent', item.value)}
              />
              <label
                htmlFor={`intent-${item.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 词长 */}
      <div className="space-y-3">
        <Label>关键词长度</Label>
        <RadioGroup
          value={filters.wordCount}
          onValueChange={(value) => updateFilter('wordCount', value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="" id="wordCount-all" />
            <Label htmlFor="wordCount-all">全部</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="1-2" id="wordCount-1-2" />
            <Label htmlFor="wordCount-1-2">1-2 个词</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="3-4" id="wordCount-3-4" />
            <Label htmlFor="wordCount-3-4">3-4 个词</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="5+" id="wordCount-5+" />
            <Label htmlFor="wordCount-5+">5+ 个词</Label>
          </div>
        </RadioGroup>
      </div>

      {/* 时间范围 */}
      <div className="space-y-3">
        <Label>发现时间</Label>
        <Select
          value={filters.dateRange}
          onValueChange={(value) => updateFilter('dateRange', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部时间</SelectItem>
            <SelectItem value="7d">最近 7 天</SelectItem>
            <SelectItem value="30d">最近 30 天</SelectItem>
            <SelectItem value="90d">最近 90 天</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 数据来源 */}
      <div className="space-y-3">
        <Label>数据来源</Label>
        <div className="space-y-2">
          {['ahrefs', 'google', 'semrush'].map((src) => (
            <div key={src} className="flex items-center space-x-2">
              <Checkbox
                id={`source-${src}`}
                checked={filters.source.includes(src)}
                onCheckedChange={() => toggleArrayFilter('source', src)}
              />
              <label
                htmlFor={`source-${src}`}
                className="text-sm font-medium capitalize leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {src}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 服务器筛选 */}
      {servers.length > 0 && (
        <div className="space-y-3">
          <Label>服务器</Label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {servers.map((srv) => (
              <div key={srv.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`server-${srv.id}`}
                  checked={filters.server.includes(srv.name)}
                  onCheckedChange={() => toggleArrayFilter('server', srv.name)}
                />
                <label
                  htmlFor={`server-${srv.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {srv.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 绿灯词开关 */}
      <div className="flex items-center justify-between rounded-lg border p-3">
        <Label htmlFor="green-light" className="cursor-pointer">
          只显示绿灯词
        </Label>
        <Switch
          id="green-light"
          checked={filters.greenLight}
          onCheckedChange={(checked) => updateFilter('greenLight', checked)}
        />
      </div>
    </div>
  );
}
