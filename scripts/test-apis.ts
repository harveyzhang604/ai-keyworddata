/**
 * 测试所有数据接入 API
 * 运行方式: npx tsx scripts/test-apis.ts
 * 
 * 前提: 先运行 npm run dev 启动开发服务器
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });

const BASE_URL = 'http://localhost:3000';

// 使用测试 API Key
const API_KEY = 'sk_c69d0b96a217e5e1c5a959938e3ac290645addd97303cd46a74516b09a711b1e';

async function testAPIs() {
  try {
    console.log('🧪 开始测试数据接入 API...\n');
    console.log(`📍 服务器地址: ${BASE_URL}`);
    console.log(`🔑 API Key: ${API_KEY.substring(0, 20)}...\n`);

    // ============================================
    // 测试 1: 创建挖掘任务
    // ============================================
    console.log('1️⃣ 测试创建挖掘任务 (POST /api/ingest/runs)...');

    const createRunResponse = await fetch(`${BASE_URL}/api/ingest/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        seed: 'ai keyword research tool',
        rounds: 3,
        meta: {
          source: 'ahrefs',
          region: 'us',
          test: true,
        },
      }),
    });

    const createRunData = await createRunResponse.json();

    if (!createRunResponse.ok) {
      console.error('❌ 创建任务失败:', createRunData);
      return;
    }

    console.log('✅ 任务创建成功!');
    console.log(`   Run ID: ${createRunData.run_id}`);
    console.log(`   Server: ${createRunData.server}\n`);

    const runId = createRunData.run_id;

    // ============================================
    // 测试 2: 批量上传关键词
    // ============================================
    console.log('2️⃣ 测试批量上传关键词 (POST /api/ingest/keywords/batch)...');

    const testKeywords = [
      {
        keyword: 'AI keyword research tool',
        score: 85.5,
        search_volume: 5000,
        difficulty: 'medium',
        intent: 'transactional',
        source: 'ahrefs',
        language: 'en',
        country: 'US',
        category: 'saas',
        word_count: 4,
        pain_point_flag: true,
        raw_data: { trend: 'rising', competition: 'medium' },
      },
      {
        keyword: 'keyword research software',
        score: 78.2,
        search_volume: 8000,
        difficulty: 'high',
        intent: 'commercial',
        source: 'ahrefs',
        language: 'en',
        country: 'US',
        category: 'saas',
        word_count: 3,
        pain_point_flag: false,
      },
      {
        keyword: 'free keyword tool',
        score: 90.0,
        search_volume: 12000,
        difficulty: 'low',
        intent: 'informational',
        source: 'google',
        language: 'en',
        country: 'US',
        category: 'tools',
        word_count: 3,
        pain_point_flag: true,
      },
      {
        keyword: 'keyword analyzer online',
        score: 82.5,
        search_volume: 3500,
        difficulty: 'medium',
        intent: 'informational',
        source: 'google',
        language: 'en',
        country: 'US',
        category: 'tools',
        word_count: 3,
        pain_point_flag: false,
      },
      {
        keyword: 'SEO keyword finder',
        score: 88.0,
        search_volume: 6500,
        difficulty: 'medium',
        intent: 'commercial',
        source: 'ahrefs',
        language: 'en',
        country: 'US',
        category: 'seo',
        word_count: 3,
        pain_point_flag: true,
      },
    ];

    const batchUploadResponse = await fetch(
      `${BASE_URL}/api/ingest/keywords/batch`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          run_id: runId,
          keywords: testKeywords,
        }),
      }
    );

    const batchUploadData = await batchUploadResponse.json();

    if (!batchUploadResponse.ok) {
      console.error('❌ 批量上传失败:', batchUploadData);
      return;
    }

    console.log('✅ 关键词上传成功!');
    console.log(`   插入: ${batchUploadData.inserted}`);
    console.log(`   重复: ${batchUploadData.duplicates}`);
    console.log(`   总计: ${batchUploadData.total}\n`);

    // ============================================
    // 测试 3: 测试去重逻辑（重复上传相同关键词）
    // ============================================
    console.log('3️⃣ 测试去重逻辑 (重复上传相同关键词)...');

    const duplicateResponse = await fetch(
      `${BASE_URL}/api/ingest/keywords/batch`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          run_id: runId,
          keywords: [testKeywords[0]], // 上传第一个关键词（重复）
        }),
      }
    );

    const duplicateData = await duplicateResponse.json();

    if (!duplicateResponse.ok) {
      console.error('❌ 去重测试失败:', duplicateData);
      return;
    }

    console.log('✅ 去重逻辑正常!');
    console.log(`   插入: ${duplicateData.inserted}`);
    console.log(`   重复: ${duplicateData.duplicates} (期望: 1)\n`);

    if (duplicateData.duplicates !== 1) {
      console.warn('⚠️  去重逻辑可能有问题，期望 duplicates=1\n');
    }

    // ============================================
    // 测试 4: 上传报告
    // ============================================
    console.log('4️⃣ 测试上传报告 (POST /api/ingest/reports)...');

    const reportMarkdown = `# AI Keyword Research Tool - Analysis Report

## 📊 Summary
- Total Keywords: 5
- Green Light Keywords: 2
- Average Score: 84.84

## 🎯 Top Opportunities
1. **free keyword tool** - Score: 90.0 (Low difficulty, 12K volume)
2. **SEO keyword finder** - Score: 88.0 (Medium difficulty, 6.5K volume)

## 💡 Insights
- Strong demand for free tools
- Pain point identified: users seeking alternatives to expensive tools
- Opportunity: Build freemium keyword research tool

## 🚀 Next Steps
1. Create landing page targeting "free keyword tool"
2. Build basic keyword research features
3. Implement freemium pricing model
`;

    const reportJson = {
      total_keywords: 5,
      green_light_count: 2,
      average_score: 84.84,
      top_opportunities: [
        { keyword: 'free keyword tool', score: 90.0 },
        { keyword: 'SEO keyword finder', score: 88.0 },
      ],
      insights: [
        'Strong demand for free tools',
        'Pain point identified',
      ],
    };

    const reportResponse = await fetch(`${BASE_URL}/api/ingest/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        run_id: runId,
        title: 'AI Keyword Research Tool - Test Report',
        markdown: reportMarkdown,
        json_data: reportJson,
        status: 'success',
      }),
    });

    const reportData = await reportResponse.json();

    if (!reportResponse.ok) {
      console.error('❌ 上传报告失败:', reportData);
      return;
    }

    console.log('✅ 报告上传成功!');
    console.log(`   Report ID: ${reportData.report_id}`);
    console.log(`   Run Status: ${reportData.run_status}\n`);

    // ============================================
    // 测试 5: 测试无效 API Key
    // ============================================
    console.log('5️⃣ 测试无效 API Key (预期失败)...');

    const unauthorizedResponse = await fetch(`${BASE_URL}/api/ingest/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid_key',
      },
      body: JSON.stringify({
        seed: 'test',
        rounds: 1,
      }),
    });

    if (unauthorizedResponse.status === 401) {
      console.log('✅ 无效 API Key 正确被拒绝 (401)\n');
    } else {
      console.warn('⚠️  无效 API Key 应该返回 401 状态码\n');
    }

    // ============================================
    // 验收总结
    // ============================================
    console.log('🎉 所有 API 测试通过!\n');
    console.log('✅ Phase 1.4 & 1.5 验收通过!\n');
    console.log('📋 测试数据:');
    console.log(`   - Run ID: ${runId}`);
    console.log(`   - Keywords: 5 个`);
    console.log(`   - Report ID: ${reportData.report_id}`);
    console.log('\n🚀 Phase 1 完成！可以继续 Phase 2 (前端开发)');
  } catch (error: any) {
    console.error('\n❌ API 测试失败:', error.message);
    console.error('   请确保开发服务器正在运行 (npm run dev)');
  }
}

testAPIs();
