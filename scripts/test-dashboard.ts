/**
 * 测试 Dashboard API
 * 运行方式: npx tsx scripts/test-dashboard.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });

const BASE_URL = 'http://localhost:3001'; // 注意端口是 3001

async function testDashboard() {
  try {
    console.log('🧪 开始测试 Dashboard API...\n');

    const response = await fetch(`${BASE_URL}/api/keywords/dashboard`);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ API 请求失败:', error);
      return;
    }

    const result = await response.json();

    if (!result.success) {
      console.error('❌ API 返回失败:', result);
      return;
    }

    const { data } = result;

    console.log('✅ Dashboard API 测试成功!\n');
    console.log('📊 统计数据:');
    console.log(`   - 总关键词数: ${data.stats.totalKeywords}`);
    console.log(`   - 本周新增: ${data.stats.newThisWeek}`);
    console.log(`   - 绿灯词: ${data.stats.greenLightKeywords}`);
    console.log(`   - 运行中任务: ${data.stats.runningTasks}\n`);

    console.log(`🏆 TOP ${data.topKeywords.length} 关键词:`);
    data.topKeywords.slice(0, 5).forEach((kw: any, index: number) => {
      console.log(
        `   ${index + 1}. ${kw.keyword} - 得分: ${kw.score.toFixed(1)} (${kw.difficulty})`
      );
    });
    console.log();

    console.log(`📈 趋势数据: ${data.trends.length} 天`);
    console.log(`🎯 意图分布: ${data.intentDistribution.length} 种类型`);
    console.log(`📊 难度分布: ${data.difficultyDistribution.length} 种类型\n`);

    console.log('🎉 Phase 2.1 (Dashboard) 部分验收通过!\n');
    console.log('🌐 访问 Dashboard 页面:');
    console.log(`   ${BASE_URL}/keywords\n`);
  } catch (error: any) {
    console.error('❌ 测试失败:', error.message);
    console.error('   请确保开发服务器正在运行 (npm run dev)');
  }
}

testDashboard();
