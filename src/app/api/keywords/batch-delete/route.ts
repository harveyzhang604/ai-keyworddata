/**
 * POST /api/keywords/batch-delete
 * 批量删除关键词
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: '缺少关键词 ID 列表' },
        { status: 400 }
      );
    }

    // 验证所有 ID 都是数字
    const keywordIds = ids.map((id: any) => parseInt(id)).filter((id: number) => !isNaN(id));

    if (keywordIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '无效的关键词 ID 列表' },
        { status: 400 }
      );
    }

    const sql = getSqlClient();

    // 批量删除 - 由于外键级联删除，会自动删除关联的 observations
    const result = await sql`
      DELETE FROM keywords
      WHERE id = ANY(${keywordIds}::int[])
      RETURNING id
    `;

    return NextResponse.json({
      success: true,
      message: `已删除 ${result.length} 个关键词`,
      deletedCount: result.length,
      deletedIds: result.map((r: any) => r.id),
    });
  } catch (error: any) {
    console.error('批量删除关键词失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '批量删除失败',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
