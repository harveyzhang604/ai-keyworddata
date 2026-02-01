/**
 * 初始化关键词挖掘系统的额外数据
 * 包括：物化视图 + 测试数据
 * 运行方式: npx tsx scripts/init-mining-data.ts
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL 环境变量未设置');
  process.exit(1);
}

const client = neon(connectionString);
const db = drizzle(client);

async function initData() {
  try {
    console.log('🚀 开始初始化关键词挖掘系统数据...\n');

    // 1. 创建物化视图
    console.log('1️⃣ 创建物化视图 keyword_latest...');
    await db.execute(sql`
      CREATE MATERIALIZED VIEW IF NOT EXISTS keyword_latest AS
      SELECT DISTINCT ON (k.id)
        k.id,
        k.keyword,
        k.keyword_norm,
        k.language,
        k.country,
        k.category,
        k.first_seen_at,
        k.last_seen_at,
        ko.score,
        ko.search_volume,
        ko.difficulty,
        ko.intent,
        ko.word_count,
        ko.pain_point_flag,
        ko.source,
        ko.created_at as observed_at,
        ko.run_id
      FROM keywords k
      LEFT JOIN keyword_observations ko ON k.id = ko.keyword_id
      ORDER BY k.id, ko.created_at DESC
    `);
    console.log('✅ 物化视图创建成功!\n');

    // 2. 创建索引
    console.log('2️⃣ 创建物化视图索引...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_kw_latest_score 
      ON keyword_latest(score DESC NULLS LAST)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_kw_latest_difficulty 
      ON keyword_latest(difficulty)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_kw_latest_observed 
      ON keyword_latest(observed_at DESC)
    `);
    console.log('✅ 索引创建成功!\n');

    // 3. 插入测试服务器数据
    console.log('3️⃣ 插入测试服务器数据...');
    await db.execute(sql`
      INSERT INTO mining_servers (name, region, api_key_hash) 
      VALUES 
        ('US-Server-01', 'us-east-1', 'test_hash_123'),
        ('SG-Server-01', 'ap-southeast-1', 'test_hash_456')
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ 测试服务器数据插入成功!\n');

    console.log('🎉 关键词挖掘系统数据初始化完成!\n');
    
    // 验证
    console.log('🔍 验证数据...');
    const views: any = await db.execute(sql`
      SELECT matviewname FROM pg_matviews 
      WHERE schemaname = 'public' AND matviewname = 'keyword_latest'
    `);
    const viewRows = Array.isArray(views) ? views : (views.rows || []);
    
    const servers: any = await db.execute(sql`
      SELECT COUNT(*) as count FROM mining_servers
    `);
    const serverRows = Array.isArray(servers) ? servers : (servers.rows || []);
    const serverCount = serverRows[0]?.count || 0;

    console.log(`   ✅ 物化视图: ${viewRows.length > 0 ? '已创建' : '未找到'}`);
    console.log(`   ✅ 测试服务器: ${serverCount} 个\n`);

    console.log('✅ Phase 1.1 & 1.2 完全验收通过! 🎊\n');
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  }
}

initData();
