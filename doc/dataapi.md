# AI 关键词挖掘系统 - API 接口文档

服务器端数据接入完整指南 - 关键词挖掘系统 API

---

## 概述

本系统提供 3 个核心 API 端点，用于服务器端上传关键词挖掘数据：

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/ingest/runs` | 创建挖掘任务 |
| POST | `/api/ingest/keywords/batch` | 批量上传关键词 |
| POST | `/api/ingest/reports` | 上传分析报告 |

---

## 🔐 认证

所有 API 请求必须在请求头中包含 API Key，支持两种格式：

**方式一（推荐）：**
```
X-API-Key: kwd_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**方式二：**
```
Authorization: Bearer kwd_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **注意**: 
> - API Key 前缀为 `kwd_live_`
> - 请联系系统管理员获取 API Key
> - 每个服务器应使用独立的 API Key

---

## API 接口

### 1. 创建挖掘任务

**POST** `/api/ingest/runs`

创建新的关键词挖掘任务，返回 `run_id` 用于后续数据上传。

#### 请求体

```json
{
  "seed": "ai tools",
  "rounds": 3,
  "meta": {
    "source": "ahrefs",
    "region": "us",
    "api_version": "v3"
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `seed` | string | ✅ | 种子关键词 |
| `rounds` | number | ❌ | 挖掘轮数，默认 1 |
| `meta` | object | ❌ | 元数据 (JSON)，可存储任意扩展信息 |

#### 响应

```json
{
  "success": true,
  "run_id": 123,
  "message": "Mining run created successfully",
  "server": "US-Server-01"
}
```

> **重要**: 请保存返回的 `run_id`，后续上传关键词和报告时需要使用。

#### cURL 示例

```bash
curl -X POST https://your-domain.com/api/ingest/runs \
  -H "Content-Type: application/json" \
  -H "X-API-Key: kwd_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "seed": "ai tools",
    "rounds": 3,
    "meta": {"source": "ahrefs", "region": "us"}
  }'
```

#### Python 示例

```python
import requests

API_BASE = "https://your-domain.com"
API_KEY = "kwd_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

headers = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY
}

data = {
    "seed": "ai tools",
    "rounds": 3,
    "meta": {"source": "ahrefs", "region": "us"}
}

response = requests.post(f"{API_BASE}/api/ingest/runs", json=data, headers=headers)
result = response.json()

if result["success"]:
    run_id = result["run_id"]
    print(f"任务创建成功，run_id: {run_id}")
else:
    print(f"错误: {result['error']}")
```

---

### 2. 批量上传关键词

**POST** `/api/ingest/keywords/batch`

批量上传关键词及其观察数据。

#### 请求体

```json
{
  "run_id": 123,
  "keywords": [
    {
      "keyword": "ai keyword tool",
      "score": 85.5,
      "search_volume": 8100,
      "difficulty": "medium",
      "intent": "commercial",
      "source": "ahrefs",
      "language": "en",
      "country": "US",
      "category": "ai-tools",
      "word_count": 3,
      "pain_point_flag": false,
      "raw_data": {
        "cpc": 2.5,
        "competition": 0.65,
        "trend": "stable",
        "serp_features": ["featured_snippet", "people_also_ask"],
        "related_queries": ["best ai tools", "ai writing tools"]
      }
    }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `run_id` | number | ✅ | 任务 ID（从创建任务接口获取） |
| `keywords` | array | ✅ | 关键词数组 |

#### 关键词对象字段

| 字段 | 类型 | 必填 | 说明 | 存储位置 |
|------|------|------|------|----------|
| `keyword` | string | ✅ | 关键词文本 | keywords 表 |
| `score` | number | ❌ | 综合得分 (0-100) | observations 表 |
| `search_volume` | number | ❌ | 月搜索量 | observations 表 |
| `difficulty` | string | ❌ | 难度: `low`, `medium`, `high` | observations 表 |
| `intent` | string | ❌ | 意图: `informational`, `navigational`, `commercial`, `transactional` | observations 表 |
| `source` | string | ❌ | 数据来源: `ahrefs`, `semrush`, `google` 等 | observations 表 |
| `word_count` | number | ❌ | 词数 | observations 表 |
| `pain_point_flag` | boolean | ❌ | 是否为痛点词，默认 false | observations 表 |
| `language` | string | ❌ | 语言代码 (如 `en`) | keywords 表 |
| `country` | string | ❌ | 国家代码 (如 `US`) | keywords 表 |
| `category` | string | ❌ | 分类标签 | keywords 表 |
| `raw_data` | object | ❌ | **原始数据 (JSON)，用于存储任意扩展字段** | observations 表 |

> **提示**: `cpc`, `competition`, `trend`, `serp_features`, `related_queries` 等扩展字段请放入 `raw_data` 对象中，系统会完整保存。

#### 响应

```json
{
  "success": true,
  "inserted": 98,
  "duplicates": 2,
  "total": 100,
  "message": "Keywords uploaded successfully"
}
```

| 响应字段 | 说明 |
|----------|------|
| `inserted` | 成功插入的新关键词数 |
| `duplicates` | 跳过的重复关键词数（同一 run_id 下相同关键词） |
| `total` | 请求中的关键词总数 |

#### 去重逻辑

1. **关键词去重**: 基于标准化关键词 (`keyword_norm` = 小写 + 去多余空格)
2. **观察记录去重**: 同一 `run_id` 下相同关键词不会重复插入
3. **跨任务不去重**: 不同 `run_id` 可以有相同关键词的不同观察数据

#### Python 批量上传示例

```python
import requests
import time

API_BASE = "https://your-domain.com"
API_KEY = "kwd_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

headers = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY
}

# 假设已有 run_id
run_id = 123

# 准备关键词数据
keywords = [
    {
        "keyword": "ai keyword tool",
        "score": 85.5,
        "search_volume": 8100,
        "difficulty": "medium",
        "intent": "commercial",
        "source": "ahrefs",
        "word_count": 3,
        "raw_data": {
            "cpc": 2.5,
            "competition": 0.65,
            "trend": "stable"
        }
    },
    {
        "keyword": "best ai tools 2026",
        "score": 92.0,
        "search_volume": 12000,
        "difficulty": "low",
        "intent": "informational"
    }
]

# 批量上传（建议每批 100-500 个）
batch_size = 100
for i in range(0, len(keywords), batch_size):
    batch = keywords[i:i+batch_size]
    
    data = {
        "run_id": run_id,
        "keywords": batch
    }
    
    response = requests.post(
        f"{API_BASE}/api/ingest/keywords/batch",
        json=data,
        headers=headers
    )
    result = response.json()
    
    if result["success"]:
        print(f"批次 {i//batch_size + 1}: 插入 {result['inserted']} 个，重复 {result['duplicates']} 个")
    else:
        print(f"错误: {result['error']}")
    
    time.sleep(0.5)  # 避免请求过快
```

---

### 3. 上传分析报告

**POST** `/api/ingest/reports`

上传分析报告并更新任务状态为完成。

#### 请求体

```json
{
  "run_id": 123,
  "title": "AI Tools 挖掘报告 - 2026-02-01",
  "markdown": "# 分析报告\n\n## 📊 统计概览\n- 总关键词数: 500\n- 高价值机会: 50\n\n## 🎯 TOP 10 机会\n...",
  "json_data": {
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
  },
  "status": "success"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `run_id` | number | ✅ | 任务 ID |
| `title` | string | ❌ | 报告标题，默认为 `Mining Report - Run {run_id}` |
| `markdown` | string | ❌ | 报告内容 (Markdown 格式) |
| `json_data` | object | ❌ | 结构化数据 (JSON) |
| `status` | string | ❌ | 任务最终状态: `success` 或 `failed`，默认 `success` |

#### 响应

```json
{
  "success": true,
  "report_id": 456,
  "run_status": "success",
  "message": "Report uploaded successfully"
}
```

> **注意**: 上传报告后，系统会自动更新任务状态 (`status`) 和结束时间 (`ended_at`)。

#### Python 报告生成示例

```python
import requests
from datetime import datetime

API_BASE = "https://your-domain.com"
API_KEY = "kwd_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

headers = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY
}

# 假设已有 run_id 和分析数据
run_id = 123
total_keywords = 500
high_opportunity = 50
avg_score = 75.5
top_keywords = [
    {"keyword": "best ai tools 2026", "score": 95.0, "reason": "High volume, low competition"},
    {"keyword": "ai writing assistant", "score": 90.5, "reason": "Growing trend"}
]

# 生成 Markdown 报告
markdown_report = f"""# AI Tools 关键词挖掘报告

**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M')}

## 📊 统计概览
- 总关键词数: {total_keywords}
- 高价值机会: {high_opportunity}
- 平均得分: {avg_score}

## 🎯 TOP 10 机会

| 排名 | 关键词 | 得分 | 原因 |
|------|--------|------|------|
""" + "\n".join([f"| {i+1} | {kw['keyword']} | {kw['score']} | {kw['reason']} |" for i, kw in enumerate(top_keywords)])

# 生成 JSON 结构化数据
report_json = {
    "summary": {
        "total_keywords": total_keywords,
        "high_opportunity": high_opportunity,
        "avg_score": avg_score
    },
    "top_keywords": top_keywords
}

# 上传报告
data = {
    "run_id": run_id,
    "title": f"AI Tools 挖掘报告 - {datetime.now().strftime('%Y-%m-%d')}",
    "markdown": markdown_report,
    "json_data": report_json,
    "status": "success"
}

response = requests.post(f"{API_BASE}/api/ingest/reports", json=data, headers=headers)
result = response.json()

if result["success"]:
    print(f"报告上传成功，report_id: {result['report_id']}")
else:
    print(f"错误: {result['error']}")
```

---

## ⚠️ 错误处理

所有接口在失败时返回以下格式：

```json
{
  "success": false,
  "error": "错误描述",
  "details": "详细信息（可选）"
}
```

### 常见错误

| 状态码 | 错误类型 | 说明 | 解决方法 |
|--------|----------|------|----------|
| 401 | Unauthorized | API Key 无效或缺失 | 检查 API Key 是否正确，是否在请求头中 |
| 400 | Bad Request | 请求参数错误或缺失必填字段 | 检查 `seed`、`run_id`、`keywords` 等必填字段 |
| 404 | Not Found | run_id 不存在或不属于当前服务器 | 确认 run_id 是否正确，是否由当前 API Key 创建 |
| 500 | Internal Server Error | 服务器内部错误 | 检查请求体格式，联系管理员 |

### 错误处理建议

```python
import requests
import time

def safe_request(url, data, headers, max_retries=3):
    """带重试的安全请求"""
    for attempt in range(max_retries):
        try:
            response = requests.post(url, json=data, headers=headers, timeout=30)
            result = response.json()
            
            if response.status_code == 200 or response.status_code == 201:
                return result
            elif response.status_code == 401:
                raise Exception("API Key 无效，请检查配置")
            elif response.status_code == 500:
                # 服务器错误，等待后重试
                time.sleep(2 ** attempt)
                continue
            else:
                return result
                
        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
                continue
            raise
    
    raise Exception(f"请求失败，已重试 {max_retries} 次")
```

---

## 🔄 完整工作流示例

完整的关键词挖掘和上传流程：

```python
import requests
from datetime import datetime
import time

# ========== 配置 ==========
API_KEY = "kwd_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
BASE_URL = "https://your-domain.com/api/ingest"

headers = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY
}

# ========== 步骤 1: 创建挖掘任务 ==========
print("步骤 1: 创建挖掘任务...")

run_data = {
    "seed": "ai keyword research tool",
    "rounds": 3,
    "meta": {
        "source": "ahrefs",
        "region": "us",
        "script_version": "v2.0"
    }
}

response = requests.post(f"{BASE_URL}/runs", json=run_data, headers=headers)
result = response.json()

if not result["success"]:
    print(f"❌ 任务创建失败: {result['error']}")
    exit(1)

run_id = result["run_id"]
print(f"✅ 任务创建成功，run_id: {run_id}")

# ========== 步骤 2: 执行关键词挖掘（你的挖掘逻辑） ==========
print("\n步骤 2: 执行关键词挖掘...")

# 这里是你的挖掘逻辑，返回关键词列表
def perform_keyword_mining(seed):
    # 示例数据，实际替换为你的挖掘逻辑
    return [
        {"keyword": "ai keyword tool", "score": 85.5, "search_volume": 8100, "difficulty": "medium", "intent": "commercial"},
        {"keyword": "best ai tools 2026", "score": 92.0, "search_volume": 12000, "difficulty": "low", "intent": "informational"},
        # ... 更多关键词
    ]

keywords_data = perform_keyword_mining("ai keyword research tool")
print(f"✅ 挖掘完成，共 {len(keywords_data)} 个关键词")

# ========== 步骤 3: 批量上传关键词 ==========
print(f"\n步骤 3: 批量上传关键词...")

batch_size = 100
total_inserted = 0
total_duplicates = 0

for i in range(0, len(keywords_data), batch_size):
    batch = keywords_data[i:i+batch_size]
    
    batch_data = {
        "run_id": run_id,
        "keywords": batch
    }
    
    response = requests.post(f"{BASE_URL}/keywords/batch", json=batch_data, headers=headers)
    result = response.json()
    
    if result["success"]:
        total_inserted += result["inserted"]
        total_duplicates += result["duplicates"]
        print(f"  ✅ 批次 {i//batch_size + 1}: 插入 {result['inserted']} 个")
    else:
        print(f"  ❌ 批次 {i//batch_size + 1} 失败: {result['error']}")
    
    time.sleep(0.5)  # 避免请求过快

print(f"✅ 上传完成: 插入 {total_inserted} 个，重复 {total_duplicates} 个")

# ========== 步骤 4: 生成并上传分析报告 ==========
print("\n步骤 4: 生成并上传分析报告...")

# 计算统计数据
high_score_keywords = [kw for kw in keywords_data if kw.get("score", 0) >= 80]
avg_score = sum(kw.get("score", 0) for kw in keywords_data) / len(keywords_data) if keywords_data else 0

# 构建报告
report_data = {
    "run_id": run_id,
    "title": f"AI Keyword Research - {datetime.now().strftime('%Y-%m-%d')}",
    "markdown": f"""# 挖掘报告

## 统计概览
- 总关键词数: {len(keywords_data)}
- 高分关键词 (≥80): {len(high_score_keywords)}
- 平均得分: {avg_score:.1f}

## TOP 10 机会
(详见 JSON 数据)
""",
    "json_data": {
        "summary": {
            "total_keywords": len(keywords_data),
            "high_score_count": len(high_score_keywords),
            "avg_score": round(avg_score, 2)
        },
        "top_keywords": sorted(keywords_data, key=lambda x: x.get("score", 0), reverse=True)[:10]
    },
    "status": "success"
}

response = requests.post(f"{BASE_URL}/reports", json=report_data, headers=headers)
result = response.json()

if result["success"]:
    print(f"✅ 报告上传成功，report_id: {result['report_id']}")
else:
    print(f"❌ 报告上传失败: {result['error']}")

print("\n🎉 完整工作流执行成功！")
```

---

## 💡 最佳实践

### 数据上传

1. **批量上传**: 每批 100-500 个关键词，避免单次请求过大
2. **请求间隔**: 批次之间添加 500ms 延迟，避免触发速率限制
3. **错误重试**: 使用 try-except 捕获网络错误，实现自动重试
4. **保存 run_id**: 必须保存，后续上传关键词和报告都需要

### 数据质量

5. **关键词去空格**: 系统会自动标准化，但建议上传前清理
6. **扩展字段用 raw_data**: `cpc`、`competition`、`trend` 等字段放入 `raw_data`
7. **提供 score**: 虽然可选，但强烈建议计算并提供综合得分

### 报告生成

8. **双格式报告**: 同时提供 `markdown` 和 `json_data`，便于展示和分析
9. **明确 status**: 任务成功设为 `success`，失败设为 `failed`

---

## 数据库表结构参考

### 1. mining_servers (服务器)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | SERIAL | 主键，自动关联到任务 |
| `name` | VARCHAR(255) | 服务器名称 |
| `region` | VARCHAR(100) | 地区 |
| `api_key_hash` | VARCHAR(255) | API Key 哈希（SHA256） |

---

### 2. mining_runs (挖掘任务)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | SERIAL | 主键，即 `run_id` |
| `miner_id` | INTEGER | 自动关联服务器 ID（通过 API Key） |
| `seed` | VARCHAR(255) | 种子关键词 |
| `rounds` | INTEGER | 挖掘轮次 |
| `status` | VARCHAR(50) | 状态: `running` → `success`/`failed` |
| `started_at` | TIMESTAMP | 创建时自动设置 |
| `ended_at` | TIMESTAMP | 上传报告时自动设置 |
| `meta_json` | TEXT | 存储 `meta` 对象的 JSON 字符串 |

---

### 3. keywords (关键词主表)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | SERIAL | 主键，关键词 ID |
| `keyword` | VARCHAR(255) | 原始关键词 |
| `keyword_norm` | VARCHAR(255) | 标准化关键词（唯一索引，用于去重） |
| `language` | VARCHAR(20) | 语言 |
| `country` | VARCHAR(100) | 国家 |
| `category` | VARCHAR(100) | 分类 |
| `first_seen_at` | TIMESTAMP | 首次发现时间 |
| `last_seen_at` | TIMESTAMP | 最后发现时间（每次插入更新） |

---

### 4. keyword_observations (观察数据)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | SERIAL | 主键 |
| `keyword_id` | INTEGER | 关联关键词 ID |
| `run_id` | INTEGER | 关联任务 ID |
| `source` | VARCHAR(100) | 数据来源 |
| `score` | DECIMAL(5,2) | 综合得分 |
| `search_volume` | INTEGER | 搜索量 |
| `difficulty` | VARCHAR(20) | 难度 |
| `intent` | VARCHAR(255) | 搜索意图 |
| `word_count` | INTEGER | 词数 |
| `pain_point_flag` | BOOLEAN | 痛点标识 |
| `raw_json` | TEXT | **存储 `raw_data` 对象的 JSON 字符串** |

---

### 5. keyword_reports (分析报告)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | SERIAL | 主键，即 `report_id` |
| `run_id` | INTEGER | 关联任务 ID |
| `title` | VARCHAR(255) | 报告标题 |
| `report_markdown` | TEXT | 存储 `markdown` 内容 |
| `report_json` | TEXT | 存储 `json_data` 的 JSON 字符串 |

---

## 使用流程图

```mermaid
sequenceDiagram
    participant Server as 挖掘服务器
    participant API as API 服务
    participant DB as 数据库

    Note over Server: 开始挖掘流程
    
    Server->>API: POST /api/ingest/runs
    Note right of Server: {seed, rounds, meta}
    API->>DB: INSERT mining_runs (status='running')
    API-->>Server: {success: true, run_id: 123}
    
    Note over Server: 保存 run_id ⚠️

    loop 批量上传 (每批 100-500 个)
        Server->>API: POST /api/ingest/keywords/batch
        Note right of Server: {run_id: 123, keywords: [...]}
        API->>DB: UPSERT keywords + INSERT observations
        API-->>Server: {inserted: N, duplicates: M}
    end

    Server->>API: POST /api/ingest/reports
    Note right of Server: {run_id, title, markdown, json_data, status}
    API->>DB: INSERT report
    API->>DB: UPDATE mining_runs (status, ended_at)
    API-->>Server: {report_id: 456, run_status: 'success'}
    
    Note over Server: ✅ 流程完成
```
