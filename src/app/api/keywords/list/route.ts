/**
 * GET /api/keywords/list
 * 获取关键词列表（支持筛选、搜索、分页、排序）
 * 
 * Query 参数:
 * - page: 页码（默认 1）
 * - limit: 每页数量（默认 50）
 * - search: 搜索关键词
 * - minScore: 最低得分
 * - maxScore: 最高得分
 * - difficulty: 难度（可多选，逗号分隔）
 * - intent: 意图（可多选，逗号分隔）
 * - wordCount: 词长（1-2/3-4/5+）
 * - dateRange: 时间范围（7d/30d/90d/all）
 * - source: 数据来源（可多选）
 * - greenLight: 是否只显示绿灯词（true/false）
 * - sortBy: 排序字段（score/search_volume/observed_at）
 * - sortOrder: 排序方向（asc/desc）
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';

function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL 环境变量未设置');
  }
  const client = neon(connectionString);
  return drizzle(client);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 解析参数
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = (page - 1) * limit;

    const search = searchParams.get('search') || '';
    const minScore = searchParams.get('minScore')
      ? parseFloat(searchParams.get('minScore')!)
      : null;
    const maxScore = searchParams.get('maxScore')
      ? parseFloat(searchParams.get('maxScore')!)
      : null;
    const difficulty = searchParams.get('difficulty')?.split(',') || [];
    const intent = searchParams.get('intent')?.split(',') || [];
    const wordCount = searchParams.get('wordCount') || '';
    const dateRange = searchParams.get('dateRange') || 'all';
    const source = searchParams.get('source')?.split(',') || [];
    const greenLight = searchParams.get('greenLight') === 'true';
    const sortBy = searchParams.get('sortBy') || 'score';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const db = getDb();

    const sqlClient = neon(process.env.DATABASE_URL!);

    // 构建查询条件
    const conditions: string[] = ['1=1'];
    const params: any[] = [];

    // 搜索关键词
    if (search) {
      conditions.push(`kl.keyword ILIKE $${params.length + 1}`);
      params.push(`%${search}%`);
    }

    // 得分范围
    if (minScore !== null) {
      conditions.push(`kl.score >= $${params.length + 1}`);
      params.push(minScore);
    }
    if (maxScore !== null) {
      conditions.push(`kl.score <= $${params.length + 1}`);
      params.push(maxScore);
    }

    // 难度筛选
    if (difficulty.length > 0) {
      conditions.push(`kl.difficulty = ANY($${params.length + 1}::text[])`);
      params.push(difficulty);
    }

    // 意图筛选
    if (intent.length > 0) {
      conditions.push(`kl.intent = ANY($${params.length + 1}::text[])`);
      params.push(intent);
    }

    // 词长筛选
    if (wordCount === '1-2') {
      conditions.push('kl.word_count BETWEEN 1 AND 2');
    } else if (wordCount === '3-4') {
      conditions.push('kl.word_count BETWEEN 3 AND 4');
    } else if (wordCount === '5+') {
      conditions.push('kl.word_count >= 5');
    }

    // 时间范围筛选
    if (dateRange !== 'all') {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      conditions.push(`kl.observed_at >= NOW() - INTERVAL '${days} days'`);
    }

    // 数据来源筛选
    if (source.length > 0) {
      conditions.push(`kl.source = ANY($${params.length + 1}::text[])`);
      params.push(source);
    }

    // 绿灯词筛选
    if (greenLight) {
      conditions.push("kl.score >= 80 AND kl.difficulty = 'low'");
    }

    // 排序字段映射
    const sortFieldMap: { [key: string]: string } = {
      score: 'kl.score',
      search_volume: 'kl.search_volume',
      observed_at: 'kl.observed_at',
    };
    const sortField = sortFieldMap[sortBy] || 'kl.score';
    const sortDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM keyword_latest kl
      WHERE ${conditions.join(' AND ')}
    `;

    const countResult = await (sqlClient as any)(countQuery, params);
    const countRows = Array.isArray(countResult)
      ? countResult
      : (countResult as any).rows || [];
    const total = parseInt(countRows[0]?.total || '0');

    // 查询数据
    const dataQuery = `
      SELECT 
        kl.id,
        kl.keyword,
        kl.score,
        kl.search_volume,
        kl.difficulty,
        kl.intent,
        kl.word_count,
        kl.pain_point_flag,
        kl.source,
        kl.language,
        kl.country,
        kl.category,
        kl.observed_at
      FROM keyword_latest kl
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${sortField} ${sortDir} NULLS LAST, kl.id DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const dataResult = await (sqlClient as any)(dataQuery, params);
    const dataRows = Array.isArray(dataResult)
      ? dataResult
      : (dataResult as any).rows || [];


    // 格式化数据
    const keywords = dataRows.map((row: any) => ({
      id: row.id,
      keyword: row.keyword,
      score: parseFloat(row.score) || 0,
      searchVolume: parseInt(row.search_volume) || 0,
      difficulty: row.difficulty || 'unknown',
      intent: row.intent || 'unknown',
      wordCount: parseInt(row.word_count) || 0,
      painPointFlag: row.pain_point_flag || false,
      source: row.source || 'unknown',
      language: row.language || 'en',
      country: row.country || 'US',
      category: row.category || 'general',
      observedAt: row.observed_at,
      isGreenLight:
        parseFloat(row.score) >= 80 && row.difficulty === 'low',
    }));

    // 返回结果
    return NextResponse.json({
      success: true,
      data: {
        keywords,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('获取关键词列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
