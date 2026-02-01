# AI 关键词挖掘分析系统 - 产品需求文档 (PRD)

**项目名称**: AI Keyword Mining Dashboard  
**文档版本**: v1.0  
**创建日期**: 2026-02-01  
**状态**: ✅ 待开发  

---

## 目录

1. [项目概述](#1-项目概述)
2. [系统架构](#2-系统架构)
3. [数据库设计](#3-数据库设计)
4. [API 接口设计](#4-api-接口设计)
5. [前端功能需求](#5-前端功能需求)
6. [技术实现方案](#6-技术实现方案)
7. [开发计划](#7-开发计划)
8. [部署方案](#8-部署方案)
9. [测试验收标准](#9-测试验收标准)

---

## 1. 项目概述

### 1.1 项目背景

**业务场景**：
- 多台服务器持续运行 AI 应用（Python 脚本），自动挖掘可开发的 AI 工具关键词
- 每台服务器每天挖掘数百至数千个关键词，数据量持续增长
- 需要统一的数据存储和分析平台，帮助决策哪些关键词值得立即开发

**现状问题**：
- 数据分散在各台服务器，缺乏统一管理
- 无法快速筛选高价值关键词
- AI 生成的报告格式不统一，难以对比分析

### 1.2 产品目标

开发一个**最小化可行产品 (MVP)**，实现：

1. **数据统一管理**：所有服务器的挖掘数据集中存储到 PostgreSQL 数据库
2. **实时数据展示**：通过 Next.js 看板实时展示关键词数据和趋势
3. **智能筛选分析**：提供多维度筛选，快速找到高分、低竞争、高商业价值的关键词
4. **报告标准化**：统一 AI 报告格式，支持 Markdown 渲染和结构化数据导出

### 1.3 核心价值

- **提升决策效率**：从数千关键词中快速定位 TOP 10 机会
- **降低开发风险**：通过竞争度、搜索量等指标评估可行性
- **数据驱动增长**：基于历史趋势预测关键词价值变化

### 1.4 目标用户

- **主要用户**：产品经理、增长负责人（需要查看分析报告和做决策）
- **次要用户**：开发工程师（需要查看技术指标和任务状态）

---

## 2. 系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     数据采集层 (Miners)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Server 1 │  │ Server 2 │  │ Server 3 │  │ Server N │   │
│  │ Python   │  │ Python   │  │ Python   │  │ Python   │   │
│  │ Scripts  │  │ Scripts  │  │ Scripts  │  │ Scripts  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │             │             │          │
│       └─────────────┴─────────────┴─────────────┘          │
│                         │ HTTP POST (API Key)                │
└─────────────────────────┼──────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    数据接入层 (Ingestion)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Next.js API Routes (/api/ingest/*)           │  │
│  │   ┌──────────────┐  ┌─────────────┐  ┌───────────┐  │  │
│  │   │ POST /runs   │  │ POST /batch │  │ POST /rpt │  │  │
│  │   └──────┬───────┘  └──────┬──────┘  └─────┬─────┘  │  │
│  │          │                  │                │        │  │
│  │          └──────────────────┴────────────────┘        │  │
│  │                         │ Drizzle ORM                 │  │
│  └─────────────────────────┼──────────────────────────────┘  │
└────────────────────────────┼──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   数据存储层 (Storage)                       │
│                  ┌──────────────────────┐                   │
│                  │  PostgreSQL (Neon)   │                   │
│                  │  ┌────────────────┐  │                   │
│                  │  │ 6 张核心表     │  │                   │
│                  │  │ + 索引优化     │  │                   │
│                  │  │ + 物化视图     │  │                   │
│                  │  └────────────────┘  │                   │
│                  └──────────┬───────────┘                   │
└─────────────────────────────┼──────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   数据展示层 (Frontend)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Next.js 16 + React 19                   │  │
│  │  ┌─────────┐  ┌──────────┐  ┌────────┐  ┌─────────┐ │  │
│  │  │Dashboard│  │ Keywords │  │ Runs   │  │ Reports │ │  │
│  │  │   页    │  │  列表页  │  │ 任务页 │  │  报告页 │ │  │
│  │  └─────────┘  └──────────┘  └────────┘  └─────────┘ │  │
│  │    ▲ 可视化图表 (Recharts)                          │  │
│  │    ▲ 筛选/搜索/排序                                   │  │
│  │    ▲ Markdown 渲染                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 技术栈选型

| 层级 | 技术选型 | 版本 | 说明 |
|------|---------|------|------|
| **前端框架** | Next.js | 16.0.7 | App Router + Server Components |
| **UI 库** | React | 19.2.1 | 最新稳定版 |
| **样式方案** | Tailwind CSS | v4 | 已有配置，保持一致 |
| **UI 组件** | Radix UI | Latest | 无障碍、可定制 |
| **数据库** | PostgreSQL | 15+ | Neon 托管服务 |
| **ORM** | Drizzle ORM | 0.44.2 | 类型安全、性能优秀 |
| **图表库** | Recharts | 2.15.4 | React 原生图表库 |
| **认证** | Better Auth | 1.3.7 | 已有系统，复用 |
| **Markdown** | react-markdown | Latest | 报告渲染 |
| **部署** | Vercel / Cloudflare | - | 根据实际情况选择 |

### 2.3 数据流程

#### 采集端 → 后端
1. Python 脚本执行挖掘任务
2. 调用 `POST /api/ingest/runs` 创建任务记录，获取 `run_id`
3. 批量调用 `POST /api/ingest/keywords/batch` 上传关键词数据（每次 100-1000 条）
4. 任务结束后调用 `POST /api/ingest/reports` 上传分析报告

#### 后端 → 数据库
1. API 路由验证 API Key
2. Drizzle ORM 处理数据插入
3. 自动去重（基于 `keyword_norm`）
4. 更新物化视图（可选：定时任务）

#### 数据库 → 前端
1. Server Components / API Routes 查询数据
2. 使用 `keyword_latest` 物化视图加速查询
3. 支持分页、筛选、排序
4. 返回 JSON 数据给前端组件

---

## 3. 数据库设计

### 3.1 ER 图

```
mining_servers (服务器)
    ↓ 1:N
mining_runs (任务)
    ↓ 1:N                    ↓ 1:1
keyword_observations    keyword_reports (报告)
    ↓ N:1
keywords (关键词)
    ↓ 1:N
keyword_notes (备注)
```

### 3.2 表结构设计

#### 表 1: `mining_servers` - 服务器信息

**用途**：记录每台服务器的基本信息，用于任务归属和统计。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | SERIAL | PRIMARY KEY | 服务器 ID |
| name | VARCHAR(255) | NOT NULL | 服务器名称（如 racknerd-01） |
| region | VARCHAR(100) | | 服务器地区（可选） |
| api_key_hash | VARCHAR(255) | | API Key 哈希值，用于鉴权 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**建表 SQL**：
```sql
CREATE TABLE mining_servers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100),
    api_key_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

#### 表 2: `mining_runs` - 挖掘任务

**用途**：记录每次挖掘任务的执行情况。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | SERIAL | PRIMARY KEY | 任务 ID |
| miner_id | INT | FK → mining_servers | 关联服务器 |
| seed | VARCHAR(255) | | 挖掘种子（如 flux, solver） |
| rounds | INT | | 挖掘轮次 |
| status | VARCHAR(50) | CHECK | 状态：running / success / failed |
| started_at | TIMESTAMP | | 开始时间 |
| ended_at | TIMESTAMP | | 结束时间 |
| meta_json | JSONB | | 任务元数据（脚本版本、配置等） |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**建表 SQL**：
```sql
CREATE TABLE mining_runs (
    id SERIAL PRIMARY KEY,
    miner_id INT REFERENCES mining_servers(id) ON DELETE CASCADE,
    seed VARCHAR(255),
    rounds INT,
    status VARCHAR(50) CHECK (status IN ('running', 'success', 'failed')),
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    meta_json JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_runs_miner_id ON mining_runs(miner_id);
CREATE INDEX idx_runs_status ON mining_runs(status);
CREATE INDEX idx_runs_started_at ON mining_runs(started_at DESC);
```

---

#### 表 3: `keywords` - 关键词主表

**用途**：存储所有关键词的基本信息，唯一性由 `keyword_norm` 保证。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | SERIAL | PRIMARY KEY | 关键词 ID |
| keyword | VARCHAR(255) | NOT NULL | 原始关键词 |
| keyword_norm | VARCHAR(255) | NOT NULL, UNIQUE | 标准化关键词（小写、去空格） |
| language | VARCHAR(20) | | 语言（en, zh） |
| country | VARCHAR(100) | | 国家（US, CN） |
| category | VARCHAR(100) | | 类别（calculator, converter, tool） |
| first_seen_at | TIMESTAMP | DEFAULT NOW() | 首次发现时间 |
| last_seen_at | TIMESTAMP | DEFAULT NOW() | 最后更新时间 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**建表 SQL**：
```sql
CREATE TABLE keywords (
    id SERIAL PRIMARY KEY,
    keyword VARCHAR(255) NOT NULL,
    keyword_norm VARCHAR(255) NOT NULL UNIQUE,
    language VARCHAR(20),
    country VARCHAR(100),
    category VARCHAR(100),
    first_seen_at TIMESTAMP DEFAULT NOW(),
    last_seen_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_keywords_norm ON keywords(keyword_norm);
CREATE INDEX idx_keywords_category ON keywords(category);
CREATE INDEX idx_keywords_language ON keywords(language);
CREATE INDEX idx_keywords_last_seen ON keywords(last_seen_at DESC);
```

**去重逻辑**：
- `keyword_norm` = LOWER(TRIM(keyword))
- 例如："Calculator Online" → "calculator online"

---

#### 表 4: `keyword_observations` - 关键词观察数据

**用途**：存储每次挖掘任务对关键词的观察结果（核心指标）。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | SERIAL | PRIMARY KEY | 观察记录 ID |
| keyword_id | INT | FK → keywords | 关联关键词 |
| run_id | INT | FK → mining_runs | 关联任务 |
| source | VARCHAR(100) | | 数据来源（reddit, serp, gpt_trend） |
| score | DECIMAL(5, 2) | | 综合得分（0-100） |
| search_volume | INT | | 搜索量 |
| difficulty | VARCHAR(20) | | 难度（unknown, low, medium, high） |
| intent | VARCHAR(255) | | 用户意图（calculate, convert, generate） |
| word_count | INT | | 关键词词数 |
| pain_point_flag | BOOLEAN | DEFAULT FALSE | 是否有痛点 |
| raw_json | JSONB | | 原始数据（完整 JSON） |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**建表 SQL**：
```sql
CREATE TABLE keyword_observations (
    id SERIAL PRIMARY KEY,
    keyword_id INT REFERENCES keywords(id) ON DELETE CASCADE,
    run_id INT REFERENCES mining_runs(id) ON DELETE CASCADE,
    source VARCHAR(100),
    score DECIMAL(5, 2),
    search_volume INT,
    difficulty VARCHAR(20),
    intent VARCHAR(255),
    word_count INT,
    pain_point_flag BOOLEAN DEFAULT FALSE,
    raw_json JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引（性能关键）
CREATE INDEX idx_observations_keyword_id ON keyword_observations(keyword_id);
CREATE INDEX idx_observations_run_id ON keyword_observations(run_id);
CREATE INDEX idx_observations_score ON keyword_observations(score DESC);
CREATE INDEX idx_observations_difficulty ON keyword_observations(difficulty);
CREATE INDEX idx_keyword_observations ON keyword_observations(keyword_id, run_id);
```

---

#### 表 5: `keyword_reports` - 分析报告

**用途**：存储每次任务的 AI 生成报告。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | SERIAL | PRIMARY KEY | 报告 ID |
| run_id | INT | FK → mining_runs | 关联任务 |
| title | VARCHAR(255) | | 报告标题 |
| report_markdown | TEXT | | Markdown 格式报告 |
| report_json | JSONB | | 结构化报告数据 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**建表 SQL**：
```sql
CREATE TABLE keyword_reports (
    id SERIAL PRIMARY KEY,
    run_id INT REFERENCES mining_runs(id) ON DELETE CASCADE,
    title VARCHAR(255),
    report_markdown TEXT,
    report_json JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_keyword_reports_run_id ON keyword_reports(run_id);
CREATE INDEX idx_reports_created_at ON keyword_reports(created_at DESC);
```

---

#### 表 6: `keyword_notes` - 关键词备注

**用途**：存储 AI 或人工对关键词的分析结论。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | SERIAL | PRIMARY KEY | 备注 ID |
| keyword_id | INT | FK → keywords | 关联关键词 |
| run_id | INT | FK → mining_runs | 关联任务（可选） |
| type | VARCHAR(50) | CHECK | 类型：ai_summary / dev_suggestion / business_value / risk |
| content | TEXT | | 备注内容 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**建表 SQL**：
```sql
CREATE TABLE keyword_notes (
    id SERIAL PRIMARY KEY,
    keyword_id INT REFERENCES keywords(id) ON DELETE CASCADE,
    run_id INT REFERENCES mining_runs(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('ai_summary', 'dev_suggestion', 'business_value', 'risk')),
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_keyword_notes_keyword_id ON keyword_notes(keyword_id);
CREATE INDEX idx_notes_type ON keyword_notes(type);
```

---

### 3.3 性能优化方案

#### 3.3.1 物化视图 - `keyword_latest`

**目的**：缓存每个关键词的最新指标，避免每次都 JOIN 查询。

```sql
CREATE MATERIALIZED VIEW keyword_latest AS
SELECT DISTINCT ON (k.id)
    k.id AS keyword_id,
    k.keyword,
    k.keyword_norm,
    k.category,
    k.language,
    k.country,
    ko.score,
    ko.search_volume,
    ko.difficulty,
    ko.intent,
    ko.word_count,
    ko.pain_point_flag,
    ko.source,
    ko.created_at AS last_observation_time
FROM keywords k
LEFT JOIN keyword_observations ko ON k.id = ko.keyword_id
ORDER BY k.id, ko.created_at DESC;

-- 为物化视图创建索引
CREATE INDEX idx_keyword_latest_score ON keyword_latest(score DESC);
CREATE INDEX idx_keyword_latest_difficulty ON keyword_latest(difficulty);
CREATE INDEX idx_keyword_latest_category ON keyword_latest(category);

-- 刷新策略（定时任务或手动）
REFRESH MATERIALIZED VIEW keyword_latest;
```

**刷新策略**：
- 开发阶段：手动刷新
- 生产环境：使用 Cron Job 每小时刷新一次

#### 3.3.2 分区表（可选）

当 `keyword_observations` 数据量超过 1000 万条时，按月分区：

```sql
CREATE TABLE keyword_observations (
    id SERIAL,
    keyword_id INT,
    run_id INT,
    score DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 创建月度分区
CREATE TABLE keyword_observations_2026_02 
PARTITION OF keyword_observations 
FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

---

### 3.4 完整初始化脚本

**文件位置**：`scripts/init-db.sql`

```sql
-- ============================================
-- AI 关键词挖掘系统 - 数据库初始化脚本
-- ============================================

-- 1. 创建服务器表
CREATE TABLE mining_servers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100),
    api_key_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 创建挖掘任务表
CREATE TABLE mining_runs (
    id SERIAL PRIMARY KEY,
    miner_id INT REFERENCES mining_servers(id) ON DELETE CASCADE,
    seed VARCHAR(255),
    rounds INT,
    status VARCHAR(50) CHECK (status IN ('running', 'success', 'failed')),
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    meta_json JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. 创建关键词表
CREATE TABLE keywords (
    id SERIAL PRIMARY KEY,
    keyword VARCHAR(255) NOT NULL,
    keyword_norm VARCHAR(255) NOT NULL UNIQUE,
    language VARCHAR(20),
    country VARCHAR(100),
    category VARCHAR(100),
    first_seen_at TIMESTAMP DEFAULT NOW(),
    last_seen_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. 创建关键词观察表
CREATE TABLE keyword_observations (
    id SERIAL PRIMARY KEY,
    keyword_id INT REFERENCES keywords(id) ON DELETE CASCADE,
    run_id INT REFERENCES mining_runs(id) ON DELETE CASCADE,
    source VARCHAR(100),
    score DECIMAL(5, 2),
    search_volume INT,
    difficulty VARCHAR(20),
    intent VARCHAR(255),
    word_count INT,
    pain_point_flag BOOLEAN DEFAULT FALSE,
    raw_json JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. 创建报告表
CREATE TABLE keyword_reports (
    id SERIAL PRIMARY KEY,
    run_id INT REFERENCES mining_runs(id) ON DELETE CASCADE,
    title VARCHAR(255),
    report_markdown TEXT,
    report_json JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. 创建备注表
CREATE TABLE keyword_notes (
    id SERIAL PRIMARY KEY,
    keyword_id INT REFERENCES keywords(id) ON DELETE CASCADE,
    run_id INT REFERENCES mining_runs(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('ai_summary', 'dev_suggestion', 'business_value', 'risk')),
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. 创建所有索引
CREATE INDEX idx_runs_miner_id ON mining_runs(miner_id);
CREATE INDEX idx_runs_status ON mining_runs(status);
CREATE INDEX idx_runs_started_at ON mining_runs(started_at DESC);

CREATE INDEX idx_keywords_norm ON keywords(keyword_norm);
CREATE INDEX idx_keywords_category ON keywords(category);
CREATE INDEX idx_keywords_language ON keywords(language);
CREATE INDEX idx_keywords_last_seen ON keywords(last_seen_at DESC);

CREATE INDEX idx_observations_keyword_id ON keyword_observations(keyword_id);
CREATE INDEX idx_observations_run_id ON keyword_observations(run_id);
CREATE INDEX idx_observations_score ON keyword_observations(score DESC);
CREATE INDEX idx_observations_difficulty ON keyword_observations(difficulty);
CREATE INDEX idx_keyword_observations ON keyword_observations(keyword_id, run_id);

CREATE INDEX idx_keyword_reports_run_id ON keyword_reports(run_id);
CREATE INDEX idx_reports_created_at ON keyword_reports(created_at DESC);

CREATE INDEX idx_keyword_notes_keyword_id ON keyword_notes(keyword_id);
CREATE INDEX idx_notes_type ON keyword_notes(type);

-- 8. 创建物化视图
CREATE MATERIALIZED VIEW keyword_latest AS
SELECT DISTINCT ON (k.id)
    k.id AS keyword_id,
    k.keyword,
    k.keyword_norm,
    k.category,
    k.language,
    k.country,
    ko.score,
    ko.search_volume,
    ko.difficulty,
    ko.intent,
    ko.word_count,
    ko.pain_point_flag,
    ko.source,
    ko.created_at AS last_observation_time
FROM keywords k
LEFT JOIN keyword_observations ko ON k.id = ko.keyword_id
ORDER BY k.id, ko.created_at DESC;

CREATE INDEX idx_keyword_latest_score ON keyword_latest(score DESC);
CREATE INDEX idx_keyword_latest_difficulty ON keyword_latest(difficulty);
CREATE INDEX idx_keyword_latest_category ON keyword_latest(category);

-- 完成
SELECT 'Database initialized successfully!' AS message;
```

---

## 4. API 接口设计

### 4.1 鉴权机制

**方式**：API Key 鉴权

**实现**：
- 每台服务器分配唯一 API Key
- 存储在 `mining_servers.api_key_hash` 中（bcrypt 哈希）
- 请求时携带 Header：`Authorization: Bearer <api_key>`

**中间件示例**：
```typescript
// src/middleware/auth.ts
export async function validateApiKey(req: Request): Promise<boolean> {
  const apiKey = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!apiKey) return false;
  
  // 查询数据库验证
  const server = await db.query.miningServers.findFirst({
    where: eq(miningServers.apiKeyHash, hashApiKey(apiKey))
  });
  
  return !!server;
}
```

---

### 4.2 接口详细定义

#### 接口 1: 创建挖掘任务

**接口**：`POST /api/ingest/runs`

**请求头**：
```
Authorization: Bearer <api_key>
Content-Type: application/json
```

**请求体**：
```json
{
  "miner_name": "racknerd-01",
  "seed": "flux",
  "rounds": 3,
  "meta": {
    "script_version": "v2.5",
    "config": {...}
  }
}
```

**响应**：
```json
{
  "success": true,
  "run_id": 123,
  "message": "Run created successfully"
}
```

**业务逻辑**：
1. 验证 API Key
2. 查找或创建 `miner_id`（基于 `miner_name`）
3. 插入 `mining_runs` 记录，状态为 `running`
4. 返回 `run_id`

---

#### 接口 2: 批量上传关键词

**接口**：`POST /api/ingest/keywords/batch`

**请求头**：
```
Authorization: Bearer <api_key>
Content-Type: application/json
```

**请求体**：
```json
{
  "run_id": 123,
  "items": [
    {
      "keyword": "Flux 2 Klein Generator",
      "score": 85.5,
      "search_volume": 5000,
      "difficulty": "low",
      "intent": "generate",
      "word_count": 4,
      "pain_point_flag": false,
      "raw": {
        "vs_gpt_heat": "1716.9%",
        "serp_results": [...]
      }
    },
    {
      "keyword": "calculator online free",
      "score": 78.2,
      "search_volume": 12000,
      "difficulty": "medium",
      "intent": "calculate",
      "word_count": 3,
      "pain_point_flag": true,
      "raw": {...}
    }
  ]
}
```

**响应**：
```json
{
  "success": true,
  "inserted": 2,
  "updated": 0,
  "skipped": 0
}
```

**业务逻辑**：
1. 验证 API Key 和 `run_id`
2. 遍历 `items`：
   - 生成 `keyword_norm` = LOWER(TRIM(keyword))
   - 查询 `keywords` 表：
     - 存在：更新 `last_seen_at`，获取 `keyword_id`
     - 不存在：插入新记录，获取 `keyword_id`
   - 插入 `keyword_observations` 记录
3. 返回统计信息

**去重策略**：
```sql
INSERT INTO keywords (keyword, keyword_norm, ...)
VALUES ($1, $2, ...)
ON CONFLICT (keyword_norm) DO UPDATE
SET last_seen_at = NOW()
RETURNING id;
```

---

#### 接口 3: 上传分析报告

**接口**：`POST /api/ingest/reports`

**请求头**：
```
Authorization: Bearer <api_key>
Content-Type: application/json
```

**请求体**：
```json
{
  "run_id": 123,
  "title": "测试挖掘到 1446 个关键词",
  "markdown": "# 挖掘报告\n...",
  "json": {
    "summary": {
      "total_keywords": 1446,
      "sources": ["serp", "reddit"]
    },
    "top_opportunities": [...],
    "green_lights": [...]
  }
}
```

**响应**：
```json
{
  "success": true,
  "report_id": 456
}
```

**业务逻辑**：
1. 验证 API Key 和 `run_id`
2. 插入 `keyword_reports` 记录
3. 更新 `mining_runs.status` 为 `success`
4. 更新 `mining_runs.ended_at` 为当前时间
5. 返回 `report_id`

---

#### 接口 4: 更新任务状态

**接口**：`PATCH /api/ingest/runs/:id`

**请求头**：
```
Authorization: Bearer <api_key>
Content-Type: application/json
```

**请求体**：
```json
{
  "status": "failed",
  "error": "Timeout after 3 hours"
}
```

**响应**：
```json
{
  "success": true
}
```

---

### 4.3 错误处理

**标准错误响应**：
```json
{
  "success": false,
  "error": {
    "code": "INVALID_API_KEY",
    "message": "API key is invalid or expired",
    "details": null
  }
}
```

**错误码表**：
| 错误码 | HTTP 状态码 | 说明 |
|--------|------------|------|
| `INVALID_API_KEY` | 401 | API Key 无效 |
| `MISSING_PARAMS` | 400 | 缺少必需参数 |
| `RUN_NOT_FOUND` | 404 | 任务不存在 |
| `DATABASE_ERROR` | 500 | 数据库错误 |
| `RATE_LIMIT` | 429 | 请求过于频繁 |

---

## 5. 前端功能需求

### 5.1 页面结构

```
/                           首页 Dashboard
/keywords                   关键词列表页
/keywords/[id]              关键词详情页
/runs                       挖掘任务列表页
/runs/[id]                  任务详情页
/reports                    报告列表页
/reports/[id]               报告详情页
/settings                   系统设置页
```

---

### 5.2 页面 1: 首页 Dashboard

**路由**: `/` 或 `/dashboard`

**核心功能**：
- 展示关键指标
- Top 10 高分关键词
- 数据趋势图表

#### 布局设计

```
┌─────────────────────────────────────────────────────────┐
│                    页面标题 & 刷新按钮                   │
├─────────────┬─────────────┬─────────────┬──────────────┤
│ 关键词总数  │  近7天新增  │  绿灯词数量 │ 正在运行任务 │
│   12,456    │    1,234    │     45      │      3       │
└─────────────┴─────────────┴─────────────┴──────────────┘

┌──────────────────────────────────────────────────────────┐
│            TOP 10 高分关键词（表格）                     │
│  rank | keyword                | score | difficulty      │
│  ───────────────────────────────────────────────────────│
│    1  | Flux 2 Klein Generator | 85.5  | Low            │
│    2  | Star Rupture Planner   | 82.3  | Low            │
│   ... | ...                    | ...   | ...            │
└──────────────────────────────────────────────────────────┘

┌────────────────────────┬─────────────────────────────────┐
│   关键词发现趋势        │     意图分布（饼图）             │
│   （折线图）           │                                 │
│                        │                                 │
│                        │                                 │
└────────────────────────┴─────────────────────────────────┘
```

#### 数据指标卡片

1. **关键词总数**
   - 数据源：`SELECT COUNT(*) FROM keywords`
   - 展示：大字号数字 + 环比增长率

2. **近 7 天新增**
   - 数据源：`SELECT COUNT(*) FROM keywords WHERE first_seen_at >= NOW() - INTERVAL '7 days'`
   - 展示：数字 + 趋势箭头

3. **绿灯词数量**
   - 定义：`score >= 80 AND difficulty = 'low'`
   - 数据源：`SELECT COUNT(*) FROM keyword_latest WHERE score >= 80 AND difficulty = 'low'`

4. **正在运行的任务**
   - 数据源：`SELECT COUNT(*) FROM mining_runs WHERE status = 'running'`
   - 展示：数字 + 实时刷新

#### TOP 10 表格

**字段**：
- Rank（排名）
- Keyword（关键词）
- Score（得分）
- Difficulty（难度）
- Search Volume（搜索量）
- Action（操作按钮：查看详情）

**排序逻辑**：
```sql
SELECT * FROM keyword_latest
ORDER BY score DESC
LIMIT 10;
```

#### 趋势图表

1. **关键词发现趋势**（折线图）
   - X 轴：日期（近 30 天）
   - Y 轴：新增关键词数量
   - 数据源：按天聚合 `keywords.first_seen_at`

2. **意图分布**（饼图）
   - 数据源：`SELECT intent, COUNT(*) FROM keyword_latest GROUP BY intent`
   - 展示：calculate, convert, generate, analyze 等分类占比

---

### 5.3 页面 2: 关键词列表页

**路由**: `/keywords`

**核心功能**：
- 表格展示所有关键词
- 多维度筛选
- 搜索和排序

#### 布局设计

```
┌─────────────────────────────────────────────────────────┐
│  搜索框 [          ] 🔍   [新增筛选] [导出 CSV]         │
├──────────┬──────────────────────────────────────────────┤
│          │  关键词列表（表格，分页）                    │
│  筛选    │  ┌──────────────────────────────────────┐   │
│  侧边栏  │  │ keyword | score | diff | vol | ... │   │
│          │  ├──────────────────────────────────────┤   │
│  [x] 低  │  │ ...     | ...   | ...  | ... | ... │   │
│  [ ] 中  │  │ ...     | ...   | ...  | ... | ... │   │
│  [ ] 高  │  └──────────────────────────────────────┘   │
│          │                                              │
│  得分    │  ← 上一页    1 2 3 4 5    下一页 →          │
│  [====] │                                              │
│  70-100  │                                              │
└──────────┴──────────────────────────────────────────────┘
```

#### 表格字段

| 字段 | 宽度 | 排序 | 说明 |
|------|------|------|------|
| Keyword | 30% | ✓ | 关键词，点击查看详情 |
| Score | 10% | ✓ | 得分，带进度条 |
| Difficulty | 10% | ✓ | 难度，彩色标签 |
| Intent | 15% | ✓ | 意图，多标签 |
| Word Count | 8% | ✓ | 词数 |
| Search Volume | 12% | ✓ | 搜索量，格式化显示 |
| Last Seen | 10% | ✓ | 最后更新时间 |
| Actions | 5% | - | 操作按钮 |

#### 筛选功能

**左侧筛选器**（可折叠）：

1. **得分范围**
   - 滑块：0 - 100
   - 快捷选项：>80, >70, >60

2. **难度**
   - 多选：Unknown, Low, Medium, High
   - 默认：全选

3. **意图**
   - 多选：Calculate, Convert, Generate, Analyze
   - 默认：全选

4. **词长**
   - 单选：2-5 词, 6-9 词, 10+ 词
   - 默认：全部

5. **时间范围**
   - 单选：近 7 天, 近 30 天, 近 90 天, 全部
   - 默认：全部

6. **数据来源**
   - 多选：Reddit, SERP, GPT Trend
   - 默认：全选

7. **绿灯词**
   - 开关：仅显示绿灯词
   - 定义：score >= 80 AND difficulty = 'low'

#### 搜索框

- 实时搜索（防抖 300ms）
- 搜索范围：`keyword` 字段
- 支持模糊匹配

#### 分页

- 每页 50 条
- 支持跳转到指定页

---

### 5.4 页面 3: 关键词详情页

**路由**: `/keywords/[id]`

**核心功能**：
- 展示关键词的所有信息
- 历史趋势图
- AI 建议
- 添加备注

#### 布局设计

```
┌─────────────────────────────────────────────────────────┐
│  ← 返回列表                         [导出] [添加备注]    │
├─────────────────────────────────────────────────────────┤
│  关键词: Flux 2 Klein Generator                          │
│  类别: AI Tool  |  语言: en  |  国家: US                 │
│  首次发现: 2026-01-15  |  最后更新: 2026-02-01           │
├─────────────────────────────────────────────────────────┤
│  最新指标                                                │
│  ┌─────┬────────┬────────┬───────┬─────────┬─────────┐  │
│  │得分 │ 搜索量 │ 难度   │ 意图  │ 词数    │ 痛点    │  │
│  │85.5 │ 5,000  │ Low    │Gen    │ 4       │ No      │  │
│  └─────┴────────┴────────┴───────┴─────────┴─────────┘  │
├─────────────────────────────────────────────────────────┤
│  得分历史趋势（折线图）                                  │
│  ▁▂▃▅▇█                                                 │
├─────────────────────────────────────────────────────────┤
│  AI 建议                                                │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 📝 开发建议: 对接 Replicate API，做极简生成器截流  │  │
│  │ 💰 商业价值: 高潜力，B2C 工具类市场空白             │  │
│  │ ⚠️ 风险分析: 需关注 API 成本和限流问题              │  │
│  └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  备注历史                                                │
│  [添加新备注...]                                        │
└─────────────────────────────────────────────────────────┘
```

#### 数据获取

```typescript
// 查询关键词基本信息
const keyword = await db.query.keywords.findFirst({
  where: eq(keywords.id, keywordId)
});

// 查询最新观察数据
const latestObservation = await db.query.keywordObservations.findFirst({
  where: eq(keywordObservations.keywordId, keywordId),
  orderBy: desc(keywordObservations.createdAt)
});

// 查询历史趋势
const history = await db.query.keywordObservations.findMany({
  where: eq(keywordObservations.keywordId, keywordId),
  orderBy: asc(keywordObservations.createdAt)
});

// 查询 AI 建议
const notes = await db.query.keywordNotes.findMany({
  where: eq(keywordNotes.keywordId, keywordId)
});
```

---

### 5.5 页面 4: 挖掘任务列表页

**路由**: `/runs`

**核心功能**：
- 展示所有挖掘任务
- 筛选任务状态
- 查看任务详情和报告

#### 表格字段

| 字段 | 说明 |
|------|------|
| ID | 任务 ID |
| 服务器 | 服务器名称 |
| Seed | 挖掘种子 |
| Rounds | 轮次 |
| Status | 状态（运行中/成功/失败）|
| 关键词数 | 挖掘到的关键词数量 |
| 开始时间 | started_at |
| 结束时间 | ended_at |
| 操作 | 查看报告 |

#### 筛选器

- 状态：Running, Success, Failed
- 服务器：下拉选择
- 时间范围：近 7 天, 30 天, 全部

---

### 5.6 页面 5: 分析报告页

**路由**: `/reports` 或 `/reports/[id]`

**核心功能**：
- 渲染 Markdown 格式报告
- 展示结构化数据
- 支持导出和分享

#### Markdown 渲染

使用 `react-markdown` 或 `fumadocs-mdx` 渲染报告：

```tsx
import ReactMarkdown from 'react-markdown';

<ReactMarkdown>{report.report_markdown}</ReactMarkdown>
```

#### 结构化数据展示

从 `report_json` 中提取：
- TOP 机会（表格）
- 绿灯词（高亮卡片）
- 模式洞察（列表）
- 下一步动作（操作按钮）

---

## 6. 技术实现方案

### 6.1 数据库连接（Drizzle ORM）

**文件位置**：`src/core/db/schema.postgres.ts`

#### Schema 定义示例

```typescript
import { pgTable, serial, varchar, timestamp, integer, decimal, boolean, text } from 'drizzle-orm/pg-core';

export const miningServers = pgTable('mining_servers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  region: varchar('region', { length: 100 }),
  apiKeyHash: varchar('api_key_hash', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const keywords = pgTable('keywords', {
  id: serial('id').primaryKey(),
  keyword: varchar('keyword', { length: 255 }).notNull(),
  keywordNorm: varchar('keyword_norm', { length: 255 }).notNull().unique(),
  language: varchar('language', { length: 20 }),
  country: varchar('country', { length: 100 }),
  category: varchar('category', { length: 100 }),
  firstSeenAt: timestamp('first_seen_at').defaultNow(),
  lastSeenAt: timestamp('last_seen_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// ... 其他表定义
```

---

### 6.2 API 路由实现

**文件结构**：
```
src/app/api/ingest/
├── runs/
│   └── route.ts           # POST /api/ingest/runs
├── keywords/
│   └── batch/
│       └── route.ts       # POST /api/ingest/keywords/batch
└── reports/
    └── route.ts           # POST /api/ingest/reports
```

#### 示例：创建任务接口

```typescript
// src/app/api/ingest/runs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/core/db';
import { miningServers, miningRuns } from '@/core/db/schema.postgres';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    // 1. 验证 API Key
    const apiKey = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Missing API key' }, { status: 401 });
    }

    // 2. 解析请求体
    const body = await req.json();
    const { miner_name, seed, rounds, meta } = body;

    // 3. 查找或创建服务器
    let server = await db.query.miningServers.findFirst({
      where: eq(miningServers.name, miner_name)
    });

    if (!server) {
      [server] = await db.insert(miningServers).values({
        name: miner_name,
        apiKeyHash: hashApiKey(apiKey)
      }).returning();
    }

    // 4. 创建任务
    const [run] = await db.insert(miningRuns).values({
      minerId: server.id,
      seed,
      rounds,
      status: 'running',
      startedAt: new Date(),
      metaJson: meta
    }).returning();

    return NextResponse.json({
      success: true,
      run_id: run.id
    });
  } catch (error) {
    console.error('Error creating run:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
```

---

### 6.3 前端组件实现

#### Dashboard 组件示例

```tsx
// src/app/[locale]/(dashboard)/page.tsx
import { db } from '@/core/db';
import { keywords, keywordObservations, miningRuns } from '@/core/db/schema.postgres';
import { sql } from 'drizzle-orm';
import StatsCard from '@/components/stats-card';
import TopKeywordsTable from '@/components/top-keywords-table';

export default async function DashboardPage() {
  // 获取统计数据
  const stats = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(keywords),
    db.select({ count: sql<number>`count(*)` })
      .from(keywords)
      .where(sql`first_seen_at >= NOW() - INTERVAL '7 days'`),
    db.select({ count: sql<number>`count(*)` })
      .from(miningRuns)
      .where(sql`status = 'running'`)
  ]);

  const [totalKeywords, newThisWeek, activeRuns] = stats.map(s => s[0].count);

  // 获取 TOP 10
  const topKeywords = await db.query.keywordObservations.findMany({
    limit: 10,
    orderBy: (observations, { desc }) => [desc(observations.score)],
    with: { keyword: true }
  });

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard title="关键词总数" value={totalKeywords} />
        <StatsCard title="近 7 天新增" value={newThisWeek} />
        <StatsCard title="绿灯词数量" value={45} />
        <StatsCard title="正在运行任务" value={activeRuns} />
      </div>

      {/* TOP 10 表格 */}
      <TopKeywordsTable data={topKeywords} />
    </div>
  );
}
```

---

### 6.4 数据去重逻辑

**关键实现**：

```typescript
// 工具函数：标准化关键词
function normalizeKeyword(keyword: string): string {
  return keyword.toLowerCase().trim().replace(/\s+/g, ' ');
}

// 批量插入时的去重逻辑
async function insertKeywordsBatch(items: KeywordInput[]) {
  for (const item of items) {
    const keywordNorm = normalizeKeyword(item.keyword);

    // 使用 ON CONFLICT 处理重复
    const [keyword] = await db
      .insert(keywords)
      .values({
        keyword: item.keyword,
        keywordNorm,
        language: item.language || 'en',
        country: item.country || 'US',
        category: item.category
      })
      .onConflictDoUpdate({
        target: keywords.keywordNorm,
        set: { lastSeenAt: new Date() }
      })
      .returning();

    // 插入观察记录
    await db.insert(keywordObservations).values({
      keywordId: keyword.id,
      runId: item.runId,
      source: item.source,
      score: item.score,
      searchVolume: item.searchVolume,
      difficulty: item.difficulty,
      intent: item.intent,
      wordCount: item.wordCount,
      painPointFlag: item.painPointFlag,
      rawJson: item.raw
    });
  }
}
```

---

## 7. 开发计划

### 7.1 开发阶段划分

#### Phase 1: 基础架构（3-5 天）

**目标**：搭建数据库和 API 基础

**任务清单**：
- [ ] 在 Neon 创建 PostgreSQL 数据库
- [ ] 执行初始化脚本（`init-db.sql`）
- [ ] 配置 Drizzle ORM Schema
- [ ] 实现 API 鉴权中间件
- [ ] 实现 3 个数据接入 API
  - [ ] `POST /api/ingest/runs`
  - [ ] `POST /api/ingest/keywords/batch`
  - [ ] `POST /api/ingest/reports`
- [ ] 编写 API 测试用例
- [ ] 测试：使用 Postman 模拟服务器上传数据

**验收标准**：
- API 接口正常响应
- 数据能成功写入数据库
- 去重逻辑正常工作

---

#### Phase 2: 前端核心页面（3-4 天）

**目标**：实现 Dashboard 和关键词列表页

**任务清单**：
- [ ] 实现 Dashboard 页面
  - [ ] 4 个统计卡片
  - [ ] TOP 10 关键词表格
  - [ ] 趋势图表（Recharts）
- [ ] 实现关键词列表页
  - [ ] 表格组件（支持排序）
  - [ ] 筛选器侧边栏
  - [ ] 搜索功能
  - [ ] 分页组件
- [ ] 实现关键词详情页
  - [ ] 基本信息展示
  - [ ] 历史趋势图
  - [ ] AI 建议展示

**验收标准**：
- 页面加载速度 < 2s
- 筛选功能正常
- 图表渲染正确

---

#### Phase 3: 高级功能（2-3 天）

**目标**：任务管理和报告展示

**任务清单**：
- [ ] 实现挖掘任务列表页
- [ ] 实现任务详情页
- [ ] 实现报告列表页
- [ ] 实现报告详情页（Markdown 渲染）
- [ ] 实现备注功能
- [ ] 实现数据导出（CSV / JSON）
- [ ] 添加物化视图刷新脚本

**验收标准**：
- Markdown 正确渲染
- 导出功能正常
- 备注能正确保存

---

#### Phase 4: 测试与优化（2-3 天）

**目标**：性能优化和 Bug 修复

**任务清单**：
- [ ] 性能测试（模拟 10 万关键词）
- [ ] 添加 Loading 状态
- [ ] 添加 Error Boundary
- [ ] 优化数据库查询（使用 EXPLAIN ANALYZE）
- [ ] 前端代码优化（React.memo, useMemo）
- [ ] 添加日志和监控
- [ ] 编写用户文档

**验收标准**：
- 所有页面加载 < 2s
- 无明显 Bug
- 代码符合规范

---

### 7.2 开发时间估算（1 人）

| 阶段 | 功能 | 预计时间 |
|------|------|----------|
| Phase 1 | 数据库 + API | 3-5 天 |
| Phase 2 | 核心页面 | 3-4 天 |
| Phase 3 | 高级功能 | 2-3 天 |
| Phase 4 | 测试优化 | 2-3 天 |
| **总计** | | **10-15 天** |

---

### 7.3 并行开发建议（2 人）

- **Person A（后端）**：
  - Phase 1: 数据库 + API
  - Phase 2: 数据查询接口优化
  - Phase 3: 物化视图和性能优化

- **Person B（前端）**：
  - Phase 1: 学习项目结构
  - Phase 2: 实现所有页面
  - Phase 3: 图表和交互优化

**时间缩短至**: 7-10 天

---

## 8. 部署方案

### 8.1 环境配置

#### 开发环境 (`.env.development`)

```env
# 应用配置
NEXT_PUBLIC_APP_NAME=AI 关键词分析系统
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_URL=http://localhost:3000/api/auth

# 数据库（Neon）
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://neondb_owner:xxx@ep-xxx.neon.tech/neondb?sslmode=require

# API 鉴权
API_KEY_SERVER_1=dev_key_racknerd_01
API_KEY_SERVER_2=dev_key_racknerd_02

# Better Auth
AUTH_SECRET=<openssl rand -base64 32>

# 其他
NODE_ENV=development
```

#### 生产环境 (`.env.production`)

```env
# 应用配置
NEXT_PUBLIC_APP_NAME=AI 关键词分析系统
NEXT_PUBLIC_APP_URL=https://keywords.yourdomain.com
AUTH_URL=https://keywords.yourdomain.com/api/auth

# 数据库（Neon Production）
DATABASE_PROVIDER=postgresql
DATABASE_URL=<生产数据库连接串>

# API 鉴权（强密码）
API_KEY_SERVER_1=<生成 32 位随机字符串>
API_KEY_SERVER_2=<生成 32 位随机字符串>

# Better Auth
AUTH_SECRET=<openssl rand -base64 32>

# 其他
NODE_ENV=production
```

---

### 8.2 部署到 Vercel

#### 步骤

1. **连接 GitHub 仓库**
   ```bash
   git remote add origin https://github.com/harveyzhang604/ai-keyworddata.git
   git push -u origin main
   ```

2. **在 Vercel 创建项目**
   - 导入 GitHub 仓库
   - Framework Preset: Next.js
   - Root Directory: `/`

3. **配置环境变量**
   - 在 Vercel Dashboard 中添加所有 `.env.production` 变量

4. **触发部署**
   ```bash
   git push origin main
   ```

5. **配置自定义域名**（可选）
   - 在 Vercel Dashboard 添加域名
   - 配置 DNS CNAME 记录

---

### 8.3 部署到 Cloudflare Pages（备选）

#### 步骤

1. **安装 OpenNext Cloudflare 适配器**
   ```bash
   pnpm add @opennextjs/cloudflare
   ```

2. **构建**
   ```bash
   pnpm cf:build
   ```

3. **部署**
   ```bash
   pnpm cf:deploy
   ```

4. **配置环境变量**
   - 在 Cloudflare Dashboard 添加 Secrets

---

### 8.4 数据库维护

#### 定时刷新物化视图

**方法 1**: 使用 Vercel Cron Jobs

```typescript
// src/app/api/cron/refresh-views/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/core/db';
import { sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  // 验证 Cron Secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 刷新物化视图
  await db.execute(sql`REFRESH MATERIALIZED VIEW keyword_latest`);

  return NextResponse.json({ success: true });
}
```

**配置**（`vercel.json`）:
```json
{
  "crons": [
    {
      "path": "/api/cron/refresh-views",
      "schedule": "0 * * * *"
    }
  ]
}
```

**方法 2**: 使用外部 Cron 服务（cron-job.org）

- 创建定时任务
- 请求 URL: `https://yourapp.com/api/cron/refresh-views`
- 添加 Header: `Authorization: Bearer <CRON_SECRET>`

---

## 9. 测试验收标准

### 9.1 功能测试

#### 数据接入测试

| 测试用例 | 操作 | 预期结果 |
|---------|------|----------|
| 创建任务 | 调用 `POST /api/ingest/runs` | 返回 `run_id`，数据库有记录 |
| 上传关键词（新词） | 调用 `POST /api/ingest/keywords/batch` | 插入新关键词和观察记录 |
| 上传关键词（重复） | 上传相同 `keyword_norm` | 更新 `last_seen_at`，新增观察记录 |
| 上传报告 | 调用 `POST /api/ingest/reports` | 任务状态变为 `success` |
| 无效 API Key | 请求不带 Authorization | 返回 401 错误 |

#### 前端功能测试

| 测试用例 | 操作 | 预期结果 |
|---------|------|----------|
| Dashboard 加载 | 访问首页 | 显示 4 个指标卡片和图表 |
| 筛选关键词 | 选择 Score > 80 | 表格只显示高分词 |
| 搜索关键词 | 输入 "calculator" | 实时过滤结果 |
| 查看详情 | 点击关键词 | 跳转到详情页 |
| 排序 | 点击 Score 列头 | 按得分排序 |
| 分页 | 点击下一页 | 显示第 2 页数据 |
| Markdown 渲染 | 访问报告页 | 正确渲染格式 |

---

### 9.2 性能测试

#### 数据库性能

| 测试场景 | 数据量 | 目标 | 实际 |
|---------|--------|------|------|
| 查询 TOP 10 | 10 万关键词 | < 100ms | ___ |
| 筛选 + 分页 | 10 万关键词 | < 200ms | ___ |
| 批量插入 | 1000 条/次 | < 1s | ___ |
| 物化视图刷新 | 10 万关键词 | < 5s | ___ |

#### 前端性能

| 测试场景 | 目标 | 实际 |
|---------|------|------|
| Dashboard 首屏加载 | < 2s | ___ |
| 关键词列表加载 | < 2s | ___ |
| 详情页加载 | < 1s | ___ |
| 筛选响应 | < 300ms | ___ |

---

### 9.3 兼容性测试

| 浏览器 | 版本 | 测试结果 |
|--------|------|----------|
| Chrome | 最新版 | ___ |
| Edge | 最新版 | ___ |
| Safari | 最新版 | ___ |
| Firefox | 最新版 | ___ |

---

### 9.4 验收清单

#### MVP 完成标志

- [x] 数据库已初始化（6 张表 + 索引 + 物化视图）
- [x] API 接口正常工作（3 个接口）
- [x] 服务器能成功上传数据
- [x] Dashboard 正常展示
- [x] 关键词列表页可用
- [x] 筛选功能正常
- [x] 能查看关键词详情
- [x] 报告页能渲染 Markdown

#### 性能指标

- [x] 支持 10 万+ 关键词
- [x] 列表页加载 < 2s
- [x] API 响应 < 500ms

#### 用户体验

- [x] 界面简洁美观
- [x] 筛选逻辑清晰
- [x] 支持导出数据
- [x] 无明显 Bug

---

## 附录

### A. 统一报告格式规范

所有 AI 生成的报告必须遵循以下 Markdown 结构：

```markdown
# 挖掘报告：{Run Name}

- 关键词总数：{Count}
- 时间范围：{Start} ~ {End}
- 种子/轮次：seed={seed}, rounds={rounds}
- 数据来源：{Sources}

## 1. TOP 机会（建议优先做）

| rank | keyword | score | difficulty | intent | why_now | build_suggestion |
|---:|---|---:|---|---|---|---|
| 1 | Flux 2 Klein Generator | 85.5 | low | generate | vs GPT 热度高 | 对接 Replicate API，截流 |
| 2 | Star Rupture Planner | 82.3 | low | tool | 市场空白 | 开源改版 + AI 增强 |

## 2. 绿灯词（可直接 BUILD NOW）

| keyword | word_count | evidence | business_value | recommended_mvp |
|---|---:|---|---|---|
| how to fix blurry text in screenshot online free | 9 | 前排全是 Reddit，缺工具页 | high | 上传截图→增强→导出 |

## 3. 模式洞察（Patterns）

- Pattern A: free + [功能] + tool（score: 70-80）
- Pattern B: best + [AI] + [功能] + [行业]

## 4. 下一步动作（Next Actions）

1. 深挖特定领域：`python3 demand_miner_v25.py --seed flux --rounds 3`
2. 深挖游戏解题类：`python3 demand_miner_v25.py --seed solver --rounds 3`
```

对应的 JSON 结构：

```json
{
  "run_id": 123,
  "summary": {
    "total_keywords": 1446,
    "time_range": "2026-02-01 ~ 2026-02-02",
    "seed": "flux",
    "rounds": 3,
    "sources": ["serp", "reddit", "gpt_trend"]
  },
  "top_opportunities": [
    {
      "rank": 1,
      "keyword": "Flux 2 Klein Generator",
      "score": 85.5,
      "difficulty": "low",
      "intent": "generate",
      "why_now": "vs GPT 热度高",
      "build_suggestion": "对接 Replicate API，截流"
    }
  ],
  "green_lights": [
    {
      "keyword": "how to fix blurry text in screenshot online free",
      "word_count": 9,
      "evidence": "前排全是 Reddit，缺工具页",
      "business_value": "high",
      "recommended_mvp": "上传截图→增强→导出"
    }
  ],
  "patterns": [
    "free + [功能] + tool（score: 70-80）",
    "best + [AI] + [功能] + [行业]"
  ],
  "next_actions": [
    "深挖特定领域：seed=flux rounds=3",
    "深挖游戏解题类：seed=solver rounds=3"
  ]
}
```

---

### B. API Key 生成脚本

```bash
# 生成随机 API Key（32 字符）
openssl rand -hex 16

# 生成 bcrypt 哈希（用于存储）
node -e "console.log(require('bcryptjs').hashSync('your_api_key', 10))"
```

---

### C. 常用数据库查询

```sql
-- 查询高分关键词
SELECT * FROM keyword_latest
WHERE score >= 80 AND difficulty = 'low'
ORDER BY score DESC
LIMIT 20;

-- 查询近 7 天新增关键词
SELECT * FROM keywords
WHERE first_seen_at >= NOW() - INTERVAL '7 days'
ORDER BY first_seen_at DESC;

-- 查询任务成功率
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM mining_runs
GROUP BY status;

-- 查询关键词趋势
SELECT 
  DATE(created_at) as date,
  COUNT(*) as count
FROM keywords
WHERE first_seen_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date;
```

---

### D. 技术支持

**文档更新**: 2026-02-01  
**负责人**: Harvey Zhang  
**联系方式**: harvey@example.com  

---

**结束**

✅ 本 PRD 文档已包含所有开发所需信息，可立即执行。
