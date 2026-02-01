# Profit Hunter - 项目需求文档

## 1. 项目概述

本项目旨在构建一个**AI 需求挖掘分析平台**。
**背景**：目前有多台服务器运行 Python 脚本持续挖掘高价值的 AI 关键词（新词）。
**目标**：开发一个基于 Next.js 的分析看板，通过 API 接收各服务器上报的数据，统一存储到 PostgreSQL 数据库，并在前端提供数据分析、筛选、趋势查看及 AI 报告展示功能。

## 2. 系统架构 (MVP)

### 流程

1.  **数据采集 (Miners)**: 分布式 Python 脚本在多台服务器上运行，挖掘关键词。
2.  **数据上报 (Ingestion)**: 脚本通过 API 将数据（Run 信息、关键词数据、AI 报告）推送到 Next.js 后端。
3.  **数据存储 (Storage)**: 后端通过 API 路由接收数据并写入 PostgreSQL 数据库 (Neon)。
4.  **数据展示 (Dashboard)**: Next.js 前端从数据库读取数据，展示看板、图表和报告。

### 技术栈

- **前端/后端**: Next.js 16, Tailwind CSS v4, Better Auth (现有项目架构)
- **数据库**: PostgreSQL (Neon), Drizzle ORM
- **采集端**: Python Scripts (现有)

---

## 3. 数据库设计 (PostgreSQL)

核心包含 6 张表，用于存储服务器信息、挖掘任务、关键词快照及报告。

### 3.1 数据库设计概览

我们需要以下几个核心表：

- **mining_servers**: 存储服务器信息（每台服务器运行数据挖掘任务）
- **mining_runs**: 存储每次数据挖掘任务的信息
- **keywords**: 存储所有关键词的基本信息
- **keyword_observations**: 存储每次对关键词的观察结果
- **keyword_reports**: 存储 AI 生成的报告
- **keyword_notes**: 存储对关键词的手动或 AI 附加注释

### 3.2 表设计详细定义

#### 1. `mining_servers` (服务器信息)

用于记录每台服务器的信息，方便任务追踪和统计。

- **注意**: `api_key_hash` 用于验证任务来源，确保每个任务有一个唯一标识。

```sql
CREATE TABLE mining_servers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,          -- 服务器的名称（例如 racknerd-01）
    region VARCHAR(100),                 -- 可选：服务器的地区
    api_key_hash VARCHAR(255),           -- 每台服务器唯一的 API Key，用于身份验证
    created_at TIMESTAMP DEFAULT NOW(),  -- 记录创建时间
    updated_at TIMESTAMP DEFAULT NOW()   -- 记录更新时间
);
```

#### 2. `mining_runs` (数据挖掘任务)

每次挖掘任务的记录，包括任务的种子、状态、时间等信息。

- **注意**: `meta_json` 字段用来存储与任务相关的其他元数据，例如任务配置或版本信息。

```sql
CREATE TABLE mining_runs (
    id SERIAL PRIMARY KEY,
    miner_id INT REFERENCES mining_servers(id),     -- 关联服务器ID
    seed VARCHAR(255),                               -- 挖掘种子（例如 "flux"）
    rounds INT,                                      -- 挖掘的轮次
    status VARCHAR(50) CHECK (status IN ('running', 'success', 'failed')),  -- 挖掘任务状态
    started_at TIMESTAMP,                            -- 任务开始时间
    ended_at TIMESTAMP,                              -- 任务结束时间
    meta_json JSONB,                                 -- 存储任务的额外信息（如脚本版本、配置）
    created_at TIMESTAMP DEFAULT NOW(),              -- 记录创建时间
    updated_at TIMESTAMP DEFAULT NOW()               -- 记录更新时间
);
```

#### 3. `keywords` (关键词)

存储所有被挖掘出来的关键词信息，包括标准化后的关键词，确保数据的唯一性。

- **注意**: `keyword_norm` 用于去重（例如所有的 "Calculator" 会转成小写的 calculator）。

```sql
CREATE TABLE keywords (
    id SERIAL PRIMARY KEY,
    keyword VARCHAR(255) NOT NULL,                  -- 关键词本身
    keyword_norm VARCHAR(255) NOT NULL UNIQUE,      -- 关键词标准化（小写、去除空格）用于去重
    language VARCHAR(20),                           -- 语言（如：en, zh）
    country VARCHAR(100),                           -- 国家（如：US）
    category VARCHAR(100),                          -- 关键词类别（如：calculator, tool, SEO）
    first_seen_at TIMESTAMP DEFAULT NOW(),         -- 第一次出现时间
    last_seen_at TIMESTAMP DEFAULT NOW(),          -- 最后一次出现时间
    created_at TIMESTAMP DEFAULT NOW(),             -- 记录创建时间
    updated_at TIMESTAMP DEFAULT NOW()              -- 记录更新时间
);
```

#### 4. `keyword_observations` (关键词观察结果)

每次挖掘任务对关键词的观察结果，包括关键词的得分、搜索量、竞争度、用户意图等。

- **注意**: `raw_json` 用于存储原始数据，方便回溯。

```sql
CREATE TABLE keyword_observations (
    id SERIAL PRIMARY KEY,
    keyword_id INT REFERENCES keywords(id),         -- 关联关键词表
    run_id INT REFERENCES mining_runs(id),           -- 关联挖掘任务
    source VARCHAR(100),                             -- 数据来源（如：reddit, serp, internal_tool）
    score DECIMAL(5, 2),                             -- 关键词分数（如：80.8）
    search_volume INT,                               -- 搜索量
    difficulty VARCHAR(20),                          -- 难度（如：low, medium, high）
    intent VARCHAR(255),                             -- 用户意图（如：calculator, convert）
    word_count INT,                                  -- 词汇长度
    pain_point_flag BOOLEAN DEFAULT FALSE,           -- 是否存在痛点
    raw_json JSONB,                                  -- 原始数据字段
    created_at TIMESTAMP DEFAULT NOW(),              -- 记录创建时间
    updated_at TIMESTAMP DEFAULT NOW()               -- 记录更新时间
);
```

#### 5. `keyword_reports` (关键词报告)

存储每次挖掘任务结束后生成的 AI 报告，包括结构化数据和 Markdown 格式的详细报告。

- **注意**: `report_json` 保存结构化的报告内容，可以用于后续分析或显示。

```sql
CREATE TABLE keyword_reports (
    id SERIAL PRIMARY KEY,
    run_id INT REFERENCES mining_runs(id),           -- 关联挖掘任务
    title VARCHAR(255),                               -- 报告标题
    report_markdown TEXT,                             -- 使用Markdown格式的报告正文
    report_json JSONB,                                -- 结构化的报告数据
    created_at TIMESTAMP DEFAULT NOW(),              -- 记录创建时间
    updated_at TIMESTAMP DEFAULT NOW()               -- 记录更新时间
);
```

#### 6. `keyword_notes` (关键词备注)

为每个关键词添加注释或总结，包含 AI 生成的摘要、开发建议、商业价值等。

- **注意**: `type` 字段表示备注的类型，可以包括 AI 总结、开发建议、商业价值、风险分析等。

```sql
CREATE TABLE keyword_notes (
    id SERIAL PRIMARY KEY,
    keyword_id INT REFERENCES keywords(id),         -- 关联关键词表
    run_id INT REFERENCES mining_runs(id),           -- 关联挖掘任务
    type VARCHAR(50) CHECK (type IN ('ai_summary', 'dev_suggestion', 'business_value', 'risk')),  -- 备注类型
    content TEXT,                                    -- 备注内容
    created_at TIMESTAMP DEFAULT NOW(),              -- 记录创建时间
    updated_at TIMESTAMP DEFAULT NOW()               -- 记录更新时间
);
```

---

## 4. 索引与性能优化

- **关键词表索引**: 针对 `keyword_norm` 字段创建索引，以便快速去重和查找。
- **挖掘结果表索引**: 针对 `keyword_id` 和 `run_id` 字段创建联合索引，以便快速查询某个关键词在不同任务中的变化。
- **报告与备注表索引**: 根据 `run_id` 和 `keyword_id` 创建索引，确保查询效率。

```sql
-- 为关键词表创建索引
CREATE INDEX idx_keywords_norm ON keywords(keyword_norm);

-- 为关键词观察表创建联合索引
CREATE INDEX idx_keyword_observations ON keyword_observations(keyword_id, run_id);

-- 为报告和备注表创建索引
CREATE INDEX idx_keyword_reports_run_id ON keyword_reports(run_id);
CREATE INDEX idx_keyword_notes_keyword_id ON keyword_notes(keyword_id);
```

---

## 5. 数据一致性与更新策略

1.  **幂等性**: 通过 `keyword_norm` 字段确保插入的关键词是唯一的，避免重复插入。
2.  **批量插入**: 后端接口应支持批量插入（Bulk Insert）来提高性能，尤其是在处理大量关键词时。

---

## 6. API 接口规范 (Ingestion)

采集端通过以下 API 将数据推送到平台。需要包含鉴权 Header。

### 6.1 创建任务

- **POST** `/api/ingest/runs`
- **Body**: `{ "miner_name": "s1", "seed": "flux", "rounds": 3 }`
- **Response**: `{ "run_id": 123 }`

### 6.2 批量上传关键词 (Stream/Batch)

- **POST** `/api/ingest/keywords/batch`
- **Body**:
  ```json
  {
    "run_id": 123,
    "items": [
      {
        "keyword": "flux ai generator",
        "score": 85.5,
        "vol": 5000,
        "difficulty": "low",
        "intent": "tool",
        "raw": { ... }
      }
    ]
  }
  ```
- **逻辑**: 后端根据 `keyword_norm` 自动判断是插入新词还是仅插入 `observation`。

### 6.3 上传总结报告

- **POST** `/api/ingest/reports`
- **Body**: `{ "run_id": 123, "markdown": "...", "json": { ... } }`

---

## 7. 前端功能需求 (Next.js)

### 7.1 首页 (Dashboard)

- **核心指标**: 关键词总数、近 7 天高分词数量、正在进行的任务数。
- **高优推荐**: 展示 "TOP 5 推荐立即开发" (来自最新 Report 或高分聚合)。
- **图表**: 关键词发现趋势图 (折线), 意图分布 (饼图)。

### 7.2 关键词库 (Keywords)

- **列表视图**: 表格展示。
- **筛选**: Score (>80), Difficulty (Low), Category (SaaS/Tool), Volume。
- **详情模态框**: 点击关键词，展示其历史评分趋势、来源记录、GPT 分析建议。

### 7.3 任务与报告 (Runs & Reports)

- **任务列表**: 查看各服务器的运行状态、成功率。
- **报告详情**: 渲染统一格式的 Markdown 报告，支持一键复制发给团队。

---

## 8. 数据标准化

所有 AI 生成的报告必须遵循以下 Markdown 结构，以便前端统一解析：

```markdown
# 挖掘报告：{Run Name}

- 关键词总数：{Count}
- 来源：{Sources}

## 1. TOP 机会

| rank | keyword | score | difficulty | build_suggestion |
| ---: | ------- | ----- | ---------- | ---------------- |
|    1 | ...     | ...   | ...        | ...              |

## 2. 绿灯词 (BUILD NOW)

| keyword | word_count | business_value |
| ------- | ---------- | -------------- |

## 3. 模式洞察

- Pattern A...
- Pattern B...

## 4. 下一步动作

1. ...
```
