/**
 * POST /api/ingest/runs
 * 创建挖掘任务
 * 
 * 请求体:
 * {
 *   "seed": "bitcoin price",
 *   "rounds": 3,
 *   "meta": { "source": "ahrefs", "region": "us" }
 * }
 * 
 * 响应:
 * {
 *   "success": true,
 *   "run_id": 123,
 *   "message": "Mining run created successfully"
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
    const { seed, rounds, meta } = body;

    // 3. 验证参数
    if (!seed || typeof seed !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid "seed" parameter',
        },
        { status: 400 }
      );
    }

    const roundsValue = rounds && typeof rounds === 'number' ? rounds : 1;
    const metaJson = meta ? JSON.stringify(meta) : null;

    // 4. 创建任务记录
    const db = getDb();

    const result: any = await db.execute(sql`
      INSERT INTO mining_runs (
        miner_id,
        seed,
        rounds,
        status,
        started_at,
        meta_json
      ) VALUES (
        ${auth.serverId},
        ${seed},
        ${roundsValue},
        'running',
        NOW(),
        ${metaJson}
      )
      RETURNING id
    `);

    const rows = Array.isArray(result) ? result : (result.rows || []);

    if (rows.length === 0) {
      throw new Error('Failed to create mining run');
    }

    const runId = rows[0].id;

    // 5. 返回结果
    return NextResponse.json(
      {
        success: true,
        run_id: runId,
        message: 'Mining run created successfully',
        server: auth.serverName,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('创建挖掘任务失败:', error);
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
