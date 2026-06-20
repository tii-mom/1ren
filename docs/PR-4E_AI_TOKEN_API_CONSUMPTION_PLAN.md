# PR-4E: 真实 AI API 消耗与 AI Token 扣费闭环设计

本设计文档旨在为 1人算力公司 (1ren) 引入真实的 AI API 消费与 AI Token 扣费闭环机制，打破 AI Token 仅作为账面数字的局限，提供真实可信的 AI 模型调用及账本流水。

---

## 1. 背景

当前项目已经完成云算力实例市场、我的公司驾驶舱、设备模板、Admin 后台配置、全局产出倍率、设备上下架与审计日志等核心功能。
用户在平台上能够体验到：
* 浏览云算力实例的参考硬件规格；
* 支付模拟 USDT 租用云算力实例；
* 获得每日产出的 AI Token；
* 在“我的公司”驾驶舱中查看资产变化与设备并网运行状态；
* 在 Admin 后台动态调整全局倍率、修改设备参数等。

然而，目前产出的 AI Token 还主要停留在界面展示阶段，缺乏真实的消耗场景。为了建立完整的产品闭环并提高项目可信度，下一阶段的目标是使 AI Token 具备真实的消耗场景——用户通过租赁云算力实例产出的 AI Token，可以真实用于平台内提供的 AI API 调用，并伴随有清晰、安全的预扣与结算流水。

---

## 2. 产品目标

PR-4E 主要解决以下核心问题：
1. **真实消耗场景**：AI Token 不仅仅是展示数字，而是可在平台内进行实质性消耗；
2. **真实模型调用**：用户能扣除 AI Token 并调用真实的外部 AI 模型能力（如文本分析、对话等）；
3. **成本预估机制**：每次 API 调用前，基于输入 Prompt 长度及模型定价进行最坏情况的成本（Token）预估；
4. **实际消耗结算**：模型调用成功返回后，根据真实的 usage token数额结算实际扣除的 AI Token；
5. **异常与失败处理**：调用超时或失败时自动退回预扣除的 AI Token，保证用户资产安全；
6. **详尽记录 (Usage Record)**：每次 AI 调用都产生一条 usage 记录，方便查询与审计；
7. **账本流水 (Ledger Log)**：每次余额发生变化都必须写入 Token 账本，确保每一笔收支“有据可查”；
8. **灵活价格配置**：管理员后续能够通过后台或配置表调整不同模型的价格和兑换汇率；
9. **合规防线**：坚决不引入“真实硬件托管”、“投资回报”、“年化收益”、“保本回本”等任何敏感和违规的金融表达。

---

## 3. 本阶段不做什么 (Non-Goals)

为了保持项目交付的聚焦性与敏捷度，PR-4E **明确排除**以下内容：
* **不继续修改云算力实例市场 UI**；
* **不继续修改 MyCompany 驾驶舱 UI**（除保留 PR-4E-3 规定的极简测试面板外）；
* **不继续修改 AdminPanel UI**；
* **不接入真实充值/支付系统**；
* **不接入链上钱包或智能合约**；
* **不支持提现功能**；
* **不做出任何投资回报率 (ROI) 或收益承诺**；
* **不做复杂的多模型智能路由或负载均衡**；
* **不做面向 C 端用户的完整聊天对话产品**（如多轮会话管理、历史记录侧边栏等）；
* **不做 AI 生图 (Text-to-Image) 或多模态生成功能**；
* **不做 Agent 智能体市场或分发平台**；
* **不做订阅制会员系统 (Subscription)**；
* **不做复杂的多管理员 RBAC 权限控制**。

---

## 4. 最小可验证闭环

后续 PR-4E 实现时，将依照如下最小闭环进行逻辑串联：

1. **输入内容**：用户输入一段内容并选择模型。
2. **校验校验**：后端校验登录态和 AI Token 余额。
3. **估算成本**：后端根据输入粗略估算最大 token 消耗，计算预扣除 AI Token。
4. **预扣冻结**：写入 usage record 并锁定或扣除预扣 AI Token，写入 ledger。
5. **调用模型**：调用真实外部模型 API（如 DeepSeek-V3）。
6. **实际结算**：读取真实 usage (input/output tokens) 进行多退少补结算。
7. **返回结果**：返回 AI 回复、实际消耗以及更新后的余额。

### 首个建议接口
* **路径**：`POST /api/ai/chat`
* **请求示例**：
  ```json
  {
    "message": "请帮我分析这个网站的商业价值",
    "model": "deepseek-chat"
  }
  ```
* **返回示例**：
  ```json
  {
    "reply": "这里是 AI 返回的分析内容...",
    "usage": {
      "provider": "deepseek",
      "model": "deepseek-chat",
      "inputTokens": 123,
      "outputTokens": 456,
      "totalTokens": 579,
      "estimatedAiTokenCost": 1000,
      "actualAiTokenCost": 980
    },
    "balance": {
      "before": 100000,
      "after": 99020
    }
  }
  ```

---

## 5. 数据库设计

为支持模型管理、调用链路审计与财务对账，本阶段规划三张数据库表（在本轮 PR-4E 中只做设计，不要求立刻创建 migration 文件）：

### 5.1 `ai_model_configs`
用途：配置不同模型的价格和状态。

```sql
CREATE TABLE IF NOT EXISTS ai_model_configs (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    display_name TEXT NOT NULL,
    input_token_price_usd_per_1m REAL NOT NULL,
    output_token_price_usd_per_1m REAL NOT NULL,
    ai_token_exchange_rate REAL NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

说明：
* `provider` 示例：`deepseek`, `openai`, `anthropic`
* `model` 示例：`deepseek-chat`
* `input_token_price_usd_per_1m` 表示每 100 万 input token 的美元价格
* `output_token_price_usd_per_1m` 表示每 100 万 output token 的美元价格
* `ai_token_exchange_rate` 表示 1 USD 对应多少平台 AI Token
* `is_active` 控制模型是否可用

### 5.2 `ai_usage_records`
用途：记录每次 AI API 调用。

```sql
CREATE TABLE IF NOT EXISTS ai_usage_records (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    request_type TEXT NOT NULL,
    prompt_preview TEXT,
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    estimated_ai_token_cost INTEGER NOT NULL DEFAULT 0,
    actual_ai_token_cost INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    error_message TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

`status` 建议枚举：
* `PENDING`
* `PRE_DEDUCTED`
* `SUCCEEDED`
* `FAILED`
* `REFUNDED`
* `NEEDS_REVIEW`

### 5.3 `ai_token_ledger`
如果当前项目已有可复用的 token ledger，可以复用；如果现有 ledger 不适合 AI Token 消耗，则新增。以下是建议的新增表字段规划：

```sql
CREATE TABLE IF NOT EXISTS ai_token_ledger (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    direction TEXT NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    ref_type TEXT NOT NULL,
    ref_id TEXT NOT NULL,
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    created_at TEXT NOT NULL
);
```

`direction` 建议枚举：
* `credit`
* `debit`
* `refund`
* `adjustment`

`reason` 示例：
* `AI_CHAT_PRE_DEDUCT`
* `AI_CHAT_FINAL_SETTLE`
* `AI_CHAT_REFUND`
* `ADMIN_ADJUSTMENT`
* `DEVICE_DAILY_YIELD`

---

## 6. 扣费流程设计

请明确后续实现应采用安全扣费流程：
1. **用户发起 AI 请求**：传入 message 和 model。
2. **后端读取 session / user**：从 header 中验证会话。
3. **校验用户是否登录**：未登录返回 401。
4. **校验模型是否存在且 active**：查询 `ai_model_configs`，非 active 则返回 400。
5. **估算最大 token 消耗**：根据 prompt 粗略估算最大 token 消耗量（例如输入字数 * 2 + 1000 作为预估）。
6. **计算预估 AI Token cost**：根据模型费率、1 USD 兑换 AI Token 汇率计算得到预估的 AI Token 预扣额。
7. **检查用户 AI Token 余额是否足够**：查询 `asset_accounts` 余额，不足时返回 402。
8. **写入 ai_usage_records**：添加新纪录，状态为 `PENDING`。
9. **预扣 AI Token，写 ledger**：在事务中扣减余额、新增 ledger 流水，并将 usage 记录状态更新为 `PRE_DEDUCTED`。
10. **调用模型 API**：发起真实的第三方服务请求，设定合理超时。
11. **读取真实 usage**：解析响应，获取返回的内容与 `usage` 数据（输入、输出 token 数）。
12. **计算实际 AI Token cost**：根据真实的 token 数量与模型价格及汇率计算。
13. **实际 cost 小于预扣**：退回差额，增加余额，并写入 final settle 退款 ledger。
14. **实际 cost 等于预扣**：无需动账，直接确认。
15. **实际 cost 大于预扣**：
    * 小幅超出（如在 10% 或 500 Token 以内）：可以进行余额补扣，并写入补扣 ledger；
    * 大幅超出：不自动扣减至负数，将 usage 状态标记为 `NEEDS_REVIEW`，留待后续人工处理。
16. **更新记录状态**：将 `ai_usage_records` 状态修改为 `SUCCEEDED`。
17. **返回结果**：返回 AI 回复内容、真实 usage 数据以及用户扣除后的余额。

---

## 7. 失败回滚设计

### 7.1 模型 API 失败
如果模型 API 超时、报错、无响应：
* `ai_usage_records.status` 变更为 `FAILED`；
* 如果已经完成步骤 9 中的预扣，则发起退款事务，还原可用余额，写入一条 `direction = credit` 且 `reason = AI_CHAT_REFUND` 的账本流水；
* 流水状态最终更新为 `REFUNDED`；
* 返回标准化错误信息，不重复扣费。

### 7.2 usage 缺失
如果模型返回成功但没有 usage 字段：
* 优先按照保守的估算法进行结算（例如按输出字数的一定比例估算，或者直接结算为预扣额的 80%）；
* 或者将该笔调用状态标记为 `NEEDS_REVIEW`，同时在错误信息中进行备注；
* 不能静默丢失流水，必须回填 `ai_usage_records.error_message`。

### 7.3 ledger 写入失败
如果步骤 9 的预扣 ledger 或扣除账户余额事务写入失败：
* **禁止**调用任何真实的外部 AI 模型 API；
* 立即中断请求，向用户返回系统错误，避免“白嫖”或漏扣账目。

### 7.4 模型成功但最终结算失败
如果模型成功返回，但最终 final settle 结算事务写入失败（如数据库临时断联）：
* 将 `ai_usage_records.status` 标记为 `NEEDS_REVIEW`；
* 内存中保留第三方模型响应与预扣记录，不重复向用户扣费，也不重新调用模型；
* 发送系统警告，留待管理员后续人工修复。

---

## 8. API 设计

### 8.1 POST /api/ai/chat
* **请求**：
  ```json
  {
    "message": "请帮我分析这个网站的商业价值",
    "model": "deepseek-chat"
  }
  ```
* **响应成功**：
  ```json
  {
    "reply": "这里是 AI 返回的分析内容...",
    "usage": {
      "provider": "deepseek",
      "model": "deepseek-chat",
      "inputTokens": 123,
      "outputTokens": 456,
      "totalTokens": 579,
      "estimatedAiTokenCost": 1000,
      "actualAiTokenCost": 980
    },
    "balance": {
      "before": 100000,
      "after": 99020
    }
  }
  ```
* **响应失败**：
  * **余额不足**：
    ```json
    {
      "error": "INSUFFICIENT_AI_TOKEN_BALANCE",
      "message": "AI Token 余额不足",
      "required": 1000,
      "available": 500
    }
    ```
  * **模型不可用**：
    ```json
    {
      "error": "MODEL_NOT_AVAILABLE",
      "message": "当前模型不可用"
    }
    ```
  * **模型调用失败**：
    ```json
    {
      "error": "MODEL_API_FAILED",
      "message": "AI 模型调用失败，未扣费或已退回"
    }
    ```

---

## 9. 环境变量规划

后续实现需要规划以下环境变量：
```ini
DEEPSEEK_API_KEY=sk-xxxxxx  # 第三方模型调用密钥
DEFAULT_AI_MODEL=deepseek-chat # 默认模型代号
AI_TOKEN_USD_RATE=100000 # 1 美元等值 AI Token 额度
AI_API_TIMEOUT_MS=30000 # 模型请求超时截断
```

要求：
* **不提交真实密钥**，`.dev.vars.example` 中只能放示例占位符；
* 本地开发通过在根目录创建 `.dev.vars` 写入环境变量配置；
* 生产环境通过 Cloudflare Worker Secrets 配置，确保资产绝对安全。

---

## 10. 安全与合规边界

为了保持产品的合规性和法律安全性，PR-4E 必须继续保持当前产品边界：

* **允许表达**：
  * AI Token 可用于平台内 AI API 消耗；
  * AI Token 是平台内使用额度；
  * 云算力实例会产生 AI Token 额度；
  * AI Token 可用于调用模型、生成报告、分析网页。
* **禁止表达**：
  * ❌ 投资收益；
  * ❌ 年化收益；
  * ❌ 回本周期；
  * ❌ 保本；
  * ❌ 托管真实硬件；
  * ❌ 购买真实显卡；
  * ❌ 出售实体设备；
  * ❌ 平台代用户挖矿；
  * ❌ AI Token 可直接兑换现金；
  * ❌ 稳定盈利；
  * ❌ 无风险收益。

---

## 11. 前端最小入口规划

后续在 PR-4E-3 实现时，可以增加一个极简的测试入口，不要做复杂聊天产品：
* **建议位置**：
  * `MyCompany` 驾驶舱中增加一个小卡片：“AI Token 消耗测试”；
  * 或新增单独的测试路由页 `/ai-lab`。
* **功能规划**：
  * 输入 prompt；
  * 选择模型；
  * 显示预计消耗；
  * 点击发送；
  * 展示 AI 回复；
  * 展示本次消耗详情（Estimated vs Actual）；
  * 展示剩余 AI Token 余额；
  * 展示 `usage_record_id`。

> [!IMPORTANT]
> **本轮 PR-4E-1 中不要实现任何前端 UI 逻辑。**

---

## 12. PR 拆分建议

为了便于代码审查与敏捷迭代，PR-4E 将按如下步骤拆分：

### PR-4E-1：设计与数据库准备 (当前 PR)
* **范围**：
  * 引入本设计文档 `docs/PR-4E_AI_TOKEN_API_CONSUMPTION_PLAN.md`；
  * 新增 D1 数据库 Migration 文件，创建 `ai_model_configs`，`ai_usage_records`，`ai_token_ledger`（或 ledger_entries 升级）；
  * 提供 `seed_ai_models` 初始脚本，自动向 `ai_model_configs` 写入 `deepseek-chat` 默认费率；
  * 补充 TypeScript 类型声明定义；
  * 不修改任何运行时路由或前端页面，不改变主流程。

### PR-4E-2：真实 DeepSeek 调用闭环
* **范围**：
  * 新增核心 API `POST /api/ai/chat`；
  * 接入 DeepSeek SDK / 原生 fetch API 并配置合理的超时；
  * 实现完整的预扣款、实际结算（多退少补）以及失败回滚的事务链条；
  * 写入 usage 审计记录和 token ledger 流水；
  * 编写单元测试覆盖各种扣费分支与异常错误回滚。

### PR-4E-3：前端 AI Token 消耗测试面板
* **范围**：
  * 增加极简的测试控制面板 UI；
  * 实现在页面输入 prompt、调用接口并渲染 AI 回答与本次 Token 扣减、最新余额。

---

## 13. PR-4E-1 验收标准

PR-4E-1 必须满足：
* 文档完整、规范；
* 数据库迁移结构与配置规划清晰；
* 不修改任何运行时代码逻辑，不影响现有机房 / MyCompany / AdminPanel；
* 绝不引入真实的收益、年化或保本表达。

---

## 14. PR-4E-2 验收标准

后续真实实现时必须满足：
* 未登录用户拦截 (401)；
* 余额不足拦截并返回 402；
* 模型未配置或下架拦截 (400)；
* 正常请求可返回 AI 复文并完成扣除；
* API 失败时保证已扣余额 100% 退回且流水为 REFUNDED；
* 每次动账均能查到 ledger 与 usage 审计；
* ledger 写入失败决不触发 API 调用。
