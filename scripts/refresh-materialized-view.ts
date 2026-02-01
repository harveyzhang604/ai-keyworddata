/**
 * 刷新物化视图
 * 运行方式: npx tsx scripts/refresh-materialized-view.ts
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL 环境变量未设置');
  process.exit(1);
}

const client = neon(connectionString);
const db = drizzle(client);

async function refreshView() {
  try {
    console.log('🔄 开始刷新物化视图 keyword_latest...\n');

    await db.execute(sql`REFRESH MATERIALIZED VIEW keyword_latest`);

    console.log('✅ 物化视图刷新成功!\n');

    // 验证数据
    const count: any = await db.execute(sql`
      SELECT COUNT(*) as count FROM keyword_latest
    `);

    const rows = Array.isArray(count) ? count : (count.rows || []);
    const totalCount = rows[0]?.count || 0;

    console.log(`📊 物化视图中的关键词数量: ${totalCount}\n`);
  } catch (error: any) {
    console.error('❌ 刷新失败:', error.message);
    process.exit(1);
  }
}

refreshView();
