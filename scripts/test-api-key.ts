/**
 * 测试 API Key 验证功能
 * 运行方式: npx tsx scripts/test-api-key.ts
 */

import { hashApiKey, validateApiKey } from '../src/lib/auth/api-key';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as crypto from 'crypto';

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL 环境变量未设置');
  process.exit(1);
}

const client = neon(connectionString);
const db = drizzle(client);

/**
 * 生成随机 API Key
 */
function generateApiKey(): string {
  return `sk_${crypto.randomBytes(32).toString('hex')}`;
}

async function testApiKey() {
  try {
    console.log('🔐 开始测试 API Key 验证功能...\n');

    // 1. 生成测试 API Key
    console.log('1️⃣ 生成测试 API Key...');
    const testApiKey1 = generateApiKey();
    const testApiKey2 = generateApiKey();

    console.log(`   🔑 Server 1 API Key: ${testApiKey1}`);
    console.log(`   🔑 Server 2 API Key: ${testApiKey2}\n`);

    // 2. 更新数据库中的 API Key
    console.log('2️⃣ 更新服务器 API Key...');
    const hash1 = hashApiKey(testApiKey1);
    const hash2 = hashApiKey(testApiKey2);

    await db.execute(sql`
      UPDATE mining_servers 
      SET api_key_hash = ${hash1} 
      WHERE name = 'US-Server-01'
    `);

    await db.execute(sql`
      UPDATE mining_servers 
      SET api_key_hash = ${hash2} 
      WHERE name = 'SG-Server-01'
    `);

    console.log('   ✅ API Key 已更新\n');

    // 3. 测试验证
    console.log('3️⃣ 测试 API Key 验证...');

    // 测试有效的 API Key
    const result1 = await validateApiKey(testApiKey1);
    console.log('   测试 Server 1 API Key:');
    console.log(`     - Valid: ${result1.valid}`);
    console.log(`     - Server ID: ${result1.serverId}`);
    console.log(`     - Server Name: ${result1.serverName}\n`);

    const result2 = await validateApiKey(testApiKey2);
    console.log('   测试 Server 2 API Key:');
    console.log(`     - Valid: ${result2.valid}`);
    console.log(`     - Server ID: ${result2.serverId}`);
    console.log(`     - Server Name: ${result2.serverName}\n`);

    // 测试无效的 API Key
    const invalidResult = await validateApiKey('invalid_key_12345');
    console.log('   测试无效 API Key:');
    console.log(`     - Valid: ${invalidResult.valid}`);
    console.log(`     - Expected: false\n`);

    // 4. 验证结果
    if (
      result1.valid &&
      result1.serverName === 'US-Server-01' &&
      result2.valid &&
      result2.serverName === 'SG-Server-01' &&
      !invalidResult.valid
    ) {
      console.log('✅ 所有 API Key 验证测试通过!\n');
      console.log('🎉 Phase 1.3 验收通过!\n');
      console.log('📋 请保存以下 API Key 用于后续测试:');
      console.log(`   US-Server-01: ${testApiKey1}`);
      console.log(`   SG-Server-01: ${testApiKey2}\n`);
    } else {
      console.log('❌ API Key 验证测试失败\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

testApiKey();
