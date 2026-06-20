# 最小后端 API 契约 V1 (Minimal API Contract V1)

本设计定义了 1人算力公司的前后端接口规范。所有数据传输默认采用 `application/json` 格式，并通过 Authorization 头附带 `Bearer <session_token>` 进行用户会话鉴权。

---

## 1. 用户会话管理 (User Session)

### 1.1 创建会话 (Create Session)
- **路径**：`POST /api/session/create`
- **说明**：系统初始化或首次访问时调用，支持匿名会话及 TG 握手。
- **请求体**：
  ```json
  {
    "tgInitData": "query_id=xxxx&user=xxxx&hash=xxxx", // 可选，Telegram 启动参数
    "referrerCode": "CUBE888" // 可选，推荐码
  }
  ```
- **响应 (200 OK)**：
  ```json
  {
    "sessionToken": "s_tok_8f93a1d9c22e...",
    "user": {
      "id": "usr-1002",
      "tgId": 89234123, // 若有
      "inviteCode": "CUBE654",
      "referrerId": "usr-1001",
      "createdAt": "2026-06-20T12:00:00Z"
    }
  }
  ```

### 1.2 获取当前用户信息 (Get Current User)
- **路径**：`GET /api/me`
- **响应 (200 OK)**：
  ```json
  {
    "id": "usr-1002",
    "tgId": 89234123,
    "inviteCode": "CUBE654",
    "referrerName": "初始推荐节点",
    "createdAt": "2026-06-20T12:00:00Z"
  }
  ```

---

## 2. 资产账户管理 (Assets & Ledger)

### 2.1 获取资产余额 (Get Asset Balances)
- **路径**：`GET /api/assets`
- **响应 (200 OK)**：
  ```json
  {
    "usdt": 500.00,
    "r1": 150.00,
    "aiToken": 32.54,
    "shards": 0.00, // 待结算碎片
    "coolantCount": 1,
    "hashCrystals": 0,
    "baseHashpower": 50.00,
    "teamHashpower": 0.00,
    "level": "S0 自有设备节点"
  }
  ```

### 2.2 获取动账流水 (Get Ledger Logs)
- **路径**：`GET /api/ledger`
- **请求参数 (Query)**：`page=1&limit=20`
- **响应 (200 OK)**：
  ```json
  {
    "items": [
      {
        "id": "led-101",
        "timestamp": "2026-06-20T13:00:00Z",
        "assetType": "usdt",
        "amount": -50.00,
        "action": "lease_device",
        "description": "租赁算力设备 DEVICE-1002"
      },
      {
        "id": "led-102",
        "timestamp": "2026-06-20T13:00:00Z",
        "assetType": "r1",
        "amount": 100.00,
        "action": "r1_trade_buy",
        "description": "从交易市场购买 100 R1 权益"
      }
    ],
    "total": 2
  }
  ```

---

## 3. 设备管理 (Devices)

### 3.1 获取已部署设备 (Get Active Devices)
- **路径**：`GET /api/devices`
- **响应 (200 OK)**：
  ```json
  [
    {
      "id": "dev-091a",
      "name": "本地显卡共享算力体验节点",
      "status": "running",
      "dailyYield": 0.012,
      "contractDays": 7,
      "purchasedAt": "2026-06-20T12:05:00Z",
      "expiresAt": "2026-06-20T12:08:00Z",
      "efficiency": 1.0,
      "accumulatedRewards": 0.002,
      "isDemo": true
    }
  ]
  ```

### 3.2 租赁设备 (Lease Device)
- **路径**：`POST /api/devices/lease`
- **请求体**：
  ```json
  {
    "templateId": "gpu-rtx4090"
  }
  ```
- **响应 (200 OK)**：
  ```json
  {
    "success": true,
    "device": {
      "id": "dev-54a2",
      "name": "RTX 4090 算力出租合约",
      "status": "running",
      "purchasedAt": "2026-06-20T14:35:00Z",
      "expiresAt": "2026-07-20T14:35:00Z"
    }
  }
  ```

### 3.3 激活体验矿机 (Claim Demo Miner)
- **路径**：`POST /api/devices/claim-demo`
- **响应 (200 OK)**：
  ```json
  {
    "success": true,
    "device": {
      "id": "dev-demo",
      "name": "本地显卡共享算力体验节点",
      "status": "running",
      "expiresAt": "2026-06-20T14:38:00Z",
      "isDemo": true
    }
  }
  ```

---

## 4. AI Token 资产交互 (AI Token)

### 4.1 出售/回收 AI Token (Sell AI Token)
- **路径**：`POST /api/ai-token/sell`
- **请求体**：
  ```json
  {
    "amount": 500.00
  }
  ```
- **响应 (200 OK)**：
  ```json
  {
    "success": true,
    "usdtCredited": 0.50, // 扣减 500 AI Token 获 0.5U
    "fee": 0.0075,
    "newBalance": 450.00
  }
  ```

### 4.2 消耗 AI Token 打包生成 API/URL (Package API)
- **路径**：`POST /api/ai-token/package-api`
- **请求体**：
  ```json
  {
    "packageId": "api-pack-1"
  }
  ```
- **响应 (200 OK)**：
  ```json
  {
    "success": true,
    "apiKey": "1ren-key-8a9d1c...",
    "url": "https://api.1ren.io/v1/compute/invoke?key=8a9d1c...",
    "crystalBalance": 1
  }
  ```

---

## 5. R1 权益交易管理 (R1 Spot)

### 5.1 获取 R1 交易行情 (Get R1 Market Info)
- **路径**：`GET /api/r1/market`
- **响应 (200 OK)**：
  ```json
  {
    "currentPrice": 0.0512,
    "changePercent24h": 4.12,
    "volume24h": 128943.50
  }
  ```

### 5.2 购买 R1 (Buy R1)
- **路径**：`POST /api/r1/buy`
- **请求体**：
  ```json
  {
    "usdtAmount": 50.00
  }
  ```
- **响应 (200 OK)**：
  ```json
  {
    "success": true,
    "r1Credited": 976.56,
    "newR1Balance": 1126.56,
    "newUsdtBalance": 450.00
  }
  ```

### 5.3 卖出 R1 (Sell R1)
- **路径**：`POST /api/r1/sell`
- **请求体**：
  ```json
  {
    "r1Amount": 500.00
  }
  ```
- **响应 (200 OK)**：
  ```json
  {
    "success": true,
    "usdtCredited": 25.60,
    "newR1Balance": 626.56,
    "newUsdtBalance": 475.60
  }
  ```

---

## 6. 公司 Token 发行中心 (Company Token Center)

### 6.1 获取公司影子 Token 市场列表 (Get Company Tokens)
- **路径**：`GET /api/company-tokens`
- **响应 (200 OK)**：
  ```json
  [
    {
      "id": "tok-92a1",
      "name": "量子算力有限公司",
      "symbol": "QSOL",
      "totalSupply": 10000000,
      "initialPrice": 0.10,
      "targetPool": 5000,
      "raisedUsdt": 4600.00,
      "progress": 92.00,
      "lockedR1": 100,
      "status": "launching",
      "ownerLevel": "S1 共建合伙节点",
      "createdAt": "2026-06-19T10:00:00Z"
    }
  ]
  ```

### 6.2 申请发行公司影子 Token (Issue Token)
- **路径**：`POST /api/company-tokens/issue`
- **请求体**：
  ```json
  {
    "name": "超维矩阵计算",
    "symbol": "HDMC",
    "totalSupply": 2000000,
    "initialPrice": 0.05,
    "targetPool": 3000,
    "description": "基于矩阵设备的大模型调用对冲结算代币。"
  }
  ```
- **响应 (200 OK)**：
  ```json
  {
    "success": true,
    "token": {
      "id": "tok-92b5",
      "symbol": "HDMC",
      "status": "launching",
      "lockedR1": 100
    }
  }
  ```

### 6.3 模拟支持公司 Token (Support Company Token)
- **路径**：`POST /api/company-tokens/:id/support`
- **请求体**：
  ```json
  {
    "usdtAmount": 100.00
  }
  ```
- **响应 (200 OK)**：
  ```json
  {
    "success": true,
    "raisedUsdt": 4700.00,
    "progress": 94.00,
    "newUsdtBalance": 350.00
  }
  ```

### 6.4 申请影子挂牌上市 (List Company Token)
- **路径**：`POST /api/company-tokens/:id/list`
- **响应 (200 OK)**：
  ```json
  {
    "success": true,
    "status": "listed"
  }
  ```

---

## 7. 邀请裂变管理 (Referrals)

### 7.1 获取邀请列表 (Get Referrals)
- **路径**：`GET /api/referrals`
- **响应 (200 OK)**：
  ```json
  {
    "directCount": 1,
    "totalCount": 1,
    "referrals": [
      {
        "id": "usr-1003",
        "name": "算力节点-张强",
        "level": "S3 区域合伙节点",
        "totalHashpower": 320.00,
        "joinedAt": "2026-06-20T12:30:00Z",
        "depth": 1
      }
    ]
  }
  ```

### 7.2 绑定邀请人 (Bind Referrer)
- **路径**：`POST /api/referrals/bind`
- **请求体**：
  ```json
  {
    "referrerCode": "CUBE888"
  }
  ```
- **响应 (200 OK)**：
  ```json
  {
    "success": true,
    "referrerName": "算力节点-张强"
  }
  ```
