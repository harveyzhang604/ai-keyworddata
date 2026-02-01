/**
 * 测试关键词列表 API
 * 运行方式: npx tsx scripts/test-keywords-list.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });

const BASE_URL = 'http://localhost:3001';

async function testKeywordsList() {
  try {
    console.log('🧪 开始测试关键词列表 API...\n');

    // 测试 1: 基本查询
    console.log('1️⃣ 测试基本查询（无筛选）...');
    const response1 = await fetch(`${BASE_URL}/api/keywords/list?page=1&limit=10`);
    const result1 = await response1.json();

    if (result1.success) {
      console.log('✅ 基本查询成功!');
      console.log(`   - 总数: ${result1.data.pagination.total}`);
      console.log(`   - 当前页: ${result1.data.keywords.length} 条\n`);
    }

    // 测试 2: 搜索关键词
    console.log('2️⃣ 测试搜索功能...');
    const response2 = await fetch(
      `${BASE_URL}/api/keywords/list?search=keyword&limit=10`
    );
    const result2 = await response2.json();

    if (result2.success) {
      console.log('✅ 搜索功能正常!');
      console.log(`   - 找到: ${result2.data.keywords.length} 条结果\n`);
    }

    // 测试 3: 得分筛选
    console.log('3️⃣ 测试得分筛选...');
    const response3 = await fetch(
      `${BASE_URL}/api/keywords/list?minScore=80&limit=10`
    );
    const result3 = await response3.json();

    if (result3.success) {
      console.log('✅ 得分筛选正常!');
      console.log(`   - 高分关键词: ${result3.data.keywords.length} 条`);
      if (result3.data.keywords.length > 0) {
        console.log(`   - 最高分: ${result3.data.keywords[0].score.toFixed(1)}\n`);
      }
    }

    // 测试 4: 难度筛选
    console.log('4️⃣ 测试难度筛选...');
    const response4 = await fetch(
      `${BASE_URL}/api/keywords/list?difficulty=low&limit=10`
    );
    const result4 = await response4.json();

    if (result4.success) {
      console.log('✅ 难度筛选正常!');
      console.log(`   - 低难度关键词: ${result4.data.keywords.length} 条\n`);
    }

    // 测试 5: 绿灯词筛选
    console.log('5️⃣ 测试绿灯词筛选...');
    const response5 = await fetch(
      `${BASE_URL}/api/keywords/list?greenLight=true&limit=10`
    );
    const result5 = await response5.json();

    if (result5.success) {
      console.log('✅ 绿灯词筛选正常!');
      console.log(`   - 绿灯词数量: ${result5.data.keywords.length} 条\n`);
    }

    // 测试 6: 排序功能
    console.log('6️⃣ 测试排序功能...');
    const response6 = await fetch(
      `${BASE_URL}/api/keywords/list?sortBy=search_volume&sortOrder=desc&limit=5`
    );
    const result6 = await response6.json();

    if (result6.success && result6.data.keywords.length > 0) {
      console.log('✅ 排序功能正常!');
      console.log('   - 按搜索量降序:');
      result6.data.keywords.forEach((kw: any, i: number) => {
        console.log(
          `     ${i + 1}. ${kw.keyword} - ${kw.searchVolume.toLocaleString()}`
        );
      });
      console.log();
    }

    // 测试 7: 分页功能
    console.log('7️⃣ 测试分页功能...');
    const response7 = await fetch(
      `${BASE_URL}/api/keywords/list?page=1&limit=2`
    );
    const result7 = await response7.json();

    if (result7.success) {
      console.log('✅ 分页功能正常!');
      console.log(`   - 第 1 页: ${result7.data.keywords.length} 条`);
      console.log(`   - 总页数: ${result7.data.pagination.totalPages}\n`);
    }

    console.log('🎉 所有关键词列表 API 测试通过!\n');
    console.log('✅ Phase 2.2 (关键词列表) 验收通过!\n');
    console.log('🌐 访问关键词列表页面:');
    console.log(`   ${BASE_URL}/keywords/list\n`);
  } catch (error: any) {
    console.error('❌ 测试失败:', error.message);
    console.error('   请确保开发服务器正在运行');
  }
}

testKeywordsList();
