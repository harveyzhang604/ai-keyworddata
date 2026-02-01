/**
 * POST /api/ingest/reports
 * 上传分析报告并更新任务状态
 * 
 * 请求体:
 * {
 *   "run_id": 123,
 *   "title": "Bitcoin Keywords Analysis - Round 3",
 *   "markdown": "# Analysis Report\n\n...",
 *   "json_data": {
 *     "total_keywords": 1000,
 *     "green_light_count": 50,
 *     "top_opportunities": [...]
 *   },
 *   "status": "success" // or "failed"
 * }
 * 
 * 响应:
 * {
 *   "success": true,
 *   "report_id": 456,
 *   "message": "Report uploaded successfully"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import { authenticateRequest } from '@/lib/auth/api-key';

function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL 环境变量未设置');
  }
  const client = neon(connectionString);
  return drizzle(client);
}

export async function POST(request: NextRequest) {
  try {
    // 1. 验证 API Key
    const auth = await authenticateRequest(request);

    if (!auth.valid) {
      return NextResponse.json(
        {
          success: false,
          error: auth.error || 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // 2. 解析请求体
    const body = await request.json();
    const { run_id, title, markdown, json_data, status } = body;

    // 3. 验证参数
    if (!run_id || typeof run_id !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid "run_id" parameter',
        },
        { status: 400 }
      );
    }

    const finalStatus = status && (status === 'success' || status === 'failed') 
      ? status 
      : 'success';

    const db = getDb();

    // 4. 验证 run_id 是否存在且属于该服务器
    const runCheck: any = await db.execute(sql`
      SELECT id FROM mining_runs 
      WHERE id = ${run_id} AND miner_id = ${auth.serverId}
      LIMIT 1
    `);

    const runRows = Array.isArray(runCheck) ? runCheck : (runCheck.rows || []);

    if (runRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Run ID ${run_id} not found or unauthorized`,
        },
        { status: 404 }
      );
    }

    // 5. 插入报告
    const reportTitle = title || `Mining Report - Run ${run_id}`;
    const reportMarkdown = markdown || '';
    const reportJson = json_data ? JSON.stringify(json_data) : null;

    const insertResult: any = await db.execute(sql`
      INSERT INTO keyword_reports (
        run_id,
        title,
        report_markdown,
        report_json,
        created_at
      ) VALUES (
        ${run_id},
        ${reportTitle},
        ${reportMarkdown},
        ${reportJson},
        NOW()
      )
      RETURNING id
    `);

    const reportRows = Array.isArray(insertResult) ? insertResult : (insertResult.rows || []);

    if (reportRows.length === 0) {
      throw new Error('Failed to create report');
    }

    const reportId = reportRows[0].id;

    // 6. 更新任务状态
    await db.execute(sql`
      UPDATE mining_runs
      SET 
        status = ${finalStatus},
        ended_at = NOW(),
        updated_at = NOW()
      WHERE id = ${run_id}
    `);

    // 7. 返回结果
    return NextResponse.json(
      {
        success: true,
        report_id: reportId,
        run_status: finalStatus,
        message: 'Report uploaded successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('上传报告失败:', error);
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
