/**
 * API 文档页面
 * 详细说明服务器数据接入 API
 */
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { 
  CodeIcon, 
  ServerIcon, 
  CheckCircleIcon,
  AlertCircleIcon,
  CopyIcon,
  BookOpenIcon,
} from 'lucide-react';

export default function ApiDocsPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* 头部 */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <BookOpenIcon className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">API 文档</h1>
        </div>
        <p className="text-xl text-muted-foreground">
          服务器端数据接入完整指南 - 关键词挖掘系统 API
        </p>
      </div>

      {/* 概述 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ServerIcon className="h-5 w-5" />
            概述
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            本系统提供 3 个核心 API 端点，用于服务器端上传关键词挖掘数据：
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-700">POST</Badge>
              <p className="font-mono text-sm">/api/ingest/runs</p>
              <p className="text-xs text-muted-foreground">创建挖掘任务</p>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <Badge variant="outline" className="bg-green-100 text-green-700">POST</Badge>
              <p className="font-mono text-sm">/api/ingest/keywords/batch</p>
              <p className="text-xs text-muted-foreground">批量上传关键词</p>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <Badge variant="outline" className="bg-purple-100 text-purple-700">POST</Badge>
              <p className="font-mono text-sm">/api/ingest/reports</p>
              <p className="text-xs text-muted-foreground">上传分析报告</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 认证 */}
      <Card>
        <CardHeader>
          <CardTitle>🔐 认证</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            所有 API 请求必须在请求头中包含 API Key：
          </p>
          <div className="bg-muted p-4 rounded-lg font-mono text-sm">
            <div className="flex justify-between items-center">
              <code>X-API-Key: your_api_key_here</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard('X-API-Key: your_api_key_here', 'auth')}
              >
                {copiedEndpoint === 'auth' ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <CopyIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex items-start gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">API Key 管理</p>
              <p>请联系系统管理员获取 API Key。每个服务器应使用独立的 API Key。</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API 端点详情 */}
      <Tabs defaultValue="runs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="runs">创建任务</TabsTrigger>
          <TabsTrigger value="keywords">上传关键词</TabsTrigger>
          <TabsTrigger value="reports">上传报告</TabsTrigger>
        </TabsList>

        {/* 1. 创建挖掘任务 */}
        <TabsContent value="runs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>POST /api/ingest/runs</CardTitle>
                <Badge variant="outline" className="bg-blue-100 text-blue-700">POST</Badge>
              </div>
              <p className="text-sm text-muted-foreground">创建新的关键词挖掘任务</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 请求体 */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <CodeIcon className="h-4 w-4" />
                  请求体
                </h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`{
  "server_id": 1,           // 服务器 ID (必填)
  "seed": "ai tools",       // 种子关键词 (必填)
  "rounds": 3,              // 挖掘轮数 (必填)
  "status": "running",      // 状态: running/success/failed (必填)
  "started_at": "2026-02-01T10:00:00Z",  // 开始时间 (必填)
  "ended_at": null,         // 结束时间 (可选)
  "meta": {                 // 元数据 (可选)
    "source": "ahrefs",
    "region": "us",
    "api_version": "v3"
  }
}`}</pre>
                </div>
              </div>

              {/* 响应示例 */}
              <div className="space-y-2">
                <h3 className="font-semibold">响应示例</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`{
  "success": true,
  "run_id": 123,
  "message": "挖掘任务创建成功"
}`}</pre>
                </div>
              </div>

              {/* cURL 示例 */}
              <div className="space-y-2">
                <h3 className="font-semibold">cURL 示例</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto relative">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(
                      `curl -X POST http://localhost:3000/api/ingest/runs \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key_here" \\
  -d '{
    "server_id": 1,
    "seed": "ai tools",
    "rounds": 3,
    "status": "running",
    "started_at": "2026-02-01T10:00:00Z"
  }'`,
                      'runs-curl'
                    )}
                  >
                    {copiedEndpoint === 'runs-curl' ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )}
                  </Button>
                  <pre>{`curl -X POST http://localhost:3000/api/ingest/runs \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key_here" \\
  -d '{
    "server_id": 1,
    "seed": "ai tools",
    "rounds": 3,
    "status": "running",
    "started_at": "2026-02-01T10:00:00Z"
  }'`}</pre>
                </div>
              </div>

              {/* Python 示例 */}
              <div className="space-y-2">
                <h3 className="font-semibold">Python 示例</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto relative">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(
                      `import requests
from datetime import datetime

url = "http://localhost:3000/api/ingest/runs"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "your_api_key_here"
}
data = {
    "server_id": 1,
    "seed": "ai tools",
    "rounds": 3,
    "status": "running",
    "started_at": datetime.utcnow().isoformat() + "Z"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`,
                      'runs-python'
                    )}
                  >
                    {copiedEndpoint === 'runs-python' ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )}
                  </Button>
                  <pre>{`import requests
from datetime import datetime

url = "http://localhost:3000/api/ingest/runs"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "your_api_key_here"
}
data = {
    "server_id": 1,
    "seed": "ai tools",
    "rounds": 3,
    "status": "running",
    "started_at": datetime.utcnow().isoformat() + "Z"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. 批量上传关键词 */}
        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>POST /api/ingest/keywords/batch</CardTitle>
                <Badge variant="outline" className="bg-green-100 text-green-700">POST</Badge>
              </div>
              <p className="text-sm text-muted-foreground">批量上传关键词观察数据</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 请求体 */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <CodeIcon className="h-4 w-4" />
                  请求体
                </h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`{
  "run_id": 123,           // 任务 ID (必填)
  "keywords": [            // 关键词数组 (必填)
    {
      "keyword": "ai keyword tool",     // 关键词 (必填)
      "search_volume": 8100,            // 搜索量 (必填)
      "difficulty": "medium",           // 难度: low/medium/high (必填)
      "intent": "commercial",           // 意图: info/nav/commercial/trans (必填)
      "cpc": 2.5,                       // 每次点击成本 (可选)
      "competition": 0.65,              // 竞争度 0-1 (可选)
      "trend": "stable",                // 趋势: up/down/stable (可选)
      "score": 85.5,                    // 综合得分 0-100 (必填)
      "serp_features": ["featured_snippet", "people_also_ask"],  // SERP特征 (可选)
      "related_queries": ["best ai tools", "ai writing tools"],  // 相关查询 (可选)
      "observed_at": "2026-02-01T10:05:00Z"  // 观察时间 (必填)
    }
  ]
}`}</pre>
                </div>
              </div>

              {/* 响应示例 */}
              <div className="space-y-2">
                <h3 className="font-semibold">响应示例</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`{
  "success": true,
  "inserted": 150,
  "failed": 0,
  "message": "成功插入 150 个关键词观察数据"
}`}</pre>
                </div>
              </div>

              {/* Python 批量上传示例 */}
              <div className="space-y-2">
                <h3 className="font-semibold">Python 批量上传示例</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto relative">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(
                      `import requests
from datetime import datetime

url = "http://localhost:3000/api/ingest/keywords/batch"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "your_api_key_here"
}

# 批量上传关键词
keywords = []
for kw_data in your_keyword_list:
    keywords.append({
        "keyword": kw_data["keyword"],
        "search_volume": kw_data["volume"],
        "difficulty": kw_data["difficulty"],
        "intent": kw_data["intent"],
        "score": calculate_score(kw_data),
        "observed_at": datetime.utcnow().isoformat() + "Z"
    })

data = {
    "run_id": run_id,
    "keywords": keywords
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`,
                      'keywords-python'
                    )}
                  >
                    {copiedEndpoint === 'keywords-python' ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )}
                  </Button>
                  <pre>{`import requests
from datetime import datetime

url = "http://localhost:3000/api/ingest/keywords/batch"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "your_api_key_here"
}

# 批量上传关键词
keywords = []
for kw_data in your_keyword_list:
    keywords.append({
        "keyword": kw_data["keyword"],
        "search_volume": kw_data["volume"],
        "difficulty": kw_data["difficulty"],
        "intent": kw_data["intent"],
        "score": calculate_score(kw_data),
        "observed_at": datetime.utcnow().isoformat() + "Z"
    })

data = {
    "run_id": run_id,
    "keywords": keywords
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`}</pre>
                </div>
              </div>

              {/* 字段说明 */}
              <div className="space-y-2">
                <h3 className="font-semibold">字段说明</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">字段</th>
                        <th className="text-left p-2">类型</th>
                        <th className="text-left p-2">必填</th>
                        <th className="text-left p-2">说明</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2 font-mono">difficulty</td>
                        <td className="p-2">string</td>
                        <td className="p-2">✅</td>
                        <td className="p-2">low | medium | high</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">intent</td>
                        <td className="p-2">string</td>
                        <td className="p-2">✅</td>
                        <td className="p-2">informational | navigational | commercial | transactional</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">trend</td>
                        <td className="p-2">string</td>
                        <td className="p-2">❌</td>
                        <td className="p-2">up | down | stable</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">score</td>
                        <td className="p-2">number</td>
                        <td className="p-2">✅</td>
                        <td className="p-2">0-100 综合得分</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. 上传分析报告 */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>POST /api/ingest/reports</CardTitle>
                <Badge variant="outline" className="bg-purple-100 text-purple-700">POST</Badge>
              </div>
              <p className="text-sm text-muted-foreground">上传关键词分析报告</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 请求体 */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <CodeIcon className="h-4 w-4" />
                  请求体
                </h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`{
  "run_id": 123,                    // 任务 ID (必填)
  "title": "AI Tools 挖掘报告",     // 报告标题 (必填)
  "report_markdown": "# 分析报告\\n\\n## TOP 10 机会\\n...",  // Markdown 格式 (可选)
  "report_json": {                  // JSON 格式数据 (可选)
    "summary": {
      "total_keywords": 500,
      "high_opportunity": 50,
      "avg_score": 75.5
    },
    "top_keywords": [
      {
        "keyword": "best ai tools 2026",
        "score": 95.0,
        "reason": "High volume, low competition"
      }
    ]
  }
}`}</pre>
                </div>
              </div>

              {/* 响应示例 */}
              <div className="space-y-2">
                <h3 className="font-semibold">响应示例</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`{
  "success": true,
  "report_id": 456,
  "message": "报告上传成功"
}`}</pre>
                </div>
              </div>

              {/* Python 示例 */}
              <div className="space-y-2">
                <h3 className="font-semibold">Python 报告生成示例</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto relative">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(
                      `import requests
import json

url = "http://localhost:3000/api/ingest/reports"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "your_api_key_here"
}

# 生成 Markdown 报告
markdown_report = f"""
# AI Tools 关键词挖掘报告

## 📊 统计概览
- 总关键词数: {total_keywords}
- 高价值机会: {high_opportunity}
- 平均得分: {avg_score}

## 🎯 TOP 10 机会
{generate_top_10_table(top_keywords)}

## 💡 核心洞察
{generate_insights(keywords_data)}
"""

# 生成 JSON 数据
report_json = {
    "summary": {
        "total_keywords": total_keywords,
        "high_opportunity": high_opportunity,
        "avg_score": avg_score
    },
    "top_keywords": top_keywords,
    "insights": insights
}

data = {
    "run_id": run_id,
    "title": "AI Tools 挖掘报告",
    "report_markdown": markdown_report,
    "report_json": report_json
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`,
                      'reports-python'
                    )}
                  >
                    {copiedEndpoint === 'reports-python' ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )}
                  </Button>
                  <pre>{`import requests
import json

url = "http://localhost:3000/api/ingest/reports"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "your_api_key_here"
}

# 生成 Markdown 报告
markdown_report = f"""
# AI Tools 关键词挖掘报告

## 📊 统计概览
- 总关键词数: {total_keywords}
- 高价值机会: {high_opportunity}
- 平均得分: {avg_score}

## 🎯 TOP 10 机会
{generate_top_10_table(top_keywords)}

## 💡 核心洞察
{generate_insights(keywords_data)}
"""

# 生成 JSON 数据
report_json = {
    "summary": {
        "total_keywords": total_keywords,
        "high_opportunity": high_opportunity,
        "avg_score": avg_score
    },
    "top_keywords": top_keywords,
    "insights": insights
}

data = {
    "run_id": run_id,
    "title": "AI Tools 挖掘报告",
    "report_markdown": markdown_report,
    "report_json": report_json
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 完整工作流示例 */}
      <Card>
        <CardHeader>
          <CardTitle>🔄 完整工作流示例</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            完整的关键词挖掘和上传流程：
          </p>
          <div className="bg-muted p-6 rounded-lg font-mono text-sm overflow-x-auto relative">
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(
                `import requests
from datetime import datetime
import time

API_KEY = "your_api_key_here"
BASE_URL = "http://localhost:3000/api/ingest"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY
}

# 步骤 1: 创建挖掘任务
print("步骤 1: 创建挖掘任务...")
run_data = {
    "server_id": 1,
    "seed": "ai keyword research tool",
    "rounds": 3,
    "status": "running",
    "started_at": datetime.utcnow().isoformat() + "Z",
    "meta": {
        "source": "ahrefs",
        "region": "us"
    }
}
response = requests.post(f"{BASE_URL}/runs", json=run_data, headers=headers)
run_id = response.json()["run_id"]
print(f"✅ 任务创建成功，ID: {run_id}")

# 步骤 2: 执行关键词挖掘（你的挖掘逻辑）
print("\\n步骤 2: 执行关键词挖掘...")
keywords_data = perform_keyword_mining("ai keyword research tool")

# 步骤 3: 批量上传关键词
print(f"\\n步骤 3: 批量上传 {len(keywords_data)} 个关键词...")
batch_size = 100
for i in range(0, len(keywords_data), batch_size):
    batch = keywords_data[i:i+batch_size]
    keywords_batch = []
    for kw in batch:
        keywords_batch.append({
            "keyword": kw["keyword"],
            "search_volume": kw["volume"],
            "difficulty": kw["difficulty"],
            "intent": kw["intent"],
            "score": kw["score"],
            "observed_at": datetime.utcnow().isoformat() + "Z"
        })
    
    batch_data = {
        "run_id": run_id,
        "keywords": keywords_batch
    }
    response = requests.post(f"{BASE_URL}/keywords/batch", json=batch_data, headers=headers)
    print(f"  ✅ 已上传 {len(keywords_batch)} 个关键词")
    time.sleep(0.5)  # 避免请求过快

# 步骤 4: 生成并上传分析报告
print("\\n步骤 4: 生成并上传分析报告...")
report_data = {
    "run_id": run_id,
    "title": f"AI Keyword Research - {datetime.now().strftime('%Y-%m-%d')}",
    "report_markdown": generate_markdown_report(keywords_data),
    "report_json": generate_json_report(keywords_data)
}
response = requests.post(f"{BASE_URL}/reports", json=report_data, headers=headers)
print(f"✅ 报告上传成功，ID: {response.json()['report_id']}")

# 步骤 5: 更新任务状态为完成
print("\\n步骤 5: 更新任务状态...")
update_data = {
    "server_id": 1,
    "seed": "ai keyword research tool",
    "rounds": 3,
    "status": "success",
    "started_at": run_data["started_at"],
    "ended_at": datetime.utcnow().isoformat() + "Z",
    "meta": run_data["meta"]
}
requests.post(f"{BASE_URL}/runs", json=update_data, headers=headers)
print("✅ 任务状态更新完成")

print("\\n🎉 完整工作流执行成功！")`,
                'workflow'
              )}
            >
              {copiedEndpoint === 'workflow' ? (
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
            </Button>
            <pre>{`import requests
from datetime import datetime
import time

API_KEY = "your_api_key_here"
BASE_URL = "http://localhost:3000/api/ingest"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY
}

# 步骤 1: 创建挖掘任务
print("步骤 1: 创建挖掘任务...")
run_data = {
    "server_id": 1,
    "seed": "ai keyword research tool",
    "rounds": 3,
    "status": "running",
    "started_at": datetime.utcnow().isoformat() + "Z",
    "meta": {
        "source": "ahrefs",
        "region": "us"
    }
}
response = requests.post(f"{BASE_URL}/runs", json=run_data, headers=headers)
run_id = response.json()["run_id"]
print(f"✅ 任务创建成功，ID: {run_id}")

# 步骤 2: 执行关键词挖掘（你的挖掘逻辑）
print("\\n步骤 2: 执行关键词挖掘...")
keywords_data = perform_keyword_mining("ai keyword research tool")

# 步骤 3: 批量上传关键词
print(f"\\n步骤 3: 批量上传 {len(keywords_data)} 个关键词...")
batch_size = 100
for i in range(0, len(keywords_data), batch_size):
    batch = keywords_data[i:i+batch_size]
    keywords_batch = []
    for kw in batch:
        keywords_batch.append({
            "keyword": kw["keyword"],
            "search_volume": kw["volume"],
            "difficulty": kw["difficulty"],
            "intent": kw["intent"],
            "score": kw["score"],
            "observed_at": datetime.utcnow().isoformat() + "Z"
        })
    
    batch_data = {
        "run_id": run_id,
        "keywords": keywords_batch
    }
    response = requests.post(f"{BASE_URL}/keywords/batch", json=batch_data, headers=headers)
    print(f"  ✅ 已上传 {len(keywords_batch)} 个关键词")
    time.sleep(0.5)  # 避免请求过快

# 步骤 4: 生成并上传分析报告
print("\\n步骤 4: 生成并上传分析报告...")
report_data = {
    "run_id": run_id,
    "title": f"AI Keyword Research - {datetime.now().strftime('%Y-%m-%d')}",
    "report_markdown": generate_markdown_report(keywords_data),
    "report_json": generate_json_report(keywords_data)
}
response = requests.post(f"{BASE_URL}/reports", json=report_data, headers=headers)
print(f"✅ 报告上传成功，ID: {response.json()['report_id']}")

# 步骤 5: 更新任务状态为完成
print("\\n步骤 5: 更新任务状态...")
update_data = {
    "server_id": 1,
    "seed": "ai keyword research tool",
    "rounds": 3,
    "status": "success",
    "started_at": run_data["started_at"],
    "ended_at": datetime.utcnow().isoformat() + "Z",
    "meta": run_data["meta"]
}
requests.post(f"{BASE_URL}/runs", json=update_data, headers=headers)
print("✅ 任务状态更新完成")

print("\\n🎉 完整工作流执行成功！")`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* 错误处理 */}
      <Card>
        <CardHeader>
          <CardTitle>⚠️ 错误处理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 border rounded-lg">
              <p className="font-semibold text-red-600">401 Unauthorized</p>
              <p className="text-sm text-muted-foreground mt-1">API Key 无效或缺失</p>
              <div className="bg-muted p-2 rounded mt-2 font-mono text-xs">
                {`{"success": false, "error": "Invalid API Key"}`}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="font-semibold text-red-600">400 Bad Request</p>
              <p className="text-sm text-muted-foreground mt-1">请求参数错误或缺失必填字段</p>
              <div className="bg-muted p-2 rounded mt-2 font-mono text-xs">
                {`{"success": false, "error": "Missing required field: keyword"}`}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="font-semibold text-red-600">500 Internal Server Error</p>
              <p className="text-sm text-muted-foreground mt-1">服务器内部错误</p>
              <div className="bg-muted p-2 rounded mt-2 font-mono text-xs">
                {`{"success": false, "error": "Database connection failed"}`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 最佳实践 */}
      <Card>
        <CardHeader>
          <CardTitle>💡 最佳实践</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>批量上传关键词时，建议每批 100-500 个，避免单次请求过大</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>添加适当的请求间隔（如 500ms），避免触发速率限制</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>使用 try-except 捕获网络错误，实现自动重试机制</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>保存 run_id，用于后续关键词上传和报告关联</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>任务完成后，记得更新任务状态为 "success" 或 "failed"</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>报告建议同时提供 Markdown 和 JSON 两种格式，便于展示和数据分析</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
