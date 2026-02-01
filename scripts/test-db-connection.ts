/**
 * 测试数据库连接和表结构
 * 运行方式: npx tsx scripts/test-db-connection.ts
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
  console.error('   请检查 .env.development 文件');
  process.exit(1);
}

console.log('🔗 使用数据库:', connectionString.split('@')[1]?.split('/')[0] || '...');

const client = neon(connectionString);
const db = drizzle(client);

async function testConnection() {
  console.log('🔍 开始测试数据库连接...\n');

  try {
    // 1. 测试基本连接
    console.log('1️⃣ 测试基本连接...');
    const result = await db.execute(sql`SELECT NOW() as current_time`);
    console.log('✅ 数据库连接成功!');
    console.log(`   当前时间: ${(result as any)[0]?.current_time || result}\n`);

    // 2. 检查关键词挖掘系统的表是否存在
    console.log('2️⃣ 检查表结构...');
    const tables: any = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN (
          'mining_servers',
          'mining_runs', 
          'keywords',
          'keyword_observations',
          'keyword_reports',
          'keyword_notes'
        )
      ORDER BY table_name
    `);

    const expectedTables = [
      'keyword_notes',
      'keyword_observations',
      'keyword_reports',
      'keywords',
      'mining_runs',
      'mining_servers',
    ];

    const rows = Array.isArray(tables) ? tables : (tables.rows || []);
    const existingTables = rows.map((t: any) => t.table_name);
    console.log(`   找到 ${existingTables.length} / 6 个表:`);

    expectedTables.forEach((tableName) => {
      if (existingTables.includes(tableName)) {
        console.log(`   ✅ ${tableName}`);
      } else {
        console.log(`   ❌ ${tableName} (缺失)`);
      }
    });

    if (existingTables.length === 6) {
      console.log('\n✅ 所有表都已创建成功!\n');
    } else {
      console.log(
        '\n⚠️  部分表缺失，请先执行 scripts/init-mining-db.sql 脚本'
      );
      console.log('   步骤:');
      console.log('   1. 打开 Neon 控制台: https://console.neon.tech/');
      console.log('   2. 选择数据库 SQL Editor');
      console.log('   3. 复制 scripts/init-mining-db.sql 内容并执行\n');
      return;
    }

    // 3. 检查物化视图
    console.log('3️⃣ 检查物化视图...');
    const views: any = await db.execute(sql`
      SELECT matviewname 
      FROM pg_matviews 
      WHERE schemaname = 'public' 
        AND matviewname = 'keyword_latest'
    `);

    const viewRows = Array.isArray(views) ? views : (views.rows || []);
    if (viewRows.length > 0) {
      console.log('   ✅ keyword_latest 物化视图已创建\n');
    } else {
      console.log('   ⚠️  keyword_latest 物化视图未找到\n');
    }

    // 4. 检查测试数据
    console.log('4️⃣ 检查测试数据...');
    const servers: any = await db.execute(sql`
      SELECT name, region FROM mining_servers
    `);

    const serverRows = Array.isArray(servers) ? servers : (servers.rows || []);
    if (serverRows.length > 0) {
      console.log(`   找到 ${serverRows.length} 个测试服务器:`);
      serverRows.forEach((server: any) => {
        console.log(`   - ${server.name} (${server.region || 'no region'})`);
      });
    } else {
      console.log('   ℹ️  暂无服务器数据');
    }

    console.log('\n✅ 数据库测试完成! Phase 1.1 & 1.2 验收通过!\n');
  } catch (error) {
    console.error('\n❌ 数据库测试失败:');
    console.error(error);
    process.exit(1);
  }
}

testConnection();
