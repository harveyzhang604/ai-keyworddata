/**
 * GET /api/keywords/reports
 * 获取报告列表
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/core/db';
import { keywordReports, miningRuns, miningServers } from '@/config/db/schema';
import { desc, sql, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // 获取报告列表（带关联信息）
    const reports = await db()
      .select({
        id: keywordReports.id,
        run_id: keywordReports.runId,
        title: keywordReports.title,
        created_at: keywordReports.createdAt,
        updated_at: keywordReports.updatedAt,
        status: miningRuns.status,
        keywords_analyzed: sql<number>`(
          SELECT COUNT(*) 
          FROM keyword_observations 
          WHERE run_id = ${keywordReports.runId}
        )`,
        server_name: miningServers.name,
      })
      .from(keywordReports)
      .leftJoin(miningRuns, eq(keywordReports.runId, miningRuns.id))
      .leftJoin(miningServers, eq(miningRuns.minerId, miningServers.id))
      .orderBy(desc(keywordReports.createdAt))
      .limit(100);

    // 统计数据
    const stats = {
      total: reports.length,
      success: reports.filter((r: any) => r.status === 'success').length,
      failed: reports.filter((r: any) => r.status === 'failed').length,
    };

    return NextResponse.json({
      success: true,
      reports,
      stats,
    });
  } catch (error: any) {
    console.error('获取报告列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取报告列表失败',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
