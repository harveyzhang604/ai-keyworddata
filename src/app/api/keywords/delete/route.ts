/**
 * DELETE /api/keywords/delete
 * 删除单个关键词
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少关键词 ID' },
        { status: 400 }
      );
    }

    const keywordId = parseInt(id);
    if (isNaN(keywordId)) {
      return NextResponse.json(
        { success: false, error: '无效的关键词 ID' },
        { status: 400 }
      );
    }

    const sql = getSqlClient();

    // 由于外键级联删除，删除 keywords 表记录会自动删除 keyword_observations 中的关联记录
    const result = await sql`
      DELETE FROM keywords
      WHERE id = ${keywordId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: '关键词不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '关键词已删除',
      deletedId: keywordId,
    });
  } catch (error: any) {
    console.error('删除关键词失败:', error);
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
