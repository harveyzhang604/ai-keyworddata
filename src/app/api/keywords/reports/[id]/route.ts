/**
 * GET /api/keywords/reports/[id]
 * 获取报告详情
 * 
 * DELETE /api/keywords/reports/[id]
 * 删除报告
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

function getSqlClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL 环境变量未设置');
  }
  return neon(connectionString);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reportId = parseInt(id);

    if (isNaN(reportId)) {
      return NextResponse.json(
        { error: '无效的报告ID' },
        { status: 400 }
      );
    }

    const db = getDb();

    // 获取报告详情
    const reportResult: any = await db.execute(sql`
      SELECT 
        kr.id,
        kr.run_id,
        kr.title,
        kr.report_markdown,
        kr.report_json,
        kr.created_at,
        mr.status,
        mr.keywords_count as keywords_analyzed,
        ms.name as server_name
      FROM keyword_reports kr
      LEFT JOIN mining_runs mr ON kr.run_id = mr.id
      LEFT JOIN mining_servers ms ON mr.server_id = ms.id
      WHERE kr.id = ${reportId}
      LIMIT 1
    `);

    const reports = Array.isArray(reportResult) ? reportResult : (reportResult.rows || []);

    if (reports.length === 0) {
      return NextResponse.json(
        { error: '报告不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(reports[0]);
  } catch (error: any) {
    console.error('获取报告详情失败:', error);
    return NextResponse.json(
      {
        error: '获取报告详情失败',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reportId = parseInt(id);

    if (isNaN(reportId)) {
      return NextResponse.json(
        { success: false, error: '无效的报告 ID' },
        { status: 400 }
      );
    }

    const sql = getSqlClient();

    // 删除报告
    const result = await sql`
      DELETE FROM keyword_reports
      WHERE id = ${reportId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: '报告不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '报告已删除',
      deletedId: reportId,
    });
  } catch (error: any) {
    console.error('删除报告失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '删除失败',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
