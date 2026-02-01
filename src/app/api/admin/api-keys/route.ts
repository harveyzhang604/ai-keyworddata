/**
 * GET /api/admin/api-keys
 * 获取所有 API Keys 列表
 */
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import crypto from 'crypto';

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

    // 获取所有有 API Key 的服务器
    const keysQuery: any = await db.execute(sql`
      SELECT 
        ms.id,
        ms.id as server_id,
        ms.name as server_name,
        ms.region,
        ms.created_at,
        (
          SELECT MAX(mr.created_at)
          FROM mining_runs mr
          WHERE mr.miner_id = ms.id
        ) as last_used_at
      FROM mining_servers ms
      WHERE ms.api_key_hash IS NOT NULL
      ORDER BY ms.created_at DESC
    `);

    const keys = Array.isArray(keysQuery) ? keysQuery : (keysQuery.rows || []);

    return NextResponse.json({
      success: true,
      keys: keys.map((k: any) => ({
        ...k,
        key_prefix: 'kwd_live_****', // 哈希存储，不显示实际值
      })),
    });
  } catch (error: any) {
    console.error('获取 API Keys 失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取 API Keys 失败',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/api-keys
 * 创建新的 API Key
 */
export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const { server_id, server_name, region } = body;

    if (!server_id || !server_name) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 生成 API Key: kwd_live_ + 32位随机字符串
    const randomBytes = crypto.randomBytes(24);
    const apiKey = `kwd_live_${randomBytes.toString('hex')}`;
    
    // 生成哈希值存储
    const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // 检查服务器是否存在
    const serverQuery: any = await db.execute(sql`
      SELECT id FROM mining_servers WHERE id = ${server_id}
    `);
    const servers = Array.isArray(serverQuery) ? serverQuery : (serverQuery.rows || []);

    if (servers.length === 0) {
      // 服务器不存在，创建新服务器
      await db.execute(sql`
        INSERT INTO mining_servers (id, name, region, api_key_hash, created_at, updated_at)
        VALUES (${server_id}, ${server_name}, ${region || null}, ${apiKeyHash}, NOW(), NOW())
      `);
    } else {
      // 服务器已存在，更新 API Key
      await db.execute(sql`
        UPDATE mining_servers 
        SET api_key_hash = ${apiKeyHash}, 
            name = ${server_name},
            region = ${region || null},
            updated_at = NOW()
        WHERE id = ${server_id}
      `);
    }

    return NextResponse.json({
      success: true,
      api_key: apiKey, // 只在创建时返回明文
      server_id,
    });
  } catch (error: any) {
    console.error('创建 API Key 失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '创建 API Key 失败',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
