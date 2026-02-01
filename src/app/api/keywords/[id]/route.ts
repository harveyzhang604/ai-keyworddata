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

/**
 * GET /api/keywords/{id}
 * 获取关键词详情数据
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const keywordId = parseInt(id);

    if (isNaN(keywordId)) {
      return NextResponse.json(
        { error: '无效的关键词ID' },
        { status: 400 }
      );
    }

    const db = getDb();

    // 获取关键词基本信息（从 keyword_latest 视图获取最新数据）
    const keywordResult: any = await db.execute(sql`
      SELECT 
        k.id,
        k.keyword,
        k.keyword_norm,
        k.language,
        k.country,
        k.category,
        k.first_seen_at,
        k.last_seen_at,
        kl.score,
        kl.search_volume,
        kl.difficulty,
        kl.intent,
        kl.word_count,
        kl.pain_point_flag,
        kl.source,
        kl.last_observation_time
      FROM keywords k
      LEFT JOIN keyword_latest kl ON k.id = kl.keyword_id
      WHERE k.id = ${keywordId}
      LIMIT 1
    `);

    const keywordRows = Array.isArray(keywordResult) ? keywordResult : (keywordResult.rows || []);

    if (keywordRows.length === 0) {
      return NextResponse.json(
        { error: '关键词不存在' },
        { status: 404 }
      );
    }

    const keyword = keywordRows[0];

    // 获取历史趋势数据（最近30天的观察记录按日期分组）
    const historyResult: any = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        AVG(score)::numeric(10,2) as avg_score,
        AVG(search_volume)::numeric(10,0) as avg_volume,
        MAX(difficulty) as difficulty,
        MAX(intent) as intent
      FROM keyword_observations
      WHERE keyword_id = ${keywordId}
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    const historyRows = Array.isArray(historyResult) ? historyResult : (historyResult.rows || []);

    // 获取最近的观察记录列表
    const observationsResult: any = await db.execute(sql`
      SELECT 
        ko.id,
        ko.score,
        ko.search_volume,
        ko.difficulty,
        ko.intent,
        ko.word_count,
        ko.pain_point_flag,
        ko.source,
        ko.raw_json,
        ko.created_at,
        mr.seed as run_seed
      FROM keyword_observations ko
      LEFT JOIN mining_runs mr ON ko.run_id = mr.id
      WHERE ko.keyword_id = ${keywordId}
      ORDER BY ko.created_at DESC
      LIMIT 50
    `);

    const observationRows = Array.isArray(observationsResult) ? observationsResult : (observationsResult.rows || []);

    // 获取相关报告
    const reportsResult: any = await db.execute(sql`
      SELECT 
        kr.id,
        kr.run_id,
        kr.title,
        kr.created_at,
        ms.name as server_name
      FROM keyword_reports kr
      LEFT JOIN mining_runs mr ON kr.run_id = mr.id
      LEFT JOIN mining_servers ms ON mr.miner_id = ms.id
      WHERE kr.run_id IN (
        SELECT DISTINCT run_id 
        FROM keyword_observations 
        WHERE keyword_id = ${keywordId}
      )
      ORDER BY kr.created_at DESC
      LIMIT 10
    `);

    const reportRows = Array.isArray(reportsResult) ? reportsResult : (reportsResult.rows || []);

    // 获取备注历史
    const notesResult: any = await db.execute(sql`
      SELECT 
        id,
        type,
        content,
        created_at
      FROM keyword_notes
      WHERE keyword_id = ${keywordId}
      ORDER BY created_at DESC
      LIMIT 20
    `);

    const noteRows = Array.isArray(notesResult) ? notesResult : (notesResult.rows || []);

    return NextResponse.json({
      success: true,
      data: {
        keyword: {
          id: keyword.id,
          keyword: keyword.keyword,
          keywordNorm: keyword.keyword_norm,
          language: keyword.language,
          country: keyword.country,
          category: keyword.category,
          firstSeenAt: keyword.first_seen_at,
          lastSeenAt: keyword.last_seen_at,
          score: parseFloat(keyword.score) || 0,
          searchVolume: parseInt(keyword.search_volume) || 0,
          difficulty: keyword.difficulty || 'unknown',
          intent: keyword.intent || 'unknown',
          wordCount: parseInt(keyword.word_count) || 0,
          painPointFlag: keyword.pain_point_flag || false,
          source: keyword.source || 'unknown',
          lastObservationTime: keyword.last_observation_time,
          isGreenLight: parseFloat(keyword.score) >= 80 && keyword.difficulty === 'low',
        },
        history: historyRows.map((row: any) => ({
          date: row.date,
          avgScore: parseFloat(row.avg_score) || 0,
          avgVolume: parseInt(row.avg_volume) || 0,
          difficulty: row.difficulty,
          intent: row.intent,
        })),
        observations: observationRows.map((row: any) => ({
          id: row.id,
          score: parseFloat(row.score) || 0,
          searchVolume: parseInt(row.search_volume) || 0,
          difficulty: row.difficulty,
          intent: row.intent,
          wordCount: parseInt(row.word_count) || 0,
          painPointFlag: row.pain_point_flag || false,
          source: row.source,
          createdAt: row.created_at,
          runSeed: row.run_seed,
        })),
        reports: reportRows.map((row: any) => ({
          id: row.id,
          runId: row.run_id,
          title: row.title,
          createdAt: row.created_at,
          serverName: row.server_name,
        })),
        notes: noteRows.map((row: any) => ({
          id: row.id,
          type: row.type,
          content: row.content,
          createdAt: row.created_at,
        })),
      },
    });
  } catch (error: any) {
    console.error('获取关键词详情失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '获取关键词详情失败',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
