import 'dotenv/config';

/**
 * 测试关键词详情页 API
 */
async function testKeywordDetail() {
  const baseUrl = 'http://localhost:3001';
  const keywordId = 1; // 测试第一个关键词

  console.log('\n🧪 开始测试关键词详情页 API...\n');

  try {
    // 测试 GET /api/keywords/[id]
    console.log(`📝 测试 GET /api/keywords/${keywordId}`);
    const response = await fetch(`${baseUrl}/api/keywords/${keywordId}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log('\n✅ API 响应成功！');
    console.log('\n📊 关键词信息:');
    console.log(`  - ID: ${data.keyword.id}`);
    console.log(`  - 关键词: ${data.keyword.keyword}`);
    console.log(`  - 得分: ${data.keyword.latest_score}`);
    console.log(`  - 搜索量: ${data.keyword.latest_volume}`);
    console.log(`  - 难度: ${data.keyword.latest_difficulty}`);
    console.log(`  - 意图: ${data.keyword.latest_intent}`);
    console.log(`  - 绿灯词: ${data.keyword.latest_is_green_light ? '是' : '否'}`);
    console.log(`  - 止痛药: ${data.keyword.latest_is_painkiller ? '是' : '否'}`);
    console.log(`  - 观察次数: ${data.keyword.observation_count}`);

    console.log('\n📈 历史趋势:');
    console.log(`  - 数据点数: ${data.history.length}`);
    if (data.history.length > 0) {
      console.log(`  - 最早: ${data.history[0].date}`);
      console.log(`  - 最新: ${data.history[data.history.length - 1].date}`);
    }

    console.log('\n📝 观察记录:');
    console.log(`  - 记录数: ${data.observations.length}`);
    if (data.observations.length > 0) {
      console.log(`  - 最新观察: ${data.observations[0].observed_at}`);
    }

    console.log('\n📄 相关报告:');
    console.log(`  - 报告数: ${data.reports.length}`);

    console.log('\n💬 备注历史:');
    console.log(`  - 备注数: ${data.notes.length}`);

    console.log('\n🎉 关键词详情页 API 测试完成！');
    console.log(`\n🌐 访问页面: ${baseUrl}/keywords/${keywordId}`);
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    process.exit(1);
  }
}

testKeywordDetail();
