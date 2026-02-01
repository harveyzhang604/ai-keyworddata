/**
 * GET /api/keywords/stats
 * 获取首页统计数据
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

    // 获取统计数据
    const statsQuery: any = await db.execute(sql`
      SELECT 
        (SELECT COUNT(*) FROM keywords) as total_keywords,
        (SELECT COUNT(*) FROM mining_servers) as active_servers,
        (SELECT COUNT(*) FROM keyword_reports) as total_reports,
        (SELECT COUNT(*) FROM keywords WHERE created_at > NOW() - INTERVAL '7 days') as recent_keywords,
        (SELECT COUNT(*) FROM mining_runs WHERE status = 'running') as running_tasks
    `);

    const statsRows = Array.isArray(statsQuery) ? statsQuery : (statsQuery.rows || []);
    const stats = statsRows[0] || {
      total_keywords: 0,
      active_servers: 0,
      total_reports: 0,
      recent_keywords: 0,
      running_tasks: 0,
    };

    // 获取最新的5个任务
    const tasksQuery: any = await db.execute(sql`
      SELECT 
        mr.id,
        mr.status,
        mr.started_at,
        ms.name as server_name
      FROM mining_runs mr
      LEFT JOIN mining_servers ms ON mr.miner_id = ms.id
      ORDER BY mr.started_at DESC
      LIMIT 5
    `);

    const tasksRows = Array.isArray(tasksQuery) ? tasksQuery : (tasksQuery.rows || []);

    return NextResponse.json({
      success: true,
      stats: {
        totalKeywords: Number(stats.total_keywords) || 0,
        activeServers: Number(stats.active_servers) || 0,
        totalReports: Number(stats.total_reports) || 0,
        recentKeywords: Number(stats.recent_keywords) || 0,
        runningTasks: Number(stats.running_tasks) || 0,
      },
      recentTasks: tasksRows,
    });
  } catch (error: any) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取统计数据失败',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

