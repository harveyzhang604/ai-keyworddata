# AI 关键词挖掘分析系统 - 需求文档

## 1. 项目概述

### 1.1 项目背景
- 多台服务器持续运行 AI 应用，自动挖掘可开发的 AI 工具关键词
- 服务器将挖掘到的关键词数据自动上传到统一数据库（Neon PostgreSQL）
- 需要一个 Next.js 前端网站从数据库读取数据，进行可视化展示和分析

### 1.2 核心目标
开发一个**最小化**的关键词分析看板系统，用于：
- 实时展示服务器挖掘的关键词数据
- 提供简单的搜索、筛选、归类功能
- 帮助决策哪些关键词值得立即开发成 AI 工具

### 1.3 技术栈
- **前端框架**: Next.js 16 + React 19 + TypeScript
- **数据库**: Neon PostgreSQL
- **UI 组件**: Radix UI + Tailwind CSS
- **数据查询**: Drizzle ORM
- **认证系统**: Better Auth（已有）
- **部署**: Vercel / Cloudflare Pages

---

## 2. 核心功能需求

### 2.1 数据采集端（服务器侧）

#### 2.1.1 数据上传 API
**路径**: `/api/ingest/*`

需要实现 3 个接口：
1. **创建挖掘任务**
   - `POST /api/ingest/runs`
   - 参数：`miner_id`, `seed`, `rounds`, `meta_json`
   - 返回：`run_id`

2. **批量上传关键词**
   - `POST /api/ingest/keywords/batch`
   - 参数：关键词数组（包含 keyword, score, difficulty, intent 等）
   - 支持批量插入（100-1000条/次）
   - 自动去重（基于 `keyword_norm`）

3. **上传分析报告**
   - `POST /api/ingest/reports`
   - 参数：`run_id`, `report_markdown`, `report_json`

#### 2.1.2 鉴权机制
- 每台服务器配置唯一 API Key
- 请求头携带：`Authorization: Bearer <api_key>`
- 支持幂等性：同一 `external_id` 不会重复插入

---

### 2.2 前端展示系统（核心功能）

#### 2.2.1 首页 Dashboard
**路径**: `/` 或 `/dashboard`

**核心指标卡片**（4个）：
- 关键词总数（Total Keywords）
- 近 7 天新增（New This Week）
- 绿灯词数量（Green Lights）
- 正在运行的任务（Active Runs）

**数据可视化**：
- 热度 vs 竞争度分布图（散点图）
- Top 10 高分关键词列表
- 近 30 天挖掘趋势（折线图）

#### 2.2.2 关键词列表页
**路径**: `/keywords`

**表格列**：
| 关键词 | 得分 | 难度 | 意图 | 词长 | vs GPT 热度 | 更新时间 | 操作 |
|--------|------|------|------|------|------------|----------|------|

**筛选功能**（左侧侧边栏或顶部筛选条）：
- 得分范围：`0-100` 滑块
- 难度：`unknown / low / medium / high`（多选）
- 意图：`calculate / convert / generate / analyze` 等（多选）
- 词长：`2-5 词 / 6-9 词 / 10+ 词`
- 时间范围：最近 7 天 / 30 天 / 全部
- 来源：`reddit / serp / gpt_trend`（多选）
- 绿灯词：仅显示绿灯词（Boolean）

**搜索框**：
- 支持模糊搜索关键词
- 实时过滤结果

**排序**：
- 按得分、更新时间、词长排序

**操作按钮**：
- 查看详情（进入关键词详情页）
- 标记为"已开发" / "待开发" / "放弃"

#### 2.2.3 关键词详情页
**路径**: `/keywords/[id]`

**展示内容**：
1. **基本信息**
   - 关键词
   - 语言 / 国家
   - 类别（calculator / converter / shopify 等）
   - 首次发现时间 / 最后更新时间

2. **最新指标**（从 `keyword_observations` 取最新一条）
   - 得分（score）
   - 搜索量（search_volume）
   - 难度（difficulty）
   - 意图（intent）
   - vs GPT 热度（vs_gpt_heat）
   - 痛点标记（pain_point_flag）

3. **历史趋势**
   - 得分变化曲线（折线图）
   - 数据来源标签

4. **AI 建议**（从 `keyword_notes` 表读取）
   - 开发建议（dev_suggestion）
   - 商业价值（business_value）
   - 风险分析（risk）
   - AI 摘要（ai_summary）

5. **操作区**
   - 添加备注（手动输入）
   - 导出数据（JSON / CSV）
   - 分享链接

#### 2.2.4 挖掘任务列表页
**路径**: `/runs`

**表格列**：
| 任务 ID | 服务器 | 种子 | 轮次 | 状态 | 关键词数 | 开始时间 | 结束时间 | 操作 |
|---------|--------|------|------|------|----------|----------|----------|------|

**筛选**：
- 状态：`running / success / failed`
- 服务器名称

**操作**：
- 查看报告（跳转到报告详情页）

#### 2.2.5 分析报告页
**路径**: `/reports` 或 `/reports/[id]`

**展示内容**：
- 报告标题（例如："测试挖掘到 1446 个关键词"）
- 关键词总数
- 时间范围
- 数据来源

**核心内容**（统一格式）：
1. **TOP 机会**（表格）
   - rank, keyword, score, difficulty, intent, build_suggestion

2. **绿灯词**（高优先级表格）
   - keyword, word_count, evidence, business_value, recommended_mvp

3. **模式洞察**（列表）
   - 高分关键词常见结构（例如：`free + [功能] + tool`）

4. **下一步动作**（操作建议）
   - 深挖建议（例如：`seed=flux rounds=3`）

**格式**：
- Markdown 渲染
- JSON 结构化数据（支持导出）

---

## 3. 数据库设计（PostgreSQL）

### 3.1 设计概览

我们需要以下 6 个核心表：
1. **mining_servers** - 存储服务器信息（每台服务器运行数据挖掘任务）
2. **mining_runs** - 存储每次数据挖掘任务的信息
3. **keywords** - 存储所有关键词的基本信息
4. **keyword_observations** - 存储每次对关键词的观察结果
5. **keyword_reports** - 存储 AI 生成的报告
6. **keyword_notes** - 存储对关键词的手动或 AI 附加注释

---

### 3.2 详细表结构

#### 3.2.1 `mining_servers` - 服务器信息

**用途**：记录每台服务器的信息，方便任务追踪和统计。

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

**注意**：`api_key_hash` 用于验证任务来源，确保每个任务有一个唯一标识。

---

#### 3.2.2 `mining_runs` - 数据挖掘任务

**用途**：每次挖掘任务的记录，包括任务的种子、状态、时间等信息。

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

-- 索引优化
CREATE INDEX idx_runs_miner_id ON mining_runs(miner_id);
CREATE INDEX idx_runs_status ON mining_runs(status);
CREATE INDEX idx_runs_started_at ON mining_runs(started_at DESC);
```

**注意**：`meta_json` 字段用来存储与任务相关的其他元数据，例如任务配置或版本信息。

---

#### 3.2.3 `keywords` - 关键词主表

**用途**：存储所有被挖掘出来的关键词信息，包括标准化后的关键词，确保数据的唯一性。

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

-- 索引优化
CREATE INDEX idx_keywords_norm ON keywords(keyword_norm);
CREATE INDEX idx_keywords_category ON keywords(category);
CREATE INDEX idx_keywords_language ON keywords(language);
CREATE INDEX idx_keywords_last_seen ON keywords(last_seen_at DESC);
```

**注意**：`keyword_norm` 用于去重（例如所有的 "Calculator" 会转成小写的 "calculator"）。

---

#### 3.2.4 `keyword_observations` - 关键词观察结果

**用途**：每次挖掘任务对关键词的观察结果，包括关键词的得分、搜索量、竞争度、用户意图等。

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

-- 索引优化（性能关键）
CREATE INDEX idx_observations_keyword_id ON keyword_observations(keyword_id);
CREATE INDEX idx_observations_run_id ON keyword_observations(run_id);
CREATE INDEX idx_observations_score ON keyword_observations(score DESC);
CREATE INDEX idx_observations_difficulty ON keyword_observations(difficulty);
CREATE INDEX idx_keyword_observations ON keyword_observations(keyword_id, run_id);
```

**注意**：`raw_json` 用于存储原始数据，方便回溯。

---

#### 3.2.5 `keyword_reports` - 关键词报告

**用途**：存储每次挖掘任务结束后生成的 AI 报告，包括结构化数据和 Markdown 格式的详细报告。

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

-- 索引优化
CREATE INDEX idx_keyword_reports_run_id ON keyword_reports(run_id);
CREATE INDEX idx_reports_created_at ON keyword_reports(created_at DESC);
```

**注意**：`report_json` 保存结构化的报告内容，可以用于后续分析或显示。

---

#### 3.2.6 `keyword_notes` - 关键词备注

**用途**：为每个关键词添加注释或总结，包含 AI 生成的摘要、开发建议、商业价值等。

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

-- 索引优化
CREATE INDEX idx_keyword_notes_keyword_id ON keyword_notes(keyword_id);
CREATE INDEX idx_notes_type ON keyword_notes(type);
```

**注意**：`type` 字段表示备注的类型，可以包括 AI 总结、开发建议、商业价值、风险分析等。

---

### 3.3 性能优化策略

#### 3.3.1 索引总结

所有关键索引已在上述表结构中定义，核心索引包括：

```sql
-- 关键词表索引（快速去重和查找）
CREATE INDEX idx_keywords_norm ON keywords(keyword_norm);
CREATE INDEX idx_keywords_category ON keywords(category);

-- 关键词观察表联合索引（快速查询某个关键词在不同任务中的变化）
CREATE INDEX idx_keyword_observations ON keyword_observations(keyword_id, run_id);

-- 报告和备注表索引（确保查询效率）
CREATE INDEX idx_keyword_reports_run_id ON keyword_reports(run_id);
CREATE INDEX idx_keyword_notes_keyword_id ON keyword_notes(keyword_id);
```

#### 3.3.2 物化视图（推荐）

创建 `keyword_latest` 物化视图，缓存每个关键词的最新指标：

```sql
CREATE MATERIALIZED VIEW keyword_latest AS
SELECT DISTINCT ON (k.id)
    k.id AS keyword_id,
    k.keyword,
    k.keyword_norm,
    k.category,
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

-- 刷新物化视图（可以设置定时任务）
REFRESH MATERIALIZED VIEW keyword_latest;
```

#### 3.3.3 数据一致性与更新策略

1. **幂等性保证**：
   - 通过 `keyword_norm` 字段确保插入的关键词是唯一的
   - 使用 `ON CONFLICT` 处理重复插入

2. **批量插入优化**：
   - 使用 Drizzle ORM 的 `batchInsert`
   - 单次批量插入建议 100-1000 条

3. **级联删除**：
   - 删除服务器时自动删除相关任务
   - 删除任务时自动删除相关观察数据和报告

```sql
-- 添加级联删除约束
ALTER TABLE mining_runs 
ADD CONSTRAINT fk_miner_cascade 
FOREIGN KEY (miner_id) REFERENCES mining_servers(id) 
ON DELETE CASCADE;

ALTER TABLE keyword_observations 
ADD CONSTRAINT fk_keyword_cascade 
FOREIGN KEY (keyword_id) REFERENCES keywords(id) 
ON DELETE CASCADE;
```

#### 3.3.4 分区表（可选，大数据量时）

当 `keyword_observations` 数据量超过 1000 万条时，建议按时间分区：

```sql
-- 创建分区表（PostgreSQL 10+）
CREATE TABLE keyword_observations (
    id SERIAL,
    keyword_id INT,
    run_id INT,
    score DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT NOW(),
    -- ... 其他字段
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 创建月度分区
CREATE TABLE keyword_observations_2026_01 
PARTITION OF keyword_observations 
FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE keyword_observations_2026_02 
PARTITION OF keyword_observations 
FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

---

### 3.4 数据库初始化脚本

完整的建表脚本（可直接在 Neon 控制台执行）：

```sql
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
CREATE INDEX idx_keywords_norm ON keywords(keyword_norm);
CREATE INDEX idx_keywords_category ON keywords(category);
CREATE INDEX idx_observations_keyword_id ON keyword_observations(keyword_id);
CREATE INDEX idx_observations_run_id ON keyword_observations(run_id);
CREATE INDEX idx_observations_score ON keyword_observations(score DESC);
CREATE INDEX idx_keyword_observations ON keyword_observations(keyword_id, run_id);
CREATE INDEX idx_keyword_reports_run_id ON keyword_reports(run_id);
CREATE INDEX idx_keyword_notes_keyword_id ON keyword_notes(keyword_id);
```

---

## 4. 统一报告格式

### 4.1 Markdown 模板
```markdown
# 挖掘报告：{run_name}
- 关键词总数：{total_keywords}
- 时间范围：{start_at} ~ {end_at}
- 种子/轮次：seed={seed}, rounds={rounds}
- 数据来源：{sources}

## 1. TOP 机会（建议优先做）
| rank | keyword | score | difficulty | intent | why_now | build_suggestion |
|---:|---|---:|---|---|---|---|

## 2. 绿灯词（可直接 BUILD NOW）
| keyword | word_count | evidence | business_value | recommended_mvp |
|---|---:|---|---|---|

## 3. 模式洞察（Patterns）
- Pattern A: ...
- Pattern B: ...

## 4. 下一步动作（Next Actions）
1) ...
2) ...
```

### 4.2 JSON 结构
```json
{
  "run_id": "uuid",
  "summary": {
    "total_keywords": 1446,
    "sources": ["serp", "reddit", "gpt_trend"]
  },
  "top_opportunities": [
    {
      "rank": 1,
      "keyword": "calculator online",
      "score": 80.8,
      "difficulty": "unknown",
      "intent": ["calculate", "convert"],
      "why_now": "vs GPT 热度高",
      "build_suggestion": "做极简在线计算器 + SEO 词簇"
    }
  ],
  "green_lights": [
    {
      "keyword": "how to fix blurry text in screenshot online free",
      "word_count": 9,
      "evidence": "前排全是 Reddit，缺工具页",
      "business_value": "high",
      "recommended_mvp": "上传截图→自动增强文字清晰度→导出"
    }
  ],
  "patterns": [
    "free + [function] + tool",
    "online + free + converter/generator"
  ],
  "next_actions": [
    "seed=flux rounds=3 深挖",
    "seed=solver rounds=3 深挖"
  ]
}
```

---

## 5. 开发优先级

### Phase 1: MVP（核心功能）
- [ ] 数据库建表（Neon PostgreSQL）
- [ ] 数据采集 API（3 个接口）
- [ ] 首页 Dashboard（核心指标 + Top 10）
- [ ] 关键词列表页（表格 + 基础筛选）
- [ ] 关键词详情页（基本信息 + 最新指标）

### Phase 2: 增强功能
- [ ] 高级筛选（多维度组合）
- [ ] 历史趋势图（Recharts）
- [ ] 分析报告页（Markdown 渲染）
- [ ] 挖掘任务列表

### Phase 3: 智能分析
- [ ] AI 自动打标签（B2B / pSEO / 痛点）
- [ ] 批量导出（CSV / JSON）
- [ ] 关键词对比功能
- [ ] 用户备注系统

---

## 6. 非功能需求

### 6.1 性能要求
- 首页加载时间 < 2s
- 关键词列表分页（50 条/页）
- API 响应时间 < 500ms

### 6.2 安全要求
- API Key 鉴权（服务器端）
- 用户登录（Better Auth 已有）
- 数据传输 HTTPS

### 6.3 兼容性
- 桌面端优先（Chrome / Edge / Safari）
- 移动端响应式布局（可选）

---

## 7. 示例数据整理（统一格式）

### 7.1 TOP 5 推荐关键词
| rank | keyword | heat | difficulty | build_suggestion |
|---:|---|---|---|---|
| 1 | Flux 2 Klein Generator | Breakout | 低 | 对接 Replicate API，做极简生成器截流 |
| 2 | Star Rupture Planner | 中高 | 低 | 开源改版 + AI 增强（模板/推荐/自动规划） |
| 3 | Concrete Calculator 矩阵 | 稳定 | 低 | 批量建站 + SEO 词簇霸屏（多类型计算器页） |
| 4 | Claude for Life Science | 高 | 低 | RAG + 医学/生命科学知识库 + 场景问答 |
| 5 | Minesweeper Solver | Breakout | 低 | OCR + 算法求解（上传截图→输出解法） |

### 7.2 绿灯词（BUILD NOW）
| keyword | word_count | core_insight | business_value |
|---|---:|---|---|
| how to fix blurry text in screenshot online free | 9 | 用户想"一键清晰"截图文字；大厂工具复杂，SERP 前排偏 Reddit 内容 | 高：流量大、缺专用工具页 |
| bulk shopify app review analyzer for competitor research | 9 | Shopify 卖家想批量分析竞品 App 差评做对标；现有方案昂贵 | 极高：精准 B2B 寄生型 SaaS |

### 7.3 关键词模式洞察
高分关键词常见结构：
- `free + [功能] + tool`（score: 70-80）
- `best + [AI] + [功能] + [行业]`
- `online + free + converter/generator`

### 7.4 下一步行动建议
1. 深挖特定领域：`python3 demand_miner_v25.py --seed flux --rounds 3`
2. 深挖游戏解题类：`python3 demand_miner_v25.py --seed solver --rounds 3`

**核心策略**：小词 + 低竞争 + AI 增强 = 快速拿排名

---

## 8. 技术实现要点

### 8.1 数据去重机制
- `keyword_norm` = 小写 + 去多余空格
- 唯一索引：`(keyword_norm, language, country)`

### 8.2 幂等性保证
- 每条 `observation` 带 `external_id`（= `miner_id + run_id + keyword_norm` 的 hash）
- 数据库唯一索引约束

### 8.3 批量插入优化
- 使用 Drizzle ORM 的 `batchInsert`
- 单次最多 1000 条

### 8.4 前端状态管理
- React Context（全局筛选状态）
- URL Query Params（分享筛选结果）

---

## 9. 部署方案

### 9.1 推荐架构
- **前端**: Vercel（Next.js）
- **数据库**: Neon PostgreSQL
- **采集端**: 服务器上的 Python/Node 脚本

### 9.2 环境变量
```env
# 数据库
DATABASE_URL=postgresql://neondb_owner:xxx@ep-xxx.neon.tech/neondb
DATABASE_PROVIDER=postgresql

# API 鉴权
API_KEY_SERVER_1=<随机生成>
API_KEY_SERVER_2=<随机生成>

# 应用配置
NEXT_PUBLIC_APP_NAME=AI 关键词分析系统
NEXT_PUBLIC_APP_URL=https://keywords.yourdomain.com
```

---

## 10. 后续扩展方向（可选）

- **智能推荐**：基于历史数据，预测下一个爆款关键词
- **竞品监控**：自动抓取 SERP 前 10 名
- **GPTs 对比**：实时获取 GPTs 搜索量
- **通知系统**：发现绿灯词时自动邮件/Slack 通知
- **协作功能**：团队成员标记、评论关键词

---

## 11. 开发时间估算（1 人）

| 阶段 | 功能 | 预计时间 |
|------|------|----------|
| Phase 1 | 数据库 + API + Dashboard | 3-5 天 |
| Phase 2 | 列表页 + 详情页 | 3-4 天 |
| Phase 3 | 报告页 + 高级筛选 | 2-3 天 |
| 测试 & 优化 | 性能优化 + Bug 修复 | 2-3 天 |
| **总计** | | **10-15 天** |

---

## 12. 成功标准

✅ **MVP 完成标志**：
1. 服务器能成功上传关键词到数据库
2. 前端能展示关键词列表和详情
3. 能筛选出高分关键词（score > 70）
4. 报告页能渲染 Markdown 格式

✅ **性能指标**：
- 支持 10 万+ 关键词
- 列表页加载 < 2s
- API 响应 < 500ms

✅ **用户体验**：
- 界面简洁美观
- 筛选逻辑清晰
- 支持导出数据

---

**文档版本**: v1.0  
**最后更新**: 2026-02-01  
**作者**: AI Assistant  
**状态**: ✅ 待开发
