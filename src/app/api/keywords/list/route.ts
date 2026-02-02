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
 * - server: 服务器名称（可多选，逗号分隔）
 * - greenLight: 是否只显示绿灯词（true/false）
 * - sortBy: 排序字段（score/search_volume/observed_at）
 * - sortOrder: 排序方向（asc/desc）
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

function getSqlClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL 环境变量未设置');
  }
  return neon(connectionString);
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
    const difficulty = searchParams.get('difficulty')?.split(',').filter(d => d) || [];
    const intent = searchParams.get('intent')?.split(',').filter(i => i) || [];
    const wordCount = searchParams.get('wordCount') || '';
    const dateRange = searchParams.get('dateRange') || 'all';
    const source = searchParams.get('source')?.split(',').filter(s => s) || [];
    const server = searchParams.get('server')?.split(',').filter(s => s) || [];
    const greenLight = searchParams.get('greenLight') === 'true';
    const sortBy = searchParams.get('sortBy') || 'score';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const sql = getSqlClient();

    // 构建静态条件部分（不使用参数占位符）
    let whereConditions = '1=1';
    
    // 搜索关键词（使用安全的LIKE）
    if (search) {
      const safeSearch = search.replace(/[%_\\]/g, '\\$&');
      whereConditions += ` AND k.keyword ILIKE '%${safeSearch}%'`;
    }

    // 得分范围
    if (minScore !== null) {
      whereConditions += ` AND ko.score >= ${minScore}`;
    }
    if (maxScore !== null) {
      whereConditions += ` AND ko.score <= ${maxScore}`;
    }

    // 难度筛选
    if (difficulty.length > 0) {
      const diffStr = difficulty.map(d => `'${d}'`).join(',');
      whereConditions += ` AND ko.difficulty IN (${diffStr})`;
    }

    // 意图筛选
    if (intent.length > 0) {
      const intentStr = intent.map(i => `'${i}'`).join(',');
      whereConditions += ` AND ko.intent IN (${intentStr})`;
    }

    // 词长筛选
    if (wordCount === '1-2') {
      whereConditions += ' AND ko.word_count BETWEEN 1 AND 2';
    } else if (wordCount === '3-4') {
      whereConditions += ' AND ko.word_count BETWEEN 3 AND 4';
    } else if (wordCount === '5+') {
      whereConditions += ' AND ko.word_count >= 5';
    }

    // 时间范围筛选
    if (dateRange !== 'all') {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      whereConditions += ` AND ko.created_at >= NOW() - INTERVAL '${days} days'`;
    }

    // 数据来源筛选
    if (source.length > 0) {
      const sourceStr = source.map(s => `'${s}'`).join(',');
      whereConditions += ` AND ko.source IN (${sourceStr})`;
    }

    // 绿灯词筛选
    if (greenLight) {
      whereConditions += " AND ko.score >= 80 AND ko.difficulty = 'low'";
    }

    // 排序字段映射
    const sortFieldMap: { [key: string]: string } = {
      score: 'ko.score',
      search_volume: 'ko.search_volume',
      observed_at: 'ko.created_at',
    };
    const sortField = sortFieldMap[sortBy] || 'ko.score';
    const sortDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // 查询总数 - 使用模板字符串进行安全查询
    const countResult = await sql`
      WITH latest_observations AS (
        SELECT DISTINCT ON (keyword_id)
          keyword_id,
          score,
          search_volume,
          difficulty,
          intent,
          word_count,
          pain_point_flag,
          source,
          created_at
        FROM keyword_observations
        ORDER BY keyword_id, created_at DESC
      )
      SELECT COUNT(*) as total
      FROM keywords k
      LEFT JOIN latest_observations ko ON k.id = ko.keyword_id
    `;

    // 因为 neon 模板字符串不支持动态 WHERE 条件，我们使用简化查询
    // 获取所有数据然后在代码中过滤
    const total = parseInt(countResult[0]?.total || '0');

    // 查询数据（包含服务器名称）
    const allDataResult = await sql`
      WITH latest_observations AS (
        SELECT DISTINCT ON (keyword_id)
          ko.keyword_id,
          ko.score,
          ko.search_volume,
          ko.difficulty,
          ko.intent,
          ko.word_count,
          ko.pain_point_flag,
          ko.source,
          ko.run_id,
          ko.created_at
        FROM keyword_observations ko
        ORDER BY keyword_id, created_at DESC
      )
      SELECT 
        k.id,
        k.keyword,
        k.language,
        k.country,
        k.category,
        lo.score,
        lo.search_volume,
        lo.difficulty,
        lo.intent,
        lo.word_count,
        lo.pain_point_flag,
        lo.source,
        lo.created_at as observed_at,
        ms.name as server_name
      FROM keywords k
      LEFT JOIN latest_observations lo ON k.id = lo.keyword_id
      LEFT JOIN mining_runs mr ON lo.run_id = mr.id
      LEFT JOIN mining_servers ms ON mr.miner_id = ms.id
      ORDER BY lo.score DESC NULLS LAST, k.id DESC
    `;

    // 在代码中进行过滤
    let filteredData = allDataResult.filter((row: any) => {
      // 搜索过滤
      if (search && !row.keyword?.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      // 得分过滤
      if (minScore !== null && (row.score === null || parseFloat(row.score) < minScore)) {
        return false;
      }
      if (maxScore !== null && (row.score === null || parseFloat(row.score) > maxScore)) {
        return false;
      }
      // 难度过滤
      if (difficulty.length > 0 && !difficulty.includes(row.difficulty)) {
        return false;
      }
      // 意图过滤
      if (intent.length > 0 && !intent.includes(row.intent)) {
        return false;
      }
      // 词长过滤
      const wc = parseInt(row.word_count) || 0;
      if (wordCount === '1-2' && (wc < 1 || wc > 2)) return false;
      if (wordCount === '3-4' && (wc < 3 || wc > 4)) return false;
      if (wordCount === '5+' && wc < 5) return false;
      // 数据来源过滤
      if (source.length > 0 && !source.includes(row.source)) {
        return false;
      }
      // 服务器过滤
      if (server.length > 0 && !server.includes(row.server_name)) {
        return false;
      }
      // 绿灯词过滤
      if (greenLight && !(parseFloat(row.score) >= 80 && row.difficulty === 'low')) {
        return false;
      }
      return true;
    });

    // 排序
    filteredData.sort((a: any, b: any) => {
      let aVal = a[sortBy === 'observed_at' ? 'observed_at' : sortBy] || 0;
      let bVal = b[sortBy === 'observed_at' ? 'observed_at' : sortBy] || 0;
      
      if (sortBy === 'score' || sortBy === 'search_volume') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }
      
      if (sortDir === 'ASC') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    const filteredTotal = filteredData.length;

    // 分页
    const pagedData = filteredData.slice(offset, offset + limit);

    // 格式化数据
    const keywords = pagedData.map((row: any) => ({
      id: row.id,
      keyword: row.keyword,
      score: parseFloat(row.score) || 0,
      searchVolume: parseInt(row.search_volume) || 0,
      difficulty: row.difficulty || 'unknown',
      intent: row.intent || 'unknown',
      wordCount: parseInt(row.word_count) || 0,
      painPointFlag: row.pain_point_flag || false,
      source: row.source || 'unknown',
      serverName: row.server_name || '未知',
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
          total: filteredTotal,
          totalPages: Math.ceil(filteredTotal / limit),
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
