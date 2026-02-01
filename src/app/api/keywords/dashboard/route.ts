/**
 * GET /api/keywords/dashboard
 * 获取 Dashboard 统计数据
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
    const db = getDb();

    // 1. 获取基本统计数据
    const statsQuery: any = await db.execute(sql`
      SELECT 
        COUNT(DISTINCT k.id) as total_keywords,
        COUNT(DISTINCT CASE WHEN k.last_seen_at >= NOW() - INTERVAL '7 days' THEN k.id END) as new_this_week,
        COUNT(DISTINCT CASE 
          WHEN kl.score >= 80 AND kl.difficulty = 'low' 
          THEN k.id 
        END) as green_light_keywords,
        COUNT(DISTINCT CASE WHEN mr.status = 'running' THEN mr.id END) as running_tasks
      FROM keywords k
      LEFT JOIN keyword_latest kl ON k.id = kl.id
      LEFT JOIN mining_runs mr ON mr.status = 'running'
    `);

    const statsRows = Array.isArray(statsQuery) ? statsQuery : (statsQuery.rows || []);
    const stats = statsRows[0] || {
      total_keywords: 0,
      new_this_week: 0,
      green_light_keywords: 0,
      running_tasks: 0,
    };

    // 2. 获取 TOP 10 关键词（按得分排序）
    const topKeywordsQuery: any = await db.execute(sql`
      SELECT 
        kl.id,
        kl.keyword,
        kl.score,
        kl.search_volume,
        kl.difficulty,
        kl.intent,
        kl.word_count,
        kl.pain_point_flag,
        kl.observed_at
      FROM keyword_latest kl
      WHERE kl.score IS NOT NULL
      ORDER BY kl.score DESC
      LIMIT 10
    `);

    const topKeywordsRows = Array.isArray(topKeywordsQuery) 
      ? topKeywordsQuery 
      : (topKeywordsQuery.rows || []);

    // 3. 获取近 30 天关键词发现趋势
    const trendQuery: any = await db.execute(sql`
      SELECT 
        DATE(first_seen_at) as date,
        COUNT(*) as count
      FROM keywords
      WHERE first_seen_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(first_seen_at)
      ORDER BY date ASC
    `);

    const trendRows = Array.isArray(trendQuery) ? trendQuery : (trendQuery.rows || []);

    // 4. 获取意图分布
    const intentQuery: any = await db.execute(sql`
      SELECT 
        COALESCE(intent, 'unknown') as intent,
        COUNT(*) as count
      FROM keyword_latest
      GROUP BY COALESCE(intent, 'unknown')
      ORDER BY count DESC
    `);

    const intentRows = Array.isArray(intentQuery) ? intentQuery : (intentQuery.rows || []);

    // 5. 获取难度分布
    const difficultyQuery: any = await db.execute(sql`
      SELECT 
        COALESCE(difficulty, 'unknown') as difficulty,
        COUNT(*) as count
      FROM keyword_latest
      GROUP BY COALESCE(difficulty, 'unknown')
      ORDER BY 
        CASE COALESCE(difficulty, 'unknown')
          WHEN 'low' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'high' THEN 3
          ELSE 4
        END
    `);

    const difficultyRows = Array.isArray(difficultyQuery) 
      ? difficultyQuery 
      : (difficultyQuery.rows || []);

    // 返回数据
    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalKeywords: parseInt(stats.total_keywords) || 0,
          newThisWeek: parseInt(stats.new_this_week) || 0,
          greenLightKeywords: parseInt(stats.green_light_keywords) || 0,
          runningTasks: parseInt(stats.running_tasks) || 0,
        },
        topKeywords: topKeywordsRows.map((row: any) => ({
          id: row.id,
          keyword: row.keyword,
          score: parseFloat(row.score) || 0,
          searchVolume: parseInt(row.search_volume) || 0,
          difficulty: row.difficulty || 'unknown',
          intent: row.intent || 'unknown',
          wordCount: parseInt(row.word_count) || 0,
          painPointFlag: row.pain_point_flag || false,
          observedAt: row.observed_at,
        })),
        trends: trendRows.map((row: any) => ({
          date: row.date,
          count: parseInt(row.count) || 0,
        })),
        intentDistribution: intentRows.map((row: any) => ({
          intent: row.intent,
          count: parseInt(row.count) || 0,
        })),
        difficultyDistribution: difficultyRows.map((row: any) => ({
          difficulty: row.difficulty,
          count: parseInt(row.count) || 0,
        })),
      },
    });
  } catch (error: any) {
    console.error('获取 Dashboard 数据失败:', error);
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
