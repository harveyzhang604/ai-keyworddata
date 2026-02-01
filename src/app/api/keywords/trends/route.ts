/**
 * GET /api/keywords/trends
 * 获取趋势分析数据
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/core/db';
import { 
  keywords, 
  keywordObservations, 
  miningRuns 
} from '@/config/db/schema';
import { desc, sql, eq, gte, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // 计算日期范围
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1. 搜索量趋势（按天聚合）
    const volumeTrend = await db().execute(sql`
      SELECT 
        DATE(ko.created_at) as date,
        AVG(ko.search_volume) as avg_volume,
        COUNT(DISTINCT ko.keyword_id) as keyword_count
      FROM keyword_observations ko
      WHERE ko.created_at >= ${startDate.toISOString()}
      AND ko.search_volume IS NOT NULL
      GROUP BY DATE(ko.created_at)
      ORDER BY date ASC
    `);

    // 2. 得分趋势（按天聚合）
    const scoreTrend = await db().execute(sql`
      SELECT 
        DATE(ko.created_at) as date,
        AVG(CAST(ko.score AS FLOAT)) as avg_score,
        MAX(CAST(ko.score AS FLOAT)) as max_score,
        MIN(CAST(ko.score AS FLOAT)) as min_score,
        COUNT(*) as observation_count
      FROM keyword_observations ko
      WHERE ko.created_at >= ${startDate.toISOString()}
      AND ko.score IS NOT NULL
      GROUP BY DATE(ko.created_at)
      ORDER BY date ASC
    `);

    // 3. 新发现关键词趋势
    const newKeywordsTrend = await db().execute(sql`
      SELECT 
        DATE(k.first_seen_at) as date,
        COUNT(*) as new_keywords,
        COUNT(CASE WHEN ko.score::FLOAT >= 80 THEN 1 END) as high_score_keywords
      FROM keywords k
      LEFT JOIN keyword_observations ko ON k.id = ko.keyword_id
      WHERE k.first_seen_at >= ${startDate.toISOString()}
      GROUP BY DATE(k.first_seen_at)
      ORDER BY date ASC
    `);

    // 4. 难度分布趋势
    const difficultyTrend = await db().execute(sql`
      SELECT 
        DATE(ko.created_at) as date,
        ko.difficulty,
        COUNT(*) as count
      FROM keyword_observations ko
      WHERE ko.created_at >= ${startDate.toISOString()}
      AND ko.difficulty IS NOT NULL
      GROUP BY DATE(ko.created_at), ko.difficulty
      ORDER BY date ASC
    `);

    // 5. 意图分布趋势
    const intentTrend = await db().execute(sql`
      SELECT 
        DATE(ko.created_at) as date,
        ko.intent,
        COUNT(*) as count
      FROM keyword_observations ko
      WHERE ko.created_at >= ${startDate.toISOString()}
      AND ko.intent IS NOT NULL
      GROUP BY DATE(ko.created_at), ko.intent
      ORDER BY date ASC
    `);

    // 6. TOP 增长关键词
    const topGrowingKeywords = await db().execute(sql`
      WITH keyword_stats AS (
        SELECT 
          k.id,
          k.keyword,
          k.keyword_norm,
          MIN(ko.search_volume) as first_volume,
          MAX(ko.search_volume) as latest_volume,
          MIN(ko.created_at) as first_seen,
          MAX(ko.created_at) as last_seen,
          COUNT(*) as observation_count
        FROM keywords k
        INNER JOIN keyword_observations ko ON k.id = ko.keyword_id
        WHERE ko.created_at >= ${startDate.toISOString()}
        AND ko.search_volume IS NOT NULL
        GROUP BY k.id, k.keyword, k.keyword_norm
        HAVING COUNT(*) >= 2
      )
      SELECT 
        *,
        CASE 
          WHEN first_volume > 0 THEN 
            ROUND(((latest_volume - first_volume)::FLOAT / first_volume * 100)::NUMERIC, 2)
          ELSE 0
        END as growth_rate
      FROM keyword_stats
      WHERE first_volume > 0
      ORDER BY growth_rate DESC
      LIMIT 20
    `);

    // 7. 近期活跃关键词
    const recentActiveKeywords = await db().execute(sql`
      SELECT 
        k.id,
        k.keyword,
        k.keyword_norm,
        COUNT(ko.id) as observation_count,
        MAX(ko.created_at) as last_observed,
        AVG(CAST(ko.score AS FLOAT)) as avg_score,
        MAX(ko.search_volume) as max_volume
      FROM keywords k
      INNER JOIN keyword_observations ko ON k.id = ko.keyword_id
      WHERE ko.created_at >= ${startDate.toISOString()}
      GROUP BY k.id, k.keyword, k.keyword_norm
      HAVING COUNT(ko.id) >= 2
      ORDER BY observation_count DESC, last_observed DESC
      LIMIT 20
    `);

    // 8. 统计摘要
    const summary = await db().execute(sql`
      SELECT 
        COUNT(DISTINCT k.id) as total_keywords,
        COUNT(DISTINCT CASE WHEN k.first_seen_at >= ${startDate.toISOString()} THEN k.id END) as new_keywords,
        COUNT(DISTINCT ko.run_id) as total_runs,
        AVG(CAST(ko.score AS FLOAT)) as avg_score,
        AVG(ko.search_volume) as avg_volume
      FROM keywords k
      LEFT JOIN keyword_observations ko ON k.id = ko.keyword_id
      WHERE ko.created_at >= ${startDate.toISOString()}
    `);

    return NextResponse.json({
      success: true,
      data: {
        dateRange: {
          start: startDate.toISOString(),
          end: new Date().toISOString(),
          days,
        },
        summary: (summary as any).rows?.[0] || (summary as any)[0] || {},
        volumeTrend: (volumeTrend as any).rows || volumeTrend || [],
        scoreTrend: (scoreTrend as any).rows || scoreTrend || [],
        newKeywordsTrend: (newKeywordsTrend as any).rows || newKeywordsTrend || [],
        difficultyTrend: (difficultyTrend as any).rows || difficultyTrend || [],
        intentTrend: (intentTrend as any).rows || intentTrend || [],
        topGrowingKeywords: (topGrowingKeywords as any).rows || topGrowingKeywords || [],
        recentActiveKeywords: (recentActiveKeywords as any).rows || recentActiveKeywords || [],
      },
    });
  } catch (error: any) {
    console.error('获取趋势数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取趋势数据失败',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
