import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL 环境变量未设置');
}

const client = neon(connectionString);
const db = drizzle(client);

/**
 * GET /api/keywords/{id}
 * 获取关键词详情数据
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const keywordId = parseInt(params.id);

    if (isNaN(keywordId)) {
      return NextResponse.json(
        { error: '无效的关键词ID' },
        { status: 400 }
      );
    }

    // 获取关键词基本信息（最新观察数据）
    const keywordResult: any = await db.execute(sql`
      SELECT 
        k.id,
        k.keyword,
        k.keyword_norm,
        k.word_count,
        k.created_at,
        kl.latest_score,
        kl.latest_volume,
        kl.latest_difficulty,
        kl.latest_intent,
        kl.latest_is_green_light,
        kl.latest_is_painkiller,
        kl.latest_breakout_score,
        kl.latest_source,
        kl.latest_observed_at,
        kl.observation_count,
        kl.first_observed_at,
        kl.last_observed_at
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

    // 获取历史趋势数据（最近30天）
    const historyResult: any = await db.execute(sql`
      SELECT 
        DATE(observed_at) as date,
        AVG(score)::numeric(10,2) as avg_score,
        AVG(volume)::numeric(10,0) as avg_volume,
        MAX(difficulty) as difficulty,
        MAX(intent) as intent
      FROM keyword_observations
      WHERE keyword_id = ${keywordId}
        AND observed_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(observed_at)
      ORDER BY date ASC
    `);

    const historyRows = Array.isArray(historyResult) ? historyResult : (historyResult.rows || []);

    // 获取所有观察记录（用于详细历史）
    const observationsResult: any = await db.execute(sql`
      SELECT 
        id,
        score,
        volume,
        difficulty,
        intent,
        is_green_light,
        is_painkiller,
        breakout_score,
        source,
        observed_at
      FROM keyword_observations
      WHERE keyword_id = ${keywordId}
      ORDER BY observed_at DESC
      LIMIT 50
    `);

    const observationRows = Array.isArray(observationsResult) ? observationsResult : (observationsResult.rows || []);

    // 获取相关报告
    const reportsResult: any = await db.execute(sql`
      SELECT 
        kr.id,
        kr.run_id,
        kr.keywords_analyzed,
        kr.created_at,
        kr.status,
        mr.server_id,
        ms.name as server_name
      FROM keyword_reports kr
      LEFT JOIN mining_runs mr ON kr.run_id = mr.id
      LEFT JOIN mining_servers ms ON mr.server_id = ms.id
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
        note,
        created_by,
        created_at
      FROM keyword_notes
      WHERE keyword_id = ${keywordId}
      ORDER BY created_at DESC
      LIMIT 20
    `);

    const noteRows = Array.isArray(notesResult) ? notesResult : (notesResult.rows || []);

    return NextResponse.json({
      keyword,
      history: historyRows,
      observations: observationRows,
      reports: reportRows,
      notes: noteRows,
    });
  } catch (error) {
    console.error('获取关键词详情失败:', error);
    return NextResponse.json(
      { error: '获取关键词详情失败' },
      { status: 500 }
    );
  }
}
