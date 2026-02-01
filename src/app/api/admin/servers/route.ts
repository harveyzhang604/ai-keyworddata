/**
 * GET /api/admin/servers
 * 获取所有服务器列表
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

    const serversQuery: any = await db.execute(sql`
      SELECT 
        id,
        name,
        region,
        CASE WHEN api_key_hash IS NOT NULL THEN true ELSE false END as has_api_key,
        created_at,
        (SELECT COUNT(*) FROM mining_runs WHERE miner_id = mining_servers.id) as runs_count
      FROM mining_servers
      ORDER BY created_at DESC
    `);

    const servers = Array.isArray(serversQuery) ? serversQuery : (serversQuery.rows || []);

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
