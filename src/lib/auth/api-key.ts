/**
 * API Key 验证模块
 * 用于验证服务器端上传数据时的身份
 */

import { NextRequest } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import * as crypto from 'crypto';

/**
 * 获取数据库连接
 */
function getDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL 环境变量未设置');
  }

  const client = neon(connectionString);
  return drizzle(client);
}

/**
 * 生成 API Key 的哈希值
 * @param apiKey 原始 API Key
 * @returns 哈希后的 API Key
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * 验证 API Key 是否有效
 * @param apiKey 原始 API Key
 * @returns 验证结果，包含服务器信息
 */
export async function validateApiKey(
  apiKey: string
): Promise<{ valid: boolean; serverId?: number; serverName?: string }> {
  try {
    if (!apiKey || apiKey.trim() === '') {
      return { valid: false };
    }

    const hashedKey = hashApiKey(apiKey);
    const db = getDb();

    // 查询数据库验证 API Key
    const result: any = await db.execute(sql`
      SELECT id, name 
      FROM mining_servers 
      WHERE api_key_hash = ${hashedKey}
      LIMIT 1
    `);

    const rows = Array.isArray(result) ? result : (result.rows || []);

    if (rows.length > 0) {
      return {
        valid: true,
        serverId: rows[0].id,
        serverName: rows[0].name,
      };
    }

    return { valid: false };
  } catch (error) {
    console.error('API Key 验证失败:', error);
    return { valid: false };
  }
}

/**
 * 从请求头中提取 API Key
 * @param request Next.js 请求对象
 * @returns API Key 或 null
 */
export function extractApiKey(request: NextRequest): string | null {
  // 支持两种格式:
  // 1. Authorization: Bearer <api_key>
  // 2. X-API-Key: <api_key>

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  const apiKeyHeader = request.headers.get('x-api-key');
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  return null;
}

/**
 * API 鉴权中间件
 * 在 API Route 中使用此函数验证请求
 * 
 * @example
 * ```ts
 * export async function POST(request: NextRequest) {
 *   const auth = await authenticateRequest(request);
 *   if (!auth.valid) {
 *     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 *   
 *   // 使用 auth.serverId 和 auth.serverName
 *   // ...
 * }
 * ```
 */
export async function authenticateRequest(request: NextRequest): Promise<{
  valid: boolean;
  serverId?: number;
  serverName?: string;
  error?: string;
}> {
  const apiKey = extractApiKey(request);

  if (!apiKey) {
    return {
      valid: false,
      error: 'Missing API Key. Please provide it via Authorization header or X-API-Key header.',
    };
  }

  const result = await validateApiKey(apiKey);

  if (!result.valid) {
    return {
      valid: false,
      error: 'Invalid API Key.',
    };
  }

  return result;
}
