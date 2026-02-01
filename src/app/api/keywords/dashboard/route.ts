/**
 * GET /api/keywords/dashboard
 * 获取 Dashboard 统计数据
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
    const sqlClient = getSqlClient();

    // 1. 获取基本统计数据
    const statsResult = await sqlClient`
      SELECT 
        (SELECT COUNT(*) FROM keywords) as total_keywords,
        (SELECT COUNT(*) FROM keywords WHERE last_seen_at >= NOW() - INTERVAL '7 days') as new_this_week,
        (SELECT COUNT(DISTINCT ko.keyword_id) 
         FROM keyword_observations ko 
         WHERE ko.score >= 80 AND ko.difficulty = 'low'
        ) as green_light_keywords,
        (SELECT COUNT(*) FROM mining_runs WHERE status = 'running') as running_tasks
    `;

    const stats = statsResult[0] || {
      total_keywords: 0,
      new_this_week: 0,
      green_light_keywords: 0,
      running_tasks: 0,
    };

    // 2. 获取 TOP 10 关键词（按最新得分排序）
    const topKeywordsResult = await sqlClient`
      WITH latest_observations AS (
        SELECT DISTINCT ON (keyword_id)
          keyword_id,
          score,
          search_volume,
          difficulty,
          intent,
          word_count,
          pain_point_flag,
          created_at
        FROM keyword_observations
        ORDER BY keyword_id, created_at DESC
      )
      SELECT 
        k.id,
        k.keyword,
        lo.score,
        lo.search_volume,
        lo.difficulty,
        lo.intent,
        lo.word_count,
        lo.pain_point_flag,
        lo.created_at as observed_at
      FROM keywords k
      INNER JOIN latest_observations lo ON k.id = lo.keyword_id
      WHERE lo.score IS NOT NULL
      ORDER BY lo.score DESC
      LIMIT 10
    `;

    // 3. 获取近 30 天关键词发现趋势
    const trendResult = await sqlClient`
      SELECT 
        DATE(first_seen_at) as date,
        COUNT(*) as count
      FROM keywords
      WHERE first_seen_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(first_seen_at)
      ORDER BY date ASC
    `;

    // 4. 获取意图分布
    const intentResult = await sqlClient`
      WITH latest_observations AS (
        SELECT DISTINCT ON (keyword_id)
          keyword_id,
          intent
        FROM keyword_observations
        ORDER BY keyword_id, created_at DESC
      )
      SELECT 
        COALESCE(intent, 'unknown') as intent,
        COUNT(*) as count
      FROM latest_observations
      GROUP BY COALESCE(intent, 'unknown')
      ORDER BY count DESC
    `;

    // 5. 获取难度分布
    const difficultyResult = await sqlClient`
      WITH latest_observations AS (
        SELECT DISTINCT ON (keyword_id)
          keyword_id,
          difficulty
        FROM keyword_observations
        ORDER BY keyword_id, created_at DESC
      )
      SELECT 
        COALESCE(difficulty, 'unknown') as difficulty,
        COUNT(*) as count
      FROM latest_observations
      GROUP BY COALESCE(difficulty, 'unknown')
      ORDER BY 
        CASE COALESCE(difficulty, 'unknown')
          WHEN 'low' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'high' THEN 3
          ELSE 4
        END
    `;

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
        topKeywords: topKeywordsResult.map((row: any) => ({
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
        trends: trendResult.map((row: any) => ({
          date: row.date,
          count: parseInt(row.count) || 0,
        })),
        intentDistribution: intentResult.map((row: any) => ({
          intent: row.intent,
          count: parseInt(row.count) || 0,
        })),
        difficultyDistribution: difficultyResult.map((row: any) => ({
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
