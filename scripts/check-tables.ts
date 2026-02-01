/**
 * 检查数据库表是否存在
 */
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.development' });

async function checkTables() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL 环境变量未设置');
    process.exit(1);
  }

  const sql = neon(connectionString);

  console.log('🔍 检查数据库表...\n');

  // 检查关键词系统相关表
  const tables = [
    'mining_servers',
    'mining_runs',
    'keywords',
    'keyword_observations',
    'keyword_reports',
    'keyword_notes',
  ];

  for (const tableName of tables) {
    try {
      const result = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        );
      `;
      
      const exists = result[0]?.exists;
      console.log(`${exists ? '✅' : '❌'} ${tableName}: ${exists ? '存在' : '不存在'}`);
    } catch (error: any) {
      console.error(`❌ 检查 ${tableName} 失败:`, error.message);
    }
  }

  console.log('\n📊 检查表结构...\n');

  // 检查 keyword_reports 表结构
  try {
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'keyword_reports'
      ORDER BY ordinal_position;
    `;

    if (columns.length > 0) {
      console.log('keyword_reports 表结构:');
      columns.forEach((col: any) => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    } else {
      console.log('❌ keyword_reports 表不存在');
    }
  } catch (error: any) {
    console.error('❌ 检查表结构失败:', error.message);
  }

  console.log('\n✅ 检查完成');
}

checkTables().catch(console.error);
