'use client';

import { useEffect, useState, useCallback } from 'react';
import { FilterSidebar, FilterState } from './filter-sidebar';
import { SearchBar } from './search-bar';
import { KeywordsTable } from './keywords-table';
import { Pagination } from './pagination';
import { Loader2 } from 'lucide-react';

const DEFAULT_FILTERS: FilterState = {
  minScore: 0,
  maxScore: 100,
  difficulty: [],
  intent: [],
  wordCount: '',
  dateRange: 'all',
  source: [],
  greenLight: false,
};

export function KeywordsListView() {
  const [keywords, setKeywords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 筛选和分页状态
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  // 构建查询参数
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', pageSize.toString());
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);

    if (search) params.set('search', search);
    if (filters.minScore > 0) params.set('minScore', filters.minScore.toString());
    if (filters.maxScore < 100) params.set('maxScore', filters.maxScore.toString());
    if (filters.difficulty.length > 0)
      params.set('difficulty', filters.difficulty.join(','));
    if (filters.intent.length > 0) params.set('intent', filters.intent.join(','));
    if (filters.wordCount) params.set('wordCount', filters.wordCount);
    if (filters.dateRange !== 'all') params.set('dateRange', filters.dateRange);
    if (filters.source.length > 0) params.set('source', filters.source.join(','));
    if (filters.greenLight) params.set('greenLight', 'true');

    return params.toString();
  }, [page, pageSize, sortBy, sortOrder, search, filters]);

  // 获取数据
  const fetchKeywords = useCallback(async () => {
    try {
      setLoading(true);
      const queryString = buildQueryParams();
      const response = await fetch(`/api/keywords/list?${queryString}`);

      if (!response.ok) {
        throw new Error('Failed to fetch keywords');
      }

      const result = await response.json();

      if (result.success) {
        setKeywords(result.data.keywords);
        setPagination(result.data.pagination);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err: any) {
      console.error('获取关键词列表失败:', err);
      setError(err.message || 'Failed to load keywords');
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  // 监听参数变化，重新获取数据
  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  // 处理排序
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1); // 重置到第一页
  };

  // 处理筛选变化
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1); // 重置到第一页
  };

  // 重置筛选
  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearch('');
    setPage(1);
  };

  // 处理搜索变化
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // 重置到第一页
  };

  return (
    <div className="container mx-auto space-y-6 py-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold">关键词列表</h1>
        <p className="mt-2 text-muted-foreground">
          浏览和筛选所有发现的关键词
        </p>
      </div>

      {/* 搜索栏 */}
      <SearchBar value={search} onChange={handleSearchChange} />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* 筛选侧边栏 */}
        <aside>
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </aside>

        {/* 主内容区 */}
        <main className="space-y-4">
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-lg border bg-card">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-sm text-muted-foreground">
                  加载关键词数据...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400">
                加载失败: {error}
              </p>
            </div>
          ) : (
            <>
              {/* 关键词表格 */}
              <KeywordsTable
                keywords={keywords}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />

              {/* 分页 */}
              {pagination.total > 0 && (
                <Pagination
                  currentPage={page}
                  totalPages={pagination.totalPages}
                  pageSize={pageSize}
                  totalItems={pagination.total}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
