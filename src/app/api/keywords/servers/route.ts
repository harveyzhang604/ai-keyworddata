/**
 * GET /api/keywords/servers
 * 获取所有服务器列表（用于筛选）
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
    const sql = getSqlClient();

    // 获取所有有关联关键词的服务器
    const result = await sql`
      SELECT DISTINCT ms.id, ms.name
      FROM mining_servers ms
      INNER JOIN mining_runs mr ON ms.id = mr.miner_id
      INNER JOIN keyword_observations ko ON mr.id = ko.run_id
      ORDER BY ms.name
    `;

    const servers = result.map((row: any) => ({
      id: row.id,
      name: row.name,
    }));

    return NextResponse.json({
      success: true,
      servers,
    });
  } catch (error: any) {
    console.error('获取服务器列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取服务器列表失败',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
