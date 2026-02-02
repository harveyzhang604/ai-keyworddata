/**
 * POST /api/ingest/keywords/batch
 * 批量上传关键词
 * 
 * 请求体:
 * {
 *   "run_id": 123,
 *   "keywords": [
 *     {
 *       "keyword": "bitcoin price today",
 *       "score": 85.5,
 *       "search_volume": 50000,
 *       "difficulty": "medium",
 *       "intent": "informational",
 *       "source": "ahrefs",
 *       "language": "en",
 *       "country": "US",
 *       "category": "crypto",
 *       "word_count": 3,
 *       "pain_point_flag": false,
 *       "raw_data": { ... }
 *     }
 *   ]
 * }
 * 
 * 响应:
 * {
 *   "success": true,
 *   "inserted": 98,
 *   "duplicates": 2,
 *   "message": "Keywords uploaded successfully"
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

interface KeywordInput {
  keyword: string;
  score?: number;
  search_volume?: number;
  difficulty?: string;
  intent?: string;
  source?: string;
  language?: string;
  country?: string;
  category?: string;
  word_count?: number;
  pain_point_flag?: boolean;
  pain_point?: string;
  raw_data?: any;
}

/**
 * 标准化关键词（去除多余空格、转小写）
 */
function normalizeKeyword(keyword: string): string {
  return keyword.trim().toLowerCase().replace(/\s+/g, ' ');
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
    const { run_id, keywords } = body;

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

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid "keywords" array',
        },
        { status: 400 }
      );
    }

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

    // 5. 批量插入关键词（去重）
    let insertedCount = 0;
    let duplicateCount = 0;

    for (const kw of keywords) {
      if (!kw.keyword || typeof kw.keyword !== 'string') {
        continue; // 跳过无效关键词
      }

      const keywordNorm = normalizeKeyword(kw.keyword);

      try {
        // 5.1 插入或获取关键词 ID
        const insertKeyword: any = await db.execute(sql`
          INSERT INTO keywords (
            keyword,
            keyword_norm,
            language,
            country,
            category,
            first_seen_at,
            last_seen_at
          ) VALUES (
            ${kw.keyword},
            ${keywordNorm},
            ${kw.language || null},
            ${kw.country || null},
            ${kw.category || null},
            NOW(),
            NOW()
          )
          ON CONFLICT (keyword_norm) 
          DO UPDATE SET 
            last_seen_at = NOW(),
            language = COALESCE(keywords.language, EXCLUDED.language),
            country = COALESCE(keywords.country, EXCLUDED.country),
            category = COALESCE(keywords.category, EXCLUDED.category)
          RETURNING id
        `);

        const kwRows = Array.isArray(insertKeyword) ? insertKeyword : (insertKeyword.rows || []);
        const keywordId = kwRows[0]?.id;

        if (!keywordId) {
          continue;
        }

        // 5.2 检查是否已存在相同 keyword_id + run_id 的观察记录
        const checkObs: any = await db.execute(sql`
          SELECT id FROM keyword_observations
          WHERE keyword_id = ${keywordId} AND run_id = ${run_id}
          LIMIT 1
        `);

        const obsRows = Array.isArray(checkObs) ? checkObs : (checkObs.rows || []);

        if (obsRows.length > 0) {
          duplicateCount++;
          continue; // 跳过重复数据
        }

        // 5.3 插入观察数据
        const rawJson = kw.raw_data ? JSON.stringify(kw.raw_data) : null;

        await db.execute(sql`
          INSERT INTO keyword_observations (
            keyword_id,
            run_id,
            source,
            score,
            search_volume,
            difficulty,
            intent,
            word_count,
            pain_point_flag,
            pain_point,
            raw_json,
            created_at
          ) VALUES (
            ${keywordId},
            ${run_id},
            ${kw.source || null},
            ${kw.score || null},
            ${kw.search_volume || null},
            ${kw.difficulty || null},
            ${kw.intent || null},
            ${kw.word_count || null},
            ${kw.pain_point_flag || false},
            ${kw.pain_point || null},
            ${rawJson},
            NOW()
          )
        `);

        insertedCount++;
      } catch (error: any) {
        console.error(`关键词插入失败 [${kw.keyword}]:`, error.message);
        // 继续处理下一个关键词
      }
    }

    // 6. 返回结果
    return NextResponse.json(
      {
        success: true,
        inserted: insertedCount,
        duplicates: duplicateCount,
        total: keywords.length,
        message: 'Keywords uploaded successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('批量上传关键词失败:', error);
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
