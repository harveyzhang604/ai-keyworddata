/**
 * DELETE /api/admin/api-keys/[id]
 * 删除 API Key
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const serverId = parseInt(id);

    if (isNaN(serverId)) {
      return NextResponse.json(
        { success: false, error: '无效的服务器 ID' },
        { status: 400 }
      );
    }

    // 删除 API Key（设置为 NULL）
    await db.execute(sql`
      UPDATE mining_servers 
      SET api_key_hash = NULL, updated_at = NOW()
      WHERE id = ${serverId}
    `);

    return NextResponse.json({
      success: true,
      message: 'API Key 已删除',
    });
  } catch (error: any) {
    console.error('删除 API Key 失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '删除 API Key 失败',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
